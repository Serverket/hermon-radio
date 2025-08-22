# Deployment Guide: Hermon Radio Frontend (Vercel) + Overlay Backend (Render)

This project is split into two deployables:
- Frontend: React + Vite app (this repo root). Deploy on Vercel.
- Backend: Express + PostgreSQL overlay service (in `backend/`). Deploy on Render.com.

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

4. Deploy. After live, note the backend URL, e.g. `https://your-backend.onrender.com`.

5. API Endpoints:
   - `GET /overlay` → current state
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
4. Deploy.

## 3) Local Development

- Backend:
  ```bash
  cd backend
  cp .env.example .env  # edit values
  npm i
  npm run dev
  ```
  Backend runs on http://localhost:8080

- Frontend:
  ```bash
  cp .env.example .env.local  # edit VITE_OVERLAY_BASE_URL
  npm i
  npm run dev
  ```
  Frontend runs on http://localhost:5173

## 4) Using the Overlay Admin

- Open the frontend.
- Click the lock icon (Admin) → enter the Admin username/password you set on Render.
- Configure:
  - Visible: show/hide overlay
  - Type: image | YouTube | text
  - Layout: inline | fullscreen
  - Fit (images only): contain | cover
    - contain: shows the whole content (may letterbox)
    - cover: fills the area (may crop edges)
  - URL: direct image URL or YouTube link
  - Text (type = text): message to display
  - Colors (type = text):
    - Background color: pick with a color input or paste a HEX (e.g., #2563eb)
    - Text color: pick with a color input or paste a HEX (e.g., #ffffff)
- Save → state persists (if DB set) and updates live via SSE.

## Notes
- CORS: ensure your frontend domains are listed in `CORS_ORIGINS`.
- Persistence: without `DATABASE_URL`, overlay resets on backend restart.
- YouTube: uses embed URL with autoplay/mute/inline flags; browser policies may still require interaction for sound.
 - Tip: If you see the alert "Configure VITE_OVERLAY_BASE_URL", set that variable in `.env.local` (frontend) to your backend URL.
