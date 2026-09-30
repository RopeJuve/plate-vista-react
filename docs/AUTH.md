/**
 * FE-12 — Auth token storage.
 *
 * Staff and customers (`POST /auth/login`, `/auth/employee/login`, `/auth/register`)
 * get an access token (1 hour) and a refresh token (30 days, single use) in the
 * JSON body. All of it lives in `src/shared/api/tokens.ts`:
 *
 * - The access token is kept in memory only. REST calls send
 *   `Authorization: Bearer <token>`.
 * - The refresh token is kept in `localStorage` (`refreshToken`) so a reload
 *   stays signed in: on boot `AuthProvider` trades it for a new pair while
 *   `PrivateRoute` shows the loader.
 * - A `401` on any REST call refreshes once and retries. Parallel callers share
 *   one refresh; tabs are serialized with `navigator.locks` and re-read the
 *   refresh token inside the lock. Sending a used refresh token twice makes the
 *   server log that login out everywhere, so never call `/auth/refresh` directly.
 * - The access token is also refreshed a minute before `expiresIn` runs out.
 * - Logout calls `POST /auth/logout` with the refresh token, then forgets both.
 *   Signing out in one tab signs out the others (storage event).
 *
 * WebSocket: the token never goes in the URL. Every connect calls
 * `POST /ws-ticket` and opens `/ws?v=2&ticket=...` (60 seconds, one connect).
 * `4001` refreshes and reconnects with a new ticket. `4003` refreshes once and
 * retries, then logs out. `1001`/`1006` reconnect with backoff (max 30s).
 *
 * Guests (`POST /auth/table/:qrCode`) get a 4-hour table token with no refresh
 * token. The first guest opens the table and sees the 4-character join code;
 * later guests enter it. The table token is stored as `guestToken:<qrCode>` and
 * sent back on the next scan, so a reload rejoins without the code.
 */
export {};
