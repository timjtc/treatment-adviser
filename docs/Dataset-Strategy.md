# Essential Datasets for Prototype - API-First Approach

## 🎯 Core Datasets Required (Minimum Viable)

For a working hackathon prototype, focus on these **5 essential data sources** - all accessible via FREE APIs with legitimate government/institutional backing.

---

## 1. 💊 Drug-Drug Interactions

### **⚠️ IMPORTANT UPDATE: RxNav Interaction API No Longer Available**

The RxNav Interaction API has been **discontinued** as of December 2025. It is no longer listed on the official RxNav APIs page and returns 404 errors.

**Official Documentation:** https://lhncbc.nlm.nih.gov/RxNav/APIs/index.html (Interaction API removed)

---

### **Recommended Source: OpenFDA Drug Labels API**

**Provider:** U.S. Food & Drug Administration (Government)  
**Official URL:** https://open.fda.gov/apis/drug/label/  
**Documentation:** https://open.fda.gov/apis/drug/label/explore/  

**Why Use This:**
- ✅ Official FDA-approved drug labels
- ✅ FREE (1,000 requests/day without key, 120,000/day with free key)
- ✅ Contains `drug_interactions` field with interaction information
- ✅ JSON format, easy to parse
- ✅ Comprehensive coverage of FDA-approved drugs

**API Endpoints:**

```bash
# Get drug label with interaction information
GET https://api.fda.gov/drug/label.json?search=openfda.generic_name:"warfarin"&limit=1

# Search for specific interaction mention
GET https://api.fda.gov/drug/label.json?search=drug_interactions:"aspirin"&limit=5
```

**Example Response (Simplified):**
```json
{
  "results": [
    {
      "drug_interactions": [
        "Warfarin: Increased bleeding risk when combined with aspirin..."
      ],
      "contraindications": [
        "Do not use in patients with known hypersensitivity..."
      ],
      "warnings": [
        "GI bleeding risk increased with concurrent NSAID use..."
      ]
    }
  ]
}
```

**Browser Test:**
```
https://api.fda.gov/drug/label.json?search=openfda.generic_name:"warfarin"&limit=1
```

---

### **Secondary Source: GPT-4 (OpenAI)**

For hackathon purposes, GPT-4 can provide drug interaction checking when OpenFDA data is unavailable.

**Why Use This:**
- ✅ Trained on massive medical literature
- ✅ Can explain interactions in natural language
- ✅ Handles rare drug combinations
- ✅ Fast responses

**Implementation:**
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "You are a medical drug interaction checker. Return JSON only."
    },
    {
      role: "user",
      content: `Check interactions between: ${drugs.join(', ')}`
    }
  ],
  response_format: { type: "json_object" }
});
```

---

### **Safety Net: Hardcoded Critical Interactions**

Create a local JSON file with the most dangerous interactions (Top 50-100):

```json
{
  "critical_interactions": [
    {
      "drug1": "warfarin",
      "drug2": "aspirin",
      "severity": "HIGH",
      "risk": "Severe bleeding",
      "recommendation": "Avoid combination or monitor INR closely"
    }
  ]
}
```

**Implementation Example:**
```typescript
async function checkDrugInteractions(drugNames: string[]) {
  const results = {
    openFDA: [],
    gpt4: [],
    hardcoded: []
  };

  // 1. Check OpenFDA for each drug
  for (const drug of drugNames) {
    const response = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drug}"&limit=1`
    );
    const data = await response.json();
    if (data.results?.[0]?.drug_interactions) {
      results.openFDA.push({
        drug,
        interactions: data.results[0].drug_interactions
      });
    }
  }

  // 2. Check hardcoded critical interactions
  const hardcodedData = await import('./data/critical-interactions.json');
  results.hardcoded = hardcodedData.filter(interaction => 
    drugNames.includes(interaction.drug1) && drugNames.includes(interaction.drug2)
  );

  // 3. Use GPT-4 for comprehensive analysis
  const gptResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a clinical pharmacist. Check drug-drug interactions and return JSON with: {interactions: [{drug1, drug2, severity, mechanism, recommendation}]}"
      },
      {
        role: "user",
        content: `Analyze interactions between: ${drugNames.join(', ')}`
      }
    ],
    response_format: { type: "json_object" }
  });
  results.gpt4 = JSON.parse(gptResponse.choices[0].message.content);

  return results;
}
```

---

## 2. 📋 Drug Labels & Contraindications

### **Primary Source: OpenFDA Drug Labels API**

**Provider:** U.S. Food & Drug Administration (Government)  
**Official URL:** https://open.fda.gov/apis/drug/label/  
**Interactive Explorer:** https://open.fda.gov/apis/drug/label/explore/  
**API Keys:** https://open.fda.gov/apis/authentication/ (optional, increases rate limit)

**Why Use This:**
- ✅ Official FDA-approved drug labels
- ✅ FREE (1,000 requests/day without key, 120,000/day with free key)
- ✅ Contains contraindications, warnings, dosing, pregnancy info
- ✅ JSON format, easy to parse
- ✅ Comprehensive coverage of FDA-approved drugs

**API Endpoints:**

```javascript
// Search drug by brand or generic name
GET https://api.fda.gov/drug/label.json?search=openfda.brand_name:"Lipitor"&limit=1

