import { useState, useEffect } from 'react';
import { useAccount, useBalance, useSwitchChain, useReadContract, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, erc20Abi, type Address } from 'viem';
import { ArrowDownUp, Zap, Shield, AlertTriangle, Check, Clock, ExternalLink, Settings2, Loader2, Wallet } from 'lucide-react';
import { CHAIN_META, COMMON_TOKENS, SUPPORTED_CHAINS } from '../config/wagmi';

const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? '/api' : 'https://crypto-saasserver-production.up.railway.app/api');

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo: string;
}

interface SwapQuote {
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

const SLIPPAGE_OPTIONS = [0.5, 1, 2, 5];

export default function Trade() {
  const { address, isConnected, chain } = useAccount();
  const { data: nativeBalance } = useBalance({ address });
  const { switchChain } = useSwitchChain();
  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const [selectedChain, setSelectedChain] = useState(1);
  const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'swapping' | 'confirmed' | 'error'>('idle');

  // Token balance for selected from token
  const { data: tokenBalance } = useReadContract({
    address: fromToken?.address as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const chainTokens = COMMON_TOKENS[selectedChain] || [];
  const chainMeta = CHAIN_META[selectedChain];

  useEffect(() => {
    if (chainTokens.length > 0 && !fromToken) {
      setFromToken(chainTokens[0]); // Default to USDC
    }
    if (chainTokens.length > 1 && !toToken) {
      // Default to WETH
      const weth = chainTokens.find(t => t.symbol === 'WETH');
      setToToken(weth || chainTokens[1]);
    }
  }, [selectedChain]);

  // Fetch quote when inputs change
  useEffect(() => {
    if (!fromToken || !toToken || !amount || parseFloat(amount) <= 0) {
      setQuote(null);
      return;
    }

    const timer = setTimeout(async () => {
      setQuoteLoading(true);
      setQuoteError('');
      try {
        const fromAmount = parseUnits(amount, fromToken.decimals).toString();
        const resp = await fetch(`${API_BASE}/trade/quote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            chainId: selectedChain,
            fromToken: fromToken.address,
            toToken: toToken.address,
            amount: fromAmount,
            slippage,
            userAddress: address,
          }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Failed to get quote');
        setQuote(data);
      } catch (e: any) {
        setQuoteError(e.message);
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fromToken, toToken, amount, selectedChain, slippage, address]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setAmount('');
    setQuote(null);
  };

  const handleExecuteSwap = async () => {
    if (!quote?.tx || !address) return;
    try {
      setTxStatus('swapping');
      sendTransaction({
        to: quote.tx.to as Address,
        data: quote.tx.data as `0x${string}`,
        value: BigInt(quote.tx.value || '0'),
      });
    } catch (e) {
      setTxStatus('error');
    }
  };

  useEffect(() => {
    if (isConfirmed) setTxStatus('confirmed');
  }, [isConfirmed]);

  const handleSetMax = () => {
    if (fromToken && tokenBalance) {
      setAmount(formatUnits(tokenBalance as bigint, fromToken.decimals));
    } else if (!fromToken && nativeBalance) {
      // Leave some for gas
      const max = parseFloat(nativeBalance.formatted) - 0.01;
      setAmount(Math.max(0, max).toString());
    }
  };

  const TokenSelector = ({
    selected,
    onSelect,
    show,
    setShow,
    label,
  }: {
    selected: TokenInfo | null;
    onSelect: (t: TokenInfo) => void;
    show: boolean;
    setShow: (v: boolean) => void;
    label: string;
  }) => (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-3 py-2 transition-colors min-w-[140px]"
      >
        {selected ? (
          <>
            <img src={selected.logo} alt="" className="w-5 h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-sm font-semibold text-white">{selected.symbol}</span>
          </>
        ) : (
          <span className="text-sm text-gray-400">Select {label}</span>
        )}
        <ChevronDown size={14} className="text-gray-400 ml-auto" />
      </button>
      {show && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
          <div className="p-2 border-b border-gray-800">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
          </div>
          {/* Native token */}
          <button
            onClick={() => {
              onSelect({
                address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                symbol: chainMeta?.symbol || 'ETH',
                name: 'Native ' + (chainMeta?.symbol || 'ETH'),
                decimals: 18,
                logo: chainMeta?.logo || '',
              });
              setShow(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <img src={chainMeta?.logo} alt="" className="w-5 h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="text-left">
              <div className="font-medium">{chainMeta?.symbol}</div>
              <div className="text-[10px] text-gray-500">Native Token</div>
            </div>
          </button>
          {chainTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => { onSelect(token); setShow(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                selected?.address === token.address
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <img src={token.logo} alt="" className="w-5 h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="text-left">
                <div className="font-medium">{token.symbol}</div>
                <div className="text-[10px] text-gray-500">{token.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Import ChevronDown used by TokenSelector
  const ChevronDown = ({ size, className }: { size: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-amber-400" size={24} />
            Trade
          </h1>
          <p className="text-sm text-gray-400 mt-1">Execute AI-recommended trades via MetaMask</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          <Settings2 size={18} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300 font-medium">Slippage Tolerance</span>
            <Shield size={14} className="text-gray-500" />
          </div>
          <div className="flex gap-2">
            {SLIPPAGE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  slippage === s
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chain Selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {SUPPORTED_CHAINS.map((c) => {
          const meta = CHAIN_META[c.id];
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedChain(c.id);
                if (isConnected && chain?.id !== c.id) {
                  switchChain({ chainId: c.id });
                }
                setFromToken(null);
                setToToken(null);
                setQuote(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedChain === c.id
                  ? 'bg-gray-700 text-white border border-gray-600'
                  : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 border border-transparent hover:border-gray-700'
              }`}
            >
              <img src={meta.logo} alt="" className="w-4 h-4" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              {meta.name}
            </button>
          );
        })}
      </div>

      {/* Swap Card */}
      <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl overflow-hidden">
        {/* From */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">You Pay</span>
            {fromToken && tokenBalance && (
              <button onClick={handleSetMax} className="text-[10px] text-indigo-400 hover:text-indigo-300">
                Balance: {formatUnits(tokenBalance as bigint, fromToken.decimals).slice(0, 10)} (Max)
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-bold text-white outline-none placeholder-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <TokenSelector
              selected={fromToken}
              onSelect={setFromToken}
              show={showFromTokens}
              setShow={setShowFromTokens}
              label="From"
            />
          </div>
        </div>

        {/* Swap direction button */}
        <div className="relative h-0 flex items-center justify-center z-10">
          <button
            onClick={handleSwapTokens}
            className="absolute w-10 h-10 bg-gray-800 border-4 border-gray-900 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all hover:rotate-180 duration-300"
          >
            <ArrowDownUp size={16} />
          </button>
        </div>

        {/* To */}
        <div className="p-4 bg-gray-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">You Receive</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-bold text-white">
              {quoteLoading ? (
                <Loader2 size={20} className="animate-spin text-gray-500" />
              ) : quote ? (
                formatUnits(BigInt(quote.toAmount), toToken?.decimals || 18).slice(0, 12)
              ) : (
                <span className="text-gray-600">0.0</span>
              )}
            </div>
            <TokenSelector
              selected={toToken}
              onSelect={setToToken}
              show={showToTokens}
              setShow={setShowToTokens}
              label="To"
            />
          </div>
        </div>

        {/* Quote details */}
        {quote && (
          <div className="px-4 py-3 border-t border-gray-800 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Route</span>
              <span className="text-gray-300">{quote.route}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Price Impact</span>
              <span className={parseFloat(quote.priceImpact) > 3 ? 'text-red-400' : 'text-gray-300'}>
                {quote.priceImpact}%
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Estimated Gas</span>
              <span className="text-gray-300">{quote.estimatedGas}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Slippage Tolerance</span>
              <span className="text-gray-300">{slippage}%</span>
            </div>
          </div>
        )}

        {/* Warning */}
        {quote && parseFloat(quote.priceImpact) > 5 && (
          <div className="mx-4 mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <AlertTriangle size={14} />
            High price impact! Consider reducing the trade size.
          </div>
        )}

        {/* Error */}
        {quoteError && (
          <div className="mx-4 mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <AlertTriangle size={14} />
            {quoteError}
          </div>
        )}

        {/* Execute button */}
        <div className="p-4">
          {!isConnected ? (
            <div className="w-full py-3 bg-gray-800 rounded-xl text-center text-sm text-gray-400 flex items-center justify-center gap-2">
              <Wallet size={16} />
              Connect wallet to trade
            </div>
          ) : txStatus === 'confirmed' ? (
            <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-sm text-emerald-400 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Check size={16} />
                Trade Confirmed!
              </div>
              {txHash && (
                <a
                  href={`${chainMeta?.explorerUrl}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                >
                  View on Explorer <ExternalLink size={10} />
                </a>
              )}
              <button
                onClick={() => { setTxStatus('idle'); setQuote(null); setAmount(''); }}
                className="text-xs text-gray-400 hover:text-white mt-1"
              >
                New Trade
              </button>
            </div>
          ) : (
            <button
              onClick={handleExecuteSwap}
              disabled={!quote?.tx || isSending || isConfirming || quoteLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending || isConfirming ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isSending ? 'Confirm in MetaMask...' : 'Waiting for confirmation...'}
                </>
              ) : (
                <>
                  <Zap size={16} />
                  {quote ? 'Execute Swap' : amount ? 'Getting Quote...' : 'Enter Amount'}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Transaction history link */}
      {isConnected && (
        <div className="mt-4 text-center">
          <a
            href={`${chainMeta?.explorerUrl}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1"
          >
            <Clock size={12} />
            View Transaction History on Explorer
            <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* AI Recommended Trades */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Zap size={14} className="text-amber-400" />
          AI-Recommended Trades
        </h3>
        <div className="space-y-2">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">BUY</span>
                <span className="text-sm font-medium text-white">ETH</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Opportunity Scout • 85% confidence</p>
            </div>
            <button
              onClick={() => {
                const weth = chainTokens.find(t => t.symbol === 'WETH');
                const usdc = chainTokens.find(t => t.symbol === 'USDC');
                if (usdc) setFromToken(usdc);
                if (weth) setToToken(weth);
                setAmount('100');
              }}
              className="text-xs bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Quick Trade
            </button>
          </div>
          <p className="text-xs text-gray-600 text-center">Run agents to get fresh trading signals</p>
        </div>
      </div>
    </div>
  );
}
