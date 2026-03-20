import { useState, useRef, useEffect } from 'react';
import { useAccount, useBalance, useDisconnect, useConnect, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Check, AlertCircle } from 'lucide-react';
import { CHAIN_META, SUPPORTED_CHAINS } from '../../config/wagmi';

function shortenAddress(addr: string): string {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function formatBalance(value: string | undefined, decimals: number = 4): string {
  if (!value) return '0.00';
  const n = parseFloat(value);
  if (n === 0) return '0.00';
  if (n < 0.0001) return '<0.0001';
  return n.toFixed(decimals);
}

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const [showPanel, setShowPanel] = useState(false);
  const [showChainPicker, setShowChainPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
        setShowChainPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const chainMeta = chain ? CHAIN_META[chain.id] : null;

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => connect({ connector: injected() })}
          disabled={isConnecting}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
        >
          <Wallet size={14} />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {connectError && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-red-900/90 border border-red-700 rounded-lg p-3 z-50 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{connectError.message.includes('rejected') ? 'Connection rejected by user' : 'MetaMask not found. Please install it.'}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Connected button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
      >
        {/* Chain indicator */}
        {chainMeta && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: chainMeta.color + '20', color: chainMeta.color }}
          >
            <img
              src={chainMeta.logo}
              alt={chainMeta.name}
              className="w-3.5 h-3.5"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        {/* Balance */}
        <span className="text-sm text-gray-200 font-medium">
          {formatBalance(balance?.formatted)} {balance?.symbol}
        </span>
        {/* Address */}
        <span className="text-sm text-gray-400 bg-gray-900 px-2 py-0.5 rounded-md">
          {shortenAddress(address!)}
        </span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${showPanel ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Connected Wallet</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-400">Connected</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Wallet size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-200 font-mono">
                  {shortenAddress(address!)}
                </div>
                <div className="text-lg font-bold text-white">
                  {formatBalance(balance?.formatted)} {balance?.symbol}
                </div>
              </div>
            </div>
            {/* Quick actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 py-2 rounded-lg transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy Address'}
              </button>
              <a
                href={chainMeta ? `${chainMeta.explorerUrl}/address/${address}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 py-2 rounded-lg transition-colors"
              >
                <ExternalLink size={12} />
                Explorer
              </a>
            </div>
          </div>

          {/* Chain Switcher */}
          <div className="p-3 border-b border-gray-800">
            <button
              onClick={() => setShowChainPicker(!showChainPicker)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                {chainMeta && (
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: chainMeta.color + '20' }}>
                    <img src={chainMeta.logo} alt="" className="w-5 h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
                <span className="text-sm text-gray-200">{chainMeta?.name || chain?.name || 'Unknown'}</span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${showChainPicker ? 'rotate-180' : ''}`} />
            </button>

            {showChainPicker && (
              <div className="mt-2 space-y-1">
                {SUPPORTED_CHAINS.map((c) => {
                  const meta = CHAIN_META[c.id];
                  const isActive = chain?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        switchChain({ chainId: c.id });
                        setShowChainPicker(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: meta.color + '15' }}>
                        <img src={meta.logo} alt="" className="w-3.5 h-3.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <span className="flex-1 text-left">{meta.name}</span>
                      {isActive && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">Active</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Disconnect */}
          <div className="p-3">
            <button
              onClick={() => { disconnect(); setShowPanel(false); }}
              className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
