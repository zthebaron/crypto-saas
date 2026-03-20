import { useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { useAuthStore } from './store/authStore';
import { useAgentStore } from './store/agentStore';
import { useNotificationStore } from './store/notificationStore';
import { wsClient } from './services/websocket';
import { useWebSocket } from './hooks/useWebSocket';
import { wagmiConfig } from './config/wagmi';

import Overview from './pages/Overview';
import MarketData from './pages/MarketData';
import AgentReports from './pages/AgentReports';
import Signals from './pages/Signals';
import Watchlist from './pages/Watchlist';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Portfolio from './pages/Portfolio';
import Compare from './pages/Compare';
import KnowledgeBase from './pages/KnowledgeBase';
import AlertRules from './pages/AlertRules';
import Accuracy from './pages/Accuracy';
import Pricing from './pages/Pricing';
import About from './pages/About';
import News from './pages/News';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import UsagePolicy from './pages/UsagePolicy';
import Integrations from './pages/Integrations';
import Trade from './pages/Trade';
import BrandKit from './pages/BrandKit';
import AdminDashboard from './pages/admin/AdminDashboard';

const queryClient = new QueryClient();

function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppInner() {
  const { updateAgentStatus, setPipelineRunning, fetchTopSignals, fetchRuns } = useAgentStore();
  const { fetch: fetchNotifications } = useNotificationStore();

  const handleAgentStatus = useCallback((payload: any) => {
    updateAgentStatus(payload.role, payload.status);
    if (payload.status === 'running') setPipelineRunning(true);
  }, []);

  const handleReportComplete = useCallback((payload: any) => {
    updateAgentStatus(payload.role, 'completed');
  }, []);

  const handlePipelineComplete = useCallback((_payload: any) => {
    setPipelineRunning(false);
    fetchTopSignals();
    fetchRuns();
    fetchNotifications();
  }, []);

  const handleNotification = useCallback((payload: any) => {
    useNotificationStore.getState().addNotification(payload);
  }, []);

  useWebSocket('agent_status', handleAgentStatus);
  useWebSocket('report_complete', handleReportComplete);
  useWebSocket('pipeline_complete', handlePipelineComplete);
  useWebSocket('notification', handleNotification);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/market" element={<MarketData />} />
        <Route path="/agents" element={<AgentReports />} />
        <Route path="/signals" element={<Signals />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/rules" element={<AlertRules />} />
        <Route path="/accuracy" element={<Accuracy />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/news" element={<News />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/usage-policy" element={<UsagePolicy />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/brand" element={<BrandKit />} />
        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
    wsClient.connect();
    return () => wsClient.disconnect();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
