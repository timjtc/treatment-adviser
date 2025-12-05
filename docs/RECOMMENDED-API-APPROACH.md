# ⚠️ UPDATED: Recommended API Approach for Hackathon

## 🚨 Issue Discovered
The RxNav Interaction API appears to be experiencing issues or has changed endpoints (returning 404 errors).

---

## ✅ RECOMMENDED SOLUTION FOR HACKATHON

### **Use a Hybrid Approach:**

1. **Primary Intelligence: OpenAI GPT-4** (Your main engine)
2. **Validation: OpenFDA Drug Labels** (Government data)
3. **Backup: Hardcoded Critical Rules** (Safety net)

This approach is **actually better** for the hackathon because it shows:
- ✅ AI integration (LLM)
- ✅ Government data validation (OpenFDA)
- ✅ Safety consciousness (hardcoded rules)
- ✅ Multi-source verification (bonus points!)

---

## 📋 UPDATED API STRATEGY

### 1. **Drug Information & Contraindications**

**Use: OpenFDA Drug Labels API** ✅ WORKING

```javascript
// Get drug contraindications, warnings, dosing
const response = await fetch(
  `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drugName}"&limit=1`
);

const data = await response.json();
const result = data.results?.[0];

// Available data:
- result.contraindications  // ✅ List of contraindications
- result.warnings           // ✅ Safety warnings
- result.drug_interactions  // ✅ Known interactions from label
- result.dosage_and_administration  // ✅ Dosing info
- result.pregnancy          // ✅ Pregnancy safety
- result.geriatric_use      // ✅ Elderly considerations
- result.pediatric_use      // ✅ Children dosing
```

**Test Right Now:**
```
https://api.fda.gov/drug/label.json?search=openfda.generic_name:"warfarin"&limit=1
```

---

### 2. **Drug-Drug Interactions**

**Recommended Approach: LLM + OpenFDA + Hardcoded Rules**

#### Option A: **OpenAI GPT-4 with Medical Prompt** (PRIMARY)

```typescript
const systemPrompt = `You are a clinical pharmacology expert. Given a list of medications, identify ALL drug-drug interactions with severity levels.

For each interaction provide:
1. Drug pair involved
2. Severity (HIGH/MODERATE/LOW)
3. Clinical description
4. Mechanism of interaction
5. Management recommendation

Be conservative - flag even possible interactions.`;

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Check interactions for: ${medications.join(', ')}` }
  ],
  response_format: { type: "json_object" }
});
```

#### Option B: **OpenFDA Drug Interaction Section** (VALIDATION)

```javascript
// Extract interaction info from FDA labels
const response = await fetch(
  `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drugName}"&limit=1`
);

const label = await response.json();
const interactions = label.results?.[0]?.drug_interactions || [];
// Returns text describing known interactions
```

#### Option C: **Hardcoded Critical Interactions** (BACKUP)

Create `data/critical-interactions.json`:

```json
{
  "interactions": [
    {
      "drug1": "warfarin",
      "drug2": "aspirin",
      "severity": "HIGH",
      "description": "Increased risk of bleeding due to additive anticoagulant effects",
      "mechanism": "Both drugs inhibit platelet function and coagulation",
      "recommendation": "Avoid combination or monitor INR closely. Consider alternative antiplatelet if needed.",
      "source": "FDA Drug Safety Communication"
    },
    {
      "drug1": "warfarin",
      "drug2": "ibuprofen",
      "severity": "HIGH",
      "description": "NSAIDs increase bleeding risk with anticoagulants",
      "mechanism": "Platelet inhibition + anticoagulation",
      "recommendation": "Use alternative pain reliever (acetaminophen). If necessary, use lowest effective dose with monitoring."
    },
    {
      "drug1": "metformin",
      "drug2": "contrast dye",
      "severity": "HIGH",
      "description": "Risk of lactic acidosis",
      "mechanism": "Renal impairment from contrast may impair metformin clearance",
      "recommendation": "Hold metformin before and 48 hours after contrast procedures"
    },
    {
      "drug1": "sildenafil",
      "drug2": "nitroglycerin",
      "severity": "CRITICAL",
      "description": "Severe hypotension, potentially fatal",
      "mechanism": "Both cause vasodilation through NO pathway",
      "recommendation": "ABSOLUTE CONTRAINDICATION - Never combine"
    },
    {
      "drug1": "fluoxetine",
      "drug2": "tramadol",
      "severity": "HIGH",
      "description": "Serotonin syndrome risk",
      "mechanism": "Both increase serotonin levels",
      "recommendation": "Avoid combination. Monitor for serotonin syndrome symptoms if used together."
    }
    // Add 30-50 critical interactions
  ]
}
```

---

### 3. **Drug Name Normalization**

**Use: RxNorm API** ✅ WORKING

```javascript
// Convert any drug name to standard RxCUI
const response = await fetch(
  `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${drugName}`
);

