import React, { useState } from 'react';
import { Calendar, Clock, Users, DollarSign, X, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/axios';

export const SlotGeneratorModal = ({ isOpen, onClose, onSlotsGenerated }) => {
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState('9');
  const [endHour, setEndHour] = useState('17');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState('30');
  const [maxBookings, setMaxBookings] = useState('2');
  const [fee, setFee] = useState('500');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setIsSubmitting(true);
      const { data } = await apiClient.post('/appointments/slots/generate', {
        slotDate,
        startHour: parseInt(startHour, 10),
        endHour: parseInt(endHour, 10),
        slotDurationMinutes: parseInt(slotDurationMinutes, 10),
        maxBookings: parseInt(maxBookings, 10),
        fee: parseFloat(fee) || 0
      });

      setSuccessMsg(`Successfully generated ${data.count} consultation slots for ${slotDate}!`);
      if (onSlotsGenerated) onSlotsGenerated(data.slots);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate time slots.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Generate Availability Slots</h3>
            <p className="text-xs font-semibold text-slate-500">Bulk create time slots for patient consultations</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Target Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Start Hour (24h)</label>
              <select
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">End Hour (24h)</label>
              <select
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Slot Duration</label>
              <select
                className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                value={slotDurationMinutes}
                onChange={(e) => setSlotDurationMinutes(e.target.value)}
              >
                <option value="15">15 Mins</option>
                <option value="20">20 Mins</option>
                <option value="30">30 Mins</option>
                <option value="45">45 Mins</option>
                <option value="60">60 Mins</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Max Capacity</label>
              <input
                type="number"
                className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
                min="1"
                max="10"
                value={maxBookings}
                onChange={(e) => setMaxBookings(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Fee (₹)</label>
              <input
                type="number"
                className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all mt-4"
          >
            {isSubmitting ? 'Generating Time Slots...' : 'Generate Consultation Slots'}
          </button>
        </form>
      </div>
    </div>
  );
};
