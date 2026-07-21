import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Pill, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  Download, 
  Printer, 
  Activity 
} from 'lucide-react';
import { apiClient } from '../api/axios';

export const PublicQRVerifyPage = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifiedData, setVerifiedData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Extract token from URL /verify/:token or query string
    const pathParts = window.location.pathname.split('/');
    const urlToken = pathParts[pathParts.length - 1] || new URLSearchParams(window.location.search).get('token');
    
    if (urlToken && urlToken.startsWith('ARX-SEC-')) {
      setToken(urlToken);
      verifyToken(urlToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (qrToken) => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get(`/prescription/verify/${qrToken}`);
      if (res.data?.verified) {
        setVerifiedData(res.data);
      } else {
        setError('Invalid or tampered prescription token.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Prescription verification failed. Invalid ticket token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* BRAND HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-extrabold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>ArogyaX EMR Vault Cryptographic Verification Gateway</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Official Prescription Verification</h1>
        </div>

        {/* VERIFICATION CARD */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Activity className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-400">Verifying Cryptographic HMAC Signature...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-400">Verification Failed</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">{error}</p>
              </div>
            </div>
          ) : verifiedData?.prescription ? (
            <div className="space-y-6">
              {/* SUCCESS BADGE */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <span className="text-xs font-black text-emerald-400 tracking-wider uppercase">Authentic & Server Verified</span>
                    <div className="text-[11px] font-semibold text-slate-400">Rx #{verifiedData.prescription.prescriptionNumber} • Version {verifiedData.prescription.version}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-900 rounded-lg text-slate-400">
                  {new Date(verifiedData.prescription.finalizedAt).toLocaleDateString()}
                </span>
              </div>

              {/* PATIENT & DOCTOR METADATA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-700/50 text-xs">
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Patient Profile</span>
                  <div className="font-black text-white text-sm mt-0.5">{verifiedData.prescription.patientId?.name || 'Verified Patient'}</div>
                  <div className="text-slate-400 font-semibold">Blood Group: {verifiedData.prescription.patientId?.bloodGroup || 'A+'}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Issuing Practitioner</span>
                  <div className="font-black text-white text-sm mt-0.5">Dr. {verifiedData.prescription.doctorId?.name || 'Practitioner'}</div>
                  <div className="text-slate-400 font-semibold">{verifiedData.prescription.doctorId?.doctorDetails?.speciality || 'General Medicine'}</div>
                </div>
              </div>

              {/* DIAGNOSIS */}
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Diagnosis</span>
                <div className="flex gap-2 flex-wrap mt-2">
                  {verifiedData.prescription.diagnosis?.map((d, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold text-xs rounded-xl">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* MEDICATIONS TABLE */}
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 block">Prescribed Medications</span>
                <div className="space-y-2">
                  {verifiedData.prescription.medications?.map((med, i) => (
                    <div key={i} className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-extrabold text-white">{med.medicineName} ({med.strength})</div>
                        <div className="text-[11px] text-slate-400 font-semibold">{med.frequency} • {med.mealTiming} • {med.durationDays} Days</div>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[11px] rounded-lg">
                        Qty: {med.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => window.print()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Certificate</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 font-bold text-sm">
              Enter or scan a valid ArogyaX Prescription Ticket QR Token to verify authenticity.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
