import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AdminManagerCrud } from '../components/AdminManagerCrud';
import { AdminMedicineCrud } from '../components/AdminMedicineCrud';
import { AdminMedicineCatalogPage } from './AdminMedicineCatalogPage';
import { ManagerApproval } from '../components/ManagerApproval';
import { OrganizationList } from '../components/OrganizationList';
import { UserDashboard } from '../components/UserDashboard';
import { OrgDashboard } from '../components/OrgDashboard';
import { 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  Pill
} from 'lucide-react';

import { ReceptionDashboard } from './dashboards/ReceptionDashboard';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Strict role classification
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager' || user?.entityModel === 'Employee';
  const isReceptionist = user?.role === 'receptionist';
  const isOrgRole = !isAdminOrManager && !isReceptionist && (user?.entityModel === 'Organization' || ['hospital', 'clinic', 'laboratory', 'pharmacy', 'other'].includes(user?.role));
  const isUserRole = !isAdminOrManager && !isOrgRole && !isReceptionist && (user?.entityModel === 'User' || user?.role === 'patient' || user?.role === 'doctor');

  const [stats, setStats] = useState({
    managersCount: 0,
    pendingOrgsCount: 0,
    totalOrgsCount: 0,
    approvedOrgsCount: 0,
    medicinesCount: 0
  });

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      if (!isAdminOrManager) return;

      let mCount = 0;
      if (user?.role === 'admin') {
        try {
          const { data: dataM } = await apiClient.get('/admin/managers?page=1');
          mCount = dataM.pagination?.totalItems || (dataM.data ? dataM.data.length : 0);
        } catch (e) {}
      }

      let pCount = 0;
      try {
        const { data: dataP } = await apiClient.get('/manager/organizations/pending');
        pCount = dataP.count || 0;
      } catch (e) {}

      let tCount = 0;
      let aCount = 0;
      try {
        const { data: dataA } = await apiClient.get('/manager/organizations');
        const orgs = dataA.organizations || [];
        tCount = orgs.length;
        aCount = orgs.filter(o => o.verificationStatus === 'approved').length;
      } catch (e) {}

      let medCount = 0;
      try {
        const { data: dataMed } = await apiClient.get('/medicines?limit=1');
        medCount = dataMed.pagination?.totalItems || (dataMed.data ? dataMed.data.length : 0);
      } catch (e) {}

      setStats({
        managersCount: mCount,
        pendingOrgsCount: pCount,
        totalOrgsCount: tCount,
        approvedOrgsCount: aCount,
        medicinesCount: medCount
      });
    } catch (err) {
      console.error('Failed to load portal metrics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.role]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <div className="bg-ambient-pattern" />
      <div className="bg-ambient-glow-1" />
      <div className="bg-ambient-glow-2" />

      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        onRefresh={fetchStats} 
        isRefreshing={isRefreshing} 
      />

      {/* Main Layout */}
      <div className="flex flex-1 relative z-10 w-full">
        {!isUserRole && !isOrgRole && (
          <Sidebar 
            role={user?.role || 'manager'} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        )}

        {/* Content Body */}
        <main className="flex-1 responsive-container py-6 sm:py-8 space-y-6">
          {/* 1. RECEPTIONIST DASHBOARD */}
          {isReceptionist ? (
            <ReceptionDashboard user={user} />
          ) : isOrgRole ? (
            /* 2. HOSPITAL / CLINIC / ORGANIZATION DASHBOARD */
            <OrgDashboard />
          ) : isUserRole ? (
            /* 3. PATIENT & DOCTOR DASHBOARD */
            <UserDashboard />
          ) : (
            /* 3. ADMIN & MANAGER DASHBOARD */
            <>
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
                      Welcome back, {user?.username}! 👋
                    </h1>
                    <p className="text-sm font-semibold text-slate-500">
                      ArogyaX Operational Dashboard • Role: <strong className="text-sky-600">{user?.role?.toUpperCase()}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {user?.role === 'admin' && (
                      <div className="white-card p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Active Managers
                          </span>
                          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
                            <Users size={20} aria-hidden="true" />
                          </div>
                        </div>
                        <div className="text-3xl font-black text-slate-900">
                          {stats.managersCount}
                        </div>
                      </div>
                    )}

                    <div className="white-card p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Medicine Catalog
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
                          <Pill size={20} aria-hidden="true" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-slate-900">
                        {stats.medicinesCount}
                      </div>
                    </div>

                    <div className="white-card p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Pending Approvals
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                          <Clock size={20} aria-hidden="true" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-slate-900">
                        {stats.pendingOrgsCount}
                      </div>
                    </div>

                    <div className="white-card p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Verified Entities
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <CheckCircle2 size={20} aria-hidden="true" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-slate-900">
                        {stats.approvedOrgsCount} / {stats.totalOrgsCount}
                      </div>
                    </div>
                  </div>

                  <div className="white-panel p-6 sm:p-8 space-y-4">
                    <h3 className="text-lg font-black text-slate-900">Quick Workspace Actions</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button onClick={() => setActiveTab('medicines')} className="btn-primary">
                        <Pill size={16} aria-hidden="true" />
                        <span>Manage Medicine Catalog ({stats.medicinesCount})</span>
                      </button>
                      {user?.role === 'admin' && (
                        <button onClick={() => setActiveTab('managers')} className="btn-secondary">
                          <Users size={16} aria-hidden="true" />
                          <span>Manage Manager Accounts</span>
                        </button>
                      )}
                      <button onClick={() => setActiveTab('pending')} className="btn-success">
                        <Clock size={16} aria-hidden="true" />
                        <span>Review Pending Verifications ({stats.pendingOrgsCount})</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'medicines' && <AdminMedicineCatalogPage />}
              {activeTab === 'managers' && user?.role === 'admin' && <AdminManagerCrud />}
              {activeTab === 'pending' && <ManagerApproval />}
              {activeTab === 'organizations' && <OrganizationList />}
              {(activeTab === 'audit' || activeTab === 'reports') && (
                <div className="white-panel p-10 text-center space-y-3">
                  <ShieldCheck size={48} className="text-sky-600 mx-auto" aria-hidden="true" />
                  <h3 className="text-xl font-black text-slate-900">Security Audit & Activity Logs</h3>
                  <p className="text-sm font-semibold text-slate-500">System operational logs are monitored in real time.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
