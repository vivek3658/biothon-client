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
  Stethoscope, 
  Heart,
  Navigation,
  MapPin,
  FileText
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export const LoginPage = () => {
  const { loginEmployee, loginUser, loginOrg } = useAuth();
  const [activePortal, setActivePortal] = useState('user'); // 'user' | 'org' | 'employee'

  // Employee State
  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');

  // User State (Patient / Doctor)
  const [userMode, setUserMode] = useState('login'); // 'login' | 'register'
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [isDoctor, setIsDoctor] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [roomNo, setRoomNo] = useState('');
  const [floorNo, setFloorNo] = useState('0');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [longitude, setLongitude] = useState('77.2090');
  const [latitude, setLatitude] = useState('28.6139');
  const [certNo, setCertNo] = useState('');
  const [certDoc, setCertDoc] = useState('');
  const [speciality, setSpeciality] = useState('');

  // Org State
  const [orgMode, setOrgMode] = useState('login');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [facilityType, setFacilityType] = useState('hospital');
  const [contactNumber, setContactNumber] = useState('');
  const [orgBuilding, setOrgBuilding] = useState('');
  const [orgLandmark, setOrgLandmark] = useState('');
  const [orgCity, setOrgCity] = useState('');
  const [orgState, setOrgState] = useState('');
  const [orgPincode, setOrgPincode] = useState('');
  const [orgLng, setOrgLng] = useState('77.2090');
  const [orgLat, setOrgLat] = useState('28.6139');
  const [orgCertNo, setOrgCertNo] = useState('');
  const [orgCertUrl, setOrgCertUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // GPS Current Location Helper
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

  // 1. Employee Login Handler
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');
      await loginEmployee(empUsername.trim(), empPassword);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. User Login & Registration Handler
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      setIsSubmitting(true);
      if (userMode === 'login') {
        // Direct Login
        await loginUser(userEmail.trim(), userPassword);
      } else {
        // Registration Flow:
        // Step 1: Create Base Account
        const res1 = await fetch('/auth/create-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: userEmail.trim(), password: userPassword, entityModel: 'User' })
        });
        const data1 = await res1.json();
        if (!res1.ok && !data1.accountId) {
          throw new Error(data1.error || 'Account creation failed');
        }

        const token = data1.token || localStorage.getItem('token');
        if (data1.token) localStorage.setItem('token', data1.token);

        const authHeaders = { 'Content-Type': 'application/json' };
        if (token) authHeaders['Authorization'] = `Bearer ${token}`;

        // Step 2: Complete User Profile
        const res2 = await fetch('/user/complete-profile', {
          method: 'POST',
          headers: authHeaders,
          credentials: 'include',
          body: JSON.stringify({
            accountId: data1.accountId,
            email: userEmail.trim(),
            name: userName || 'User',
            isDoctor,
            location: {
              roomNo: roomNo || '',
              floorNo: parseInt(floorNo, 10) || 0,
              landmark: landmark || '',
              city: city || 'New Delhi',
              state: stateName || 'Delhi',
              pincode: pincode || '110001'
            },
            coordinates: [parseFloat(longitude) || 77.2090, parseFloat(latitude) || 28.6139],
            bloodGroup: bloodGroup || 'A+',
            certificateNo: isDoctor ? (certNo || `MCI-${Date.now()}`) : null,
            certificateDoc: isDoctor ? (certDoc || 'https://example.com/doc-cert.pdf') : null,
            speciality: isDoctor ? (speciality || 'General Medicine') : null
          })
        });

        const data2 = await res2.json();
        if (!res2.ok) {
          throw new Error(data2.error || data2.details || 'User profile completion failed');
        }

        if (data2.token) localStorage.setItem('token', data2.token);

        // Step 3: Log in user & transition to Dashboard
        await loginUser(userEmail.trim(), userPassword);
      }
    } catch (err) {
      console.error('User Auth Error:', err);
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Organization Login & Registration Handler
  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      setIsSubmitting(true);
      if (orgMode === 'login') {
        await loginOrg(orgEmail.trim(), orgPassword);
      } else {
        const res1 = await fetch('/auth/create-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: orgEmail.trim(), password: orgPassword, entityModel: 'Organization' })
        });
        const data1 = await res1.json();
        if (!res1.ok && !data1.accountId) {
          throw new Error(data1.error || 'Account creation failed');
        }

        const token = data1.token || localStorage.getItem('token');
        if (data1.token) localStorage.setItem('token', data1.token);

        const authHeaders = { 'Content-Type': 'application/json' };
        if (token) authHeaders['Authorization'] = `Bearer ${token}`;

        const res2 = await fetch('/auth/complete-org-profile', {
          method: 'POST',
          headers: authHeaders,
          credentials: 'include',
          body: JSON.stringify({
            accountId: data1.accountId,
            name: orgName || 'Healthcare Facility',
            role: facilityType || 'hospital',
            contactNumber: contactNumber || '+91 9876543210',
            location: {
              buildingNo: orgBuilding || '1',
              floorNo: 0,
              landmark: orgLandmark || 'City Center',
              city: orgCity || 'New Delhi',
              state: orgState || 'Delhi',
              pincode: orgPincode || '110001'
            },
            coordinates: [parseFloat(orgLng) || 77.2090, parseFloat(orgLat) || 28.6139],
            organizationCertificateNo: orgCertNo || `REG-${Date.now()}`,
            organizationCertificateUrl: orgCertUrl || 'https://example.com/cert.pdf',
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            specialities: ['General Medicine']
          })
        });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.error || 'Profile submission failed');

        setSuccessMessage('Organization registered and submitted for Manager approval! You can now log in.');
        setOrgMode('login');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Organization authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative'
    }}>
      <div className="bg-ambient-pattern" />
      <div className="bg-ambient-glow-1" />
      <div className="bg-ambient-glow-2" />

      <div style={{
        width: '100%',
        maxWidth: (userMode === 'register' || orgMode === 'register') ? '740px' : '440px',
        position: 'relative',
        zIndex: 10,
        transition: 'max-width 0.3s ease'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img 
            src={logoImg} 
            alt="ArogyaX Logo" 
            style={{ height: '48px', margin: '0 auto 8px auto', objectFit: 'contain' }}
          />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.5px', marginBottom: '2px' }}>
            Arogya<span style={{ color: '#ea580c' }}>X</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            One QR, One Health Identity.
          </p>
        </div>

        {/* 3 Portal Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: '#ffffff',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '16px'
        }}>
          <button
            type="button"
            onClick={() => { setActivePortal('user'); setErrorMessage(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: '8px',
              border: 'none',
              background: activePortal === 'user' ? '#0284c7' : 'transparent',
              color: activePortal === 'user' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <User size={15} />
            <span>User Portal</span>
          </button>

          <button
            type="button"
            onClick={() => { setActivePortal('org'); setErrorMessage(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: '8px',
              border: 'none',
              background: activePortal === 'org' ? '#059669' : 'transparent',
              color: activePortal === 'org' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Building2 size={15} />
            <span>Organization</span>
          </button>

          <button
            type="button"
            onClick={() => { setActivePortal('employee'); setErrorMessage(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: '8px',
              border: 'none',
              background: activePortal === 'employee' ? '#4f46e5' : 'transparent',
              color: activePortal === 'employee' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={15} />
            <span>Admin & Manager</span>
          </button>
        </div>

        {/* Main Form Panel */}
        <div className="white-panel" style={{ padding: '24px 20px' }}>
          {errorMessage && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '0.84rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '0.84rem' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* PORTAL 1: USER PORTAL */}
          {activePortal === 'user' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
                    {userMode === 'login' ? 'User Portal Sign In' : 'Create User Account'}
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Patient & Medical Doctor Portal
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => { setUserMode(userMode === 'login' ? 'register' : 'login'); setErrorMessage(''); }}
                  style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                >
                  {userMode === 'login' ? 'Register Account' : 'Back to Login'}
                </button>
              </div>

              <form onSubmit={handleUserSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="user@arogyax.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required />
                </div>

                <div className="form-group" style={{ marginBottom: userMode === 'register' ? '14px' : '20px' }}>
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder="••••••••••••" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} required />
                </div>

                {userMode === 'register' && (
                  <div>
                    {/* Patient vs Doctor Role Toggle */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                      <button
                        type="button"
                        onClick={() => setIsDoctor(false)}
                        className="btn-secondary"
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderColor: !isDoctor ? '#0284c7' : 'var(--border-color)',
                          background: !isDoctor ? '#e0f2fe' : '#ffffff',
                          color: !isDoctor ? '#0284c7' : 'var(--text-muted)',
                          fontWeight: 700
                        }}
                      >
                        <Heart size={14} />
                        <span>Patient</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsDoctor(true)}
                        className="btn-secondary"
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderColor: isDoctor ? '#059669' : 'var(--border-color)',
                          background: isDoctor ? '#ecfdf5' : '#ffffff',
                          color: isDoctor ? '#059669' : 'var(--text-muted)',
                          fontWeight: 700
                        }}
                      >
                        <Stethoscope size={14} />
                        <span>Doctor</span>
                      </button>
                    </div>

                    <div className="grid-2col">
                      <div className="form-group col-span-2">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" placeholder={isDoctor ? "Dr. Alex Sharma" : "John Doe"} value={userName} onChange={(e) => setUserName(e.target.value)} required />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Blood Group</label>
                        <select className="form-input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Room / Flat No</label>
                        <input type="text" className="form-input" placeholder="Flat 402" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Floor No</label>
                        <input type="number" className="form-input" placeholder="4" value={floorNo} onChange={(e) => setFloorNo(e.target.value)} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Landmark</label>
                        <input type="text" className="form-input" placeholder="Near City Mall" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input type="text" className="form-input" placeholder="New Delhi" value={city} onChange={(e) => setCity(e.target.value)} required />
                      </div>

                      <div className="form-group">
                        <label className="form-label">State</label>
                        <input type="text" className="form-input" placeholder="Delhi" value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Pincode (6 Digits)</label>
                        <input type="text" className="form-input" placeholder="110001" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                      </div>

                      {/* GPS Location Inputs */}
                      <div className="form-group col-span-2">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <label className="form-label" style={{ margin: 0 }}>GPS Coordinates (Longitude & Latitude)</label>
                          <button
                            type="button"
                            onClick={() => handleGetCurrentLocation('user')}
                            className="btn-secondary"
                            style={{ padding: '2px 8px', fontSize: '0.72rem', color: '#0284c7' }}
                            disabled={isLocating}
                          >
                            <Navigation size={12} className={isLocating ? 'spin' : ''} />
                            <span>{isLocating ? 'Locating...' : 'Get GPS Location'}</span>
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Longitude (77.2090)" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
                          <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Latitude (28.6139)" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
                        </div>
                      </div>

                      {/* Doctor Specific Fields */}
                      {isDoctor && (
                        <>
                          <div className="form-group col-span-2">
                            <label className="form-label">Medical Speciality</label>
                            <input type="text" className="form-input" placeholder="e.g. Cardiology, Pediatrics" value={speciality} onChange={(e) => setSpeciality(e.target.value)} required />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Medical Cert No</label>
                            <input type="text" className="form-input" placeholder="MCI-2026-887" value={certNo} onChange={(e) => setCertNo(e.target.value)} required />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Certificate Proof PDF URL</label>
                            <input type="url" className="form-input" placeholder="https://example.com/cert.pdf" value={certDoc} onChange={(e) => setCertDoc(e.target.value)} required />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '12px', fontSize: '0.92rem', marginTop: '8px' }}>
                  {isSubmitting ? 'Processing...' : userMode === 'login' ? 'Sign In to User Portal' : 'Register & Complete Profile'}
                </button>
              </form>
            </div>
          )}

          {/* PORTAL 2: ORGANIZATION PORTAL */}
          {activePortal === 'org' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
                    Healthcare Organization
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Hospitals, Clinics, Laboratories
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => { setOrgMode(orgMode === 'login' ? 'register' : 'login'); setErrorMessage(''); }}
                  style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                >
                  {orgMode === 'login' ? 'Register Facility' : 'Back to Login'}
                </button>
              </div>

              <form onSubmit={handleOrgSubmit}>
                <div className="form-group">
                  <label className="form-label">Organization Email</label>
                  <input type="email" className="form-input" placeholder="org@hospital.com" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} required />
                </div>

                <div className="form-group" style={{ marginBottom: orgMode === 'register' ? '14px' : '20px' }}>
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder="••••••••••••" value={orgPassword} onChange={(e) => setOrgPassword(e.target.value)} required />
                </div>

                {orgMode === 'register' && (
                  <div className="grid-2col">
                    <div className="form-group col-span-2">
                      <label className="form-label">Facility Name</label>
                      <input type="text" className="form-input" placeholder="City Care Hospital" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Facility Type</label>
                      <select className="form-input" value={facilityType} onChange={(e) => setFacilityType(e.target.value)}>
                        <option value="hospital">Hospital</option>
                        <option value="clinic">Clinic</option>
                        <option value="laboratory">Laboratory</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Phone</label>
                      <input type="text" className="form-input" placeholder="+91 9876543210" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Building No</label>
                      <input type="text" className="form-input" placeholder="Bldg A-12" value={orgBuilding} onChange={(e) => setOrgBuilding(e.target.value)} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Landmark</label>
                      <input type="text" className="form-input" placeholder="Near Metro Station" value={orgLandmark} onChange={(e) => setOrgLandmark(e.target.value)} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" className="form-input" placeholder="New Delhi" value={orgCity} onChange={(e) => setOrgCity(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input type="text" className="form-input" placeholder="Delhi" value={orgState} onChange={(e) => setOrgState(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Pincode (6 Digits)</label>
                      <input type="text" className="form-input" placeholder="110001" value={orgPincode} onChange={(e) => setOrgPincode(e.target.value)} required />
                    </div>

                    {/* GPS Location Inputs */}
                    <div className="form-group col-span-2">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label className="form-label" style={{ margin: 0 }}>GPS Coordinates (Longitude & Latitude)</label>
                        <button
                          type="button"
                          onClick={() => handleGetCurrentLocation('org')}
                          className="btn-secondary"
                          style={{ padding: '2px 8px', fontSize: '0.72rem', color: '#059669' }}
                          disabled={isLocating}
                        >
                          <Navigation size={12} className={isLocating ? 'spin' : ''} />
                          <span>{isLocating ? 'Locating...' : 'Get GPS Location'}</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Longitude" value={orgLng} onChange={(e) => setOrgLng(e.target.value)} required />
                        <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Latitude" value={orgLat} onChange={(e) => setOrgLat(e.target.value)} required />
                      </div>
                    </div>

                    <div className="form-group col-span-2">
                      <label className="form-label">Cert No</label>
                      <input type="text" className="form-input" placeholder="REG-2026-99" value={orgCertNo} onChange={(e) => setOrgCertNo(e.target.value)} required />
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-success" disabled={isSubmitting} style={{ width: '100%', padding: '12px', fontSize: '0.92rem', marginTop: '8px' }}>
                  {isSubmitting ? 'Processing...' : orgMode === 'login' ? 'Sign In' : 'Submit Facility for Approval'}
                </button>
              </form>
            </div>
          )}

          {/* PORTAL 3: EMPLOYEE PORTAL */}
          {activePortal === 'employee' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
                  Employee Sign In
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Admin and Verification Manager Portal
                </p>
              </div>

              <form onSubmit={handleEmployeeSubmit}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-input" placeholder="admin or manager username" value={empUsername} onChange={(e) => setEmpUsername(e.target.value)} required />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder="••••••••••••" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} required />
                </div>

                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}>
                  {isSubmitting ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
