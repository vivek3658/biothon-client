import React from 'react';
import { Calendar, Clock, MapPin, QrCode, CheckCircle2, User, Play, XCircle, Trash2, Edit3, Check } from 'lucide-react';

export const AppointmentCard = ({
  appointment,
  onViewQR,
  onCheckIn,
  onApprove,
  onReject,
  onStartConsultation,
  onComplete,
  onEdit,
  onDelete,
  userRole = 'patient'
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'requested':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Approval
          </span>
        );
      case 'approved':
      case 'appointed':
        return (
          <span className="px-3 py-1 bg-sky-50 text-sky-900 border border-sky-300 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-sky-600" /> Appointed
          </span>
        );
      case 'checked_in':
      case 'waiting':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" /> Waiting Room
          </span>
        );
      case 'in_consultation':
        return (
          <span className="px-3 py-1 bg-sky-100 text-sky-900 border border-sky-300 rounded-full text-xs font-extrabold flex items-center gap-1.5 animate-pulse shadow-xs">
            <Play className="w-3.5 h-3.5 text-sky-700" /> In Consultation
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-rose-50 text-rose-900 border border-rose-300 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-slate-500" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-sky-50 text-sky-900 border border-sky-300 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-sky-600" /> Appointed
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/80 flex items-center justify-center font-black text-base shadow-xs shrink-0">
            #{appointment.tokenNumber || 1}
          </div>
          <div>
            <h4 className="font-black text-lg text-slate-900 tracking-tight">
              {userRole === 'patient'
                ? (appointment.doctorId?.name ? `Dr. ${appointment.doctorId.name}` : appointment.organizationId?.name || 'Assigned Specialist')
                : (appointment.patientId?.name || 'Patient Profile')}
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              {userRole !== 'patient' && appointment.patientId?.bloodGroup ? `Blood Group: ${appointment.patientId.bloodGroup} • ` : ''}
              {appointment.reason || 'General Medical Consultation'}
            </p>
          </div>
        </div>

        {getStatusBadge(appointment.status)}
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-700 font-semibold">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
          <span>{appointment.appointmentDate || appointment.slotId?.slotDate || 'Today'}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
          <span>{appointment.appointmentTime || appointment.slotId?.startTime || 'Scheduled'}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
          <span className="truncate">{appointment.organizationId?.name || 'ArogyaX Facility'}</span>
        </div>
      </div>

      {appointment.rejectionReason && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800">
          <strong>Rejection Note:</strong> {appointment.rejectionReason}
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex items-center justify-end gap-3 pt-2 flex-wrap">
        {userRole === 'patient' && onViewQR && appointment.qrCodeToken && (
          <button
            onClick={() => onViewQR(appointment)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold text-xs rounded-xl border border-sky-300 transition-colors focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <QrCode className="w-4 h-4" aria-hidden="true" /> View Ticket QR
          </button>
        )}

        {(userRole === 'doctor' || userRole === 'receptionist') && (appointment.status === 'requested' || appointment.status === 'appointed') && onApprove && (
          <button
            onClick={() => onApprove(appointment)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Check className="w-4 h-4" aria-hidden="true" /> Approve
          </button>
        )}

        {(userRole === 'doctor' || userRole === 'receptionist') && (appointment.status === 'requested' || appointment.status === 'appointed') && onReject && (
          <button
            onClick={() => onReject(appointment)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-extrabold text-xs rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" /> Reject
          </button>
        )}

        {(userRole === 'receptionist' || userRole === 'admin') && appointment.status === 'appointed' && onCheckIn && (
          <button
            onClick={() => onCheckIn(appointment)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Check In Patient
          </button>
        )}

        {userRole === 'doctor' && (appointment.status === 'checked_in' || appointment.status === 'waiting' || appointment.status === 'approved' || appointment.status === 'appointed') && onStartConsultation && (
          <button
            onClick={() => onStartConsultation(appointment)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <Play className="w-4 h-4" aria-hidden="true" /> Start Consultation
          </button>
        )}

        {userRole === 'doctor' && appointment.status === 'in_consultation' && onComplete && (
          <button
            onClick={() => onComplete(appointment)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Complete & Issue Rx
          </button>
        )}

        {onEdit && (
          <button
            onClick={() => onEdit(appointment)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <Edit3 className="w-4 h-4" aria-hidden="true" /> Edit
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(appointment)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-300 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete
          </button>
        )}
      </div>
    </div>
  );
};
