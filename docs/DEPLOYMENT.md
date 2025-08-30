# Deployment Guide: Hermon Radio Frontend (Vercel) + Overlay Backend (Render)

This project is split into two deployables:
- Frontend: React + Vite PWA with advanced streaming overlays (this repo root). Deploy on Vercel.
- Backend: Express + PostgreSQL overlay service with optional RTMP/HLS streaming (in `backend/`). Deploy on Render.com.

## 1) Backend (Render.com)

1. Create a new Web Service on Render:
   - Connect your Git repo.
   - Root Directory: `backend/`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Runtime: Node 18+

2. (Optional) Provision PostgreSQL on Render and copy its `DATABASE_URL`.
   - If you skip Postgres, backend will use in-memory state (fine for testing, not persistent).

3. Set Environment Variables (Render > Service > Environment):
   - `PORT` = 8080 (Render will set `PORT` automatically; leave blank or 8080)
   - `DATABASE_URL` = postgres://USER:PASSWORD@HOST:PORT/DB (optional)
   - `ADMIN_USER` = your-admin-username
   - `ADMIN_PASS` = your-admin-password
   - `CORS_ORIGINS` = http://localhost:5173,https://your-frontend.vercel.app

   Optional HLS Streaming:
   - `STREAM_ENABLE` = true (enables RTMP/HLS streaming)
   - `STREAM_RTMP_PORT` = 1935
   - `STREAM_HTTP_PORT` = 8000
   - `STREAM_APP` = live
   - `STREAM_KEY` = your_secret_key_here
   - `FFMPEG_PATH` = /usr/bin/ffmpeg

4. Deploy. After live, note the backend URL, e.g. `https://your-backend.onrender.com`.

5. API Endpoints:
   - `GET /overlay` → current state
   - `GET /overlay/auth-check` (Basic Auth) → validate admin credentials (returns 204)
   - `PUT /overlay` (Basic Auth) → update state
   - `GET /overlay/stream` → Server-Sent Events (SSE) live updates

## 2) Frontend (Vercel)

1. Create a new Project in Vercel from this repo.
2. Build Settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment Variables (Project > Settings > Environment Variables):
   - `VITE_OVERLAY_BASE_URL` = `https://your-backend.onrender.com`
   - `VITE_STREAM_HLS_URL` = `https://your-backend.onrender.com:8000/live/stream/index.m3u8` (if using HLS streaming)
4. Deploy.

### Admin login flow (frontend)

- The admin panel prompts for username/password.
- On submit, the frontend calls `GET /overlay/auth-check` with Basic Auth.
- Only on a 204 response the panel unlocks. Otherwise, it shows “Credenciales inválidas”.
- Saving changes calls `PUT /overlay` (Basic Auth).
- All connected clients update in real time via `GET /overlay/stream` (SSE).

## 3) Local Development

### Backend:
Using npm:
```bash
cd backend
cp .env.example .env  # edit values
npm install
npm run dev
```

Using Bun (recommended):
```bash
cd backend
cp .env.example .env  # edit values
bun install
bun run dev:bun
```
Backend runs on http://localhost:8080

### Frontend:
Using npm:
```bash
cp .env.example .env.local  # edit VITE_OVERLAY_BASE_URL
npm install
npm run dev
```

Using Bun (recommended):
```bash
cp .env.example .env.local  # edit VITE_OVERLAY_BASE_URL
bun install
bun run dev:bun
```
Frontend runs on http://localhost:5173

## 4) Using the Overlay Admin

- Open the frontend.
- Click the lock icon (Admin) → enter the Admin username/password you set on Render.
- Configure overlay content using the intuitive icon-based interface:

### Content Types (Icon Buttons):
  - **Camera** (🎥): Live HLS streaming from RTMP source
  - **Image** (🖼️): Display images from direct URLs
  - **Text** (📝): Custom text messages with styling
  - **YouTube** (▶️): Embedded YouTube videos

### Display Settings (Icon Buttons):
  - **Presentación**:
    - **Integrado** (grid icon): Shows content within the main card
    - **Pantalla completa** (maximize icon): Full-screen overlay display
  
  - **Ajuste** (Images only):
    - **Contener** (fit icon): Shows complete image (may letterbox)
    - **Cubrir** (fill icon): Fills area completely (may crop edges)

### Content Configuration:
  - **URLs**: Direct image URLs or YouTube links
  - **Text**: Custom messages with live preview
  - **Colors** (Text mode): Background and text color pickers with HEX input
  - **Visibility**: Toggle overlay on/off

### Key Features:
  - **Auto-save**: All content and settings persist locally via localStorage
  - **Real-time sync**: Changes broadcast instantly to all connected clients via SSE
  - **Responsive design**: Optimized controls for both desktop and mobile
  - **Cross-platform**: Seamless switching between content types without interference

## Notes
- CORS: ensure your frontend domains are listed in `CORS_ORIGINS`.
- Persistence: without `DATABASE_URL`, overlay resets on backend restart.
- YouTube: uses embed URL with autoplay/mute/inline flags; browser policies may still require interaction for sound.
 - Tip: If you see the alert "Configure VITE_OVERLAY_BASE_URL", set that variable in `.env.local` (frontend) to your backend URL.
