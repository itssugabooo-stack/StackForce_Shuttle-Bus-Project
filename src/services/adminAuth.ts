

const TOKEN_KEY = 'admin_token';

const PERSIST_LOGIN = false;

function getStore(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return PERSIST_LOGIN ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function removeEverywhere(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Reads the payload of a JWT. Returns null if the token isn't a valid JWT. */
function readJwtPayload(token: string): { exp?: number; role?: string } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  removeEverywhere();
  getStore()?.setItem(TOKEN_KEY, token);
}

export function getAdminToken(): string | null {
  const store = getStore();
  if (!store) return null;

  if (!PERSIST_LOGIN) {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }

  const token = store.getItem(TOKEN_KEY);
  if (!token) return null;

  const payload = readJwtPayload(token);
  const expired = typeof payload?.exp === 'number' && payload.exp * 1000 <= Date.now();
  if (!payload || payload.role !== 'ADMIN' || expired) {
    // Fake, non-admin or expired token: sign out
    store.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}

export function clearAdminToken(): void {
  removeEverywhere();
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminToken());
}