/**
 * Form Step Components - Current Medications
 */

'use client';

import { MedicationInput } from './MedicationInput';
import { CurrentMedication } from '@/types/patient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface CurrentMedicationsStepProps {
  medications: CurrentMedication[];
  onMedicationsChange: (medications: CurrentMedication[]) => void;
}

export function CurrentMedicationsStep({
  medications,
  onMedicationsChange,
}: CurrentMedicationsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Current Medications</h3>
        <p className="text-sm text-muted-foreground mb-4">
          List all medications you are currently taking, including over-the-counter drugs and supplements.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please include prescription medications, over-the-counter drugs, vitamins, and supplements.
          This helps us check for potential drug interactions.
        </AlertDescription>
      </Alert>

      <MedicationInput medications={medications} onChange={onMedicationsChange} />

      {medications.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No medications added yet. If you're not taking any medications, you can skip to the next step.
        </p>
      )}
    </div>
  );
}
