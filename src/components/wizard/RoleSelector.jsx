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
    <div className="w-full max-w-6xl mx-auto p-8 sm:p-10 md:p-14 bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100/90 text-sky-800 text-xs font-black uppercase tracking-wider border border-sky-200">
          <ShieldCheck className="w-4 h-4 text-sky-600" aria-hidden="true" /> Healthcare Entity Selection
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Select Your Account Role
        </h2>
        <p className="text-base font-semibold text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Choose the healthcare entity you wish to register. Your multi-step registration wizard will be customized for your entity.
        </p>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 relative group cursor-pointer min-w-0 ${
                isSelected
                  ? 'border-sky-600 bg-sky-50/90 shadow-xl ring-4 ring-sky-500/20 scale-[1.03]'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-lg'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md bg-gradient-to-br ${role.color} ${
                  isSelected ? 'scale-110' : ''
                }`}
              >
                <Icon className="w-7 h-7" aria-hidden="true" />
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1.5">{role.title}</h3>
              <p className="text-xs font-semibold text-slate-500 leading-snug line-clamp-3">
                {role.description}
              </p>

              {isSelected && (
                <div className="mt-4 text-[11px] font-black text-sky-700 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
                  Selected
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
          className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-sky-200/80 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          <span>Continue with {roles.find(r => r.id === selectedRole)?.title} Registration</span>
          <ArrowRight className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
