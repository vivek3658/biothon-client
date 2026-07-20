import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UserCheck, LogOut, RefreshCw, Activity, Building2 } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export const Navbar = ({ activeTab, onRefresh, isRefreshing }) => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '12px 28px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1440px',
        margin: '0 auto'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <img 
              src={logoImg} 
              alt="ArogyaX Logo" 
              style={{
                height: '42px',
                objectFit: 'contain'
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontWeight: 800,
                  fontSize: '1.35rem',
                  color: '#0284c7',
                  letterSpacing: '-0.5px'
                }}>
                  Arogya<span style={{ color: '#ea580c' }}>X</span>
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  fontWeight: 800,
                  letterSpacing: '0.5px'
                }}>
                  PORTAL
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                One QR, One Health Identity.
              </p>
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-color)' }} />

          {/* System Health Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            fontSize: '0.75rem',
            color: '#047857',
            fontWeight: 600
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 6px #10b981',
              animation: 'pulse 2s infinite'
            }} />
            <Activity size={13} />
            <span>API Operational</span>
          </div>
        </div>

        {/* User Actions & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="btn-secondary"
              title="Refresh Portal Data"
              disabled={isRefreshing}
              style={{ padding: '7px 12px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
              <span>Sync</span>
            </button>
          )}

          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '5px 12px',
              borderRadius: '30px',
              background: '#f8fafc',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: user.role === 'admin' 
                  ? 'linear-gradient(135deg, #0284c7, #0369a1)' 
                  : 'linear-gradient(135deg, #059669, #047857)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    {user.username}
                  </span>
                  <span className={user.role === 'admin' ? 'badge badge-admin' : 'badge badge-manager'}>
                    {user.role === 'admin' ? <Shield size={10} /> : <UserCheck size={10} />}
                    {user.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={logout} 
            className="btn-danger"
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
