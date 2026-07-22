import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UserCheck, LogOut, RefreshCw, Activity } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export const Navbar = ({ activeTab, onRefresh, isRefreshing }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs py-3">
      <div className="responsive-container flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Header */}
        <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="ArogyaX Logo" 
              className="h-9 sm:h-10 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl text-sky-600 tracking-tight">
                  Arogya<span className="text-orange-600">X</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 font-black tracking-wider">
                  PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                One QR, One Health Identity.
              </p>
            </div>
          </div>

          <div className="hidden md:block w-px h-7 bg-slate-200" />

          {/* System Health Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
            <Activity size={13} aria-hidden="true" />
            <span>API Operational</span>
          </div>
        </div>

        {/* User Actions & Logout */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="btn-secondary !py-2 !px-3.5 !min-h-[38px] text-xs font-bold"
              title="Refresh Portal Data"
              aria-label="Refresh Portal Data"
              disabled={isRefreshing}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} aria-hidden="true" />
              <span>Sync</span>
            </button>
          )}

          {user && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs">
              <div className={`w-7 h-7 rounded-full text-white font-black text-xs flex items-center justify-center ${user.role === 'admin' ? 'bg-gradient-to-r from-sky-600 to-blue-700' : 'bg-gradient-to-r from-emerald-600 to-teal-700'}`}>
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>

              <div className="text-left hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-xs">
                    {user.username}
                  </span>
                  <span className={user.role === 'admin' ? 'badge badge-admin' : 'badge badge-manager'}>
                    {user.role === 'admin' ? <Shield size={10} aria-hidden="true" /> : <UserCheck size={10} aria-hidden="true" />}
                    {user.role?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={logout} 
            className="btn-danger !py-2 !px-3.5 !min-h-[38px] text-xs font-bold"
            aria-label="Sign out of your account"
          >
            <LogOut size={14} aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

