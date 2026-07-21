import React from 'react';
import { InputField, SelectField, CheckboxField, GPSLocationField } from '../FormInput';
import { Building2, Award, Bed, PhoneCall, ShieldCheck } from 'lucide-react';

export const HospitalStep1 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <Building2 className="w-4 h-4" /> Hospital Basic Information
    </div>
    <InputField
      label="Hospital Institution Name"
      name="name"
      placeholder="e.g. City Care Multispeciality Hospital"
      register={register}
      error={errors.name}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <SelectField
        label="Hospital Category"
        name="category"
        options={['General', 'Super Specialty', 'Multi Specialty']}
        register={register}
        error={errors.category}
        required
      />
      <InputField
        label="Official Contact Number"
        name="contactNumber"
        type="tel"
        placeholder="+91 9876543210"
        register={register}
        error={errors.contactNumber}
        required
      />
      <InputField
        label="Hospital Email Address"
        name="email"
        type="email"
        placeholder="info@citycarehospital.com"
        register={register}
        error={errors.email}
        required
      />
    </div>
  </div>
);

export const HospitalStep2 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <Award className="w-4 h-4" /> Accreditation & License Details
    </div>
    <InputField
      label="Hospital License Certificate No"
      name="organizationCertificateNo"
      placeholder="e.g. HOSP-REG-2026-881"
      register={register}
      error={errors.organizationCertificateNo}
      required
    />
    <SelectField
      label="Accreditation Authority"
      name="accreditation"
      options={['NABH', 'JCI', 'State Board', 'None']}
      register={register}
      error={errors.accreditation}
      required
    />
    <InputField
      label="Accreditation / License Document URL (Optional)"
      name="organizationCertificateUrl"
      type="url"
      placeholder="https://example.com/hospital-accreditation.pdf"
      register={register}
      error={errors.organizationCertificateUrl}
    />
  </div>
);

export const HospitalStep3 = ({ register, errors, setValue }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <Bed className="w-4 h-4" /> Hospital Infrastructure & Premises
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Total Bed Capacity"
        name="totalBeds"
        type="number"
        placeholder="e.g. 250"
        register={register}
        error={errors.totalBeds}
        required
      />
      <InputField
        label="ICU Bed Capacity (Optional)"
        name="icuBeds"
        type="number"
        placeholder="e.g. 40"
        register={register}
        error={errors.icuBeds}
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <InputField
        label="Premises / Building"
        name="buildingNo"
        placeholder="Main Wing A"
        register={register}
        error={errors.buildingNo}
      />
      <InputField
        label="Floors Count"
        name="floorNo"
        type="number"
        placeholder="7"
        register={register}
        error={errors.floorNo}
      />
      <InputField
        label="Landmark"
        name="landmark"
        placeholder="Near Highway Exit"
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

export const HospitalStep4 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <PhoneCall className="w-4 h-4" /> Emergency Helplines & Contact Info
    </div>
    <InputField
      label="24/7 Emergency Desk Line"
      name="emergencyLine"
      type="tel"
      placeholder="+91 79 2600 0000"
      register={register}
      error={errors.emergencyLine}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Ambulance Dispatch Line (Optional)"
        name="ambulancePhone"
        type="tel"
        placeholder="+91 108"
        register={register}
        error={errors.ambulancePhone}
      />
      <InputField
        label="Administration Contact (Optional)"
        name="adminContact"
        placeholder="admin@hospital.com"
        register={register}
        error={errors.adminContact}
      />
    </div>
  </div>
);

export const HospitalStep5 = ({ register, errors, formData }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <ShieldCheck className="w-4 h-4" /> Summary Review & Hospital Consent
    </div>
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
      <div className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Hospital Summary</div>
      <div><strong className="text-slate-900">Hospital Name:</strong> {formData.name} ({formData.category})</div>
      <div><strong className="text-slate-900">Contact & Emergency:</strong> {formData.contactNumber} | Emergency: {formData.emergencyLine}</div>
      <div><strong className="text-slate-900">License & Accreditation:</strong> {formData.organizationCertificateNo} ({formData.accreditation})</div>
      <div><strong className="text-slate-900">Capacity:</strong> {formData.totalBeds} Beds (ICU: {formData.icuBeds || '0'})</div>
      <div><strong className="text-slate-900">Location:</strong> {formData.city}, {formData.state} - {formData.pincode}</div>
    </div>
    <CheckboxField
      label="I certify that I am an authorized admin of this hospital. I agree to the ArogyaX Emergency Network Terms."
      name="agreedToConsent"
      register={register}
      error={errors.agreedToConsent}
    />
  </div>
);
