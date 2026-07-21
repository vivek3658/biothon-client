import React from 'react';
import { Calendar, Clock, MapPin, QrCode, CheckCircle2, User, Play, XCircle } from 'lucide-react';

export const AppointmentCard = ({
  appointment,
  onViewQR,
  onCheckIn,
  onStartConsultation,
  onComplete,
  onCancel,
  userRole = 'patient'
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'checked_in':
      case 'waiting':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Waiting Room
          </span>
        );
      case 'in_consultation':
        return (
          <span className="px-2.5 py-1 bg-sky-100 text-sky-800 border border-sky-200 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
            <Play className="w-3.5 h-3.5" /> In Consultation
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Appointed
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-black text-sm">
            #{appointment.tokenNumber || 1}
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-900">
              {userRole === 'patient'
                ? (appointment.doctorId?.name || 'Assigned Specialist')
                : (appointment.patientId?.name || 'Patient Profile')}
            </h4>
            <p className="text-xs font-semibold text-slate-500">
              {appointment.reason || 'General Medical Consultation'}
            </p>
          </div>
        </div>

        {getStatusBadge(appointment.status)}
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{appointment.appointmentDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{appointment.appointmentTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="truncate">{appointment.organizationId?.name || 'ArogyaX Facility'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2">
        {userRole === 'patient' && onViewQR && appointment.qrCodeToken && (
          <button
            onClick={() => onViewQR(appointment)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" /> View Ticket QR
          </button>
        )}

        {(userRole === 'receptionist' || userRole === 'admin') && appointment.status === 'appointed' && onCheckIn && (
          <button
            onClick={() => onCheckIn(appointment)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Check In Patient
          </button>
        )}

        {userRole === 'doctor' && (appointment.status === 'checked_in' || appointment.status === 'waiting') && onStartConsultation && (
          <button
            onClick={() => onStartConsultation(appointment)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5" /> Start Consultation
          </button>
        )}

        {userRole === 'doctor' && appointment.status === 'in_consultation' && onComplete && (
          <button
            onClick={() => onComplete(appointment)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Complete & Issue QR
          </button>
        )}
      </div>
    </div>
  );
};
