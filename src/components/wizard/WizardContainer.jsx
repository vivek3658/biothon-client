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
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="ArogyaX Logo" className="h-10 object-contain" />
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
              Multi-Step Healthcare Registration
            </span>
            <h1 className="text-xl font-black text-slate-900">
              {roleTitle} Onboarding Wizard
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetRole}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Switch Role
        </button>
      </div>

      {/* Progress Bar & Indicators */}
      <ProgressIndicator steps={steps} currentStep={currentStep} />

      {/* Animated Step Form Body */}
      <div className="min-h-[320px] relative py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Wizard Footer Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep || isSubmitting}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            isFirstStep || isSubmitting
              ? 'opacity-0 pointer-events-none'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Previous Step
        </button>

        {!isLastStep ? (
          <button
            type="button"
            onClick={onNext}
            disabled={isValidating || isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-200 hover:shadow-lg transition-all"
          >
            <span>{isValidating ? 'Validating...' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting Registration...' : 'Complete & Submit Registration'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
