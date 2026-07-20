import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Heart, 
  Stethoscope, 
  MapPin, 
  Award, 
  Users, 
  UserPlus, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  X, 
  ExternalLink,
  Trash2,
  AlertTriangle,
  FileText,
  Pill,
  Activity,
  Edit3,
  Navigation,
  RefreshCw,
  Repeat
} from 'lucide-react';

// Helper: build auth headers from localStorage token
const getAuthHeaders = (contentType = true) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (contentType) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const UserDashboard = () => {
  const { userProfile, refreshUser, logout } = useAuth();
  
  // Doctor Dual Mode State: 'doctor' | 'patient'
  const [activeMode, setActiveMode] = useState(userProfile?.isDoctor ? 'doctor' : 'patient');
  
  // Sidebar active tab
  const [activeTab, setActiveTab] = useState(userProfile?.isDoctor ? 'practitioner' : 'profile');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('A+');
  const [editRoomNo, setEditRoomNo] = useState('');
  const [editFloorNo, setEditFloorNo] = useState(0);
  const [editLandmark, setEditLandmark] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editLng, setEditLng] = useState('77.2090');
  const [editLat, setEditLat] = useState('28.6139');
  
  // Doctor Edit
  const [editSpeciality, setEditSpeciality] = useState('');
  const [editCertNo, setEditCertNo] = useState('');
  const [editCertDoc, setEditCertDoc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Add Family Member Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState('search');
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Sub-Account Form
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPassword, setSubPassword] = useState('');
  const [subBloodGroup, setSubBloodGroup] = useState('A+');
  const [subCity, setSubCity] = useState('');
  const [subState, setSubState] = useState('');
  const [subPincode, setSubPincode] = useState('');

  // Mock Prescriptions & Reports
  const [prescriptions] = useState([
    { id: 'rx-101', doctor: 'Dr. Alex Sharma', date: '2026-07-15', medication: 'Amoxicillin 500mg (1-0-1)', notes: 'Take after food for 5 days.' }
  ]);
  const [reports] = useState([
    { id: 'rep-201', lab: 'Apex Diagnostics', date: '2026-07-10', title: 'Complete Blood Count (CBC)', status: 'Normal' }
  ]);

  // Sync edit form fields when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.name || '');
      setEditBloodGroup(userProfile.bloodGroup || 'A+');
      setEditRoomNo(userProfile.location?.roomNo || '');
      setEditFloorNo(userProfile.location?.floorNo || 0);
      setEditLandmark(userProfile.location?.landmark || '');
      setEditCity(userProfile.location?.city || '');
      setEditState(userProfile.location?.state || '');
      setEditPincode(userProfile.location?.pincode || '');
      // coordinates is a flat array [lng, lat] — NOT GeoJSON
      setEditLng(userProfile.coordinates?.[0] ?? '77.2090');
      setEditLat(userProfile.coordinates?.[1] ?? '28.6139');
      if (userProfile.isDoctor) {
        setEditSpeciality(userProfile.doctorDetails?.speciality || '');
        setEditCertNo(userProfile.doctorDetails?.certificateNo || '');
        setEditCertDoc(userProfile.doctorDetails?.certificateDoc || '');
      }
    }
  }, [userProfile]);

  // GPS Current Location Helper
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditLng(pos.coords.longitude.toFixed(4));
        setEditLat(pos.coords.latitude.toFixed(4));
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
    if (!userProfile?._id) {
      setError('User profile ID not found. Please refresh page.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMsg('');

      const payload = {
        name: editName || userProfile.name || 'User',
        bloodGroup: editBloodGroup || 'A+',
        location: {
          roomNo: editRoomNo || '',
          floorNo: parseInt(editFloorNo, 10) || 0,
          landmark: editLandmark || '',
          city: editCity || 'New Delhi',
          state: editState || 'Delhi',
          pincode: editPincode || '110001'
        },
        coordinates: [parseFloat(editLng) || 77.2090, parseFloat(editLat) || 28.6139]
      };

      if (userProfile.isDoctor) {
        payload.doctorDetails = {
          speciality: editSpeciality || 'General Medicine',
          certificateNo: editCertNo || `MCI-${Date.now()}`,
          certificateDoc: editCertDoc || 'https://example.com/doc-cert.pdf'
        };
      }

      const res = await fetch(`/user/profile/${userProfile._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Failed to update profile');

      setSuccessMsg('User profile updated successfully!');
      setShowEditModal(false);
      refreshUser();
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to submit profile update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchEmail = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    try {
      setIsSearching(true);
      setError('');
      setFoundUser(null);
      const res = await fetch(`/user/search?email=${encodeURIComponent(searchEmail.trim())}`, {
        headers: getAuthHeaders(false),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No user found');
      setFoundUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendLinkRequest = async () => {
    if (!foundUser) return;
    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/user/managed-profiles/request', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ targetEmail: foundUser.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send request');
      setSuccessMsg('Family member link request sent successfully!');
      setShowAddModal(false);
      setFoundUser(null);
      setSearchEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubAccount = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/user/managed-profiles/create-sub-account', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          name: subName || 'Family Member',
          email: subEmail,
          password: subPassword,
          bloodGroup: subBloodGroup || 'A+',
          location: { roomNo: '1', floorNo: 0, landmark: 'Home', city: subCity || 'New Delhi', state: subState || 'Delhi', pincode: subPincode || '110001' }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sub-account creation failed');

      setSuccessMsg(`Family member "${subName}" created & attached to your managed profiles!`);
      setShowAddModal(false);
      setSubName('');
      setSubEmail('');
      setSubPassword('');
      refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      {/* USER SIDEBAR NAVIGATION */}
      <aside className="app-sidebar">
        {/* Doctor Mode Switcher */}
        {userProfile?.isDoctor && (
          <div style={{
            padding: '12px',
            borderRadius: '10px',
            background: activeMode === 'doctor' ? '#ecfdf5' : '#e0f2fe',
            border: activeMode === 'doctor' ? '1px solid #a7f3d0' : '1px solid #bae6fd',
            marginBottom: '6px'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: activeMode === 'doctor' ? '#047857' : '#0369a1', textTransform: 'uppercase', marginBottom: '6px' }}>
              Active Profile Mode
            </div>
            <button
              type="button"
              onClick={() => {
                const nextMode = activeMode === 'doctor' ? 'patient' : 'doctor';
                setActiveMode(nextMode);
                setActiveTab(nextMode === 'doctor' ? 'practitioner' : 'profile');
              }}
              className="btn-secondary"
              style={{ width: '100%', padding: '6px', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              <Repeat size={13} />
              <span>Switch to {activeMode === 'doctor' ? 'Patient Mode' : 'Doctor Mode'}</span>
            </button>
          </div>
        )}

        {/* Doctor Mode Sidebar Items */}
        {activeMode === 'doctor' && (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 8px' }}>Doctor Workspace</span>
            <button type="button" onClick={() => setActiveTab('practitioner')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'practitioner' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'practitioner' ? '#a7f3d0' : 'transparent', color: activeTab === 'practitioner' ? '#059669' : 'var(--text-muted)' }}>
              <Stethoscope size={16} /><span>Doctor Profile</span>
            </button>
            <button type="button" onClick={() => setActiveTab('consultations')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'consultations' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'consultations' ? '#a7f3d0' : 'transparent', color: activeTab === 'consultations' ? '#059669' : 'var(--text-muted)' }}>
              <Users size={16} /><span>Consultations</span>
            </button>
          </nav>
        )}

        {/* Patient Mode Sidebar Items */}
        {activeMode === 'patient' && (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 8px' }}>Patient Workspace</span>
            <button type="button" onClick={() => setActiveTab('profile')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'profile' ? '#f0f9ff' : 'transparent', borderColor: activeTab === 'profile' ? '#bae6fd' : 'transparent', color: activeTab === 'profile' ? '#0284c7' : 'var(--text-muted)' }}>
              <User size={16} /><span>My Profile</span>
            </button>
            <button type="button" onClick={() => setActiveTab('family')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'family' ? '#f0f9ff' : 'transparent', borderColor: activeTab === 'family' ? '#bae6fd' : 'transparent', color: activeTab === 'family' ? '#0284c7' : 'var(--text-muted)' }}>
              <Users size={16} /><span>Managed Family ({userProfile?.managedProfiles?.length || 0})</span>
            </button>
            <button type="button" onClick={() => setActiveTab('prescriptions')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'prescriptions' ? '#f0f9ff' : 'transparent', borderColor: activeTab === 'prescriptions' ? '#bae6fd' : 'transparent', color: activeTab === 'prescriptions' ? '#0284c7' : 'var(--text-muted)' }}>
              <Pill size={16} /><span>Prescriptions</span>
            </button>
            <button type="button" onClick={() => setActiveTab('reports')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'reports' ? '#f0f9ff' : 'transparent', borderColor: activeTab === 'reports' ? '#bae6fd' : 'transparent', color: activeTab === 'reports' ? '#0284c7' : 'var(--text-muted)' }}>
              <FileText size={16} /><span>Lab Reports</span>
            </button>
          </nav>
        )}
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
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

        {/* TAB 1: MY PROFILE (PATIENT MODE) */}
        {activeTab === 'profile' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Personal Health Profile</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage location, blood group, and account details.</p>
              </div>
              <button type="button" onClick={() => setShowEditModal(true)} className="btn-primary" style={{ padding: '8px 14px' }}>
                <Edit3 size={16} /><span>Edit Profile</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.88rem' }}>
              <div className="white-card" style={{ padding: '14px' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Full Name</span>
                <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{userProfile?.name}</strong>
              </div>

              <div className="white-card" style={{ padding: '14px' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Blood Group</span>
                <strong style={{ color: '#dc2626', fontSize: '1rem' }}>{userProfile?.bloodGroup || 'Not specified'}</strong>
              </div>

              <div className="white-card" style={{ padding: '14px', gridColumn: 'span 2' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Full Location Address</span>
                <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  {userProfile?.location?.roomNo ? `Room ${userProfile.location.roomNo}, ` : ''}
                  {userProfile?.location?.floorNo ? `Floor ${userProfile.location.floorNo}, ` : ''}
                  {userProfile?.location?.landmark ? `Landmark: ${userProfile.location.landmark}, ` : ''}
                  {userProfile?.location?.city || 'New Delhi'}, {userProfile?.location?.state || 'Delhi'} - {userProfile?.location?.pincode || '110001'}
                </p>
              </div>

              <div className="white-card" style={{ padding: '14px', gridColumn: 'span 2' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>GPS Coordinates</span>
                <p style={{ color: '#0284c7', fontWeight: 700 }}>
                  Longitude: {userProfile?.coordinates?.[0] || '77.2090'} | Latitude: {userProfile?.coordinates?.[1] || '28.6139'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGED FAMILY PROFILES */}
        {activeTab === 'family' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Managed Family Profiles</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Search existing users by email or create new family sub-accounts.</p>
              </div>
              <button type="button" onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '8px 14px' }}>
                <UserPlus size={16} /><span>Add Family Member</span>
              </button>
            </div>

            {(!userProfile?.managedProfiles || userProfile.managedProfiles.length === 0) ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '12px' }}>
                <Users size={40} color="var(--text-dim)" style={{ margin: '0 auto 10px auto' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No family member profiles attached yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {userProfile.managedProfiles.map((member) => (
                  <div key={member._id} className="white-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontWeight: 800 }}>
                      {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{member.name}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Blood: <strong style={{ color: '#dc2626' }}>{member.bloodGroup || 'N/A'}</strong> • {member.location?.city || ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Medical Prescriptions</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Prescriptions issued by verified medical practitioners.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {prescriptions.map((rx) => (
                <div key={rx.id} className="white-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Pill size={24} color="#0284c7" />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{rx.medication}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Prescribed by <strong>{rx.doctor}</strong> on {rx.date}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>"{rx.notes}"</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LAB REPORTS */}
        {activeTab === 'reports' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Diagnostic Lab Reports</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Health & diagnostic reports from verified laboratories.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reports.map((rep) => (
                <div key={rep.id} className="white-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <FileText size={24} color="#059669" />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{rep.title}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Issued by <strong>{rep.lab}</strong> on {rep.date}</p>
                    </div>
                  </div>
                  <span className="badge badge-approved">{rep.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCTOR PRACTITIONER TAB */}
        {activeTab === 'practitioner' && userProfile?.isDoctor && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Doctor Practitioner Profile</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Medical credentials & manager verification status.</p>
              </div>
              <span className={userProfile.doctorDetails?.managerApprovalStatus === 'approved' ? 'badge badge-approved' : 'badge badge-pending'}>
                {userProfile.doctorDetails?.managerApprovalStatus === 'approved' ? 'VERIFIED DOCTOR' : 'PENDING MANAGER APPROVAL'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.88rem' }}>
              <div className="white-card" style={{ padding: '14px' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Speciality</span>
                <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{userProfile.doctorDetails?.speciality || 'General Medicine'}</strong>
              </div>
              <div className="white-card" style={{ padding: '14px' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Registration Certificate No</span>
                <strong style={{ color: '#ea580c', fontSize: '1rem' }}>{userProfile.doctorDetails?.certificateNo}</strong>
              </div>
              {userProfile.doctorDetails?.certificateDoc && (
                <div className="white-card" style={{ padding: '14px', gridColumn: 'span 2' }}>
                  <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Certificate PDF Proof</span>
                  <a href={userProfile.doctorDetails.certificateDoc} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                    <ExternalLink size={12} /><span>View PDF Document</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Edit Profile Details</h3>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="grid-2col">
                <div className="form-group col-span-2">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-input" value={editBloodGroup} onChange={(e) => setEditBloodGroup(e.target.value)}>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Room / Flat No</label>
                  <input type="text" className="form-input" value={editRoomNo} onChange={(e) => setEditRoomNo(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Floor No</label>
                  <input type="number" className="form-input" value={editFloorNo} onChange={(e) => setEditFloorNo(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Landmark</label>
                  <input type="text" className="form-input" value={editLandmark} onChange={(e) => setEditLandmark(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" value={editCity} onChange={(e) => setEditCity(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" value={editState} onChange={(e) => setEditState(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input type="text" className="form-input" value={editPincode} onChange={(e) => setEditPincode(e.target.value)} required />
                </div>

                {/* GPS Coordinates with Get Location button */}
                <div className="form-group col-span-2">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>GPS Coordinates (Longitude & Latitude)</label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#0284c7' }}
                      disabled={isLocating}
                    >
                      <Navigation size={12} className={isLocating ? 'spin' : ''} />
                      <span>{isLocating ? 'Locating...' : 'Get GPS Location'}</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Longitude (77.2090)" value={editLng} onChange={(e) => setEditLng(e.target.value)} required />
                    <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Latitude (28.6139)" value={editLat} onChange={(e) => setEditLat(e.target.value)} required />
                  </div>
                </div>

                {/* Doctor-specific fields in edit modal */}
                {userProfile?.isDoctor && (
                  <>
                    <div className="form-group col-span-2">
                      <label className="form-label">Medical Speciality</label>
                      <input type="text" className="form-input" value={editSpeciality} onChange={(e) => setEditSpeciality(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Certificate No</label>
                      <input type="text" className="form-input" value={editCertNo} onChange={(e) => setEditCertNo(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Certificate PDF URL</label>
                      <input type="url" className="form-input" value={editCertDoc} onChange={(e) => setEditCertDoc(e.target.value)} />
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FAMILY MEMBER MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Add Family Member Profile</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
              <button type="button" onClick={() => setAddMode('search')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: addMode === 'search' ? '#ffffff' : 'transparent', color: addMode === 'search' ? '#0284c7' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                Search via Email
              </button>
              <button type="button" onClick={() => setAddMode('create')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: addMode === 'create' ? '#ffffff' : 'transparent', color: addMode === 'create' ? '#059669' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                Create New Sub-Account
              </button>
            </div>

            {addMode === 'search' && (
              <div>
                <form onSubmit={handleSearchEmail} style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Search Family Member Email</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="email" className="form-input" style={{ flex: 1 }} placeholder="family@arogyax.com" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} required />
                      <button type="submit" className="btn-primary" disabled={isSearching}><Search size={14} /><span>Search</span></button>
                    </div>
                  </div>
                </form>

                {foundUser && (
                  <div className="white-card" style={{ padding: '16px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1' }}>{foundUser.profile?.name || foundUser.email}</h4>
                    <button type="button" onClick={handleSendLinkRequest} className="btn-success" disabled={isSubmitting} style={{ width: '100%', marginTop: '12px' }}>
                      Send Link Request
                    </button>
                  </div>
                )}
              </div>
            )}

            {addMode === 'create' && (
              <form onSubmit={handleCreateSubAccount}>
                <div className="grid-2col">
                  <div className="form-group col-span-2">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="Family Member Name" value={subName} onChange={(e) => setSubName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sub-Account Email</label>
                    <input type="email" className="form-input" placeholder="sub@arogyax.com" value={subEmail} onChange={(e) => setSubEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" placeholder="••••••••" value={subPassword} onChange={(e) => setSubPassword(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select className="form-input" value={subBloodGroup} onChange={(e) => setSubBloodGroup(e.target.value)}>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" className="form-input" placeholder="New Delhi" value={subCity} onChange={(e) => setSubCity(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input type="text" className="form-input" placeholder="Delhi" value={subState} onChange={(e) => setSubState(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input type="text" className="form-input" placeholder="110001" value={subPincode} onChange={(e) => setSubPincode(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-success" disabled={isSubmitting}>Create & Auto-Attach</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
