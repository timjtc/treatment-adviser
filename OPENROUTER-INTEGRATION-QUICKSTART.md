# 🏥 OpenRouter Integration - Quick Start Guide

## ✅ Integration Complete!

The OpenRouter LLM integration with **closed-loop system** is fully implemented and ready to use.

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify Environment Variables
Check `.env.local` has:
```bash
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## 📁 What Was Created

### New Files
- ✅ `lib/medical-data-service.ts` - FDA/RxNorm API integration
- ✅ `app/api/analyze/route.ts` - Treatment analysis endpoint
- ✅ `scripts/test-integration.ts` - Integration test script
- ✅ `INTEGRATION-SUMMARY.md` - Complete documentation
- ✅ `OPENROUTER-INTEGRATION-QUICKSTART.md` - This file

### Modified Files
- ✅ `lib/llm.ts` - OpenRouter client configuration
- ✅ `lib/prompts.ts` - Closed-loop system prompt
- ✅ `.env.local` - Environment variables

## 🧪 Test the Integration

### Option 1: Test Medical Data Service
```bash
npx tsx scripts/test-integration.ts
```

This will:
- Test FDA API calls for all demo patients
- Test RxNorm API calls
- Show enriched medication data
- Verify data formatting for LLM

### Option 2: Test Full API Endpoint
Start the dev server:
```bash
npm run dev
```

In another terminal:
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "healthMetrics": {
      "age": 68,
      "weight": 85,
      "weightUnit": "kg"
    },
    "currentMedications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "Once daily"
      }
    ],
    "allergies": [],
    "medicalConditions": [
      {
        "name": "Hypertension",
        "severity": "moderate"
      }
    ],
    "lifestyleFactors": {
      "smokingStatus": "Never smoked",
      "alcoholConsumption": "Occasional",
      "exerciseFrequency": "3-4 times per week"
    },
    "primaryComplaint": {
      "complaint": "High blood pressure readings",
      "severity": "moderate",
      "duration": "3 months",
      "impactOnLife": "Moderate impact"
    }
  }'
```

### Option 3: Use Demo Patients
```typescript
// In your browser console or test file
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // Copy patient data from data/demo-patients.json.ts
  }),
});

const result = await response.json();
console.log(result);
```

## 📊 Demo Patients

Three test cases are available in `data/demo-patients.json.ts`:

### 1. Low-Risk Patient (Sarah Johnson, 32F)
- No current medications
- Minor seasonal allergy
- Simple complaint (insomnia)
- **Expected**: LOW risk score, standard treatment

### 2. Medium-Risk Patient (Michael Chen, 55M)
- 2 medications (Lisinopril, Metformin)
- Conditions: Type 2 Diabetes, Hypertension
- **Expected**: MEDIUM risk, drug interaction checks

### 3. High-Risk Patient (Margaret Thompson, 78F)
- 5+ medications (polypharmacy)
- Multiple chronic conditions
- Penicillin allergy
- **Expected**: HIGH risk, multiple safety flags

## 🔒 Closed-Loop System Verification

To verify the LLM is truly in closed-loop mode:

### Test 1: Unknown Drug
```typescript
// Add a fictional drug to patient data
currentMedications: [
  {
    name: "FictionalDrug9999",
    dosage: "100mg",
    frequency: "Twice daily"
  }
]
```

**Expected**: LLM should respond with:
- "No FDA data available for FictionalDrug9999"
- MEDIUM or HIGH risk flag
- "Recommend physician verification"

### Test 2: Check Reasoning Citations
Look for reasoning like:
- ✅ "According to FDA contraindications section for Lisinopril..."
- ✅ "FDA drug_interactions states that..."
- ❌ "This drug is commonly known to cause..." (NO external knowledge)

### Test 3: Missing FDA Data
Temporarily disable FDA API:
```typescript
// In lib/medical-data-service.ts
// Comment out the FDA API call
// enrichment.fdaData = await fetchFDADrugLabel(med.name);
enrichment.fdaData = null; // Force missing data
```

**Expected**: LLM should state "Limited FDA data available"

## 🏗️ System Architecture

```
┌─────────────────────┐
│  Patient Intake     │
│  (app/intake/)      │
└──────────┬──────────┘
           │ Form Data
           ▼
┌─────────────────────┐
│  POST /api/analyze  │
│  (app/api/analyze/) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Medical Data Service           │
│  (lib/medical-data-service.ts)  │
│                                  │
│  1. Fetch RxNorm (drug IDs)     │
│  2. Fetch OpenFDA (labels)      │
│  3. Build context string        │
└──────────┬──────────────────────┘
           │ Enriched Data
           ▼
┌─────────────────────────────────┐
│  OpenRouter LLM                 │
│  (lib/llm.ts)                   │
│                                  │
│  Model: gemini-2.0-flash-exp    │
│  Mode: CLOSED-LOOP              │
│  Temp: 0.3                      │
└──────────┬──────────────────────┘
           │ JSON Response
           ▼
┌─────────────────────────────────┐
│  Zod Validation                 │
│  (lib/schemas.ts)               │
└──────────┬──────────────────────┘
           │ Validated Plan
           ▼
┌─────────────────────┐
│  Treatment Dashboard│
│  (app/dashboard/)   │
└─────────────────────┘
```

