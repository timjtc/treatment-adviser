/**
 * Form Step Components - Lifestyle Factors
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LifestyleFactors } from '@/types/patient';

interface LifestyleFactorsStepProps {
  lifestyleFactors: LifestyleFactors;
  onChange: (factors: LifestyleFactors) => void;
}

export function LifestyleFactorsStep({ lifestyleFactors, onChange }: LifestyleFactorsStepProps) {
  const updateFactor = (field: keyof LifestyleFactors, value: string | number) => {
    onChange({ ...lifestyleFactors, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Lifestyle Factors</h3>
        <p className="text-sm text-muted-foreground">
          This information helps us understand your overall health and potential medication interactions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Smoking Status */}
        <div>
          <Label htmlFor="smoking">Smoking Status *</Label>
          <Select
            value={lifestyleFactors.smokingStatus}
            onValueChange={(value: 'never' | 'former' | 'current') =>
              updateFactor('smokingStatus', value)
            }
          >
            <SelectTrigger id="smoking">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="former">Former</SelectItem>
              <SelectItem value="current">Current</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Packs Per Day (if current smoker) */}
        {lifestyleFactors.smokingStatus === 'current' && (
          <div>
            <Label htmlFor="packs">Packs Per Day</Label>
            <Input
              id="packs"
              type="number"
              step="0.5"
              placeholder="1"
              value={lifestyleFactors.packsPerDay || ''}
              onChange={(e) => updateFactor('packsPerDay', parseFloat(e.target.value) || 0)}
            />
          </div>
        )}

        {/* Alcohol Consumption */}
        <div>
          <Label htmlFor="alcohol">Alcohol Consumption *</Label>
          <Select
            value={lifestyleFactors.alcoholConsumption}
            onValueChange={(value: 'never' | 'occasional' | 'moderate' | 'frequent') =>
              updateFactor('alcoholConsumption', value)
            }
          >
            <SelectTrigger id="alcohol">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="occasional">Occasional (1-2 drinks/week)</SelectItem>
              <SelectItem value="moderate">Moderate (3-7 drinks/week)</SelectItem>
              <SelectItem value="frequent">Frequent (8+ drinks/week)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Drinks Per Week */}
        {lifestyleFactors.alcoholConsumption !== 'never' && (
          <div>
            <Label htmlFor="drinks">Drinks Per Week</Label>
            <Input
              id="drinks"
              type="number"
              placeholder="2"
              value={lifestyleFactors.drinksPerWeek || ''}
              onChange={(e) => updateFactor('drinksPerWeek', parseInt(e.target.value) || 0)}
            />
          </div>
        )}

        {/* Exercise Frequency */}
        <div>
          <Label htmlFor="exercise">Exercise Frequency *</Label>
          <Select
            value={lifestyleFactors.exerciseFrequency}
            onValueChange={(
              value: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'
            ) => updateFactor('exerciseFrequency', value)}
          >
            <SelectTrigger id="exercise">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
              <SelectItem value="light">Light (1-2 days/week)</SelectItem>
              <SelectItem value="moderate">Moderate (3-4 days/week)</SelectItem>
              <SelectItem value="active">Active (5-6 days/week)</SelectItem>
              <SelectItem value="very-active">Very Active (daily)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Diet Type */}
        <div>
          <Label htmlFor="diet">Diet Type (Optional)</Label>
          <Input
            id="diet"
            placeholder="e.g., Balanced, Vegetarian, Low-carb"
            value={lifestyleFactors.dietType || ''}
            onChange={(e) => updateFactor('dietType', e.target.value)}
          />
        </div>

        {/* Sleep Hours */}
        <div>
          <Label htmlFor="sleep">Sleep Hours (Optional)</Label>
          <Input
            id="sleep"
            type="number"
            step="0.5"
            placeholder="7"
            value={lifestyleFactors.sleepHours || ''}
            onChange={(e) => updateFactor('sleepHours', parseFloat(e.target.value) || undefined)}
          />
          <p className="text-sm text-muted-foreground mt-1">Average hours per night</p>
        </div>
      </div>
    </div>
  );
}
