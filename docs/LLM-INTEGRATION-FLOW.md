# 🏥 COMPLETE LLM INTEGRATION FLOW - Medical Treatment Plan Assistant

## 📋 Overview: How It All Works

This document explains the **complete end-to-end flow** from patient data collection to structured treatment plan output, including how the LLM integrates with APIs to generate medical recommendations.

---

## 🔄 COMPLETE SYSTEM FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: PATIENT DATA COLLECTION (Frontend Form)                    │
├─────────────────────────────────────────────────────────────────────┤
│ → Medical History                                                   │
│ → Allergies                                                         │
│ → Health Metrics                                                    │
│ → Lifestyle Factors                                                 │
│ → Current Medications                                               │
│ → Primary Complaint                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: PRE-LLM DATA ENRICHMENT (Backend Processing)               │
├─────────────────────────────────────────────────────────────────────┤
│ For EACH medication patient is currently taking:                   │
│   ↓                                                                 │
│   A. Call OpenFDA API → Get drug label data                        │
│      - Contraindications                                            │
│      - Drug interactions (text)                                     │
│      - Warnings                                                     │
│      - Dosage info                                                  │
│      - Pregnancy/lactation info                                     │
│   ↓                                                                 │
│   B. Call RxNorm API → Get drug identifiers & properties           │
│      - RxCUI (unique identifier)                                    │
│      - Generic/brand names                                          │
│      - Drug strength                                                │
│   ↓                                                                 │
│   C. (Optional) Call RxClass API → Get drug classification         │
│      - Therapeutic class (e.g., "Beta-blockers")                    │
│      - Alternative drugs in same class                              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: BUILD COMPREHENSIVE CONTEXT FOR LLM                         │
├─────────────────────────────────────────────────────────────────────┤
│ Combine:                                                            │
│   • Patient form data (from Step 1)                                 │
│   • FDA drug labels (from Step 2A)                                  │
│   • Drug identifiers (from Step 2B)                                 │
│   • Drug classifications (from Step 2C)                             │
│                                                                     │
│ Create enriched patient context object                              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: LLM ANALYSIS (OpenAI GPT-4 with Medical System Prompt)     │
├─────────────────────────────────────────────────────────────────────┤
│ System Prompt contains:                                             │
│   • Clinical pharmacology rules                                     │
│   • Drug interaction checking logic                                 │
│   • Contraindication assessment rules                               │
│   • Dosage calculation guidelines                                   │
│   • Allergy cross-reactivity patterns                               │
│   • Risk scoring methodology                                        │
│                                                                     │
│ User Message contains:                                              │
│   • Complete enriched patient data                                  │
│   • FDA drug labels for current medications                         │
│   • Primary complaint requiring treatment                           │
│                                                                     │
│ LLM Output (JSON Schema):                                           │
│   • Treatment plan with medications                                 │
│   • Risk score (LOW/MEDIUM/HIGH)                                    │
│   • Safety flags (interactions, contraindications)                  │
│   • Alternative treatments                                          │
│   • Clinical rationale                                              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: POST-LLM VALIDATION (Backend Processing)                   │
├─────────────────────────────────────────────────────────────────────┤
│ Validate LLM's JSON output against schema                           │
│ For EACH recommended medication:                                    │
│   ↓                                                                 │
│   A. Call OpenFDA API → Verify drug exists & get official data     │
│   B. Cross-check contraindications against patient conditions       │
│   C. Cross-check allergies against drug components                  │
│   D. Verify dosage is within FDA guidelines                         │
│                                                                     │
│ If issues found → Flag for doctor review                            │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: DISPLAY RESULTS (Frontend Dashboard)                       │
├─────────────────────────────────────────────────────────────────────┤
│ Show:                                                               │
│   1. Risk Score Badge (RED/YELLOW/GREEN)                            │
│   2. Safety Flags Panel (contraindications, interactions)           │
│   3. Treatment Plan Table (medications, dosage, duration)           │
│   4. Alternative Options (collapsible)                              │
│   5. Clinical Rationale (expandable)                                │
│                                                                     │
│ Doctor can: Approve / Modify / Reject                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 DETAILED TECHNICAL IMPLEMENTATION

### **STEP 2: Pre-LLM Data Enrichment**

This is **CRITICAL** - we gather official drug data BEFORE calling the LLM so it has authoritative sources to work with.

#### **Code Example:**

