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
  RefreshCw
} from 'lucide-react';

// Helper: build auth headers from localStorage token
const getAuthHeaders = (contentType = true) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (contentType) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const OrgDashboard = () => {
  const { userProfile, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Org Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  // coordinates is a flat array [lng, lat] — NOT GeoJSON
  const [longitude, setLongitude] = useState('77.2090');
  const [latitude, setLatitude] = useState('28.6139');
  const [certUrl, setCertUrl] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setContactNumber(userProfile.contactNumber || '');
      setBuildingNo(userProfile.location?.buildingNo || '');
      setLandmark(userProfile.location?.landmark || '');
      setCity(userProfile.location?.city || '');
      setStateName(userProfile.location?.state || '');
      setPincode(userProfile.location?.pincode || '');
      // coordinates is flat array [lng, lat]
      setLongitude(userProfile.coordinates?.[0] ?? '77.2090');
      setLatitude(userProfile.coordinates?.[1] ?? '28.6139');
      setCertUrl(userProfile.organizationCertificateUrl || '');
    }
  }, [userProfile]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLongitude(pos.coords.longitude.toFixed(4));
        setLatitude(pos.coords.latitude.toFixed(4));
        setIsLocating(false);
      },
      (err) => {
        setError('Failed to retrieve GPS location: ' + err.message);
        setIsLocating(false);
      }
    );
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!userProfile?._id) return;

    try {
      setIsSubmitting(true);
      setError('');
      // Route is PUT /org/:targetOrgId — use userProfile._id (the Organization doc ID)
      const res = await fetch(`/org/${userProfile._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          name: name || 'Healthcare Facility',
          contactNumber: contactNumber || '+91 9876543210',
          location: {
            buildingNo: buildingNo || '1',
            floorNo: 0,
            landmark: landmark || 'City Center',
            city: city || 'New Delhi',
            state: stateName || 'Delhi',
            pincode: pincode || '110001'
          },
          coordinates: [parseFloat(longitude) || 77.2090, parseFloat(latitude) || 28.6139],
          organizationCertificateUrl: certUrl || 'https://example.com/cert.pdf'
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

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this organization profile?')) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/org/${userProfile._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(false),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete organization');
      localStorage.removeItem('token');
      logout();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="app-sidebar">
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 8px' }}>Facility Workspace</span>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button type="button" onClick={() => setActiveTab('profile')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'profile' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'profile' ? '#a7f3d0' : 'transparent', color: activeTab === 'profile' ? '#059669' : 'var(--text-muted)' }}>
            <Building2 size={16} /><span>Facility Profile</span>
          </button>
          <button type="button" onClick={() => setActiveTab('doctors')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'doctors' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'doctors' ? '#a7f3d0' : 'transparent', color: activeTab === 'doctors' ? '#059669' : 'var(--text-muted)' }}>
            <Stethoscope size={16} /><span>Affiliated Doctors</span>
          </button>
          <button type="button" onClick={() => setActiveTab('services')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'services' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'services' ? '#a7f3d0' : 'transparent', color: activeTab === 'services' ? '#059669' : 'var(--text-muted)' }}>
            <Calendar size={16} /><span>Specialities & Days</span>
          </button>
        </nav>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="app-content">
        {/* Notifications */}
        {successMsg && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#047857', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} /><span>{successMsg}</span></div>
            <button type="button" onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer' }}><X size={16} /></button>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#dc2626', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><AlertTriangle size={18} /><span>{error}</span></div>
            <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><X size={16} /></button>
          </div>
        )}

        {/* TAB 1: FACILITY PROFILE */}
        {activeTab === 'profile' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{userProfile?.name}</h2>
                  <span className={userProfile?.verificationStatus === 'approved' ? 'badge badge-approved' : 'badge badge-pending'}>
                    {userProfile?.verificationStatus === 'approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {userProfile?.verificationStatus?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  Facility Type: <strong>{userProfile?.facilityType}</strong> • Phone: {userProfile?.contactNumber}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowEditModal(true)} className="btn-primary" style={{ padding: '8px 14px' }}>
                  <Edit3 size={16} /><span>Edit Profile</span>
                </button>
                <button type="button" onClick={handleDeleteAccount} className="btn-danger" style={{ padding: '8px 12px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.88rem' }}>
              <div className="white-card" style={{ padding: '14px', gridColumn: 'span 2' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Registration Certificate</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#ea580c', fontSize: '1rem' }}>{userProfile?.organizationCertificateNo}</strong>
                  {userProfile?.organizationCertificateUrl && (
                    <a href={userProfile.organizationCertificateUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                      <ExternalLink size={12} /><span>View Certificate</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="white-card" style={{ padding: '14px', gridColumn: 'span 2' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Address & Location</span>
                <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  {userProfile?.location?.buildingNo ? `Bldg ${userProfile.location.buildingNo}, ` : ''}
                  {userProfile?.location?.landmark ? `Landmark: ${userProfile.location.landmark}, ` : ''}
                  {userProfile?.location?.city}, {userProfile?.location?.state} - {userProfile?.location?.pincode}
                </p>
              </div>

              <div className="white-card" style={{ padding: '14px', gridColumn: 'span 2' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>GPS Coordinates</span>
                <p style={{ color: '#059669', fontWeight: 700 }}>
                  Longitude: {userProfile?.coordinates?.[0] || '77.2090'} | Latitude: {userProfile?.coordinates?.[1] || '28.6139'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AFFILIATED DOCTORS */}
        {activeTab === 'doctors' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>Affiliated Medical Doctors</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Doctors practicing or affiliated with {userProfile?.name}.</p>

            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '12px' }}>
              <Stethoscope size={40} color="var(--text-dim)" style={{ margin: '0 auto 10px auto' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No affiliated doctors linked yet.</p>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES */}
        {activeTab === 'services' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>Specialities & Working Days</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Available medical departments and operating hours.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="white-card" style={{ padding: '16px' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Active Specialities</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(userProfile?.specialities || ['General Medicine']).map((spec, i) => (
                    <span key={i} style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="white-card" style={{ padding: '16px' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Operating Days</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(userProfile?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']).map((day, i) => (
                    <span key={i} style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT ORG MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Edit Facility Details</h3>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="grid-2col">
                <div className="form-group col-span-2">
                  <label className="form-label">Facility Name</label>
                  <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input type="text" className="form-input" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Building No</label>
                  <input type="text" className="form-input" value={buildingNo} onChange={(e) => setBuildingNo(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Landmark</label>
                  <input type="text" className="form-input" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input type="text" className="form-input" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                </div>

                {/* GPS Coordinates with Get Location button */}
                <div className="form-group col-span-2">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Coordinates (Longitude & Latitude)</label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#059669' }}
                      disabled={isLocating}
                    >
                      <Navigation size={12} className={isLocating ? 'spin' : ''} />
                      <span>{isLocating ? 'Locating...' : 'Get GPS Location'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
                    <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-success" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
