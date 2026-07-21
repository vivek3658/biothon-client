import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/axios';
import {
  User,
  ShieldCheck,
  Building2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Navigation,
  FlaskConical,
  Building,
  Check,
  Sparkles,
  Lock,
  FileText
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

                // Safely extract email, name, googleId from credential JWT in browser
                let googleEmail = '';
                let googleName = '';
                let googleSub = '';
                try {
                  const parts = credentialResponse.credential.split('.');
                  if (parts.length === 3) {
                    const base64Url = parts[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                      window.atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                    );
                    const parsed = JSON.parse(jsonPayload);
                    googleEmail = parsed.email || '';
                    googleName = parsed.name || '';
                    googleSub = parsed.sub || '';
                  }
                } catch (e) {
                  console.warn('Browser JWT decode note:', e);
                }

                await onGoogleAuthSuccess({
                  credential: credentialResponse.credential,
                  email: googleEmail,
                  name: googleName,
                  googleId: googleSub
                });
              } catch (err) {
                setErrorMessage('Google authentication error: ' + (err.message || ''));
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

const roleOptions = [
  { id: 'patient', label: 'Patient', icon: User, text: 'Personal Health Identity' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, text: 'Medical Practitioner' },
  { id: 'hospital', label: 'Hospital', icon: Building2, text: 'Inpatient Health Center' },
  { id: 'clinic', label: 'Clinic', icon: Building, text: 'Outpatient Specialist' },
  { id: 'laboratory', label: 'Laboratory', icon: FlaskConical, text: 'Diagnostic Center' }
];

const LoginPageContent = () => {
  const { loginUnified, loginEmployee, loginGoogle, refreshUser } = useAuth();

  // Check path for /employee
  const isEmployeePath = window.location.pathname === '/employee';

  // Mode: 'login' | 'register' | 'complete_profile'
  const [mode, setMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('patient');

  // Employee Form State
  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');

  // Unified Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Structured Block 1: Basic Info
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [createdAccountId, setCreatedAccountId] = useState(null);

  // Structured Block 2: Address Info
  const [premisesNo, setPremisesNo] = useState('');
  const [floorNo, setFloorNo] = useState('0');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [stateName, setStateName] = useState('Gujarat');
  const [pincode, setPincode] = useState('380001');
  const [longitude, setLongitude] = useState('72.5714');
  const [latitude, setLatitude] = useState('23.0225');

  // Structured Block 3: Medical / Professional Info
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [allergies, setAllergies] = useState('');
  const [speciality, setSpeciality] = useState('General Medicine');
  const [certNo, setCertNo] = useState('');
  const [certDoc, setCertDoc] = useState('');
  const [orgCertNo, setOrgCertNo] = useState('');
  const [orgCertUrl, setOrgCertUrl] = useState('');

  // Structured Block 4: Terms & Health Data Consent
  const [agreedToConsent, setAgreedToConsent] = useState(false);

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
        if (data.token) localStorage.setItem('token', data.token);
        if (data.accountId) setCreatedAccountId(data.accountId);
        if (data.email) setRegisterEmail(data.email);
        if (data.name) setRegisterName(data.name);

        setSuccessMessage(`Google account verified! Please complete your profile details below.`);
        setMode('complete_profile');
      } else {
        setSuccessMessage('Google OAuth sign-in successful! Redirecting...');
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
        setErrorMessage('GPS location error: ' + err.message);
        setIsLocating(false);
      }
    );
  };

  // Employee Login Submit (/employee path)
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsSubmitting(true);
      await loginEmployee(empUsername.trim(), empPassword);
      setSuccessMessage('Staff authentication successful! Redirecting...');
    } catch (err) {
      setErrorMessage(err.message || 'Staff login failed. Check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unified Sign In Submit
  const handleUnifiedLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsSubmitting(true);
      await loginUnified(loginIdentifier.trim(), loginPassword);
      setSuccessMessage('Sign in successful! Redirecting...');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Registration & Structured Profile Submit
  const handleStructuredRegistrationSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!agreedToConsent) {
      setErrorMessage('You must agree to the Health Data Privacy & Terms of Service consent to proceed.');
      return;
    }

    const isOrg = ['hospital', 'clinic', 'laboratory'].includes(selectedRole);
    const targetEntityModel = isOrg ? 'Organization' : 'User';

    try {
      setIsSubmitting(true);
      let accountId = createdAccountId;

      // 1. Create base account if not already created via Google
      if (!accountId && registerPassword) {
        const { data: dataAccount } = await apiClient.post('/auth/create-account', {
          email: registerEmail.trim(),
          password: registerPassword,
          entityModel: targetEntityModel
        });
        if (dataAccount.accountId) accountId = dataAccount.accountId;
        if (dataAccount.token) localStorage.setItem('token', dataAccount.token);
      }

      // 2. Complete Profile according to entity type
      if (isOrg) {
        const { data } = await apiClient.post('/auth/complete-org-profile', {
          accountId,
          email: registerEmail.trim(),
          name: registerName || 'Healthcare Facility',
          facilityType: selectedRole,
          contactNumber: phone || '9876543210',
          location: {
            buildingNo: premisesNo || '',
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

        if (data.token) localStorage.setItem('token', data.token);
      } else {
        const isDoctor = selectedRole === 'doctor';
        const { data } = await apiClient.post('/user/complete-profile', {
          accountId,
          email: registerEmail.trim(),
          name: registerName || 'User Profile',
          isDoctor,
          location: {
            roomNo: premisesNo || '',
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

        if (data.token) localStorage.setItem('token', data.token);
      }

      setSuccessMessage('Registration completed successfully! Logging in...');
      await refreshUser();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div className="bg-ambient-pattern" />
      <div className="bg-ambient-glow-1" />
      <div className="bg-ambient-glow-2" />

      {/* Main Compact Portal Card */}
      <div className="white-panel" style={{ maxWidth: (mode === 'register' || mode === 'complete_profile') ? '580px' : '440px', width: '100%', padding: '28px', borderRadius: '20px', position: 'relative', zIndex: 2, boxShadow: '0 16px 36px rgba(0,0,0,0.06)' }}>

        {/* Compact Logo & Brand */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src={logoImg} alt="ArogyaX Logo" style={{ height: '42px', objectFit: 'contain', marginBottom: '8px' }} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.5px' }}>
            Arogya<span style={{ color: '#ea580c' }}>X</span> Health Identity
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
            {isEmployeePath ? 'Staff & Administrative Control Portal' : 'One Identity for Healthcare'}
          </p>
        </div>

        {/* Error & Success Alerts */}
        {errorMessage && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', fontSize: '0.84rem' }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', fontSize: '0.84rem' }}>
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* RENDER 1: DEDICATED EMPLOYEE STAFF LOGIN (/employee path) */}
        {isEmployeePath ? (
          <div>
            <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: '10px', color: '#0369a1', fontSize: '0.82rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#0284c7" />
              <span>Admin & Manager Staff Authentication</span>
            </div>

            <form onSubmit={handleEmployeeSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Staff Username or Email</label>
                <input
                  type="text"
                  className="form-input"
                  value={empUsername}
                  onChange={(e) => setEmpUsername(e.target.value)}
                  placeholder="admin or manager username"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={empPassword}
                  onChange={(e) => setEmpPassword(e.target.value)}
                  placeholder="Enter staff password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', padding: '12px', fontSize: '0.94rem', justifyContent: 'center', marginTop: '4px' }}
              >
                <span>{isSubmitting ? 'Authenticating Staff...' : 'Sign In to Staff Portal'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        ) : (
          /* RENDER 2: REGULAR PORTAL (LOGIN & STRUCTURED REGISTER) */
          <div>
            {/* Mode Toggle Buttons */}
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
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
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: (mode === 'register' || mode === 'complete_profile') ? '#ffffff' : 'transparent',
                  color: (mode === 'register' || mode === 'complete_profile') ? '#0284c7' : '#64748b',
                  boxShadow: (mode === 'register' || mode === 'complete_profile') ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                New Account
              </button>
            </div>

            {/* UNIFIED SIGN IN MODE */}
            {mode === 'login' && (
              <div style={{ display: 'grid', gap: '18px' }}>
                {/* Option 1: Google Login */}
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <OfficialGoogleButton
                    onGoogleAuthSuccess={handleGoogleAuthSuccess}
                    setErrorMessage={setErrorMessage}
                    setIsSubmitting={setIsSubmitting}
                  />
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                  <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
                  <span style={{ padding: '0 12px', fontWeight: 700, textTransform: 'uppercase' }}>OR SIGN IN WITH EMAIL</span>
                  <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
                </div>

                {/* Option 2: Unified Email / Password Form */}
                <form onSubmit={handleUnifiedLoginSubmit} style={{ display: 'grid', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="user@gmail.com or hospital@domain.com"
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
                      placeholder="Password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                    style={{ width: '100%', padding: '12px', fontSize: '0.94rem', justifyContent: 'center' }}
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* STRUCTURED BLOCKS REGISTRATION MODE */}
            {(mode === 'register' || mode === 'complete_profile') && (
              <form onSubmit={handleStructuredRegistrationSubmit} style={{ display: 'grid', gap: '18px' }}>
                
                {/* Role Selector Card Grid */}
                <div>
                  <label className="form-label" style={{ marginBottom: '8px' }}>Select Account Role</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '8px' }}>
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
                            padding: '10px 6px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#0369a1' : 'var(--text-main)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            gap: '4px'
                          }}
                        >
                          <Icon size={18} color={isSelected ? '#0284c7' : '#64748b'} />
                          <span style={{ fontWeight: 800, fontSize: '0.78rem' }}>{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* BLOCK 1: BASIC INFORMATION */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0369a1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={16} /> Block 1: Basic Information
                  </h4>
                  <div className="grid-2col" style={{ gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name / Facility Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="e.g. Dr. Alex Sharma or City Care Hospital"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contact Phone Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="user@domain.com"
                        required
                      />
                    </div>
                    {!createdAccountId && (
                      <div className="form-group">
                        <label className="form-label">Account Password</label>
                        <input
                          type="password"
                          className="form-input"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          placeholder="Password"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* BLOCK 2: ADDRESS INFORMATION */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0369a1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Navigation size={16} /> Block 2: Address Information
                  </h4>
                  <div className="grid-2col" style={{ gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Premises / Flat / Building No</label>
                      <input type="text" className="form-input" value={premisesNo} onChange={(e) => setPremisesNo(e.target.value)} placeholder="A-12 or Flat 402" />
                    </div>
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

                  <div style={{ marginTop: '10px', background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>GPS Coordinates (Lng, Lat)</span>
                      <button type="button" onClick={handleGetCurrentLocation} disabled={isLocating} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                        <Navigation size={12} />
                        <span>{isLocating ? 'Locating...' : 'Use Current GPS'}</span>
                      </button>
                    </div>
                    <div className="grid-2col" style={{ gap: '8px' }}>
                      <input type="text" className="form-input" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="72.5714" />
                      <input type="text" className="form-input" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="23.0225" />
                    </div>
                  </div>
                </div>

                {/* BLOCK 3: MEDICAL & PROFESSIONAL INFORMATION */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0369a1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Stethoscope size={16} /> Block 3: Medical & Professional Details
                  </h4>

                  {selectedRole === 'patient' && (
                    <div className="grid-2col" style={{ gap: '10px' }}>
                      <div className="form-group">
                        <label className="form-label">Blood Group</label>
                        <select className="form-input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Allergies / Existing Conditions</label>
                        <input type="text" className="form-input" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. Penicillin, Asthma" />
                      </div>
                    </div>
                  )}

                  {selectedRole === 'doctor' && (
                    <div className="grid-2col" style={{ gap: '10px' }}>
                      <div className="form-group">
                        <label className="form-label">Speciality</label>
                        <input type="text" className="form-input" value={speciality} onChange={(e) => setSpeciality(e.target.value)} placeholder="e.g. Cardiology" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Medical Registration No</label>
                        <input type="text" className="form-input" value={certNo} onChange={(e) => setCertNo(e.target.value)} placeholder="MCI-998821" required />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Certificate Document URL</label>
                        <input type="url" className="form-input" value={certDoc} onChange={(e) => setCertDoc(e.target.value)} placeholder="https://example.com/doc-cert.pdf" />
                      </div>
                    </div>
                  )}

                  {['hospital', 'clinic', 'laboratory'].includes(selectedRole) && (
                    <div className="grid-2col" style={{ gap: '10px' }}>
                      <div className="form-group">
                        <label className="form-label">Facility Registration / License No</label>
                        <input type="text" className="form-input" value={orgCertNo} onChange={(e) => setOrgCertNo(e.target.value)} placeholder="REG-AHM-2026" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Certificate Document URL</label>
                        <input type="url" className="form-input" value={orgCertUrl} onChange={(e) => setOrgCertUrl(e.target.value)} placeholder="https://example.com/cert.pdf" />
                      </div>
                    </div>
                  )}
                </div>

                {/* BLOCK 4: TERMS & CONSENT AGREEMENT */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0369a1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} /> Block 4: Privacy & Health Data Consent
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    <input
                      type="checkbox"
                      checked={agreedToConsent}
                      onChange={(e) => setAgreedToConsent(e.target.checked)}
                      style={{ marginTop: '2px' }}
                    />
                    <span>
                      I agree to the <strong>ArogyaX Health Data Privacy Policy & Terms of Service</strong>. I authorize secure sharing of my health identity records with verified healthcare providers.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !agreedToConsent}
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem', justifyContent: 'center' }}
                >
                  <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        )}

      </div>
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
