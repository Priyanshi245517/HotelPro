@echo off
cd /d "%~dp0"
if not exist backend\.env (
  echo Run Setup-HotelPro.ps1 first.
  pause
  exit /b 1
)
start "HotelPro Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 3 /nobreak >nul
start "HotelPro Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 3 /nobreak >nul
start http://localhost:5173
