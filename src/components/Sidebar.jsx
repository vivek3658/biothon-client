import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  UserCog
} from 'lucide-react';

export const Sidebar = ({ role, activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const adminMenuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'managers', label: 'Manage Managers', icon: UserCog, badge: 'CRUD' },
    { id: 'organizations', label: 'All Organizations', icon: Building2 },
    { id: 'audit', label: 'System Audit', icon: ShieldCheck }
  ];

  const managerMenuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pending', label: 'Pending Approvals', icon: Clock, badge: 'Action Needed' },
    { id: 'organizations', label: 'Verified Orgs', icon: CheckCircle2 },
    { id: 'reports', label: 'Verification Logs', icon: FileText }
  ];

  const menuItems = role === 'admin' ? adminMenuItems : managerMenuItems;

  return (
    <aside style={{
      width: collapsed ? '72px' : '250px',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 67px)',
      position: 'sticky',
      top: '67px',
      background: '#ffffff',
      borderRight: '1px solid var(--border-color)',
      padding: '20px 12px',
      zIndex: 30
    }}>
      {/* Collapse Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        marginBottom: '20px',
        padding: '0 6px'
      }}>
        {!collapsed && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            color: 'var(--text-dim)',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Navigation
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-secondary"
          style={{
            padding: '4px',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Role Workspace Banner */}
      {!collapsed && (
        <div style={{
          margin: '0 4px 18px 4px',
          padding: '10px 12px',
          borderRadius: '10px',
          background: role === 'admin' ? '#f0f9ff' : '#ecfdf5',
          border: role === 'admin' ? '1px solid #bae6fd' : '1px solid #a7f3d0'
        }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: role === 'admin' ? '#0369a1' : '#047857',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {role === 'admin' ? 'Root Administrator Workspace' : 'Manager Operations Workspace'}
          </span>
        </div>
      )}

      {/* Menu List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                gap: '12px',
                padding: collapsed ? '10px' : '10px 14px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isActive 
                  ? (role === 'admin' ? '#bae6fd' : '#a7f3d0') 
                  : 'transparent',
                background: isActive 
                  ? (role === 'admin' ? '#f0f9ff' : '#ecfdf5') 
                  : 'transparent',
                color: isActive 
                  ? (role === 'admin' ? '#0369a1' : '#047857') 
                  : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontSize: '0.88rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconComponent 
                  size={18} 
                  color={isActive 
                    ? (role === 'admin' ? '#0284c7' : '#059669') 
                    : 'var(--text-muted)'} 
                />
                {!collapsed && <span>{item.label}</span>}
              </div>

              {!collapsed && item.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: item.badge === 'Action Needed' ? '#fff7ed' : '#f1f5f9',
                  color: item.badge === 'Action Needed' ? '#ea580c' : 'var(--text-muted)',
                  fontWeight: 800
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding inside sidebar */}
      {!collapsed && (
        <div style={{
          padding: '10px',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-dim)',
          borderTop: '1px solid var(--border-color)',
          marginTop: 'auto',
          fontWeight: 600
        }}>
          ArogyaX v1.0.0
        </div>
      )}
    </aside>
  );
};
