# Hermon Radio Overlay Backend

Express + PostgreSQL service to store and broadcast overlay state. Provides REST and SSE endpoints.

## Endpoints
- `GET /overlay` → Returns current state
- `GET /overlay/auth-check` (Basic Auth) → Validates credentials, returns 204 on success
- `PUT /overlay` (Basic Auth) → Updates state
- `GET /overlay/stream` → Server-Sent Events (SSE) feed of state changes

State example:
```json
{
  "visible": true,
  "type": "image",      // image | youtube | text
  "url": "https://...",
  "position": "inline", // inline | fullscreen
  "fit": "contain",     // contain | cover (images only)
  "source": "url",
  "title": "",
  "text": "",
  "bgColor": "#2563eb",
  "textColor": "#ffffff"
}
```

## Run locally
```bash
cp .env.example .env  # edit values
npm i
npm run dev
```

Defaults to in-memory if `DATABASE_URL` is not set. PostgreSQL table `overlay_state` is created automatically.

## Environment Variables
- `PORT` (default 8080)
- `DATABASE_URL` (optional; enables persistence)
- `ADMIN_USER`, `ADMIN_PASS` (required for PUT /overlay)
- `CORS_ORIGINS` (comma-separated; e.g., `http://localhost:5173,https://your-frontend.vercel.app`)

## Deploy on Render.com
- Root Directory: `backend/`
- Build: `npm install`
- Start: `npm start`
- Node 18+

See `../docs/DEPLOYMENT.md` for details.
