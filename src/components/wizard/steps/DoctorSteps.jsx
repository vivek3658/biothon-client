import React from 'react';
import { InputField, SelectField, CheckboxField, GPSLocationField } from '../FormInput';
import { User, Award, FileCheck, Building, ShieldCheck } from 'lucide-react';

export const DoctorStep1 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <User className="w-4 h-4" /> Doctor Personal Information
    </div>
    <InputField
      label="Doctor Full Name"
      name="name"
      placeholder="e.g. Dr. Rajesh Sharma"
      register={register}
      error={errors.name}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Official Contact Number"
        name="phone"
        type="tel"
        placeholder="+91 9876543210"
        register={register}
        error={errors.phone}
        required
      />
      <InputField
        label="Email Address"
        name="email"
        type="email"
        placeholder="doctor@arogyax.com"
        register={register}
        error={errors.email}
        required
      />
    </div>
  </div>
);

export const DoctorStep2 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <Award className="w-4 h-4" /> Professional Specialization
    </div>
    <InputField
      label="Primary Speciality"
      name="speciality"
      placeholder="e.g. Cardiology / General Medicine / Pediatrics"
      register={register}
      error={errors.speciality}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Years of Experience"
        name="experienceYears"
        type="number"
        placeholder="e.g. 10"
        register={register}
        error={errors.experienceYears}
        required
      />
      <InputField
        label="Medical Degree / Qualification"
        name="degree"
        placeholder="e.g. MBBS, MD, MS, FACC"
        register={register}
        error={errors.degree}
        required
      />
    </div>
  </div>
);

export const DoctorStep3 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <FileCheck className="w-4 h-4" /> Medical Registration & Verification
    </div>
    <InputField
      label="Medical Council Registration / License No"
      name="certificateNo"
      placeholder="e.g. MCI-2026-9912"
      register={register}
      error={errors.certificateNo}
      required
    />
    <InputField
      label="Issuing State / National Medical Council"
      name="issuingCouncil"
      placeholder="e.g. Gujarat Medical Council / NMC"
      register={register}
      error={errors.issuingCouncil}
      required
    />
    <InputField
      label="Certificate Document URL (Optional)"
      name="certificateDoc"
      type="url"
      placeholder="https://example.com/doc-license.pdf"
      register={register}
      error={errors.certificateDoc}
    />
  </div>
);

export const DoctorStep4 = ({ register, errors, setValue }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <Building className="w-4 h-4" /> Practice Location & Address
    </div>
    <InputField
      label="Hospital / Primary Clinic Affiliation (Optional)"
      name="hospitalAffiliation"
      placeholder="e.g. City General Hospital"
      register={register}
      error={errors.hospitalAffiliation}
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <InputField
        label="Room / Cabin No"
        name="roomNo"
        placeholder="Room 402"
        register={register}
        error={errors.roomNo}
      />
      <InputField
        label="Floor No"
        name="floorNo"
        type="number"
        placeholder="4"
        register={register}
        error={errors.floorNo}
      />
      <InputField
        label="Landmark"
        name="landmark"
        placeholder="Near Metro Station"
        register={register}
        error={errors.landmark}
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <InputField
        label="City"
        name="city"
        placeholder="Ahmedabad"
        register={register}
        error={errors.city}
        required
      />
      <InputField
        label="State"
        name="state"
        placeholder="Gujarat"
        register={register}
        error={errors.state}
        required
      />
      <InputField
        label="Pincode"
        name="pincode"
        placeholder="380001"
        register={register}
        error={errors.pincode}
        required
      />
    </div>
    <GPSLocationField setValue={setValue} register={register} errors={errors} />
  </div>
);

export const DoctorStep5 = ({ register, errors, formData }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <ShieldCheck className="w-4 h-4" /> Summary Review & Doctor Verification Consent
    </div>
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
      <div className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Doctor Profile Summary</div>
      <div><strong className="text-slate-900">Name:</strong> {formData.name}</div>
      <div><strong className="text-slate-900">Contact:</strong> {formData.phone} | {formData.email}</div>
      <div><strong className="text-slate-900">Speciality & Qualification:</strong> {formData.speciality} ({formData.degree}, {formData.experienceYears} yrs exp)</div>
      <div><strong className="text-slate-900">Registration License:</strong> {formData.certificateNo} ({formData.issuingCouncil})</div>
      <div><strong className="text-slate-900">Practice Address:</strong> {formData.city}, {formData.state} - {formData.pincode}</div>
    </div>
    <CheckboxField
      label="I certify that I am a registered medical practitioner. I agree to the ArogyaX Code of Ethics and Privacy Policy."
      name="agreedToConsent"
      register={register}
      error={errors.agreedToConsent}
    />
  </div>
);