```typescript
// backend/lib/medical-data-service.ts

interface EnrichedPatientData {
  patientInfo: PatientFormData;
  currentMedicationData: MedicationEnrichment[];
  fdaContext: string;
}

interface MedicationEnrichment {
  userInput: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  };
  fdaData: {
    contraindications: string[];
    drug_interactions: string[];
    warnings: string[];
    dosage_and_administration: string[];
    pregnancy: string[];
    adverse_reactions: string[];
  };
  rxnormData: {
    rxcui: string;
    genericName: string;
    brandNames: string[];
  };
  rxclassData: {
    therapeuticClass: string;
    alternativesInClass: string[];
  };
}

async function enrichPatientData(formData: PatientFormData): Promise<EnrichedPatientData> {
  const enrichedMedications: MedicationEnrichment[] = [];
  
  // For EACH current medication the patient is taking
  for (const med of formData.currentMedications) {
    try {
      // 1. Get RxNorm identifier
      const rxnormResponse = await fetch(
        `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(med.name)}`
      );
      const rxnormData = await rxnormResponse.json();
      const rxcui = rxnormData.idGroup?.rxnormId?.[0];
      
      if (!rxcui) {
        console.warn(`Could not find RxCUI for ${med.name}`);
        continue;
      }

      // 2. Get drug properties from RxNorm
      const propsResponse = await fetch(
        `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`
      );
      const propsData = await propsResponse.json();

      // 3. Get FDA drug label (THIS IS THE MOST IMPORTANT)
      const fdaResponse = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${med.name}"+openfda.brand_name:"${med.name}"&limit=1`
      );
      const fdaData = await fdaResponse.json();
      const drugLabel = fdaData.results?.[0] || {};

      // 4. Get drug class and alternatives
      const rxclassResponse = await fetch(
        `https://rxnav.nlm.nih.gov/REST/rxclass/class/byRxcui.json?rxcui=${rxcui}`
      );
      const rxclassData = await rxclassResponse.json();

      // Store enriched data
      enrichedMedications.push({
        userInput: med,
        fdaData: {
          contraindications: drugLabel.contraindications || [],
          drug_interactions: drugLabel.drug_interactions || [],
          warnings: drugLabel.warnings || [],
          dosage_and_administration: drugLabel.dosage_and_administration || [],
          pregnancy: drugLabel.pregnancy || [],
          adverse_reactions: drugLabel.adverse_reactions || []
        },
        rxnormData: {
          rxcui: rxcui,
          genericName: propsData.properties?.name || med.name,
          brandNames: [] // Could be enriched further
        },
        rxclassData: {
          therapeuticClass: rxclassData.rxclassMinConceptList?.rxclassMinConcept?.[0]?.className || 'Unknown',
          alternativesInClass: [] // Could be enriched further
        }
      });

    } catch (error) {
      console.error(`Error enriching medication ${med.name}:`, error);
      // Continue with other medications
    }
  }

  // Build a comprehensive FDA context summary
  const fdaContext = buildFDAContext(enrichedMedications);

  return {
    patientInfo: formData,
    currentMedicationData: enrichedMedications,
    fdaContext: fdaContext
  };
}

function buildFDAContext(medications: MedicationEnrichment[]): string {
  let context = "=== FDA DRUG LABEL DATA FOR CURRENT MEDICATIONS ===\n\n";
  
  for (const med of medications) {
    context += `Drug: ${med.userInput.name}\n`;
    context += `Current Dosage: ${med.userInput.dosage} ${med.userInput.frequency}\n\n`;
    
    if (med.fdaData.contraindications.length > 0) {
      context += `CONTRAINDICATIONS:\n${med.fdaData.contraindications.join('\n')}\n\n`;
    }
    
    if (med.fdaData.drug_interactions.length > 0) {
      context += `DRUG INTERACTIONS:\n${med.fdaData.drug_interactions.join('\n')}\n\n`;
    }
    
    if (med.fdaData.warnings.length > 0) {
      context += `WARNINGS:\n${med.fdaData.warnings.join('\n')}\n\n`;
    }
    
    context += `${'='.repeat(80)}\n\n`;
  }
  
  return context;
}
```

---

### **STEP 4: LLM Integration with Medical System Prompt**

Now we send the enriched data to GPT-4 with a comprehensive medical system prompt.

#### **The Critical System Prompt:**

```typescript
// backend/lib/prompts.ts

