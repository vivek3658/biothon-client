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
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { apiClient } from '../api/axios';

export const ManagerApproval = () => {
  const [activeSubTab, setActiveSubTab] = useState('organizations'); // 'organizations' | 'doctors'
  
  // Pending Orgs
  const [pendingOrgs, setPendingOrgs] = useState([]);
  // Pending Doctors
  const [pendingDoctors, setPendingDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch Orgs
      try {
        const { data: dataOrg } = await apiClient.get('/manager/organizations/pending');
        setPendingOrgs(dataOrg.organizations || []);
      } catch (e) {}

      // Fetch Doctors
      try {
        const { data: dataDoc } = await apiClient.get('/manager/doctors/pending');
        setPendingDoctors(dataDoc.doctors || []);
      } catch (e) {}
    } catch (err) {
      setError('Error fetching verification requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveOrg = async (org) => {
    try {
      setIsSubmitting(true);
      setError('');
      await apiClient.patch(`/manager/organizations/${org._id}/verify`, { action: 'approve' });

      setSuccessMsg(`Organization "${org.name}" approved successfully!`);
      setSelectedOrg(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Approval failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveDoctor = async (doc) => {
    try {
      setIsSubmitting(true);
      setError('');
      await apiClient.patch(`/manager/doctors/${doc._id}/verify`, { action: 'approve' });

      setSuccessMsg(`Doctor "${doc.name}" verified successfully!`);
      setSelectedDoctor(null);
      fetchData();
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Manager Verification Workspace
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Review pending registrations for Healthcare Organizations and Medical Doctors.
          </p>
        </div>

        <button onClick={fetchData} className="btn-secondary">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh All Requests</span>
        </button>
      </div>

      {/* Verification Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setActiveSubTab('orgs')}
          className="btn-secondary"
          style={{
            padding: '8px 16px',
            background: activeSubTab === 'orgs' ? '#0284c7' : '#ffffff',
            borderColor: activeSubTab === 'orgs' ? '#0284c7' : 'var(--border-color)',
            color: activeSubTab === 'orgs' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700
          }}
        >
          <Building2 size={16} />
          <span>Pending Organizations ({pendingOrgs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('doctors')}
          className="btn-secondary"
          style={{
            padding: '8px 16px',
            background: activeSubTab === 'doctors' ? '#059669' : '#ffffff',
            borderColor: activeSubTab === 'doctors' ? '#059669' : 'var(--border-color)',
            color: activeSubTab === 'doctors' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700
          }}
        >
          <Stethoscope size={16} />
          <span>Pending Doctor Verifications ({pendingDoctors.length})</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#047857', fontSize: '0.85rem' }}>
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
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#dc2626', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUB-TAB 1: PENDING ORGANIZATIONS */}
      {activeSubTab === 'orgs' && (
        <div>
          {loading ? (
            <div className="white-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading pending organization requests...
            </div>
          ) : pendingOrgs.length === 0 ? (
            <div className="white-panel" style={{ padding: '50px', textAlign: 'center' }}>
              <ShieldCheck size={48} color="#059669" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>No Pending Organization Requests!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>All healthcare organization applications have been reviewed.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
              {pendingOrgs.map((org) => (
                <div key={org._id} className="white-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{org.name}</h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 600 }}>{org.facilityType}</span>
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
                    <button onClick={() => setSelectedOrg(org)} className="btn-secondary" style={{ flex: 1, padding: '7px' }}>
                      <Eye size={14} />
                      <span>Inspect</span>
                    </button>
                    <button onClick={() => handleApproveOrg(org)} className="btn-success" style={{ flex: 1, padding: '7px' }} disabled={isSubmitting}>
                      <CheckCircle2 size={14} />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: PENDING DOCTOR VERIFICATIONS */}
      {activeSubTab === 'doctors' && (
        <div>
          {loading ? (
            <div className="white-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading pending doctor verification requests...
            </div>
          ) : pendingDoctors.length === 0 ? (
            <div className="white-panel" style={{ padding: '50px', textAlign: 'center' }}>
              <ShieldCheck size={48} color="#059669" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>No Pending Doctor Verifications!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>All medical doctor registration documents have been reviewed.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
              {pendingDoctors.map((doc) => (
                <div key={doc._id} className="white-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{doc.name}</h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{doc.doctorDetails?.speciality || 'General Medicine'}</span>
                        </div>
                      </div>
                      <span className="badge badge-pending">Pending</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', margin: '16px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={14} color="#ea580c" />
                        <span>Reg Cert: <strong style={{ color: 'var(--text-main)' }}>{doc.doctorDetails?.certificateNo}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={14} color="#0284c7" />
                        <span>{doc.location?.city || 'N/A'}, {doc.location?.state || ''}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {doc.doctorDetails?.certificateDoc && (
                      <a href={doc.doctorDetails.certificateDoc} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '7px' }}>
                        <ExternalLink size={14} />
                        <span>PDF Proof</span>
                      </a>
                    )}

                    <button onClick={() => handleApproveDoctor(doc)} className="btn-success" style={{ flex: 1, padding: '7px' }} disabled={isSubmitting}>
                      <CheckCircle2 size={14} />
                      <span>Approve Doctor</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INSPECT ORG MODAL */}
      {selectedOrg && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedOrg.name}</h3>
              <button onClick={() => setSelectedOrg(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Cert No: <strong>{selectedOrg.organizationCertificateNo}</strong> • Phone: {selectedOrg.contactNumber}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedOrg(null)} className="btn-secondary">Close</button>
              <button onClick={() => handleApproveOrg(selectedOrg)} className="btn-success">Approve & Activate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
