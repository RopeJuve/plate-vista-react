/**
 * FE-12 — Auth token storage decision.
 *
 * The staff access token stays in `localStorage` for this release. A true
 * httpOnly refresh cookie needs a backend change (the API does not set one
 * today). Until that exists:
 *
 * - REST calls send `Authorization: Bearer <token>`.
 * - The socket never puts that token in the URL. Every connect calls
 *   `POST /api/v1/ws-ticket` and opens `/ws?v=2&ticket=...`. Tickets expire
 *   in 60 seconds and are not reused.
 * - Close code `4001` tries `POST /api/v1/auth/refresh` once. If that fails,
 *   staff are sent to the login screen. Network drops (`1006`, `1001`)
 *   reconnect with backoff and do not log the tablet out.
 * - Guest table tokens live in memory (and are re-minted from the QR code),
 *   not in the staff `localStorage` key.
 */
export {};