// Get contraindications section
GET https://api.fda.gov/drug/label.json?search=openfda.generic_name:"atorvastatin"&limit=1

// Search for specific contraindication
GET https://api.fda.gov/drug/label.json?search=contraindications:"pregnancy"&limit=10
```

**Key Fields in Response:**
```json
{
  "results": [
    {
      "openfda": {
        "brand_name": ["Lipitor"],
        "generic_name": ["atorvastatin calcium"],
        "manufacturer_name": ["Pfizer"]
      },
      "contraindications": [
        "Active liver disease",
        "Unexplained persistent elevations of serum transaminases",
        "Pregnancy",
        "Nursing mothers"
      ],
      "warnings": ["Myopathy and rhabdomyolysis..."],
      "dosage_and_administration": ["The patient should be placed on a standard cholesterol-lowering diet..."],
      "drug_interactions": ["CYP3A4 Inhibitors..."],
      "pregnancy": ["Pregnancy Category X..."],
      "pediatric_use": ["Safety and effectiveness in pediatric patients..."],
      "geriatric_use": ["Treatment of geriatric patients..."]
    }
  ]
}
```

**Implementation Example:**
```typescript
async function getContraindications(drugName: string) {
  const response = await fetch(
    `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drugName}"+openfda.generic_name:"${drugName}"&limit=1`
  );
  const data = await response.json();
  
  return {
    contraindications: data.results?.[0]?.contraindications || [],
    warnings: data.results?.[0]?.warnings || [],
    pregnancy: data.results?.[0]?.pregnancy || [],
    drugInteractions: data.results?.[0]?.drug_interactions || []
  };
}
```

---

## 3. 💉 Drug Dosing Information

### **Primary Source: OpenFDA Drug Labels API (Same as above)**

**Official URL:** https://open.fda.gov/apis/drug/label/

**Why Use This:**
- ✅ Official dosing guidelines from FDA labels
- ✅ Contains age-specific dosing (pediatric, geriatric)
- ✅ Weight-based dosing information
- ✅ Renal/hepatic adjustment information

**API Endpoint:**
```javascript
// Get dosing information
GET https://api.fda.gov/drug/label.json?search=openfda.generic_name:"metformin"&limit=1
```

**Key Fields:**
```json
{
  "results": [
    {
      "dosage_and_administration": [
        "The usual starting dose is 500 mg twice a day or 850 mg once a day...",
        "Maximum recommended dose: 2550 mg/day"
      ],
      "pediatric_use": [
        "Safety and effectiveness in pediatric patients below the age of 10 years have not been established."
      ],
      "geriatric_use": [
        "Metformin is known to be substantially excreted by the kidney..."
      ]
    }
  ]
}
```

### **Secondary Source: RxNorm (for drug properties)**

**Official URL:** https://rxnav.nlm.nih.gov/RxNormAPIs.html

```javascript
// Get drug properties including strength
GET https://rxnav.nlm.nih.gov/REST/rxcui/[rxcui]/properties.json
```

---

## 4. 🚨 Allergy Cross-Reactivity

### **Primary Approach: OpenFDA + Hardcoded Rules**

**Why Mixed Approach:**
- ⚠️ No single free API for cross-reactivity
- ✅ OpenFDA has allergy/hypersensitivity sections in labels
- ✅ Critical patterns can be hardcoded (limited number)

**OpenFDA Allergy Info:**
```javascript
GET https://api.fda.gov/drug/label.json?search=openfda.generic_name:"amoxicillin"&limit=1
// Check "contraindications" and "warnings" for allergy mentions
```

**Hardcoded Cross-Reactivity Rules (JSON):**

```json
{
  "allergyGroups": [
    {
      "allergen": "Penicillin",
      "crossReactive": [
        "Amoxicillin",
        "Ampicillin",
        "Penicillin G",
        "Penicillin V"
      ],
      "cautionWith": [
        "Cephalosporins (10% cross-reactivity)",
        "Carbapenems (1% cross-reactivity)"
      ],
      "severity": "HIGH",
      "mechanism": "Beta-lactam ring structure similarity"
    },
    {
      "allergen": "Sulfa drugs",
      "crossReactive": [
        "Sulfamethoxazole",
        "Sulfasalazine",
        "Sulfadiazine"
      ],
      "cautionWith": [
        "Furosemide",
        "Hydrochlorothiazide",
        "Celecoxib"
      ],
      "severity": "MODERATE",
      "mechanism": "Sulfonamide moiety"
    },
    {
      "allergen": "NSAIDs",
      "crossReactive": [
        "Ibuprofen",
        "Naproxen",
        "Diclofenac",
        "Aspirin"
      ],
      "severity": "MODERATE",
      "mechanism": "COX inhibition"
    },
    {
      "allergen": "Codeine",
      "crossReactive": [
        "Morphine",
        "Hydrocodone",
        "Oxycodone"
      ],
      "severity": "HIGH",
      "mechanism": "Opioid structure similarity"
    }
  ]
}
```

**Store in:** `/data/allergy-cross-reactivity.json`

---

## 5. 📊 Drug Classification & Alternatives

### **Primary Source: RxClass API (NLM - NIH)**

**Official URL:** https://lhncbc.nlm.nih.gov/RxNav/APIs/RxClassAPIs.html  
**Documentation:** https://lhncbc.nlm.nih.gov/RxNav/

**Why Use This:**
- ✅ Get drug classes (e.g., "Beta-blockers", "ACE Inhibitors")
- ✅ Find alternative drugs in same class
- ✅ Essential for suggesting alternatives

**API Endpoints:**

```javascript
// Get drug class for a medication
GET https://rxnav.nlm.nih.gov/REST/rxclass/class/byRxcui.json?rxcui=11289

