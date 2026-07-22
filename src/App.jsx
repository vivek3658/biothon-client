import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { Activity } from 'lucide-react';

const HEALTH_ENDPOINT = "/api/health";
const POLL_INTERVAL = 60_000; // 1 minute

const MainApp = () => {
  const { user, loading } = useAuth();

  // Background health check polling to keep backend active on Render
  useEffect(() => {
    let timeoutId;
    async function pollHealth() {
      try {
        await fetch(HEALTH_ENDPOINT, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });
      } catch (err) {
        console.error("Health check failed:", err);
      } finally {
        timeoutId = setTimeout(pollHealth, POLL_INTERVAL);
      }
    }

    pollHealth();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (loading) {
    return (
      <div 
        role="status" 
        aria-live="polite"
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-main)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-main)',
          gap: '16px',
          padding: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0284c7' }}>
          <Activity size={32} className="spin" aria-hidden="true" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.25px' }}>
            Loading ArogyaX Portal...
          </span>
        </div>
      </div>
    );
  }

  return user ? <DashboardPage /> : <LoginPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

