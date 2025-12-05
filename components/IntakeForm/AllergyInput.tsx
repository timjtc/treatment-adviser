/**
 * Allergy Input Component
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Allergy } from '@/types/patient';
import { X } from 'lucide-react';

interface AllergyInputProps {
  allergies: Allergy[];
  onChange: (allergies: Allergy[]) => void;
}

export function AllergyInput({ allergies, onChange }: AllergyInputProps) {
  const [currentAllergy, setCurrentAllergy] = useState<Partial<Allergy>>({
    allergen: '',
    reaction: '',
    severity: 'moderate',
  });

  const addAllergy = () => {
    if (currentAllergy.allergen?.trim() && currentAllergy.reaction?.trim()) {
      onChange([...allergies, currentAllergy as Allergy]);
      setCurrentAllergy({ allergen: '', reaction: '', severity: 'moderate' });
    }
  };

  const removeAllergy = (index: number) => {
    onChange(allergies.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="allergen">Allergen</Label>
          <Input
            id="allergen"
            placeholder="e.g., Penicillin, Peanuts"
            value={currentAllergy.allergen || ''}
            onChange={(e) => setCurrentAllergy({ ...currentAllergy, allergen: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="reaction">Reaction</Label>
          <Input
            id="reaction"
            placeholder="e.g., Rash, Difficulty breathing"
            value={currentAllergy.reaction || ''}
            onChange={(e) => setCurrentAllergy({ ...currentAllergy, reaction: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="allergy-severity">Severity</Label>
          <Select
            value={currentAllergy.severity}
            onValueChange={(value: 'mild' | 'moderate' | 'severe') =>
              setCurrentAllergy({ ...currentAllergy, severity: value })
            }
          >
            <SelectTrigger id="allergy-severity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="button" onClick={addAllergy} variant="outline" className="w-full">
        + Add Allergy
      </Button>

      {/* Display added allergies */}
      {allergies.length > 0 && (
        <div className="space-y-2 mt-4">
          {allergies.map((allergy, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
            >
              <div>
                <span className="font-medium">{allergy.allergen}</span>
                <span className="mx-2 text-muted-foreground">→</span>
                <span className="text-sm">{allergy.reaction}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({allergy.severity})
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAllergy(index)}
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
