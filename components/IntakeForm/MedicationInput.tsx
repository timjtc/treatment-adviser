/**
 * Current Medication Input Component
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrentMedication } from '@/types/patient';
import { X } from 'lucide-react';

interface MedicationInputProps {
  medications: CurrentMedication[];
  onChange: (medications: CurrentMedication[]) => void;
}

export function MedicationInput({ medications, onChange }: MedicationInputProps) {
  const [currentMed, setCurrentMed] = useState<Partial<CurrentMedication>>({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
  });

  const addMedication = () => {
    if (currentMed.name?.trim() && currentMed.dosage?.trim() && currentMed.frequency?.trim()) {
      onChange([...medications, currentMed as CurrentMedication]);
      setCurrentMed({ name: '', dosage: '', frequency: '', duration: '' });
    }
  };

  const removeMedication = (index: number) => {
    onChange(medications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="med-name">Medication Name *</Label>
          <Input
            id="med-name"
            placeholder="e.g., Metformin, Lisinopril"
            value={currentMed.name || ''}
            onChange={(e) => setCurrentMed({ ...currentMed, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="dosage">Dosage *</Label>
          <Input
            id="dosage"
            placeholder="e.g., 500mg, 10mg"
            value={currentMed.dosage || ''}
            onChange={(e) => setCurrentMed({ ...currentMed, dosage: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="frequency">Frequency *</Label>
          <Input
            id="frequency"
            placeholder="e.g., Once daily, Twice daily"
            value={currentMed.frequency || ''}
            onChange={(e) => setCurrentMed({ ...currentMed, frequency: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            placeholder="e.g., 2 years"
            value={currentMed.duration || ''}
            onChange={(e) => setCurrentMed({ ...currentMed, duration: e.target.value })}
          />
        </div>
      </div>
      <Button type="button" onClick={addMedication} variant="outline" className="w-full">
        + Add Medication
      </Button>

      {/* Display added medications */}
      {medications.length > 0 && (
        <div className="space-y-2 mt-4">
          {medications.map((med, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium">{med.name}</div>
                <div className="text-sm text-muted-foreground">
                  {med.dosage} • {med.frequency}
                  {med.duration && ` • ${med.duration}`}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMedication(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
