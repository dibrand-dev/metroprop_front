'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';

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

  const storeAuthData = async (data: any) => {
    if (!(data?.access_token && data?.user)) return;
    localStorage.setItem('authToken', data.access_token);

    const sessionUpdate: Record<string, unknown> = {};
    if (data.user?.id) sessionUpdate.id = String(data.user.id);
    if (data.user?.organization) sessionUpdate.organization = data.user.organization;
    if (Object.keys(sessionUpdate).length > 0) {
      await updateSession(sessionUpdate);
    }

    try {
      await setCookieMutation.mutateAsync(data.access_token);
    } catch (cookieError) {
      console.error('Error calling set-cookie API:', cookieError);
    }
  };

  const googleRegistrationMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch(`${API_BASE_URL}/registration/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al iniciar sesión con Google');
      }
      return response.json();
    },
    onSuccess: async (data: any) => {
      await storeAuthData(data);
      const isNew = data.message === 'Usuario creado exitosamente con Google';
      if (isNew) {
        onNewUserRef.current?.();
      } else {
        onExistingUserRef.current?.();
      }
    },
    onError: (err: any) => {
      setIsGoogleLoading(false);
      const msg = err instanceof Error ? err.message : 'Error de conexión. Por favor intenta de nuevo.';
      setGoogleError(msg);
    },
  });

  const processGoogleSession = (user: { email?: string | null; name?: string | null; image?: string | null; id?: string }) => {
    if (!user?.email) return;
    googleRegistrationMutation.mutate({
      email: user.email,
      name: user.name ?? undefined,
      avatar: user.image ?? undefined,
      google_id: user.id,
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

      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      if (sessionData?.user) {
        processGoogleSession(sessionData.user);
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

    hasProcessedRef.current = true;
    setGoogleError('');
    processGoogleSession({
      email: session?.user?.email,
      name: session?.user?.name,
      image: (session?.user as any)?.image,
      id: (session?.user as any)?.id,
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
