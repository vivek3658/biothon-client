import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  Building2, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2,
  Phone,
  MapPin,
  Award,
  Sparkles
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export const LoginPage = () => {
  const { login } = useAuth();
  const [activePortal, setActivePortal] = useState('employee'); // 'employee' | 'org'

  // Employee Login Form State
  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Organization Login & Register State
  const [orgMode, setOrgMode] = useState('login'); // 'login' | 'register'
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  
  // Org Profile Registration Fields
  const [orgName, setOrgName] = useState('');
  const [facilityType, setFacilityType] = useState('hospital');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [certNo, setCertNo] = useState('');
  const [certUrl, setCertUrl] = useState('');

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!empUsername.trim() || !empPassword) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await login(empUsername.trim(), empPassword);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Invalid credentials.');
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
        const res = await fetch('/org/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: orgEmail, password: orgPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Organization login failed');

        setSuccessMessage('Organization login successful! Redirecting to verification status...');
        window.location.reload();
      } else {
        // Step 1: Create Account
        const res1 = await fetch('/auth/create-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: orgEmail, password: orgPassword, entityModel: 'Organization' })
        });
        const data1 = await res1.json();
        if (!res1.ok) throw new Error(data1.error || 'Account creation failed');

        // Step 2: Complete Profile
        const res2 = await fetch('/auth/complete-org-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: orgName,
            role: facilityType,
            contactNumber,
            location: {
              buildingNo: '1',
              floorNo: 1,
              landmark: 'City Center',
              city,
              state: stateName,
              pincode
            },
            coordinates: [77.2090, 28.6139], // Default GeoJSON coordinates [lng, lat]
            organizationCertificateNo: certNo,
            organizationCertificateUrl: certUrl || 'https://example.com/cert.pdf',
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            specialities: ['General Medicine', 'Emergency']
          })
        });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.error || 'Profile completion failed');

        setSuccessMessage('Organization registered and submitted for Manager approval!');
        setOrgMode('login');
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillAdminDemo = () => {
    setEmpUsername('admin');
    setEmpPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      position: 'relative'
    }}>
      {/* Background Ambient Glows */}
      <div className="bg-ambient-pattern" />
      <div className="bg-ambient-glow-1" />
      <div className="bg-ambient-glow-2" />

      {/* Main Container */}
      <div style={{
        width: '100%',
        maxWidth: activePortal === 'org' && orgMode === 'register' ? '680px' : '460px',
        position: 'relative',
        zIndex: 10,
        transition: 'all 0.3s ease'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img 
            src={logoImg} 
            alt="ArogyaX Logo" 
            style={{
              height: '56px',
              margin: '0 auto 12px auto',
              objectFit: 'contain'
            }}
          />
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0284c7',
            letterSpacing: '-0.5px',
            marginBottom: '4px'
          }}>
            Arogya<span style={{ color: '#ea580c' }}>X</span>
          </h1>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            fontWeight: 500
          }}>
            One QR, One Health Identity.
          </p>
        </div>

        {/* Dual Portal Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: '#ffffff',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => { setActivePortal('employee'); setErrorMessage(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activePortal === 'employee' ? '#0284c7' : 'transparent',
              color: activePortal === 'employee' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={16} />
            <span>Employee Portal (Admin & Manager)</span>
          </button>

          <button
            onClick={() => { setActivePortal('org'); setErrorMessage(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activePortal === 'org' ? '#059669' : 'transparent',
              color: activePortal === 'org' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Building2 size={16} />
            <span>Organization Portal</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="white-panel" style={{ padding: '32px 28px' }}>
          {/* Notifications */}
          {errorMessage && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#dc2626',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#047857',
              fontSize: '0.85rem'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* PORTAL 1: EMPLOYEE LOGIN */}
          {activePortal === 'employee' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Employee Sign In
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Combined access point for System Administrators and Verification Managers.
                </p>
              </div>

              <form onSubmit={handleEmployeeSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="empUsername">Username / ID</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-dim)'
                    }} />
                    <input
                      id="empUsername"
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '40px', width: '100%' }}
                      placeholder="Enter admin or manager username"
                      value={empUsername}
                      onChange={(e) => setEmpUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" htmlFor="empPassword">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-dim)'
                    }} />
                    <input
                      id="empPassword"
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '40px', width: '100%' }}
                      placeholder="••••••••••••"
                      value={empPassword}
                      onChange={(e) => setEmpPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.95rem'
                  }}
                >
                  {isSubmitting ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Credentials Box */}
              <div style={{
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Demo Credentials Helper</span>
                  <button
                    onClick={fillAdminDemo}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284c7',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    Auto-fill Admin
                  </button>
                </div>
                <div style={{ background: '#f1f5f9', padding: '10px 12px', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div><strong>Admin:</strong> <code>admin</code> / <code>admin123</code></div>
                  <div><strong>Manager:</strong> Provisioned by Admin via Manager CRUD</div>
                </div>
              </div>
            </div>
          )}

          {/* PORTAL 2: ORGANIZATION PORTAL */}
          {activePortal === 'org' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Healthcare Organization Portal
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Register your Hospital, Clinic, or Laboratory for verification.
                  </p>
                </div>

                <button
                  onClick={() => { setOrgMode(orgMode === 'login' ? 'register' : 'login'); setErrorMessage(''); }}
                  style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                >
                  {orgMode === 'login' ? 'Create Account' : 'Back to Login'}
                </button>
              </div>

              <form onSubmit={handleOrgSubmit}>
                <div className="form-group">
                  <label className="form-label">Organization Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '40px', width: '100%' }}
                      placeholder="org@hospital.com"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: orgMode === 'register' ? '16px' : '24px' }}>
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '40px', width: '100%' }}
                      placeholder="••••••••••••"
                      value={orgPassword}
                      onChange={(e) => setOrgPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {orgMode === 'register' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Organization Legal Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. City Care Hospital"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Facility Type</label>
                      <select
                        className="form-input"
                        value={facilityType}
                        onChange={(e) => setFacilityType(e.target.value)}
                      >
                        <option value="hospital">Hospital</option>
                        <option value="clinic">Clinic</option>
                        <option value="laboratory">Laboratory</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Phone</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="+91 9876543210"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="New Delhi"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Delhi"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Pincode (6 Digits)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="110001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        pattern="[0-9]{6}"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Certificate No</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="REG-2026-99"
                        value={certNo}
                        onChange={(e) => setCertNo(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Certificate Document URL</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://example.com/cert.pdf"
                        value={certUrl}
                        onChange={(e) => setCertUrl(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-success"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.95rem'
                  }}
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : (
                    <span>{orgMode === 'login' ? 'Sign In to Organization Account' : 'Complete Registration & Submit'}</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
