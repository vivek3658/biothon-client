import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/axios';
import {
  Lock,
  User,
  ShieldCheck,
  Building2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Navigation,
  MapPin,
  FileText,
  Activity,
  Users,
  Heart,
  BadgeCheck,
  Globe,
  X,
  Plus,
  Check
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

const safeParseResponse = async (res) => {
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { error: `Server error (${res.status}): ${text || 'Empty response'}` };
  }
  return { status: res.status, ok: res.ok, data };
};

const portalCards = [
  { id: 'user', icon: User, label: 'Patient / Doctor', text: 'Personal health identity, patient access, and doctor onboarding.' },
  { id: 'org', icon: Building2, label: 'Organization', text: 'Hospital, clinic, lab, pharmacy, and facility registration.' },
  { id: 'employee', icon: ShieldCheck, label: 'Admin / Staff', text: 'Administrative access for operations, approvals, and catalog control.' }
];

// Official Google OAuth Sign-In Button Component using @react-oauth/google
const OfficialGoogleButton = ({ portalTarget, onGoogleAuthSuccess, setErrorMessage, setIsSubmitting }) => {
  const loginWithToken = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsSubmitting(true);
        setErrorMessage('');
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const googleUser = await userInfoRes.json();

        await onGoogleAuthSuccess({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub,
          portal: portalTarget
        });
      } catch (err) {
        setErrorMessage('Google authentication error: ' + err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: (errorResponse) => {
      setErrorMessage('Google OAuth Sign-In failed or was cancelled.');
    }
  });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            if (credentialResponse.credential) {
              try {
                setIsSubmitting(true);
                setErrorMessage('');
                await onGoogleAuthSuccess({
                  credential: credentialResponse.credential,
                  portal: portalTarget
                });
              } catch (err) {
                setErrorMessage('Google ID Token verification failed.');
              } finally {
                setIsSubmitting(false);
              }
            }
          }}
          onError={() => {
            setErrorMessage('Google Sign-In was unsuccessful.');
          }}
          shape="pill"
          theme="filled_blue"
          size="large"
          text="continue_with"
          width="340"
        />
      </div>

     
    </div>
  );
};

