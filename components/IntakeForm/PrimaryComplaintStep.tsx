/**
 * Form Step Components - Primary Complaint
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrimaryComplaint } from '@/types/patient';

interface PrimaryComplaintStepProps {
  primaryComplaint: PrimaryComplaint;
  onChange: (complaint: PrimaryComplaint) => void;
}

export function PrimaryComplaintStep({ primaryComplaint, onChange }: PrimaryComplaintStepProps) {
  const updateComplaint = (field: keyof PrimaryComplaint, value: string) => {
    onChange({ ...primaryComplaint, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Primary Complaint</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your main health concern that brings you here today.
        </p>
      </div>

      <div className="space-y-4">
        {/* Complaint */}
        <div>
          <Label htmlFor="complaint">Chief Complaint *</Label>
          <Input
            id="complaint"
            placeholder="e.g., Erectile Dysfunction, Hair Loss, Weight Management"
            value={primaryComplaint.complaint || ''}
            onChange={(e) => updateComplaint('complaint', e.target.value)}
            required
          />
        </div>

        {/* Severity */}
        <div>
          <Label htmlFor="severity">Severity *</Label>
          <Select
            value={primaryComplaint.severity}
            onValueChange={(value: 'mild' | 'moderate' | 'severe') =>
              updateComplaint('severity', value)
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

        {/* Duration */}
        <div>
          <Label htmlFor="duration">Duration *</Label>
          <Input
            id="duration"
            placeholder="e.g., 6 months, 2 years, 3 weeks"
            value={primaryComplaint.duration || ''}
            onChange={(e) => updateComplaint('duration', e.target.value)}
            required
          />
        </div>

        {/* Impact on Life */}
        <div>
          <Label htmlFor="impact">Impact on Daily Life *</Label>
          <Select
            value={primaryComplaint.impactOnLife}
            onValueChange={(value: 'minimal' | 'moderate' | 'significant' | 'severe') =>
              updateComplaint('impactOnLife', value)
            }
          >
            <SelectTrigger id="impact">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="significant">Significant</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Notes */}
        <div>
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information about your symptoms, triggers, or concerns..."
            value={primaryComplaint.additionalNotes || ''}
            onChange={(e) => updateComplaint('additionalNotes', e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
