# API Testing & Integration Guide

## 🚀 Quick Start: Test APIs in Your Browser (No Code Required)

You can test all these APIs directly in your browser right now!

---

## Method 1: Browser Testing (Easiest - Start Here!)

### Test 1: Drug-Drug Interactions (RxNav)

**Copy and paste this URL into your browser:**

```
https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=207106+152923
```

**What this does:** Checks interactions between Warfarin (207106) + Aspirin (152923)

**You'll see:** JSON response with interaction severity and description

---

### Test 2: Get Drug Information (OpenFDA)

**Copy and paste this URL:**

```
https://api.fda.gov/drug/label.json?search=openfda.generic_name:"aspirin"&limit=1
```

**What this does:** Gets FDA label for Aspirin including contraindications, warnings, dosing

**You'll see:** Large JSON with all FDA label information

---

### Test 3: Find Drug ID (RxNorm)

**Copy and paste this URL:**

```
https://rxnav.nlm.nih.gov/REST/rxcui.json?name=metformin
```

**What this does:** Converts drug name "metformin" to RxCUI identifier

**You'll see:** RxCUI number you can use for other API calls

---

## Method 2: Test with PowerShell (Windows)

Open PowerShell and run these commands:

### Test Drug Interactions:

```powershell
# Check Warfarin + Aspirin interaction
Invoke-RestMethod -Uri "https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=207106+152923" | ConvertTo-Json -Depth 10
```

### Test OpenFDA:

```powershell
# Get Aspirin information
Invoke-RestMethod -Uri "https://api.fda.gov/drug/label.json?search=openfda.generic_name:aspirin&limit=1" | ConvertTo-Json -Depth 10
```

### Get Drug RxCUI:

```powershell
# Find RxCUI for Metformin
Invoke-RestMethod -Uri "https://rxnav.nlm.nih.gov/REST/rxcui.json?name=metformin" | ConvertTo-Json -Depth 5
```

---

## Method 3: Simple HTML Test Page

