import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  BadgeCheck
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

export const LoginPage = () => {
  const { loginEmployee, loginUser, loginOrg } = useAuth();
  const [activePortal, setActivePortal] = useState('user');

  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');

  const [userMode, setUserMode] = useState('login');
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

  const [orgMode, setOrgMode] = useState('login');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [facilityType, setFacilityType] = useState('hospital');
  const [contactNumber, setContactNumber] = useState('');
  const [orgBuilding, setOrgBuilding] = useState('');
  const [orgFloorNo, setOrgFloorNo] = useState('0');
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
        const res1 = await fetch('/auth/create-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: userEmail.trim(), password: userPassword, entityModel: 'User' })
        });
        const { ok: ok1, data: data1 } = await safeParseResponse(res1);
        if (!ok1 && !data1.accountId) throw new Error(data1.error || 'Account registration failed.');

        const token = data1.token || localStorage.getItem('token');
        if (data1.token) localStorage.setItem('token', data1.token);

        const authHeaders = { 'Content-Type': 'application/json' };
        if (token) authHeaders.Authorization = `Bearer ${token}`;

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
            coordinates: [parseFloat(longitude) || 77.209, parseFloat(latitude) || 28.6139],
            bloodGroup: bloodGroup || 'A+',
            certificateNo: isDoctor ? (certNo || `MCI-${Date.now()}`) : null,
            certificateDoc: isDoctor ? (certDoc || 'https://example.com/doc-cert.pdf') : null,
            speciality: isDoctor ? (speciality || 'General Medicine') : null
          })
        });

        const { ok: ok2, data: data2 } = await safeParseResponse(res2);
        if (!ok2) throw new Error(data2.error || data2.details || 'User profile completion failed.');

        if (data2.token) localStorage.setItem('token', data2.token);
        await loginUser(userEmail.trim(), userPassword);
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
        const res1 = await fetch('/auth/create-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: orgEmail.trim(), password: orgPassword, entityModel: 'Organization' })
        });
        const { ok: ok1, data: data1 } = await safeParseResponse(res1);
        if (!ok1 && !data1.accountId) throw new Error(data1.error || 'Organization account creation failed.');

        const token = data1.token || localStorage.getItem('token');
        if (data1.token) localStorage.setItem('token', data1.token);

        const authHeaders = { 'Content-Type': 'application/json' };
        if (token) authHeaders.Authorization = `Bearer ${token}`;

        const res2 = await fetch('/auth/complete-org-profile', {
          method: 'POST',
          headers: authHeaders,
          credentials: 'include',
          body: JSON.stringify({
            accountId: data1.accountId,
            email: orgEmail.trim(),
            name: orgName || 'Organization',
            facilityType,
            contactNumber: contactNumber || '9999999999',
            location: {
              buildingNo: orgBuilding || '',
              floorNo: parseInt(orgFloorNo, 10) || 0,
              landmark: orgLandmark || '',
              city: orgCity || 'New Delhi',
              state: orgState || 'Delhi',
              pincode: orgPincode || '110001'
            },
            coordinates: [parseFloat(orgLng) || 77.209, parseFloat(orgLat) || 28.6139],
            organizationCertificateNo: orgCertNo || `ORG-CERT-${Date.now()}`,
            organizationCertificateUrl: orgCertUrl || 'https://example.com/org-cert.pdf'
          })
        });

        const { ok: ok2, data: data2 } = await safeParseResponse(res2);
        if (!ok2) throw new Error(data2.error || data2.details || 'Organization profile completion failed.');

        if (data2.token) localStorage.setItem('token', data2.token);
        await loginOrg(orgEmail.trim(), orgPassword);
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
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Unified digital onboarding for patients, providers, organizations, and staff</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge-approved"><BadgeCheck size={12} /> Structured schemas</span>
            <span className="badge badge-pending"><Activity size={12} /> Role-aware access</span>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) minmax(520px, 760px)', gap: '28px', maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '32px', position: 'relative', zIndex: 2 }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="white-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Secure onboarding workspace</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>Choose the portal that matches your role, then complete the full identity details expected by the platform.</p>
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

          <div className="white-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>Schema coverage</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}><Heart size={16} color="#dc2626" /><span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Patient and doctor forms include address, blood group, geolocation, and credentials.</span></div>
              <div style={{ display: 'flex', gap: '10px' }}><Building2 size={16} color="#0284c7" /><span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Organization forms include facility type, contact, address, certificate, and GPS fields.</span></div>
              <div style={{ display: 'flex', gap: '10px' }}><Users size={16} color="#059669" /><span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Admin and staff login remains separate and role-scoped.</span></div>
            </div>
          </div>
        </aside>

        <section className="white-panel" style={{ padding: '30px', alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '22px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>{sectionTitle}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {activePortal === 'employee' ? 'Sign in with assigned staff credentials.' : 'Complete the required identity schema for this portal.'}
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

          {activePortal === 'user' && (
            <form onSubmit={handleUserSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div className="grid-2col" style={{ gap: '12px' }}>
                <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-input" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="patient@gmail.com or doctor@gmail.com" required /></div>
                <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="Enter secure password" required /></div>
              </div>

              {userMode === 'register' && (
                <>
                  <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g. Dr. Shiv Sharma" required /></div>

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
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>Address & Location</h4>
                    <div className="grid-2col" style={{ gap: '12px' }}>
                      <div className="form-group"><label className="form-label">Room No</label><input type="text" className="form-input" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} placeholder="e.g. A-12" /></div>
                      <div className="form-group"><label className="form-label">Floor No</label><input type="number" className="form-input" value={floorNo} onChange={(e) => setFloorNo(e.target.value)} min="0" /></div>
                      <div className="form-group"><label className="form-label">Landmark</label><input type="text" className="form-input" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near metro station" /></div>
                      <div className="form-group"><label className="form-label">Pincode</label><input type="text" className="form-input" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="110001" /></div>
                      <div className="form-group"><label className="form-label">City</label><input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New Delhi" required /></div>
                      <div className="form-group"><label className="form-label">State</label><input type="text" className="form-input" value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="Delhi" required /></div>
                    </div>
                    <div className="grid-2col" style={{ gap: '12px' }}>
                      <div className="form-group"><label className="form-label">Longitude</label><input type="text" className="form-input" value={longitude} onChange={(e) => setLongitude(e.target.value)} /></div>
                      <div className="form-group"><label className="form-label">Latitude</label><input type="text" className="form-input" value={latitude} onChange={(e) => setLatitude(e.target.value)} /></div>
                    </div>
                    <button type="button" onClick={() => handleGetCurrentLocation('user')} className="btn-secondary" style={{ marginTop: '4px' }}>
                      <Navigation size={15} />
                      <span>{isLocating ? 'Locating...' : 'Use Current GPS Location'}</span>
                    </button>
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>
                <span>{isSubmitting ? 'Authenticating...' : userMode === 'login' ? 'Sign In to Portal' : 'Register User Identity'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {activePortal === 'org' && (
            <form onSubmit={handleOrgSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div className="grid-2col" style={{ gap: '12px' }}>
                <div className="form-group"><label className="form-label">Organization Email</label><input type="email" className="form-input" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} placeholder="admin@hospital.com" required /></div>
                <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={orgPassword} onChange={(e) => setOrgPassword(e.target.value)} placeholder="Enter secure password" required /></div>
              </div>

              {orgMode === 'register' && (
                <>
                  <div className="grid-2col" style={{ gap: '12px' }}>
                    <div className="form-group"><label className="form-label">Organization Name</label><input type="text" className="form-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Apex Multi-Speciality Hospital" required /></div>
                    <div className="form-group"><label className="form-label">Facility Type</label><select className="form-input" value={facilityType} onChange={(e) => setFacilityType(e.target.value)}>{['hospital', 'clinic', 'laboratory', 'pharmacy', 'other'].map((type) => <option key={type} value={type}>{type.toUpperCase()}</option>)}</select></div>
                  </div>

                  <div className="grid-2col" style={{ gap: '12px' }}>
                    <div className="form-group"><label className="form-label">Contact Number</label><input type="text" className="form-input" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="9999999999" required /></div>
                    <div className="form-group"><label className="form-label">Certificate No</label><input type="text" className="form-input" value={orgCertNo} onChange={(e) => setOrgCertNo(e.target.value)} placeholder="ORG-CERT-2026" /></div>
                  </div>

                  <div className="form-group"><label className="form-label">Certificate URL</label><input type="url" className="form-input" value={orgCertUrl} onChange={(e) => setOrgCertUrl(e.target.value)} placeholder="https://example.com/org-cert.pdf" /></div>

                  <div style={{ paddingTop: '8px' }}>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>Facility Address & Location</h4>
                    <div className="grid-2col" style={{ gap: '12px' }}>
                      <div className="form-group"><label className="form-label">Building No</label><input type="text" className="form-input" value={orgBuilding} onChange={(e) => setOrgBuilding(e.target.value)} placeholder="Block A" /></div>
                      <div className="form-group"><label className="form-label">Floor No</label><input type="number" className="form-input" value={orgFloorNo} onChange={(e) => setOrgFloorNo(e.target.value)} min="0" /></div>
                      <div className="form-group"><label className="form-label">Landmark</label><input type="text" className="form-input" value={orgLandmark} onChange={(e) => setOrgLandmark(e.target.value)} placeholder="Near city center" /></div>
                      <div className="form-group"><label className="form-label">Pincode</label><input type="text" className="form-input" value={orgPincode} onChange={(e) => setOrgPincode(e.target.value)} placeholder="110001" /></div>
                      <div className="form-group"><label className="form-label">City</label><input type="text" className="form-input" value={orgCity} onChange={(e) => setOrgCity(e.target.value)} placeholder="New Delhi" required /></div>
                      <div className="form-group"><label className="form-label">State</label><input type="text" className="form-input" value={orgState} onChange={(e) => setOrgState(e.target.value)} placeholder="Delhi" required /></div>
                    </div>
                    <div className="grid-2col" style={{ gap: '12px' }}>
                      <div className="form-group"><label className="form-label">Longitude</label><input type="text" className="form-input" value={orgLng} onChange={(e) => setOrgLng(e.target.value)} /></div>
                      <div className="form-group"><label className="form-label">Latitude</label><input type="text" className="form-input" value={orgLat} onChange={(e) => setOrgLat(e.target.value)} /></div>
                    </div>
                    <button type="button" onClick={() => handleGetCurrentLocation('org')} className="btn-secondary" style={{ marginTop: '4px' }}>
                      <MapPin size={15} />
                      <span>{isLocating ? 'Locating...' : 'Use Facility GPS Location'}</span>
                    </button>
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>
                <span>{isSubmitting ? 'Authenticating...' : orgMode === 'login' ? 'Sign In to Org Portal' : 'Register Organization'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {activePortal === 'employee' && (
            <form onSubmit={handleEmployeeSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div className="grid-2col" style={{ gap: '12px' }}>
                <div className="form-group"><label className="form-label">Username</label><input type="text" className="form-input" value={empUsername} onChange={(e) => setEmpUsername(e.target.value)} placeholder="admin or manager username" required /></div>
                <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} placeholder="Enter password" required /></div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}><FileText size={16} color="#0284c7" /><strong style={{ color: 'var(--text-main)' }}>Staff access note</strong></div>
                Use this portal for admin and manager operations such as staff CRUD, approvals, and medicine catalog maintenance.
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