// Get all drugs in a class
GET https://rxnav.nlm.nih.gov/REST/rxclass/classMembers.json?classId=N0000175654&relaSource=ATC

// Find similar drugs (same class)
GET https://rxnav.nlm.nih.gov/REST/rxclass/classMembersGraph.json?classId=N0000175654
```

---

## 6. 🧬 Pregnancy & Lactation Safety

### **Primary Source: LactMed API (NLM)**

**Official URL:** https://www.ncbi.nlm.nih.gov/books/NBK501922/  
**E-utilities API:** https://www.ncbi.nlm.nih.gov/books/NBK25501/

**Why Use This:**
- ✅ Government source (NIH)
- ✅ Breastfeeding safety data
- ✅ FREE access via E-utilities

**Alternative: OpenFDA (Pregnancy Info)**
```javascript
GET https://api.fda.gov/drug/label.json?search=openfda.generic_name:"metformin"&limit=1
// Check "pregnancy" and "nursing_mothers" fields
```

**Pregnancy Categories (Hardcode if needed):**
```json
{
  "pregnancyRisk": {
    "A": "Controlled studies show no risk",
    "B": "No evidence of risk in humans",
    "C": "Risk cannot be ruled out",
    "D": "Positive evidence of risk",
    "X": "Contraindicated in pregnancy"
  }
}
```

---

## 📦 Summary: Complete API Stack for Prototype

| **Data Need** | **Primary API** | **Official URL** | **Auth Required** | **Rate Limit** |
|---------------|-----------------|------------------|-------------------|----------------|
| **Drug-Drug Interactions** | RxNav Interaction API | https://rxnav.nlm.nih.gov/InteractionAPIs.html | ❌ No | No limit |
| **Contraindications** | OpenFDA Drug Labels | https://open.fda.gov/apis/drug/label/ | ⚠️ Optional | 1,000/day (40,000 with key) |
| **Dosing Information** | OpenFDA Drug Labels | https://open.fda.gov/apis/drug/label/ | ⚠️ Optional | 1,000/day |
| **Drug Names/Identifiers** | RxNorm API | https://rxnav.nlm.nih.gov/RxNormAPIs.html | ❌ No | No limit |
| **Drug Classes** | RxClass API | https://rxnav.nlm.nih.gov/RxClassAPIs.html | ❌ No | No limit |
| **Allergy Cross-Reactivity** | Hardcoded Rules + OpenFDA | N/A | ❌ No | N/A |
| **Pregnancy Safety** | OpenFDA (pregnancy field) | https://open.fda.gov/apis/drug/label/ | ⚠️ Optional | 1,000/day |

---

## 🚀 Quick Start Implementation

### Step 1: Get OpenFDA API Key (Optional but Recommended)

1. Visit: https://open.fda.gov/apis/authentication/
2. Enter email
3. Receive API key instantly
4. Add to `.env.local`:
```bash
OPENFDA_API_KEY=your_key_here
```

### Step 2: Test APIs

```typescript
// Test RxNav Interaction API
const testInteraction = await fetch(
  'https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=207106+152923'
);
console.log(await testInteraction.json());