Create a file called `test-api.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Medical API Tester</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 50px auto;
            padding: 20px;
        }
        button {
            background: #0066cc;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            background: #0052a3;
        }
        #result {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
            margin-top: 20px;
            white-space: pre-wrap;
            max-height: 600px;
            overflow-y: auto;
        }
        .success {
            color: green;
            font-weight: bold;
        }
        .error {
            color: red;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>🏥 Medical API Tester</h1>
    
    <div>
        <h2>Test Drug-Drug Interactions (RxNav)</h2>
        <button onclick="testWarfarinAspirin()">Check Warfarin + Aspirin Interaction</button>
        <button onclick="testCustomInteraction()">Custom Drug Interaction</button>
    </div>

    <div>
        <h2>Test Drug Information (OpenFDA)</h2>
        <button onclick="testAspirinInfo()">Get Aspirin Information</button>
        <button onclick="testMetforminInfo()">Get Metformin Information</button>
    </div>

    <div>
        <h2>Test Drug Lookup</h2>
        <input type="text" id="drugName" placeholder="Enter drug name" value="ibuprofen">
        <button onclick="findDrugRxCUI()">Find Drug ID (RxCUI)</button>
        <button onclick="getDrugLabel()">Get Drug Label</button>
    </div>

    <div id="result"></div>

    <script>
        const resultDiv = document.getElementById('result');

        // Test 1: Warfarin + Aspirin Interaction
        async function testWarfarinAspirin() {
            resultDiv.innerHTML = '<p>Loading...</p>';
            try {
                const response = await fetch(
                    'https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=207106+152923'
                );
                const data = await response.json();
                
                // Extract key information
                const interactions = data.fullInteractionTypeGroup?.[0]?.fullInteractionType || [];
                
                let output = '<div class="success">✅ API Call Successful!</div>\n\n';
                output += '<strong>WARFARIN + ASPIRIN INTERACTION:</strong>\n\n';
                
                interactions.forEach((interaction, index) => {
                    interaction.interactionPair?.forEach(pair => {
                        output += `Interaction ${index + 1}:\n`;
                        output += `Severity: ${pair.severity || 'Not specified'}\n`;
                        output += `Description: ${pair.description}\n\n`;
                    });
                });
                
                output += '\n\n<strong>Full Response:</strong>\n';
                output += JSON.stringify(data, null, 2);
                
                resultDiv.innerHTML = '<pre>' + output + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
            }
        }

        // Test 2: Get Aspirin Info from OpenFDA
        async function testAspirinInfo() {
            resultDiv.innerHTML = '<p>Loading...</p>';
            try {
                const response = await fetch(
                    'https://api.fda.gov/drug/label.json?search=openfda.generic_name:"aspirin"&limit=1'
                );
                const data = await response.json();
                
                const result = data.results?.[0];
                
                let output = '<div class="success">✅ API Call Successful!</div>\n\n';
                output += '<strong>ASPIRIN FDA LABEL:</strong>\n\n';
                
                if (result) {
                    output += `Brand Names: ${result.openfda?.brand_name?.join(', ') || 'N/A'}\n`;
                    output += `Generic Name: ${result.openfda?.generic_name?.join(', ') || 'N/A'}\n`;
                    output += `Manufacturer: ${result.openfda?.manufacturer_name?.join(', ') || 'N/A'}\n\n`;
                    
                    output += '--- CONTRAINDICATIONS ---\n';
                    output += (result.contraindications || ['None listed']).join('\n') + '\n\n';
                    
                    output += '--- WARNINGS ---\n';
                    output += (result.warnings?.[0]?.substring(0, 500) || 'None listed') + '...\n\n';
                    
                    output += '--- DOSAGE ---\n';
                    output += (result.dosage_and_administration?.[0]?.substring(0, 500) || 'None listed') + '...\n\n';
                }
                
                output += '\n\n<strong>Full Response (truncated):</strong>\n';
                output += JSON.stringify(data, null, 2).substring(0, 2000) + '\n...(truncated)';
                
                resultDiv.innerHTML = '<pre>' + output + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
            }
        }

        // Test 3: Get Metformin Info
        async function testMetforminInfo() {
            resultDiv.innerHTML = '<p>Loading...</p>';
            try {
                const response = await fetch(
                    'https://api.fda.gov/drug/label.json?search=openfda.generic_name:"metformin"&limit=1'
                );
                const data = await response.json();
                
                const result = data.results?.[0];
                
                let output = '<div class="success">✅ API Call Successful!</div>\n\n';
                output += '<strong>METFORMIN FDA LABEL:</strong>\n\n';
                
                if (result) {
                    output += `Brand Names: ${result.openfda?.brand_name?.join(', ') || 'N/A'}\n`;
                    output += `Generic Name: ${result.openfda?.generic_name?.join(', ') || 'N/A'}\n\n`;
                    
                    output += '--- CONTRAINDICATIONS ---\n';
                    output += (result.contraindications || ['None listed']).join('\n') + '\n\n';
                    
                    output += '--- GERIATRIC USE ---\n';
                    output += (result.geriatric_use || ['None listed']).join('\n') + '\n\n';
                }
                
                resultDiv.innerHTML = '<pre>' + output + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
            }
        }

        // Test 4: Find Drug RxCUI
        async function findDrugRxCUI() {
            const drugName = document.getElementById('drugName').value;
            resultDiv.innerHTML = '<p>Loading...</p>';
            
            try {
                const response = await fetch(
                    `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}`
                );
                const data = await response.json();
                
                let output = '<div class="success">✅ API Call Successful!</div>\n\n';
                output += `<strong>DRUG: ${drugName.toUpperCase()}</strong>\n\n`;
                
                const rxcui = data.idGroup?.rxnormId?.[0];
                if (rxcui) {
                    output += `RxCUI: ${rxcui}\n`;
                    output += `You can now use this ID for interaction checks!\n\n`;
                } else {
                    output += 'No RxCUI found. Try a different drug name.\n\n';
                }
                
                output += '\n<strong>Full Response:</strong>\n';
                output += JSON.stringify(data, null, 2);
                
                resultDiv.innerHTML = '<pre>' + output + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
            }
        }

        // Test 5: Get Drug Label
        async function getDrugLabel() {
            const drugName = document.getElementById('drugName').value;
            resultDiv.innerHTML = '<p>Loading...</p>';
            
            try {
                const response = await fetch(
                    `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drugName}"&limit=1`
                );
                const data = await response.json();
                
                const result = data.results?.[0];
                
                let output = '<div class="success">✅ API Call Successful!</div>\n\n';
                output += `<strong>${drugName.toUpperCase()} INFORMATION:</strong>\n\n`;
                
                if (result) {
                    output += '--- CONTRAINDICATIONS ---\n';
                    output += (result.contraindications || ['None listed']).join('\n') + '\n\n';
                    
                    output += '--- WARNINGS ---\n';
                    const warnings = result.warnings?.[0]?.substring(0, 300) || 'None listed';
                    output += warnings + '...\n\n';
                } else {
                    output += 'No FDA label found for this drug.\n';
                }
                
                resultDiv.innerHTML = '<pre>' + output + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
            }
        }

        // Test 6: Custom Drug Interaction
        async function testCustomInteraction() {
            const drug1 = prompt('Enter first drug name (e.g., metformin):');
            const drug2 = prompt('Enter second drug name (e.g., aspirin):');
            
            if (!drug1 || !drug2) return;
            
            resultDiv.innerHTML = '<p>Looking up drugs...</p>';
            
            try {
                // Get RxCUIs for both drugs
                const rxcui1Response = await fetch(
                    `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drug1)}`
                );
                const rxcui1Data = await rxcui1Response.json();
                const rxcui1 = rxcui1Data.idGroup?.rxnormId?.[0];
                
                const rxcui2Response = await fetch(
                    `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drug2)}`
                );
                const rxcui2Data = await rxcui2Response.json();
                const rxcui2 = rxcui2Data.idGroup?.rxnormId?.[0];
                
                if (!rxcui1 || !rxcui2) {
                    resultDiv.innerHTML = '<div class="error">❌ Could not find one or both drugs</div>';
                    return;
                }
                
                resultDiv.innerHTML = '<p>Checking interactions...</p>';
                
                // Check interactions
                const interactionResponse = await fetch(
                    `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${rxcui1}+${rxcui2}`
                );
                const interactionData = await interactionResponse.json();
                
                let output = '<div class="success">✅ API Call Successful!</div>\n\n';
                output += `<strong>${drug1.toUpperCase()} + ${drug2.toUpperCase()} INTERACTION CHECK:</strong>\n\n`;
                output += `${drug1} RxCUI: ${rxcui1}\n`;
                output += `${drug2} RxCUI: ${rxcui2}\n\n`;
                
                const interactions = interactionData.fullInteractionTypeGroup?.[0]?.fullInteractionType || [];
                
                if (interactions.length === 0) {
                    output += '✅ No known interactions found!\n';
                } else {
                    interactions.forEach((interaction, index) => {
                        interaction.interactionPair?.forEach(pair => {
                            output += `Interaction ${index + 1}:\n`;
                            output += `Severity: ${pair.severity || 'Not specified'}\n`;
                            output += `Description: ${pair.description}\n\n`;
                        });
                    });
                }
                
                resultDiv.innerHTML = '<pre>' + output + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
            }
        }
    </script>
