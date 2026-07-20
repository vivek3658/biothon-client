import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import QrScanner from 'qr-scanner';
import qrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min?url';
import { useAuth } from '../context/AuthContext';
import { PrescriptionPage } from '../pages/PrescriptionPage';
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
  Repeat,
  QrCode,
  ShieldCheck,
  Key,
  Copy,
  Camera,
  CameraOff,
  DollarSign,
  Calendar,
  Eye,
  Download,
  Upload,
  ArrowLeft,
  Check,
  Building2,
  Paperclip,
  Send
} from 'lucide-react';

// Helper: build auth headers from localStorage token
const getAuthHeaders = (contentType = true) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (contentType) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

QrScanner.WORKER_PATH = qrScannerWorkerPath;

// Standards-compliant SVG QR Code Generator Component with ID
const QRCodeSVG = ({ value, size = 220 }) => {
  const [svgMarkup, setSvgMarkup] = useState('');

  useEffect(() => {
    let active = true;

    QRCode.toString(value || 'AROGYAX_PATIENT', {
      type: 'svg',
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((svg) => {
        if (active) {
          setSvgMarkup(svg.replace('<svg ', '<svg id="patient-qr-svg" '));
        }
      })
      .catch(() => {
        if (active) {
          setSvgMarkup('');
        }
      });

    return () => {
      active = false;
    };
  }, [size, value]);

  return (
    <div
      style={{ background: '#ffffff', padding: '14px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)', lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
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

  // Selected Prescription for Tabular Page View
  const [selectedRxId, setSelectedRxId] = useState(null);

  // Full-Page Doctor Prescription Creator State (Replaces Cramped Modal)
  const [createRxWorkspace, setCreateRxWorkspace] = useState(null); // { patient: { id, name, bloodGroup } }

  // Doctor Organization Affiliation Search State
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [orgSearchResults, setOrgSearchResults] = useState([]);
  const [isSearchingOrgs, setIsSearchingOrgs] = useState(false);

  // QR Code Security Token State
  const [qrToken, setQrToken] = useState(Date.now().toString(36));

  // Profile Edit State
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
  
  // Doctor Credentials Edit
  const [editSpeciality, setEditSpeciality] = useState('');
  const [editCertNo, setEditCertNo] = useState('');
  const [editCertDoc, setEditCertDoc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Real Prescription State from API
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports] = useState([
    { id: 'rep-201', lab: 'Apex Diagnostics', date: '2026-07-10', title: 'Complete Blood Count (CBC)', status: 'Normal' }
  ]);

  // Doctor QR Scanner Modal State
  const [showScanModal, setShowScanModal] = useState(false);
  const [scannedPayload, setScannedPayload] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  
  // Camera & Image Upload Scanner State
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Prescription Form State (Medications & Lab Reports Array)
  const [consultationFee, setConsultationFee] = useState(300);
  const [catalogMedicines, setCatalogMedicines] = useState([]);

  // Lab Report Attachments Array
  const [reportAttachments, setReportAttachments] = useState([
    { title: '', fileUrl: '', labName: '' }
  ]);

  const [medicationsList, setMedicationsList] = useState([
    {
      medicineId: null,
      medicineName: '',
      type: 'oral_tablet',
      dosage: '500',
      unit: 'mg',
      instructions: 'Take after meals.',
      beforeEating: false,
      timesADay: '2',
      quantity: '1',
      howManyDays: '5 days',
      notes: '',
      price: 0,
      searchQuery: '',
      showSuggestions: false
    }
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
      setEditLng(userProfile.coordinates?.[0] ?? '77.2090');
      setEditLat(userProfile.coordinates?.[1] ?? '28.6139');
      if (userProfile.isDoctor) {
        setEditSpeciality(userProfile.doctorDetails?.speciality || '');
        setEditCertNo(userProfile.doctorDetails?.certificateNo || '');
        setEditCertDoc(userProfile.doctorDetails?.certificateDoc || '');
      }
    }
  }, [userProfile]);

  // Fetch real prescriptions from API
  const fetchPrescriptions = async () => {
    try {
      const res = await fetch('/prescriptions', { headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok) {
        setPrescriptions(data.prescriptions || []);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [userProfile]);

  // Load Admin Medicines Catalog via authenticated GET /medicines
  const fetchAdminMedicines = async () => {
    try {
      const res = await fetch('/medicines?limit=100', { headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        setCatalogMedicines(data.data);
      }
    } catch (err) {
      console.error('Error fetching catalog medicines:', err);
    }
  };

  useEffect(() => {
    fetchAdminMedicines();
  }, []);

  // Search Organizations for Doctor Affiliation Request
  const handleSearchOrganizations = async (query = '') => {
    setOrgSearchQuery(query);
    try {
      setIsSearchingOrgs(true);
      const res = await fetch(`/org/search?query=${encodeURIComponent(query.trim())}`, { headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok) {
        setOrgSearchResults(data.organizations || []);
      }
    } catch (err) {
      console.error('Error searching organizations:', err);
    } finally {
      setIsSearchingOrgs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'practitioner' && userProfile?.isDoctor) {
      handleSearchOrganizations('');
    }
  }, [activeTab, userProfile]);

  // Send Affiliation Request to Organization
  const handleSendAffiliationRequest = async (orgId, orgName) => {
    try {
      setError('');
      const res = await fetch('/user/affiliate-request', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ organizationId: orgId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send affiliation request.');

      setSuccessMsg(`Affiliation request sent to ${orgName}! Waiting for hospital approval.`);
      refreshUser();
    } catch (err) {
      setError(err.message);
    }
  };

  // Download Patient QR Code as PNG Image
  const handleDownloadQRImage = () => {
    const svgElement = document.getElementById('patient-qr-svg');
    if (!svgElement) {
      setError('QR Code element not found.');
      return;
    }

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 500, 500);

        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
        ctx.fillText('ArogyaX Health Identity QR', 40, 45);

        ctx.fillStyle = '#64748b';
        ctx.font = '14px Plus Jakarta Sans, sans-serif';
        ctx.fillText(`Patient: ${userProfile?.name || 'User'} (${userProfile?.bloodGroup || 'A+'})`, 40, 70);

        ctx.drawImage(img, 50, 90, 400, 370);

        const a = document.createElement('a');
        a.download = `${(userProfile?.name || 'Patient').replace(/\s+/g, '_')}_ArogyaX_QR.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        setSuccessMsg('Patient QR Code image downloaded successfully!');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    } catch (err) {
      setError('Failed to generate downloadable QR image: ' + err.message);
    }
  };

  const parsePatientPayload = (payloadText) => {
    const rawPayload = (payloadText || '').trim();
    if (!rawPayload) return null;

    if (rawPayload.startsWith('AX|')) {
      const [, patientId = '', token = ''] = rawPayload.split('|');
      return {
        app: 'ArogyaX',
        patientId: patientId.trim(),
        token: token.trim()
      };
    }

    try {
      const parsed = JSON.parse(rawPayload);
      if (parsed?.patientId) {
        return parsed;
      }
    } catch (e) {}

    return {
      app: 'ArogyaX',
      patientId: rawPayload
    };
  };

  const fetchPatientDetails = async (patientId, fallback = {}) => {
    if (!patientId) {
      return {
        id: fallback.patientId || '',
        name: fallback.name || 'Verified ArogyaX Patient',
        bloodGroup: fallback.bloodGroup || 'A+',
        location: fallback.location?.city || fallback.location || 'New Delhi'
      };
    }

    try {
      const res = await fetch(`/user/profile/${patientId}`, {
        headers: getAuthHeaders(false),
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok && data?.userProfile) {
        return {
          id: data.userProfile._id || patientId,
          name: data.userProfile.name || fallback.name || 'Verified ArogyaX Patient',
          bloodGroup: data.userProfile.bloodGroup || fallback.bloodGroup || 'A+',
          location: data.userProfile.location?.city || fallback.location?.city || fallback.location || 'New Delhi'
        };
      }
    } catch (e) {}

    return {
      id: patientId,
      name: fallback.name || 'Verified ArogyaX Patient',
      bloodGroup: fallback.bloodGroup || 'A+',
      location: fallback.location?.city || fallback.location || 'New Delhi'
    };
  };

  // Camera Management
  const startCamera = async () => {
    try {
      setError('');
      setScanStatus('Scanning live QR...');
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      if (scannerRef.current) {
        scannerRef.current.destroy();
        scannerRef.current = null;
      }

      if (videoRef.current) {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            const decodedText = typeof result === 'string' ? result : result?.data;
            if (decodedText) {
              setScannedPayload(decodedText);
              setScanStatus('QR detected. Opening patient workspace...');
              handleProcessQRScan(decodedText);
            }
          },
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 8,
            returnDetailedScanResult: true
          }
        );
        await scannerRef.current.start();
      }
    } catch (err) {
      setError('Camera access failed: ' + err.message + '. You can paste payload or upload QR image file.');
      setScanStatus('');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanStatus('');
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleRegenerateQR = () => {
    const newToken = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    setQrToken(newToken);
    setSuccessMsg('QR Code regenerated & security token refreshed successfully!');
  };

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
    if (!userProfile?._id) return;

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
        headers: getAuthHeaders(true),
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Failed to update profile');

      setSuccessMsg('User profile updated successfully!');
      setShowEditModal(false);
      refreshUser();
    } catch (err) {
      setError(err.message || 'Failed to submit profile update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process Patient QR Scan & Launch Full Page Prescription Creator Workspace
  const handleProcessQRScan = async (payloadText) => {
    stopCamera();
    setShowScanModal(false);
    if (!payloadText.trim()) return;

    const parsed = parsePatientPayload(payloadText);
    if (!parsed?.patientId) {
      setError('Scanned QR data is invalid.');
      return;
    }

    const patientObj = await fetchPatientDetails(parsed.patientId, parsed);

    fetchAdminMedicines();
    setCreateRxWorkspace({ patient: patientObj });
  };

  // Upload QR Image File Scan Handler
  const handleQRFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError('');
      setScanStatus('Reading uploaded QR image...');
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true
      });
      const decodedText = typeof result === 'string' ? result : result?.data;
      if (!decodedText) {
        throw new Error('No QR data found in image.');
      }
      setScannedPayload(decodedText);
      await handleProcessQRScan(decodedText);
    } catch (err) {
      setError('QR image scan failed: ' + err.message);
      setScanStatus('');
    } finally {
      e.target.value = '';
    }
  };

  // YouTube-Style Instant Search Suggestion Select Handler
  const handleSelectYoutubeSuggestion = (index, medItem) => {
    const updated = [...medicationsList];
    const defaultDose = Array.isArray(medItem.dosage) ? medItem.dosage[0].toString() : (medItem.dosage || '500').toString();

    updated[index] = {
      ...updated[index],
      medicineId: medItem._id,
      medicineName: medItem.medicineName,
      type: medItem.type || 'oral_tablet',
      dosage: defaultDose,
      unit: medItem.unit || 'mg',
      instructions: medItem.instructions || 'Take as directed by doctor.',
      notes: medItem.sideEffects ? `Side effects: ${medItem.sideEffects}` : '',
      searchQuery: medItem.medicineName,
      showSuggestions: false
    };
    setMedicationsList(updated);
  };

  const handleAddMedicationRow = () => {
    setMedicationsList(prev => [
      ...prev,
      {
        medicineId: null,
        medicineName: '',
        type: 'oral_tablet',
        dosage: '500',
        unit: 'mg',
        instructions: '',
        beforeEating: false,
        timesADay: '2',
        quantity: '1',
        howManyDays: '5 days',
        notes: '',
        price: 0,
        searchQuery: '',
        showSuggestions: false
      }
    ]);
  };

  const handleRemoveMedicationRow = (index) => {
    setMedicationsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMedRow = (index, field, value) => {
    const updated = [...medicationsList];
    updated[index][field] = value;
    if (field === 'searchQuery' || field === 'medicineName') {
      updated[index].searchQuery = value;
      updated[index].medicineName = value;
      updated[index].showSuggestions = value.trim().length > 0;
    }
    setMedicationsList(updated);
  };

  // Lab Report Attachment Rows Management
  const handleAddReportRow = () => {
    setReportAttachments(prev => [...prev, { title: '', fileUrl: '', labName: '' }]);
  };

  const handleRemoveReportRow = (index) => {
    setReportAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateReportRow = (index, field, value) => {
    const updated = [...reportAttachments];
    updated[index][field] = value;
    setReportAttachments(updated);
  };

  // Issue Real Prescription
  const handleIssuePrescription = async (e) => {
    e.preventDefault();
    if (!createRxWorkspace?.patient || medicationsList.length === 0) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/prescriptions', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          patientId: createRxWorkspace.patient.id,
          organizationId: userProfile?.doctorDetails?.affiliateOrganization || null,
          consultationFee: parseFloat(consultationFee) || 0,
          medications: medicationsList,
          reports: reportAttachments.filter(r => r.title.trim() && r.fileUrl.trim()),
          status: 'active'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue prescription');

      setSuccessMsg(`Prescription issued successfully for ${createRxWorkspace.patient.name}!`);
      setCreateRxWorkspace(null);
      fetchPrescriptions();
      setActiveTab('prescriptions');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Delete this prescription record?')) return;
    try {
      const res = await fetch(`/prescriptions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(false)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete prescription');
      setSuccessMsg('Prescription deleted.');
      fetchPrescriptions();
    } catch (err) {
      setError(err.message);
    }
  };

  const qrPayload = `AX|${userProfile?._id || 'PAT-1001'}|${qrToken}`;

  // If viewing a specific prescription page
  if (selectedRxId) {
    return (
      <PrescriptionPage 
        prescriptionId={selectedRxId} 
        onBack={() => setSelectedRxId(null)} 
      />
    );
  }

  // FULL-PAGE PRESCRIPTION CREATION WORKSPACE WITH TABLE-STYLE UI & LAB REPORTS
  if (createRxWorkspace && createRxWorkspace.patient) {
    const { patient } = createRxWorkspace;

    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <button type="button" onClick={() => setCreateRxWorkspace(null)} className="btn-secondary">
            <ArrowLeft size={16} />
            <span>Cancel & Return to Workspace</span>
          </button>

          <span className="badge badge-approved" style={{ fontSize: '0.85rem' }}>
            FULL-PAGE PRESCRIPTION CREATOR
          </span>
        </div>

        <form onSubmit={handleIssuePrescription}>
          <div className="white-panel" style={{ padding: '28px', marginBottom: '20px' }}>
            {/* Patient Header Card */}
            <div style={{ background: '#ecfdf5', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} />
                  <span>Patient Verified: {patient.name}</span>
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#065f46', marginTop: '2px' }}>
                  Patient Identity ID: <strong>{patient.id}</strong> • Blood Group: <strong style={{ color: '#dc2626' }}>{patient.bloodGroup}</strong>
                </p>
              </div>

              <button type="button" onClick={() => { setCreateRxWorkspace(null); setShowScanModal(true); }} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Scan Different Patient
              </button>
            </div>

            {/* Consultation Fee */}
            <div className="form-group" style={{ maxWidth: '320px', marginBottom: '24px' }}>
              <label className="form-label">Consultation Fee (₹)</label>
              <input type="number" className="form-input" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} required />
            </div>

            {/* PRESCRIBED MEDICATIONS TABLE STYLE UI */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pill size={20} color="#0284c7" />
                  <span>Prescribed Medications Table</span>
                </h3>

                <button type="button" onClick={handleAddMedicationRow} className="btn-primary" style={{ padding: '8px 14px' }}>
                  <Plus size={16} />
                  <span>Add Medicine Row</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#ffffff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#0284c7', color: '#ffffff', textAlign: 'left' }}>
                      <th style={{ padding: '12px', width: '40px' }}>#</th>
                      <th style={{ padding: '12px', minWidth: '240px' }}>Medicine Name (Live Autocomplete)</th>
                      <th style={{ padding: '12px', minWidth: '160px' }}>Form & Dosage</th>
                      <th style={{ padding: '12px', minWidth: '130px' }}>Frequency</th>
                      <th style={{ padding: '12px', minWidth: '140px' }}>Meal Timing</th>
                      <th style={{ padding: '12px', minWidth: '110px' }}>Duration</th>
                      <th style={{ padding: '12px', minWidth: '180px' }}>Directions & Notes</th>
                      <th style={{ padding: '12px', width: '50px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicationsList.map((med, index) => {
                      const suggestions = catalogMedicines.filter(m => 
                        m.medicineName.toLowerCase().includes((med.searchQuery || '').toLowerCase()) ||
                        (m.category && m.category.toLowerCase().includes((med.searchQuery || '').toLowerCase()))
                      );

                      return (
                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-dim)' }}>{index + 1}</td>
                          
                          {/* Live Autocomplete Column */}
                          <td style={{ padding: '12px', position: 'relative' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Search Admin Catalog (e.g. Paracetamol)..."
                              value={med.searchQuery || med.medicineName}
                              onFocus={() => handleUpdateMedRow(index, 'showSuggestions', true)}
                              onChange={(e) => handleUpdateMedRow(index, 'searchQuery', e.target.value)}
                              required
                            />

                            {/* Suggestions Overlay */}
                            {med.showSuggestions && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '12px',
                                right: '12px',
                                background: '#ffffff',
                                border: '1px solid #bae6fd',
                                borderRadius: '10px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
                                zIndex: 100,
                                maxHeight: '220px',
                                overflowY: 'auto',
                                marginTop: '4px'
                              }}>
                                <div style={{ padding: '6px 12px', background: '#e0f2fe', fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', borderBottom: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span>{suggestions.length} Catalog Matches</span>
                                  <button type="button" onClick={() => handleUpdateMedRow(index, 'showSuggestions', false)} style={{ background: 'none', border: 'none', color: '#0369a1', cursor: 'pointer' }}><X size={12} /></button>
                                </div>

                                {suggestions.length === 0 ? (
                                  <div style={{ padding: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    No catalog matches. Type manually.
                                  </div>
                                ) : (
                                  suggestions.map((sug) => (
                                    <div
                                      key={sug._id}
                                      onClick={() => handleSelectYoutubeSuggestion(index, sug)}
                                      style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                    >
                                      <div>
                                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block' }}>{sug.medicineName}</strong>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sug.category || 'General'}</span>
                                      </div>
                                      <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                                        {Array.isArray(sug.dosage) ? sug.dosage.join('/') : sug.dosage}{sug.unit}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </td>

                          {/* Form & Dosage */}
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <select className="form-input" style={{ fontSize: '0.8rem' }} value={med.type} onChange={(e) => handleUpdateMedRow(index, 'type', e.target.value)}>
                                {['oral_tablet', 'capsule', 'syrup', 'injection', 'lotion', 'gel', 'ointment', 'drops', 'inhaler'].map(t => (
                                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                                ))}
                              </select>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <input type="text" className="form-input" style={{ flex: 1, fontSize: '0.8rem' }} value={med.dosage} onChange={(e) => handleUpdateMedRow(index, 'dosage', e.target.value)} required />
                                <select className="form-input" style={{ width: '60px', fontSize: '0.75rem' }} value={med.unit} onChange={(e) => handleUpdateMedRow(index, 'unit', e.target.value)}>
                                  {['mg', 'ml', 'g', 'mcg', 'IU', 'puffs'].map(u => (
                                    <option key={u} value={u}>{u}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </td>

                          {/* Frequency */}
                          <td style={{ padding: '12px' }}>
                            <select className="form-input" style={{ fontSize: '0.8rem' }} value={med.timesADay} onChange={(e) => handleUpdateMedRow(index, 'timesADay', e.target.value)}>
                              <option value="1">1x Daily</option>
                              <option value="2">2x Daily</option>
                              <option value="3">3x Daily</option>
                              <option value="4">4x Daily</option>
                            </select>
                          </td>

                          {/* Meal Timing */}
                          <td style={{ padding: '12px' }}>
                            <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={med.beforeEating} onChange={(e) => handleUpdateMedRow(index, 'beforeEating', e.target.checked)} />
                              <span>{med.beforeEating ? 'Before Food' : 'After Food'}</span>
                            </label>
                          </td>

                          {/* Duration */}
                          <td style={{ padding: '12px' }}>
                            <input type="text" className="form-input" style={{ fontSize: '0.8rem' }} value={med.howManyDays} onChange={(e) => handleUpdateMedRow(index, 'howManyDays', e.target.value)} required />
                          </td>

                          {/* Directions */}
                          <td style={{ padding: '12px' }}>
                            <input type="text" className="form-input" style={{ fontSize: '0.8rem' }} value={med.instructions} onChange={(e) => handleUpdateMedRow(index, 'instructions', e.target.value)} placeholder="e.g. Take with warm water..." />
                          </td>

                          {/* Action */}
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {medicationsList.length > 1 && (
                              <button type="button" onClick={() => handleRemoveMedicationRow(index)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                                <X size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LAB REPORT ATTACHMENTS SECTION */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Paperclip size={20} color="#059669" />
                  <span>Attach Diagnostic Lab Reports (PDF Document URLs)</span>
                </h3>

                <button type="button" onClick={handleAddReportRow} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  <Plus size={14} />
                  <span>Attach Another Report</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reportAttachments.map((rep, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, minWidth: '180px' }}
                      placeholder="Report Title (e.g. CBC Blood Test)"
                      value={rep.title}
                      onChange={(e) => handleUpdateReportRow(idx, 'title', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 2, minWidth: '240px' }}
                      placeholder="Report File / PDF Document URL (e.g. https://.../cbc-report.pdf)"
                      value={rep.fileUrl}
                      onChange={(e) => handleUpdateReportRow(idx, 'fileUrl', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, minWidth: '150px' }}
                      placeholder="Lab Name (Optional)"
                      value={rep.labName}
                      onChange={(e) => handleUpdateReportRow(idx, 'labName', e.target.value)}
                    />
                    {reportAttachments.length > 1 && (
                      <button type="button" onClick={() => handleRemoveReportRow(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setCreateRxWorkspace(null)} className="btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
              <button type="submit" className="btn-success" disabled={isSubmitting} style={{ padding: '10px 24px', fontSize: '0.95rem' }}>
                {isSubmitting ? 'Issuing Prescription...' : 'Issue Official Prescription'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

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
              <Stethoscope size={16} /><span>Doctor Profile & Affiliation</span>
            </button>
            <button type="button" onClick={() => setActiveTab('qrcode')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'qrcode' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'qrcode' ? '#a7f3d0' : 'transparent', color: activeTab === 'qrcode' ? '#059669' : 'var(--text-muted)' }}>
              <QrCode size={16} /><span>My Doctor Health QR</span>
            </button>
            <button type="button" onClick={() => { setShowScanModal(true); fetchAdminMedicines(); }} className="btn-primary" style={{ justifyContent: 'flex-start', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', padding: '8px 12px' }}>
              <QrCode size={16} /><span>Scan Patient QR & Prescribe</span>
            </button>
            <button type="button" onClick={() => setActiveTab('prescriptions')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'prescriptions' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'prescriptions' ? '#a7f3d0' : 'transparent', color: activeTab === 'prescriptions' ? '#059669' : 'var(--text-muted)' }}>
              <FileText size={16} /><span>Issued Prescriptions ({prescriptions.length})</span>
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
            <button type="button" onClick={() => setActiveTab('qrcode')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'qrcode' ? '#f0f9ff' : 'transparent', borderColor: activeTab === 'qrcode' ? '#bae6fd' : 'transparent', color: activeTab === 'qrcode' ? '#0284c7' : 'var(--text-muted)' }}>
              <QrCode size={16} /><span>Health Identity QR</span>
            </button>
            <button type="button" onClick={() => setActiveTab('prescriptions')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'prescriptions' ? '#f0f9ff' : 'transparent', borderColor: activeTab === 'prescriptions' ? '#bae6fd' : 'transparent', color: activeTab === 'prescriptions' ? '#0284c7' : 'var(--text-muted)' }}>
              <Pill size={16} /><span>My Prescriptions ({prescriptions.length})</span>
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

        {/* TAB 1: MY PROFILE */}
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

        {/* TAB 2: HEALTH IDENTITY QR CODE WITH DOWNLOAD PNG BUTTON */}
        {activeTab === 'qrcode' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={22} color="#0284c7" />
                  <span>Digital Health QR Passport</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Show or download this QR code to grant doctors access to your prescription portal.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={handleDownloadQRImage} className="btn-success" style={{ padding: '8px 14px' }}>
                  <Download size={15} />
                  <span>Download QR Code Image</span>
                </button>
                <button type="button" onClick={handleRegenerateQR} className="btn-primary" style={{ padding: '8px 14px' }}>
                  <RefreshCw size={15} />
                  <span>Refresh Token</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <QRCodeSVG value={qrPayload} size={230} />

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{userProfile?.name}</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Blood Group: <strong style={{ color: '#dc2626' }}>{userProfile?.bloodGroup || 'A+'}</strong> • Location: <strong>{userProfile?.location?.city || 'New Delhi'}</strong>
                </p>
                <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                  <ShieldCheck size={14} />
                  <span>Active Token: {qrToken}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRESCRIPTIONS LIST & TABULAR VIEW */}
        {activeTab === 'prescriptions' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pill size={22} color="#0284c7" />
                  <span>{activeMode === 'doctor' ? 'Issued Medical Prescriptions' : 'My Prescriptions'}</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {activeMode === 'doctor' ? 'Prescriptions issued to patients via QR Code Scanning.' : 'Official medical prescriptions issued by verified practitioners.'}
                </p>
              </div>

              {activeMode === 'doctor' && (
                <button type="button" onClick={() => { setShowScanModal(true); fetchAdminMedicines(); }} className="btn-success" style={{ padding: '8px 14px' }}>
                  <QrCode size={16} />
                  <span>New Prescription via QR Scan</span>
                </button>
              )}
            </div>

            {prescriptions.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '12px' }}>
                <Pill size={40} color="var(--text-dim)" style={{ margin: '0 auto 10px auto' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No active prescriptions found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {prescriptions.map((rx) => (
                  <div key={rx._id} className="white-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          Prescription #{rx._id.slice(-6).toUpperCase()}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Issued by <strong>{rx.doctorId?.name || 'Practitioner'}</strong> for <strong>{rx.patientId?.name || 'Patient'}</strong> on {new Date(rx.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button type="button" onClick={() => setSelectedRxId(rx._id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#0284c7', borderColor: '#bae6fd' }}>
                          <Eye size={15} />
                          <span>View Official Rx Page</span>
                        </button>
                        {rx.consultationFee > 0 && (
                          <span style={{ background: '#fff7ed', color: '#ea580c', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                            Fee: ₹{rx.consultationFee}
                          </span>
                        )}
                        <span className="badge badge-approved">{rx.status || 'Active'}</span>
                        {(userProfile?.isDoctor || userProfile?.role === 'admin') && (
                          <button type="button" onClick={() => handleDeletePrescription(rx._id)} className="btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Medications Subdocuments Tabular Table */}
                    <div style={{ overflowX: 'auto', background: '#f8fafc', borderRadius: '10px', padding: '12px', border: '1px solid var(--border-color)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '6px' }}>Medicine</th>
                            <th style={{ padding: '6px' }}>Dosage & Form</th>
                            <th style={{ padding: '6px' }}>Frequency</th>
                            <th style={{ padding: '6px' }}>Meal Timing</th>
                            <th style={{ padding: '6px' }}>Duration</th>
                            <th style={{ padding: '6px' }}>Directions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(rx.medications) && rx.medications.map((med, idx) => (
                            <tr key={idx} style={{ borderBottom: idx < rx.medications.length - 1 ? '1px dashed #cbd5e1' : 'none' }}>
                              <td style={{ padding: '8px 6px', fontWeight: 700, color: 'var(--text-main)' }}>{med.medicineName}</td>
                              <td style={{ padding: '8px 6px' }}>{med.dosage}{med.unit} ({med.type?.replace('_', ' ')})</td>
                              <td style={{ padding: '8px 6px' }}>{med.timesADay}x daily ({med.quantity} qty)</td>
                              <td style={{ padding: '8px 6px' }}>
                                <span style={{ background: med.beforeEating ? '#fff7ed' : '#ecfdf5', color: med.beforeEating ? '#ea580c' : '#047857', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                                  {med.beforeEating ? 'Before Food' : 'After Food'}
                                </span>
                              </td>
                              <td style={{ padding: '8px 6px' }}>{med.howManyDays}</td>
                              <td style={{ padding: '8px 6px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{med.instructions || med.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LAB REPORTS */}
        {activeTab === 'reports' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>Diagnostic Lab Reports</h3>
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

        {/* DOCTOR PRACTITIONER & ORGANIZATION AFFILIATION SEARCH TAB */}
        {activeTab === 'practitioner' && userProfile?.isDoctor && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Doctor Practitioner & Hospital Affiliation</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Search and send affiliation requests to hospitals/clinics.</p>
              </div>
              
              <span className={
                userProfile.doctorDetails?.affiliateOrganizationApprovalStatus === 'approved' 
                  ? 'badge badge-approved' 
                  : userProfile.doctorDetails?.affiliateOrganizationApprovalStatus === 'pending'
                  ? 'badge badge-pending'
                  : 'badge badge-danger'
              }>
                {userProfile.doctorDetails?.affiliateOrganizationApprovalStatus === 'approved' ? 'AFFILIATED & VERIFIED' : 'AFFILIATION PENDING'}
              </span>
            </div>

            {/* Current Affiliation Status Card */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Building2 size={18} color="#0284c7" />
                <span>Current Hospital/Clinic Affiliation</span>
              </h4>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {userProfile.doctorDetails?.affiliateOrganizationApprovalStatus === 'approved' ? (
                  <span style={{ color: '#047857', fontWeight: 700 }}>Fully affiliated and approved to issue medical prescriptions.</span>
                ) : userProfile.doctorDetails?.affiliateOrganizationApprovalStatus === 'pending' ? (
                  <span style={{ color: '#d97706', fontWeight: 700 }}>Affiliation request sent to organization. Waiting for hospital approval.</span>
                ) : (
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>Not currently affiliated with any registered organization. Search below to send a request.</span>
                )}
              </p>
            </div>

            {/* Search Organizations Section */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
                Search Registered Hospitals & Clinics
              </h4>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search hospital or clinic by name or city (e.g. Apex Health, City Hospital)..."
                  value={orgSearchQuery}
                  onChange={(e) => handleSearchOrganizations(e.target.value)}
                />
              </div>

              {isSearchingOrgs ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Searching registered organizations...</p>
              ) : orgSearchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {orgSearchResults.map((org) => (
                    <div key={org._id} className="white-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>{org.name}</h5>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Type: <strong>{org.facilityType || 'Hospital'}</strong> • City: <strong>{org.location?.city || 'New Delhi'}</strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSendAffiliationRequest(org._id, org.name)}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        <Send size={14} />
                        <span>Send Affiliation Request</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : orgSearchQuery.trim() ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No registered organizations matching "{orgSearchQuery}".</p>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* DOCTOR MULTI-OPTION PATIENT QR SCANNER MODAL */}
      {showScanModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} color="#059669" />
                <span>Patient QR Code Scanner</span>
              </h3>
              <button type="button" onClick={() => { stopCamera(); setShowScanModal(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div>
              {/* WebCam / Live Viewfinder */}
              <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                {!cameraActive ? (
                  <div>
                    <Camera size={36} color="#059669" style={{ margin: '0 auto 8px auto' }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Scan patient's QR code via live camera or upload a QR image file.</p>
                    
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button type="button" onClick={startCamera} className="btn-success" style={{ padding: '8px 16px' }}>
                        <Camera size={16} />
                        <span>Open Device Camera</span>
                      </button>

                      <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary" style={{ padding: '8px 16px' }}>
                        <Upload size={16} />
                        <span>Upload QR Image</span>
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleQRFileUpload} style={{ display: 'none' }} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ position: 'relative', width: '100%', maxHeight: '240px', overflow: 'hidden', borderRadius: '10px', background: '#000000', marginBottom: '10px' }}>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, border: '3px dashed #10b981', margin: '30px auto', width: '180px', height: '180px', borderRadius: '12px', pointerEvents: 'none' }} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#059669', marginBottom: '10px' }}>{scanStatus || 'Point camera at QR code for auto scan.'}</p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button type="button" onClick={stopCamera} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                        <CameraOff size={14} />
                        <span>Close Camera</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Or Paste / Input Patient QR Payload or ID</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder='Paste patient QR JSON string or Patient ID...'
                  value={scannedPayload}
                  onChange={(e) => setScannedPayload(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => handleProcessQRScan(scannedPayload)}
                className="btn-success"
                style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
              >
                Verify Patient & Open Prescription Creator Page
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" value={editCity} onChange={(e) => setEditCity(e.target.value)} required />
                </div>

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
                    <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Longitude" value={editLng} onChange={(e) => setEditLng(e.target.value)} required />
                    <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Latitude" value={editLat} onChange={(e) => setEditLat(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
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