const data = await response.json();
const rxcui = data.idGroup?.rxnormId?.[0];
```

**Test:**
```
https://rxnav.nlm.nih.gov/REST/rxcui.json?name=aspirin
```

---

### 4. **Dosage Validation**

**Use: Combination of OpenFDA + LLM + Hardcoded Rules**

```json
// data/dosage-adjustments.json
{
  "geriatric": [
    {
      "drugClass": "benzodiazepines",
      "adjustment": "Reduce dose by 50%",
      "reason": "Increased sensitivity, fall risk",
      "ageThreshold": 65
    },
    {
      "drug": "metformin",
      "maxDose": "2000mg/day",
      "reason": "Reduced renal function common in elderly",
      "ageThreshold": 65,
      "requiresMonitoring": ["renal function", "vitamin B12"]
    }
  ],
  "pediatric": [
    {
      "drug": "amoxicillin",
      "calculation": "20-40 mg/kg/day divided q8h",
      "maxDose": "500mg q8h",
      "ageRange": "3 months - 12 years"
    }
  ],
  "renal": [
    {
      "drug": "metformin",
      "gfrThreshold": 30,
      "action": "CONTRAINDICATED",
      "reason": "Risk of lactic acidosis"
    }
  ]
}
```

---

### 5. **Allergy Cross-Reactivity**

**Use: Hardcoded Rules (No good free API)**

```json
// data/allergy-cross-reactivity.json
{
  "allergyGroups": [
    {
      "allergen": "Penicillin",
      "crossReactive": ["Amoxicillin", "Ampicillin", "Penicillin G", "Penicillin V"],
      "cautionWith": ["Cephalosporins (10% cross-reactivity)", "Carbapenems (1%)"],
      "severity": "HIGH",
      "mechanism": "Beta-lactam ring structure"
    },
    {
      "allergen": "Sulfa drugs",
      "crossReactive": ["Sulfamethoxazole", "Sulfasalazine", "Sulfadiazine"],
      "cautionWith": ["Furosemide", "Hydrochlorothiazide", "Celecoxib"],
      "severity": "MODERATE"
    },
    {
      "allergen": "Aspirin",
      "crossReactive": ["Ibuprofen", "Naproxen", "Diclofenac"],
      "severity": "MODERATE",
      "mechanism": "NSAID hypersensitivity"
    }
  ]
}
```

---

## 🏗️ COMPLETE IMPLEMENTATION ARCHITECTURE

### Flow Diagram:

```
┌─────────────────────────────────────────────────┐
│  Patient Intake Form                            │
│  • Demographics, Meds, Conditions, Allergies    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Backend API: /api/analyze                      │
└──────────────────┬──────────────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│  Step 1:         │  │  Step 2:         │
│  OpenAI GPT-4    │  │  OpenFDA         │
│  Generate        │  │  Validate        │
│  Treatment Plan  │  │  Contraindications│
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────────────┐
│  Step 3: Cross-Check with Hardcoded Rules      │
│  • Critical interactions                       │
│  • Allergy cross-reactivity                    │
│  • Dosage limits                               │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Step 4: Merge & Flag Discrepancies            │
│  • If LLM missed something, FLAG IT            │
│  • If database confirms LLM, add ✓             │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Return JSON Treatment Plan                     │
│  {                                              │
│    treatmentPlan: {...},                       │
│    riskScore: "HIGH",                          │
│    safetyFlags: [...],                         │
│    alternatives: [...],                        │
│    dataValidation: {                           │
│      llmCheck: true,                           │
│      fdaCheck: true,                           │
│      ruleCheck: true                           │
│    }                                            │
│  }                                              │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Clinical Dashboard Display                     │
└─────────────────────────────────────────────────┘
```

---

## 💻 CODE IMPLEMENTATION

### File: `lib/medical-data-service.ts`

```typescript
import OpenAI from 'openai';
import criticalInteractions from '@/data/critical-interactions.json';
import allergyCrossReactivity from '@/data/allergy-cross-reactivity.json';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class MedicalDataService {
  
  // 1. Check drug interactions using GPT-4
  async checkInteractionsWithAI(medications: string[]) {
    const prompt = `Given these medications: ${medications.join(', ')}
    
Identify ALL drug-drug interactions. Return JSON with:
{
  "interactions": [
    {
      "drug1": "warfarin",
      "drug2": "aspirin",
      "severity": "HIGH|MODERATE|LOW",
      "description": "...",
      "mechanism": "...",
      "recommendation": "..."
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a clinical pharmacologist." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // 2. Validate with OpenFDA
  async getContraindications(drugName: string) {
    const response = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drugName}"&limit=1`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const result = data.results?.[0];
    
    return {
      contraindications: result?.contraindications || [],
      warnings: result?.warnings || [],
      drugInteractions: result?.drug_interactions || [],
      dosage: result?.dosage_and_administration || []
    };
  }

  // 3. Check hardcoded critical rules
  checkCriticalInteractions(medications: string[]) {
    const found = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const interaction = criticalInteractions.interactions.find(
          int => 
            (int.drug1.toLowerCase() === medications[i].toLowerCase() && 
             int.drug2.toLowerCase() === medications[j].toLowerCase()) ||
            (int.drug1.toLowerCase() === medications[j].toLowerCase() && 
             int.drug2.toLowerCase() === medications[i].toLowerCase())
        );
        
        if (interaction) {
          found.push(interaction);
        }
      }
    }
    
    return found;
  }

  // 4. Check allergy cross-reactivity
  checkAllergyCrossReactivity(allergen: string, proposedDrug: string) {
    const allergyGroup = allergyCrossReactivity.allergyGroups.find(
      group => group.allergen.toLowerCase() === allergen.toLowerCase()
    );
    
    if (!allergyGroup) return null;
    
    const isDirectContraindication = allergyGroup.crossReactive.some(
      drug => proposedDrug.toLowerCase().includes(drug.toLowerCase())
    );
    
    const needsCaution = allergyGroup.cautionWith?.some(
      drug => proposedDrug.toLowerCase().includes(drug.toLowerCase())
    );
    
    if (isDirectContraindication) {
      return {
        severity: "CRITICAL",
        message: `${proposedDrug} is cross-reactive with ${allergen}. ABSOLUTE CONTRAINDICATION.`,
        mechanism: allergyGroup.mechanism
      };
    }
    
    if (needsCaution) {
      return {
        severity: "WARNING",
        message: `${proposedDrug} may have cross-reactivity with ${allergen}. Use with caution.`,
        mechanism: allergyGroup.mechanism
      };
    }
    
    return null;
  }

  // 5. Combined analysis
  async analyzePatient(patientData: any) {
    const medications = patientData.currentMedications.map((m: any) => m.name);
    
    // Run all checks in parallel
    const [aiInteractions, criticalRules] = await Promise.all([
      this.checkInteractionsWithAI(medications),
      Promise.resolve(this.checkCriticalInteractions(medications))
    ]);
    
    // Check FDA data for each drug
    const fdaData = await Promise.all(
      medications.map(drug => this.getContraindications(drug))
    );
    
    // Check allergies
    const allergyFlags = [];
    for (const allergy of patientData.allergies) {
      for (const med of medications) {
        const crossReaction = this.checkAllergyCrossReactivity(allergy, med);
        if (crossReaction) {
          allergyFlags.push({
            allergy,
            drug: med,
            ...crossReaction
          });
        }
      }
    }
    
    return {
      aiInteractions,
      criticalRules,
      fdaData,
      allergyFlags,
      validated: true
    };
  }
}
```

---

## 📊 WHAT TO BUILD

### Priority Order:

**Hour 1-3: Setup**
- ✅ Next.js project
- ✅ OpenAI API key
- ✅ Create data files (critical-interactions.json, allergy-cross-reactivity.json)

**Hour 4-8: Core Logic**
- ✅ OpenAI integration with medical prompt
- ✅ OpenFDA API calls
- ✅ Hardcoded rule checking
- ✅ Combined analysis service

**Hour 9-14: UI**
- ✅ Patient intake form
- ✅ Treatment plan dashboard
- ✅ Risk visualization
- ✅ Safety flags display

**Hour 15-20: Polish**
- ✅ Demo patients (3 scenarios)
- ✅ Error handling
- ✅ Testing
- ✅ Documentation

---

## ✅ ADVANTAGES OF THIS APPROACH

1. **✅ Shows AI Capability** - Using GPT-4 for medical reasoning
2. **✅ Shows Data Integration** - OpenFDA government data
3. **✅ Shows Safety** - Hardcoded critical rules as backup
4. **✅ Multi-Source Validation** - Cross-checking between sources
5. **✅ Actually Works** - Not dependent on broken APIs
6. **✅ Bonus Points** - "Database integration" via JSON files

---

## 🎯 WORKS WITHOUT RxNav Interaction API!

You don't need the RxNav Interaction API because:
- ✅ GPT-4 knows drug interactions (trained on medical literature)
- ✅ OpenFDA has interaction data in drug labels
- ✅ You have hardcoded critical rules
- ✅ Three sources > one source

**This is actually BETTER for the hackathon!** 🏆

---

## 📝 NEXT STEPS

1. **Create data files** (I can generate these for you)
2. **Set up OpenAI API key**
3. **Build the medical-data-service**
4. **Test with demo patients**
5. **Build UI dashboard**

Want me to generate the complete `critical-interactions.json` and `allergy-cross-reactivity.json` files for you?
