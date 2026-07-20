import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  Key, 
  Trash2, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const AdminManagerCrud = () => {
  const [managers, setManagers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  // Form inputs
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchManagers = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/admin/managers?page=${page}`);
      const data = await res.json();

      if (res.ok) {
        setManagers(data.data || []);
        if (data.pagination) setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch managers list');
      }
    } catch (err) {
      setError('Network error fetching managers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers(1);
  }, []);

  const handleCreateManager = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/admin/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername.trim(), password: newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create manager');

      setSuccessMsg(`Manager account "${newUsername}" provisioned successfully!`);
      setShowCreateModal(false);
      setNewUsername('');
      setNewPassword('');
      fetchManagers(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!editPassword || !selectedManager) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch(`/admin/managers/${selectedManager._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: editPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setSuccessMsg(`Password for manager "${selectedManager.username}" updated!`);
      setShowEditModal(false);
      setSelectedManager(null);
      setEditPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteManager = async () => {
    if (!selectedManager) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch(`/admin/managers/${selectedManager._id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete manager');

      setSuccessMsg(`Manager "${selectedManager.username}" deleted successfully.`);
      setShowDeleteModal(false);
      setSelectedManager(null);
      fetchManagers(pagination.currentPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredManagers = managers.filter(m => 
    m.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Manager Accounts Control Panel
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Provision, manage passwords, and oversee operational Manager accounts.
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{ padding: '9px 16px' }}
        >
          <UserPlus size={16} />
          <span>Provision New Manager</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#047857',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#dc2626',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="white-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px', width: '100%', fontSize: '0.85rem' }}
            placeholder="Search managers by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={() => fetchManagers(pagination.currentPage)} className="btn-secondary">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Reload List</span>
        </button>
      </div>

      {/* Managers White Table */}
      <div className="white-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading managers list...
          </div>
        ) : filteredManagers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No manager accounts provisioned yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 20px' }}>Username</th>
                <th style={{ padding: '14px 20px' }}>Role</th>
                <th style={{ padding: '14px 20px' }}>Created By</th>
                <th style={{ padding: '14px 20px' }}>Registration Date</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.map((mgr) => (
                <tr key={mgr._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857', fontWeight: 800 }}>
                        {mgr.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{mgr.username}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="badge badge-manager">
                      <UserCheck size={10} />
                      MANAGER
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                    {mgr.createdBy || 'admin'}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(mgr.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => { setSelectedManager(mgr); setShowEditModal(true); }}
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                      >
                        <Key size={14} />
                        <span>Reset Password</span>
                      </button>
                      <button
                        onClick={() => { setSelectedManager(mgr); setShowDeleteModal(true); }}
                        className="btn-danger"
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Showing Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total managers)</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                disabled={pagination.currentPage <= 1}
                onClick={() => fetchManagers(pagination.currentPage - 1)}
                className="btn-secondary"
                style={{ padding: '4px 8px' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => fetchManagers(pagination.currentPage + 1)}
                className="btn-secondary"
                style={{ padding: '4px 8px' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MANAGER MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Provision Manager Account</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateManager}>
              <div className="form-group">
                <label className="form-label">Manager Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. manager1"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Password (6-20 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  maxLength={20}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PASSWORD MODAL */}
      {showEditModal && selectedManager && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Reset Password</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Target manager: <strong>{selectedManager.username}</strong>
            </p>

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">New Password (6-20 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  minLength={6}
                  maxLength={20}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedManager && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: '#dc2626' }}>
              <AlertTriangle size={22} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Delete Manager Account</h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '20px' }}>
              Are you sure you want to delete <strong>"{selectedManager.username}"</strong>?
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteManager} className="btn-danger" disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
