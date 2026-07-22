import React from 'react';
import { User, Stethoscope, Building2, Building, FlaskConical, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';

const roles = [
  {
    id: 'patient',
    title: 'Patient',
    icon: User,
    description: 'Personal Health Identity, Emergency Access & Digital Records',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'doctor',
    title: 'Doctor',
    icon: Stethoscope,
    description: 'Medical Practitioner, Prescriptions & Patient Consultations',
    color: 'from-sky-500 to-cyan-600'
  },
  {
    id: 'clinic',
    title: 'Clinic',
    icon: Building,
    description: 'Outpatient Specialty Center & Appointment Management',
    color: 'from-teal-500 to-emerald-600'
  },
  {
    id: 'hospital',
    title: 'Hospital',
    icon: Building2,
    description: 'Inpatient Medical Institution, Emergency & Bed Allocation',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'laboratory',
    title: 'Laboratory',
    icon: FlaskConical,
    description: 'Pathology & Diagnostic Center, Digital Lab Reports',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'receptionist',
    title: 'Receptionist',
    icon: UserCheck,
    description: 'Front Desk Desk Scanner, Walk-in Token & Patient Check-In',
    color: 'from-rose-500 to-pink-600'
  }
];

export const RoleSelector = ({ selectedRole, onSelectRole, onProceed }) => {
  return (
    <div className="w-full max-w-7xl mx-auto p-10 sm:p-14 md:p-16 bg-white/95 backdrop-blur-2xl rounded-[5px] border border-slate-200/90 shadow-2xl shadow-sky-500/10 space-y-10 transition-all">
      {/* Title Section */}
      <div className="text-center space-y-3.5">
        <div className="inline-flex items-center justify-center gap-2 max-w-[80%] mx-auto px-5 py-[5px] rounded-[5px] bg-gradient-to-r from-sky-50 to-blue-50 text-sky-800 text-xs font-black uppercase tracking-wider border border-sky-200 shadow-xs">
          <ShieldCheck className="w-4.5 h-4.5 text-sky-600" aria-hidden="true" />
          <span>Step 1: Healthcare Entity Selection</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Select Your Healthcare Role
        </h2>
        
        <p className="text-base sm:text-lg font-semibold text-slate-500 max-w-3xl mx-auto leading-relaxed">
          Choose your entity type to customize your multi-step registration wizard & verification workflow.
        </p>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              className={`flex flex-col items-center text-center p-7 sm:p-8 rounded-[5px] border-2 transition-all duration-200 relative group cursor-pointer min-w-0 ${
                isSelected
                  ? 'border-sky-600 bg-gradient-to-b from-sky-50/90 to-blue-50/40 shadow-xl ring-4 ring-sky-500/20 scale-[1.02]'
                  : 'border-slate-200/90 bg-white hover:border-sky-300 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-[5px] flex items-center justify-center text-white mb-4 shadow-md bg-gradient-to-br ${role.color} transition-transform duration-200 ${
                  isSelected ? 'scale-110 shadow-sky-500/30' : 'group-hover:scale-105'
                }`}
              >
                <Icon className="w-8 h-8" aria-hidden="true" />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2">{role.title}</h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed line-clamp-3">
                {role.description}
              </p>

              {isSelected && (
                <div className="mt-4 text-xs font-black text-sky-800 bg-white/90 px-3.5 py-[5px] rounded-[5px] border border-sky-300 shadow-xs flex items-center justify-center gap-1.5 max-w-[80%] mx-auto">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  <span>Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Proceed Button */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={onProceed}
          className="inline-flex items-center justify-center gap-3 w-full max-w-[80%] mx-auto py-[5px] px-8 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-base sm:text-lg rounded-[5px] shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:ring-4 focus-visible:ring-sky-500/20 focus-visible:ring-offset-2 cursor-pointer"
        >
          <span>Continue with {roles.find(r => r.id === selectedRole)?.title} Registration</span>
          <ArrowRight className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
