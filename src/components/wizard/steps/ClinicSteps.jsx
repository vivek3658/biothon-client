import React from 'react';
import { InputField, SelectField, CheckboxField, GPSLocationField } from '../FormInput';
import { Building, FileText, MapPin, Clock, ShieldCheck } from 'lucide-react';

export const ClinicStep1 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <Building className="w-4 h-4" /> Clinic Basic Information
    </div>
    <InputField
      label="Clinic Facility Name"
      name="name"
      placeholder="e.g. Apex Specialist Clinic"
      register={register}
      error={errors.name}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        label="Official Clinic Email"
        name="email"
        type="email"
        placeholder="contact@apexclinic.com"
        register={register}
        error={errors.email}
        required
      />
    </div>
  </div>
);

export const ClinicStep2 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <FileText className="w-4 h-4" /> Registration & Licensing Details
    </div>
    <InputField
      label="Clinic License Registration No"
      name="organizationCertificateNo"
      placeholder="e.g. CLN-AHM-2026-09"
      register={register}
      error={errors.organizationCertificateNo}
      required
    />
    <InputField
      label="Registration Certificate Document URL (Optional)"
      name="organizationCertificateUrl"
      type="url"
      placeholder="https://example.com/clinic-license.pdf"
      register={register}
      error={errors.organizationCertificateUrl}
    />
    <InputField
      label="Tax / GST Identification ID (Optional)"
      name="taxId"
      placeholder="e.g. 24AAAAA0000A1Z5"
      register={register}
      error={errors.taxId}
    />
  </div>
);

export const ClinicStep3 = ({ register, errors, setValue }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <MapPin className="w-4 h-4" /> Facility Address & Location
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <InputField
        label="Building / Premises"
        name="buildingNo"
        placeholder="Building H-12"
        register={register}
        error={errors.buildingNo}
      />
      <InputField
        label="Floor No"
        name="floorNo"
        type="number"
        placeholder="1"
        register={register}
        error={errors.floorNo}
      />
      <InputField
        label="Landmark"
        name="landmark"
        placeholder="Opposite Metro Station"
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

export const ClinicStep4 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <Clock className="w-4 h-4" /> Working Hours & Operational Days
    </div>
    <InputField
      label="Operating Days"
      name="workingDays"
      placeholder="e.g. Monday to Saturday"
      register={register}
      error={errors.workingDays}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Opening Time"
        name="openingTime"
        type="time"
        register={register}
        error={errors.openingTime}
        required
      />
      <InputField
        label="Closing Time"
        name="closingTime"
        type="time"
        register={register}
        error={errors.closingTime}
        required
      />
    </div>
    <CheckboxField
      label="24/7 Emergency Outpatient Services Available"
      name="emergencyServices"
      register={register}
      error={errors.emergencyServices}
    />
  </div>
);

export const ClinicStep5 = ({ register, errors, formData }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <ShieldCheck className="w-4 h-4" /> Summary Review & Facility Consent
    </div>
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
      <div className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Clinic Profile Summary</div>
      <div><strong className="text-slate-900">Clinic Name:</strong> {formData.name}</div>
      <div><strong className="text-slate-900">Contact & Email:</strong> {formData.contactNumber} | {formData.email}</div>
      <div><strong className="text-slate-900">License Number:</strong> {formData.organizationCertificateNo}</div>
      <div><strong className="text-slate-900">Location:</strong> {formData.city}, {formData.state} - {formData.pincode}</div>
      <div><strong className="text-slate-900">Operating Schedule:</strong> {formData.workingDays} ({formData.openingTime} - {formData.closingTime})</div>
    </div>
    <CheckboxField
      label="I certify that I am an authorized representative of this clinic facility. I agree to the ArogyaX Terms & Verification Policy."
      name="agreedToConsent"
      register={register}
      error={errors.agreedToConsent}
    />
  </div>
);
