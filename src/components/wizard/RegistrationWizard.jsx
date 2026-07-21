import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WizardContainer } from './WizardContainer';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/axios';

import {
  PatientStep1, PatientStep2, PatientStep3, PatientStep4, PatientStep5
} from './steps/PatientSteps';
import {
  DoctorStep1, DoctorStep2, DoctorStep3, DoctorStep4, DoctorStep5
} from './steps/DoctorSteps';
import {
  ClinicStep1, ClinicStep2, ClinicStep3, ClinicStep4, ClinicStep5
} from './steps/ClinicSteps';
import {
  HospitalStep1, HospitalStep2, HospitalStep3, HospitalStep4, HospitalStep5
} from './steps/HospitalSteps';
import {
  LaboratoryStep1, LaboratoryStep2, LaboratoryStep3, LaboratoryStep4, LaboratoryStep5
} from './steps/LaboratorySteps';
import {
  ReceptionistStep1, ReceptionistStep2, ReceptionistStep3
} from './steps/ReceptionistSteps';

import {
  patientStep1Schema, patientStep2Schema, patientStep3Schema, patientStep4Schema, patientStep5Schema,
  doctorStep1Schema, doctorStep2Schema, doctorStep3Schema, doctorStep4Schema, doctorStep5Schema,
  clinicStep1Schema, clinicStep2Schema, clinicStep3Schema, clinicStep4Schema, clinicStep5Schema,
  hospitalStep1Schema, hospitalStep2Schema, hospitalStep3Schema, hospitalStep4Schema, hospitalStep5Schema,
  labStep1Schema, labStep2Schema, labStep3Schema, labStep4Schema, labStep5Schema,
  receptionistStep1Schema, receptionistStep2Schema, receptionistStep3Schema
} from '../../schemas/authSchemas';

const roleConfig = {
  patient: {
    title: 'Patient',
    steps: [
      { title: 'Personal Info', schema: patientStep1Schema, Component: PatientStep1 },
      { title: 'Contact & Address', schema: patientStep2Schema, Component: PatientStep2 },
      { title: 'Emergency Contact', schema: patientStep3Schema, Component: PatientStep3 },
      { title: 'Medical Info', schema: patientStep4Schema, Component: PatientStep4 },
      { title: 'Confirmation', schema: patientStep5Schema, Component: PatientStep5 }
    ]
  },
  doctor: {
    title: 'Doctor',
    steps: [
      { title: 'Personal Info', schema: doctorStep1Schema, Component: DoctorStep1 },
      { title: 'Professional Info', schema: doctorStep2Schema, Component: DoctorStep2 },
      { title: 'Registration Details', schema: doctorStep3Schema, Component: DoctorStep3 },
      { title: 'Practice & Address', schema: doctorStep4Schema, Component: DoctorStep4 },
      { title: 'Confirmation', schema: doctorStep5Schema, Component: DoctorStep5 }
    ]
  },
  clinic: {
    title: 'Clinic',
    steps: [
      { title: 'Clinic Info', schema: clinicStep1Schema, Component: ClinicStep1 },
      { title: 'Registration Details', schema: clinicStep2Schema, Component: ClinicStep2 },
      { title: 'Address & Location', schema: clinicStep3Schema, Component: ClinicStep3 },
      { title: 'Working Hours', schema: clinicStep4Schema, Component: ClinicStep4 },
      { title: 'Confirmation', schema: clinicStep5Schema, Component: ClinicStep5 }
    ]
  },
  hospital: {
    title: 'Hospital',
    steps: [
      { title: 'Hospital Info', schema: hospitalStep1Schema, Component: HospitalStep1 },
      { title: 'License Details', schema: hospitalStep2Schema, Component: HospitalStep2 },
      { title: 'Infrastructure & Address', schema: hospitalStep3Schema, Component: HospitalStep3 },
      { title: 'Emergency Helplines', schema: hospitalStep4Schema, Component: HospitalStep4 },
      { title: 'Confirmation', schema: hospitalStep5Schema, Component: HospitalStep5 }
    ]
  },
  laboratory: {
    title: 'Laboratory',
    steps: [
      { title: 'Lab Info', schema: labStep1Schema, Component: LaboratoryStep1 },
      { title: 'NABL & Licensing', schema: labStep2Schema, Component: LaboratoryStep2 },
      { title: 'Working Hours', schema: labStep3Schema, Component: LaboratoryStep3 },
      { title: 'Services & Address', schema: labStep4Schema, Component: LaboratoryStep4 },
      { title: 'Confirmation', schema: labStep5Schema, Component: LaboratoryStep5 }
    ]
  },
  receptionist: {
    title: 'Receptionist',
    steps: [
      { title: 'Personal Info', schema: receptionistStep1Schema, Component: ReceptionistStep1 },
      { title: 'Facility & Badge', schema: receptionistStep2Schema, Component: ReceptionistStep2 },
      { title: 'Confirmation', schema: receptionistStep3Schema, Component: ReceptionistStep3 }
    ]
  }
};