// Test OpenFDA
const testFDA = await fetch(
  'https://api.fda.gov/drug/label.json?search=openfda.generic_name:"aspirin"&limit=1'
);
console.log(await testFDA.json());
```

### Step 3: Create Data Folder

```
/data
  /allergy-cross-reactivity.json   # Hardcoded rules (30-50 patterns)
  /high-risk-interactions.json     # Top 100 critical interactions
  /geriatric-adjustments.json      # Age-based dosing rules
```

---

## 🎯 Recommended Hybrid Approach

**For Maximum Points:**

1. **Primary Intelligence: LLM (GPT-4)**
   - Use as main reasoning engine
   - Handles complex cases
   - Generates treatment plans

2. **Validation Layer: APIs**
   - RxNav: Verify drug-drug interactions
   - OpenFDA: Cross-check contraindications
   - Flag discrepancies between LLM and API

3. **Fallback: Hardcoded Rules**
   - 30-50 critical interactions (warfarin, MAOIs, etc.)
   - Allergy cross-reactivity patterns
   - Always-check safety rules

**Benefits:**
- ✅ Shows technical depth (multiple data sources)
- ✅ Demonstrates validation (don't blindly trust LLM)
- ✅ Works offline (hardcoded rules as backup)
- ✅ Bonus points for "database integration"

---

## 💡 Implementation Priority

### **Must Have (Core Prototype):**
1. ✅ RxNav Interaction API integration
2. ✅ OpenFDA for contraindications
3. ✅ Hardcoded allergy cross-reactivity (30 patterns)

### **Should Have (Bonus Points):**
4. ✅ OpenFDA API key setup
5. ✅ RxClass for drug alternatives
6. ✅ Hardcoded high-risk interactions

### **Nice to Have (Extra Credit):**
7. ✅ Pregnancy safety from OpenFDA
8. ✅ Multiple API cross-validation
9. ✅ Caching layer for API responses

---

## 📝 Code Template: API Integration Service

```typescript
// lib/medical-apis.ts

export class MedicalDataService {
  private fdaBaseUrl = 'https://api.fda.gov/drug/label.json';
  private rxNavBaseUrl = 'https://rxnav.nlm.nih.gov/REST';

  async getDrugInteractions(drugNames: string[]) {
    // Implementation from above
  }

  async getContraindications(drugName: string) {
    const response = await fetch(
      `${this.fdaBaseUrl}?search=openfda.brand_name:"${drugName}"+openfda.generic_name:"${drugName}"&limit=1`
    );
    return response.json();
  }

  async checkAllergyCrossReactivity(allergen: string) {
    // Load from local JSON file
    const rules = await import('@/data/allergy-cross-reactivity.json');
    return rules.allergyGroups.find(g => g.allergen === allergen);
  }

  async findAlternativeDrugs(drugName: string, drugClass: string) {
    // Use RxClass API
  }
}
```

---

## 🔗 Official Documentation Links

### Government APIs (100% Legitimate):
- **RxNav APIs:** https://lhncbc.nlm.nih.gov/RxNav/APIs/
- **OpenFDA:** https://open.fda.gov/apis/
- **NLM E-utilities:** https://www.ncbi.nlm.nih.gov/books/NBK25501/

### Reference Sites (For Hardcoded Rules):
- **FDA Drug Safety:** https://www.fda.gov/drugs/drug-safety-and-availability
- **CDC Clinical Guidelines:** https://www.cdc.gov/
- **UpToDate (requires subscription):** https://www.uptodate.com/

---

## ✅ Final Checklist

Before starting development:
- [ ] Test RxNav Interaction API (no auth needed)
- [ ] Test OpenFDA Drug Labels API
- [ ] Register for OpenFDA API key (instant, free)
- [ ] Create `/data/allergy-cross-reactivity.json`
- [ ] Create `/data/high-risk-interactions.json` (backup data)
- [ ] Add API error handling (rate limits, timeouts)
- [ ] Implement caching (avoid repeated calls for same drug)

**You're now ready to build with real medical data! 🏥💻**
