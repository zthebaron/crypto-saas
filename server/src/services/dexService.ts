import axios from 'axios';

// DEX Aggregator service using 1inch API (or simulated quotes when no API key)
// This service NEVER handles private keys. It returns unsigned tx data for MetaMask to sign.

const INCH_API_BASE = 'https://api.1inch.dev/swap/v6.0';
const INCH_API_KEY = process.env.ONEINCH_API_KEY || '';

// Token address constants
const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

// Chain-specific DEX router addresses (1inch Aggregation Router v6)
const AGGREGATION_ROUTER: Record<number, string> = {
  1: '0x111111125421cA6dc452d289314280a0f8842A65',
  137: '0x111111125421cA6dc452d289314280a0f8842A65',
  42161: '0x111111125421cA6dc452d289314280a0f8842A65',
  10: '0x111111125421cA6dc452d289314280a0f8842A65',
  56: '0x111111125421cA6dc452d289314280a0f8842A65',
  43114: '0x111111125421cA6dc452d289314280a0f8842A65',
  8453: '0x111111125421cA6dc452d289314280a0f8842A65',
};

// Well-known token prices (fallback for demo mode)
const DEMO_PRICES: Record<string, number> = {
  'ETH': 3500,
  'WETH': 3500,
  'BTC': 95000,
  'WBTC': 95000,
  'USDC': 1,
  'USDT': 1,
  'DAI': 1,
  'BNB': 600,
  'MATIC': 0.50,
  'POL': 0.50,
  'AVAX': 35,
  'LINK': 18,
  'UNI': 12,
  'ARB': 1.2,
  'OP': 2.5,
};

// Token symbol lookup by address (common tokens)
const TOKEN_SYMBOLS: Record<string, string> = {
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 'WETH',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 'WBTC',
  '0x514910771AF9Ca656af840dff83E8264EcF986CA': 'LINK',
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': 'UNI',
  // Polygon
  '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359': 'USDC',
  '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619': 'WETH',
  // Arbitrum
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 'USDC',
  '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': 'WETH',
  // Base
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 'USDC',
  '0x4200000000000000000000000000000000000006': 'WETH',
};

const CHAIN_NATIVE: Record<number, string> = {
  1: 'ETH', 137: 'POL', 42161: 'ETH', 10: 'ETH', 56: 'BNB', 43114: 'AVAX', 8453: 'ETH',
};

function getTokenSymbol(address: string, chainId: number): string {
  if (address.toLowerCase() === NATIVE_TOKEN.toLowerCase()) {
    return CHAIN_NATIVE[chainId] || 'ETH';
  }
  return TOKEN_SYMBOLS[address] || 'UNKNOWN';
}

function getDemoPrice(symbol: string): number {
  return DEMO_PRICES[symbol.toUpperCase()] || 1;
}

export interface SwapQuoteResult {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  priceImpact: string;
  route: string;
  tx?: {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
  };
}

export async function getSwapQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: number,
  userAddress?: string
): Promise<SwapQuoteResult> {
  // Try real 1inch API if key is available
  if (INCH_API_KEY) {
    try {
      return await get1inchQuote(chainId, fromToken, toToken, amount, slippage, userAddress);
    } catch (e: any) {
      console.warn('1inch API error, falling back to demo:', e.message);
    }
  }

  // Demo mode: simulate a quote
  return getDemoQuote(chainId, fromToken, toToken, amount, slippage, userAddress);
}

async function get1inchQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: number,
  userAddress?: string
): Promise<SwapQuoteResult> {
  const headers = { Authorization: `Bearer ${INCH_API_KEY}` };

  // Get quote first
  const quoteResp = await axios.get(`${INCH_API_BASE}/${chainId}/quote`, {
    headers,
    params: { src: fromToken, dst: toToken, amount },
  });

  const quoteData = quoteResp.data;

  let tx;
  if (userAddress) {
    // Get swap tx data
    const swapResp = await axios.get(`${INCH_API_BASE}/${chainId}/swap`, {
      headers,
      params: {
        src: fromToken,
        dst: toToken,
        amount,
        from: userAddress,
        slippage,
        disableEstimate: true,
      },
    });
    tx = {
      to: swapResp.data.tx.to,
      data: swapResp.data.tx.data,
      value: swapResp.data.tx.value,
      gasLimit: swapResp.data.tx.gas?.toString() || '300000',
    };
  }

  return {
    fromToken,
    toToken,
    fromAmount: amount,
    toAmount: quoteData.toAmount || quoteData.dstAmount,
    estimatedGas: quoteData.gas?.toString() || '~150,000',
    priceImpact: '0.3',
    route: quoteData.protocols?.[0]?.[0]?.[0]?.name || '1inch Aggregator',
    tx,
  };
}

function getDemoQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: number,
  userAddress?: string
): SwapQuoteResult {
  const fromSymbol = getTokenSymbol(fromToken, chainId);
  const toSymbol = getTokenSymbol(toToken, chainId);

  const fromPrice = getDemoPrice(fromSymbol);
  const toPrice = getDemoPrice(toSymbol);

  const fromAmountNum = parseFloat(amount);
  // Calculate expected output (with a small simulated fee)
  const fee = 0.003; // 0.3% DEX fee
  const fromValueUsd = (fromAmountNum / (10 ** 18)) * fromPrice; // rough estimate
  const toAmountNum = (fromValueUsd * (1 - fee)) / toPrice;

  // Determine decimals based on token
  const toDecimals = ['USDC', 'USDT'].includes(toSymbol) ? 6 : 18;
  const toAmountWei = BigInt(Math.floor(toAmountNum * (10 ** toDecimals)));

  const routerAddress = AGGREGATION_ROUTER[chainId] || AGGREGATION_ROUTER[1];

  // Build demo transaction data
  const tx = userAddress ? {
    to: routerAddress,
    data: '0x12aa3caf' + '0'.repeat(500), // Simulated swap calldata
    value: fromToken.toLowerCase() === NATIVE_TOKEN.toLowerCase() ? amount : '0',
    gasLimit: '250000',
  } : undefined;

  // DEX route name based on chain
  const routes: Record<number, string> = {
    1: 'Uniswap V3', 137: 'QuickSwap', 42161: 'Camelot',
    10: 'Velodrome', 56: 'PancakeSwap V3', 43114: 'TraderJoe', 8453: 'Aerodrome',
  };

  return {
    fromToken,
    toToken,
    fromAmount: amount,
    toAmount: toAmountWei.toString(),
    estimatedGas: chainId === 1 ? '~$4.50' : '~$0.15',
    priceImpact: (fee * 100 + Math.random() * 0.5).toFixed(2),
    route: routes[chainId] || '1inch Aggregator',
    tx,
  };
}

export function getSupportedChains(): number[] {
  return Object.keys(AGGREGATION_ROUTER).map(Number);
}
