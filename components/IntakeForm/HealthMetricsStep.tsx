/**
 * Form Step Components - Health Metrics
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HealthMetrics } from '@/types/patient';

interface HealthMetricsStepProps {
  healthMetrics: HealthMetrics;
  onChange: (metrics: HealthMetrics) => void;
}

export function HealthMetricsStep({ healthMetrics, onChange }: HealthMetricsStepProps) {
  const updateMetric = (field: keyof HealthMetrics, value: string | number) => {
    onChange({ ...healthMetrics, [field]: value });
  };

  const updateBloodPressure = (field: 'systolic' | 'diastolic', value: string) => {
    const numValue = parseInt(value) || 0;
    onChange({
      ...healthMetrics,
      bloodPressure: {
        ...healthMetrics.bloodPressure,
        systolic: healthMetrics.bloodPressure?.systolic || 0,
        diastolic: healthMetrics.bloodPressure?.diastolic || 0,
        [field]: numValue,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Health Metrics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age */}
        <div>
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            placeholder="35"
            value={healthMetrics.age || ''}
            onChange={(e) => updateMetric('age', parseInt(e.target.value) || 0)}
            required
          />
        </div>

        {/* Weight */}
        <div>
          <Label htmlFor="weight">Weight *</Label>
          <div className="flex gap-2">
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={healthMetrics.weight || ''}
              onChange={(e) => updateMetric('weight', parseFloat(e.target.value) || 0)}
              required
            />
            <Select
              value={healthMetrics.weightUnit}
              onValueChange={(value: 'kg' | 'lbs') => updateMetric('weightUnit', value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Height */}
        <div>
          <Label htmlFor="height">Height (Optional)</Label>
          <div className="flex gap-2">
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={healthMetrics.height || ''}
              onChange={(e) => updateMetric('height', parseFloat(e.target.value) || undefined)}
            />
            <Select
              value={healthMetrics.heightUnit || 'cm'}
              onValueChange={(value: 'cm' | 'inches') => updateMetric('heightUnit', value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="inches">inches</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* BMI */}
        <div>
          <Label htmlFor="bmi">BMI (Optional)</Label>
          <Input
            id="bmi"
            type="number"
            step="0.1"
            placeholder="22.5"
            value={healthMetrics.bmi || ''}
            onChange={(e) => updateMetric('bmi', parseFloat(e.target.value) || undefined)}
          />
        </div>

        {/* Blood Pressure */}
        <div>
          <Label>Blood Pressure (Optional)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="120"
              value={healthMetrics.bloodPressure?.systolic || ''}
              onChange={(e) => updateBloodPressure('systolic', e.target.value)}
            />
            <span className="text-muted-foreground">/</span>
            <Input
              type="number"
              placeholder="80"
              value={healthMetrics.bloodPressure?.diastolic || ''}
              onChange={(e) => updateBloodPressure('diastolic', e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">Systolic / Diastolic</p>
        </div>

        {/* Heart Rate */}
        <div>
          <Label htmlFor="heart-rate">Heart Rate (Optional)</Label>
          <Input
            id="heart-rate"
            type="number"
            placeholder="72"
            value={healthMetrics.heartRate || ''}
            onChange={(e) => updateMetric('heartRate', parseInt(e.target.value) || undefined)}
          />
          <p className="text-sm text-muted-foreground mt-1">Beats per minute</p>
        </div>

        {/* Blood Glucose */}
        <div>
          <Label htmlFor="blood-glucose">Blood Glucose (Optional)</Label>
          <Input
            id="blood-glucose"
            type="number"
            placeholder="100"
            value={healthMetrics.bloodGlucose || ''}
            onChange={(e) => updateMetric('bloodGlucose', parseInt(e.target.value) || undefined)}
          />
          <p className="text-sm text-muted-foreground mt-1">mg/dL</p>
        </div>
      </div>
    </div>
  );
}
