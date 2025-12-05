/**
 * Home Page - Treatment Plan Assistant
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, Brain, ArrowRight, FlaskConical } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Clinical Decision Support
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Treatment Plan Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform patient intake data into personalized, safety-checked treatment plans.
            Intelligent recommendations with drug interaction checking and contraindication detection.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/intake">
              <Button size="lg" className="text-lg px-8">
                Start Patient Intake
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Advanced LLM technology analyzes patient data to generate evidence-based treatment recommendations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Safety First</CardTitle>
              <CardDescription>
                Automatic detection of drug interactions, contraindications, and allergy conflicts with visual risk scoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Activity className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Comprehensive Data</CardTitle>
              <CardDescription>
                Collects medical history, current medications, health metrics, lifestyle factors, and primary complaints
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Demo Patients Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <FlaskConical className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Try Demo Patients</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the system with pre-configured patient scenarios demonstrating different risk levels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Badge className="w-fit mb-2 bg-green-500">Low Risk</Badge>
              <CardTitle>Healthy Patient</CardTitle>
              <CardDescription>
                35-year-old with no conditions or medications. Seeking treatment for hair loss.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/intake?demo=low-risk">
                <Button variant="outline" className="w-full">
                  Load Demo Patient
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Badge className="w-fit mb-2 bg-yellow-500">Medium Risk</Badge>
              <CardTitle>Diabetic Patient</CardTitle>
              <CardDescription>
                55-year-old with Type 2 Diabetes on Metformin. Seeking ED treatment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/intake?demo=medium-risk">
                <Button variant="outline" className="w-full">
                  Load Demo Patient
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Badge className="w-fit mb-2 bg-red-500">High Risk</Badge>
              <CardTitle>Complex Case</CardTitle>
              <CardDescription>
                68-year-old with AFib, hypertension, CKD on multiple medications including Warfarin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/intake?demo=high-risk">
                <Button variant="outline" className="w-full">
                  Load Demo Patient
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t">
        <p className="text-center text-sm text-gray-500">
          ⚕️ This is a clinical decision support tool. All recommendations should be reviewed by a licensed healthcare professional.
        </p>
      </div>
    </div>
  );
}
