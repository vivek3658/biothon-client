import React from 'react';
import { Check } from 'lucide-react';

export const ProgressIndicator = ({ steps, currentStep }) => {
  const percentage = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="w-full mb-10">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 text-base">
        <span className="font-semibold text-slate-700">
          Step {currentStep + 1} of {steps.length}: <span className="text-sky-600 font-extrabold">{steps[currentStep]?.title}</span>
        </span>
        <span className="font-extrabold text-sky-700 bg-sky-100/90 px-3.5 py-1.5 rounded-full text-xs border border-sky-200 shadow-sm">
          {percentage}% Completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden mb-8 relative">
        <div 
          className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 h-full transition-all duration-500 ease-out rounded-full shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-3">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-100'
                    : isCurrent
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100 shadow-lg shadow-sky-200 scale-110'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
              </div>
              <span 
                className={`text-xs font-bold mt-2.5 text-center line-clamp-1 transition-colors ${
                  isCurrent ? 'text-sky-700 font-extrabold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
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
