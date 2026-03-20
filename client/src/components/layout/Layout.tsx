import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from '../chat/ChatWidget';
import { useSidebarStore } from '../../store/sidebarStore';

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
  '/integrations': 'Integrations',
  '/trade': 'Trade',
  '/brand': 'Brand Kit',
  '/admin': 'Admin Dashboard',
  '/settings': 'Settings',
};

export function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'BlockView';
  const collapsed = useSidebarStore((s) => s.collapsed);

  // Desktop: margin matches sidebar width. Mobile: no margin (sidebar is overlay)
  const marginClass = collapsed ? 'lg:ml-[72px]' : 'lg:ml-64';

  return (
    <div className="min-h-screen bg-crypto-dark">
      <Sidebar />
      <div className={`ml-0 ${marginClass} transition-all duration-200`}>
        <Header title={title} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ChatWidget />
    </div>
  );
}
