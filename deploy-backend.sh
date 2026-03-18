#!/bin/bash
# Deploy CryptoSaaS Backend to Railway
# Run this from the crypto-saas root directory
set -e

echo "=== CryptoSaaS Backend -> Railway ==="

# Check CLI
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check login
if ! railway whoami 2>/dev/null; then
    echo "Logging into Railway..."
    railway login
fi

# Init project if not linked
if [ ! -f ".railway/config.json" ]; then
    railway init --name crypto-saas-api
fi

echo ""
echo "Deploying..."
railway up --detach

echo ""
echo "Generating public domain..."
railway domain

echo ""
echo "DONE! Set these env vars in the Railway dashboard:"
echo "  CMC_API_KEY        = your CoinMarketCap API key"
echo "  ANTHROPIC_API_KEY  = your Anthropic API key"
echo "  JWT_SECRET         = $(openssl rand -hex 32)"
echo "  NODE_ENV           = production"
echo "  CORS_ORIGIN        = <your Vercel URL after frontend deploy>"
