# HotelPro 2.0

HotelPro is a MERN hotel-management application with guest registration/login, role-based room management, booking and cancellation, booking conflict validation, and staff dashboard metrics.

## Quick setup on Windows

**Requirements:** Node.js 20 LTS or newer and a MongoDB Atlas cluster/database user.

1. Extract this ZIP into a new folder. Do not overwrite your previous HotelPro folder.
2. In MongoDB Atlas, copy the application connection string. Use a new database name, `HotelPro2`, in the path after `.net/`. Do not use the old `HotelPro` database if you need to preserve its data.
3. Right-click `Setup-HotelPro.ps1` and choose **Run with PowerShell**, or open PowerShell in this folder and run:
   ```powershell
   Set-ExecutionPolicy -Scope Process Bypass
   .\Setup-HotelPro.ps1
   ```
4. Paste the Atlas connection string when prompted. The script generates separate random JWT and bootstrap secrets locally and installs dependencies. It writes local `.env` files, which are excluded from Git.
5. Run `Start-HotelPro.bat`. It opens the backend, frontend, and browser.
6. Register the first account. During registration, enter the admin setup key only if you are creating the first administrator. The key is stored locally in `backend/.env` as `ADMIN_BOOTSTRAP_SECRET`; it is never placed in frontend source code. After the first admin is created, change `ALLOW_ADMIN_BOOTSTRAP=true` to `ALLOW_ADMIN_BOOTSTRAP=false` in `backend/.env` and restart the backend.
7. Create staff/guest accounts through normal registration. Normal registrations are guests.

If PowerShell blocks the script, use the two commands in step 3 for the current terminal only. Do not permanently weaken your Windows execution policy.

## Manual setup

Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, a unique long `JWT_SECRET`, and a separate `ADMIN_BOOTSTRAP_SECRET`. Set `ALLOW_ADMIN_BOOTSTRAP=true` only while creating the first admin, then turn it off. Copy `frontend/.env.example` to `frontend/.env`.

In separate terminals:

```powershell
cd backend
npm install
npm run dev
```

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Verification

Backend API tests:

```powershell
cd backend
npm install
npm test
```

Frontend production build:

```powershell
cd frontend
npm install
npm run build
```

The backend test suite uses an isolated in-memory MongoDB and does not modify Atlas data.

## Roles and features

- Guest: register/login, browse active rooms, reserve rooms, view own bookings, cancel own bookings.
- Staff: add and edit rooms, view dashboard metrics.
- Admin: staff permissions plus room deactivation.
- API: JWT authentication, password hashing, validation, role middleware, rate limiting on authentication routes, Helmet, CORS allow-list, booking overlap and capacity checks.

## Deployment notes

- Backend: deploy `backend` as a Render web service; build `npm install`, start `npm start`.
- Frontend: deploy `frontend` on Vercel; build `npm run build`, output `dist`; set `VITE_API_URL` to the deployed API URL ending in `/api`.
- Set production environment variables on the hosting provider. Never upload `.env` files.
- Configure Atlas network access for the backend host. Do not use broad network access longer than necessary.
- This is an academic hotel-management project, not a payment processor or audited production booking platform. Review security, backups, privacy, and concurrency behavior before real commercial use.
