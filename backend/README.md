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
  "type": "image",      // image | youtube | text | hls
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

### Using npm:
```bash
cp .env.example .env  # edit values
npm install
npm run dev
```

### Using Bun (recommended):
```bash
cp .env.example .env  # edit values
bun install
bun run dev:bun
```

Defaults to in-memory if `DATABASE_URL` is not set. PostgreSQL table `overlay_state` is created automatically.

## Environment Variables
- `PORT` (default 8080)
- `DATABASE_URL` (optional; enables persistence)
- `ADMIN_USER`, `ADMIN_PASS` (required for PUT /overlay)
- `CORS_ORIGINS` (comma-separated; e.g., `http://localhost:5173,https://your-frontend.vercel.app`)

## Streaming (RTMP -> HLS)
This backend can optionally run a Node-Media-Server (NMS) instance for RTMP ingest and HLS output.

1) Enable streaming in `.env`:

```
STREAM_ENABLE=true
STREAM_RTMP_PORT=1935
STREAM_HTTP_PORT=8000
STREAM_APP=live
STREAM_KEY=your_secret_key_here
STREAM_ALLOW_ORIGIN=http://localhost:5173
FFMPEG_PATH=/usr/bin/ffmpeg
STREAM_HLS_TIME=2
STREAM_HLS_LIST_SIZE=6
```

2) Start the backend (NMS will boot automatically when `STREAM_ENABLE=true`):

```
npm run dev
```

3) Configure OBS:

- Server: `rtmp://<backend-host>:1935/<STREAM_APP>` (e.g., `rtmp://localhost:1935/live`)
- Stream Key: `stream?key=<STREAM_KEY>` (e.g., `stream?key=your_secret_key_here`)

4) Playback URL (for the frontend HLS player):

```
http://<backend-host>:8000/<STREAM_APP>/stream/index.m3u8
```

Set the frontend env var `VITE_STREAM_HLS_URL` to this value.

Notes:
- Restrict `STREAM_ALLOW_ORIGIN` to your real frontend origin(s) in production.
- Reduce latency by tuning `STREAM_HLS_TIME`/`STREAM_HLS_LIST_SIZE`.
- Ensure `FFMPEG_PATH` points to ffmpeg 6.1+.

## Deploy on Render.com
- Root Directory: `backend/`
- Build: `npm install`
- Start: `npm start`
- Node 18+

See `../docs/DEPLOYMENT.md` for details.
