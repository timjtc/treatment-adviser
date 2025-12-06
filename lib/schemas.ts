/**
 * Zod schemas for runtime validation
 */

import { z } from 'zod';

// Patient Intake Schemas
export const medicalConditionSchema = z.object({
  name: z.string().min(1, 'Condition name is required'),
  diagnosedDate: z.string().optional(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
});

export const allergySchema = z.object({
  allergen: z.string().min(1, 'Allergen name is required'),
  reaction: z.string().min(1, 'Reaction description is required'),
  severity: z.enum(['mild', 'moderate', 'severe']),
});

export const currentMedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().optional(),
  purpose: z.string().optional(),
});

export const healthMetricsSchema = z.object({
  age: z.number().min(0).max(150),
  weight: z.number().min(0),
  weightUnit: z.enum(['kg', 'lbs']),
  height: z.number().min(0).optional(),
  heightUnit: z.enum(['cm', 'inches']).optional(),
  bmi: z.number().min(0).optional(),
  bloodPressure: z.object({
    systolic: z.number().min(0),
    diastolic: z.number().min(0),
  }).optional(),
  heartRate: z.number().min(0).optional(),
  bloodGlucose: z.number().min(0).optional(),
});

export const lifestyleFactorsSchema = z.object({
  smokingStatus: z.enum(['never', 'former', 'current']),
  packsPerDay: z.number().min(0).optional(),
  alcoholConsumption: z.enum(['never', 'occasional', 'moderate', 'frequent']),
  drinksPerWeek: z.number().min(0).optional(),
  exerciseFrequency: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']),
  dietType: z.string().optional(),
  sleepHours: z.number().min(0).max(24).optional(),
});

export const primaryComplaintSchema = z.object({
  complaint: z.string().min(1, 'Primary complaint is required'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  duration: z.string().min(1, 'Duration is required'),
  impactOnLife: z.enum(['minimal', 'moderate', 'significant', 'severe']),
  additionalNotes: z.string().optional(),
});

export const patientIntakeSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  medicalConditions: z.array(medicalConditionSchema),
  allergies: z.array(allergySchema),
  pastSurgeries: z.array(z.string()).optional(),
  familyHistory: z.array(z.string()).optional(),
  currentMedications: z.array(currentMedicationSchema),
  healthMetrics: healthMetricsSchema,
  lifestyleFactors: lifestyleFactorsSchema,
  primaryComplaint: primaryComplaintSchema,
  patientId: z.string().optional(),
  submittedAt: z.string().or(z.date()).optional(),
});

// Treatment Plan Schemas
export const medicationSchema = z.object({
  name: z.string(),
  genericName: z.string().optional(),
  brandName: z.string().optional(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  specialInstructions: z.string().optional(),
  purpose: z.string(),
});

export const safetyFlagSchema = z.object({
  severity: z.enum(['critical', 'warning', 'info']),
  type: z.enum(['drug-interaction', 'allergy-conflict', 'contraindication', 'dosage-concern', 'age-related', 'other']),
  title: z.string(),
  description: z.string(),
  affectedMedications: z.array(z.string()).optional(),
  recommendation: z.string().optional(),
});

export const alternativeTreatmentSchema = z.object({
  approach: z.string(),
  medications: z.array(medicationSchema).optional(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  appropriateFor: z.string().optional(),
});

export const treatmentPlanSchema = z.object({
  medications: z.array(medicationSchema),
  duration: z.string(),
  specialInstructions: z.string().optional(),
  followUpRecommendations: z.array(z.string()).optional(),
  lifestyleModifications: z.array(z.string()).optional(),
});

export const treatmentAnalysisResponseSchema = z.object({
  treatmentPlan: treatmentPlanSchema,
  riskScore: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  safetyFlags: z.array(safetyFlagSchema),
  alternatives: z.array(alternativeTreatmentSchema),
  rationale: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  citations: z.array(z.string()).optional(),
  specialistConsultationRequired: z.boolean().optional(),
  monitoringRecommendations: z.array(z.string()).optional(),
});

// Type inference from schemas
export type PatientIntakeInput = z.infer<typeof patientIntakeSchema>;
export type TreatmentAnalysisOutput = z.infer<typeof treatmentAnalysisResponseSchema>;