export const MEDICAL_SYSTEM_PROMPT = `# ROLE
You are a clinical decision support AI assistant with expertise in:
- Internal medicine
- Clinical pharmacology
- Drug-drug interactions
- Contraindication assessment
- Dosage calculations
- Patient safety

# YOUR TASK
Analyze patient data and generate a safe, evidence-based treatment plan for their primary complaint.

# MEDICAL KNOWLEDGE BASE

## 1. DRUG-DRUG INTERACTION RULES

### High-Severity Interactions (CRITICAL - Never combine):
- Warfarin + NSAIDs → Severe bleeding risk
- Sildenafil + Nitrates → Cardiovascular collapse
- MAOIs + SSRIs → Serotonin syndrome
- Methotrexate + Trimethoprim-sulfamethoxazole → Bone marrow suppression
- Simvastatin + Strong CYP3A4 inhibitors → Rhabdomyolysis

### Moderate-Severity Interactions (Requires monitoring):
- Digoxin + Diuretics → Hypokalemia increases digoxin toxicity
- ACE inhibitors + NSAIDs → Reduced efficacy, kidney injury risk
- Lithium + Thiazides → Lithium toxicity
- Theophylline + Quinolones → Theophylline toxicity

### Assessment Process:
1. Check if patient is currently taking any medications
2. For EACH current medication, check FDA drug_interactions field (provided in context)
3. For proposed new medications, check against ALL current medications
4. Flag ANY potential interaction (even "possible" counts)
5. Assign severity: CRITICAL, HIGH, MODERATE, LOW

## 2. CONTRAINDICATION CHECKING RULES

### Absolute Contraindications (DO NOT PRESCRIBE):
- Drug allergy → Any drug in same class (e.g., Penicillin allergy → avoid all beta-lactams)
- Pregnancy Category X drugs → Pregnant patients
- Beta-blockers → Patients with asthma/COPD
- NSAIDs → Patients with active GI bleeding
- Metformin → Patients with CrCl <30 mL/min (severe kidney disease)

### Relative Contraindications (Use with extreme caution):
- NSAIDs → History of GI ulcers
- Statins → Liver disease
- ACE inhibitors → Bilateral renal artery stenosis

### Allergy Cross-Reactivity Patterns:
- Penicillin allergy → 10% cross-reactivity with Cephalosporins, 1% with Carbapenems
- Sulfa antibiotics → Avoid: Sulfamethoxazole, Sulfasalazine, Sulfadiazine
  - NOTE: Sulfa diuretics (Furosemide, HCTZ) are SAFE (different structure)
- NSAID sensitivity → Avoid all NSAIDs if aspirin-exacerbated respiratory disease
- Codeine allergy → Caution with all opioids (cross-reactivity possible)

### Assessment Process:
1. Check patient's listed conditions against FDA contraindications (provided in context)
2. Check patient's allergies against proposed medications
3. Apply cross-reactivity rules for allergen classes
4. Flag ANY contraindication found

## 3. DOSAGE APPROPRIATENESS RULES

### Age-Based Adjustments:
- **Pediatric (<18 years):** 
  - Use mg/kg dosing when available
  - Check FDA pediatric_use section (provided in context)
  - Many drugs not approved for children
- **Geriatric (>65 years):**
  - Start low, go slow (typically 50% of adult dose initially)
  - Higher risk of adverse effects
  - Check FDA geriatric_use section (provided in context)

### Weight-Based Dosing:
- If patient weight is available and drug has mg/kg dosing:
  - Calculate: (weight in kg) × (mg/kg dose)
  - Verify dose is within FDA maximum limits

### Renal Impairment (if data available):
- Drugs requiring dose reduction in kidney disease:
  - Metformin, Digoxin, Gabapentin, Enoxaparin, many antibiotics
- If patient has kidney disease, reduce dose or avoid

### Hepatic Impairment (if data available):
- Drugs requiring dose reduction in liver disease:
  - Most statins, many psychiatric medications, warfarin

### Assessment Process:
1. Start with FDA-approved dosing (from dosage_and_administration field)
2. Adjust for patient age if needed
3. Adjust for patient weight if mg/kg dosing applies
4. Verify dose does not exceed FDA maximum
5. Flag if dose adjustment needed but insufficient patient data

## 4. RISK SCORING METHODOLOGY

Assign overall risk score based on:

### HIGH RISK (Requires specialist consultation):
- ANY critical drug-drug interaction found
- ANY absolute contraindication found
- Patient on 5+ medications (polypharmacy)
- High-risk patient population (geriatric + multiple comorbidities)
- Proposed medication has Black Box Warning relevant to patient

### MEDIUM RISK (Enhanced monitoring required):
- Moderate drug-drug interactions found
- Relative contraindications present
- Dosage requires adjustment for age/weight/organ function
- Patient has 3-4 concurrent conditions

### LOW RISK (Standard care):
- No significant interactions
- No contraindications
- Standard dosing applies
- Patient has 0-2 stable conditions

## 5. ALTERNATIVE TREATMENT SELECTION

When contraindications or interactions found:
1. Suggest 2-3 alternatives from different drug classes
2. Prioritize drugs with:
   - No interaction with current medications
   - No contraindication for patient's conditions
   - Similar efficacy for primary complaint
3. Include non-pharmacological options when appropriate

# OUTPUT REQUIREMENTS

You MUST return ONLY valid JSON matching this exact schema:

{
  "treatmentPlan": {
    "medications": [
      {
        "name": "Generic drug name",
        "brandName": "Brand name if applicable",
        "dosage": "Amount with unit (e.g., 500mg)",
        "frequency": "How often (e.g., once daily, twice daily)",
        "route": "oral / IV / topical / etc",
        "duration": "How long (e.g., 7 days, ongoing)",
        "instructions": "Special instructions (e.g., take with food)"
      }
    ],
    "nonPharmacological": [
      "Lifestyle modifications or non-drug interventions"
    ]
  },
  "riskScore": "LOW" | "MEDIUM" | "HIGH",
  "safetyFlags": [
    {
      "type": "DRUG_INTERACTION" | "CONTRAINDICATION" | "ALLERGY" | "DOSAGE_CONCERN" | "WARNING",
      "severity": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
      "title": "Brief title (e.g., Warfarin-Aspirin Interaction)",
      "description": "Detailed explanation of the safety concern",
      "affectedMedications": ["Drug A", "Drug B"],
      "recommendation": "Specific action (e.g., Avoid combination, Monitor INR weekly)"
    }
  ],
  "alternatives": [
    {
      "medication": "Alternative drug name",
      "dosage": "Recommended dose",
      "frequency": "How often",
      "rationale": "Why this is a safer alternative",
      "comparisonToRecommended": "Pros/cons vs primary recommendation"
    }
  ],
  "rationale": {
    "primaryComplaint": "What patient came in for",
    "chosenApproach": "Why this treatment plan was selected",
    "dosingRationale": "Why these specific doses (age, weight, etc)",
    "riskAssessment": "Summary of risk factors considered",
    "monitoringRequired": "What to monitor (labs, vitals, symptoms)"
  },
  "confidence": 0.0 to 1.0,
  "requiresSpecialistConsult": true | false,
  "flaggedForReview": {
    "flag": true | false,
    "reason": "Why this case needs extra attention"
  }
}

# SAFETY RULES

1. **ALWAYS flag potential issues** - false positives better than misses
2. **Use HIGH risk score** if ANY critical interaction or contraindication exists
3. **For HIGH risk cases**, set requiresSpecialistConsult: true
4. **Never recommend off-label uses** without explicit disclaimer
5. **Account for lifestyle factors**: 
   - Smoking + cardiovascular disease = higher thrombosis risk
   - Alcohol + hepatotoxic drugs = liver damage risk
   - Alcohol + metronidazole/disulfiram = severe reaction
6. **If insufficient data** to make safe recommendation, flag for review

# ANALYSIS PROCESS

1. **Read patient data carefully**
2. **Review FDA drug labels for current medications** (provided in context)
3. **Identify primary complaint** and appropriate drug classes
4. **Check for interactions** between proposed drugs and current medications
5. **Check for contraindications** based on conditions and allergies
6. **Calculate appropriate dosage** based on age, weight, FDA guidelines
7. **Assign risk score** using methodology above
8. **Generate alternatives** if issues found
9. **Return ONLY valid JSON** - no additional text

Remember: Patient safety is paramount. When in doubt, flag for review.
`;
```

---

### **The LLM API Call:**

```typescript
// backend/lib/llm-service.ts

