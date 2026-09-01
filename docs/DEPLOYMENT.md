# Deployment & Production Setup Guide

## Local Development Setup

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run seed
   npm start
   ```
   API runs on `http://localhost:5000`.

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App runs on `http://localhost:3000`.

## Production Deployment (Vercel / Render / Docker)

1. Build frontend dist:
   ```bash
   cd frontend
   npm run build
   ```
2. Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `JWT_SECRET=super_secret_production_key_2026`
   - `JWT_EXPIRES_IN=24h`
