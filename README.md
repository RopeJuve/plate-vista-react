# Plate Vista

React frontend for the Plate Vista restaurant ordering app (React 18, Vite, Tailwind, shadcn/ui).

## Environment

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|---|---|
| `VITE_VERCEL_API_URL` | REST API origin used in production |
| `VITE_WS_API_URL` | WebSocket URL (`wss://.../ws` in production) |
| `VITE_PLATE_VISTA_URL` | Public frontend origin used in table QR codes |
| `VITE_DEVELOPMENT_URL` | Local API origin |
| `VITE_DEVELOPMENT_WS_URL` | Local WebSocket URL |

The production build fails if the production API, WebSocket, or frontend URL is missing. Use `wss://` for the socket URL on HTTPS hosts. The API `CORS_ORIGIN` must include this frontend origin.

## Roles

- **admin** — `/admin/*` (orders, tables, employees, menu, QR codes, statistics)
- **bar** / **kitchen** — `/bar` monitoring and `/bar/table/:id` table service
- **guest** — `/table/:n` after `POST /auth/table/:n`

Staff login is `POST /auth/employee/login`. The JWT is sent as `Authorization: Bearer <token>` on all non-public requests. Employee tokens last one hour.

## Scripts

```bash
npm ci
npm run dev
npm run lint
npm run build
```

CI runs `npm ci`, lint, build, and `npm audit --omit=dev --audit-level=high` on Ubuntu.
