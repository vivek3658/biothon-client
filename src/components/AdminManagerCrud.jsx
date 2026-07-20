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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchManagers = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/admin/managers?page=${page}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch managers list');

      setManagers(data.data || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Network error fetching managers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers(1);
  }, []);

  const resetCreateForm = () => {
    setNewName('');
    setNewEmail('');
    setNewUsername('');
    setNewPassword('');
  };

  const resetEditForm = () => {
    setEditName('');
    setEditEmail('');
    setEditUsername('');
    setEditPassword('');
    setSelectedManager(null);
  };

  const openEditModal = (manager) => {
    setSelectedManager(manager);
    setEditName(manager.name || '');
    setEditEmail(manager.email || '');
    setEditUsername(manager.username || '');
    setEditPassword('');
    setShowEditModal(true);
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/admin/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          username: newUsername.trim(),
          password: newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create manager');

      setSuccessMsg(`Manager account "${newUsername}" provisioned successfully!`);
      setShowCreateModal(false);
      resetCreateForm();
      fetchManagers(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateManager = async (e) => {
    e.preventDefault();
    if (!selectedManager || !editUsername.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch(`/admin/managers/${selectedManager._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          username: editUsername.trim(),
          ...(editPassword ? { password: editPassword } : {})
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update manager');

      setSuccessMsg(`Manager "${selectedManager.username}" updated successfully!`);
      setShowEditModal(false);
      resetEditForm();
      fetchManagers(pagination.currentPage);
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
      const res = await fetch(`/admin/managers/${selectedManager._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete manager');

      setSuccessMsg(`Manager "${selectedManager.username}" deleted successfully.`);
      setShowDeleteModal(false);
      resetEditForm();
      fetchManagers(pagination.currentPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredManagers = managers.filter((manager) => {
    const haystack = [manager.username, manager.name, manager.email].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Staff Accounts Control Panel
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Create, update, and remove manager or staff identities with full profile fields.
          </p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ padding: '9px 16px' }}>
          <UserPlus size={16} />
          <span>Provision New Staff</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#047857', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#dc2626', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      <div className="white-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px', width: '100%', fontSize: '0.85rem' }}
            placeholder="Search staff by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={() => fetchManagers(pagination.currentPage)} className="btn-secondary">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Reload List</span>
        </button>
      </div>

      <div className="white-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading staff list...</div>
        ) : filteredManagers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No staff accounts provisioned yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 20px' }}>Staff</th>
                <th style={{ padding: '14px 20px' }}>Role</th>
                <th style={{ padding: '14px 20px' }}>Contact</th>
                <th style={{ padding: '14px 20px' }}>Registration Date</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.map((manager) => (
                <tr key={manager._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857', fontWeight: 800 }}>
                        {manager.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{manager.name || manager.username}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>@{manager.username}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="badge badge-manager">
                      <UserCheck size={10} />
                      MANAGER
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                    {manager.email || 'Not provided'}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(manager.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => openEditModal(manager)} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                        <Key size={14} />
                        <span>Edit Staff</span>
                      </button>
                      <button onClick={() => { setSelectedManager(manager); setShowDeleteModal(true); }} className="btn-danger" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination.totalPages > 1 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Showing Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total staff)</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button disabled={pagination.currentPage <= 1} onClick={() => fetchManagers(pagination.currentPage - 1)} className="btn-secondary" style={{ padding: '4px 8px' }}>
                <ChevronLeft size={16} />
              </button>
              <button disabled={pagination.currentPage >= pagination.totalPages} onClick={() => fetchManagers(pagination.currentPage + 1)} className="btn-secondary" style={{ padding: '4px 8px' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Provision Staff Account</h3>
              <button onClick={() => { setShowCreateModal(false); resetCreateForm(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateManager}>
              <div className="form-group">
                <label className="form-label">Staff Name</label>
                <input type="text" className="form-input" placeholder="e.g. Priya Sharma" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="e.g. priya@arogyax.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Manager Username</label>
                <input type="text" className="form-input" placeholder="e.g. manager1" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Password (6-20 characters)</label>
                <input type="password" className="form-input" placeholder="Enter secure password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} maxLength={20} required />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowCreateModal(false); resetCreateForm(); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Provisioning...' : 'Provision Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedManager && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Edit Staff Account</h3>
              <button onClick={() => { setShowEditModal(false); resetEditForm(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Update identity details for <strong>{selectedManager.username}</strong>. Password is optional.
            </p>

            <form onSubmit={handleUpdateManager}>
              <div className="form-group">
                <label className="form-label">Staff Name</label>
                <input type="text" className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" className="form-input" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">New Password (6-20 characters)</label>
                <input type="password" className="form-input" placeholder="Leave blank to keep existing password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} minLength={6} maxLength={20} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowEditModal(false); resetEditForm(); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedManager && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: '#dc2626' }}>
              <AlertTriangle size={22} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Delete Staff Account</h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '20px' }}>
              Are you sure you want to delete <strong>"{selectedManager.username}"</strong>?
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowDeleteModal(false); resetEditForm(); }} className="btn-secondary">Cancel</button>
              <button onClick={handleDeleteManager} className="btn-danger" disabled={isSubmitting}>{isSubmitting ? 'Deleting...' : 'Confirm Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
