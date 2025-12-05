/**
 * Progress Stepper Component
 */

'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
  description: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={cn(
              'relative',
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''
            )}
          >
            {/* Connector Line */}
            {stepIdx !== steps.length - 1 && (
              <div
                className="absolute top-4 left-4 -ml-px mt-0.5 h-0.5 w-full"
                aria-hidden="true"
              >
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    currentStep > step.id ? 'bg-primary' : 'bg-gray-300'
                  )}
                />
              </div>
            )}

            <div className="group relative flex items-center">
              <span className="flex h-9 items-center">
                <span
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                    currentStep > step.id
                      ? 'border-primary bg-primary'
                      : currentStep === step.id
                      ? 'border-primary bg-white'
                      : 'border-gray-300 bg-white'
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span
                      className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        currentStep === step.id ? 'bg-primary' : 'bg-transparent'
                      )}
                    />
                  )}
                </span>
              </span>
              <span className="ml-4 flex min-w-0 flex-col">
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-300',
                    currentStep >= step.id ? 'text-primary' : 'text-gray-500'
                  )}
                >
                  {step.name}
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">
                  {step.description}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
