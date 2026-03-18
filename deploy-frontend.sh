#!/bin/bash
# Deploy CryptoSaaS Frontend to Vercel
# Run this from the crypto-saas root directory
set -e

echo "=== CryptoSaaS Frontend -> Vercel ==="

# Check CLI
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Check login
if ! vercel whoami 2>/dev/null; then
    echo "Logging into Vercel..."
    vercel login
fi

read -p "Enter your Railway backend URL (e.g. https://crypto-saas-api.up.railway.app): " BACKEND_URL

echo ""
echo "Deploying to Vercel..."
vercel --prod \
    --env VITE_API_URL="${BACKEND_URL}/api" \
    --yes

echo ""
echo "DONE! Now update Railway CORS_ORIGIN to your Vercel URL above."
