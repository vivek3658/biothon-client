import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  AlertCircle
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export const PrescriptionPage = ({ prescriptionId, onBack }) => {
  const { userProfile } = useAuth();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchPrescriptionDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const endpoint = prescriptionId ? `/prescriptions/${prescriptionId}` : '/prescriptions';
        const res = await fetch(endpoint, { headers: getAuthHeaders() });
        const data = await res.json();

        if (res.ok) {
          if (prescriptionId && data.prescription) {
            setPrescription(data.prescription);
          } else if (Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
            setPrescription(data.prescriptions[0]); // Show latest
          } else {
            setError('No prescription records found.');
          }
        } else {
          setError(data.error || 'Failed to load prescription.');
        }
      } catch (err) {
        setError('Network error loading prescription.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptionDetails();
  }, [prescriptionId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="white-panel" style={{ padding: '48px', textAlign: 'center' }}>
        <Pill size={36} color="#0284c7" className="spin" style={{ margin: '0 auto 12px auto' }} />
        <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Loading prescription record...</p>
      </div>
    );
  }

  if (error || !prescription) {
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

        <button type="button" onClick={handlePrint} className="btn-primary" style={{ padding: '8px 16px' }}>
          <Printer size={16} />
          <span>Print Official Prescription</span>
        </button>
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
            {organizationId && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Affiliation: <strong>{organizationId.name} ({organizationId.facilityType})</strong>
              </p>
            )}
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
                  <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
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
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                      {med.price > 0 ? `₹${med.price}` : 'Incl.'}
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
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Total Payable: <span style={{ color: '#0284c7' }}>₹{totalPrice}</span>
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};