## 🎯 Key Features

### ✅ Real-Time API Data
- **OpenFDA**: Contraindications, interactions, warnings, dosing
- **RxNorm**: Drug normalization and identifiers
- No hardcoded data files

### ✅ Closed-Loop Operation
- LLM only uses patient input + API data
- No external knowledge from training
- All reasoning cites FDA sections

### ✅ Type-Safe
- Full TypeScript types
- Zod schema validation
- Runtime type checking

### ✅ Safety First
- Missing FDA data triggers flags
- High-risk cases recommend specialist
- Conservative dosing approach

### ✅ Free Tier
- OpenRouter free models
- No API costs
- FDA/RxNorm APIs are free

## 📝 Expected API Response

```json
{
  "success": true,
  "treatmentPlan": {
    "treatmentPlan": {
      "medications": [
        {
          "name": "Lisinopril (Prinivil)",
          "genericName": "lisinopril",
          "brandName": "Prinivil",
          "dosage": "10mg",
          "frequency": "Once daily",
          "duration": "Ongoing",
          "specialInstructions": "Take at the same time each day",
          "purpose": "Blood pressure control"
        }
      ],
      "duration": "Ongoing with 3-month follow-up",
      "specialInstructions": "Monitor blood pressure weekly",
      "followUpRecommendations": [
        "Follow-up visit in 3 months",
        "Check kidney function annually"
      ],
      "lifestyleModifications": [
        "Reduce sodium intake to <2300mg/day",
        "Maintain regular exercise routine"
      ]
    },
    "safetyFlags": [
      {
        "severity": "MEDIUM",
        "description": "Elderly patient (>65) requires dose monitoring",
        "affectedMedications": ["Lisinopril"],
        "recommendation": "Start with lowest effective dose",
        "reasoning": "According to FDA geriatric_use section..."
      }
    ],
    "alternativeTreatments": [
      {
        "name": "Amlodipine",
        "description": "Alternative calcium channel blocker",
        "prosAndCons": "May cause less cough than ACE inhibitors"
      }
    ],
    "riskScore": 5.5,
    "reasoning": "Based on FDA data for Lisinopril, patient age of 68 falls within geriatric category. FDA label indicates dose adjustment may be needed..."
  },
  "metadata": {
    "model": "google/gemini-2.0-flash-exp:free",
    "enrichedMedicationsCount": 1,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔧 Troubleshooting

### Issue: TypeScript errors in editor
**Solution**: Run `npm install` - types are installed automatically

### Issue: "Cannot find module 'next/server'"
**Solution**: Run `npm install` to install Next.js dependencies

### Issue: OpenRouter API returns 401
**Solution**: Check `.env.local` has correct `OPENROUTER_API_KEY`

### Issue: No FDA data returned
**Solution**: 
1. Check FDA API status: https://open.fda.gov/apis/status/
2. Try with different drug names (use generic names)
3. Optional: Add `OPENFDA_API_KEY` for higher rate limits

### Issue: RxNorm API slow
**Solution**: Normal - government API can be slow. Consider caching in production.

## 📚 Documentation Files

- `INTEGRATION-SUMMARY.md` - Complete integration details
- `OPENROUTER-INTEGRATION.md` - Original integration guide
- `LLM-INTEGRATION-FLOW.md` - Flow diagram and architecture
- `DATA-COVERAGE-ANALYSIS.md` - FDA/RxNorm coverage analysis
- `Dataset-Strategy.md` - API endpoints and examples

## 🎓 Next Steps

### 1. Frontend Integration
Update your intake form to call the API:
```typescript
const handleSubmit = async (data: PatientIntakeData) => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  // Navigate to dashboard with result
};
```

### 2. Dashboard Display
Show treatment plan with risk-based styling:
```typescript
{result.treatmentPlan.riskScore < 4 && <GreenBanner />}
{result.treatmentPlan.riskScore >= 4 && result.treatmentPlan.riskScore < 7 && <YellowBanner />}
{result.treatmentPlan.riskScore >= 7 && <RedBanner />}
```

### 3. Safety Flag UI
Display prominent warnings for HIGH risk:
```typescript
{result.treatmentPlan.safetyFlags.map(flag => (
  <Alert severity={flag.severity}>
    {flag.description}
  </Alert>
))}
```

### 4. Production Optimization
- Add FDA API response caching (Redis/Memory)
- Rate limiting on `/api/analyze`
- Add OpenFDA API key for 1000 req/min
- Implement request queue for FDA API

## 🆘 Support

If you encounter issues:
1. Check `.env.local` configuration
2. Run `npm install` to ensure dependencies
3. Check OpenRouter activity: https://openrouter.ai/activity
4. Check FDA API status: https://open.fda.gov/apis/status/
5. Review error logs in terminal

## 🎉 You're Ready!

The integration is complete. Start the dev server and test with:
```bash
npm run dev
```

Then navigate to your intake form and submit patient data!

---

**Built for**: BuildAndShip Hackathon  
**Model**: Google Gemini 2.0 Flash (Free)  
**APIs**: OpenFDA + RxNorm (Government, Free)  
**Mode**: Closed-Loop (Data-Only)
