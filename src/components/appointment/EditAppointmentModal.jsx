import React, { useState } from 'react';
import { X, Calendar, Clock, Edit3, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/axios';

export const EditAppointmentModal = ({ appointment, onClose, onUpdated }) => {
  const [appointmentDate, setAppointmentDate] = useState(appointment?.appointmentDate || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(appointment?.notes || appointment?.reason || '');
  const [status, setStatus] = useState(appointment?.status || 'appointed');
  const [rejectionReason, setRejectionReason] = useState(appointment?.rejectionReason || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      const { data } = await apiClient.put(`/appointments/${appointment._id}`, {
        appointmentDate,
        notes,
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : ''
      });

      if (data.success) {
        onUpdated(data.appointment);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg width-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Edit Appointment</h3>
              <p className="text-xs font-semibold text-slate-500">
                Token #{appointment.tokenNumber || 1} • {appointment.patientId?.name || 'Patient'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Appointment Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-500/10"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Status Classification</label>
            <select
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-500/10"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="requested">Pending Approval (requested)</option>
              <option value="approved">Approved</option>
              <option value="appointed">Appointed</option>
              <option value="checked_in">Checked In (Waiting Room)</option>
              <option value="in_consultation">In Consultation</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {status === 'rejected' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Rejection Reason</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10"
                placeholder="Reason for rejecting appointment..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Notes / Reason</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-500/10"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical notes or consultation details..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
