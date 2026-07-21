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
    <div className="w-full max-w-4xl mx-auto p-8 md:p-12 bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-200/60">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-8">
        <div className="flex items-center gap-4">
          <img src={logoImg} alt="ArogyaX Logo" className="h-12 object-contain" />
          <div>
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest block">
              Multi-Step Healthcare Registration
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {roleTitle} Onboarding Wizard
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetRole}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Switch Role
        </button>
      </div>

      {/* Progress Bar & Step Indicators */}
      <ProgressIndicator steps={steps} currentStep={currentStep} />

      {/* Animated Step Form Body */}
      <div className="min-h-[360px] relative py-3">
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
      <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-10">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep || isSubmitting}
          className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all ${
            isFirstStep || isSubmitting
              ? 'opacity-0 pointer-events-none'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ChevronLeft className="w-5 h-5" /> Previous Step
        </button>

        {!isLastStep ? (
          <button
            type="button"
            onClick={onNext}
            disabled={isValidating || isSubmitting}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-sky-200/80 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <span>{isValidating ? 'Validating...' : 'Next Step'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2.5 px-9 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-200/80 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? 'Submitting Registration...' : 'Complete & Submit Registration'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
