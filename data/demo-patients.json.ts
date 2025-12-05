/**
 * Demo patient scenarios for testing
 */

import { PatientIntakeData } from '@/types/patient';

export const DEMO_PATIENTS: Record<string, PatientIntakeData> = {
  'low-risk': {
    medicalConditions: [],
    allergies: [],
    pastSurgeries: [],
    familyHistory: [],
    currentMedications: [],
    healthMetrics: {
      age: 35,
      weight: 70,
      weightUnit: 'kg',
      height: 175,
      heightUnit: 'cm',
      bmi: 22.9,
      bloodPressure: {
        systolic: 120,
        diastolic: 80,
      },
      heartRate: 72,
    },
    lifestyleFactors: {
      smokingStatus: 'never',
      alcoholConsumption: 'occasional',
      drinksPerWeek: 2,
      exerciseFrequency: 'moderate',
      dietType: 'balanced',
      sleepHours: 7,
    },
    primaryComplaint: {
      complaint: 'Hair Loss',
      severity: 'moderate',
      duration: '6 months',
      impactOnLife: 'moderate',
      additionalNotes: 'Gradual thinning at crown and temples',
    },
    patientId: 'demo-low-risk',
  },

  'medium-risk': {
    medicalConditions: [
      {
        name: 'Type 2 Diabetes',
        diagnosedDate: '2020-03-15',
        severity: 'moderate',
      },
    ],
    allergies: [],
    pastSurgeries: [],
    familyHistory: ['Cardiovascular disease', 'Type 2 Diabetes'],
    currentMedications: [
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '4 years',
        purpose: 'Blood sugar control',
      },
    ],
    healthMetrics: {
      age: 55,
      weight: 85,
      weightUnit: 'kg',
      height: 172,
      heightUnit: 'cm',
      bmi: 28.7,
      bloodPressure: {
        systolic: 135,
        diastolic: 85,
      },
      heartRate: 78,
      bloodGlucose: 145,
    },
    lifestyleFactors: {
      smokingStatus: 'former',
      packsPerDay: 0,
      alcoholConsumption: 'occasional',
      drinksPerWeek: 3,
      exerciseFrequency: 'light',
      dietType: 'diabetic-friendly',
      sleepHours: 6,
    },
    primaryComplaint: {
      complaint: 'Erectile Dysfunction',
      severity: 'moderate',
      duration: '8 months',
      impactOnLife: 'significant',
      additionalNotes: 'Difficulty maintaining erection, affecting relationship',
    },
    patientId: 'demo-medium-risk',
  },

  'high-risk': {
    medicalConditions: [
      {
        name: 'Hypertension',
        diagnosedDate: '2015-06-20',
        severity: 'moderate',
      },
      {
        name: 'Atrial Fibrillation',
        diagnosedDate: '2018-11-10',
        severity: 'moderate',
      },
      {
        name: 'Chronic Kidney Disease (Stage 3)',
        diagnosedDate: '2019-04-15',
        severity: 'moderate',
      },
    ],
    allergies: [
      {
        allergen: 'Penicillin',
        reaction: 'Severe rash and breathing difficulty',
        severity: 'severe',
      },
      {
        allergen: 'Sulfa drugs',
        reaction: 'Hives and itching',
        severity: 'moderate',
      },
    ],
    pastSurgeries: ['Coronary angioplasty (2017)'],
    familyHistory: ['Heart disease', 'Stroke', 'Kidney disease'],
    currentMedications: [
      {
        name: 'Warfarin',
        dosage: '5mg',
        frequency: 'Once daily',
        duration: '6 years',
        purpose: 'Blood thinner for AFib',
      },
      {
        name: 'Lisinopril',
        dosage: '20mg',
        frequency: 'Once daily',
        duration: '8 years',
        purpose: 'Blood pressure control',
      },
      {
        name: 'Metoprolol',
        dosage: '50mg',
        frequency: 'Twice daily',
        duration: '7 years',
        purpose: 'Heart rate control',
      },
      {
        name: 'Atorvastatin',
        dosage: '40mg',
        frequency: 'Once daily at bedtime',
        duration: '8 years',
        purpose: 'Cholesterol management',
      },
    ],
    healthMetrics: {
      age: 68,
      weight: 82,
      weightUnit: 'kg',
      height: 170,
      heightUnit: 'cm',
      bmi: 28.4,
      bloodPressure: {
        systolic: 145,
        diastolic: 90,
      },
      heartRate: 85,
    },
    lifestyleFactors: {
      smokingStatus: 'current',
      packsPerDay: 0.5,
      alcoholConsumption: 'frequent',
      drinksPerWeek: 10,
      exerciseFrequency: 'sedentary',
      dietType: 'standard',
      sleepHours: 6,
    },
    primaryComplaint: {
      complaint: 'Erectile Dysfunction',
      severity: 'severe',
      duration: '2 years',
      impactOnLife: 'severe',
      additionalNotes:
        'Complete inability to achieve or maintain erection. Patient aware of cardiovascular history.',
    },
    patientId: 'demo-high-risk',
  },
};

export const getDemoPatient = (riskLevel: 'low-risk' | 'medium-risk' | 'high-risk'): PatientIntakeData => {
  return DEMO_PATIENTS[riskLevel];
};
