import axios from "axios";
import { plateVistaConfig } from "../../Config/plateVista.config";

/**
 * Staff/customer login tokens.
 *
 * - The access token (1 hour) lives in memory only.
 * - The refresh token (30 days, single use) lives in `localStorage` so a
 *   reload keeps the user signed in.
 *
 * Refresh tokens rotate on every use and the server logs a login out on every
 * device if one is sent twice. So refreshes are shared within a tab (one
 * promise) and serialized across tabs (`navigator.locks`), and the refresh
 * token is re-read from storage inside the lock, after any other tab rotated it.
 */

const REFRESH_KEY = "refreshToken";
const LEGACY_ACCESS_KEY = "authToken";
const LOCK_NAME = "plate-vista:refresh";
const EARLY_REFRESH_MS = 60_000;

export type TokenBody = {
  accessToken?: unknown;
  token?: unknown;
  refreshToken?: unknown;
  expiresIn?: unknown;
};

const readLegacyAccessToken = () => {
  // Sessions from before refresh tokens kept the access token in storage.
  // Keep using it until it expires, then the user signs in again.
  const legacy = localStorage.getItem(LEGACY_ACCESS_KEY);
  localStorage.removeItem(LEGACY_ACCESS_KEY);
  return legacy;
};

let accessToken: string | null = readLegacyAccessToken();
let refreshing: Promise<string> | null = null;
let earlyRefreshTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

/** For `useSyncExternalStore`. */
export const subscribeTokens = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getAccessToken = () => accessToken;

export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

const clearEarlyRefresh = () => {
  if (earlyRefreshTimer) {
    clearTimeout(earlyRefreshTimer);
    earlyRefreshTimer = null;
  }
};

const scheduleEarlyRefresh = (expiresInSeconds: number) => {
  clearEarlyRefresh();
  if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
    return;
  }
  const delay = Math.max(expiresInSeconds * 1000 - EARLY_REFRESH_MS, 5_000);
  earlyRefreshTimer = setTimeout(() => {
    // A failure here surfaces on the next request, which refreshes on 401.
    void refreshSession().catch(() => undefined);
  }, delay);
};

const asToken = (value: unknown) => {
  if (typeof value !== "string" || !value) {
    return null;
  }
  return value.startsWith("Bearer ") ? value.slice(7) : value;
};

/**
 * Stores the tokens from login, register or refresh. Returns the access token.
 * A body without a refresh token (an older API) still logs in; the user signs
 * in again when the access token expires.
 */
export const saveTokens = (body: TokenBody, headerToken?: string | null): string | null => {
  const nextAccess = asToken(body.accessToken) || asToken(body.token) || asToken(headerToken);
  const nextRefresh = asToken(body.refreshToken);
  if (!nextAccess) {
    return null;
  }
  accessToken = nextAccess;
  if (nextRefresh) {
    localStorage.setItem(REFRESH_KEY, nextRefresh);
  }
  scheduleEarlyRefresh(Number(body.expiresIn));
  emit();
  return nextAccess;
};

export const clearTokens = () => {
  clearEarlyRefresh();
  const hadTokens = Boolean(accessToken || getRefreshToken());
  accessToken = null;
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(LEGACY_ACCESS_KEY);
  if (hadTokens) {
    emit();
  }
};

const apiBase = () => String(plateVistaConfig.VITE_VERCEL_API_URL || "").replace(/\/$/, "");

const withRefreshLock = <T>(task: () => Promise<T>): Promise<T> => {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  if (!locks?.request) {
    return task();
  }
  return locks.request(LOCK_NAME, task) as Promise<T>;
};

const runRefresh = () =>
  withRefreshLock(async () => {
    // Read inside the lock: another tab may have rotated it a moment ago.
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new SessionExpiredError();
    }
    try {
      const { data } = await axios.post(`${apiBase()}/auth/refresh`, { refreshToken });
      const next = saveTokens(data ?? {});
      if (!next) {
        throw new SessionExpiredError();
      }
      return next;
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (error instanceof SessionExpiredError || status === 400 || status === 401) {
        clearTokens();
        throw new SessionExpiredError();
      }
      // Network or server error: keep the tokens, the caller may retry later.
      throw error;
    }
  });

/**
 * Trades the stored refresh token for a new access + refresh token pair.
 * Parallel callers share one request. Rejects with `SessionExpiredError` when
 * the user has to sign in again (tokens are already cleared by then).
 */
export const refreshSession = (): Promise<string> => {
  if (!refreshing) {
    refreshing = runRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
};

/** Revokes the refresh token on the server, then forgets both tokens. */
export const revokeSession = async () => {
  const refreshToken = getRefreshToken();
  clearTokens();
  if (!refreshToken) {
    return;
  }
  try {
    await axios.post(`${apiBase()}/auth/logout`, { refreshToken });
  } catch {
    // The local tokens are gone either way; the refresh token expires on its own.
  }
};

// Another tab signed out: follow it.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === REFRESH_KEY && event.newValue === null && accessToken) {
      clearEarlyRefresh();
      accessToken = null;
      emit();
    }
  });
}