export const RegistrationWizard = ({ role, onResetRole, onRegistrationSuccess, defaultEmail = '', accountId = null }) => {
  const currentRoleConfig = roleConfig[role] || roleConfig.patient;
  const storageKey = `arogyax_wizard_draft_${role}`;

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { refreshUser } = useAuth();

  // Load saved draft from LocalStorage if available
  const getInitialValues = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}

    return {
      email: defaultEmail,
      facilityType: role === 'clinic' ? 'clinic' : role === 'hospital' ? 'hospital' : role === 'laboratory' ? 'laboratory' : undefined,
      assignedFacilityType: 'clinic',
      bloodGroup: 'A+',
      gender: 'male',
      category: 'General',
      accreditation: 'NABH',
      labCategory: 'Pathology',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      longitude: '72.5714',
      latitude: '23.0225'
    };
  };

  const currentStepSchema = currentRoleConfig.steps[currentStep].schema;

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors, isValidating }
  } = useForm({
    resolver: zodResolver(currentStepSchema),
    defaultValues: getInitialValues(),
    mode: 'onTouched'
  });

  // Autosave draft on form changes
  const allValues = watch();
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(allValues));
    } catch (e) {}
  }, [allValues, storageKey]);

  // Navigate to Previous Step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setErrorMsg('');
      setCurrentStep(prev => prev - 1);
    }
  };

  // Validate and Navigate to Next Step
  const handleNext = async () => {
    setErrorMsg('');
    const isStepValid = await trigger();
    if (isStepValid) {
      if (currentStep < currentRoleConfig.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  // Submit Final Wizard Payload to Backend API
  const handleFinalSubmit = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const isStepValid = await trigger();
    if (!isStepValid) return;

    const data = getValues();
    const isOrg = ['clinic', 'hospital', 'laboratory'].includes(role);
    const targetEntityModel = isOrg ? 'Organization' : 'User';

    try {
      setIsSubmitting(true);

      let targetAccountId = accountId;

      // Step A: Create Base Account if not already created
      if (!targetAccountId && data.email && data.password) {
        const { data: accData } = await apiClient.post('/auth/create-account', {
          email: data.email.trim(),
          password: data.password,
          entityModel: targetEntityModel
        });
        if (accData.accountId) targetAccountId = accData.accountId;
        if (accData.token) localStorage.setItem('token', accData.token);
      }

      // Step B: Submit Complete Profile Payload according to entity type
      if (isOrg) {
        const { data: orgRes } = await apiClient.post('/auth/complete-org-profile', {
          accountId: targetAccountId,
          email: data.email,
          name: data.name,
          facilityType: role,
          contactNumber: data.contactNumber || '9876543210',
          location: {
            buildingNo: data.buildingNo || '',
            floorNo: parseInt(data.floorNo, 10) || 0,
            landmark: data.landmark || '',
            city: data.city || 'Ahmedabad',
            state: data.state || 'Gujarat',
            pincode: data.pincode || '380001'
          },
          coordinates: [parseFloat(data.longitude) || 72.5714, parseFloat(data.latitude) || 23.0225],
          organizationCertificateNo: data.organizationCertificateNo || `REG-${Date.now()}`,
          organizationCertificateUrl: data.organizationCertificateUrl || 'https://example.com/cert.pdf',
          workingDays: data.workingDays ? [data.workingDays] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        });

        if (orgRes.token) localStorage.setItem('token', orgRes.token);
      } else {
        const isDoctor = role === 'doctor';
        const { data: userRes } = await apiClient.post('/user/complete-profile', {
          accountId: targetAccountId,
          email: data.email,
          name: data.name,
          isDoctor,
          location: {
            roomNo: data.roomNo || data.houseNo || '',
            floorNo: parseInt(data.floorNo, 10) || 0,
            landmark: data.landmark || '',
            city: data.city || 'Ahmedabad',
            state: data.state || 'Gujarat',
            pincode: data.pincode || '380001'
          },
          coordinates: [parseFloat(data.longitude) || 72.5714, parseFloat(data.latitude) || 23.0225],
          bloodGroup: data.bloodGroup || 'A+',
          certificateNo: isDoctor ? (data.certificateNo || `MCI-${Date.now()}`) : null,
          certificateDoc: isDoctor ? (data.certificateDoc || 'https://example.com/doc-cert.pdf') : null,
          speciality: isDoctor ? (data.speciality || 'General Medicine') : null
        });

        if (userRes.token) localStorage.setItem('token', userRes.token);
      }

      // Clear local storage draft after successful registration
      localStorage.removeItem(storageKey);
      setSuccessMsg(`${currentRoleConfig.title} registration completed successfully! Redirecting...`);
      await refreshUser();
      if (onRegistrationSuccess) onRegistrationSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Registration submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepComponent = currentRoleConfig.steps[currentStep].Component;

  return (
    <WizardContainer
      roleTitle={currentRoleConfig.title}
      steps={currentRoleConfig.steps}
      currentStep={currentStep}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onSubmit={handleFinalSubmit}
      onResetRole={onResetRole}
      isSubmitting={isSubmitting}
      isValidating={isValidating}
    >
      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
          {successMsg}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        <StepComponent
          register={register}
          errors={errors}
          setValue={setValue}
          formData={allValues}
        />
      </form>
    </WizardContainer>
  );
};
