# WordRush Arena - Deployment & Publishing Guide

WordRush Arena is a full-stack real-time multiplayer application powered by Node.js, Express, WebSockets (`ws`), React 19, and Vite.

Because real-time multiplayer relies on persistent bidirectional WebSockets, the application requires a hosting environment that supports stateful WebSocket connections (such as Render, Railway, Fly.io, or any Docker/Node server).

---

## Option 1: Render (Recommended & Free Tier Available)

Render natively supports WebSockets and automatically uses the included `render.yaml` blueprint.

1. Push your code to your GitHub repository (see steps below).
2. Go to [dashboard.render.com](https://dashboard.render.com) and log in with GitHub.
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository (`WORDRUSH`).
5. Configure the settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. (Optional) Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key (for AI hint generation).
7. Click **Create Web Service**. Render will build and deploy the app at a live URL like `https://wordrush-arena.onrender.com`.

---

## Option 2: Railway

Railway offers zero-configuration deployment for Node.js + WebSocket apps.

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `WORDRUSH` repository.
4. Railway automatically detects `npm run build` and `npm start`.
5. Under **Settings** → **Networking**, click **Generate Domain**.
6. The app will be live with full WebSocket and SSL support.

---

## Option 3: Docker (Any VPS / Cloud Run / Fly.io)

WordRush Arena includes a multi-stage production Dockerfile.

### Local Docker Run:
```bash
docker build -t wordrush-arena .
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key" wordrush-arena
```

### Fly.io Deployment:
```bash
fly launch
fly deploy
```

---

## Local Verification & Development

- **Development Mode**: `npm run dev` (Runs Node + Vite with Hot Module Replacement on `http://localhost:3000`)
- **Production Build**: `npm run build` (Compiles client bundle to `dist/` and bundles `dist/server.cjs`)
- **Production Run**: `npm start` (Runs the production server on `http://localhost:3000` or `$PORT`)
