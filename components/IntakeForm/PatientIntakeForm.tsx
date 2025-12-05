/**
 * Main Patient Intake Form Component with Multi-Step Wizard
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressStepper } from './ProgressStepper';
import { MedicalHistoryStep } from './MedicalHistoryStep';
import { CurrentMedicationsStep } from './CurrentMedicationsStep';
import { HealthMetricsStep } from './HealthMetricsStep';
import { LifestyleFactorsStep } from './LifestyleFactorsStep';
import { PrimaryComplaintStep } from './PrimaryComplaintStep';
import { PatientIntakeData, MedicalCondition, Allergy, CurrentMedication } from '@/types/patient';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Medical History', description: 'Conditions & allergies' },
  { id: 2, name: 'Medications', description: 'Current prescriptions' },
  { id: 3, name: 'Health Metrics', description: 'Age, weight, vitals' },
  { id: 4, name: 'Lifestyle', description: 'Habits & activities' },
  { id: 5, name: 'Complaint', description: 'Primary concern' },
];

interface PatientIntakeFormProps {
  initialData?: Partial<PatientIntakeData>;
}

export function PatientIntakeForm({ initialData }: PatientIntakeFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<PatientIntakeData>>({
    medicalConditions: initialData?.medicalConditions || [],
    allergies: initialData?.allergies || [],
    pastSurgeries: initialData?.pastSurgeries || [],
    currentMedications: initialData?.currentMedications || [],
    healthMetrics: initialData?.healthMetrics || {
      age: 0,
      weight: 0,
      weightUnit: 'kg',
      heightUnit: 'cm',
    },
    lifestyleFactors: initialData?.lifestyleFactors || {
      smokingStatus: 'never',
      alcoholConsumption: 'never',
      exerciseFrequency: 'sedentary',
    },
    primaryComplaint: initialData?.primaryComplaint || {
      complaint: '',
      severity: 'moderate',
      duration: '',
      impactOnLife: 'moderate',
    },
  });

  // Separate state for past surgeries textarea
  const [pastSurgeriesText, setPastSurgeriesText] = useState(
    initialData?.pastSurgeries?.join('\n') || ''
  );

  const validateCurrentStep = (): boolean => {
    setError(null);

    switch (currentStep) {
      case 1:
        // Medical history - optional but no validation needed
        return true;

      case 2:
        // Current medications - optional
        return true;

      case 3:
        // Health metrics - age and weight required
        if (!formData.healthMetrics?.age || formData.healthMetrics.age <= 0) {
          setError('Please enter your age');
          return false;
        }
        if (!formData.healthMetrics?.weight || formData.healthMetrics.weight <= 0) {
          setError('Please enter your weight');
          return false;
        }
        return true;

      case 4:
        // Lifestyle factors - all have defaults
        return true;

      case 5:
        // Primary complaint - all fields required
        if (!formData.primaryComplaint?.complaint?.trim()) {
          setError('Please enter your primary complaint');
          return false;
        }
        if (!formData.primaryComplaint?.duration?.trim()) {
          setError('Please enter how long you have experienced this complaint');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Parse past surgeries from textarea
      const pastSurgeries = pastSurgeriesText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const submissionData: PatientIntakeData = {
        ...formData,
        pastSurgeries,
        submittedAt: new Date(),
      } as PatientIntakeData;

      // Submit to API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to analyze patient data');
      }

      const result = await response.json();

      // Store result and navigate to dashboard
      sessionStorage.setItem('treatmentAnalysis', JSON.stringify(result.data));
      sessionStorage.setItem('patientData', JSON.stringify(submissionData));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MedicalHistoryStep
            medicalConditions={formData.medicalConditions || []}
            allergies={formData.allergies || []}
            pastSurgeries={pastSurgeriesText}
            onMedicalConditionsChange={(conditions: MedicalCondition[]) =>
              setFormData({ ...formData, medicalConditions: conditions })
            }
            onAllergiesChange={(allergies: Allergy[]) =>
              setFormData({ ...formData, allergies })
            }
            onPastSurgeriesChange={setPastSurgeriesText}
          />
        );

      case 2:
        return (
          <CurrentMedicationsStep
            medications={formData.currentMedications || []}
            onMedicationsChange={(medications: CurrentMedication[]) =>
              setFormData({ ...formData, currentMedications: medications })
            }
          />
        );

      case 3:
        return (
          <HealthMetricsStep
            healthMetrics={formData.healthMetrics!}
            onChange={(metrics) => setFormData({ ...formData, healthMetrics: metrics })}
          />
        );

      case 4:
        return (
          <LifestyleFactorsStep
            lifestyleFactors={formData.lifestyleFactors!}
            onChange={(factors) => setFormData({ ...formData, lifestyleFactors: factors })}
          />
        );

      case 5:
        return (
          <PrimaryComplaintStep
            primaryComplaint={formData.primaryComplaint!}
            onChange={(complaint) => setFormData({ ...formData, primaryComplaint: complaint })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Progress Stepper */}
      <ProgressStepper steps={STEPS} currentStep={currentStep} />

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep < STEPS.length ? (
          <Button type="button" onClick={handleNext} disabled={isSubmitting}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Submit & Analyze'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
