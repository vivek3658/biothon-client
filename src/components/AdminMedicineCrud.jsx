import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

import { apiClient } from '../api/axios';

const MEDICINE_TYPES = [
  { value: 'oral_tablet', label: 'Oral Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'syrup', label: 'Syrup' },
  { value: 'injection', label: 'Injection' },
  { value: 'lotion', label: 'Lotion' },
  { value: 'gel', label: 'Gel' },
  { value: 'ointment', label: 'Ointment' },
  { value: 'drops', label: 'Drops' },
  { value: 'inhaler', label: 'Inhaler' }
];

const UNITS = ['mg', 'ml', 'g', 'mcg', 'IU', 'puffs'];

export const AdminMedicineCrud = () => {
  const [medicines, setMedicines] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Form State
  const [medicineName, setMedicineName] = useState('');
  const [type, setType] = useState('oral_tablet');
  const [dosageStr, setDosageStr] = useState('500, 650');
  const [unit, setUnit] = useState('mg');
  const [category, setCategory] = useState('Analgesic / Antipyretic');
  const [manufacturer, setManufacturer] = useState('');
  const [prescriptionRequired, setPrescriptionRequired] = useState(true);
  const [instructions, setInstructions] = useState('Take after food.');
  const [sideEffects, setSideEffects] = useState('Mild drowsiness, nausea in rare cases.');
  const [precautions, setPrecautions] = useState('Avoid alcohol consumption while taking this medication.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMedicines = async (page = 1, search = searchTerm, typeF = typeFilter) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({ page, limit: 10 });
      if (search.trim()) params.append('search', search.trim());
      if (typeF) params.append('type', typeF);

      const { data } = await apiClient.get(`/admin/medicines?${params.toString()}`);
      setMedicines(data.data || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Error fetching medicine catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines(1);
  }, []);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedMedicine(null);
    setMedicineName('');
    setType('oral_tablet');
    setDosageStr('500, 650');
    setUnit('mg');
    setCategory('General');
    setManufacturer('');
    setPrescriptionRequired(true);
    setInstructions('Take as directed by doctor.');
    setSideEffects('');
    setPrecautions('');
    setShowModal(true);
  };

  const handleOpenEdit = (med) => {
    setModalMode('edit');
    setSelectedMedicine(med);
    setMedicineName(med.medicineName);
    setType(med.type);
    setDosageStr(Array.isArray(med.dosage) ? med.dosage.join(', ') : '500');
    setUnit(med.unit);
    setCategory(med.category || 'General');
    setManufacturer(med.manufacturer || '');
    setPrescriptionRequired(Boolean(med.prescriptionRequired));
    setInstructions(med.instructions || '');
    setSideEffects(med.sideEffects || '');
    setPrecautions(med.precautions || '');
    setShowModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!medicineName.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMsg('');

      const dosages = dosageStr.split(',').map(d => parseFloat(d.trim())).filter(d => !isNaN(d) && d > 0);

      const payload = {
        medicineName: medicineName.trim(),
        type,
        dosage: dosages.length > 0 ? dosages : [500],
        unit,
        category: category.trim() || 'General',
        manufacturer: manufacturer.trim(),
        prescriptionRequired,
        instructions: instructions.trim(),
        sideEffects: sideEffects.trim(),
        precautions: precautions.trim()
      };

      if (modalMode === 'create') {
        await apiClient.post('/admin/medicines', payload);
      } else {
        await apiClient.put(`/admin/medicines/${selectedMedicine._id}`, payload);
      }

      setSuccessMsg(modalMode === 'create' 
        ? `Medicine "${medicineName}" created in catalog!` 
        : `Medicine "${medicineName}" updated successfully!`
      );

      setShowModal(false);
      fetchMedicines(pagination.currentPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMedicine) return;

    try {
      setIsSubmitting(true);
      setError('');
      await apiClient.delete(`/admin/medicines/${selectedMedicine._id}`);

      setSuccessMsg(`Medicine "${selectedMedicine.medicineName}" deleted successfully!`);
      setShowDeleteModal(false);
      setSelectedMedicine(null);
      fetchMedicines(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="white-panel" style={{ padding: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pill size={22} color="#0284c7" />
            <span>Master Medicine Catalog</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Admin-only management for authorized medical prescriptions & dosages.
          </p>
        </div>

        <button type="button" onClick={handleOpenCreate} className="btn-primary" style={{ padding: '8px 14px' }}>
          <Plus size={16} />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#047857', fontSize: '0.84rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} /><span>{successMsg}</span></div>
          <button type="button" onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#dc2626', fontSize: '0.84rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16} /><span>{error}</span></div>
          <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by name, category, manufacturer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchMedicines(1, e.target.value, typeFilter);
            }}
          />
        </div>

        <select
          className="form-input"
          style={{ width: '160px' }}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            fetchMedicines(1, searchTerm, e.target.value);
          }}
        >
          <option value="">All Form Types</option>
          {MEDICINE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Responsive Table / Cards Container */}
      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px auto' }} />
          <p>Loading medicine catalog...</p>
        </div>
      ) : medicines.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '12px' }}>
          <Pill size={40} color="var(--text-dim)" style={{ margin: '0 auto 10px auto' }} />
          <p style={{ fontWeight: 600 }}>No medicines found in catalog.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Medicine Name</th>
                <th style={{ padding: '10px 12px' }}>Type</th>
                <th style={{ padding: '10px 12px' }}>Dosages</th>
                <th style={{ padding: '10px 12px' }}>Category</th>
                <th style={{ padding: '10px 12px' }}>Prescription</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>{med.medicineName}</strong>
                    {med.manufacturer && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mfr: {med.manufacturer}</span>}
                  </td>
                  <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {med.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {Array.isArray(med.dosage) ? med.dosage.map(d => `${d}${med.unit}`).join(', ') : `${med.dosage}${med.unit}`}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {med.category || 'General'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={med.prescriptionRequired ? 'badge badge-admin' : 'badge badge-approved'}>
                      {med.prescriptionRequired ? 'Rx Required' : 'OTC Available'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button type="button" onClick={() => handleOpenEdit(med)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                      <button type="button" onClick={() => { setSelectedMedicine(med); setShowDeleteModal(true); }} className="btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total items)</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fetchMedicines(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="btn-secondary"
              style={{ padding: '4px 8px' }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => fetchMedicines(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="btn-secondary"
              style={{ padding: '4px 8px' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {modalMode === 'create' ? 'Add New Medicine to Catalog' : `Edit ${medicineName}`}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="grid-2col">
                <div className="form-group col-span-2">
                  <label className="form-label">Medicine Name</label>
                  <input type="text" className="form-input" placeholder="e.g. Paracetamol, Amoxicillin" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Form Type</label>
                  <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                    {MEDICINE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dosage Unit</label>
                  <select className="form-input" value={unit} onChange={(e) => setUnit(e.target.value)}>
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Available Dosages (Comma-separated numbers)</label>
                  <input type="text" className="form-input" placeholder="e.g. 250, 500, 650" value={dosageStr} onChange={(e) => setDosageStr(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input type="text" className="form-input" placeholder="e.g. Antibiotic, Antipyretic" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Manufacturer</label>
                  <input type="text" className="form-input" placeholder="e.g. Cipla, Sun Pharma" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={prescriptionRequired} onChange={(e) => setPrescriptionRequired(e.target.checked)} />
                    <span>Requires Doctor Prescription (Rx Required)</span>
                  </label>
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Usage Instructions</label>
                  <textarea className="form-input" rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Take after food every 8 hours..." />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Side Effects (Optional)</label>
                  <input type="text" className="form-input" value={sideEffects} onChange={(e) => setSideEffects(e.target.value)} placeholder="Drowsiness, dry mouth..." />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Precautions & Warnings (Optional)</label>
                  <input type="text" className="form-input" value={precautions} onChange={(e) => setPrecautions(e.target.value)} placeholder="Not recommended during pregnancy..." />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Add Medicine' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedMedicine && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <ShieldAlert size={48} color="#dc2626" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Delete Medicine?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Are you sure you want to delete <strong>{selectedMedicine.medicineName}</strong> from the master catalog?
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button type="button" onClick={handleDelete} className="btn-danger" style={{ flex: 1 }} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete Medicine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
