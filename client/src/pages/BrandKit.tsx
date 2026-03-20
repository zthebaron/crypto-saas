import { Download, Copy, Check, Palette, Type, Layout, Image, Shield } from 'lucide-react';
import { useState } from 'react';
import { BlockViewLogo } from '../components/ui/BlockViewLogo';
import { Card } from '../components/ui/Card';

const BRAND_COLORS = [
  { name: 'Primary Dark', hex: '#111827', rgb: 'rgb(17, 24, 39)', usage: 'Main background' },
  { name: 'Surface', hex: '#1F2937', rgb: 'rgb(31, 41, 55)', usage: 'Cards, panels' },
  { name: 'Border', hex: '#374151', rgb: 'rgb(55, 65, 81)', usage: 'Borders, dividers' },
  { name: 'Indigo Primary', hex: '#6366F1', rgb: 'rgb(99, 102, 241)', usage: 'CTAs, active states' },
  { name: 'Indigo Light', hex: '#818CF8', rgb: 'rgb(129, 140, 248)', usage: 'Links, highlights' },
  { name: 'Indigo Dark', hex: '#4F46E5', rgb: 'rgb(79, 70, 229)', usage: 'Hover states' },
  { name: 'Silver', hex: '#C0C0C0', rgb: 'rgb(192, 192, 192)', usage: 'Logo shield gradient start' },
  { name: 'Light Silver', hex: '#E8E8E8', rgb: 'rgb(232, 232, 232)', usage: 'Logo shield gradient mid' },
  { name: 'Dark Silver', hex: '#808080', rgb: 'rgb(128, 128, 128)', usage: 'Logo shield gradient end' },
  { name: 'Emerald', hex: '#34D399', rgb: 'rgb(52, 211, 153)', usage: 'Positive / Buy signals' },
  { name: 'Red', hex: '#EF4444', rgb: 'rgb(239, 68, 68)', usage: 'Negative / Sell signals' },
  { name: 'Amber', hex: '#F59E0B', rgb: 'rgb(245, 158, 11)', usage: 'Warnings, MetaMask' },
  { name: 'Text Primary', hex: '#F3F4F6', rgb: 'rgb(243, 244, 246)', usage: 'Primary text' },
  { name: 'Text Secondary', hex: '#9CA3AF', rgb: 'rgb(156, 163, 175)', usage: 'Secondary text' },
  { name: 'Text Muted', hex: '#6B7280', rgb: 'rgb(107, 114, 128)', usage: 'Muted, captions' },
];

const TYPOGRAPHY = [
  { name: 'Heading 1', class: 'text-3xl font-bold text-white', sample: 'BlockView Dashboard', font: 'Inter Bold, 30px' },
  { name: 'Heading 2', class: 'text-xl font-bold text-white', sample: 'Market Analysis', font: 'Inter Bold, 20px' },
  { name: 'Heading 3', class: 'text-lg font-semibold text-white', sample: 'Agent Reports', font: 'Inter SemiBold, 18px' },
  { name: 'Body', class: 'text-sm text-gray-300', sample: 'The 5-agent AI pipeline processes market data in real time to deliver comprehensive analysis.', font: 'Inter Regular, 14px' },
  { name: 'Caption', class: 'text-xs text-gray-500', sample: 'Last updated 5 minutes ago', font: 'Inter Regular, 12px' },
  { name: 'Badge', class: 'text-[10px] uppercase tracking-wider font-semibold text-indigo-400', sample: 'MOST POPULAR', font: 'Inter SemiBold, 10px, Uppercase' },
  { name: 'Logo Text', class: 'text-2xl font-bold tracking-wider bg-gradient-to-r from-gray-100 via-gray-300 to-gray-400 bg-clip-text text-transparent', sample: 'BLOCKVIEW', font: 'Inter Bold, 24px, tracking: wider' },
];

const LOGO_DOWNLOADS = [
  { name: 'Full Logo (Transparent)', file: '/brand/blockview-logo-full.svg', desc: 'Logo + wordmark, transparent background' },
  { name: 'Full Logo (Dark BG)', file: '/brand/blockview-logo-full-dark.svg', desc: 'Logo + wordmark on dark background' },
  { name: 'Full Logo (Light BG)', file: '/brand/blockview-logo-full-light.svg', desc: 'Logo + wordmark on light background' },
  { name: 'Icon Only', file: '/brand/blockview-icon.svg', desc: 'Shield + B mark, for favicons & avatars' },
  { name: 'Wordmark Only', file: '/brand/blockview-wordmark.svg', desc: 'BLOCKVIEW text + tagline' },
];

