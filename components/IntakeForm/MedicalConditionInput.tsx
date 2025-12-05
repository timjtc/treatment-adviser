/**
 * Medical Condition Input Component
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MedicalCondition } from '@/types/patient';
import { X } from 'lucide-react';

interface MedicalConditionInputProps {
  conditions: MedicalCondition[];
  onChange: (conditions: MedicalCondition[]) => void;
}

export function MedicalConditionInput({ conditions, onChange }: MedicalConditionInputProps) {
  const [currentCondition, setCurrentCondition] = useState<Partial<MedicalCondition>>({
    name: '',
    severity: 'moderate',
  });

  const addCondition = () => {
    if (currentCondition.name?.trim()) {
      onChange([...conditions, currentCondition as MedicalCondition]);
      setCurrentCondition({ name: '', severity: 'moderate' });
    }
  };

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="condition-name">Condition Name</Label>
          <Input
            id="condition-name"
            placeholder="e.g., Type 2 Diabetes, Hypertension"
            value={currentCondition.name || ''}
            onChange={(e) => setCurrentCondition({ ...currentCondition, name: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && addCondition()}
          />
        </div>
        <div>
          <Label htmlFor="severity">Severity</Label>
          <Select
            value={currentCondition.severity}
            onValueChange={(value: 'mild' | 'moderate' | 'severe') =>
              setCurrentCondition({ ...currentCondition, severity: value })
            }
          >
            <SelectTrigger id="severity">
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
      <Button type="button" onClick={addCondition} variant="outline" className="w-full">
        + Add Condition
      </Button>

      {/* Display added conditions */}
      {conditions.length > 0 && (
        <div className="space-y-2 mt-4">
          {conditions.map((condition, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
            >
              <div>
                <span className="font-medium">{condition.name}</span>
                {condition.severity && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({condition.severity})
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCondition(index)}
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
