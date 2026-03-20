import { createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism, bsc, avalanche, base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const SUPPORTED_CHAINS = [mainnet, polygon, arbitrum, optimism, bsc, avalanche, base] as const;

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [
    injected(), // MetaMask and other injected wallets
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
    [base.id]: http(),
  },
});

// Chain metadata for UI
export const CHAIN_META: Record<number, { name: string; logo: string; color: string; symbol: string; explorerUrl: string }> = {
  [mainnet.id]: {
    name: 'Ethereum',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    color: '#627EEA',
    symbol: 'ETH',
    explorerUrl: 'https://etherscan.io',
  },
  [polygon.id]: {
    name: 'Polygon',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
    color: '#8247E5',
    symbol: 'POL',
    explorerUrl: 'https://polygonscan.com',
  },
  [arbitrum.id]: {
    name: 'Arbitrum',
    logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
    color: '#28A0F0',
    symbol: 'ETH',
    explorerUrl: 'https://arbiscan.io',
  },
  [optimism.id]: {
    name: 'Optimism',
    logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg',
    color: '#FF0420',
    symbol: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io',
  },
  [bsc.id]: {
    name: 'BNB Chain',
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    color: '#F3BA2F',
    symbol: 'BNB',
    explorerUrl: 'https://bscscan.com',
  },
  [avalanche.id]: {
    name: 'Avalanche',
    logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg',
    color: '#E84142',
    symbol: 'AVAX',
    explorerUrl: 'https://snowtrace.io',
  },
  [base.id]: {
    name: 'Base',
    logo: 'https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg',
    color: '#0052FF',
    symbol: 'ETH',
    explorerUrl: 'https://basescan.org',
  },
};

// Common ERC-20 tokens per chain
export const COMMON_TOKENS: Record<number, Array<{ address: string; symbol: string; name: string; decimals: number; logo: string }>> = {
  [mainnet.id]: [
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg' },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', decimals: 6, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg' },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai', decimals: 18, logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg' },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg' },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg' },
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', decimals: 18, logo: 'https://cryptologos.cc/logos/chainlink-link-logo.svg' },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.svg' },
  ],
  [polygon.id]: [
    { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', symbol: 'USDC', name: 'USD Coin', decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg' },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether', decimals: 6, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg' },
    { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg' },
  ],
  [arbitrum.id]: [
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', name: 'USD Coin', decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg' },
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', name: 'Tether', decimals: 6, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg' },
    { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg' },
  ],
  [base.id]: [
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', name: 'USD Coin', decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg' },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg' },
  ],
};
