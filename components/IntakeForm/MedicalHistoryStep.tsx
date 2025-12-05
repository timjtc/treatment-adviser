/**
 * Form Step Components - Medical History
 */

'use client';

import { Label } from '@/components/ui/label';
import { MedicalConditionInput } from './MedicalConditionInput';
import { AllergyInput } from './AllergyInput';
import { Textarea } from '@/components/ui/textarea';
import { MedicalCondition, Allergy } from '@/types/patient';

interface MedicalHistoryStepProps {
  medicalConditions: MedicalCondition[];
  allergies: Allergy[];
  pastSurgeries: string;
  onMedicalConditionsChange: (conditions: MedicalCondition[]) => void;
  onAllergiesChange: (allergies: Allergy[]) => void;
  onPastSurgeriesChange: (surgeries: string) => void;
}

export function MedicalHistoryStep({
  medicalConditions,
  allergies,
  pastSurgeries,
  onMedicalConditionsChange,
  onAllergiesChange,
  onPastSurgeriesChange,
}: MedicalHistoryStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Medical Conditions</h3>
        <MedicalConditionInput
          conditions={medicalConditions}
          onChange={onMedicalConditionsChange}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Allergies</h3>
        <AllergyInput allergies={allergies} onChange={onAllergiesChange} />
      </div>

      <div>
        <Label htmlFor="past-surgeries">Past Surgeries (Optional)</Label>
        <Textarea
          id="past-surgeries"
          placeholder="List any past surgeries or major medical events (one per line)"
          value={pastSurgeries}
          onChange={(e) => onPastSurgeriesChange(e.target.value)}
          rows={3}
        />
        <p className="text-sm text-muted-foreground mt-1">
          e.g., Appendectomy (2015), Coronary angioplasty (2020)
        </p>
      </div>
    </div>
  );
}
