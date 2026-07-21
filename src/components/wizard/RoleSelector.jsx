import React from 'react';
import { User, Stethoscope, Building2, Building, FlaskConical, ArrowRight, ShieldCheck } from 'lucide-react';

const roles = [
  {
    id: 'patient',
    title: 'Patient',
    icon: User,
    description: 'Personal Health Identity, QR Emergency Access & Digital Records',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50/50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'doctor',
    title: 'Doctor',
    icon: Stethoscope,
    description: 'Medical Practitioner, Prescriptions & Patient Consultations',
    color: 'from-sky-500 to-cyan-600',
    bgColor: 'bg-sky-50/50',
    borderColor: 'border-sky-200'
  },
  {
    id: 'clinic',
    title: 'Clinic',
    icon: Building,
    description: 'Outpatient Specialty Center & Appointment Management',
    color: 'from-teal-500 to-emerald-600',
    bgColor: 'bg-teal-50/50',
    borderColor: 'border-teal-200'
  },
  {
    id: 'hospital',
    title: 'Hospital',
    icon: Building2,
    description: 'Inpatient Medical Institution, Emergency & Bed Allocation',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50/50',
    borderColor: 'border-amber-200'
  },
  {
    id: 'laboratory',
    title: 'Laboratory',
    icon: FlaskConical,
    description: 'Pathology & Diagnostic Center, Digital Lab Reports',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50/50',
    borderColor: 'border-purple-200'
  }
];

export const RoleSelector = ({ selectedRole, onSelectRole, onProceed }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100/80 text-sky-700 text-xs font-extrabold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4" /> Healthcare Entity Selection
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Select Your Account Role
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-2 max-w-lg mx-auto">
          Choose the healthcare entity you wish to register. Your multi-step registration wizard will be customized for your entity.
        </p>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              className={`flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-300 relative group ${
                isSelected
                  ? 'border-sky-600 bg-sky-50/80 shadow-lg shadow-sky-100 scale-[1.02]'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-md bg-gradient-to-br ${role.color} ${
                  isSelected ? 'ring-4 ring-sky-200 scale-110' : ''
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="text-base font-extrabold text-slate-900 mb-1">{role.title}</h3>
              <p className="text-xs font-medium text-slate-500 leading-snug line-clamp-3">
                {role.description}
              </p>

              {isSelected && (
                <div className="mt-3 text-[11px] font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Proceed Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onProceed}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-sky-200 hover:shadow-xl transition-all"
        >
          <span>Continue with {roles.find(r => r.id === selectedRole)?.title} Registration</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
