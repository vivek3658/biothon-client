import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Award, 
  Edit3, 
  Navigation, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X,
  Stethoscope,
  Calendar,
  RefreshCw,
  UserCheck,
  UserX,
  Filter
} from 'lucide-react';

// Helper: build auth headers from localStorage token
const getAuthHeaders = (contentType = true) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (contentType) headers['Content-Type'] = 'application/json';
  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return headers;
};

export const OrgDashboard = () => {
  const { userProfile, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('affiliations'); // Default to Doctor Affiliations

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Doctor Affiliation Requests State
  const [doctorsList, setDoctorsList] = useState([]);
  const [affiliationFilter, setAffiliationFilter] = useState('all'); // 'all' | 'pending' | 'approved'

  // Edit Org Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [longitude, setLongitude] = useState('77.2090');
  const [latitude, setLatitude] = useState('28.6139');
  const [certUrl, setCertUrl] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setContactNumber(userProfile.contactNumber || '');
      setBuildingNo(userProfile.location?.buildingNo || '');
      setLandmark(userProfile.location?.landmark || '');
      setCity(userProfile.location?.city || '');
      setStateName(userProfile.location?.state || '');
      setPincode(userProfile.location?.pincode || '');
      setLongitude(userProfile.coordinates?.[0] ?? '77.2090');
      setLatitude(userProfile.coordinates?.[1] ?? '28.6139');
      setCertUrl(userProfile.organizationCertificateUrl || '');
    }
  }, [userProfile]);

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/org/pending-doctors', { headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok && data.success) {
        setDoctorsList(data.doctors || []);
      }
    } catch (err) {
      console.error('Error fetching pending doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
  }, [userProfile]);

  const handleApproveDoctor = async (doctorId, doctorName) => {
    try {
      setError('');
      setSuccessMsg('');
      const res = await fetch(`/org/approve-doctor/${doctorId}`, {
        method: 'POST',
        headers: getAuthHeaders(true)
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.details || 'Failed to approve doctor.');
      }

      setError('');
      setSuccessMsg(data.message || `Doctor ${doctorName || 'Practitioner'} approved and affiliated successfully!`);
      await fetchPendingDoctors();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectDoctor = async (doctorId, doctorName) => {
    try {
      setError('');
      setSuccessMsg('');
      const res = await fetch(`/org/reject-doctor/${doctorId}`, {
        method: 'POST',
        headers: getAuthHeaders(true)
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.details || 'Failed to reject doctor.');
      }

      setError('');
      setSuccessMsg(data.message || `Doctor ${doctorName || 'Practitioner'} affiliation request rejected.`);
      await fetchPendingDoctors();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!userProfile?._id) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch(`/org/${userProfile._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(true),
        credentials: 'include',
        body: JSON.stringify({
          name: name || userProfile.name,
          contactNumber: contactNumber || userProfile.contactNumber,
          location: {
            buildingNo: buildingNo || '',
            landmark: landmark || '',
            city: city || 'New Delhi',
            state: stateName || 'Delhi',
            pincode: pincode || '110001'
          },
          coordinates: [parseFloat(longitude) || 77.2090, parseFloat(latitude) || 28.6139],
          organizationCertificateUrl: certUrl || ''
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update organization profile');

      setSuccessMsg('Organization profile updated successfully!');
      setShowEditModal(false);
      refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered doctors list
  const filteredDoctors = doctorsList.filter(doc => {
    const status = doc.doctorDetails?.affiliateOrganizationApprovalStatus || 'pending';
    if (affiliationFilter === 'pending') return status === 'pending';
    if (affiliationFilter === 'approved') return status === 'approved';
    return true;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      
      {/* SLEEK SIDEBAR NAVIGATION */}
      <aside className="white-panel" style={{ padding: '20px 16px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
        <div style={{ padding: '0 8px 16px 8px', borderBottom: '1px solid #e2e8f0', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hospital Workspace</span>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userProfile?.name || 'Facility Portal'}
          </h4>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button 
            type="button" 
            onClick={() => { setActiveTab('affiliations'); setError(''); }} 
            className="btn-secondary" 
            style={{ 
              justifyContent: 'flex-start', 
              padding: '10px 14px',
              borderRadius: '10px',
              border: activeTab === 'affiliations' ? '1px solid #bae6fd' : '1px solid transparent', 
              background: activeTab === 'affiliations' ? '#f0f9ff' : 'transparent', 
              color: activeTab === 'affiliations' ? '#0284c7' : '#64748b',
              fontWeight: 700,
              fontSize: '0.88rem'
            }}
          >
            <Stethoscope size={18} />
            <span>Doctor Affiliations ({doctorsList.length})</span>
          </button>

          <button 
            type="button" 
            onClick={() => { setActiveTab('profile'); setError(''); }} 
            className="btn-secondary" 
            style={{ 
              justifyContent: 'flex-start', 
              padding: '10px 14px',
              borderRadius: '10px',
              border: activeTab === 'profile' ? '1px solid #bae6fd' : '1px solid transparent', 
              background: activeTab === 'profile' ? '#f0f9ff' : 'transparent', 
              color: activeTab === 'profile' ? '#0284c7' : '#64748b',
              fontWeight: 700,
              fontSize: '0.88rem'
            }}
          >
            <Building2 size={18} />
            <span>Organization Profile</span>
          </button>
        </nav>
      </aside>

      {/* CONTENT AREA */}
      <div>
        {/* Notifications */}
        {successMsg && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#047857', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={20} /><span>{successMsg}</span></div>
            <button type="button" onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer' }}><X size={18} /></button>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#dc2626', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><AlertTriangle size={20} /><span>{error}</span></div>
            <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><X size={18} /></button>
          </div>
        )}

        {/* PAGE 1: DOCTOR AFFILIATIONS PAGE */}
        {activeTab === 'affiliations' && (
          <div className="white-panel" style={{ padding: '28px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Stethoscope size={24} color="#0284c7" />
                  <span>Doctor Affiliation Requests ({doctorsList.length})</span>
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px' }}>
                  Approve or reject doctors requesting to issue digital prescriptions under <strong>{userProfile?.name || 'this facility'}</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setAffiliationFilter('all')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: affiliationFilter === 'all' ? '#ffffff' : 'transparent',
                      color: affiliationFilter === 'all' ? '#0284c7' : '#64748b',
                      boxShadow: affiliationFilter === 'all' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    All ({doctorsList.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setAffiliationFilter('pending')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: affiliationFilter === 'pending' ? '#ffffff' : 'transparent',
                      color: affiliationFilter === 'pending' ? '#d97706' : '#64748b',
                      boxShadow: affiliationFilter === 'pending' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    Pending ({doctorsList.filter(d => (d.doctorDetails?.affiliateOrganizationApprovalStatus || 'pending') === 'pending').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setAffiliationFilter('approved')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: affiliationFilter === 'approved' ? '#ffffff' : 'transparent',
                      color: affiliationFilter === 'approved' ? '#059669' : '#64748b',
                      boxShadow: affiliationFilter === 'approved' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    Approved ({doctorsList.filter(d => d.doctorDetails?.affiliateOrganizationApprovalStatus === 'approved').length})
                  </button>
                </div>

                <button type="button" onClick={fetchPendingDoctors} className="btn-secondary" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={15} className={loading ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {filteredDoctors.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '14px', border: '2px dashed #cbd5e1' }}>
                <Stethoscope size={48} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#334155' }}>No Doctor Affiliation Requests Found</h4>
                <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px' }}>
                  {affiliationFilter === 'pending' ? 'There are no pending doctor requests right now.' : 'Doctors who search and request affiliation with your facility will appear here.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredDoctors.map((doc) => {
                  const status = doc.doctorDetails?.affiliateOrganizationApprovalStatus || 'pending';
                  return (
                    <div 
                      key={doc._id} 
                      style={{ 
                        padding: '22px', 
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        flexWrap: 'wrap', 
                        gap: '16px',
                        borderLeft: status === 'approved' ? '5px solid #10b981' : status === 'rejected' ? '5px solid #ef4444' : '5px solid #f59e0b'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{doc.name}</h4>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            background: status === 'approved' ? '#dcfce7' : status === 'rejected' ? '#fee2e2' : '#fef3c7',
                            color: status === 'approved' ? '#15803d' : status === 'rejected' ? '#b91c1c' : '#b45309'
                          }}>
                            {status.toUpperCase()}
                          </span>
                        </div>
                        
                        <p style={{ fontSize: '0.88rem', color: '#0284c7', fontWeight: 700, marginBottom: '6px' }}>
                          Speciality: {doc.doctorDetails?.speciality || 'General Medicine'} • MCI Reg: {doc.doctorDetails?.certificateNo || 'MCI-VERIFIED'}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '20px', fontSize: '0.84rem', color: '#64748b' }}>
                          <span>Email: <strong style={{ color: '#0f172a' }}>{doc.email || 'doctor@arogyax.com'}</strong></span>
                          <span>City: <strong style={{ color: '#0f172a' }}>{doc.location?.city || 'New Delhi'}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        {status !== 'approved' && (
                          <button 
                            type="button" 
                            onClick={() => handleApproveDoctor(doc._id, doc.name)} 
                            className="btn-success" 
                            style={{ padding: '10px 18px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', background: '#059669', borderColor: '#059669', color: '#ffffff', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            <UserCheck size={16} />
                            <span>Accept & Approve</span>
                          </button>
                        )}

                        {status !== 'rejected' && (
                          <button 
                            type="button" 
                            onClick={() => handleRejectDoctor(doc._id, doc.name)} 
                            className="btn-danger" 
                            style={{ padding: '10px 18px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', background: '#dc2626', borderColor: '#dc2626', color: '#ffffff', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            <UserX size={16} />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PAGE 2: ORGANIZATION PROFILE */}
        {activeTab === 'profile' && (
          <div className="white-panel" style={{ padding: '28px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{userProfile?.name}</h3>
                <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '2px' }}>Facility Type: <strong>{(userProfile?.facilityType || 'Hospital').toUpperCase()}</strong></p>
              </div>
              <button type="button" onClick={() => setShowEditModal(true)} className="btn-primary" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={16} /><span>Edit Profile</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', fontSize: '0.9rem' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Contact Phone</span>
                <strong style={{ color: '#0f172a', fontSize: '1.05rem' }}>{userProfile?.contactNumber || 'Not specified'}</strong>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Verification Status</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: userProfile?.managerApprovalStatus === 'approved' ? '#dcfce7' : '#fef3c7',
                  color: userProfile?.managerApprovalStatus === 'approved' ? '#15803d' : '#b45309'
                }}>
                  {userProfile?.managerApprovalStatus === 'approved' ? 'VERIFIED FACILITY' : 'PENDING APPROVAL'}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Facility Location</span>
                <p style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>
                  {userProfile?.location?.buildingNo ? `Building ${userProfile.location.buildingNo}, ` : ''}
                  {userProfile?.location?.landmark ? `Landmark: ${userProfile.location.landmark}, ` : ''}
                  {userProfile?.location?.city || 'New Delhi'}, {userProfile?.location?.state || 'Delhi'} - {userProfile?.location?.pincode || '110001'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', padding: '28px', background: '#ffffff', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Edit Organization Profile</h3>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="grid-2col" style={{ gap: '14px' }}>
                <div className="form-group col-span-2">
                  <label className="form-label">Organization / Hospital Name</label>
                  <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input type="text" className="form-input" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>Save Profile Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
