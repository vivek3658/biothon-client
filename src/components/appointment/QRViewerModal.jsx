import React from 'react';
import QRCode from 'qrcode';
import { useState, useEffect } from 'react';
import { QrCode, X, Calendar, Clock, MapPin, Download, Ticket } from 'lucide-react';

export const QRViewerModal = ({ isOpen, onClose, appointment }) => {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (appointment?.qrCodeToken) {
      QRCode.toDataURL(appointment.qrCodeToken, { width: 220, margin: 2 })
        .then(url => setQrUrl(url))
        .catch(err => console.error('QR Render Error:', err));
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-7 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-black uppercase tracking-wider mb-4">
          <Ticket className="w-4 h-4" /> Official Appointment Ticket
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-1">
          Token #{appointment.tokenNumber || 1}
        </h3>
        <p className="text-xs font-semibold text-slate-500 mb-6">
          Show this QR code at reception upon arrival for instant check-in
        </p>

        {/* Rendered QR Image */}
        <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl inline-block mb-6 shadow-sm">
          {qrUrl ? (
            <img src={qrUrl} alt="Appointment QR Code" className="w-48 h-48 mx-auto" />
          ) : (
            <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-400">
              Generating QR...
            </div>
          )}
          <span className="block mt-2 font-mono text-[10px] font-bold text-slate-500 break-all">
            {appointment.qrCodeToken}
          </span>
        </div>

        {/* Details Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs text-slate-700 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
            <span><strong className="text-slate-900">Date:</strong> {appointment.appointmentDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600 shrink-0" />
            <span><strong className="text-slate-900">Time:</strong> {appointment.appointmentTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
            <span><strong className="text-slate-900">Facility:</strong> {appointment.organizationId?.name || 'Healthcare Facility'}</span>
          </div>
        </div>

        <a
          href={qrUrl}
          download={`ArogyaX-Appointment-${appointment.tokenNumber}.png`}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Save Ticket to Device</span>
        </a>
      </div>
    </div>
  );
};
