'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import { apiFetch, invalidateSessionTokenCache, setSessionTokenCache } from '@/lib/apiFetch';

interface UseGoogleAuthOptions {
  /** Page path for the Google OAuth callback, e.g. '/login' */
  callbackPath: string;
  /** URL param name that signals a Google auth redirect, e.g. 'googleLogin' */
  paramName: string;
  /** Called after a brand-new user is created via Google */
  onNewUser?: () => void;
  /** Called after an existing user logs in via Google */
  onExistingUser?: () => void;
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthCallback: 'No se pudo completar el login con Google. Por favor intentá de nuevo.',
  OAuthSignin: 'Error al iniciar sesión con Google. Por favor intentá de nuevo.',
  OAuthCreateAccount: 'No se pudo crear la cuenta con Google.',
  AccessDenied: 'Acceso denegado. No tenés permiso para iniciar sesión.',
  Configuration: 'Error de configuración del servidor. Contactá soporte.',
  Verification: 'El link de verificación expiró o ya fue usado.',
  CredentialsSignin: 'Email o contraseña incorrectos. Por favor intentá de nuevo.',
};

function getOAuthErrorMessage(errorCode: string): string {
  return OAUTH_ERROR_MESSAGES[errorCode] ?? 'Error al iniciar sesión. Por favor intentá de nuevo.';
}

export function useGoogleAuth({
  callbackPath,
  paramName,
  onNewUser,
  onExistingUser,
}: UseGoogleAuthOptions) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const hasProcessedRef = useRef(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus, update: updateSession } = useSession();

  const onNewUserRef = useRef(onNewUser);
  const onExistingUserRef = useRef(onExistingUser);
  onNewUserRef.current = onNewUser;
  onExistingUserRef.current = onExistingUser;

  const callbackUrl = `${callbackPath}?${paramName}=1`;

  const setCookieMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error setting cookie');
      return response.json();
    },
  });

  const verifyAuthCookieReady = async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const healthRes = await fetch('/api/auth/health-cookie', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });
      const healthData = await healthRes.json().catch(() => ({ hasAuthToken: false }));
      const hasAuthToken = !!healthData?.hasAuthToken;

      if (healthRes.ok && hasAuthToken) return;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    throw new Error('No se pudo confirmar la cookie de autenticación. Intenta nuevamente.');
  };

  const storeAuthData = async (data: any) => {
    if (!(data?.access_token && data?.user)) {
      throw new Error('No se pudo completar el login con Google. Intenta nuevamente.');
    }

    const sessionUpdate: Record<string, unknown> = {};
    if (data.user?.id) sessionUpdate.id = String(data.user.id);
    if (data.user?.name) sessionUpdate.name = data.user.name;
    if (data.user?.organization) sessionUpdate.organization = data.user.organization;
    if (data.access_token) sessionUpdate.apiToken = data.access_token;
    if (data.user?.role_id !== undefined) sessionUpdate.role_id = data.user.role_id;

    if (sessionUpdate.role_id === undefined && data.user?.id && data.access_token) {
      try {
        const fullUser = await apiFetch<any>(`${API_BASE_URL}/users/${data.user.id}`, { token: data.access_token });
        if (fullUser?.role_id !== undefined) sessionUpdate.role_id = fullUser.role_id;
        if (fullUser?.phone) sessionUpdate.phone = fullUser.phone;
      } catch {
        // silently continue without role_id
      }
    }

    if (Object.keys(sessionUpdate).length > 0) {
      await updateSession(sessionUpdate);
    }

    setSessionTokenCache(data.access_token);
    await setCookieMutation.mutateAsync(data.access_token);
    await verifyAuthCookieReady();
  };

  const googleRegistrationMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiFetch(`${API_BASE_URL}/registration/google`, { method: 'POST', body: payload });
    },
    onSuccess: async (data: any) => {
      try {
        await storeAuthData(data);
        invalidateSessionTokenCache();
        setSessionTokenCache(data?.access_token);
        const isNew = data.message === 'Usuario creado exitosamente con Google';
        if (isNew) {
          onNewUserRef.current?.();
        } else {
          onExistingUserRef.current?.();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error de conexión. Por favor intenta de nuevo.';
        setGoogleError(msg);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (err: any) => {
      setIsGoogleLoading(false);
      const msg = err instanceof Error ? err.message : 'Error de conexión. Por favor intenta de nuevo.';
      setGoogleError(msg);
    },
  });

  const processGoogleSession = async (user: { email?: string | null; name?: string | null; image?: string | null; id?: string; role_id?: number }) => {
    if (hasProcessedRef.current || !user?.email) return;
    hasProcessedRef.current = true;

    await googleRegistrationMutation.mutateAsync({
      email: user.email,
      name: user.name ?? undefined,
      avatar: user.image ?? undefined,
      google_id: user.id,
      role_id: user.role_id,
    });
  };

  const handleGoogleAuth = () => {
    setGoogleError('');
    hasProcessedRef.current = false;
    setIsGoogleLoading(true);
    signIn('google', { redirect: true, callbackUrl });
  };

  // Show NextAuth OAuth errors returned in the URL (e.g. error=OAuthCallback)
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (!oauthError) return;

    setGoogleError(getOAuthErrorMessage(oauthError));
    setIsGoogleLoading(false);
    hasProcessedRef.current = false;

    router.replace(callbackPath);
  }, [searchParams, router, callbackPath]);

  // Process session after Google redirect callback
  useEffect(() => {
    const isGoogleCallback = searchParams.get(paramName) === '1';
    if (!isGoogleCallback) return;

    if (sessionStatus === 'loading') {
      setIsGoogleLoading(true);
      return;
    }

    if (hasProcessedRef.current) return;
    if (sessionStatus !== 'authenticated') {
      setIsGoogleLoading(false);
      setGoogleError('No se pudo recuperar la sesión de Google. Intenta nuevamente.');
      return;
    }

    setGoogleError('');
    processGoogleSession({
      email: session?.user?.email,
      name: session?.user?.name,
      image: (session?.user as any)?.image,
      id: (session?.user as any)?.id,
    }).catch((err) => {
      const msg = err instanceof Error ? err.message : 'Error de conexión. Por favor intenta de nuevo.';
      setGoogleError(msg);
      hasProcessedRef.current = false;
      setIsGoogleLoading(false);
    });
  }, [searchParams, sessionStatus, session, paramName]);

  return {
    isGoogleLoading,
    googleError,
    setGoogleError,
    handleGoogleAuth,
    getOAuthErrorMessage,
  };
}