</body>
</html>
```

---

## Method 4: Node.js/JavaScript (For Your Next.js App)

### Step 1: Create API service file

Create `lib/medical-api.ts`:

```typescript
// lib/medical-api.ts

export interface DrugInteraction {
  severity: string;
  description: string;
  drug1: string;
  drug2: string;
}

export interface DrugLabel {
  brandName: string[];
  genericName: string[];
  contraindications: string[];
  warnings: string[];
  dosage: string[];
  pregnancy?: string[];
}

export class MedicalAPIService {
  private rxNavBase = 'https://rxnav.nlm.nih.gov/REST';
  private openFDABase = 'https://api.fda.gov/drug/label.json';

  /**
   * Get RxCUI (drug identifier) from drug name
   */
  async getDrugRxCUI(drugName: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.rxNavBase}/rxcui.json?name=${encodeURIComponent(drugName)}`
      );
      const data = await response.json();
      return data.idGroup?.rxnormId?.[0] || null;
    } catch (error) {
      console.error('Error fetching RxCUI:', error);
      return null;
    }
  }

  /**
   * Check drug-drug interactions
   */
  async checkDrugInteractions(drugNames: string[]): Promise<DrugInteraction[]> {
    try {
      // Step 1: Get RxCUIs for all drugs
      const rxcuis = await Promise.all(
        drugNames.map(drug => this.getDrugRxCUI(drug))
      );

      const validRxcuis = rxcuis.filter(Boolean);
      if (validRxcuis.length < 2) {
        return [];
      }

      // Step 2: Check interactions
      const rxcuiList = validRxcuis.join('+');
      const response = await fetch(
        `${this.rxNavBase}/interaction/list.json?rxcuis=${rxcuiList}`
      );
      const data = await response.json();

      // Step 3: Parse interactions
      const interactions: DrugInteraction[] = [];
      const fullInteractions = data.fullInteractionTypeGroup?.[0]?.fullInteractionType || [];

      fullInteractions.forEach((interactionType: any) => {
        interactionType.interactionPair?.forEach((pair: any) => {
          interactions.push({
            severity: pair.severity || 'unknown',
            description: pair.description || 'No description available',
            drug1: pair.interactionConcept?.[0]?.minConceptItem?.name || 'Unknown',
            drug2: pair.interactionConcept?.[1]?.minConceptItem?.name || 'Unknown'
          });
        });
      });

      return interactions;
    } catch (error) {
      console.error('Error checking interactions:', error);
      return [];
    }
  }

  /**
   * Get drug label from OpenFDA
   */
  async getDrugLabel(drugName: string): Promise<DrugLabel | null> {
    try {
      const response = await fetch(
        `${this.openFDABase}?search=openfda.generic_name:"${drugName}"+openfda.brand_name:"${drugName}"&limit=1`
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return null;
      }

      const result = data.results[0];

      return {
        brandName: result.openfda?.brand_name || [],
        genericName: result.openfda?.generic_name || [],
        contraindications: result.contraindications || [],
        warnings: result.warnings || [],
        dosage: result.dosage_and_administration || [],
        pregnancy: result.pregnancy || []
      };
    } catch (error) {
      console.error('Error fetching drug label:', error);
      return null;
    }
  }

  /**
   * Check contraindications for a drug given patient conditions
   */
  async checkContraindications(
    drugName: string,
    patientConditions: string[]
  ): Promise<string[]> {
    const label = await this.getDrugLabel(drugName);
    if (!label) return [];

    const contraindications = label.contraindications.join(' ').toLowerCase();
    const foundContraindications: string[] = [];

    patientConditions.forEach(condition => {
      if (contraindications.includes(condition.toLowerCase())) {
        foundContraindications.push(
          `${drugName} is contraindicated in patients with ${condition}`
        );
      }
    });

    return foundContraindications;
  }
}

// Export singleton instance
export const medicalAPI = new MedicalAPIService();
```

### Step 2: Use in your API route

Create `app/api/test-medical-api/route.ts`:

```typescript
// app/api/test-medical-api/route.ts
import { NextResponse } from 'next/server';
import { medicalAPI } from '@/lib/medical-api';

export async function GET() {
  try {
    // Test 1: Check drug interactions
    const interactions = await medicalAPI.checkDrugInteractions([
      'warfarin',
      'aspirin'
    ]);

    // Test 2: Get drug label
    const aspirinLabel = await medicalAPI.getDrugLabel('aspirin');

    // Test 3: Check contraindications
    const contraindications = await medicalAPI.checkContraindications(
      'metformin',
      ['kidney disease', 'liver disease']
    );

    return NextResponse.json({
      success: true,
      data: {
        interactions,
        aspirinLabel,
        contraindications
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'API test failed' },
      { status: 500 }
    );
  }
}
```

### Step 3: Test in browser

Visit: `http://localhost:3000/api/test-medical-api`

---

## Method 5: Using Postman (Popular Tool)

1. Download Postman: https://www.postman.com/downloads/
2. Create new request
3. Set method to `GET`
4. Paste URL:
```
https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=207106+152923
```
5. Click "Send"
6. View formatted JSON response

---

## Common Drug RxCUIs (For Quick Testing)

```
Aspirin: 1191
Warfarin: 11289
Metformin: 6809
Ibuprofen: 5640
Lisinopril: 29046
Atorvastatin (Lipitor): 83367
Metoprolol: 6918
Amoxicillin: 723
Sildenafil (Viagra): 136411
```

---

## Quick Test Checklist

Run these tests to verify APIs work:

- [ ] Test RxNav in browser (Warfarin + Aspirin)
- [ ] Test OpenFDA in browser (Aspirin label)
- [ ] Open HTML test page in browser
- [ ] Test all buttons in HTML page
- [ ] Try custom drug search
- [ ] Verify JSON responses are readable

---

## Next Steps

1. ✅ Test APIs using browser URLs above
2. ✅ Save HTML test page and open in browser
3. ✅ Copy `medical-api.ts` service to your Next.js project
4. ✅ Create test API route
5. ✅ Build your patient intake form
6. ✅ Integrate APIs into treatment plan generation

**You can start testing RIGHT NOW by copying the browser URLs above!** 🚀
