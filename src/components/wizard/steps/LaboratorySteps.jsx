import React from 'react';
import { InputField, SelectField, TextAreaField, CheckboxField, GPSLocationField } from '../FormInput';
import { FlaskConical, Award, Clock, TestTube, ShieldCheck } from 'lucide-react';

export const LaboratoryStep1 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <FlaskConical className="w-4 h-4" /> Laboratory Information
    </div>
    <InputField
      label="Diagnostic Laboratory Name"
      name="name"
      placeholder="e.g. Apex Pathology & Diagnostic Center"
      register={register}
      error={errors.name}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <SelectField
        label="Lab Category"
        name="labCategory"
        options={['Pathology', 'Radiology', 'Comprehensive']}
        register={register}
        error={errors.labCategory}
        required
      />
      <InputField
        label="Official Contact Phone"
        name="contactNumber"
        type="tel"
        placeholder="+91 9876543210"
        register={register}
        error={errors.contactNumber}
        required
      />
      <InputField
        label="Official Lab Email"
        name="email"
        type="email"
        placeholder="lab@apexdiagnostics.com"
        register={register}
        error={errors.email}
        required
      />
    </div>
  </div>
);

export const LaboratoryStep2 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <Award className="w-4 h-4" /> NABL Licensing & Director Info
    </div>
    <InputField
      label="NABL / Lab License Registration No"
      name="organizationCertificateNo"
      placeholder="e.g. NABL-LAB-2026-09"
      register={register}
      error={errors.organizationCertificateNo}
      required
    />
    <InputField
      label="Pathologist / Medical Director Name"
      name="pathologistDirector"
      placeholder="e.g. Dr. Sunita Varma, MD Pathology"
      register={register}
      error={errors.pathologistDirector}
      required
    />
    <InputField
      label="License Certificate Document URL (Optional)"
      name="organizationCertificateUrl"
      type="url"
      placeholder="https://example.com/lab-license.pdf"
      register={register}
      error={errors.organizationCertificateUrl}
    />
  </div>
);

export const LaboratoryStep3 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <Clock className="w-4 h-4" /> Operating Schedule & Timings
    </div>
    <InputField
      label="Working Days"
      name="workingDays"
      placeholder="e.g. Monday to Sunday"
      register={register}
      error={errors.workingDays}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Sample Collection Hours"
        name="sampleCollectionHours"
        placeholder="e.g. 7:00 AM - 1:00 PM"
        register={register}
        error={errors.sampleCollectionHours}
        required
      />
      <InputField
        label="Report Dispatch Hours (Optional)"
        name="reportDispatchHours"
        placeholder="e.g. 4:00 PM - 8:00 PM"
        register={register}
        error={errors.reportDispatchHours}
      />
    </div>
  </div>
);

export const LaboratoryStep4 = ({ register, errors, setValue }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <TestTube className="w-4 h-4" /> Lab Services & Location
    </div>
    <TextAreaField
      label="Diagnostic Test Categories Offered"
      name="servicesOffered"
      placeholder="e.g. Hematology, Biochemistry, Lipid Profile, Thyroid, X-Ray, Ultrasound"
      register={register}
      error={errors.servicesOffered}
      required
    />
    <CheckboxField
      label="Home Sample Collection Available for Patients"
      name="homeCollectionAvailable"
      register={register}
      error={errors.homeCollectionAvailable}
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <InputField
        label="Building / Premises"
        name="buildingNo"
        placeholder="Premises 12"
        register={register}
        error={errors.buildingNo}
      />
      <InputField
        label="Floor No"
        name="floorNo"
        type="number"
        placeholder="0"
        register={register}
        error={errors.floorNo}
      />
      <InputField
        label="Landmark"
        name="landmark"
        placeholder="Near Civil Hospital"
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

export const LaboratoryStep5 = ({ register, errors, formData }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <ShieldCheck className="w-4 h-4" /> Summary Review & Laboratory Consent
    </div>
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
      <div className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Laboratory Summary</div>
      <div><strong className="text-slate-900">Lab Name:</strong> {formData.name} ({formData.labCategory})</div>
      <div><strong className="text-slate-900">Contact:</strong> {formData.contactNumber} | {formData.email}</div>
      <div><strong className="text-slate-900">NABL License & Director:</strong> {formData.organizationCertificateNo} (Director: {formData.pathologistDirector})</div>
      <div><strong className="text-slate-900">Collection Hours:</strong> {formData.sampleCollectionHours} ({formData.workingDays})</div>
      <div><strong className="text-slate-900">Services:</strong> {formData.servicesOffered}</div>
    </div>
    <CheckboxField
      label="I certify that I am an authorized representative of this laboratory. I agree to the ArogyaX Digital Diagnostics & Privacy Policy."
      name="agreedToConsent"
      register={register}
      error={errors.agreedToConsent}
    />
  </div>
);
