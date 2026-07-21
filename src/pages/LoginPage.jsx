import React, { useState } from 'react';
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
  Sparkles,
  FlaskConical,
  Building
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

// Official Google OAuth Button Component
const OfficialGoogleButton = ({ onGoogleAuthSuccess, setErrorMessage, setIsSubmitting }) => {
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
                  credential: credentialResponse.credential
                });
              } catch (err) {
                setErrorMessage('Google ID Token verification failed: ' + (err.message || ''));
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
          width="360"
        />
      </div>
    </div>
  );
};

const roleOptions = [
  { id: 'patient', label: 'Patient', icon: User, text: 'Personal Health Identity & Medical Records', entityModel: 'User' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, text: 'Medical Practitioner & Patient Consultations', entityModel: 'User' },
  { id: 'hospital', label: 'Hospital', icon: Building2, text: 'Inpatient & Emergency Health Center', entityModel: 'Organization' },
  { id: 'clinic', label: 'Clinic', icon: Building, text: 'Outpatient & Specialist Clinic', entityModel: 'Organization' },
  { id: 'laboratory', label: 'Laboratory', icon: FlaskConical, text: 'Diagnostic & Pathology Lab Center', entityModel: 'Organization' }
];

const LoginPageContent = () => {
  const { loginUnified, loginGoogle, refreshUser } = useAuth();

  // Primary mode: 'login' | 'register' | 'google_role_select' | 'complete_profile'
  const [mode, setMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('patient');

  // Basic Account Credentials
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [createdAccountId, setCreatedAccountId] = useState(null);

  // Profile Details
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [speciality, setSpeciality] = useState('General Medicine');
  const [certNo, setCertNo] = useState('');
  const [certDoc, setCertDoc] = useState('');

  const [contactNumber, setContactNumber] = useState('');
  const [orgCertNo, setOrgCertNo] = useState('');
  const [orgCertUrl, setOrgCertUrl] = useState('');

  // Location & Address Schema
  const [buildingNo, setBuildingNo] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [floorNo, setFloorNo] = useState('0');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [stateName, setStateName] = useState('Gujarat');
  const [pincode, setPincode] = useState('380001');
  const [longitude, setLongitude] = useState('72.5714');
  const [latitude, setLatitude] = useState('23.0225');

  // UI Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Handle Google Auth Response
  const handleGoogleAuthSuccess = async (payload) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const data = await loginGoogle(payload);

      if (data.needsProfile) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.accountId) {
          setCreatedAccountId(data.accountId);
        }
        if (data.email) {
          setRegisterEmail(data.email);
        }
        if (data.name) {
          setRegisterName(data.name);
        }
        setSuccessMessage(`Google account (${data.email || 'verified'}) authenticated! Please select your role to complete profile.`);
        setMode('google_role_select');
      } else {
        setSuccessMessage('Google OAuth login successful! Redirecting...');
        await refreshUser();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google OAuth sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
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
        setErrorMessage('Failed to retrieve GPS location: ' + err.message);
        setIsLocating(false);
      }
    );
  };

  // 1. Unified Login (Patient, Doctor, Hospital, Clinic, Lab, Admin, Manager)
  const handleUnifiedLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      setIsSubmitting(true);
      await loginUnified(loginIdentifier.trim(), loginPassword);
      setSuccessMessage('Login successful! Redirecting...');
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Step 1 of Registration: Create Base Account Entity
  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetEntityModel = ['hospital', 'clinic', 'laboratory'].includes(selectedRole) ? 'Organization' : 'User';

    try {
      setIsSubmitting(true);
      const { data } = await apiClient.post('/auth/create-account', {
        email: registerEmail.trim(),
        password: registerPassword,
        entityModel: targetEntityModel
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.accountId) {
        setCreatedAccountId(data.accountId);
      }

      setSuccessMessage('Base account created successfully! Please fill details below to complete profile.');
      setMode('complete_profile');
    } catch (err) {
      setErrorMessage(err.message || 'Account creation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Step 2 of Registration: Complete Profile API
  const handleCompleteProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const isOrg = ['hospital', 'clinic', 'laboratory'].includes(selectedRole);

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');

      if (isOrg) {
        // Complete Organization Profile (Hospital, Clinic, Laboratory)
        const { data } = await apiClient.post('/auth/complete-org-profile', {
          accountId: createdAccountId,
          email: registerEmail.trim(),
          name: registerName || 'Healthcare Facility',
          facilityType: selectedRole,
          contactNumber: contactNumber || '9876543210',
          location: {
            buildingNo: buildingNo || '',
            floorNo: parseInt(floorNo, 10) || 0,
            landmark: landmark || '',
            city: city || 'Ahmedabad',
            state: stateName || 'Gujarat',
            pincode: pincode || '380001'
          },
          coordinates: [parseFloat(longitude) || 72.5714, parseFloat(latitude) || 23.0225],
          organizationCertificateNo: orgCertNo || `REG-${Date.now()}`,
          organizationCertificateUrl: orgCertUrl || 'https://example.com/cert.pdf'
        });

        if (data.token) {
          localStorage.setItem('token', data.token);
        }
      } else {
        // Complete User Profile (Patient or Doctor)
        const isDoctor = selectedRole === 'doctor';
        const { data } = await apiClient.post('/user/complete-profile', {
          accountId: createdAccountId,
          email: registerEmail.trim(),
          name: registerName || 'User Profile',
          isDoctor,
          location: {
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

        if (data.token) {
          localStorage.setItem('token', data.token);
        }
      }

      setSuccessMessage('Profile completed successfully! Logging in...');
      await refreshUser();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete profile details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <div className="bg-ambient-pattern" />
      <div className="bg-ambient-glow-1" />
      <div className="bg-ambient-glow-2" />

      {/* Top Navbar */}
      <header style={{ borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '16px 32px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logoImg} alt="ArogyaX Logo" style={{ height: '44px', objectFit: 'contain' }} />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.5px' }}>Arogya<span style={{ color: '#ea580c' }}>X</span> Health Identity</h1>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Unified Access & Google OAuth Portal</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge-approved"><BadgeCheck size={12} /> Google OAuth 2.0 Verified</span>
            <span className="badge badge-pending"><Globe size={12} /> Combined Portal</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', position: 'relative', zIndex: 2 }}>
        <div className="white-panel" style={{ maxWidth: '780px', width: '100%', padding: '36px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>

          {/* Mode Navigation Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', borderBottom: '1px solid #f1f5f9', paddingBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {mode === 'login' && 'Unified Sign In'}
                {mode === 'register' && 'New Account Registration'}
                {mode === 'google_role_select' && 'Select Your Account Role'}
                {mode === 'complete_profile' && `Complete Profile Details (${selectedRole.toUpperCase()})`}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {mode === 'login' && 'Sign in to your Patient, Doctor, Hospital, Clinic, Laboratory, or Admin account.'}
                {mode === 'register' && 'Step 1: Choose role and create basic account entity.'}
                {mode === 'google_role_select' && 'Select role for your verified Google account.'}
                {mode === 'complete_profile' && 'Step 2: Enter location and profile information to complete setup.'}
              </p>
            </div>

            {(mode === 'login' || mode === 'register') && (
              <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: mode === 'login' ? '#ffffff' : 'transparent',
                    color: mode === 'login' ? '#0284c7' : '#64748b',
                    boxShadow: mode === 'login' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: mode === 'register' ? '#ffffff' : 'transparent',
                    color: mode === 'register' ? '#0284c7' : '#64748b',
                    boxShadow: mode === 'register' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  New User / Register
                </button>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#dc2626', fontSize: '0.88rem' }}>
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#047857', fontSize: '0.88rem' }}>
              <CheckCircle2 size={20} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE 1: UNIFIED LOGIN (START SCREEN) */}
          {mode === 'login' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              {/* Option 1: Google OAuth */}
              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: '#e0f2fe', color: '#0284c7', fontSize: '0.78rem', fontWeight: 800, marginBottom: '14px' }}>
                  <Sparkles size={14} /> Option 1: Fast Google OAuth Sign-In
                </div>
                <OfficialGoogleButton
                  onGoogleAuthSuccess={handleGoogleAuthSuccess}
                  setErrorMessage={setErrorMessage}
                  setIsSubmitting={setIsSubmitting}
                />
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
                <span style={{ padding: '0 16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Option 2: Unified Email / Password Sign In
                </span>
                <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
              </div>

              {/* Form Option 2: Unified Credentials Login */}
              <form onSubmit={handleUnifiedLoginSubmit} style={{ display: 'grid', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address / Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter email or username (e.g. user1@gmail.com, hospital1@gmail.com, or admin)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', justifyContent: 'center', marginTop: '6px' }}
                >
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In to ArogyaX'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                  New to ArogyaX?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Register New Account Entity
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* MODE 2: NEW USER BASIC ACCOUNT REGISTRATION */}
          {mode === 'register' && (
            <form onSubmit={handleCreateAccountSubmit} style={{ display: 'grid', gap: '22px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '10px' }}>Select User Entity / Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '14px 10px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          color: isSelected ? '#0369a1' : 'var(--text-main)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Icon size={22} color={isSelected ? '#0284c7' : '#64748b'} />
                        <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid-2col" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Account Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="e.g. user@domain.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Choose secure password"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name / Facility Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder={['hospital', 'clinic', 'laboratory'].includes(selectedRole) ? 'e.g. Apex Health Hospital' : 'e.g. Dr. Rajesh Sharma or John Doe'}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', padding: '14px', fontSize: '0.98rem', justifyContent: 'center' }}
              >
                <span>{isSubmitting ? 'Creating Account...' : 'Continue to Profile Details'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* MODE 3: GOOGLE NEW USER ROLE SELECTION */}
          {mode === 'google_role_select' && (
            <div style={{ display: 'grid', gap: '22px' }}>
              <div style={{ padding: '16px', background: '#e0f2fe', borderRadius: '16px', color: '#0369a1', fontSize: '0.9rem', fontWeight: 600 }}>
                Google account verified: <strong>{registerEmail}</strong>. Select your role to complete profile.
              </div>

              <label className="form-label">Select Account Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '14px 10px',
                        borderRadius: '16px',
                        border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        color: isSelected ? '#0369a1' : 'var(--text-main)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        gap: '6px'
                      }}
                    >
                      <Icon size={22} color={isSelected ? '#0284c7' : '#64748b'} />
                      <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{role.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setMode('complete_profile')}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '0.98rem', justifyContent: 'center' }}
              >
                <span>Proceed to Enter Profile Details</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* MODE 4: COMPLETE PROFILE FORM (TRIGGERED AFTER ACCOUNT REGISTRATION OR GOOGLE ROLE SELECTION) */}
          {mode === 'complete_profile' && (
            <form onSubmit={handleCompleteProfileSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Complete Profile for {selectedRole.toUpperCase()}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Account Email: <strong>{registerEmail}</strong></p>
              </div>

              {/* Role-Specific Fields */}
              {selectedRole === 'patient' && (
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedRole === 'doctor' && (
                <>
                  <div className="grid-2col" style={{ gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Speciality</label>
                      <input type="text" className="form-input" value={speciality} onChange={(e) => setSpeciality(e.target.value)} placeholder="e.g. Cardiology" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Medical Registration / Cert No</label>
                      <input type="text" className="form-input" value={certNo} onChange={(e) => setCertNo(e.target.value)} placeholder="e.g. MCI-998821" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Certificate Document URL</label>
                    <input type="url" className="form-input" value={certDoc} onChange={(e) => setCertDoc(e.target.value)} placeholder="https://example.com/doc-cert.pdf" />
                  </div>
                </>
              )}

              {['hospital', 'clinic', 'laboratory'].includes(selectedRole) && (
                <>
                  <div className="grid-2col" style={{ gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Official Contact Number</label>
                      <input type="tel" className="form-input" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="+91 9876543210" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">License Certificate No</label>
                      <input type="text" className="form-input" value={orgCertNo} onChange={(e) => setOrgCertNo(e.target.value)} placeholder="e.g. REG-AHM-2026" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Certificate Document URL</label>
                    <input type="url" className="form-input" value={orgCertUrl} onChange={(e) => setOrgCertUrl(e.target.value)} placeholder="https://example.com/cert.pdf" />
                  </div>
                </>
              )}

              {/* Location & Address Schema */}
              <div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>Location & Address Details</h4>
                <div className="grid-2col" style={{ gap: '12px' }}>
                  {['hospital', 'clinic', 'laboratory'].includes(selectedRole) ? (
                    <div className="form-group">
                      <label className="form-label">Building / Premises Name</label>
                      <input type="text" className="form-input" value={buildingNo} onChange={(e) => setBuildingNo(e.target.value)} placeholder="Building A-1" />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Room / Flat No</label>
                      <input type="text" className="form-input" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} placeholder="Flat 402" />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Floor No</label>
                    <input type="number" className="form-input" value={floorNo} onChange={(e) => setFloorNo(e.target.value)} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Landmark</label>
                    <input type="text" className="form-input" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near Metro Station" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ahmedabad" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input type="text" className="form-input" value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="Gujarat" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input type="text" className="form-input" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="380001" required />
                  </div>
                </div>

                {/* GPS Section */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>GPS Coordinates (Longitude, Latitude)</label>
                    <button type="button" onClick={handleGetCurrentLocation} disabled={isLocating} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.78rem' }}>
                      <Navigation size={12} />
                      <span>{isLocating ? 'Locating...' : 'Use Current GPS'}</span>
                    </button>
                  </div>
                  <div className="grid-2col" style={{ gap: '10px' }}>
                    <input type="text" className="form-input" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="72.5714" />
                    <input type="text" className="form-input" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="23.0225" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', padding: '14px', fontSize: '1rem', justifyContent: 'center', marginTop: '8px' }}
              >
                <span>{isSubmitting ? 'Completing Profile...' : 'Complete Profile & Sign In'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

        </div>
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