const LoginPageContent = () => {
  const { loginEmployee, loginUser, loginOrg, loginGoogle } = useAuth();
  const [activePortal, setActivePortal] = useState('user');

  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');

  const [userMode, setUserMode] = useState('login');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [isDoctor, setIsDoctor] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [houseNo, setHouseNo] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [floorNo, setFloorNo] = useState('0');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [stateName, setStateName] = useState('Gujarat');
  const [pincode, setPincode] = useState('380001');
  const [longitude, setLongitude] = useState('72.5714');
  const [latitude, setLatitude] = useState('23.0225');
  const [certNo, setCertNo] = useState('');
  const [certDoc, setCertDoc] = useState('');
  const [speciality, setSpeciality] = useState('');

  const [orgMode, setOrgMode] = useState('login');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [facilityType, setFacilityType] = useState('hospital');
  const [contactNumber, setContactNumber] = useState('');
  const [orgBuilding, setOrgBuilding] = useState('');
  const [orgFloorNo, setOrgFloorNo] = useState('0');
  const [orgLandmark, setOrgLandmark] = useState('');
  const [orgCity, setOrgCity] = useState('Ahmedabad');
  const [orgState, setOrgState] = useState('Gujarat');
  const [orgPincode, setOrgPincode] = useState('380001');
  const [orgLng, setOrgLng] = useState('72.5714');
  const [orgLat, setOrgLat] = useState('23.0225');
  const [orgCertNo, setOrgCertNo] = useState('');
  const [orgCertUrl, setOrgCertUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Process Official Google OAuth Response
  const handleGoogleAuthSuccess = async (payload) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const data = await loginGoogle(payload);

      if (data.needsProfile) {
        if (activePortal === 'user') {
          setUserMode('register');
          setUserEmail(data.email || payload.email || '');
          setUserName(data.name || payload.name || '');
          setSuccessMessage(`Google account (${data.email || payload.email}) verified! Please complete your role and location details below.`);
        } else {
          setOrgMode('register');
          setOrgEmail(data.email || payload.email || '');
          setOrgName(data.name || payload.name || '');
          setSuccessMessage(`Google organization account (${data.email || payload.email}) verified! Please complete facility details below.`);
        }
      } else {
        setSuccessMessage('Google OAuth login successful! Redirecting...');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google OAuth sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetCurrentLocation = (target) => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lng = pos.coords.longitude.toFixed(4);
        const lat = pos.coords.latitude.toFixed(4);
        if (target === 'user') {
          setLongitude(lng);
          setLatitude(lat);
        } else {
          setOrgLng(lng);
          setOrgLat(lat);
        }
        setIsLocating(false);
      },
      (err) => {
        setErrorMessage('Failed to retrieve GPS location: ' + err.message);
        setIsLocating(false);
      }
    );
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');
      await loginEmployee(empUsername.trim(), empPassword);
    } catch (err) {
      setErrorMessage(err.message || 'Employee authentication failed. Check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      setIsSubmitting(true);
      if (userMode === 'login') {
        await loginUser(userEmail.trim(), userPassword);
      } else {
        let accountId = null;

        if (userPassword) {
          const { data: data1 } = await apiClient.post('/auth/create-account', {
            email: userEmail.trim(),
            password: userPassword,
            entityModel: 'User'
          });
          if (data1.accountId) accountId = data1.accountId;
          if (data1.token) {
            localStorage.setItem('token', data1.token);
          }
        }

        const { data: data2 } = await apiClient.post('/user/complete-profile', {
          accountId,
          email: userEmail.trim(),
          name: userName || 'User',
          isDoctor,
          location: {
            houseNo: houseNo || '',
            roomNo: roomNo || '',
            floorNo: parseInt(floorNo, 10) || 0,
            landmark: landmark || '',
            city: city || 'Ahmedabad',
            state: stateName || 'Gujarat',
            pincode: pincode || '380001'
          },
          coordinates: [parseFloat(longitude) || 72.5714, parseFloat(latitude) || 23.0225],
          bloodGroup: bloodGroup || 'A+',
          certificateNo: isDoctor ? (certNo || `MCI-${Date.now()}`) : null,
          certificateDoc: isDoctor ? (certDoc || 'https://example.com/doc-cert.pdf') : null,
          speciality: isDoctor ? (speciality || 'General Medicine') : null
        });

        if (data2.token) localStorage.setItem('token', data2.token);

        if (userPassword) {
          await loginUser(userEmail.trim(), userPassword);
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      setIsSubmitting(true);
      if (orgMode === 'login') {
        await loginOrg(orgEmail.trim(), orgPassword);
      } else {
        let accountId = null;

        if (orgPassword) {
          const { data: data1 } = await apiClient.post('/auth/create-account', {
            email: orgEmail.trim(),
            password: orgPassword,
            entityModel: 'Organization'
          });
          if (data1.accountId) accountId = data1.accountId;
          if (data1.token) {
            localStorage.setItem('token', data1.token);
          }
        }

        const { data: data2 } = await apiClient.post('/auth/complete-org-profile', {
          accountId,
          email: orgEmail.trim(),
          name: orgName || 'Organization',
          facilityType,
          contactNumber: contactNumber || '9876543210',
          location: {
            buildingNo: orgBuilding || '',
            floorNo: parseInt(orgFloorNo, 10) || 0,
            landmark: orgLandmark || '',
            city: orgCity || 'Ahmedabad',
            state: orgState || 'Gujarat',
            pincode: orgPincode || '380001'
          },
          coordinates: [parseFloat(orgLng) || 72.5714, parseFloat(orgLat) || 23.0225],
          organizationCertificateNo: orgCertNo || `ORG-CERT-${Date.now()}`,
          organizationCertificateUrl: orgCertUrl || 'https://example.com/org-cert.pdf'
        });

        if (data2.token) localStorage.setItem('token', data2.token);

        if (orgPassword) {
          await loginOrg(orgEmail.trim(), orgPassword);
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Organization authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionTitle = activePortal === 'user'
    ? (userMode === 'login' ? 'User Sign In' : 'Create User Identity')
    : activePortal === 'org'
      ? (orgMode === 'login' ? 'Organization Sign In' : 'Register Facility')
      : 'Administrative Staff Portal';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <div className="bg-ambient-pattern" />
      <div className="bg-ambient-glow-1" />
      <div className="bg-ambient-glow-2" />

      <header style={{ borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '16px 32px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logoImg} alt="ArogyaX Logo" style={{ height: '44px', objectFit: 'contain' }} />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.5px' }}>Arogya<span style={{ color: '#ea580c' }}>X</span> Health Identity</h1>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Official Google OAuth 2.0 Identity Portal</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge-approved"><BadgeCheck size={12} /> Official Google OAuth 2.0</span>
            <span className="badge badge-pending"><Globe size={12} /> Google Identity Services</span>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) minmax(520px, 760px)', gap: '28px', maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '32px', position: 'relative', zIndex: 2 }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="white-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Secure Onboarding Workspace</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>Select your portal and authenticate directly using Official Google OAuth 2.0.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {portalCards.map((card) => {
                const Icon = card.icon;
                const active = activePortal === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => { setActivePortal(card.id); setErrorMessage(''); setSuccessMessage(''); }}
                    className="btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '14px 16px', borderRadius: '14px', background: active ? '#eff6ff' : '#fff', borderColor: active ? '#93c5fd' : '#e2e8f0', color: active ? '#0369a1' : 'var(--text-main)' }}
                  >
                    <Icon size={18} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{card.label}</div>
                      <div style={{ fontSize: '0.75rem', color: active ? '#0f766e' : 'var(--text-muted)' }}>{card.text}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="white-panel" style={{ padding: '30px', alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '22px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>{sectionTitle}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Official Google OAuth 2.0 Authentication
              </p>
            </div>

            {activePortal === 'user' && (
              <button type="button" onClick={() => setUserMode(userMode === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer' }}>
                {userMode === 'login' ? 'Create Account' : 'Existing User? Sign In'}
              </button>
            )}
            {activePortal === 'org' && (
              <button type="button" onClick={() => setOrgMode(orgMode === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer' }}>
                {orgMode === 'login' ? 'Register Facility' : 'Existing Org? Sign In'}
              </button>
            )}
          </div>

          {errorMessage && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', fontSize: '0.86rem' }}><AlertCircle size={18} /><span>{errorMessage}</span></div>}
          {successMessage && <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', fontSize: '0.86rem' }}><CheckCircle2 size={18} /><span>{successMessage}</span></div>}

          {/* User Portal Form */}
          {activePortal === 'user' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Official Google OAuth 2.0 Login</h4>
                <OfficialGoogleButton
                  portalTarget="user"
                  onGoogleAuthSuccess={handleGoogleAuthSuccess}
                  setErrorMessage={setErrorMessage}
                  setIsSubmitting={setIsSubmitting}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', color: '#94a3b8', fontSize: '0.78rem' }}>
                <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
                <span style={{ padding: '0 12px', fontWeight: 700 }}>OR WITH LOCAL CREDENTIALS</span>
                <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
              </div>

              <form onSubmit={handleUserSubmit} style={{ display: 'grid', gap: '14px' }}>
                <div className="grid-2col" style={{ gap: '12px' }}>
                  <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-input" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="user1@gmail.com" required /></div>
                  <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="password" required={userMode === 'login'} /></div>
                </div>

                {userMode === 'register' && (
                  <>
                    <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g. Dr. Rajesh Patel" required /></div>

                    <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, cursor: 'pointer' }}>
                        <input type="checkbox" checked={isDoctor} onChange={(e) => setIsDoctor(e.target.checked)} />
                        <Stethoscope size={16} color="#0284c7" />
                        <span style={{ fontWeight: 700 }}>Register as Medical Practitioner / Doctor</span>
                      </label>
                    </div>

                    <div className="grid-2col" style={{ gap: '12px' }}>
                      {!isDoctor && <div className="form-group"><label className="form-label">Blood Group</label><select className="form-input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => <option key={bg} value={bg}>{bg}</option>)}</select></div>}
                      {isDoctor && <div className="form-group"><label className="form-label">Speciality</label><input type="text" className="form-input" value={speciality} onChange={(e) => setSpeciality(e.target.value)} placeholder="e.g. Cardiology" required /></div>}
                      {isDoctor && <div className="form-group"><label className="form-label">Certificate No</label><input type="text" className="form-input" value={certNo} onChange={(e) => setCertNo(e.target.value)} placeholder="e.g. MCI-998821" required /></div>}
                    </div>

                    {isDoctor && <div className="form-group"><label className="form-label">Certificate Document URL</label><input type="url" className="form-input" value={certDoc} onChange={(e) => setCertDoc(e.target.value)} placeholder="https://example.com/doc-cert.pdf" /></div>}

                    <div style={{ paddingTop: '8px' }}>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>Location & Address Schema (Ahmedabad)</h4>
                      <div className="grid-2col" style={{ gap: '12px' }}>
                        <div className="form-group"><label className="form-label">House / Flat No</label><input type="text" className="form-input" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="House 42-B" /></div>
                        <div className="form-group"><label className="form-label">Room No</label><input type="text" className="form-input" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} placeholder="Room A-12" /></div>
                        <div className="form-group"><label className="form-label">Floor No</label><input type="number" className="form-input" value={floorNo} onChange={(e) => setFloorNo(e.target.value)} min="0" /></div>
                        <div className="form-group"><label className="form-label">Landmark</label><input type="text" className="form-input" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near SG Highway" /></div>
                        <div className="form-group"><label className="form-label">City</label><input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ahmedabad" required /></div>
                        <div className="form-group"><label className="form-label">State</label><input type="text" className="form-input" value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="Gujarat" required /></div>
                        <div className="form-group"><label className="form-label">Pincode</label><input type="text" className="form-input" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="380001" required /></div>
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>
                  <span>{isSubmitting ? 'Authenticating...' : userMode === 'login' ? 'Sign In to Portal' : 'Register User Identity'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}

          {/* Organization Portal Form */}
          {activePortal === 'org' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Official Google OAuth 2.0 Organization Login</h4>
                <OfficialGoogleButton
                  portalTarget="org"
                  onGoogleAuthSuccess={handleGoogleAuthSuccess}
                  setErrorMessage={setErrorMessage}
                  setIsSubmitting={setIsSubmitting}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', color: '#94a3b8', fontSize: '0.78rem' }}>
                <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
                <span style={{ padding: '0 12px', fontWeight: 700 }}>OR WITH LOCAL CREDENTIALS</span>
                <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
              </div>

              <form onSubmit={handleOrgSubmit} style={{ display: 'grid', gap: '14px' }}>
                <div className="grid-2col" style={{ gap: '12px' }}>
                  <div className="form-group"><label className="form-label">Organization Email</label><input type="email" className="form-input" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} placeholder="hospital1@gmail.com" required /></div>
                  <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={orgPassword} onChange={(e) => setOrgPassword(e.target.value)} placeholder="password" required={orgMode === 'login'} /></div>
                </div>

                {orgMode === 'register' && (
                  <>
                    <div className="grid-2col" style={{ gap: '12px' }}>
                      <div className="form-group"><label className="form-label">Organization Name</label><input type="text" className="form-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Ahmedabad City Hospital 1" required /></div>
                      <div className="form-group"><label className="form-label">Facility Type</label><select className="form-input" value={facilityType} onChange={(e) => setFacilityType(e.target.value)}>{['hospital', 'clinic', 'laboratory', 'pharmacy', 'other'].map((type) => <option key={type} value={type}>{type.toUpperCase()}</option>)}</select></div>
                    </div>

                    <div className="grid-2col" style={{ gap: '12px' }}>
                      <div className="form-group"><label className="form-label">Official Contact Number</label><input type="tel" className="form-input" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="+91 9876543210" required /></div>
                      <div className="form-group"><label className="form-label">License Certificate / Registration No</label><input type="text" className="form-input" value={orgCertNo} onChange={(e) => setOrgCertNo(e.target.value)} placeholder="e.g. HOSP-AHM-202601" required /></div>
                    </div>

                    <div className="form-group"><label className="form-label">Certificate Document URL</label><input type="url" className="form-input" value={orgCertUrl} onChange={(e) => setOrgCertUrl(e.target.value)} placeholder="https://example.com/certs/hospital.pdf" /></div>

                    <div style={{ paddingTop: '8px' }}>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>Organization Facility Address & Location</h4>
                      <div className="grid-2col" style={{ gap: '12px' }}>
                        <div className="form-group"><label className="form-label">Building / Premises Name</label><input type="text" className="form-input" value={orgBuilding} onChange={(e) => setOrgBuilding(e.target.value)} placeholder="e.g. Building H-1" /></div>
                        <div className="form-group"><label className="form-label">Floor No</label><input type="number" className="form-input" value={orgFloorNo} onChange={(e) => setOrgFloorNo(e.target.value)} min="0" /></div>
                        <div className="form-group"><label className="form-label">Landmark</label><input type="text" className="form-input" value={orgLandmark} onChange={(e) => setOrgLandmark(e.target.value)} placeholder="Near SG Highway" /></div>
                        <div className="form-group"><label className="form-label">City</label><input type="text" className="form-input" value={orgCity} onChange={(e) => setOrgCity(e.target.value)} placeholder="Ahmedabad" required /></div>
                        <div className="form-group"><label className="form-label">State</label><input type="text" className="form-input" value={orgState} onChange={(e) => setOrgState(e.target.value)} placeholder="Gujarat" required /></div>
                        <div className="form-group"><label className="form-label">Pincode</label><input type="text" className="form-input" value={orgPincode} onChange={(e) => setOrgPincode(e.target.value)} placeholder="380001" required /></div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label className="form-label" style={{ margin: 0 }}>GPS Coordinates (Longitude, Latitude)</label>
                          <button type="button" onClick={() => handleGetCurrentLocation('org')} disabled={isLocating} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                            <Navigation size={12} />
                            <span>{isLocating ? 'Locating...' : 'Use Current GPS'}</span>
                          </button>
                        </div>
                        <div className="grid-2col" style={{ gap: '10px' }}>
                          <input type="text" className="form-input" value={orgLng} onChange={(e) => setOrgLng(e.target.value)} placeholder="72.5714" />
                          <input type="text" className="form-input" value={orgLat} onChange={(e) => setOrgLat(e.target.value)} placeholder="23.0225" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>
                  <span>{isSubmitting ? 'Authenticating...' : orgMode === 'login' ? 'Sign In to Org Portal' : 'Register Organization'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}

          {activePortal === 'employee' && (
            <form onSubmit={handleEmployeeSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div className="grid-2col" style={{ gap: '12px' }}>
                <div className="form-group"><label className="form-label">Username</label><input type="text" className="form-input" value={empUsername} onChange={(e) => setEmpUsername(e.target.value)} placeholder="admin or manager username" required /></div>
                <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} placeholder="Enter password" required /></div>
              </div>
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Staff Portal'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
};

export const LoginPage = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1082194917395-sample_client_id.apps.googleusercontent.com';
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginPageContent />
    </GoogleOAuthProvider>
  );
};
