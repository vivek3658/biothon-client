import React, { useState, useEffect } from 'react';
import { UserCheck, QrCode, Ticket, Clock, CheckCircle2, Search, Plus, Calendar, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/axios';
import { AppointmentCard } from '../../components/appointment/AppointmentCard';
import { QRScannerModal } from '../../components/appointment/QRScannerModal';

export const ReceptionDashboard = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [queueSummary, setQueueSummary] = useState({ total: 0, waitingCount: 0, currentCount: 0, completedCount: 0 });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLiveQueue = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/appointments/queue');
      if (data.success) {
        setQueueSummary(data.summary || {});
        const queueObj = data.queue || {};
        const combined = [
          ...(queueObj.current || []),
          ...(queueObj.waiting || []),
          ...(queueObj.upcoming || []),
          ...(queueObj.completed || [])
        ];
        setAppointments(combined);
      }
    } catch (err) {
      setErrorMsg('Failed to load reception live queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
  }, []);

  const handleManualCheckIn = async (apt) => {
    try {
      await apiClient.post('/appointments/check-in', { appointmentId: apt._id });
      await fetchLiveQueue();
    } catch (err) {
      alert(err.message || 'Check-in failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
            <UserCheck className="w-4 h-4" /> Reception Staff Portal
          </div>
          <h2 className="text-2xl md:text-3xl font-black">
            Front Desk Queue & Patient Check-In
          </h2>
          <p className="text-xs md:text-sm text-sky-100 mt-1">
            Manage walk-in bookings, scan patient appointment QR tickets, and monitor live waiting room queues.
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-sky-900 hover:bg-sky-50 font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer shrink-0"
        >
          <QrCode className="w-5 h-5 text-sky-600" />
          <span>Open Reception QR Scanner</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Appointments</span>
            <Calendar className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{queueSummary.total || appointments.length}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checked In / Waiting</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{queueSummary.waitingCount || 0}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Consultation</span>
            <UserCheck className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-600">{queueSummary.currentCount || 0}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Today</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{queueSummary.completedCount || 0}</div>
        </div>
      </div>

      {/* Main Appointments & Queue Stream */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-sky-600" /> Today's Patient Queue Stream
          </h3>
          <button
            onClick={fetchLiveQueue}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
          >
            Refresh Queue
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-400 font-semibold text-sm">
            Loading live reception queue...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-700">No Appointments Scheduled Today</h4>
            <p className="text-xs text-slate-400 mt-1">Scan a patient QR ticket or book a walk-in appointment above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <AppointmentCard
                key={apt._id}
                appointment={apt}
                userRole="receptionist"
                onCheckIn={handleManualCheckIn}
              />
            ))}
          </div>
        )}
      </div>

      {/* QR Check-In Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCheckInSuccess={() => fetchLiveQueue()}
      />
    </div>
  );
};
