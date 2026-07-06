import { getSession, signOut } from 'next-auth/react';

// ── Session token cache ────────────────────────────────────────────────────
// Coalesces concurrent getSession() calls into one in-flight request and
// caches the result for SESSION_CACHE_TTL ms to prevent a separate
// /api/auth/session request for every apiFetch call.
const SESSION_CACHE_TTL = 30_000; // 30 s
let _sessionToken: string | undefined;
let _sessionExpiry = 0;
let _sessionInflight: Promise<string | undefined> | null = null;

async function getCachedToken(): Promise<string | undefined> {
  const now = Date.now();
  if (_sessionToken !== undefined && now < _sessionExpiry) return _sessionToken;
  if (_sessionInflight) return _sessionInflight;
  _sessionInflight = getSession()
    .then(s => {
      _sessionToken = (s?.user as any)?.apiToken ?? undefined;
      _sessionExpiry = Date.now() + SESSION_CACHE_TTL;
      return _sessionToken;
    })
    .finally(() => { _sessionInflight = null; });
  return _sessionInflight;
}

/** Call this whenever you know the session has changed (login / logout). */
export function invalidateSessionTokenCache() {
  _sessionToken = undefined;
  _sessionExpiry = 0;
  _sessionInflight = null;
}

/** Prime token cache right after login to avoid first-request race conditions. */
export function setSessionTokenCache(token?: string) {
  _sessionToken = token;
  _sessionExpiry = token ? Date.now() + SESSION_CACHE_TTL : 0;
  _sessionInflight = null;
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface ApiFetchOptions<TBody = unknown> {
  method?: HttpMethod;
  /** Request body — serialised to JSON automatically (POST / PATCH / PUT), or sent as-is when FormData */
  body?: TBody;
  /** Query-string params appended to the URL (GET / DELETE) */
  params?: Record<string, string | number | boolean | null | undefined>;
  /**
   * Override the auth token.
   * When omitted the token is resolved automatically from the active session.
   */
  token?: string;
}

/**
 * Thin wrapper around `fetch` that:
 *  - Sets `Content-Type: application/json` automatically
 *  - Attaches `Authorization: Bearer <token>` when the user is logged in
 *  - Appends query-string params for GET / DELETE requests
 *  - Serialises the body for POST / PATCH / PUT requests
 *  - Throws on non-2xx responses
 */
export async function apiFetch<TResponse = unknown, TBody = unknown>(
  url: string,
  options: ApiFetchOptions<TBody> = {},
): Promise<TResponse> | false {
  const { method = 'GET', body, params, token: explicitToken } = options;
  // ── Resolve auth token ────────────────────────────────────────────────────
  let token = explicitToken;
  if (!token) {
    token = await getCachedToken();
  }

  // ── Build URL with query params ───────────────────────────────────────────
  let fullUrl = url;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        qs.set(key, String(value));
      }
    });
    const queryString = qs.toString();
    if (queryString) {
      fullUrl = `${url}?${queryString}`;
    }
  }

  // ── Headers ───────────────────────────────────────────────────────────────
  const headers: Record<string, string> = {};
  const isFormData = body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ── Fetch options ─────────────────────────────────────────────────────────
  const fetchOptions: RequestInit = { method, headers };
  if (body !== undefined && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    fetchOptions.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  // ── Execute ───────────────────────────────────────────────────────────────
  const response = await fetch(fullUrl, fetchOptions);
  
  if (!response.ok) {
    if (
      response.status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/protected')
    ) {
      invalidateSessionTokenCache();
      await signOut({ redirect: false });
      window.location.href = '/login?sessionExpired=true';
      throw new Error('Session expired');
    }

    await response.json()
      .then(data => {
        throw new Error(data.message ?? `API error: ${response.status} ${response.statusText}`);
      })
      .catch((errorMessage) => {
        throw new Error(errorMessage instanceof Error ? errorMessage.message : 'Error al conectar con el servidor');
      });
  }

  // Handle empty responses (204 No Content or zero-length body)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as TResponse;
  }

  return response.json() as Promise<TResponse>;
}