export default function BrandKit() {
  const [copiedColor, setCopiedColor] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(id);
    setTimeout(() => setCopiedColor(''), 2000);
  };

  const handleDownload = (file: string, name: string) => {
    const a = document.createElement('a');
    a.href = file;
    a.download = name;
    a.click();
  };

  const handleDownloadAll = () => {
    LOGO_DOWNLOADS.forEach(({ file, name }) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = file;
        a.download = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() + '.svg';
        a.click();
      }, 100);
    });
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-3">
          <Palette className="text-indigo-400" />
          BlockView Brand Kit
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Official brand assets, color palette, typography, and usage guidelines for BlockView.
          Download logos and assets for presentations, marketing, and partnerships.
        </p>
      </div>

      {/* Logo Downloads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Image size={20} className="text-indigo-400" />
            Logo Assets
          </h2>
          <button
            onClick={handleDownloadAll}
            className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5"
          >
            <Download size={12} />
            Download All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LOGO_DOWNLOADS.map(({ name, file, desc }) => (
            <div key={name} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group">
              {/* Preview */}
              <div className={`h-32 flex items-center justify-center p-4 ${name.includes('Light') ? 'bg-white' : name.includes('Dark') ? 'bg-gray-950' : 'bg-[#0D1117]'}`}>
                <img src={file} alt={name} className="max-h-full max-w-full object-contain" />
              </div>
              {/* Info */}
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{name}</p>
                  <p className="text-[10px] text-gray-500">{desc}</p>
                </div>
                <button
                  onClick={() => handleDownload(file, name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() + '.svg')}
                  className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Download SVG"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logo Usage */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Shield size={20} className="text-indigo-400" />
          Logo Usage Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">✓ Do</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>• Use the full logo (icon + wordmark) whenever possible</li>
              <li>• Maintain minimum clear space equal to the icon height on all sides</li>
              <li>• Use the dark background version on dark surfaces</li>
              <li>• Use the light background version on white/light surfaces</li>
              <li>• Scale proportionally — never stretch or distort</li>
              <li>• Minimum size: 120px wide for full logo, 24px for icon only</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-400 mb-3">✗ Don't</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>• Don't change the logo colors or gradients</li>
              <li>• Don't rotate, skew, or add effects to the logo</li>
              <li>• Don't place the logo on busy backgrounds without contrast</li>
              <li>• Don't rearrange the icon and wordmark positions</li>
              <li>• Don't add drop shadows, outlines, or borders</li>
              <li>• Don't use the logo smaller than minimum size</li>
            </ul>
          </div>
        </div>

        {/* Live logo examples */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Live Logo Components</p>
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center">
              <BlockViewLogo size="lg" showText={true} showSubtext={true} />
              <p className="text-[10px] text-gray-600 mt-2">Large + Subtext</p>
            </div>
            <div className="text-center">
              <BlockViewLogo size="md" showText={true} />
              <p className="text-[10px] text-gray-600 mt-2">Medium</p>
            </div>
            <div className="text-center">
              <BlockViewLogo size="sm" showText={true} />
              <p className="text-[10px] text-gray-600 mt-2">Small</p>
            </div>
            <div className="text-center">
              <BlockViewLogo size="md" showText={false} />
              <p className="text-[10px] text-gray-600 mt-2">Icon Only</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Color Palette */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Palette size={20} className="text-indigo-400" />
          Color Palette
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {BRAND_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => copyToClipboard(color.hex, color.name)}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors text-left group"
            >
              <div className="h-16 w-full" style={{ backgroundColor: color.hex }} />
              <div className="p-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">{color.name}</p>
                  {copiedColor === color.name ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={10} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-mono">{color.hex}</p>
                <p className="text-[9px] text-gray-600">{color.usage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Type size={20} className="text-indigo-400" />
          Typography
        </h2>
        <Card>
          <div className="space-y-6">
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Primary Font Family</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter, Segoe UI, sans-serif' }}>
                Inter
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Weights used: Regular (400), Medium (500), SemiBold (600), Bold (700)
              </p>
              <p className="text-[10px] text-gray-600 mt-1">
                Fallbacks: Segoe UI → system-ui → sans-serif
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-800">
              {TYPOGRAPHY.map(({ name, class: cls, sample, font }) => (
                <div key={name} className="flex items-start gap-4">
                  <div className="w-24 flex-shrink-0">
                    <p className="text-xs font-semibold text-indigo-400">{name}</p>
                    <p className="text-[9px] text-gray-600 mt-0.5">{font}</p>
                  </div>
                  <div className="flex-1">
                    <p className={cls}>{sample}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* UI Components Preview */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Layout size={20} className="text-indigo-400" />
          UI Components
        </h2>
        <Card>
          <div className="space-y-6">
            {/* Buttons */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Buttons</p>
              <div className="flex flex-wrap items-center gap-3">
                <button className="btn-primary text-sm px-4 py-2">Primary Button</button>
                <button className="btn-secondary text-sm px-4 py-2">Secondary Button</button>
                <button className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">Enterprise</button>
                <button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-lg px-4 py-2">Connect Wallet</button>
                <button className="text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">Ghost Button</button>
              </div>
            </div>

            {/* Badges */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Signal Badges</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">BUY</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">SELL</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">HOLD</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">85% Confidence</span>
                <span className="text-[10px] bg-indigo-600 text-white px-3 py-0.5 rounded-full font-semibold">Most Popular</span>
              </div>
            </div>

            {/* Cards */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Card Styles</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-xs font-medium text-white">Default Card</p>
                  <p className="text-[10px] text-gray-500 mt-1">border-gray-800, rounded-xl</p>
                </div>
                <div className="bg-gray-900 border border-indigo-500/30 rounded-xl p-4 ring-2 ring-indigo-500/20">
                  <p className="text-xs font-medium text-white">Highlighted Card</p>
                  <p className="text-[10px] text-gray-500 mt-1">border-indigo-500/30, ring</p>
                </div>
                <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-4">
                  <p className="text-xs font-medium text-white">Active Card</p>
                  <p className="text-[10px] text-gray-500 mt-1">bg-indigo-600/10</p>
                </div>
              </div>
            </div>

            {/* Spacing & Radius */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Design Tokens</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-gray-400 font-medium">Border Radius</p>
                  <p className="text-gray-600 text-[10px]">Buttons: 8px (rounded-lg)</p>
                  <p className="text-gray-600 text-[10px]">Cards: 12px (rounded-xl)</p>
                  <p className="text-gray-600 text-[10px]">Modals: 16px (rounded-2xl)</p>
                  <p className="text-gray-600 text-[10px]">Badges: 4px (rounded)</p>
                  <p className="text-gray-600 text-[10px]">Pills: 9999px (rounded-full)</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Spacing Scale</p>
                  <p className="text-gray-600 text-[10px]">xs: 4px (gap-1)</p>
                  <p className="text-gray-600 text-[10px]">sm: 8px (gap-2)</p>
                  <p className="text-gray-600 text-[10px]">md: 16px (gap-4)</p>
                  <p className="text-gray-600 text-[10px]">lg: 24px (gap-6)</p>
                  <p className="text-gray-600 text-[10px]">xl: 32px (gap-8)</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Shadows</p>
                  <p className="text-gray-600 text-[10px]">Dropdowns: shadow-xl shadow-black/30</p>
                  <p className="text-gray-600 text-[10px]">Modals: shadow-2xl shadow-black/40</p>
                  <p className="text-gray-600 text-[10px]">Cards: none (border only)</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Animations</p>
                  <p className="text-gray-600 text-[10px]">Transitions: 150ms ease</p>
                  <p className="text-gray-600 text-[10px]">Hover: color + bg shift</p>
                  <p className="text-gray-600 text-[10px]">Loading: animate-spin</p>
                  <p className="text-gray-600 text-[10px]">Pulse: animate-pulse</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Brand Voice */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Brand Voice & Messaging</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="text-xs text-indigo-400 uppercase tracking-wider font-semibold mb-2">Tagline</h3>
            <p className="text-white font-medium">"Crypto Insights & Analysis"</p>
            <h3 className="text-xs text-indigo-400 uppercase tracking-wider font-semibold mt-4 mb-2">Tone</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Professional yet approachable</li>
              <li>• Data-driven, never speculative</li>
              <li>• Empowering — "research, not financial advice"</li>
              <li>• Technical accuracy with plain-language explanations</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs text-indigo-400 uppercase tracking-wider font-semibold mb-2">Key Messages</h3>
            <ul className="text-xs text-gray-400 space-y-2">
              <li><span className="text-white font-medium">AI-First:</span> "5 specialized AI agents analyze markets so you don't have to."</li>
              <li><span className="text-white font-medium">Non-Custodial:</span> "Your keys, your coins. We never touch your funds."</li>
              <li><span className="text-white font-medium">Transparent:</span> "Every signal is tracked. Our accuracy is public."</li>
              <li><span className="text-white font-medium">Multi-Chain:</span> "Trade across 7 blockchains from one dashboard."</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