import OpenAI from 'openai';
import { MEDICAL_SYSTEM_PROMPT } from './prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface TreatmentPlanResponse {
  treatmentPlan: {
    medications: Array<{
      name: string;
      brandName?: string;
      dosage: string;
      frequency: string;
      route: string;
      duration: string;
      instructions: string;
    }>;
    nonPharmacological: string[];
  };
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  safetyFlags: Array<{
    type: 'DRUG_INTERACTION' | 'CONTRAINDICATION' | 'ALLERGY' | 'DOSAGE_CONCERN' | 'WARNING';
    severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    title: string;
    description: string;
    affectedMedications: string[];
    recommendation: string;
  }>;
  alternatives: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    rationale: string;
    comparisonToRecommended: string;
  }>;
  rationale: {
    primaryComplaint: string;
    chosenApproach: string;
    dosingRationale: string;
    riskAssessment: string;
    monitoringRequired: string;
  };
  confidence: number;
  requiresSpecialistConsult: boolean;
  flaggedForReview: {
    flag: boolean;
    reason: string;
  };
}

async function generateTreatmentPlan(
  enrichedData: EnrichedPatientData
): Promise<TreatmentPlanResponse> {
  
  // Build comprehensive user message with all patient data
  const userMessage = buildUserMessage(enrichedData);
  
  // Call GPT-4 with medical system prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview', // or gpt-4o
    messages: [
      {
        role: 'system',
        content: MEDICAL_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: userMessage
      }
    ],
    response_format: { type: 'json_object' }, // CRITICAL: Forces JSON output
    temperature: 0.3, // Lower temperature for more consistent medical reasoning
    max_tokens: 4000
  });
  
  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No response from LLM');
  }
  
  // Parse JSON response
  const treatmentPlan: TreatmentPlanResponse = JSON.parse(content);
  
  // Validate against schema (using Zod or similar)
  // validateTreatmentPlan(treatmentPlan);
  
  return treatmentPlan;
}

