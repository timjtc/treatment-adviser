/**
 * Treatment plan and AI response types
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type SafetyFlagSeverity = 'critical' | 'warning' | 'info';

export interface Medication {
  name: string;
  genericName?: string;
  brandName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  specialInstructions?: string;
  purpose: string;
}

export interface SafetyFlag {
  severity: SafetyFlagSeverity;
  type: 'drug-interaction' | 'allergy-conflict' | 'contraindication' | 'dosage-concern' | 'age-related' | 'other';
  title: string;
  description: string;
  affectedMedications?: string[];
  recommendation?: string;
}

export interface AlternativeTreatment {
  approach: string;
  medications?: Medication[];
  pros: string[];
  cons: string[];
  appropriateFor?: string;
}

export interface TreatmentPlan {
  medications: Medication[];
  duration: string;
  specialInstructions?: string;
  followUpRecommendations?: string[];
  lifestyleModifications?: string[];
}

export interface TreatmentAnalysisResponse {
  treatmentPlan: TreatmentPlan;
  riskScore: RiskLevel;
  safetyFlags: SafetyFlag[];
  alternatives: AlternativeTreatment[];
  rationale: string;
  confidence?: number; // 0.0 to 1.0
  citations?: string[];
  specialistConsultationRequired?: boolean;
  monitoringRecommendations?: string[];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
