/**
 * Patient intake data types
 */

export interface MedicalCondition {
  name: string;
  diagnosedDate?: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface CurrentMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  purpose?: string;
}

export interface HealthMetrics {
  age: number;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  height?: number;
  heightUnit?: 'cm' | 'inches';
  bmi?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  bloodGlucose?: number;
}

export interface LifestyleFactors {
  smokingStatus: 'never' | 'former' | 'current';
  packsPerDay?: number;
  alcoholConsumption: 'never' | 'occasional' | 'moderate' | 'frequent';
  drinksPerWeek?: number;
  exerciseFrequency: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  dietType?: string;
  sleepHours?: number;
}

export interface PrimaryComplaint {
  complaint: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  impactOnLife: 'minimal' | 'moderate' | 'significant' | 'severe';
  additionalNotes?: string;
}

export interface PatientIntakeData {
  // Medical History
  medicalConditions: MedicalCondition[];
  allergies: Allergy[];
  pastSurgeries?: string[];
  familyHistory?: string[];

  // Current Medications
  currentMedications: CurrentMedication[];

  // Health Metrics
  healthMetrics: HealthMetrics;

  // Lifestyle
  lifestyleFactors: LifestyleFactors;

  // Primary Complaint
  primaryComplaint: PrimaryComplaint;

  // Metadata
  patientId?: string;
  submittedAt?: Date;
}