function buildUserMessage(enrichedData: EnrichedPatientData): string {
  const { patientInfo, currentMedicationData, fdaContext } = enrichedData;
  
  return `# PATIENT CASE FOR ANALYSIS

## PATIENT DEMOGRAPHICS
- Name: ${patientInfo.medicalHistory.patientName}
- Age: ${patientInfo.healthMetrics.age} years
- Weight: ${patientInfo.healthMetrics.weight} kg
- Height: ${patientInfo.healthMetrics.height} cm
- BMI: ${patientInfo.healthMetrics.bmi}

## MEDICAL HISTORY

### Pre-existing Conditions:
${patientInfo.medicalHistory.conditions.map(c => 
  `- ${c.name} (Severity: ${c.severity})`
).join('\n')}

### Known Allergies:
${patientInfo.medicalHistory.allergies.map(a => 
  `- Allergen: ${a.allergen}
  Reaction: ${a.reaction}
  Severity: ${a.severity}`
).join('\n')}

${patientInfo.medicalHistory.pastSurgeries ? 
  `### Past Surgeries:\n${patientInfo.medicalHistory.pastSurgeries}` : ''}

## HEALTH METRICS
- Blood Pressure: ${patientInfo.healthMetrics.bloodPressure}
- Heart Rate: ${patientInfo.healthMetrics.heartRate} bpm
- Blood Sugar: ${patientInfo.healthMetrics.bloodSugar} mg/dL
- Blood Glucose: ${patientInfo.healthMetrics.bloodGlucose} mg/dL

## LIFESTYLE FACTORS
- Smoking: ${patientInfo.lifestyleFactors.smokingStatus}
- Alcohol: ${patientInfo.lifestyleFactors.alcoholConsumption}
- Exercise: ${patientInfo.lifestyleFactors.exerciseFrequency}
${patientInfo.lifestyleFactors.dietType ? `- Diet: ${patientInfo.lifestyleFactors.dietType}` : ''}
${patientInfo.lifestyleFactors.sleepHours ? `- Sleep: ${patientInfo.lifestyleFactors.sleepHours} hours/night` : ''}

## CURRENT MEDICATIONS
${patientInfo.currentMedications.map(med => 
  `- ${med.name} ${med.dosage}, ${med.frequency}, Duration: ${med.duration}`
).join('\n')}

## PRIMARY COMPLAINT
- Chief Complaint: ${patientInfo.primaryComplaint.chiefComplaint}
- Severity: ${patientInfo.primaryComplaint.severity}
- Duration: ${patientInfo.primaryComplaint.duration}
- Impact on Daily Life: ${patientInfo.primaryComplaint.impactOnDailyLife}
${patientInfo.primaryComplaint.additionalNotes ? 
  `- Additional Notes: ${patientInfo.primaryComplaint.additionalNotes}` : ''}

## FDA DRUG LABEL DATA FOR CURRENT MEDICATIONS

${fdaContext}

---

# YOUR TASK:

Based on the above patient data and FDA drug information:

1. Recommend a treatment plan for the primary complaint: "${patientInfo.primaryComplaint.chiefComplaint}"
2. Check ALL current medications for interactions with proposed treatment
3. Check for contraindications based on patient's conditions and allergies
4. Calculate appropriate dosages based on patient's age (${patientInfo.healthMetrics.age}), weight (${patientInfo.healthMetrics.weight}kg), and FDA guidelines
5. Assign risk score (LOW/MEDIUM/HIGH)
6. Provide alternative treatment options if issues found
7. Explain your clinical reasoning

Return ONLY valid JSON matching the specified schema.
`;
}
```

---

## 📊 HOW EACH OUTPUT COMPONENT IS GENERATED

### **1. Recommended Treatment Plan (medication, dosage, duration)**

**How LLM Generates This:**

1. **Identifies appropriate drug class** for primary complaint:
   - Hair loss → Finasteride, Minoxidil
   - Erectile dysfunction → PDE5 inhibitors (Sildenafil, Tadalafil)
   - Weight loss → GLP-1 agonists, Orlistat, Phentermine

2. **Selects specific medication** based on:
   - Patient's age (avoid certain drugs in elderly)
   - Patient's conditions (diabetes → prefer metformin-compatible drugs)
   - Current medications (avoid interactions)
   - Allergies (avoid cross-reactive drugs)

3. **Calculates dosage**:
   - Uses FDA `dosage_and_administration` field from API data
   - Adjusts for age if geriatric/pediatric
   - Adjusts for weight if mg/kg dosing
   - Example: "Metformin 500mg" for diabetic patient, starting dose

4. **Determines duration**:
   - Acute conditions: 7-14 days (infections)
   - Chronic conditions: Ongoing (hypertension, diabetes)
   - Based on FDA guidelines and medical knowledge

**API Data Used:**
- ✅ OpenFDA `dosage_and_administration` field
- ✅ OpenFDA `pediatric_use` field (if age <18)
- ✅ OpenFDA `geriatric_use` field (if age >65)
- ✅ GPT-4 medical knowledge (drug selection, calculations)

---

### **2. Safety Risk Score (Low / Medium / High)**

**How LLM Generates This:**

Uses the scoring methodology from system prompt:

```typescript
// LLM's internal logic (encoded in system prompt):

let riskScore = 'LOW';

// Check for CRITICAL issues
if (
  foundCriticalDrugInteraction ||
  foundAbsoluteContraindication ||
  currentMedicationsCount >= 5 ||
  (age > 75 && conditions.length >= 3) ||
  proposedDrugHasBlackBoxWarning
) {
  riskScore = 'HIGH';
}
// Check for MODERATE issues
else if (
  foundModerateDrugInteraction ||
  foundRelativeContraindication ||
  needsDoseAdjustment ||
  conditions.length >= 3
) {
  riskScore = 'MEDIUM';
}

return riskScore;
```

**API Data Used:**
- ✅ OpenFDA `drug_interactions` field (checks for interactions)
- ✅ OpenFDA `contraindications` field (checks against patient conditions)
- ✅ OpenFDA `warnings` field (checks for Black Box warnings)
- ✅ Patient form data (age, conditions count, current medications count)
- ✅ GPT-4 reasoning (evaluates severity)

---

### **3. Flagged Contraindications or Drug Interactions**

**How LLM Generates This:**

**Step 1: Check Current Medications vs Proposed Medications**
```typescript
// For each current medication:
for (const currentMed of patientCurrentMeds) {
  // LLM reads FDA drug_interactions field
  const interactions = fdaData[currentMed].drug_interactions;
  
  // Check if proposed medication is mentioned
  if (interactions.includes(proposedMedication)) {
    safetyFlags.push({
      type: 'DRUG_INTERACTION',
      severity: determineSeverity(interactions),
      title: `${currentMed} - ${proposedMedication} Interaction`,
      description: extractDescription(interactions),
      affectedMedications: [currentMed, proposedMedication],
      recommendation: generateRecommendation()
    });
  }
}
```

**Step 2: Check Conditions vs Proposed Medications**
```typescript
// For proposed medication:
const contraindications = fdaData[proposedMed].contraindications;

// Check if patient has any contraindicated condition
for (const condition of patient.conditions) {
  if (contraindications.some(ci => ci.includes(condition.name))) {
    safetyFlags.push({
      type: 'CONTRAINDICATION',
      severity: 'HIGH',
      title: `${proposedMed} contraindicated in ${condition.name}`,
      description: extractDescription(contraindications),
      affectedMedications: [proposedMed],
      recommendation: 'Avoid this medication, use alternative'
    });
  }
}
```

**Step 3: Check Allergies vs Proposed Medications**
```typescript
// Check for cross-reactivity
for (const allergy of patient.allergies) {
  // LLM applies cross-reactivity rules from system prompt
  if (allergy.allergen === 'penicillin' && proposedMed.includes('cephalosporin')) {
    safetyFlags.push({
      type: 'ALLERGY',
      severity: 'MODERATE',
      title: 'Potential cross-reactivity',
      description: '10% cross-reactivity between penicillins and cephalosporins',
      affectedMedications: [proposedMed],
      recommendation: 'Consider alternative antibiotic or monitor closely'
    });
  }
}
```

**API Data Used:**
- ✅ OpenFDA `drug_interactions` field for each current medication
- ✅ OpenFDA `contraindications` field for proposed medications
- ✅ OpenFDA `warnings` field for additional safety info
- ✅ Patient allergies from form data
- ✅ GPT-4 cross-reactivity rules (encoded in system prompt)

---

### **4. Alternative Treatment Options**

**How LLM Generates This:**

**Step 1: Identify why alternatives needed**
```typescript
if (safetyFlags.length > 0) {
  // There's a problem with primary recommendation
  needAlternatives = true;
  problemType = safetyFlags[0].type; // 'DRUG_INTERACTION', 'CONTRAINDICATION', etc.
}
```

**Step 2: Select alternative drug class**
```typescript
// LLM uses medical knowledge to find alternatives
// Example: If Sildenafil contraindicated due to nitrate use

primaryRecommendation = 'Sildenafil (PDE5 inhibitor)';
problemDetected = 'Patient on nitrates - absolute contraindication';

alternatives = [
  {
    medication: 'Alprostadil (intracavernosal injection)',
    dosage: '5-20 mcg',
    frequency: 'As needed before intercourse',
    rationale: 'Different mechanism (vasodilator), no interaction with nitrates',
    comparisonToRecommended: 'More invasive but safer for cardiac patients'
  },
  {
    medication: 'Vacuum erection device (VED)',
    dosage: 'N/A - mechanical device',
    frequency: 'As needed',
    rationale: 'Non-pharmacological option, no drug interactions',
    comparisonToRecommended: 'No medications required, good for patients with multiple comorbidities'
  }
];
```

**Step 3: Use RxClass API for same-class alternatives** (optional enhancement)
```typescript
// Could call RxClass API to find drugs in same therapeutic class
const classMembers = await rxClass.getSameClass(problematicDrugRxCUI);
// Then LLM filters based on patient's contraindications
```

**API Data Used:**
- ⚠️ RxClass API (optional - provides same-class drugs)
- ✅ GPT-4 medical knowledge (knows alternative drug classes)
- ✅ OpenFDA data for alternative medications (verify safety)

---

### **5. Explanation / Rationale for Each Recommendation**

**How LLM Generates This:**

LLM synthesizes all analysis into narrative explanation:

```json
{
  "rationale": {
    "primaryComplaint": "Patient presents with erectile dysfunction",
    
    "chosenApproach": "Recommended Tadalafil 10mg instead of Sildenafil due to patient's concurrent nitrate use (contraindication). Tadalafil has longer half-life (36 hours) which may benefit patient's lifestyle. However, BOTH PDE5 inhibitors are contraindicated with nitrates. Recommended non-pharmacological alternatives instead.",
    
    "dosingRationale": "Patient is 68 years old (geriatric). FDA guidelines recommend starting at lower dose for elderly patients. Weight (75kg) is within normal range. No renal impairment noted, so no dose adjustment required for kidney function.",
    
    "riskAssessment": "HIGH RISK due to: 1) Critical drug interaction (current nitrate use + proposed PDE5 inhibitor = cardiovascular collapse risk), 2) Polypharmacy (patient on 3 cardiac medications), 3) Multiple comorbidities (hypertension, atrial fibrillation, chronic kidney disease), 4) Age >65 with complex medication regimen. REQUIRES CARDIOLOGIST CONSULTATION before starting any ED treatment.",
    
    "monitoringRequired": "If alternative treatment approved: Monitor blood pressure weekly for first month, watch for dizziness/hypotension, assess kidney function (serum creatinine) every 3 months due to CKD. Patient should report any chest pain, severe headache, or vision changes immediately."
  }
}
```

**How it's built:**
1. **Primary Complaint**: Extracted from form data
2. **Chosen Approach**: LLM explains drug selection logic, references interactions/contraindications found
3. **Dosing Rationale**: References patient age, weight, FDA guidelines from API data
4. **Risk Assessment**: Summarizes all safety flags, explains HIGH/MEDIUM/LOW score
5. **Monitoring Required**: Based on FDA adverse reactions, patient conditions, drug class

**API Data Used:**
- ✅ All OpenFDA fields (contraindications, interactions, warnings, dosing)
- ✅ Patient form data (age, weight, conditions, allergies, current meds)
- ✅ GPT-4 synthesis (creates coherent medical narrative)

---

## 🎯 COMPLETE API COMMAND REFERENCE

### **APIs Used and When:**

```typescript
// ============================================
// STEP 2A: For EACH current medication
// ============================================

// 1. Get drug identifier (RxNorm API)
GET https://rxnav.nlm.nih.gov/REST/rxcui.json?name={drugName}
// Returns: RxCUI (unique identifier)
// Used for: Identifying drug for subsequent API calls

// 2. Get drug properties (RxNorm API)
GET https://rxnav.nlm.nih.gov/REST/rxcui/{rxcui}/properties.json
// Returns: Generic name, brand names, strength
// Used for: Normalizing drug names

// 3. Get FDA drug label (OpenFDA API) - MOST IMPORTANT
GET https://api.fda.gov/drug/label.json?search=openfda.generic_name:"{drugName}"&limit=1
// Returns: 
//   - contraindications (array) → Check against patient conditions
//   - drug_interactions (array) → Check against proposed medications
//   - warnings (array) → Identify Black Box warnings
//   - dosage_and_administration (array) → Get approved dosing
//   - pediatric_use (array) → Dosing for age <18
//   - geriatric_use (array) → Dosing for age >65
//   - pregnancy (array) → Pregnancy safety
//   - nursing_mothers (array) → Breastfeeding safety
//   - adverse_reactions (array) → What to monitor
// Used for: ALL safety checking, dosing, contraindications

// 4. Get drug class (RxClass API) - OPTIONAL
GET https://rxnav.nlm.nih.gov/REST/rxclass/class/byRxcui.json?rxcui={rxcui}
// Returns: Therapeutic class (e.g., "Beta-blockers")
// Used for: Finding alternative medications in same class

// ============================================
// STEP 5: For EACH recommended medication
// ============================================

// Repeat steps 1-4 for proposed medications to verify:
// - Drug exists and is FDA-approved
// - Dosage is within FDA guidelines
// - No contraindications for patient's conditions
// - No interactions with current medications

// ============================================
// NOT USED (but could enhance)
// ============================================

// RxClass - Get alternatives in same class
GET https://rxnav.nlm.nih.gov/REST/rxclass/classMembers.json?classId={classId}
// Returns: All drugs in therapeutic class
// Could be used for: Alternative medication suggestions

// FDA FAERS - Adverse event reports
GET https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"{drugName}"
// Returns: Reported adverse events
// Could be used for: Additional safety signals
```

---

## 🔄 COMPLETE DATA FLOW DIAGRAM

```
USER FILLS FORM
    ↓
Frontend sends to Backend API endpoint: POST /api/analyze-patient
    ↓
Backend Step 1: Validate form data
    ↓
Backend Step 2: Enrich patient data
    ├─→ For each current medication:
    │     ├─→ Call RxNorm API (get RxCUI)
    │     ├─→ Call RxNorm Properties API (get drug info)
    │     ├─→ Call OpenFDA API (get FDA label) ← CRITICAL
    │     └─→ Store enriched data
    ↓
Backend Step 3: Build comprehensive context
    ├─→ Combine patient form data
    ├─→ Combine FDA drug labels
    └─→ Format for LLM
    ↓
Backend Step 4: Call OpenAI GPT-4
    ├─→ System Prompt: Medical rules (hardcoded in code)
    ├─→ User Message: Patient data + FDA context
    ├─→ Response Format: JSON schema
    └─→ Receive structured JSON response
    ↓
Backend Step 5: Validate LLM output
    ├─→ Validate JSON schema
    ├─→ For each recommended medication:
    │     ├─→ Call OpenFDA to verify drug exists
    │     └─→ Cross-check dosage against FDA guidelines
    └─→ Flag anomalies
    ↓
Backend Step 6: Return to Frontend
    ↓
Frontend displays treatment plan dashboard
```

---

## ✅ SUMMARY: How Missing Datasets Are Handled

### **What We DON'T Have from APIs:**
❌ Structured drug-drug interaction database with severity scores  
❌ Allergy cross-reactivity lookup tables  
❌ Structured renal/hepatic dose adjustment tables  

### **How We Compensate:**

1. **Drug-Drug Interactions:**
   - ✅ OpenFDA provides text mentions in `drug_interactions` field
   - ✅ GPT-4 applies medical knowledge (trained on medical literature) to interpret text and assign severity
   - ✅ System prompt encodes critical interaction rules

2. **Contraindications:**
   - ✅ OpenFDA provides structured `contraindications` array ← EXCELLENT
   - ✅ GPT-4 matches patient conditions against contraindications

3. **Allergy Cross-Reactivity:**
   - ✅ System prompt encodes major cross-reactivity patterns (Penicillin→Cephalosporin, etc.)
   - ✅ GPT-4 applies these rules during analysis

4. **Dosage Appropriateness:**
   - ✅ OpenFDA provides `dosage_and_administration`, `pediatric_use`, `geriatric_use` fields
   - ✅ GPT-4 performs calculations (age/weight adjustments)

5. **Risk Assessment:**
   - ✅ System prompt encodes risk scoring methodology
   - ✅ GPT-4 applies scoring based on findings

6. **Alternatives:**
   - ✅ GPT-4 medical knowledge (knows alternative drug classes)
   - ⚠️ Could enhance with RxClass API

---

## 🚀 This is a HYBRID approach:
- **Official Data:** OpenFDA, RxNorm (government APIs)
- **Medical Reasoning:** GPT-4 (trained on medical literature)
- **Safety Rules:** Encoded in system prompt

**It works because:**
- GPT-4 has medical knowledge from training data
- OpenFDA provides authoritative verification
- System prompt ensures consistent application of rules
- Structured JSON output ensures reliability

This is **legitimate** and how many production medical AI tools work (Glass Health, Nabla, Epic's AI).

Want me to start building the Next.js application with this architecture?
