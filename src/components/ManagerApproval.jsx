import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Award, 
  Eye, 
  AlertTriangle,
  RefreshCw,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ManagerApproval = () => {
  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendingOrgs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/manager/organizations/pending');
      const data = await res.json();

      if (res.ok) {
        setPendingOrgs(data.organizations || []);
      } else {
        setError(data.error || 'Failed to fetch pending applications');
      }
    } catch (err) {
      setError('Network error fetching pending applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrgs();
  }, []);

  const handleApprove = async (org) => {
    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch(`/manager/organizations/${org._id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');

      setSuccessMsg(`Organization "${org.name}" approved successfully!`);
      setSelectedOrg(null);
      fetchPendingOrgs();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch(`/manager/organizations/${selectedOrg._id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: rejectReason })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rejection failed');

      setSuccessMsg(`Organization "${selectedOrg.name}" application rejected.`);
      setShowRejectModal(false);
      setSelectedOrg(null);
      setRejectReason('');
      fetchPendingOrgs();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Pending Organization Verification Requests
            </h2>
            <span className="badge badge-pending">
              <Clock size={12} />
              {pendingOrgs.length} Applications Pending
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Review healthcare entity registrations, verify certificate documents, and approve or reject access.
          </p>
        </div>

        <button onClick={fetchPendingOrgs} className="btn-secondary">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Requests</span>
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

      {/* Orgs Grid */}
      {loading ? (
        <div className="white-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading pending organization requests...
        </div>
      ) : pendingOrgs.length === 0 ? (
        <div className="white-panel" style={{ padding: '50px', textAlign: 'center' }}>
          <ShieldCheck size={48} color="#059669" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>All Applications Up to Date!</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            There are currently no healthcare organizations waiting for manager approval.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
          {pendingOrgs.map((org) => (
            <div key={org._id} className="white-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#e0f2fe',
                      border: '1px solid #bae6fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284c7'
                    }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{org.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 600 }}>
                        {org.facilityType}
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-pending">Pending</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', margin: '16px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={14} color="#ea580c" />
                    <span>Cert: <strong style={{ color: 'var(--text-main)' }}>{org.organizationCertificateNo}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="#0284c7" />
                    <span>{org.location?.city || 'N/A'}, {org.location?.state || ''}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} color="#059669" />
                    <span>{org.contactNumber}</span>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setSelectedOrg(org)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '7px' }}
                >
                  <Eye size={14} />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={() => handleApprove(org)}
                  className="btn-success"
                  style={{ flex: 1, padding: '7px' }}
                  disabled={isSubmitting}
                >
                  <CheckCircle2 size={14} />
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => { setSelectedOrg(org); setShowRejectModal(true); }}
                  className="btn-danger"
                  style={{ padding: '7px' }}
                  title="Reject Application"
                >
                  <XCircle size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INSPECT MODAL */}
      {selectedOrg && !showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={22} color="#0284c7" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedOrg.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Facility Verification Details</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrg(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div className="white-card" style={{ padding: '12px 14px' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Facility Type</span>
                <strong style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{selectedOrg.facilityType}</strong>
              </div>

              <div className="white-card" style={{ padding: '12px 14px' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Contact Number</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedOrg.contactNumber}</strong>
              </div>

              <div className="white-card" style={{ padding: '12px 14px', gridColumn: 'span 2' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Certificate Registration</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#ea580c' }}>{selectedOrg.organizationCertificateNo}</strong>
                  {selectedOrg.organizationCertificateUrl && (
                    <a
                      href={selectedOrg.organizationCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      <ExternalLink size={12} />
                      <span>View Certificate</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="white-card" style={{ padding: '12px 14px', gridColumn: 'span 2' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Address</span>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>
                  {selectedOrg.location?.buildingNo ? `Bldg ${selectedOrg.location.buildingNo}, ` : ''}
                  {selectedOrg.location?.floorNo ? `Floor ${selectedOrg.location.floorNo}, ` : ''}
                  {selectedOrg.location?.landmark ? `Near ${selectedOrg.location.landmark}, ` : ''}
                  {selectedOrg.location?.city}, {selectedOrg.location?.state} - {selectedOrg.location?.pincode}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => setSelectedOrg(null)} className="btn-secondary">
                Close
              </button>
              <button onClick={() => setShowRejectModal(true)} className="btn-danger">
                Reject Application
              </button>
              <button onClick={() => handleApprove(selectedOrg)} className="btn-success" disabled={isSubmitting}>
                Approve & Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedOrg && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }}>Reject Application</h3>
              <button onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Specify rejection reason for organization: <strong>{selectedOrg.name}</strong>
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Rejection Reason</label>
                <textarea
                  className="form-input"
                  style={{ width: '100%', minHeight: '90px', resize: 'vertical' }}
                  placeholder="e.g. Certificate registration number does not match regulatory authority record..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowRejectModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-danger" disabled={isSubmitting}>
                  {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
