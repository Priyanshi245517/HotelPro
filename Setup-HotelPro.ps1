$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host 'HOTELPRO 2.0 - FIRST TIME SETUP' -ForegroundColor Cyan
Write-Host 'Your MongoDB connection string is entered locally and is not sent anywhere except your configured backend.'
$mongo = Read-Host 'Paste your MongoDB Atlas connection string using database name HotelPro2'
if ([string]::IsNullOrWhiteSpace($mongo) -or $mongo -notmatch '^mongodb(\+srv)?://') { throw 'That does not look like a MongoDB connection string.' }
$secrets = node -e "const c=require('crypto'); console.log(c.randomBytes(48).toString('hex')); console.log(c.randomBytes(48).toString('hex'))"
$lines = $secrets -split "`r?`n"
if ($lines.Count -lt 2) { throw 'Could not generate application secrets. Check that Node.js is installed.' }
$envText = @"
NODE_ENV=development
PORT=5000
MONGODB_URI=$mongo
JWT_SECRET=$($lines[0])
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=http://localhost:5173
ALLOW_ADMIN_BOOTSTRAP=true
ADMIN_BOOTSTRAP_SECRET=$($lines[1])
"@
Set-Content -Path (Join-Path $root 'backend\.env') -Value $envText -Encoding ascii
Set-Content -Path (Join-Path $root 'frontend\.env') -Value 'VITE_API_URL=http://localhost:5000/api' -Encoding ascii
Write-Host 'Installing backend dependencies...' -ForegroundColor Yellow
Push-Location (Join-Path $root 'backend'); npm install; if ($LASTEXITCODE -ne 0) { throw 'Backend npm install failed.' }; Pop-Location
Write-Host 'Installing frontend dependencies...' -ForegroundColor Yellow
Push-Location (Join-Path $root 'frontend'); npm install; if ($LASTEXITCODE -ne 0) { throw 'Frontend npm install failed.' }; Pop-Location
Write-Host 'Setup complete. Start HotelPro with Start-HotelPro.bat.' -ForegroundColor Green
Write-Host 'IMPORTANT: The first account created can become admin only when its registration request includes the admin setup key. See README.' -ForegroundColor Yellow
