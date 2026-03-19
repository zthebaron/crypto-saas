import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/market': 'Market Data',
  '/agents': 'Agent Reports',
  '/signals': 'Signals',
  '/watchlist': 'Watchlist',
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
    </div>
  );
}
