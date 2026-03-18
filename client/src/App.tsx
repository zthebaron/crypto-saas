import { useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { useAuthStore } from './store/authStore';
import { useAgentStore } from './store/agentStore';
import { wsClient } from './services/websocket';
import { useWebSocket } from './hooks/useWebSocket';

import Overview from './pages/Overview';
import MarketData from './pages/MarketData';
import AgentReports from './pages/AgentReports';
import Signals from './pages/Signals';
import Watchlist from './pages/Watchlist';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function AppInner() {
  const { updateAgentStatus, setPipelineRunning, fetchTopSignals, fetchRuns } = useAgentStore();

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
  }, []);

  useWebSocket('agent_status', handleAgentStatus);
  useWebSocket('report_complete', handleReportComplete);
  useWebSocket('pipeline_complete', handlePipelineComplete);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/market" element={<MarketData />} />
        <Route path="/agents" element={<AgentReports />} />
        <Route path="/signals" element={<Signals />} />
        <Route path="/watchlist" element={<Watchlist />} />
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
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
