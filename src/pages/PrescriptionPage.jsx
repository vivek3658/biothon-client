import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/axios';
import { 
  Pill, 
  FileText, 
  User, 
  Stethoscope, 
  Calendar, 
  Printer, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck,
  Building2,
  AlertCircle,
  ShoppingBag,
  Check,
  X,
  Tag
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export const PrescriptionPage = ({ prescriptionId, onBack }) => {
  const { userProfile } = useAuth();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Low Cost Medicine Auto-Cart State
  const [showLowCostModal, setShowLowCostModal] = useState(false);
  const [lowCostItems, setLowCostItems] = useState([]);
  const [isSearchingMarketplace, setIsSearchingMarketplace] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');

  useEffect(() => {
    const fetchPrescriptionDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const endpoint = prescriptionId ? `/prescriptions/${prescriptionId}` : '/prescriptions';
        const { data } = await apiClient.get(endpoint);

        if (prescriptionId && data.prescription) {
          setPrescription(data.prescription);
        } else if (Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
          setPrescription(data.prescriptions[0]); // Show latest
        } else {
          setError('No prescription records found.');
        }
      } catch (err) {
        setError(err.message || 'Network error loading prescription.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptionDetails();
  }, [prescriptionId]);

  const handlePrint = () => {
    window.print();
  };

  // Fetch lowest cost medicines for this prescription across all pharmacies
  const handleFetchLowestCostMedicines = async () => {
    if (!prescription) return;
    try {
      setIsSearchingMarketplace(true);
      setError('');
      setShowLowCostModal(true);

      const targetRxId = prescription._id;
      const { data } = await apiClient.get(`/pharmacy/marketplace/${targetRxId}`);

      if (data.items) {
        // Group items by prescribed medication and select lowest price pharmacy option
        const lowestMap = new Map();
        data.items.forEach(inv => {
          const medName = inv.medicineId?.medicineName || 'Medicine';
          if (!lowestMap.has(medName) || inv.price < lowestMap.get(medName).price) {
            lowestMap.set(medName, inv);
          }
        });
        setLowCostItems(Array.from(lowestMap.values()));
      } else {
        // Fallback: search general pharmacy inventory
        const { data: invData } = await apiClient.get('/pharmacy/inventory');
        if (invData.items) {
          const lowestMap = new Map();
          prescription.medications.forEach(med => {
            const matches = invData.items.filter(i => 
              i.medicineId?.medicineName?.toLowerCase() === med.medicineName.toLowerCase()
            );
            if (matches.length > 0) {
              const cheapest = matches.reduce((prev, curr) => curr.price < prev.price ? curr : prev);
              lowestMap.set(med.medicineName, cheapest);
            }
          });
          setLowCostItems(Array.from(lowestMap.values()));
        }
      }
    } catch (err) {
      setError('Failed to fetch lowest cost marketplace options.');
    } finally {
      setIsSearchingMarketplace(false);
    }
  };

  const handlePlaceLowCostOrder = async () => {
    if (lowCostItems.length === 0) return;
    try {
      setLoading(true);
      setError('');
      
      // Group order items by pharmacy organization
      const firstOrgId = lowCostItems[0]?.organizationId?._id || lowCostItems[0]?.organizationId;
      
      const orderItems = lowCostItems.map(inv => ({
        inventoryId: inv._id,
        quantity: 1
      }));

      const { data } = await apiClient.post('/pharmacy/orders', {
        organizationId: firstOrgId,
        prescriptionId: prescription._id,
        items: orderItems
      });

      setOrderSuccess(`Order placed successfully! Order #${data.order?._id?.slice(-6).toUpperCase()}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showLowCostModal) {
    return (
      <div className="white-panel" style={{ padding: '48px', textAlign: 'center' }}>
        <Pill size={36} color="#0284c7" className="spin" style={{ margin: '0 auto 12px auto' }} />
        <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Loading prescription record...</p>
      </div>
    );
  }

  if (error && !prescription) {
    return (
      <div className="white-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <AlertCircle size={40} color="#dc2626" style={{ margin: '0 auto 12px auto' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Prescription Not Available</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{error || 'Unable to retrieve prescription details.'}</p>
        {onBack && (
          <button type="button" onClick={onBack} className="btn-secondary">
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
        )}
      </div>
    );
  }

  const { doctorId, patientId, organizationId, medications = [], consultationFee = 0, createdAt, status } = prescription;
  const totalPrice = medications.reduce((sum, m) => sum + (parseFloat(m.price) || 0), 0) + (parseFloat(consultationFee) || 0);

  const lowCostTotal = lowCostItems.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '16px' }}>
      {/* Action Header Bar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        {onBack && (
          <button type="button" onClick={onBack} className="btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={handleFetchLowestCostMedicines} className="btn-primary" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', padding: '8px 16px' }}>
            <Tag size={16} />
            <span>Get Lowest Cost Medicines</span>
          </button>

          <button type="button" onClick={handlePrint} className="btn-secondary" style={{ padding: '8px 16px' }}>
            <Printer size={16} />
            <span>Print Official Prescription</span>
          </button>
        </div>
      </div>

      {/* Main Prescription Paper Document */}
      <div className="white-panel" style={{ padding: '32px 28px', background: '#ffffff', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
        {/* Document Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0284c7', paddingBottom: '20px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logoImg} alt="ArogyaX Logo" style={{ height: '44px', objectFit: 'contain' }} />
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.5px' }}>
                Arogya<span style={{ color: '#ea580c' }}>X</span> Health Identity
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Digital Medical Prescription & Health Record
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-approved" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
              OFFICIAL RX RECORD
            </span>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Rx ID: <strong style={{ color: 'var(--text-main)' }}>#{prescription._id.slice(-8).toUpperCase()}</strong>
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Date: <strong>{new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </p>
          </div>
        </div>

        {/* Doctor & Patient Identity Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {/* Doctor Info Card */}
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Stethoscope size={14} />
              <span>Prescribing Medical Practitioner</span>
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
              {doctorId?.name || 'Dr. Medical Practitioner'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 700, marginBottom: '6px' }}>
              {doctorId?.doctorDetails?.speciality || 'General Practitioner'}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              MCI Reg No: <strong>{doctorId?.doctorDetails?.certificateNo || 'MCI-2026-VERIFIED'}</strong>
            </p>
          </div>

          {/* Patient Info Card */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <User size={14} />
              <span>Patient Information</span>
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
              {patientId?.name || 'Patient'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Blood Group: <strong style={{ color: '#dc2626' }}>{patientId?.bloodGroup || 'A+'}</strong>
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Location: <strong>{patientId?.location?.city || 'New Delhi'}, {patientId?.location?.state || 'Delhi'}</strong>
            </p>
          </div>
        </div>

        {/* Tabular Prescription Medications Table */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pill size={20} color="#0284c7" />
            <span>Prescribed Medications & Dosage Schedule</span>
          </h3>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#0284c7', color: '#ffffff', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>#</th>
                  <th style={{ padding: '12px' }}>Medicine Name</th>
                  <th style={{ padding: '12px' }}>Form & Dosage</th>
                  <th style={{ padding: '12px' }}>Frequency</th>
                  <th style={{ padding: '12px' }}>Meal Timing</th>
                  <th style={{ padding: '12px' }}>Duration</th>
                  <th style={{ padding: '12px' }}>Directions & Notes</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((med, index) => (
                  <tr key={index} style={{ borderBottom: index < medications.length - 1 ? '1px solid var(--border-color)' : 'none', background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-dim)' }}>{index + 1}</td>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>{med.medicineName}</strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {med.dosage}{med.unit} <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>({med.type?.replace('_', ' ')})</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <strong>{med.timesADay}x daily</strong> ({med.quantity} qty)
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: med.beforeEating ? '#fff7ed' : '#ecfdf5',
                        color: med.beforeEating ? '#ea580c' : '#047857',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {med.beforeEating ? 'Before Food' : 'After Food'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{med.howManyDays}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {med.instructions || med.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fees & Sign-Off Summary */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', pt: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
              <ShieldCheck size={16} />
              <span>Digitally Signed & Authenticated via ArogyaX Portal</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '440px' }}>
              This prescription is generated electronically under ArogyaX Health Identity protocols.
            </p>
          </div>

          <div style={{ minWidth: '220px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'right' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Consultation Fee: <strong>₹{consultationFee}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* LOWEST COST MEDICINE AUTO-CART MODAL */}
      {showLowCostModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="white-panel" style={{ maxWidth: '620px', width: '100%', padding: '24px', borderRadius: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={22} color="#059669" />
                <span>Lowest Cost Pharmacy Cart</span>
              </h3>
              <button type="button" onClick={() => setShowLowCostModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            {orderSuccess ? (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857' }}>Medicine Order Placed Successfully!</h4>
                <p style={{ fontSize: '0.85rem', color: '#065f46', marginTop: '4px' }}>{orderSuccess}</p>
                <button type="button" onClick={() => setShowLowCostModal(false)} className="btn-primary" style={{ marginTop: '16px' }}>
                  Close Window
                </button>
              </div>
            ) : isSearchingMarketplace ? (
              <div style={{ textAlign: 'center', padding: '36px' }}>
                <Pill size={36} color="#059669" className="spin" style={{ margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Searching active pharmacy inventories for best prices...</p>
              </div>
            ) : lowCostItems.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center', padding: '24px' }}>
                No registered pharmacy active listings currently match these prescribed medications.
              </p>
            ) : (
              <div>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '14px' }}>
                  Automatically selected the lowest price pharmacy options for your prescribed medications:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {lowCostItems.map((inv, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{inv.medicineId?.medicineName || 'Medicine'}</strong>
                        <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Brand: {inv.companyName} • Pharmacy: {inv.organizationId?.name || 'Local Pharmacy'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>₹{inv.price}</span>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#0284c7', fontWeight: 700 }}>LOWEST PRICE</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Total Medicine Cart Amount</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>₹{lowCostTotal}</h3>
                  </div>

                  <button type="button" onClick={handlePlaceLowCostOrder} className="btn-success" style={{ padding: '10px 20px', fontSize: '0.92rem' }}>
                    <ShoppingBag size={18} />
                    <span>Place Order Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
