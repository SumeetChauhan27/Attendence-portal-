# Attendance Management System

This repo contains a secure, role-based attendance management system with separate Teacher and Student logins.

## Tech Stack

Frontend:
- Vite
- React + TypeScript

Backend:
- Node + Express
- LowDB JSON storage for persistence

## Project Structure

- `app/` - React frontend
- `server/` - Express API backend

## Local Development

1. Start the backend:

```bash
cd server
npm install
npm run dev
```

2. Start the frontend:

```bash
cd app
npm install
npm run dev
```

The frontend expects the API at `http://localhost:4000` via Vite proxy.

If you want QR scans to open the frontend on phones, set the public URL for QR generation:
```bash
setx PUBLIC_BASE_URL http://<your-lan-ip>:5173
```
Then restart the backend.

## Production Build

1. Build the frontend:

```bash
cd app
npm run build
```

2. Serve the static frontend with any web server and keep the API running at `/api`.

If you want the backend to serve the built frontend, add a static file server in `server/src/index.js` that points to `app/dist`.

## Android Conversion Guidance

Recommended options:
1. **PWA install** on Android: Add to Home Screen, runs in standalone mode.
2. **WebView wrapper**:
   - Use Android Studio with a WebView pointing to the hosted URL.
   - Enable camera permissions for QR scanning.
3. **Capacitor**:
   - Install Capacitor in `app/`, build to `dist`, and sync to Android.

Notes:
- Replace `app/public/icon.svg` with PNG sizes (`192x192`, `512x512`) for better Android icon support.
- Ensure the API URL is reachable from the Android device. If hosting externally, set `VITE_API_URL` in `app/.env`.

## Default Teacher Login

Default credentials:
- Username: `admin`
- Password: `admin123`

To change them, set environment variables before starting the backend:
```bash
setx TEACHER_ID yourUser
setx TEACHER_PASS yourPass
```
