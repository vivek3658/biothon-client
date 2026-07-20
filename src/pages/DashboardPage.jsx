import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AdminManagerCrud } from '../components/AdminManagerCrud';
import { ManagerApproval } from '../components/ManagerApproval';
import { OrganizationList } from '../components/OrganizationList';
import { 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stats, setStats] = useState({
    managersCount: 0,
    pendingOrgsCount: 0,
    totalOrgsCount: 0,
    approvedOrgsCount: 0
  });

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      
      let mCount = 0;
      if (user?.role === 'admin') {
        const resM = await fetch('/admin/managers?page=1');
        if (resM.ok) {
          const dataM = await resM.json();
          mCount = dataM.pagination?.totalItems || (dataM.data ? dataM.data.length : 0);
        }
      }

      let pCount = 0;
      const resP = await fetch('/manager/organizations/pending');
      if (resP.ok) {
        const dataP = await resP.json();
        pCount = dataP.count || 0;
      }

      let tCount = 0;
      let aCount = 0;
      const resA = await fetch('/manager/organizations');
      if (resA.ok) {
        const dataA = await resA.json();
        const orgs = dataA.organizations || [];
        tCount = orgs.length;
        aCount = orgs.filter(o => o.verificationStatus === 'approved').length;
      }

      setStats({
        managersCount: mCount,
        pendingOrgsCount: pCount,
        totalOrgsCount: tCount,
        approvedOrgsCount: aCount
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
      {/* Background Patterns */}
      <div className="bg-ambient-pattern" />
      <div className="bg-ambient-glow-1" />
      <div className="bg-ambient-glow-2" />

      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        onRefresh={fetchStats} 
        isRefreshing={isRefreshing} 
      />

      {/* Main Layout with Sidebar */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 10 }}>
        <Sidebar 
          role={user?.role || 'manager'} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* Content Body */}
        <main style={{
          flex: 1,
          padding: '28px 36px',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%'
        }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Welcome Header */}
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Welcome back, {user?.username}! 👋
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  ArogyaX Operational Dashboard • Role: <strong style={{ color: '#0284c7' }}>{user?.role?.toUpperCase()}</strong>
                </p>
              </div>

              {/* White Metrics Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px'
              }}>
                {user?.role === 'admin' && (
                  <div className="white-card" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Active Managers
                      </span>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                        <Users size={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {stats.managersCount}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px', fontWeight: 500 }}>
                      Provisioned via Admin Manager CRUD
                    </p>
                  </div>
                )}

                <div className="white-card" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Pending Approvals
                    </span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                      <Clock size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {stats.pendingOrgsCount}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px', fontWeight: 500 }}>
                    Healthcare entities awaiting review
                  </p>
                </div>

                <div className="white-card" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Verified Entities
                    </span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {stats.approvedOrgsCount} / {stats.totalOrgsCount}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px', fontWeight: 500 }}>
                    Active verified organizations
                  </p>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="white-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>Quick Workspace Actions</h3>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  {user?.role === 'admin' && (
                    <button onClick={() => setActiveTab('managers')} className="btn-primary">
                      <Users size={16} />
                      <span>Manage Manager Accounts</span>
                    </button>
                  )}
                  <button onClick={() => setActiveTab('pending')} className="btn-success">
                    <Clock size={16} />
                    <span>Review Pending Applications ({stats.pendingOrgsCount})</span>
                  </button>
                  <button onClick={() => setActiveTab('organizations')} className="btn-secondary">
                    <Building2 size={16} />
                    <span>View All Organizations</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'managers' && user?.role === 'admin' && (
            <AdminManagerCrud />
          )}

          {activeTab === 'pending' && (
            <ManagerApproval />
          )}

          {activeTab === 'organizations' && (
            <OrganizationList />
          )}

          {(activeTab === 'audit' || activeTab === 'reports') && (
            <div className="white-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <ShieldCheck size={48} color="#0284c7" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>Security Audit & Activity Logs</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                System operational logs, authentication events, and organization verification timestamps are logged.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
