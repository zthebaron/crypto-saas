@echo off
REM Deploy CryptoSaaS - Windows Batch Script
REM Run from the crypto-saas root directory

echo === CryptoSaaS Deployment Guide ===
echo.
echo STEP 1: Login to both platforms (one-time)
echo   vercel login
echo   railway login
echo.
echo STEP 2: Deploy Backend to Railway
echo   cd server
echo   railway init --name crypto-saas-api
echo   railway up --detach
echo   railway domain
echo.
echo   Then set env vars in Railway Dashboard:
echo     CMC_API_KEY = your CoinMarketCap API key
echo     ANTHROPIC_API_KEY = your Anthropic API key
echo     JWT_SECRET = a secure random string (32+ chars)
echo     NODE_ENV = production
echo     CORS_ORIGIN = your Vercel URL (set after frontend deploy)
echo.
echo STEP 3: Deploy Frontend to Vercel
echo   cd client
echo   vercel --prod --env VITE_API_URL=https://YOUR-RAILWAY-URL/api --yes
echo.
echo STEP 4: Update CORS on Railway
echo   railway variables set CORS_ORIGIN=https://YOUR-VERCEL-URL
echo.
echo === Quick Deploy Commands ===
echo.

set /p choice="Deploy now? (backend/frontend/both/quit): "

if "%choice%"=="backend" (
    cd server
    railway up --detach
    cd ..
) else if "%choice%"=="frontend" (
    set /p backendUrl="Enter Railway backend URL: "
    cd client
    vercel --prod --env VITE_API_URL=%backendUrl%/api --yes
    cd ..
) else if "%choice%"=="both" (
    echo Deploying backend...
    cd server
    railway up --detach
    echo.
    echo Backend deploying. Get URL with: railway domain
    echo Then deploy frontend with: deploy.bat frontend
    cd ..
) else (
    echo Exiting.
)
