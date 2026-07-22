import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressIndicator } from './ProgressIndicator';
import { ChevronLeft, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

export const WizardContainer = ({
  roleTitle,
  steps,
  currentStep,
  onPrevious,
  onNext,
  onSubmit,
  onResetRole,
  isSubmitting,
  isValidating,
  children
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="w-full max-w-6xl mx-auto p-10 sm:p-14 md:p-16 bg-white/95 backdrop-blur-2xl rounded-[5px] border border-slate-200/90 shadow-2xl shadow-sky-500/10 space-y-10 transition-all">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <img src={logoImg} alt="ArogyaX Logo" className="h-14 sm:h-16 object-contain" />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-[5px] bg-sky-50 text-sky-800 text-[11px] font-black uppercase tracking-wider border border-sky-200 mb-1">
              Multi-Step Healthcare Registration
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {roleTitle} Onboarding Wizard
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetRole}
          className="inline-flex items-center gap-2 px-5 py-3 text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[5px] transition-colors self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span>Switch Role</span>
        </button>
      </div>

      {/* Progress Bar & Step Indicators */}
      <ProgressIndicator steps={steps} currentStep={currentStep} />

      {/* Animated Step Form Body */}
      <div className="min-h-[400px] relative py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Wizard Footer Action Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep || isSubmitting}
          className={`inline-flex items-center gap-2 px-7 py-4 rounded-[5px] font-black text-base transition-all focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
            isFirstStep || isSubmitting
              ? 'opacity-0 pointer-events-none'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-xs'
          }`}
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          <span>Previous Step</span>
        </button>

        {!isLastStep ? (
          <button
            type="button"
            onClick={onNext}
            disabled={isValidating || isSubmitting}
            className="inline-flex items-center gap-3 px-10 py-4.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-base sm:text-lg rounded-[5px] shadow-lg shadow-sky-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all focus-visible:ring-4 focus-visible:ring-sky-500/20 focus-visible:ring-offset-2 cursor-pointer"
          >
            <span>{isValidating ? 'Validating...' : 'Next Step'}</span>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-3 px-11 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-base sm:text-lg rounded-[5px] shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:ring-offset-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>{isSubmitting ? 'Submitting Registration...' : 'Complete & Submit Registration'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
