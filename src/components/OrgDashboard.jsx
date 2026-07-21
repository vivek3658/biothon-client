import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/axios';
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
  RefreshCw,
  UserCheck,
  UserX,
  Filter,
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Check,
  PieChart,
  Pill,
  ShoppingBag,
  Plus,
  Package,
  DollarSign
} from 'lucide-react';

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

export const OrgDashboard = () => {
  const { userProfile, refreshUser, logout } = useAuth();
  const isPharmacy = userProfile?.facilityType === 'pharmacy';

  const [activeTab, setActiveTab] = useState(isPharmacy ? 'inventory' : 'affiliations'); 
  // 'affiliations' | 'appointments' | 'inventory' | 'orders' | 'analytics' | 'profile'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Doctor Affiliation Requests State
  const [doctorsList, setDoctorsList] = useState([]);
  const [affiliationFilter, setAffiliationFilter] = useState('all');

  // Appointments State
  const [appointments, setAppointments] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState('all');

  // Pharmacy Inventory State
  const [inventoryItems, setInventoryItems] = useState([]);
  const [adminMedicines, setAdminMedicines] = useState([]);
  const [selectedAdminMedId, setSelectedAdminMedId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [invPrice, setInvPrice] = useState(150);
  const [invStock, setInvStock] = useState(100);

  // Pharmacy Orders State
  const [pharmacyOrders, setPharmacyOrders] = useState([]);

  // Edit Org Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [longitude, setLongitude] = useState('72.5714');
  const [latitude, setLatitude] = useState('23.0225');
  const [certUrl, setCertUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setContactNumber(userProfile.contactNumber || '');
      setBuildingNo(userProfile.location?.buildingNo || '');
      setLandmark(userProfile.location?.landmark || '');
      setCity(userProfile.location?.city || '');
      setStateName(userProfile.location?.state || '');
      setPincode(userProfile.location?.pincode || '');
      setLongitude(userProfile.coordinates?.[0] ?? '72.5714');
      setLatitude(userProfile.coordinates?.[1] ?? '23.0225');
      setCertUrl(userProfile.organizationCertificateUrl || '');
    }
  }, [userProfile]);

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/org/pending-doctors');
      if (data.success) {
        setDoctorsList(data.doctors || []);
      }
    } catch (err) {
      console.error('Error fetching pending doctors:', err);
    } finally {
      setLoading(false);
    }
  };

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
      } else if (method === 'patch') {
        res = await apiClient.patch(url, options.body ? JSON.parse(options.body) : {}, options);
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

  const fetchOrgAppointments = async () => {
    const { ok, data } = await safeFetchJson('/appointments');
    if (ok && data?.appointments) {
      setAppointments(data.appointments);
    }
  };

  const fetchPharmacyInventory = async () => {
    const { ok, data } = await safeFetchJson('/pharmacy/inventory');
    if (ok && data?.items) {
      setInventoryItems(data.items);
    }
  };

  const fetchAdminMedicines = async () => {
    const { ok, data } = await safeFetchJson('/medicines?limit=100');
    if (ok && Array.isArray(data?.data)) {
      setAdminMedicines(data.data);
      if (data.data.length > 0) {
        setSelectedAdminMedId(data.data[0]._id);
        setCompanyName(data.data[0].manufacturer || 'PharmaCorp');
      }
    }
  };

  const fetchPharmacyOrders = async () => {
    const { ok, data } = await safeFetchJson('/pharmacy/orders');
    if (ok && data?.orders) {
      setPharmacyOrders(data.orders);
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchPendingDoctors();
      fetchOrgAppointments();
      fetchPharmacyInventory();
      fetchAdminMedicines();
      fetchPharmacyOrders();
    }
  }, [userProfile, activeTab]);

  const handleApproveDoctor = async (doctorId, doctorName) => {
    try {
      setError('');
      setSuccessMsg('');
      await apiClient.patch(`/org/approve-doctor/${doctorId}`);
      setSuccessMsg(`Doctor Dr. ${doctorName} approved and affiliated with facility!`);
      fetchPendingDoctors();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectDoctor = async (doctorId, doctorName) => {
    try {
      setError('');
      setSuccessMsg('');
      await apiClient.patch(`/org/reject-doctor/${doctorId}`);
      setSuccessMsg(`Doctor affiliation request for Dr. ${doctorName} rejected.`);
      fetchPendingDoctors();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddInventoryItem = async (e) => {
    e.preventDefault();
    if (!selectedAdminMedId) return;
    try {
      setIsSubmitting(true);
      setError('');
      await apiClient.post('/pharmacy/inventory', {
        medicineId: selectedAdminMedId,
        companyName: companyName.trim() || 'PharmaCorp',
        price: parseFloat(invPrice) || 0,
        stock: parseInt(invStock, 10) || 0,
        isActive: true
      });

      setSuccessMsg('Medicine added to Pharmacy Marketplace Inventory!');
      fetchPharmacyInventory();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setError('');
      await apiClient.patch(`/pharmacy/orders/${orderId}/status`, { status: newStatus });
      setSuccessMsg(`Order #${orderId.slice(-6).toUpperCase()} updated to ${newStatus.toUpperCase()}`);
      fetchPharmacyOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      const payload = {
        name,
        contactNumber,
        location: { buildingNo, landmark, city, state: stateName, pincode },
        coordinates: [parseFloat(longitude) || 72.5714, parseFloat(latitude) || 23.0225],
        organizationCertificateUrl: certUrl
      };

      await apiClient.put('/org/profile', payload);
      setSuccessMsg('Organization profile updated successfully!');
      setShowEditModal(false);
      refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPharmacyRevenue = pharmacyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="app-container">
      {/* ORGANIZATION SIDEBAR NAVIGATION */}
      <aside className="app-sidebar">
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
            Facility Dashboard
          </div>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
            {userProfile?.name || 'Facility Portal'}
          </h4>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
            {(userProfile?.facilityType || 'hospital')}
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {isPharmacy ? (
            <>
              <button type="button" onClick={() => setActiveTab('inventory')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'inventory' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'inventory' ? '#a7f3d0' : 'transparent', color: activeTab === 'inventory' ? '#059669' : 'var(--text-muted)' }}>
                <Package size={16} /><span>Marketplace Inventory ({inventoryItems.length})</span>
              </button>

              <button type="button" onClick={() => setActiveTab('orders')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'orders' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'orders' ? '#a7f3d0' : 'transparent', color: activeTab === 'orders' ? '#059669' : 'var(--text-muted)' }}>
                <ShoppingBag size={16} /><span>Medicine Orders ({pharmacyOrders.length})</span>
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setActiveTab('affiliations')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'affiliations' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'affiliations' ? '#a7f3d0' : 'transparent', color: activeTab === 'affiliations' ? '#059669' : 'var(--text-muted)' }}>
                <Stethoscope size={16} /><span>Doctor Affiliations ({doctorsList.length})</span>
              </button>

              <button type="button" onClick={() => setActiveTab('appointments')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'appointments' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'appointments' ? '#a7f3d0' : 'transparent', color: activeTab === 'appointments' ? '#059669' : 'var(--text-muted)' }}>
                <Calendar size={16} /><span>Appointments ({appointments.length})</span>
              </button>
            </>
          )}

          <button type="button" onClick={() => setActiveTab('analytics')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'analytics' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'analytics' ? '#a7f3d0' : 'transparent', color: activeTab === 'analytics' ? '#059669' : 'var(--text-muted)' }}>
            <BarChart3 size={16} /><span>Performance Analytics</span>
          </button>

          <button type="button" onClick={() => setActiveTab('profile')} className="btn-secondary" style={{ justifyContent: 'flex-start', background: activeTab === 'profile' ? '#ecfdf5' : 'transparent', borderColor: activeTab === 'profile' ? '#a7f3d0' : 'transparent', color: activeTab === 'profile' ? '#059669' : 'var(--text-muted)' }}>
            <Building2 size={16} /><span>Facility Profile</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="app-content">
        {/* Toast Alerts */}
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

        {/* TAB 1: DOCTOR AFFILIATIONS */}
        {activeTab === 'affiliations' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Doctor Affiliation Requests</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Review practitioner applications to affiliate with {userProfile?.name}.</p>
              </div>

              <button type="button" onClick={fetchPendingDoctors} className="btn-secondary" style={{ padding: '8px 14px' }}>
                <RefreshCw size={15} />
                <span>Refresh List</span>
              </button>
            </div>

            {doctorsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <Stethoscope size={40} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
                <p style={{ fontSize: '0.95rem' }}>No doctor affiliation requests found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {doctorsList.map((doc) => (
                  <div key={doc._id} className="white-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Dr. {doc.name}</h4>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                        Speciality: <strong>{doc.doctorDetails?.speciality || 'General Medicine'}</strong> • Certificate: {doc.doctorDetails?.certificateNo || 'MCI-10293'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => handleApproveDoctor(doc._id, doc.name)} className="btn-success" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                        <UserCheck size={14} />
                        <span>Approve Affiliation</span>
                      </button>

                      <button type="button" onClick={() => handleRejectDoctor(doc._id, doc.name)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem', color: '#dc2626' }}>
                        <UserX size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPOINTMENTS MANAGER */}
        {activeTab === 'appointments' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              Facility Consultations & Appointments ({appointments.length})
            </h3>

            {appointments.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No appointments booked at this facility yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {appointments.map(app => (
                  <div key={app._id} className="white-card" style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                        Patient: {app.patientId?.name || 'Verified Patient'}
                      </strong>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                        Doctor: {app.doctorId?.name ? `Dr. ${app.doctorId.name}` : 'Facility Practitioner'} • Date: {app.slotId?.slotDate || ''} ({app.slotId?.startTime || ''})
                      </p>
                    </div>

                    <span className={`badge ${app.status === 'completed' ? 'badge-approved' : 'badge-pending'}`}>
                      {(app.status || 'appointed').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PHARMACY INVENTORY MARKETPLACE MANAGER */}
        {activeTab === 'inventory' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={22} color="#059669" />
              <span>Pharmacy Marketplace Inventory Manager</span>
            </h3>

            {/* ADD INVENTORY ITEM FORM */}
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '18px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#047857', marginBottom: '12px' }}>
                Add Medicine from Admin Reference Catalog to Marketplace
              </h4>

              <form onSubmit={handleAddInventoryItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label className="form-label">Reference Admin Medicine</label>
                  <select className="form-input" value={selectedAdminMedId} onChange={(e) => {
                    setSelectedAdminMedId(e.target.value);
                    const match = adminMedicines.find(m => m._id === e.target.value);
                    if (match) setCompanyName(match.manufacturer || 'PharmaCorp');
                  }} required>
                    {adminMedicines.map((med) => (
                      <option key={med._id} value={med._id}>
                        {med.medicineName} ({med.category || 'General'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Brand / Company Name</label>
                  <input type="text" className="form-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>

                <div>
                  <label className="form-label">Selling Price (₹)</label>
                  <input type="number" className="form-input" value={invPrice} onChange={(e) => setInvPrice(e.target.value)} required />
                </div>

                <div>
                  <label className="form-label">Available Stock Qty</label>
                  <input type="number" className="form-input" value={invStock} onChange={(e) => setInvStock(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn-success" disabled={isSubmitting} style={{ width: '100%', padding: '10px' }}>
                    <Plus size={16} />
                    <span>{isSubmitting ? 'Adding...' : 'List in Marketplace'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* LISTED INVENTORY ITEMS */}
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              Active Pharmacy Listings ({inventoryItems.length})
            </h4>

            {inventoryItems.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No medicines listed in pharmacy inventory yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {inventoryItems.map((item) => (
                  <div key={item._id} className="white-card" style={{ padding: '16px', borderLeft: '4px solid #059669' }}>
                    <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {item.medicineId?.medicineName || 'Medicine'}
                    </h5>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Brand: <strong>{item.companyName}</strong>
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>₹{item.price}</span>
                      <span className="badge badge-approved">Stock: {item.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PHARMACY MEDICINE ORDERS */}
        {activeTab === 'orders' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={22} color="#0284c7" />
              <span>Incoming Patient Medicine Orders ({pharmacyOrders.length})</span>
            </h3>

            {pharmacyOrders.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No patient medicine orders placed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pharmacyOrders.map((order) => (
                  <div key={order._id} className="white-card" style={{ padding: '18px', borderLeft: '4px solid #0284c7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                          Order #{order._id.slice(-6).toUpperCase()}
                        </strong>
                        <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          Patient: <strong>{order.patientId?.name || 'Verified Patient'}</strong> • Date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', display: 'block' }}>
                          ₹{order.totalAmount}
                        </span>
                        <select 
                          className="form-input" 
                          style={{ fontSize: '0.78rem', padding: '4px 8px', fontWeight: 700, marginTop: '4px' }}
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="packed">PACKED</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>Order Items:</span>
                      {order.items?.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', padding: '2px 0' }}>
                          <span>{it.medicineName} ({it.companyName}) x {it.quantity}</span>
                          <strong>₹{it.price * it.quantity}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PERFORMANCE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={22} color="#059669" />
              <span>Facility Performance Analytics & Revenue Insights</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="white-card" style={{ padding: '18px', borderLeft: '5px solid #059669' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Pharmacy Orders</span>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', margin: '4px 0 0 0' }}>{pharmacyOrders.length}</h4>
              </div>
              <div className="white-card" style={{ padding: '18px', borderLeft: '5px solid #0284c7' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Pharmacy Revenue</span>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7', margin: '4px 0 0 0' }}>₹{totalPharmacyRevenue}</h4>
              </div>
              <div className="white-card" style={{ padding: '18px', borderLeft: '5px solid #7c3aed' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Affiliated Doctors</span>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7c3aed', margin: '4px 0 0 0' }}>{doctorsList.length}</h4>
              </div>
            </div>

            <div className="white-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>Medicine Sales Status Distribution Diagram</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['pending', 'confirmed', 'packed', 'completed', 'cancelled'].map(st => {
                  const count = pharmacyOrders.filter(o => o.status === st).length;
                  const pct = pharmacyOrders.length > 0 ? Math.round((count / pharmacyOrders.length) * 100) : 0;
                  return (
                    <div key={st}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'uppercase' }}>{st}</span>
                        <span>{count} orders ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: st === 'completed' ? '#059669' : st === 'cancelled' ? '#dc2626' : '#0284c7', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FACILITY PROFILE */}
        {activeTab === 'profile' && (
          <div className="white-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Organization Details</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Facility location, verification status, and contact information.</p>
              </div>

              <button type="button" onClick={() => setShowEditModal(true)} className="btn-primary" style={{ padding: '8px 16px' }}>
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div className="white-card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Facility Name</span>
                <h4 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '4px 0 0 0' }}>{userProfile?.name}</h4>
              </div>

              <div className="white-card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Facility Type</span>
                <h4 style={{ fontSize: '1.1rem', color: '#059669', margin: '4px 0 0 0', textTransform: 'uppercase' }}>{userProfile?.facilityType}</h4>
              </div>

              <div className="white-card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Contact Phone</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>{userProfile?.contactNumber || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="white-panel" style={{ maxWidth: '560px', width: '100%', padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Edit Facility Profile</h3>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label">Facility Name</label>
                <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div>
                <label className="form-label">Contact Phone</label>
                <input type="text" className="form-input" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
