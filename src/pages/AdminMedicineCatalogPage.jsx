import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  CheckCircle, 
  X, 
  Filter, 
  AlertCircle, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { apiClient } from '../api/axios';

export const AdminMedicineCatalogPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [medicineName, setMedicineName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [medicineType, setMedicineType] = useState('Tablet');
  const [strength, setStrength] = useState('500mg');
  const [category, setCategory] = useState('General');
  const [scheduleType, setScheduleType] = useState('OTC');
  const [requiresPrescription, setRequiresPrescription] = useState(true);
  const [defaultInstructions, setDefaultInstructions] = useState('Take as directed by practitioner.');
  const [pregnancyCategory, setPregnancyCategory] = useState('B');
  const [childSafe, setChildSafe] = useState(true);
  const [seniorSafe, setSeniorSafe] = useState(true);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search: searchQuery,
        category: selectedCategory,
        scheduleType: selectedSchedule
      });

      const res = await apiClient.get(`/medicine?${queryParams.toString()}`);
      if (res.data?.success) {
        setMedicines(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalItems(res.data.pagination?.totalItems || 0);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch Master Medicine Catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [page, searchQuery, selectedCategory, selectedSchedule]);

  const resetForm = () => {
    setMedicineName('');
    setGenericName('');
    setBrandName('');
    setManufacturer('');
    setMedicineType('Tablet');
    setStrength('500mg');
    setCategory('General');
    setScheduleType('OTC');
    setRequiresPrescription(true);
    setDefaultInstructions('Take as directed by practitioner.');
    setPregnancyCategory('B');
    setChildSafe(true);
    setSeniorSafe(true);
    setEditingMedicine(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (med) => {
    setEditingMedicine(med);
    setMedicineName(med.medicineName || '');
    setGenericName(med.genericName || '');
    setBrandName(med.brandName || '');
    setManufacturer(med.manufacturer || '');
    setMedicineType(med.medicineType || 'Tablet');
    setStrength(med.strength || '500mg');
    setCategory(med.category || 'General');
    setScheduleType(med.scheduleType || 'OTC');
    setRequiresPrescription(med.requiresPrescription ?? true);
    setDefaultInstructions(med.defaultInstructions || '');
    setPregnancyCategory(med.pregnancyCategory || 'B');
    setChildSafe(med.childSafe ?? true);
    setSeniorSafe(med.seniorSafe ?? true);
    setShowAddModal(true);
  };

  const handleSubmitMedicine = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const payload = {
        medicineName,
        genericName,
        brandName,
        manufacturer,
        medicineType,
        strength,
        category,
        scheduleType,
        requiresPrescription,
        defaultInstructions,
        pregnancyCategory,
        childSafe,
        seniorSafe
      };

      if (editingMedicine) {
        await apiClient.put(`/medicine/${editingMedicine._id}`, payload);
        setSuccess(`Medicine "${medicineName}" updated successfully.`);
      } else {
        await apiClient.post('/medicine', payload);
        setSuccess(`Medicine "${medicineName}" added to Master Catalog!`);
      }

      setShowAddModal(false);
      resetForm();
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save medicine to catalog.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Are you sure you want to soft-delete "${name}" from the Master Catalog?`)) return;

    try {
      setError('');
      await apiClient.delete(`/medicine/${id}`);
      setSuccess(`Medicine "${name}" soft-deleted.`);
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete medicine.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900">Admin Medicine Master Catalog</h1>
              <p className="text-xs font-bold text-slate-500">Manage global pharmaceutical drugs, schedules, contraindications, and soft deletions.</p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-bold">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600"
              placeholder="Search Brand, Generic, Manufacturer..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              <option value="General">General</option>
              <option value="Analgesic">Analgesic</option>
              <option value="Antibiotic">Antibiotic</option>
              <option value="Antipyretic">Antipyretic</option>
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Diabetic">Diabetic</option>
            </select>

            <select
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              value={selectedSchedule}
              onChange={(e) => { setSelectedSchedule(e.target.value); setPage(1); }}
            >
              <option value="">All Schedule Types</option>
              <option value="OTC">OTC (Over The Counter)</option>
              <option value="Schedule_H">Schedule H</option>
              <option value="Schedule_H1">Schedule H1</option>
              <option value="Schedule_X">Schedule X (Controlled)</option>
            </select>
          </div>
        </div>

        {/* CATALOG TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold text-sm">
              Loading Master Medicine Catalog...
            </div>
          ) : medicines.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold text-sm">
              No medicine entries found in master catalog.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Medicine & Generic Name</th>
                    <th className="p-4">Form & Strength</th>
                    <th className="p-4">Category & Schedule</th>
                    <th className="p-4">Manufacturer</th>
                    <th className="p-4">Safety Indicators</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-800">
                  {medicines.map((med) => (
                    <tr key={med._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{med.medicineName}</div>
                        <div className="text-xs text-slate-500 font-medium">Generic: {med.genericName}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                          {med.medicineType} • {med.strength}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-slate-800">{med.category}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          med.scheduleType === 'OTC' ? 'bg-emerald-50 text-emerald-700' :
                          med.scheduleType === 'Schedule_H' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {med.scheduleType}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-600">
                        {med.manufacturer}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1.5 flex-wrap text-[10px] font-extrabold">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">Pregnancy: {med.pregnancyCategory}</span>
                          {med.childSafe && <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-md">Child Safe</span>}
                          {med.seniorSafe && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md">Senior Safe</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(med)}
                            className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                            title="Edit Catalog Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedicine(med._id, med.medicineName)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Soft Delete Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION FOOTER */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold text-slate-500">Total Entries: {totalItems}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ADD / EDIT MEDICINE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingMedicine ? 'Edit Medicine Master Record' : 'Add New Medicine to Master Catalog'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMedicine} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="e.g. Paracetamol 500mg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Generic Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="e.g. Acetaminophen"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Brand Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Dolo 650"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Micro Labs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Medicine Form</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    value={medicineType}
                    onChange={(e) => setMedicineType(e.target.value)}
                  >
                    {['Tablet', 'Capsule', 'Injection', 'Syrup', 'Drops', 'Cream', 'Ointment', 'Inhaler', 'Powder'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Strength</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    placeholder="e.g. 500mg, 10ml"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Therapeutic Category</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Analgesic, Antibiotic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Schedule Type</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                  >
                    <option value="OTC">OTC (Over The Counter)</option>
                    <option value="Schedule_H">Schedule H</option>
                    <option value="Schedule_H1">Schedule H1</option>
                    <option value="Schedule_X">Schedule X (Controlled)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Default Dosage Instructions</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  value={defaultInstructions}
                  onChange={(e) => setDefaultInstructions(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600"
                    checked={requiresPrescription}
                    onChange={(e) => setRequiresPrescription(e.target.checked)}
                  />
                  <span>Requires Rx</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600"
                    checked={childSafe}
                    onChange={(e) => setChildSafe(e.target.checked)}
                  />
                  <span>Child Safe</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600"
                    checked={seniorSafe}
                    onChange={(e) => setSeniorSafe(e.target.checked)}
                  />
                  <span>Senior Safe</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingMedicine ? 'Update Record' : 'Save to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
