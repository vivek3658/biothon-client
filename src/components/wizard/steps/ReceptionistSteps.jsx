import React from 'react';
import { InputField, SelectField, CheckboxField } from '../FormInput';
import { UserCheck, Building2, ShieldCheck } from 'lucide-react';

export const ReceptionistStep1 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <UserCheck className="w-4 h-4" /> Receptionist Basic Information
    </div>
    <InputField
      label="Full Name"
      name="name"
      placeholder="e.g. Sarah Jenkins"
      register={register}
      error={errors.name}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Contact Phone Number"
        name="phone"
        type="tel"
        placeholder="+91 9876543210"
        register={register}
        error={errors.phone}
        required
      />
      <InputField
        label="Official Email Address"
        name="email"
        type="email"
        placeholder="sarah.reception@clinic.com"
        register={register}
        error={errors.email}
        required
      />
    </div>
  </div>
);

export const ReceptionistStep2 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <Building2 className="w-4 h-4" /> Facility Assignment & Employee Code
    </div>
    <SelectField
      label="Facility Type"
      name="assignedFacilityType"
      options={[
        { value: 'clinic', label: 'Clinic' },
        { value: 'hospital', label: 'Hospital' }
      ]}
      register={register}
      error={errors.assignedFacilityType}
      required
    />
    <InputField
      label="Clinic or Hospital Facility Name"
      name="assignedFacilityName"
      placeholder="e.g. City Care Multispeciality Hospital"
      register={register}
      error={errors.assignedFacilityName}
      required
    />
    <InputField
      label="Employee Staff Code / Badge ID"
      name="employeeCode"
      placeholder="e.g. REC-2026-09"
      register={register}
      error={errors.employeeCode}
      required
    />
  </div>
);

export const ReceptionistStep3 = ({ register, errors, formData }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <ShieldCheck className="w-4 h-4" /> Summary Review & Staff Agreement
    </div>
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
      <div className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Receptionist Staff Summary</div>
      <div><strong className="text-slate-900">Name:</strong> {formData.name}</div>
      <div><strong className="text-slate-900">Contact:</strong> {formData.phone} | {formData.email}</div>
      <div><strong className="text-slate-900">Assigned Facility:</strong> {formData.assignedFacilityName} ({formData.assignedFacilityType})</div>
      <div><strong className="text-slate-900">Employee Code:</strong> {formData.employeeCode}</div>
    </div>
    <CheckboxField
      label="I agree to the ArogyaX Staff Privacy Policy & Code of Conduct for patient check-in management."
      name="agreedToConsent"
      register={register}
      error={errors.agreedToConsent}
    />
  </div>
);
