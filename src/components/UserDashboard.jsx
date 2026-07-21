import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import QrScanner from 'qr-scanner';
import qrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min?url';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/axios';
import { PrescriptionPage } from '../pages/PrescriptionPage';
import { AppointmentCard } from './appointment/AppointmentCard';
import { SlotGeneratorModal } from './appointment/SlotGeneratorModal';
import { QRScannerModal } from './appointment/QRScannerModal';
import { QRViewerModal } from './appointment/QRViewerModal';
import { EditAppointmentModal } from './appointment/EditAppointmentModal';
import { ActionConfirmationModal } from './appointment/ActionConfirmationModal';
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
  Send,
  Globe,
  UserCheck,
  BarChart3,
  TrendingUp,
  PieChart,
  Filter,
  ShoppingBag,
  Tag,
  ShoppingCart,
  Printer,
  Receipt
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

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
  
  // Active viewing profile state for Managed Profiles (Family Members)
  const [selectedManagedProfile, setSelectedManagedProfile] = useState(null);
  const activeProfile = selectedManagedProfile || userProfile;

  // Doctor Dual Mode State: 'doctor' | 'patient'
  const [activeMode, setActiveMode] = useState(userProfile?.isDoctor ? 'doctor' : 'patient');
  
  // Sidebar active tab
  const [activeTab, setActiveTab] = useState(userProfile?.isDoctor ? 'practitioner' : 'profile');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected Prescription for Tabular Page View
  const [selectedRxId, setSelectedRxId] = useState(null);

  // Full-Page Doctor Prescription Creator State
  const [createRxWorkspace, setCreateRxWorkspace] = useState(null);

  // Doctor Organization Affiliation Search State
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [orgSearchResults, setOrgSearchResults] = useState([]);

  // QR Code Security Token State
  const [qrToken, setQrToken] = useState(Date.now().toString(36));

  // Profile Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('A+');
  const [editHouseNo, setEditHouseNo] = useState('');
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

  // Nearby Healthcare Leaflet Map State
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [nearbyOrganizations, setNearbyOrganizations] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Appointments State
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [isBookingSlot, setIsBookingSlot] = useState(false);
  const [selectedTicketApt, setSelectedTicketApt] = useState(null);
  const [showSlotGenModal, setShowSlotGenModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [confirmModalConfig, setConfirmModalConfig] = useState(null);
  const [showAllSlotHistory, setShowAllSlotHistory] = useState(false);

  // Medicine Marketplace & Cart State
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Patient Buying Orders & Invoice Bill Modal State
  const [patientOrders, setPatientOrders] = useState([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Doctor Slots Management State
  const [docSlotDate, setDocSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [docStartTime, setDocStartTime] = useState('09:00');
  const [docEndTime, setDocEndTime] = useState('13:00');
  const [docFee, setDocFee] = useState(500);
  const [docMaxBookings, setDocMaxBookings] = useState(5);
  const [docConsultationMode, setDocConsultationMode] = useState('in_person');
  const [docSlotTitle, setDocSlotTitle] = useState('General Consultation Slot');

  // Family Managed Profiles State
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [familyAddMode, setFamilyAddMode] = useState('create');
  const [familySearchEmail, setFamilySearchEmail] = useState('');
  const [familySearchResult, setFamilySearchResult] = useState(null);
  const [familyNewName, setFamilyNewName] = useState('');
  const [familyNewBloodGroup, setFamilyNewBloodGroup] = useState('A+');
  const [familyNewRelation, setFamilyNewRelation] = useState('Family Member');

  // Sync edit form fields when activeProfile changes
  useEffect(() => {
    if (activeProfile) {
      setEditName(activeProfile.name || '');
      setEditBloodGroup(activeProfile.bloodGroup || 'A+');
      setEditHouseNo(activeProfile.location?.houseNo || '');
      setEditRoomNo(activeProfile.location?.roomNo || '');
      setEditFloorNo(activeProfile.location?.floorNo || 0);
      setEditLandmark(activeProfile.location?.landmark || '');
      setEditCity(activeProfile.location?.city || '');
      setEditState(activeProfile.location?.state || '');
      setEditPincode(activeProfile.location?.pincode || '');
      setEditLng(activeProfile.coordinates?.[0] ?? '77.2090');
      setEditLat(activeProfile.coordinates?.[1] ?? '28.6139');
      if (activeProfile.isDoctor) {
        setEditSpeciality(activeProfile.doctorDetails?.speciality || '');
        setEditCertNo(activeProfile.doctorDetails?.certificateNo || '');
        setEditCertDoc(activeProfile.doctorDetails?.certificateDoc || '');
      }
    }
  }, [activeProfile]);

  const safeFetchJson = async (url, options = {}) => {
    try {
      const method = (options.method || 'GET').toLowerCase();
      let res;
      if (method === 'get') {
        res = await apiClient.get(url, options);
      } else if (method === 'post') {
        res = await apiClient.post(url, options.body ? JSON.parse(options.body) : {}, options);
      } else if (method === 'put') {
        res = await apiClient.put(url, options.body ? JSON.parse(options.body) : {}, options);
      } else if (method === 'delete') {
        res = await apiClient.delete(url, options);
      } else {
        res = await apiClient(url, options);
      }
      return { ok: true, status: res.status, data: res.data };
    } catch (err) {
      return { ok: false, status: err.response?.status || 500, error: err.message, data: err.response?.data || null };
    }
  };

  // Fetch real prescriptions from API
  const fetchPrescriptions = async () => {
    const { ok, data } = await safeFetchJson('/prescriptions', { headers: getAuthHeaders(false) });
    if (ok && data?.prescriptions) {
      setPrescriptions(data.prescriptions);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [userProfile]);

  // Fetch Appointments & Available Slots
  const fetchAppointmentsAndSlots = async () => {
    const [{ ok: appOk, data: appData }, { ok: slotOk, data: slotData }] = await Promise.all([
      safeFetchJson('/appointments', { headers: getAuthHeaders(false) }),
      safeFetchJson('/appointments/slots', { headers: getAuthHeaders(false) })
    ]);

    if (appOk && appData?.appointments) setAppointments(appData.appointments);
    if (slotOk && slotData?.slots) setAvailableSlots(slotData.slots);
  };

  useEffect(() => {
    fetchAppointmentsAndSlots();
  }, [userProfile, activeTab]);

  // Fetch Pharmacy Inventory for Marketplace
  const fetchMarketplaceInventory = async () => {
    const { ok, data } = await safeFetchJson('/pharmacy/inventory', { headers: getAuthHeaders(false) });
    if (ok && data?.items) {
      setMarketplaceItems(data.items);
    }
  };

  // Fetch Patient Buying Orders
  const fetchPatientOrders = async () => {
    const { ok, data } = await safeFetchJson('/pharmacy/orders', { headers: getAuthHeaders(false) });
    if (ok && data?.orders) {
      setPatientOrders(data.orders);
    }
  };

  useEffect(() => {
    fetchMarketplaceInventory();
    fetchPatientOrders();
  }, [userProfile, activeTab]);

  // Fetch Nearby Healthcare Facilities for Leaflet Map
  const fetchNearbyFacilities = async () => {
    try {
      const { data } = await apiClient.get('/org/search?query=');
      if (data.organizations) {
        setNearbyOrganizations(data.organizations);
      }
    } catch (err) {
      console.error('Error fetching nearby organizations:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'map') {
      fetchNearbyFacilities();
    }
  }, [activeTab]);

  // Initialize Leaflet Map with invalidateSize fix
  useEffect(() => {
    let invalidateTimer;

    if (activeTab === 'map' && mapContainerRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const centerLat = parseFloat(activeProfile?.coordinates?.[1]) || 28.6139;
      const centerLng = parseFloat(activeProfile?.coordinates?.[0]) || 77.2090;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      invalidateTimer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `<div style="background: #0284c7; color: white; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 12px rgba(2,132,199,0.4);">📍</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      L.marker([centerLat, centerLng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<strong>${activeProfile?.name || 'Your Location'}</strong><br/>Patient Home Base`);

      nearbyOrganizations.forEach((org) => {
        const orgLat = parseFloat(org.coordinates?.[1]) || centerLat + (Math.random() - 0.5) * 0.05;
        const orgLng = parseFloat(org.coordinates?.[0]) || centerLng + (Math.random() - 0.5) * 0.05;

        const typeColor = 
          org.facilityType === 'hospital' ? '#2563eb' :
          org.facilityType === 'clinic' ? '#059669' :
          org.facilityType === 'laboratory' ? '#7c3aed' : '#d97706';

        const typeLabel = (org.facilityType || 'hospital').toUpperCase();

        const orgIcon = L.divIcon({
          className: 'custom-org-marker',
          html: `<div style="background: ${typeColor}; color: white; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">${typeLabel[0]}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([orgLat, orgLng], { icon: orgIcon }).addTo(map);
        marker.bindPopup(`
          <div style="padding: 4px; font-family: Plus Jakarta Sans, sans-serif; max-width: 220px;">
            <div style="font-size: 10px; font-weight: 800; color: ${typeColor}; text-transform: uppercase;">${typeLabel}</div>
            <strong style="font-size: 14px; color: #0f172a; display: block; margin: 2px 0;">${org.name}</strong>
            <div style="font-size: 12px; color: #64748b;">📍 ${org.location?.city || 'City'}, ${org.location?.state || ''}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">📞 ${org.contactNumber || 'Available'}</div>
          </div>
        `);

        marker.on('click', () => {
          setSelectedFacility(org);
        });
      });
    }

    return () => {
      if (invalidateTimer) clearTimeout(invalidateTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, nearbyOrganizations, activeProfile]);

  // Load Admin Medicines Catalog
  const fetchAdminMedicines = async () => {
    try {
      const { data } = await apiClient.get('/medicines?limit=100');
      if (Array.isArray(data.data)) {
        setCatalogMedicines(data.data);
      }
    } catch (err) {
      console.error('Error fetching catalog medicines:', err);
    }
  };

  useEffect(() => {
    fetchAdminMedicines();
  }, []);

  // Search Organizations for Doctor Affiliation
  const handleSearchOrganizations = async (query = '') => {
    setOrgSearchQuery(query);
    try {
      const { ok, data } = await safeFetchJson(`/org/search?query=${encodeURIComponent(query.trim())}`);
      if (ok && data) {
        setOrgSearchResults(data.organizations || []);
      }
    } catch (err) {
      console.error('Error searching organizations:', err);
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
      const { ok, data, error: errStr } = await safeFetchJson('/user/affiliate-request', {
        method: 'POST',
        body: JSON.stringify({ organizationId: orgId })
      });
      if (!ok) throw new Error(errStr || 'Failed to send affiliation request.');

      setSuccessMsg(`Affiliation request sent to ${orgName}! Waiting for hospital approval.`);
      refreshUser();
    } catch (err) {
      setError(err.message);
    }
  };

  // Create Consultation Slot (Doctor Side)
  const handleCreateDoctorSlot = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      const { ok, data, error: errStr } = await safeFetchJson('/appointments/slots', {
        method: 'POST',
        body: JSON.stringify({
          title: docSlotTitle,
          slotDate: docSlotDate,
          startTime: docStartTime,
          endTime: docEndTime,
          fee: parseFloat(docFee) || 0,
          maxBookings: parseInt(docMaxBookings, 10) || 5,
          consultationMode: docConsultationMode
        })
      });
      if (!ok) throw new Error(errStr || 'Failed to create slot.');

      setSuccessMsg('Consultation slot published successfully!');
      fetchAppointmentsAndSlots();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Item to Marketplace Cart
  const handleAddToCart = (inventoryItem) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === inventoryItem._id);
      if (existing) {
        return prev.map(item => item._id === inventoryItem._id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...inventoryItem, qty: 1 }];
    });
    setSuccessMsg(`Added ${inventoryItem.medicineId?.medicineName || 'Medicine'} to your cart!`);
  };

  // Checkout Medicine Cart
  const handleCheckoutCart = async () => {
    if (cart.length === 0) return;
    try {
      setIsSubmitting(true);
      setError('');
      const firstOrgId = cart[0]?.organizationId?._id || cart[0]?.organizationId;

      const orderItems = cart.map(item => ({
        inventoryId: item._id,
        quantity: item.qty
      }));

      const res = await fetch('/pharmacy/orders', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          organizationId: firstOrgId,
          items: orderItems
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to checkout cart.');

      setSuccessMsg(`Order placed successfully! Order #${data.order?._id?.slice(-6).toUpperCase()}`);
      setCart([]);
      setShowCartModal(false);
      fetchPatientOrders();
      setActiveTab('my_orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Book Appointment Slot (Patient Side)
  const handleBookSlot = async (slotId) => {
    try {
      setIsBookingSlot(true);
      setError('');
      let { ok, data, error: errStr } = await safeFetchJson('/appointments/book', {
        method: 'POST',
        body: JSON.stringify({ slotId, notes: 'Booked via ArogyaX Patient Portal' })
      });
      if (!ok) {
        const res2 = await safeFetchJson('/appointments', {
          method: 'POST',
          body: JSON.stringify({ slotId, notes: 'Booked via ArogyaX Patient Portal' })
        });
        ok = res2.ok;
        data = res2.data;
        errStr = res2.error;
      }
      if (!ok) throw new Error(errStr || 'Failed to book appointment.');

      setSuccessMsg('Appointment booked successfully! Confirmation sent to your portal.');
      fetchAppointmentsAndSlots();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBookingSlot(false);
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
        ctx.fillText(`Patient: ${activeProfile?.name || 'User'} (${activeProfile?.bloodGroup || 'A+'})`, 40, 70);

        ctx.drawImage(img, 50, 90, 400, 370);

        const a = document.createElement('a');
        a.download = `${(activeProfile?.name || 'Patient').replace(/\s+/g, '_')}_ArogyaX_QR.png`;
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
      const { ok, data } = await safeFetchJson(`/user/profile/${patientId}`);
      if (ok && data?.userProfile) {
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

  // Camera Management for Doctor QR Scanner
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

      const targetId = activeProfile?._id || userProfile._id;

      const payload = {
        name: editName || activeProfile.name || 'User',
        bloodGroup: editBloodGroup || 'A+',
        location: {
          houseNo: editHouseNo || '',
          roomNo: editRoomNo || '',
          floorNo: parseInt(editFloorNo, 10) || 0,
          landmark: editLandmark || '',
          city: editCity || 'New Delhi',
          state: editState || 'Delhi',
          pincode: editPincode || '110001'
        },
        coordinates: [parseFloat(editLng) || 77.2090, parseFloat(editLat) || 28.6139]
      };

      if (activeProfile.isDoctor) {
        payload.doctorDetails = {
          speciality: editSpeciality || 'General Medicine',
          certificateNo: editCertNo || `MCI-${Date.now()}`,
          certificateDoc: editCertDoc || 'https://example.com/doc-cert.pdf'
        };
      }

      const { ok, data, error: errStr } = await safeFetchJson(`/user/profile/${targetId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (!ok) throw new Error(errStr || 'Failed to update profile');

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

  // Instant Search Suggestion Select Handler
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
      const { ok, data, error: errStr } = await safeFetchJson('/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          patientId: createRxWorkspace.patient.id,
          organizationId: userProfile?.doctorDetails?.affiliateOrganization || null,
          consultationFee: parseFloat(consultationFee) || 0,
          medications: medicationsList,
          reports: reportAttachments.filter(r => r.title.trim() && r.fileUrl.trim()),
          status: 'active'
        })
      });

      if (!ok) throw new Error(errStr || 'Failed to issue prescription');

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

  // Handle Family Profile Search
  const handleSearchFamilyUser = async (e) => {
    e.preventDefault();
    if (!familySearchEmail.trim()) return;
    try {
      setLoading(true);
      setError('');
      const { ok, data, error: errStr } = await safeFetchJson(`/user/search?email=${encodeURIComponent(familySearchEmail.trim())}`);
      if (!ok) throw new Error(errStr || 'No registered patient found with this email.');

      setFamilyFoundUser(data.user);
      setSuccessMsg(`Found patient: ${data.user?.name || data.email}`);
    } catch (err) {
      setError(err.message);
      setFamilyFoundUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Add Family Member Profile
  const handleAddFamilyMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      const payload = {
        email: familyNewEmail.trim(),
        name: familyNewName.trim(),
        bloodGroup: familyNewBloodGroup,
        relation: familyNewRelation
      };

      const { ok, data, error: errStr } = await safeFetchJson('/user/managed-profiles/request', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (!ok) throw new Error(errStr || 'Failed to add family member profile.');

      setSuccessMsg(data.message || 'Family member profile connected successfully!');
      setShowAddFamilyModal(false);
      refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Unlink Managed Profile
  const handleRemoveManagedProfile = async (targetUserId) => {
    if (!window.confirm('Unlink this family member profile?')) return;
    try {
      const { ok, error: errStr } = await safeFetchJson(`/user/managed-profiles/${targetUserId}`, {
        method: 'DELETE'
      });
      if (!ok) throw new Error(errStr || 'Failed to unlink family profile.');

      setSuccessMsg('Family member profile unlinked.');
      if (selectedManagedProfile?._id === targetUserId) {
        setSelectedManagedProfile(null);
      }
      refreshUser();
    } catch (err) {
      setError(err.message);
    }
  };

  // Visited Patients list for Doctor Panel History
  const visitedPatients = React.useMemo(() => {
    const map = new Map();
    prescriptions.forEach(rx => {
      if (rx.patientId) {
        const pid = rx.patientId._id || rx.patientId.id || rx.patientId;
        if (!map.has(pid)) {
          map.set(pid, {
            id: pid,
            name: rx.patientId.name || 'Verified Patient',
            bloodGroup: rx.patientId.bloodGroup || 'A+',
            location: rx.patientId.location?.city || 'New Delhi',
            visitCount: 1,
            lastVisit: rx.createdAt,
            latestRx: rx
          });
        } else {
          const item = map.get(pid);
          item.visitCount += 1;
          if (new Date(rx.createdAt) > new Date(item.lastVisit)) {
            item.lastVisit = rx.createdAt;
            item.latestRx = rx;
          }
        }
      }
    });
    return Array.from(map.values());
  }, [prescriptions]);

  // Filtered Appointments
  const filteredAppointments = React.useMemo(() => {
    return appointments.filter(app => {
      const matchesSearch = 
        !appointmentSearchQuery.trim() ||
        (app.doctorId?.name || '').toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
        (app.organizationId?.name || '').toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
        (app.patientId?.name || '').toLowerCase().includes(appointmentSearchQuery.toLowerCase());

      let matchesStatus = true;
      if (appointmentStatusFilter === 'active') {
        matchesStatus = ['requested', 'approved', 'appointed', 'checked_in', 'waiting', 'in_consultation'].includes(app.status || 'appointed');
      } else if (appointmentStatusFilter === 'completed') {
        matchesStatus = app.status === 'completed';
      } else if (appointmentStatusFilter === 'cancelled') {
        matchesStatus = app.status === 'cancelled' || app.status === 'rejected';
      } else if (appointmentStatusFilter !== 'all') {
        matchesStatus = app.status === appointmentStatusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [appointments, appointmentSearchQuery, appointmentStatusFilter]);

  // Group Filtered Appointments by Slot / Date Key for clean slot-wise history
  const groupedSlotAppointments = React.useMemo(() => {
    const map = new Map();
    filteredAppointments.forEach(app => {
      const slotKey = app.slotId?._id || app.appointmentDate || 'General Slots';
      const slotTitle = app.slotId?.title || `Slot: ${app.appointmentDate} (${app.appointmentTime || 'Scheduled'})`;
      const slotDate = app.appointmentDate || app.slotId?.slotDate || 'Today';
      const slotTime = app.appointmentTime || app.slotId?.startTime || '';
      
      if (!map.has(slotKey)) {
        map.set(slotKey, {
          slotKey,
          slotTitle,
          slotDate,
          slotTime,
          consultationMode: app.slotId?.consultationMode || 'in_person',
          fee: app.slotId?.fee || 0,
          appointments: []
        });
      }
      map.get(slotKey).appointments.push(app);
    });
    return Array.from(map.values());
  }, [filteredAppointments]);

  // Filtered Marketplace Items
  const filteredMarketplaceItems = React.useMemo(() => {
    return marketplaceItems.filter(item => {
      const query = marketplaceSearch.toLowerCase().trim();
      if (!query) return true;
      return (
        (item.medicineId?.medicineName || '').toLowerCase().includes(query) ||
        (item.companyName || '').toLowerCase().includes(query) ||
        (item.organizationId?.name || '').toLowerCase().includes(query)
      );
    });
  }, [marketplaceItems, marketplaceSearch]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const qrPayload = `AX|${activeProfile?._id || 'PAT-1001'}|${qrToken}`;

  // Doctor Prescription Creator Workspace
  if (createRxWorkspace) {
    return (
      <div className="app-container" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="white-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #059669', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button type="button" onClick={() => setCreateRxWorkspace(null)} className="btn-secondary" style={{ padding: '6px 12px' }}>
                <ArrowLeft size={16} /><span>Back</span>
              </button>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Issue Medical Prescription</h2>
                <p style={{ fontSize: '0.84rem', color: '#64748b' }}>Patient: <strong>{createRxWorkspace.patient.name}</strong> • Blood Group: <strong>{createRxWorkspace.patient.bloodGroup}</strong></p>
              </div>
            </div>
            <span className="badge badge-approved" style={{ fontSize: '0.85rem' }}>OFFICIAL RX</span>
          </div>

          <form onSubmit={handleIssuePrescription} style={{ display: 'grid', gap: '20px' }}>
            <div className="grid-2col" style={{ gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Consultation Fee (₹)</label>
                <input type="number" className="form-input" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Prescribing Practitioner</label>
                <input type="text" className="form-input" value={`Dr. ${userProfile?.name}`} disabled />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Prescribed Medications ({medicationsList.length})</h4>
                <button type="button" onClick={handleAddMedicationRow} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                  <Plus size={14} /><span>Add Medication</span>
                </button>
              </div>

              {medicationsList.map((med, idx) => (
                <div key={idx} className="white-card" style={{ padding: '14px', marginBottom: '12px', borderLeft: '4px solid #059669', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669' }}>Medication #{idx + 1}</span>
                    {medicationsList.length > 1 && (
                      <button type="button" onClick={() => handleRemoveMedicationRow(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid-2col" style={{ gap: '10px', marginBottom: '10px' }}>
                    <div className="form-group" style={{ position: 'relative' }}>
                      <label className="form-label">Medicine Name</label>
                      <input type="text" className="form-input" placeholder="Type medicine name..." value={med.searchQuery} onChange={(e) => handleUpdateMedRow(idx, 'searchQuery', e.target.value)} required />

                      {med.showSuggestions && (
                        <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, maxHeight: '180px', overflowY: 'auto' }}>
                          {catalogMedicines.filter(m => m.medicineName.toLowerCase().includes((med.searchQuery || '').toLowerCase())).slice(0, 6).map(cMed => (
                            <div key={cMed._id} onClick={() => handleSelectYoutubeSuggestion(idx, cMed)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.82rem', borderBottom: '1px solid #f1f5f9' }}>
                              <strong>{cMed.medicineName}</strong> <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({cMed.type || 'tablet'})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid-2col" style={{ gap: '8px' }}>
                      <div className="form-group">
                        <label className="form-label">Dosage</label>
                        <input type="text" className="form-input" value={med.dosage} onChange={(e) => handleUpdateMedRow(idx, 'dosage', e.target.value)} placeholder="500" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Unit</label>
                        <select className="form-input" value={med.unit} onChange={(e) => handleUpdateMedRow(idx, 'unit', e.target.value)}>
                          {['mg', 'ml', 'g', 'mcg', 'drop', 'capsule', 'tablet'].map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid-2col" style={{ gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Times a Day</label>
                      <input type="text" className="form-input" value={med.timesADay} onChange={(e) => handleUpdateMedRow(idx, 'timesADay', e.target.value)} placeholder="2" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duration</label>
                      <input type="text" className="form-input" value={med.howManyDays} onChange={(e) => handleUpdateMedRow(idx, 'howManyDays', e.target.value)} placeholder="5 days" required />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button type="button" onClick={() => setCreateRxWorkspace(null)} className="btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
              <button type="submit" className="btn-success" disabled={isSubmitting} style={{ padding: '10px 24px' }}>
                <span>{isSubmitting ? 'Issuing Rx...' : 'Issue Official Prescription'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // If viewing a specific prescription page
  if (selectedRxId) {
    return (
      <PrescriptionPage 
        prescriptionId={selectedRxId} 
        onBack={() => setSelectedRxId(null)} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* USER SIDEBAR NAVIGATION */}
      <aside className="app-sidebar">
        {/* Managed Family Profiles View Switcher Header */}
        {userProfile?.managedProfiles && userProfile.managedProfiles.length > 0 && (
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Active Viewing Profile</span>
            <select 
              className="form-input" 
              style={{ fontSize: '0.82rem', padding: '6px', fontWeight: 700 }}
              value={selectedManagedProfile ? selectedManagedProfile._id : 'main'}
              onChange={(e) => {
                if (e.target.value === 'main') {
                  setSelectedManagedProfile(null);
                } else {
                  const match = userProfile.managedProfiles.find(p => p._id === e.target.value || p.id === e.target.value);
                  if (match) setSelectedManagedProfile(match);
                }
              }}
            >
              <option value="main">👤 {userProfile.name} (Primary Profile)</option>
              {userProfile.managedProfiles.map((mp) => (
                <option key={mp._id || mp.id} value={mp._id || mp.id}>
                  👨‍👩‍👧 {mp.name || 'Family Member'} ({mp.bloodGroup || 'A+'})
                </option>
              ))}
            </select>
          </div>
        )}

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
            <button type="button" onClick={() => setActiveTab('appointments')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'appointments' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'appointments' ? '#a7f3d0' : 'transparent', color: activeTab === 'appointments' ? '#059669' : 'var(--text-muted)' }}>
              <Calendar size={16} /><span>Appointments Manager</span>
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
            <button type="button" onClick={() => setActiveTab('marketplace')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'marketplace' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'marketplace' ? '#a7f3d0' : 'transparent', color: activeTab === 'marketplace' ? '#059669' : 'var(--text-muted)' }}>
              <ShoppingBag size={16} /><span>Medicine Marketplace</span>
            </button>
            <button type="button" onClick={() => { setActiveTab('my_orders'); fetchPatientOrders(); }} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'my_orders' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'my_orders' ? '#a7f3d0' : 'transparent', color: activeTab === 'my_orders' ? '#059669' : 'var(--text-muted)' }}>
              <Receipt size={16} /><span>My Orders & Bills ({patientOrders.length})</span>
            </button>
            <button type="button" onClick={() => setActiveTab('map')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'map' ? '#f0f9ff' : 'transparent', borderColor: activeTab === 'map' ? '#bae6fd' : 'transparent', color: activeTab === 'map' ? '#0284c7' : 'var(--text-muted)' }}>
              <MapPin size={16} /><span>Nearby Healthcare Map</span>
            </button>
            <button type="button" onClick={() => setActiveTab('managed_profiles')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'managed_profiles' ? '#f0f9ff' : 'transparent', borderColor: activeTab === 'managed_profiles' ? '#bae6fd' : 'transparent', color: activeTab === 'managed_profiles' ? '#0284c7' : 'var(--text-muted)' }}>
              <Users size={16} /><span>Family Profiles ({userProfile?.managedProfiles?.length || 0})</span>
            </button>
            <button type="button" onClick={() => setActiveTab('appointments')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'appointments' ? '#f0f9ff' : 'transparent', borderColor: activeTab === 'appointments' ? '#bae6fd' : 'transparent', color: activeTab === 'appointments' ? '#0284c7' : 'var(--text-muted)' }}>
              <Calendar size={16} /><span>Appointments ({appointments.length})</span>
            </button>
            <button type="button" onClick={() => setActiveTab('analytics')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'analytics' ? '#f0f9ff' : 'transparent', borderColor: activeTab === 'analytics' ? '#bae6fd' : 'transparent', color: activeTab === 'analytics' ? '#0284c7' : 'var(--text-muted)' }}>
              <BarChart3 size={16} /><span>Health Analytics</span>
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
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedManagedProfile ? `Family Profile: ${activeProfile.name}` : 'Personal Health Profile'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage location, blood group, house/room details, and coordinates.</p>
              </div>

              <button type="button" onClick={() => setShowEditModal(true)} className="btn-primary" style={{ padding: '8px 16px' }}>
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="white-card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Full Name</span>
                <h4 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '4px 0 0 0' }}>{activeProfile?.name || 'User'}</h4>
              </div>

              <div className="white-card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Blood Group</span>
                <h4 style={{ fontSize: '1.1rem', color: '#dc2626', margin: '4px 0 0 0' }}>{activeProfile?.bloodGroup || 'A+'}</h4>
              </div>

              <div className="white-card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Full Residential Address</span>
                <p style={{ fontSize: '0.9rem', color: '#334155', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  {activeProfile?.location?.houseNo ? `House No. ${activeProfile.location.houseNo}, ` : ''}
                  {activeProfile?.location?.roomNo ? `Room No. ${activeProfile.location.roomNo}, ` : ''}
                  {activeProfile?.location?.floorNo ? `Floor ${activeProfile.location.floorNo}, ` : ''}
                  {activeProfile?.location?.landmark ? `Landmark: ${activeProfile.location.landmark}, ` : ''}
                  {activeProfile?.location?.city || 'New Delhi'}, {activeProfile?.location?.state || 'Delhi'} - {activeProfile?.location?.pincode || '110001'}
                </p>
              </div>

              <div className="white-card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>GPS Coordinates</span>
                <p style={{ fontSize: '0.9rem', color: '#0284c7', fontWeight: 700, margin: '4px 0 0 0' }}>
                  📍 [{activeProfile?.coordinates?.[0] ?? '77.2090'}, {activeProfile?.coordinates?.[1] ?? '28.6139'}]
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DOCTOR PRACTITIONER & AFFILIATION TAB */}
        {activeTab === 'practitioner' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stethoscope size={22} color="#059669" />
                  <span>Doctor Practitioner Credentials & Hospital Affiliation</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Manage medical license certificates, speciality, and affiliate with registered hospitals or clinics.
                </p>
              </div>

              <button type="button" onClick={() => setShowEditModal(true)} className="btn-primary" style={{ background: '#059669', padding: '8px 16px' }}>
                <Edit3 size={16} />
                <span>Edit Credentials</span>
              </button>
            </div>

            {/* Doctor Credentials Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="white-card" style={{ padding: '16px', borderLeft: '4px solid #059669' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Medical Practitioner</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>Dr. {userProfile?.name}</h4>
              </div>

              <div className="white-card" style={{ padding: '16px', borderLeft: '4px solid #0284c7' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Speciality</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', margin: '4px 0 0 0' }}>
                  {userProfile?.doctorDetails?.speciality || 'General Medicine'}
                </h4>
              </div>

              <div className="white-card" style={{ padding: '16px', borderLeft: '4px solid #7c3aed' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Medical Certificate No.</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed', margin: '4px 0 0 0' }}>
                  {userProfile?.doctorDetails?.certificateNo || 'MCI-REG-99182'}
                </h4>
              </div>
            </div>

            {/* Current Affiliated Organizations Status */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#0284c7" />
                <span>Current Hospital / Clinic Affiliations</span>
              </h4>

              {(!userProfile?.doctorDetails?.affiliateOrganization && (!userProfile?.doctorDetails?.affiliatedOrganizations || userProfile.doctorDetails.affiliatedOrganizations.length === 0)) ? (
                <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', padding: '16px', color: '#c2410c', fontSize: '0.86rem' }}>
                  ⚠️ You are currently not affiliated with any registered hospital or clinic. Search below and send an affiliation request.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {userProfile.doctorDetails?.affiliateOrganization && (
                    <div className="white-card" style={{ padding: '16px', borderLeft: '4px solid #059669' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                            {userProfile.doctorDetails.affiliateOrganization.name || 'Affiliated Hospital'}
                          </h5>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {userProfile.doctorDetails.affiliateOrganization.facilityType?.toUpperCase()}
                          </span>
                        </div>
                        <span className={`badge ${userProfile.doctorDetails.affiliateOrganizationApprovalStatus === 'approved' ? 'badge-approved' : 'badge-pending'}`}>
                          {(userProfile.doctorDetails.affiliateOrganizationApprovalStatus || 'approved').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                  {userProfile.doctorDetails?.affiliatedOrganizations?.map(org => (
                    <div key={org._id || org.id} className="white-card" style={{ padding: '16px', borderLeft: '4px solid #059669' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{org.name}</h5>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{(org.facilityType || 'Hospital').toUpperCase()}</span>
                        </div>
                        <span className="badge badge-approved">AFFILIATED</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Organizations to Affiliate */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                Search Registered Hospitals & Clinics to Request Affiliation
              </h4>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '36px', fontSize: '0.86rem' }} 
                    placeholder="Search hospital by name, city, or facility type..." 
                    value={orgSearchQuery}
                    onChange={(e) => handleSearchOrganizations(e.target.value)}
                  />
                </div>
              </div>

              {orgSearchResults.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No healthcare organizations found matching search query.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {orgSearchResults.map(org => (
                    <div key={org._id} className="white-card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{org.name}</h5>
                          <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
                            📍 {org.location?.city || 'City'}, {org.location?.state || ''}
                          </span>
                        </div>
                        <span className="badge badge-pending">{(org.facilityType || 'hospital').toUpperCase()}</span>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => handleSendAffiliationRequest(org._id, org.name)} 
                        className="btn-primary" 
                        style={{ width: '100%', marginTop: '10px', padding: '8px', fontSize: '0.82rem', justifyContent: 'center' }}
                      >
                        <UserPlus size={14} />
                        <span>Send Affiliation Request</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: HEALTH IDENTITY QR */}
        {activeTab === 'qrcode' && (
          <div className="white-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              Official Health Identity QR
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              Present this encrypted QR code to doctors or clinics to grant instant verification and access to your medical history.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <QRCodeSVG value={qrPayload} size={240} />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={handleDownloadQRImage} className="btn-primary" style={{ padding: '10px 18px' }}>
                <Download size={16} />
                <span>Download QR Image (PNG)</span>
              </button>

              <button type="button" onClick={handleRegenerateQR} className="btn-secondary" style={{ padding: '10px 18px' }}>
                <RefreshCw size={16} />
                <span>Regenerate Security Token</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PRESCRIPTIONS LIST */}
        {activeTab === 'prescriptions' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              {activeMode === 'doctor' ? 'Issued Prescriptions' : 'My Medical Prescriptions'}
            </h3>

            {prescriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <Pill size={40} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
                <p style={{ fontSize: '0.95rem' }}>No prescriptions found in record.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {prescriptions.map(rx => (
                  <div key={rx._id} className="white-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                        Rx #{rx._id.slice(-6).toUpperCase()}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                        Patient: <strong>{rx.patientId?.name || 'Verified Patient'}</strong> • Fee: ₹{rx.consultationFee || 0} • Date: {new Date(rx.createdAt).toLocaleDateString()}
                      </p>
                      <span className="badge badge-approved" style={{ marginTop: '6px', display: 'inline-block' }}>
                        {rx.medications?.length || 0} Prescribed Medications
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => setSelectedRxId(rx._id)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                        <Eye size={14} />
                        <span>View Detailed Rx & Get Low-Cost Medicines</span>
                      </button>

                      {activeMode === 'doctor' && (
                        <button type="button" onClick={() => handleDeletePrescription(rx._id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem', color: '#dc2626', borderColor: '#fecaca' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MEDICINE MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={22} color="#059669" />
                  <span>Medicine E-Commerce Marketplace</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Browse authentic medicines listed by verified pharmacies, compare prices, and order online.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '36px', fontSize: '0.84rem' }}
                    placeholder="Search medicine or brand..."
                    value={marketplaceSearch}
                    onChange={(e) => setMarketplaceSearch(e.target.value)}
                  />
                </div>

                <button type="button" onClick={() => setShowCartModal(true)} className="btn-primary" style={{ background: '#059669', padding: '8px 16px' }}>
                  <ShoppingCart size={16} />
                  <span>Cart ({cart.reduce((s, i) => s + i.qty, 0)})</span>
                </button>
              </div>
            </div>

            {filteredMarketplaceItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <ShoppingBag size={40} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
                <p style={{ fontSize: '0.95rem' }}>No medicines currently listed in pharmacy marketplace.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {filteredMarketplaceItems.map((item) => (
                  <div key={item._id} className="white-card" style={{ padding: '18px', borderLeft: '4px solid #059669' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          {item.medicineId?.medicineName || 'Medicine'}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Brand: {item.companyName}</span>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>₹{item.price}</span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '12px' }}>
                      Pharmacy: <strong>{item.organizationId?.name || 'Local Pharmacy'}</strong>
                    </p>

                    <button 
                      type="button" 
                      onClick={() => handleAddToCart(item)} 
                      className="btn-success" 
                      style={{ width: '100%', padding: '8px', fontSize: '0.82rem', justifyContent: 'center' }}
                    >
                      <ShoppingCart size={14} />
                      <span>Add to Shopping Cart</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MY MEDICINE ORDERS & BILLS */}
        {activeTab === 'my_orders' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Receipt size={22} color="#059669" />
                  <span>My Medicine Orders & Pharmacy Bills ({patientOrders.length})</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  View your placed pharmacy orders, track fulfillment status, and download tax invoices.
                </p>
              </div>

              <button type="button" onClick={fetchPatientOrders} className="btn-secondary" style={{ padding: '8px 14px' }}>
                <RefreshCw size={15} />
                <span>Refresh Orders</span>
              </button>
            </div>

            {patientOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <Receipt size={40} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
                <p style={{ fontSize: '0.95rem' }}>No medicine orders placed yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {patientOrders.map((order) => (
                  <div key={order._id} className="white-card" style={{ padding: '18px', borderLeft: '5px solid #059669' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>
                          Order #{order._id.slice(-6).toUpperCase()}
                        </strong>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                          Pharmacy: <strong>{order.organizationId?.name || 'Verified Local Pharmacy'}</strong> • Date: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${order.status === 'completed' ? 'badge-approved' : order.status === 'cancelled' ? 'badge-rejected' : 'badge-pending'}`} style={{ fontSize: '0.8rem' }}>
                          {(order.status || 'pending').toUpperCase()}
                        </span>
                        <strong style={{ display: 'block', fontSize: '1.25rem', color: '#059669', marginTop: '4px' }}>₹{order.totalAmount || 0}</strong>
                      </div>
                    </div>

                    {/* Order Items Table */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                            <th style={{ padding: '6px' }}>Item Name</th>
                            <th style={{ padding: '6px' }}>Brand</th>
                            <th style={{ padding: '6px' }}>Qty</th>
                            <th style={{ padding: '6px', textAlign: 'right' }}>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items?.map((it, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '6px', fontWeight: 700, color: '#0f172a' }}>{it.medicineName}</td>
                              <td style={{ padding: '6px', color: '#64748b' }}>{it.companyName}</td>
                              <td style={{ padding: '6px', fontWeight: 600 }}>{it.quantity}</td>
                              <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>₹{it.price * it.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        onClick={() => setSelectedInvoiceOrder(order)} 
                        className="btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        <Printer size={15} />
                        <span>View & Print Official Pharmacy Bill</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: NEARBY HEALTHCARE MAP */}
        {activeTab === 'map' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={22} color="#0284c7" />
                  <span>Nearby Healthcare Facilities Map</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Visual OpenStreetMap box showing hospitals, clinics, labs, and pharmacies near your location.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#dbeafe', color: '#1d4ed8' }}>🔵 Hospital</span>
                <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#dcfce7', color: '#15803d' }}>🟢 Clinic</span>
                <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#f3e8ff', color: '#6b21a8' }}>🟣 Lab</span>
                <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#fef3c7', color: '#b45309' }}>🟠 Pharmacy</span>
              </div>
            </div>

            <div 
              ref={mapContainerRef} 
              id="leaflet-nearby-map" 
              style={{ width: '100%', height: '440px', minHeight: '440px', borderRadius: '16px', border: '2px solid var(--border-color)', overflow: 'hidden', position: 'relative', zIndex: 1, display: 'block' }}
            />

            {selectedFacility && (
              <div style={{ marginTop: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>Selected Healthcare Facility</span>
                  <h4 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '2px 0' }}>{selectedFacility.name}</h4>
                  <p style={{ fontSize: '0.82rem', color: '#475569' }}>📍 {selectedFacility.location?.buildingNo || ''} {selectedFacility.location?.city || 'City'} • 📞 {selectedFacility.contactNumber || 'N/A'}</p>
                </div>

                <button type="button" onClick={() => { setActiveTab('appointments'); }} className="btn-primary" style={{ padding: '8px 16px' }}>
                  <Calendar size={15} />
                  <span>Book Appointment Here</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: FAMILY PROFILES */}
        {activeTab === 'managed_profiles' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={22} color="#0284c7" />
                  <span>Manage Family Profiles</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Add family members, link existing patient accounts, or switch views between profiles.
                </p>
              </div>

              <button type="button" onClick={() => setShowAddFamilyModal(true)} className="btn-primary" style={{ padding: '8px 16px' }}>
                <UserPlus size={16} />
                <span>Add Family Profile</span>
              </button>
            </div>

            {(!userProfile?.managedProfiles || userProfile.managedProfiles.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <Users size={40} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
                <p style={{ fontSize: '0.95rem' }}>No family members linked yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {userProfile.managedProfiles.map((mp) => (
                  <div key={mp._id || mp.id} className="white-card" style={{ padding: '18px', borderLeft: '4px solid #0284c7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{mp.name}</h4>
                      <span style={{ padding: '3px 8px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', fontSize: '0.75rem', fontWeight: 800 }}>
                        {mp.bloodGroup || 'A+'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>
                      📍 Location: {mp.location?.city || 'New Delhi'}
                    </p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        type="button" 
                        onClick={() => {
                          setSelectedManagedProfile(mp);
                          setActiveTab('profile');
                        }} 
                        className="btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1 }}
                      >
                        <Eye size={14} />
                        <span>View Profile</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => handleRemoveManagedProfile(mp._id || mp.id)} 
                        className="btn-secondary" 
                        style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#dc2626' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: APPOINTMENTS BOOKING & MANAGER */}
        {activeTab === 'appointments' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={22} color="#0284c7" />
                  <span>{activeMode === 'doctor' ? 'Doctor Consultation Slots Manager' : 'Book Consultation Appointments'}</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Search available slots, book visits, or manage published slots.
                </p>
              </div>

              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '36px', fontSize: '0.84rem' }}
                  placeholder="Search Doctor, Hospital, or Patient..."
                  value={appointmentSearchQuery}
                  onChange={(e) => setAppointmentSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* DOCTOR CREATE SLOT PUBLISHER & BULK GENERATOR */}
            {activeMode === 'doctor' && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#047857' }}>Doctor Consultation Slot Manager</h4>
                    <p style={{ fontSize: '0.8rem', color: '#065f46' }}>Publish single slots or use the bulk generator engine</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSlotGenModal(true)}
                    className="btn-success"
                    style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                  >
                    <Plus size={16} />
                    <span>Open Bulk Slot Generator</span>
                  </button>
                </div>

                <form onSubmit={handleCreateDoctorSlot} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  <input type="text" className="form-input" placeholder="Slot Title" value={docSlotTitle} onChange={(e) => setDocSlotTitle(e.target.value)} required />
                  <input type="date" className="form-input" value={docSlotDate} onChange={(e) => setDocSlotDate(e.target.value)} required />
                  <input type="time" className="form-input" value={docStartTime} onChange={(e) => setDocStartTime(e.target.value)} required />
                  <input type="time" className="form-input" value={docEndTime} onChange={(e) => setDocEndTime(e.target.value)} required />
                  <input type="number" className="form-input" placeholder="Fee (₹)" value={docFee} onChange={(e) => setDocFee(e.target.value)} required />
                  <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '8px 16px' }}>
                    {isSubmitting ? 'Publishing...' : 'Publish Slot'}
                  </button>
                </form>
              </div>
            )}

            {/* AVAILABLE SLOTS TO BOOK (PATIENT SIDE) */}
            {activeMode === 'patient' && (
              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                  Available Doctor & Hospital Slots
                </h4>

                {availableSlots.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No open consultation slots published currently.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {availableSlots.map((slot) => (
                      <div key={slot._id} className="white-card" style={{ padding: '16px', borderLeft: '4px solid #059669' }}>
                        <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{slot.title || 'Consultation Slot'}</h5>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                          📅 {slot.slotDate} ({slot.startTime} - {slot.endTime})
                        </p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                          Fee: ₹{slot.fee || 0}
                        </p>

                        <button 
                          type="button" 
                          onClick={() => handleBookSlot(slot._id)} 
                          className="btn-primary" 
                          disabled={isBookingSlot}
                          style={{ width: '100%', marginTop: '12px', padding: '8px 12px', fontSize: '0.85rem' }}
                        >
                          {isBookingSlot ? 'Booking...' : 'Book This Appointment'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BOOKED APPOINTMENTS LIST WITH SLOT-WISE GROUPED VIEW */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Slot-Wise Appointments ({filteredAppointments.length} Bookings across {groupedSlotAppointments.length} Slots)
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Showing {(!showAllSlotHistory && !appointmentSearchQuery.trim() && appointmentStatusFilter === 'all') ? 'Most Recent 5 Slots' : `All ${groupedSlotAppointments.length} Slots`}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'active', label: 'Active & Upcoming' },
                      { id: 'completed', label: 'Completed' },
                      { id: 'cancelled', label: 'Cancelled / Rejected' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAppointmentStatusFilter(tab.id)}
                        style={{
                          padding: '5px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          background: appointmentStatusFilter === tab.id ? '#ffffff' : 'transparent',
                          color: appointmentStatusFilter === tab.id ? '#0284c7' : '#64748b',
                          boxShadow: appointmentStatusFilter === tab.id ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {groupedSlotAppointments.length > 5 && !appointmentSearchQuery.trim() && appointmentStatusFilter === 'all' && (
                    <button
                      type="button"
                      onClick={() => setShowAllSlotHistory(prev => !prev)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      {showAllSlotHistory ? 'Show Recent 5 Slots Only' : `View All (${groupedSlotAppointments.length} Slots)`}
                    </button>
                  )}
                </div>
              </div>

              {groupedSlotAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
                    No appointment records found under the "{appointmentStatusFilter}" category.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(showAllSlotHistory || appointmentSearchQuery.trim() || appointmentStatusFilter !== 'all'
                    ? groupedSlotAppointments
                    : groupedSlotAppointments.slice(0, 5)
                  ).map(slotGroup => (
                    <div key={slotGroup.slotKey} className="white-panel" style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
                        <div>
                          <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                            {slotGroup.slotTitle}
                          </h5>
                          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            📅 {slotGroup.slotDate} • Fee: ₹{slotGroup.fee} • Mode: <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{slotGroup.consultationMode}</span>
                          </p>
                        </div>

                        <span className="badge badge-approved" style={{ fontSize: '0.78rem' }}>
                          {slotGroup.appointments.length} Booked Patients
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {slotGroup.appointments.map(app => (
                          <AppointmentCard
                            key={app._id}
                            appointment={app}
                            userRole={activeMode === 'doctor' ? 'doctor' : 'patient'}
                            onViewQR={(apt) => setSelectedTicketApt(apt)}
                            onApprove={(apt) => {
                              setConfirmModalConfig({
                                isOpen: true,
                                title: 'Approve Appointment Request',
                                message: `Confirm appointment for patient ${apt.patientId?.name || 'User'}?`,
                                actionType: 'approve',
                                requireReason: false,
                                onConfirm: async () => {
                                  await apiClient.patch(`/appointments/${apt._id}/status`, { status: 'approved' });
                                  fetchAppointmentsAndSlots();
                                  setSuccessMsg(`Appointment for ${apt.patientId?.name || 'Patient'} approved!`);
                                }
                              });
                            }}
                            onReject={(apt) => {
                              setConfirmModalConfig({
                                isOpen: true,
                                title: 'Reject Appointment Request',
                                message: `Specify reason for rejecting appointment #${apt.tokenNumber || 1}:`,
                                actionType: 'reject',
                                requireReason: true,
                                onConfirm: async (reason) => {
                                  await apiClient.patch(`/appointments/${apt._id}/status`, { status: 'rejected', rejectionReason: reason || 'Rejected by practitioner' });
                                  fetchAppointmentsAndSlots();
                                  setSuccessMsg(`Appointment rejected.`);
                                }
                              });
                            }}
                            onStartConsultation={async (apt) => {
                              try {
                                await apiClient.patch(`/appointments/${apt._id}/status`, { status: 'in_consultation' });
                                fetchAppointmentsAndSlots();
                              } catch (e) {
                                setError(e.message);
                              }
                            }}
                            onComplete={async (apt) => {
                              try {
                                await apiClient.patch(`/appointments/${apt._id}/status`, { status: 'completed' });
                                fetchAppointmentsAndSlots();
                                setCreateRxWorkspace({
                                  patient: {
                                    id: apt.patientId?._id || apt.patientId,
                                    name: apt.patientId?.name || 'Patient',
                                    bloodGroup: apt.patientId?.bloodGroup || 'A+'
                                  }
                                });
                              } catch (e) {
                                setError(e.message);
                              }
                            }}
                            onEdit={(apt) => setEditingAppointment(apt)}
                            onDelete={(apt) => {
                              setConfirmModalConfig({
                                isOpen: true,
                                title: 'Delete Appointment Record',
                                message: `Are you sure you want to permanently delete appointment #${apt.tokenNumber || 1}?`,
                                actionType: 'delete',
                                requireReason: false,
                                onConfirm: async () => {
                                  await apiClient.delete(`/appointments/${apt._id}`);
                                  fetchAppointmentsAndSlots();
                                  setSuccessMsg(`Appointment deleted successfully.`);
                                }
                              });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: HEALTH ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={22} color="#0284c7" />
              <span>Health Records Analytics & Diagrams</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="white-card" style={{ padding: '18px', borderLeft: '5px solid #0284c7' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Booked Appointments</span>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7', margin: '4px 0 0 0' }}>{appointments.length}</h4>
              </div>
              <div className="white-card" style={{ padding: '18px', borderLeft: '5px solid #059669' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Prescriptions Received</span>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', margin: '4px 0 0 0' }}>{prescriptions.length}</h4>
              </div>
              <div className="white-card" style={{ padding: '18px', borderLeft: '5px solid #7c3aed' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Pharmacy Orders</span>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7c3aed', margin: '4px 0 0 0' }}>{patientOrders.length}</h4>
              </div>
            </div>

            <div className="white-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>Appointment Status Distribution Diagram</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['requested', 'appointed', 'completed', 'rejected'].map(st => {
                  const count = appointments.filter(a => (a.status || 'appointed') === st).length;
                  const pct = appointments.length > 0 ? Math.round((count / appointments.length) * 100) : 0;
                  return (
                    <div key={st}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'uppercase' }}>{st}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: st === 'completed' ? '#059669' : st === 'rejected' ? '#dc2626' : '#0284c7', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRINTABLE OFFICIAL PHARMACY INVOICE / BILL MODAL */}
      {selectedInvoiceOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="white-panel" style={{ maxWidth: '640px', width: '100%', padding: '28px', borderRadius: '20px', background: '#ffffff' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Pharmacy Tax Invoice & Receipt</h4>
              <button type="button" onClick={() => setSelectedInvoiceOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            {/* RECEIPT PAPER CONTAINER */}
            <div style={{ border: '2px dashed #0284c7', borderRadius: '16px', padding: '24px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0284c7', paddingBottom: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={logoImg} alt="Logo" style={{ height: '36px' }} />
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7' }}>Arogya<span style={{ color: '#ea580c' }}>X</span> Pharmacy</h2>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Official E-Commerce Bill & Receipt</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-approved" style={{ fontSize: '0.72rem' }}>TAX INVOICE</span>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    Order ID: <strong>#{selectedInvoiceOrder._id.slice(-8).toUpperCase()}</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', color: '#334155', marginBottom: '16px' }}>
                <div>
                  <strong>Dispensing Pharmacy:</strong>
                  <p style={{ color: '#0f172a', fontWeight: 700 }}>{selectedInvoiceOrder.organizationId?.name || 'ArogyaX Certified Partner'}</p>
                  <p>📍 {selectedInvoiceOrder.organizationId?.location?.city || 'New Delhi'}</p>
                </div>
                <div>
                  <strong>Patient Details:</strong>
                  <p style={{ color: '#0f172a', fontWeight: 700 }}>{selectedInvoiceOrder.patientId?.name || activeProfile?.name || 'Verified Patient'}</p>
                  <p>Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ background: '#0284c7', color: '#ffffff' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Brand</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoiceOrder.items?.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px', fontWeight: 700 }}>{it.medicineName}</td>
                      <td style={{ padding: '8px', color: '#64748b' }}>{it.companyName}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>₹{it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #0284c7', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>Status: {(selectedInvoiceOrder.status || 'CONFIRMED').toUpperCase()}</span>
                <strong style={{ fontSize: '1.3rem', color: '#0f172a' }}>Total Paid: ₹{selectedInvoiceOrder.totalAmount}</strong>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" onClick={() => window.print()} className="btn-primary" style={{ padding: '10px 20px' }}>
                <Printer size={16} />
                <span>Print Official Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER / DOCTOR PROFILE MODAL */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="white-panel" style={{ maxWidth: '600px', width: '100%', padding: '24px', borderRadius: '20px', background: '#ffffff', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit3 size={22} color="#0284c7" />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Edit {activeProfile?.isDoctor ? 'Doctor Practitioner Profile' : 'Personal Health Profile'}
                </h4>
              </div>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '14px' }}>
              <div className="grid-2col" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                {!activeProfile?.isDoctor && (
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select className="form-input" value={editBloodGroup} onChange={(e) => setEditBloodGroup(e.target.value)}>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {activeProfile?.isDoctor && (
                <div className="grid-2col" style={{ gap: '12px', background: '#f0fdf4', padding: '12px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#166534' }}>Speciality</label>
                    <input type="text" className="form-input" value={editSpeciality} onChange={(e) => setEditSpeciality(e.target.value)} placeholder="e.g. Cardiology" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#166534' }}>Medical Certificate No</label>
                    <input type="text" className="form-input" value={editCertNo} onChange={(e) => setEditCertNo(e.target.value)} placeholder="e.g. MCI-998811" required />
                  </div>
                </div>
              )}

              <h5 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>Residential Address & Location</h5>

              <div className="grid-2col" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">House / Flat No</label>
                  <input type="text" className="form-input" value={editHouseNo} onChange={(e) => setEditHouseNo(e.target.value)} placeholder="e.g. 42-B" />
                </div>
                <div className="form-group">
                  <label className="form-label">Room No</label>
                  <input type="text" className="form-input" value={editRoomNo} onChange={(e) => setEditRoomNo(e.target.value)} placeholder="e.g. A-12" />
                </div>
                <div className="form-group">
                  <label className="form-label">Floor No</label>
                  <input type="number" className="form-input" value={editFloorNo} onChange={(e) => setEditFloorNo(e.target.value)} min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Landmark</label>
                  <input type="text" className="form-input" value={editLandmark} onChange={(e) => setEditLandmark(e.target.value)} placeholder="e.g. Near SG Highway" />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="Ahmedabad" required />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" value={editState} onChange={(e) => setEditState(e.target.value)} placeholder="Gujarat" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input type="text" className="form-input" value={editPincode} onChange={(e) => setEditPincode(e.target.value)} placeholder="380001" required />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>GPS Coordinates (Lng, Lat)</label>
                  <button type="button" onClick={handleGetCurrentLocation} disabled={isLocating} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                    <Navigation size={12} />
                    <span>{isLocating ? 'Locating...' : 'Use Current GPS'}</span>
                  </button>
                </div>
                <div className="grid-2col" style={{ gap: '10px' }}>
                  <input type="text" className="form-input" value={editLng} onChange={(e) => setEditLng(e.target.value)} placeholder="Longitude (e.g. 72.5714)" />
                  <input type="text" className="form-input" value={editLat} onChange={(e) => setEditLat(e.target.value)} placeholder="Latitude (e.g. 23.0225)" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary" style={{ padding: '10px 18px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '10px 22px' }}>
                  <span>{isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / LINK FAMILY MEMBER PROFILE MODAL */}
      {showAddFamilyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="white-panel" style={{ maxWidth: '540px', width: '100%', padding: '24px', borderRadius: '20px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={22} color="#0284c7" />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Add Family Member Profile</h4>
              </div>
              <button type="button" onClick={() => setShowAddFamilyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
              <button type="button" onClick={() => setFamilyAddMode('create')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.82rem', background: familyAddMode === 'create' ? '#ffffff' : 'transparent', color: familyAddMode === 'create' ? '#0284c7' : '#64748b', cursor: 'pointer' }}>
                Create New Sub-Profile
              </button>
              <button type="button" onClick={() => setFamilyAddMode('search')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.82rem', background: familyAddMode === 'search' ? '#ffffff' : 'transparent', color: familyAddMode === 'search' ? '#0284c7' : '#64748b', cursor: 'pointer' }}>
                Link Registered Patient Account
              </button>
            </div>

            {familyAddMode === 'search' ? (
              <form onSubmit={handleAddFamilyMember} style={{ display: 'grid', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="email" className="form-input" placeholder="Search patient by email address..." value={familySearchEmail} onChange={(e) => setFamilySearchEmail(e.target.value)} required />
                  <button type="button" onClick={handleSearchFamilyUser} className="btn-secondary" style={{ padding: '8px 14px' }}>Search</button>
                </div>

                {familySearchResult && (
                  <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                    <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{familySearchResult.name}</h5>
                    <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Blood Group: {familySearchResult.bloodGroup || 'A+'} • Location: {familySearchResult.location?.city || 'City'}</p>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Relationship Type</label>
                  <select className="form-input" value={familyNewRelation} onChange={(e) => setFamilyNewRelation(e.target.value)}>
                    {['Spouse', 'Child', 'Parent', 'Sibling', 'Family Member'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddFamilyModal(false)} className="btn-secondary" style={{ padding: '10px 18px' }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '10px 22px' }}>
                    <span>{isSubmitting ? 'Connecting...' : 'Connect Family Profile'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddFamilyMember} style={{ display: 'grid', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" placeholder="e.g. Ramesh Patel" value={familyNewName} onChange={(e) => setFamilyNewName(e.target.value)} required />
                </div>

                <div className="grid-2col" style={{ gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select className="form-input" value={familyNewBloodGroup} onChange={(e) => setFamilyNewBloodGroup(e.target.value)}>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <select className="form-input" value={familyNewRelation} onChange={(e) => setFamilyNewRelation(e.target.value)}>
                      {['Child', 'Spouse', 'Parent', 'Sibling', 'Family Member'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddFamilyModal(false)} className="btn-secondary" style={{ padding: '10px 18px' }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '10px 22px' }}>
                    <span>{isSubmitting ? 'Creating...' : 'Create Sub-Profile'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DOCTOR QR SCANNER MODAL */}
      {showScanModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="white-panel" style={{ maxWidth: '560px', width: '100%', padding: '24px', borderRadius: '20px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <QrCode size={22} color="#059669" />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Scan Patient Health Identity QR</h4>
              </div>
              <button type="button" onClick={() => { stopCamera(); setShowScanModal(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            {scanStatus && <p style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>{scanStatus}</p>}

            <div style={{ background: '#0f172a', borderRadius: '16px', height: '260px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '16px' }}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }} />
              {!cameraActive && (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <CameraOff size={40} style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ fontSize: '0.85rem' }}>Camera inactive. Click button below to start live scanner.</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
              {!cameraActive ? (
                <button type="button" onClick={startCamera} className="btn-success" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
                  <Camera size={15} /><span>Start Camera Scanner</span>
                </button>
              ) : (
                <button type="button" onClick={stopCamera} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.84rem', color: '#dc2626' }}>
                  <CameraOff size={15} /><span>Stop Camera</span>
                </button>
              )}

              <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleQRFileUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
                <Upload size={15} /><span>Upload QR Image File</span>
              </button>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Or Paste QR Payload String Manually:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="form-input" placeholder="e.g. AX|66a01...|token" value={scannedPayload} onChange={(e) => setScannedPayload(e.target.value)} style={{ fontSize: '0.82rem' }} />
                <button type="button" onClick={() => handleProcessQRScan(scannedPayload)} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>Proceed</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART MODAL */}
      {showCartModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="white-panel" style={{ maxWidth: '580px', width: '100%', padding: '24px', borderRadius: '20px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={22} color="#059669" />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>My Medicine Shopping Cart ({cart.reduce((sum, item) => sum + item.qty, 0)} items)</h4>
              </div>
              <button type="button" onClick={() => setShowCartModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748b' }}>
                <ShoppingCart size={44} style={{ margin: '0 auto 12px auto', color: '#cbd5e1' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Your cart is currently empty.</p>
                <button type="button" onClick={() => setShowCartModal(false)} className="btn-secondary" style={{ marginTop: '16px', padding: '8px 16px' }}>
                  Browse Medicine Marketplace
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px', marginBottom: '18px' }}>
                  {cart.map((item) => (
                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{item.medicineId?.medicineName || 'Medicine'}</h5>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          Pharmacy: {item.organizationId?.name || 'Local Pharmacy'} • ₹{item.price} each
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '2px 6px' }}>
                          <button 
                            type="button" 
                            onClick={() => {
                              setCart(prev => prev.map(i => i._id === item._id ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
                            }} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', color: '#334155' }}
                          >-</button>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', padding: '0 4px' }}>{item.qty}</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              setCart(prev => prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i));
                            }} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', color: '#334155' }}
                          >+</button>
                        </div>

                        <strong style={{ fontSize: '1rem', color: '#059669', minWidth: '60px', textAlign: 'right' }}>₹{item.price * item.qty}</strong>

                        <button 
                          type="button" 
                          onClick={() => setCart(prev => prev.filter(i => i._id !== item._id))} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '2px solid #059669', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Total Cart Amount</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', margin: '2px 0 0 0' }}>₹{cartTotal}</h3>
                  </div>

                  <button type="button" onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                    Clear Entire Cart
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowCartModal(false)} className="btn-secondary" style={{ padding: '10px 18px' }}>
                    Continue Shopping
                  </button>

                  <button 
                    type="button" 
                    onClick={handleCheckoutCart} 
                    className="btn-success" 
                    disabled={isSubmitting}
                    style={{ padding: '10px 22px', fontSize: '0.92rem' }}
                  >
                    <span>{isSubmitting ? 'Processing Order...' : 'Place Order & Pay'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* BULK SLOT GENERATOR MODAL FOR DOCTORS */}
      {showSlotGenModal && (
        <SlotGeneratorModal
          isOpen={showSlotGenModal}
          onClose={() => setShowSlotGenModal(false)}
          onGenerated={() => {
            fetchAppointmentsAndSlots();
            setShowSlotGenModal(false);
          }}
        />
      )}

      {/* TICKET QR VIEWER MODAL */}
      {selectedTicketApt && (
        <QRViewerModal
          appointment={selectedTicketApt}
          onClose={() => setSelectedTicketApt(null)}
        />
      )}
      {/* EDIT APPOINTMENT MODAL */}
      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onUpdated={() => {
            fetchAppointmentsAndSlots();
            setEditingAppointment(null);
          }}
        />
      )}

      {/* ACTION CONFIRMATION POPUP MODAL */}
      {confirmModalConfig && (
        <ActionConfirmationModal
          isOpen={confirmModalConfig.isOpen}
          onClose={() => setConfirmModalConfig(null)}
          onConfirm={confirmModalConfig.onConfirm}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          actionType={confirmModalConfig.actionType}
          requireReason={confirmModalConfig.requireReason}
        />
      )}
    </div>
  );
};
