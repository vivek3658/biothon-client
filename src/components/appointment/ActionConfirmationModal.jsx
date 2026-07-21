import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export const ActionConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  actionType = 'approve', // 'approve' | 'reject' | 'delete'
  requireReason = false
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirm(reason);
      setReason('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRejectOrDelete = actionType === 'reject' || actionType === 'delete';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md width-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              actionType === 'approve' ? 'bg-emerald-50 text-emerald-600' :
              actionType === 'reject' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {actionType === 'approve' ? <CheckCircle2 className="w-5 h-5" /> :
               actionType === 'reject' ? <XCircle className="w-5 h-5" /> :
               <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
              <p className="text-xs font-semibold text-slate-500">{message}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4">
          {requireReason && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Provide Rejection / Action Reason
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10"
                placeholder="Type reason for patient records..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required={requireReason}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
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
              className={`px-6 py-2.5 font-extrabold text-sm rounded-2xl shadow-md transition-all text-white disabled:opacity-50 ${
                actionType === 'approve' ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-500/20' :
                actionType === 'reject' ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/20' :
                'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/20'
              }`}
            >
              {isSubmitting ? 'Processing...' : actionType === 'approve' ? 'Confirm Approval' : actionType === 'reject' ? 'Confirm Rejection' : 'Confirm Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
