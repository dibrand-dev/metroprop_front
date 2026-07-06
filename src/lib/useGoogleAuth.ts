'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
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

export function useGoogleAuth({
  callbackPath,
  paramName,
  onNewUser,
  onExistingUser,
}: UseGoogleAuthOptions) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const popupCleanupRef = useRef<(() => void) | null>(null);
  const hasProcessedRef = useRef(false);
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus, update: updateSession } = useSession();

  // Keep callbacks in refs so the mutation always calls the latest version
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

    // If role_id is missing from the registration response, fetch the full user profile
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

    // Prime local token cache to avoid first apiFetch calls racing with session refresh.
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

  // --- Popup flow ---
  const handleGoogleAuth = async () => {
    setGoogleError('');
    setIsGoogleLoading(true);
    popupCleanupRef.current?.();

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      'about:blank',
      'google-login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      signIn('google', { redirect: true, callbackUrl });
      return;
    }

    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: `${window.location.origin}${callbackUrl}`,
      });

      if (result?.url) {
        popup.location.href = result.url;
      } else {
        popup.close();
        signIn('google', { redirect: true, callbackUrl });
        return;
      }
    } catch {
      popup.close();
      setIsGoogleLoading(false);
      setGoogleError('Error al iniciar sesión con Google. Por favor intenta de nuevo.');
      return;
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'google-auth-success') return;

      cleanup();

      try {
        const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
        const sessionData = await sessionRes.json();
        if (sessionData?.user) {
          await processGoogleSession(sessionData.user);
          return;
        }
        setIsGoogleLoading(false);
        setGoogleError('No se pudo recuperar la sesión de Google. Intenta nuevamente.');
      } catch {
        setIsGoogleLoading(false);
        setGoogleError('No se pudo recuperar la sesión de Google. Intenta nuevamente.');
      }
    };

    const pollTimer = setInterval(() => {
      if (popup.closed) {
        cleanup();
        setIsGoogleLoading(false);
      }
    }, 1000);

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(pollTimer);
      popupCleanupRef.current = null;
    };

    window.addEventListener('message', handleMessage);
    popupCleanupRef.current = cleanup;
  };

  // --- Detect popup callback OR fallback redirect ---
  useEffect(() => {
    const isGoogleCallback = searchParams.get(paramName) === '1';
    if (!isGoogleCallback) return;

    // Inside popup → notify opener and close
    if (typeof window !== 'undefined' && window.opener) {
      try {
        window.opener.postMessage({ type: 'google-auth-success' }, window.location.origin);
      } catch { /* opener may be closed */ }
      window.close();
      return;
    }

    // Fallback redirect flow (popup was blocked)
    if (hasProcessedRef.current) return;
    if (sessionStatus !== 'authenticated') return;

    setGoogleError('');
    processGoogleSession({
      email: session?.user?.email,
      name: session?.user?.name,
      image: (session?.user as any)?.image,
      id: (session?.user as any)?.id,
    }).catch((err) => {
      const msg = err instanceof Error ? err.message : 'Error de conexión. Por favor intenta de nuevo.';
      setGoogleError(msg);
      setIsGoogleLoading(false);
    });
  }, [searchParams, sessionStatus, session]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { popupCleanupRef.current?.(); };
  }, []);

  return {
    isGoogleLoading,
    googleError,
    setGoogleError,
    handleGoogleAuth,
  };
}
