import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Stethoscope,
  ClipboardList,
  ShieldAlert,
  Activity,
  UserPlus,
  ArrowRight,
  HeartPulse,
  AlertTriangle,
  Brain,
  CheckCircle2,
} from 'lucide-react';

const recentPatients = [
  { name: 'Demo — High Risk', complaint: 'Erectile Dysfunction', risk: 'HIGH', ts: 'Today 09:20', flags: 4 },
  { name: 'Demo — Medium Risk', complaint: 'Erectile Dysfunction', risk: 'MEDIUM', ts: 'Today 09:05', flags: 2 },
  { name: 'Demo — Low Risk', complaint: 'Hair Loss', risk: 'LOW', ts: 'Today 08:40', flags: 0 },
];

const safetyQueue = [
  { title: 'Warfarin + Sildenafil', severity: 'critical', note: 'Bleeding risk; consult cardiology.' },
  { title: 'Penicillin allergy', severity: 'warning', note: 'Avoid beta-lactams; consider alternatives.' },
  { title: 'CKD Stage 3 dosing', severity: 'warning', note: 'Renally adjust medications.' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Stethoscope className="h-4 w-4" />
              Doctor Workspace
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Treatment Plan Dashboard</h1>
            <p className="text-slate-600">Capture intake, review risks, and finalize recommendations in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/intake">
              <Button variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" /> New patient
              </Button>
            </Link>
            <Link href="/intake">
              <Button className="gap-2">
                Start intake
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Primary grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left column: Intake + tasks */}
          <div className="space-y-6 xl:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ClipboardList className="h-4 w-4" /> Active patient session
                </div>
                <CardTitle className="text-xl">Begin intake while interviewing the patient</CardTitle>
                <CardDescription>
                  Move smoothly through history, meds, vitals, lifestyle, and chief complaint. You can pause and resume anytime.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/intake" className="w-full">
                    <Button size="lg" className="w-full justify-between">
                      Start fresh intake
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/intake?demo=high-risk">
                      <Button variant="outline" className="gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" /> High-risk demo
                      </Button>
                    </Link>
                    <Link href="/intake?demo=medium-risk">
                      <Button variant="outline" className="gap-2">
                        <Activity className="h-4 w-4 text-amber-600" /> Medium demo
                      </Button>
                    </Link>
                    <Link href="/intake?demo=low-risk">
                      <Button variant="outline" className="gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Low demo
                      </Button>
                    </Link>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard label="Pending decisions" value="3" icon={<ClipboardList className="h-4 w-4" />} tone="slate" />
                  <StatCard label="Open safety flags" value="5" icon={<ShieldAlert className="h-4 w-4" />} tone="red" />
                  <StatCard label="Last plan generated" value="12 min ago" icon={<Brain className="h-4 w-4" />} tone="indigo" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Safety flags to review</CardTitle>
                <CardDescription>Prioritize critical interactions and contraindications before approving a plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {safetyQueue.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-3">
                    <Badge variant={item.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {item.severity === 'critical' ? 'Critical' : 'Warning'}
                    </Badge>
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-sm text-slate-600">{item.note}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right column: Recent and vitals */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent analyses</CardTitle>
                <CardDescription>Jump back into the last patients you reviewed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentPatients.map((p) => (
                  <div key={p.name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                    <div>
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-sm text-slate-600">{p.complaint}</div>
                      <div className="text-xs text-slate-500">{p.ts}</div>
                    </div>
                    <Badge className={p.risk === 'HIGH' ? 'bg-red-600' : p.risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-600'}>
                      {p.risk}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick guidelines</CardTitle>
                <CardDescription>At-a-glance reminders while you encode data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <GuidelineItem icon={<ShieldAlert className="h-4 w-4 text-red-600" />} text="Flag any absolute contraindication as HIGH and route to specialist." />
                <GuidelineItem icon={<HeartPulse className="h-4 w-4 text-rose-600" />} text="Adjust dosing for CKD/elderly; start low, go slow." />
                <GuidelineItem icon={<Activity className="h-4 w-4 text-amber-600" />} text="Always reconcile current meds before adding ED or cardiovascular agents." />
                <GuidelineItem icon={<Brain className="h-4 w-4 text-indigo-600" />} text="Ask for lifestyle factors (smoking, alcohol) before finalizing dosing." />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: 'red' | 'indigo' | 'slate';
}) {
  const toneClasses =
    tone === 'red'
      ? 'bg-red-50 text-red-700 border-red-100'
      : tone === 'indigo'
      ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
      : 'bg-slate-50 text-slate-700 border-slate-100';

  return (
    <div className={`flex items-center justify-between rounded-lg border p-3 ${toneClasses}`}>
      <div className="space-y-0.5">
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-xl font-semibold text-slate-900">{value}</div>
      </div>
      <div className="rounded-full bg-white/70 p-2 text-slate-700">{icon}</div>
    </div>
  );
}

function GuidelineItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}
