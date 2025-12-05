/**
 * Patient Intake Page
 */

import { PatientIntakeForm } from '@/components/IntakeForm/PatientIntakeForm';
import { getDemoPatient } from '@/data/demo-patients.json';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface IntakePageProps {
  searchParams: Promise<{ demo?: string }>;
}

export default async function IntakePage({ searchParams }: IntakePageProps) {
  const params = await searchParams;
  // Load demo patient if specified
  const demoPatient = params.demo
    ? getDemoPatient(params.demo as 'low-risk' | 'medium-risk' | 'high-risk')
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Patient Intake Form</h1>
          <p className="mt-2 text-lg text-gray-600">
            Please provide your medical information to receive personalized treatment recommendations.
          </p>
          {demoPatient && (
            <div className="mt-4 p-4 bg-blue-100 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                📋 Demo patient data loaded: {params.demo} scenario
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <PatientIntakeForm initialData={demoPatient} />
      </div>
    </div>
  );
}
