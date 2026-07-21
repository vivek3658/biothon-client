import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AdminManagerCrud } from '../components/AdminManagerCrud';
import { AdminMedicineCrud } from '../components/AdminMedicineCrud';
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

import { apiClient } from '../api/axios';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Strict role classification
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager' || user?.entityModel === 'Employee';
  const isOrgRole = !isAdminOrManager && (user?.entityModel === 'Organization' || ['hospital', 'clinic', 'laboratory', 'pharmacy', 'other'].includes(user?.role));
  const isUserRole = !isAdminOrManager && !isOrgRole && (user?.entityModel === 'User' || user?.role === 'patient' || user?.role === 'doctor');

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
      <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 10 }}>
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
        <main style={{
          flex: 1,
          padding: '28px 36px',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* 1. HOSPITAL / CLINIC / ORGANIZATION DASHBOARD */}
          {isOrgRole ? (
            <OrgDashboard />
          ) : isUserRole ? (
            /* 2. PATIENT & DOCTOR DASHBOARD */
            <UserDashboard />
          ) : (
            /* 3. ADMIN & MANAGER DASHBOARD */
            <>
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                      Welcome back, {user?.username}! 👋
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      ArogyaX Operational Dashboard • Role: <strong style={{ color: '#0284c7' }}>{user?.role?.toUpperCase()}</strong>
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px'
                  }}>
                    {user?.role === 'admin' && (
                      <div className="white-card" style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Active Managers
                          </span>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                            <Users size={20} />
                          </div>
                        </div>
                        <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {stats.managersCount}
                        </div>
                      </div>
                    )}

                    <div className="white-card" style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Medicine Catalog
                        </span>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                          <Pill size={20} />
                        </div>
                      </div>
                      <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {stats.medicinesCount}
                      </div>
                    </div>

                    <div className="white-card" style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Pending Approvals
                        </span>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                          <Clock size={20} />
                        </div>
                      </div>
                      <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {stats.pendingOrgsCount}
                      </div>
                    </div>

                    <div className="white-card" style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Verified Entities
                        </span>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                          <CheckCircle2 size={20} />
                        </div>
                      </div>
                      <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {stats.approvedOrgsCount} / {stats.totalOrgsCount}
                      </div>
                    </div>
                  </div>

                  <div className="white-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>Quick Workspace Actions</h3>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <button onClick={() => setActiveTab('medicines')} className="btn-primary">
                        <Pill size={16} />
                        <span>Manage Medicine Catalog ({stats.medicinesCount})</span>
                      </button>
                      {user?.role === 'admin' && (
                        <button onClick={() => setActiveTab('managers')} className="btn-secondary">
                          <Users size={16} />
                          <span>Manage Manager Accounts</span>
                        </button>
                      )}
                      <button onClick={() => setActiveTab('pending')} className="btn-success">
                        <Clock size={16} />
                        <span>Review Pending Verifications ({stats.pendingOrgsCount})</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'medicines' && <AdminMedicineCrud />}
              {activeTab === 'managers' && user?.role === 'admin' && <AdminManagerCrud />}
              {activeTab === 'pending' && <ManagerApproval />}
              {activeTab === 'organizations' && <OrganizationList />}
              {(activeTab === 'audit' || activeTab === 'reports') && (
                <div className="white-panel" style={{ padding: '40px', textAlign: 'center' }}>
                  <ShieldCheck size={48} color="#0284c7" style={{ margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>Security Audit & Activity Logs</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>System operational logs are monitored in real time.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
