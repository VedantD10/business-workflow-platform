# Deployment & Production Setup Guide — VESA Operations Platform

## 1. Vercel Production Monorepo Deployment

FlowSync is pre-configured with a root `vercel.json` and a serverless API entrypoint (`api/index.js`) for 1-click deployment on **Vercel**.

### Vercel Deployment Steps:
1. Connect your GitHub repository (`https://github.com/VedantD10/business-workflow-platform`) in the Vercel Dashboard.
2. Select **Framework Preset**: `Vite`.
3. Set **Build Command**: `cd frontend && npm install && npm run build`
4. Set **Output Directory**: `frontend/dist`
5. Configure Environment Variables:
   - `JWT_SECRET`: `vesa_enterprise_workflow_secure_jwt_secret_key_2026_prod`
   - `NODE_ENV`: `production`

### Vercel Monorepo Architecture:
- **Frontend SPA**: React 18 SPA compiled into static assets in `frontend/dist`. Rewrites all non-API paths `/(.*)` to `index.html` for client-side routing.
- **Backend Express Serverless API**: Express API exported in `api/index.js` handling all `/api/(.*)` requests.
- **Serverless Writable Storage**: Automatically uses `/tmp/workflow.db` and `/tmp/uploads` on Vercel cold starts with auto-seeding on fresh database initialization.

---

## 2. Docker / Traditional Node Server Deployment

### Backend Setup:
```bash
cd backend
npm install
npm run seed
npm start
```
*API runs on `http://localhost:5000` with native WebSockets support via Socket.IO.*

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*
