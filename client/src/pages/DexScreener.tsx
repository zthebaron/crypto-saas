export default function DexScreener() {
  return (
    <div className="-m-4 md:-m-6">
      <iframe
        src="https://dexscreener.com/"
        title="DEX Screener"
        className="w-full border-0"
        style={{ height: 'calc(100vh - 4rem)' }}
        allow="clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}
