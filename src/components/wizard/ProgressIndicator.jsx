import React from 'react';
import { Check } from 'lucide-react';

export const ProgressIndicator = ({ steps, currentStep }) => {
  const percentage = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="w-full mb-8">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="font-semibold text-slate-700">
          Step {currentStep + 1} of {steps.length}: <span className="text-sky-600 font-bold">{steps[currentStep]?.title}</span>
        </span>
        <span className="font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full text-xs border border-sky-200">
          {percentage}% Completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden mb-6 relative">
        <div 
          className="bg-gradient-to-r from-sky-500 to-blue-600 h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-100'
                    : isCurrent
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100 shadow-sky-200 scale-110'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span 
                className={`text-[11px] font-semibold mt-2 text-center line-clamp-1 transition-colors ${
                  isCurrent ? 'text-sky-700 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
