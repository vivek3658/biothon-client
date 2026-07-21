import React, { useState } from 'react';
import { QrCode, X, CheckCircle2, AlertCircle, Scan } from 'lucide-react';
import { apiClient } from '../../api/axios';

export const QRScannerModal = ({ isOpen, onClose, onCheckInSuccess }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleScanSubmit = async (tokenToUse) => {
    const code = tokenToUse || tokenInput;
    if (!code.trim()) {
      setErrorMsg('Please enter or scan a valid appointment QR token.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    try {
      setIsSubmitting(true);
      const { data } = await apiClient.post('/appointments/check-in', {
        qrCodeToken: code.trim()
      });

      setSuccessMsg(data.message || 'Patient checked in successfully!');
      if (onCheckInSuccess) onCheckInSuccess(data.appointment);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
        setTokenInput('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Check-in failed. Invalid QR code token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-7 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold mx-auto mb-4">
          <QrCode className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-1">Reception QR Check-In Scanner</h3>
        <p className="text-xs font-semibold text-slate-500 mb-6">
          Scan the patient's appointment QR ticket or enter token manually
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Visual Scanner Simulation Box */}
        <div className="w-full h-44 bg-slate-900 rounded-2xl mb-6 relative overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-sky-500/50">
          <Scan className="w-12 h-12 text-sky-400 animate-pulse mb-2" />
          <span className="text-xs font-bold text-sky-300">Scanner Ready / Optical Sensor Active</span>
          <span className="text-[10px] text-slate-400 mt-1">Position QR code inside optical frame</span>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleScanSubmit(); }} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 text-left">
              Manual Token / QR Code Fallback
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="AROGYAX-APT-172..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Verifying Token...' : 'Confirm Patient Check-In'}</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
