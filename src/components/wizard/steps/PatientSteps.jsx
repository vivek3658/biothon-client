import React from 'react';
import { InputField, SelectField, TextAreaField, CheckboxField, GPSLocationField } from '../FormInput';
import { User, MapPin, PhoneCall, HeartPulse, ShieldCheck } from 'lucide-react';

export const PatientStep1 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <User className="w-4 h-4" /> Personal Information
    </div>
    <InputField
      label="Full Name"
      name="name"
      placeholder="e.g. John Doe"
      register={register}
      error={errors.name}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Date of Birth"
        name="dob"
        type="date"
        register={register}
        error={errors.dob}
        required
      />
      <SelectField
        label="Gender"
        name="gender"
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' }
        ]}
        register={register}
        error={errors.gender}
        required
      />
    </div>
  </div>
);

export const PatientStep2 = ({ register, errors, setValue }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <MapPin className="w-4 h-4" /> Contact & Address Details
    </div>
    <InputField
      label="Contact Phone Number"
      name="phone"
      type="tel"
      placeholder="+91 9876543210"
      register={register}
      error={errors.phone}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <InputField
        label="House / Flat No"
        name="houseNo"
        placeholder="House 42-B"
        register={register}
        error={errors.houseNo}
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
        placeholder="Near City Park"
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

export const PatientStep3 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <PhoneCall className="w-4 h-4" /> Emergency Contact Person
    </div>
    <InputField
      label="Emergency Contact Name"
      name="emergencyContactName"
      placeholder="e.g. Sarah Doe (Spouse/Parent)"
      register={register}
      error={errors.emergencyContactName}
      required
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Relationship"
        name="emergencyContactRelation"
        placeholder="e.g. Spouse, Parent, Sibling"
        register={register}
        error={errors.emergencyContactRelation}
        required
      />
      <InputField
        label="Emergency Phone Number"
        name="emergencyContactPhone"
        type="tel"
        placeholder="+91 9876543210"
        register={register}
        error={errors.emergencyContactPhone}
        required
      />
    </div>
  </div>
);

export const PatientStep4 = ({ register, errors }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <HeartPulse className="w-4 h-4" /> Medical Profile Information
    </div>
    <SelectField
      label="Blood Group"
      name="bloodGroup"
      options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
      register={register}
      error={errors.bloodGroup}
      required
    />
    <TextAreaField
      label="Known Allergies (Optional)"
      name="allergies"
      placeholder="e.g. Penicillin, Dust, Peanuts (leave blank if none)"
      register={register}
      error={errors.allergies}
    />
    <TextAreaField
      label="Existing Medical Conditions (Optional)"
      name="chronicConditions"
      placeholder="e.g. Asthma, Hypertension, Diabetes (leave blank if none)"
      register={register}
      error={errors.chronicConditions}
    />
  </div>
);

export const PatientStep5 = ({ register, errors, formData }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sky-700 font-extrabold text-sm mb-2">
      <ShieldCheck className="w-4 h-4" /> Summary Review & Privacy Consent
    </div>
    
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
      <div className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Patient Profile Summary</div>
      <div><strong className="text-slate-900">Name:</strong> {formData.name || 'N/A'}</div>
      <div><strong className="text-slate-900">DOB & Gender:</strong> {formData.dob} ({formData.gender})</div>
      <div><strong className="text-slate-900">Contact:</strong> {formData.phone}</div>
      <div><strong className="text-slate-900">Address:</strong> {formData.city}, {formData.state} - {formData.pincode}</div>
      <div><strong className="text-slate-900">Emergency Contact:</strong> {formData.emergencyContactName} ({formData.emergencyContactRelation} - {formData.emergencyContactPhone})</div>
      <div><strong className="text-slate-900">Blood Group:</strong> {formData.bloodGroup}</div>
    </div>

    <CheckboxField
      label="I agree to the ArogyaX Health Data Privacy Policy & Terms of Service. I consent to generating a unified health QR identity for medical care."
      name="agreedToConsent"
      register={register}
      error={errors.agreedToConsent}
    />
  </div>
);
