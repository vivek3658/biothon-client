import { z } from 'zod';

// ==========================================
// 1. PATIENT SCHEMAS
// ==========================================
export const patientStep1Schema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: 'Please select gender' }) })
});

export const patientStep2Schema = z.object({
  phone: z.string().min(10, 'Valid 10-digit phone number required'),
  houseNo: z.string().optional(),
  floorNo: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid 6-digit pincode is required'),
  longitude: z.string().optional(),
  latitude: z.string().optional()
});

export const patientStep3Schema = z.object({
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactRelation: z.string().min(2, 'Relation is required'),
  emergencyContactPhone: z.string().min(10, 'Valid 10-digit emergency contact number required')
});

export const patientStep4Schema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional()
});

export const patientStep5Schema = z.object({
  agreedToConsent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy policy & health data consent'
  })
});

export const patientFullSchema = patientStep1Schema
  .merge(patientStep2Schema)
  .merge(patientStep3Schema)
  .merge(patientStep4Schema)
  .merge(patientStep5Schema);


// ==========================================
// 2. DOCTOR SCHEMAS
// ==========================================
export const doctorStep1Schema = z.object({
  name: z.string().min(2, 'Doctor name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid contact number required'),
  email: z.string().email('Valid email address required')
});

export const doctorStep2Schema = z.object({
  speciality: z.string().min(2, 'Speciality is required'),
  experienceYears: z.string().min(1, 'Years of experience is required'),
  degree: z.string().min(2, 'Medical degree qualification is required')
});

export const doctorStep3Schema = z.object({
  certificateNo: z.string().min(3, 'Medical registration / license number required'),
  issuingCouncil: z.string().min(2, 'Issuing medical council is required'),
  certificateDoc: z.string().url('Valid certificate document URL required').or(z.string().length(0))
});

export const doctorStep4Schema = z.object({
  hospitalAffiliation: z.string().optional(),
  roomNo: z.string().optional(),
  floorNo: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode is required'),
  longitude: z.string().optional(),
  latitude: z.string().optional()
});

export const doctorStep5Schema = z.object({
  agreedToConsent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy policy & medical practitioner consent'
  })
});

export const doctorFullSchema = doctorStep1Schema
  .merge(doctorStep2Schema)
  .merge(doctorStep3Schema)
  .merge(doctorStep4Schema)
  .merge(doctorStep5Schema);


// ==========================================
// 3. CLINIC SCHEMAS
// ==========================================
export const clinicStep1Schema = z.object({
  name: z.string().min(2, 'Clinic name is required'),
  contactNumber: z.string().min(10, 'Official clinic contact number required'),
  email: z.string().email('Clinic email address required'),
  facilityType: z.literal('clinic')
});

export const clinicStep2Schema = z.object({
  organizationCertificateNo: z.string().min(3, 'Clinic license registration number required'),
  organizationCertificateUrl: z.string().url('Valid certificate URL required').or(z.string().length(0)),
  taxId: z.string().optional()
});

export const clinicStep3Schema = z.object({
  buildingNo: z.string().optional(),
  floorNo: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode is required'),
  longitude: z.string().optional(),
  latitude: z.string().optional()
});

export const clinicStep4Schema = z.object({
  workingDays: z.string().min(2, 'Working days (e.g. Mon-Sat) required'),
  openingTime: z.string().min(1, 'Opening time required'),
  closingTime: z.string().min(1, 'Closing time required'),
  emergencyServices: z.boolean().optional()
});

export const clinicStep5Schema = z.object({
  agreedToConsent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy policy & clinic registration consent'
  })
});

export const clinicFullSchema = clinicStep1Schema
  .merge(clinicStep2Schema)
  .merge(clinicStep3Schema)
  .merge(clinicStep4Schema)
  .merge(clinicStep5Schema);


// ==========================================
// 4. HOSPITAL SCHEMAS
// ==========================================
export const hospitalStep1Schema = z.object({
  name: z.string().min(2, 'Hospital name is required'),
  category: z.enum(['General', 'Super Specialty', 'Multi Specialty']),
  contactNumber: z.string().min(10, 'Official contact number required'),
  email: z.string().email('Official hospital email required')
});

export const hospitalStep2Schema = z.object({
  organizationCertificateNo: z.string().min(3, 'Hospital license number required'),
  organizationCertificateUrl: z.string().url('Valid document URL required').or(z.string().length(0)),
  accreditation: z.enum(['NABH', 'JCI', 'State Board', 'None'])
});

export const hospitalStep3Schema = z.object({
  totalBeds: z.string().min(1, 'Total bed capacity is required'),
  icuBeds: z.string().optional(),
  buildingNo: z.string().optional(),
  floorNo: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode is required'),
  longitude: z.string().optional(),
  latitude: z.string().optional()
});

export const hospitalStep4Schema = z.object({
  emergencyLine: z.string().min(10, '24/7 Emergency desk number required'),
  ambulancePhone: z.string().optional(),
  adminContact: z.string().optional()
});

export const hospitalStep5Schema = z.object({
  agreedToConsent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy policy & hospital registration consent'
  })
});

export const hospitalFullSchema = hospitalStep1Schema
  .merge(hospitalStep2Schema)
  .merge(hospitalStep3Schema)
  .merge(hospitalStep4Schema)
  .merge(hospitalStep5Schema);


// ==========================================
// 5. LABORATORY SCHEMAS
// ==========================================
export const labStep1Schema = z.object({
  name: z.string().min(2, 'Laboratory name is required'),
  labCategory: z.enum(['Pathology', 'Radiology', 'Comprehensive']),
  contactNumber: z.string().min(10, 'Official contact number required'),
  email: z.string().email('Official lab email required')
});

export const labStep2Schema = z.object({
  organizationCertificateNo: z.string().min(3, 'NABL / Lab License registration number required'),
  organizationCertificateUrl: z.string().url('Valid document URL required').or(z.string().length(0)),
  pathologistDirector: z.string().min(2, 'Head Pathologist / Medical Director name required')
});

export const labStep3Schema = z.object({
  workingDays: z.string().min(2, 'Working days required'),
  sampleCollectionHours: z.string().min(1, 'Sample collection hours required'),
  reportDispatchHours: z.string().optional()
});

export const labStep4Schema = z.object({
  servicesOffered: z.string().min(2, 'Services offered (e.g. Blood, Urine, X-Ray) required'),
  homeCollectionAvailable: z.boolean().optional(),
  buildingNo: z.string().optional(),
  floorNo: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode is required'),
  longitude: z.string().optional(),
  latitude: z.string().optional()
});

export const labStep5Schema = z.object({
  agreedToConsent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy policy & laboratory registration consent'
  })
});

export const labFullSchema = labStep1Schema
  .merge(labStep2Schema)
  .merge(labStep3Schema)
  .merge(labStep4Schema)
  .merge(labStep5Schema);

// ==========================================
// 6. RECEPTIONIST SCHEMAS
// ==========================================
export const receptionistStep1Schema = z.object({
  name: z.string().min(2, 'Receptionist full name required'),
  phone: z.string().min(10, 'Valid contact number required'),
  email: z.string().email('Valid email address required')
});

export const receptionistStep2Schema = z.object({
  assignedFacilityType: z.enum(['clinic', 'hospital']),
  assignedFacilityName: z.string().min(2, 'Assigned facility name required'),
  employeeCode: z.string().min(2, 'Employee staff code required')
});

export const receptionistStep3Schema = z.object({
  agreedToConsent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy policy & staff consent'
  })
});

export const receptionistFullSchema = receptionistStep1Schema
  .merge(receptionistStep2Schema)
  .merge(receptionistStep3Schema);
