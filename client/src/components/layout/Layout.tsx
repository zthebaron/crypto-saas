import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from '../chat/ChatWidget';

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/market': 'Market Data',
  '/agents': 'Agent Reports',
  '/signals': 'Signals',
  '/portfolio': 'Portfolio',
  '/compare': 'Compare',
  '/knowledge': 'Knowledge Base',
  '/rules': 'Alert Rules',
  '/accuracy': 'Signal Accuracy',
  '/watchlist': 'Watchlist',
  '/news': 'News',
  '/pricing': 'Pricing',
  '/about': 'About Us',
  '/terms': 'Terms of Service',
  '/privacy': 'Privacy Policy',
  '/usage-policy': 'Usage Policy',
  '/settings': 'Settings',
};

export function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'BlockView';

  return (
    <div className="min-h-screen bg-crypto-dark">
      <Sidebar />
      <div className="ml-64">
        <Header title={title} />
        <main className="p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ChatWidget />
    </div>
  );
}
