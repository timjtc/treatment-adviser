/**
 * Medical Data Service
 * Handles enrichment of patient data with FDA and RxNorm APIs
 */

import { PatientIntakeData } from '@/types/patient';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface EnrichedPatientData {
  patientInfo: PatientIntakeData;
  currentMedicationData: MedicationEnrichment[];
  fdaContextSummary: string;
}

export interface MedicationEnrichment {
  userInput: {
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
  };
  fdaData: FDADrugLabel | null;
  rxnormData: RxNormData | null;
  errors: string[];
}

export interface FDADrugLabel {
  contraindications?: string[];
  drug_interactions?: string[];
  warnings?: string[];
  warnings_and_cautions?: string[];
  dosage_and_administration?: string[];
  pregnancy?: string[];
  nursing_mothers?: string[];
  pediatric_use?: string[];
  geriatric_use?: string[];
  adverse_reactions?: string[];
  overdosage?: string[];
  boxed_warning?: string[];
}

export interface RxNormData {
  rxcui: string;
  name: string;
  synonym?: string;
  tty?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Main function to enrich patient data with API calls
 */
export async function enrichPatientData(
  patientData: PatientIntakeData
): Promise<EnrichedPatientData> {
  const enrichedMedications: MedicationEnrichment[] = [];

  // If patient has no current medications, skip enrichment
  if (!patientData.currentMedications || patientData.currentMedications.length === 0) {
    return {
      patientInfo: patientData,
      currentMedicationData: [],
      fdaContextSummary: 'Patient is not currently taking any medications.',
    };
  }

  // Process each medication
  for (const med of patientData.currentMedications) {
    const enrichment: MedicationEnrichment = {
      userInput: {
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
      },
      fdaData: null,
      rxnormData: null,
      errors: [],
    };

    try {
      // Step 1: Get RxNorm data (drug identifier)
      enrichment.rxnormData = await fetchRxNormData(med.name);

      // Step 2: Get FDA drug label data
      enrichment.fdaData = await fetchFDADrugLabel(med.name);
    } catch (error) {
      enrichment.errors.push(
        error instanceof Error ? error.message : 'Unknown error during API call'
      );
      console.error(`Error enriching medication ${med.name}:`, error);
    }

    enrichedMedications.push(enrichment);
  }

  // Build comprehensive FDA context summary
  const fdaContextSummary = buildFDAContextSummary(enrichedMedications);

  return {
    patientInfo: patientData,
    currentMedicationData: enrichedMedications,
    fdaContextSummary,
  };
}

/**
 * Fetch RxNorm data for a medication
 */
async function fetchRxNormData(drugName: string): Promise<RxNormData | null> {
  try {
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`RxNorm API returned ${response.status} for ${drugName}`);
      return null;
    }

    const data = await response.json();
    const rxcui = data.idGroup?.rxnormId?.[0];

    if (!rxcui) {
      console.warn(`No RxCUI found for ${drugName}`);
      return null;
    }

    // Get drug properties
    const propsResponse = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (propsResponse.ok) {
      const propsData = await propsResponse.json();
      return {
        rxcui,
        name: propsData.properties?.name || drugName,
        synonym: propsData.properties?.synonym,
        tty: propsData.properties?.tty,
      };
    }

    return {
      rxcui,
      name: drugName,
    };
  } catch (error) {
    console.error(`RxNorm API error for ${drugName}:`, error);
    return null;
  }
}

/**
 * Fetch FDA drug label data
 */
async function fetchFDADrugLabel(drugName: string): Promise<FDADrugLabel | null> {
  try {
    // Build search query - try both generic and brand names
    const searchQuery = `openfda.generic_name:"${drugName}"+openfda.brand_name:"${drugName}"`;
    
    const url = new URL('https://api.fda.gov/drug/label.json');
    url.searchParams.set('search', searchQuery);
    url.searchParams.set('limit', '1');

    // Add API key if available
    if (process.env.OPENFDA_API_KEY) {
      url.searchParams.set('api_key', process.env.OPENFDA_API_KEY);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`OpenFDA API returned ${response.status} for ${drugName}`);
      return null;
    }

    const data = await response.json();
    const drugLabel = data.results?.[0];

    if (!drugLabel) {
      console.warn(`No FDA label found for ${drugName}`);
      return null;
    }

    // Extract relevant fields
    return {
      contraindications: drugLabel.contraindications || [],
      drug_interactions: drugLabel.drug_interactions || [],
      warnings: drugLabel.warnings || [],
      warnings_and_cautions: drugLabel.warnings_and_cautions || [],
      dosage_and_administration: drugLabel.dosage_and_administration || [],
      pregnancy: drugLabel.pregnancy || [],
      nursing_mothers: drugLabel.nursing_mothers || [],
      pediatric_use: drugLabel.pediatric_use || [],
      geriatric_use: drugLabel.geriatric_use || [],
      adverse_reactions: drugLabel.adverse_reactions || [],
      overdosage: drugLabel.overdosage || [],
      boxed_warning: drugLabel.boxed_warning || [],
    };
  } catch (error) {
    console.error(`OpenFDA API error for ${drugName}:`, error);
    return null;
  }
}

/**
 * Build comprehensive FDA context summary for LLM
 */
function buildFDAContextSummary(medications: MedicationEnrichment[]): string {
  if (medications.length === 0) {
    return 'Patient is not currently taking any medications.';
  }

  let context = '=== FDA DRUG LABEL DATA FOR CURRENT MEDICATIONS ===\n\n';

  for (const med of medications) {
    context += `MEDICATION: ${med.userInput.name}\n`;
    context += `Current Dosage: ${med.userInput.dosage}, ${med.userInput.frequency}\n`;
    
    if (med.userInput.duration) {
      context += `Duration: ${med.userInput.duration}\n`;
    }

    if (med.rxnormData) {
      context += `RxNorm Name: ${med.rxnormData.name}\n`;
      context += `RxCUI: ${med.rxnormData.rxcui}\n`;
    }

    context += '\n';

    if (med.fdaData) {
      // Boxed warnings (most critical)
      if (med.fdaData.boxed_warning && med.fdaData.boxed_warning.length > 0) {
        context += '⚠️  BLACK BOX WARNING:\n';
        med.fdaData.boxed_warning.forEach((warning) => {
          context += `${warning}\n`;
        });
        context += '\n';
      }

      // Contraindications
      if (med.fdaData.contraindications && med.fdaData.contraindications.length > 0) {
        context += 'CONTRAINDICATIONS:\n';
        med.fdaData.contraindications.forEach((contra) => {
          context += `${contra}\n`;
        });
        context += '\n';
      }

      // Drug interactions
      if (med.fdaData.drug_interactions && med.fdaData.drug_interactions.length > 0) {
        context += 'DRUG INTERACTIONS:\n';
        med.fdaData.drug_interactions.forEach((interaction) => {
          context += `${interaction}\n`;
        });
        context += '\n';
      }

      // Warnings
      if (med.fdaData.warnings && med.fdaData.warnings.length > 0) {
        context += 'WARNINGS:\n';
        med.fdaData.warnings.forEach((warning) => {
          context += `${warning}\n`;
        });
        context += '\n';
      }

      // Dosage info
      if (med.fdaData.dosage_and_administration && med.fdaData.dosage_and_administration.length > 0) {
        context += 'DOSAGE AND ADMINISTRATION:\n';
        med.fdaData.dosage_and_administration.forEach((dosage) => {
          context += `${dosage}\n`;
        });
        context += '\n';
      }

      // Pregnancy info
      if (med.fdaData.pregnancy && med.fdaData.pregnancy.length > 0) {
        context += 'PREGNANCY:\n';
        med.fdaData.pregnancy.forEach((preg) => {
          context += `${preg}\n`;
        });
        context += '\n';
      }

      // Pediatric use
      if (med.fdaData.pediatric_use && med.fdaData.pediatric_use.length > 0) {
        context += 'PEDIATRIC USE:\n';
        med.fdaData.pediatric_use.forEach((ped) => {
          context += `${ped}\n`;
        });
        context += '\n';
      }

      // Geriatric use
      if (med.fdaData.geriatric_use && med.fdaData.geriatric_use.length > 0) {
        context += 'GERIATRIC USE:\n';
        med.fdaData.geriatric_use.forEach((ger) => {
          context += `${ger}\n`;
        });
        context += '\n';
      }
    } else if (med.errors.length > 0) {
      context += '⚠️  Could not retrieve FDA data for this medication.\n';
      context += `Errors: ${med.errors.join(', ')}\n\n`;
    } else {
      context += '⚠️  No FDA label data available for this medication.\n\n';
    }

    context += '='.repeat(80) + '\n\n';
  }

  return context;
}

/**
 * Helper to format patient data for LLM prompt
 */
export function formatPatientDataForPrompt(patientData: PatientIntakeData): string {
  let prompt = '=== PATIENT INFORMATION ===\n\n';

  // Health Metrics
  prompt += '## DEMOGRAPHICS & HEALTH METRICS\n';
  prompt += `Age: ${patientData.healthMetrics.age} years\n`;
  prompt += `Weight: ${patientData.healthMetrics.weight} ${patientData.healthMetrics.weightUnit}\n`;
  
  if (patientData.healthMetrics.height) {
    prompt += `Height: ${patientData.healthMetrics.height} ${patientData.healthMetrics.heightUnit}\n`;
  }
  
  if (patientData.healthMetrics.bmi) {
    prompt += `BMI: ${patientData.healthMetrics.bmi}\n`;
  }
  
  if (patientData.healthMetrics.bloodPressure) {
    prompt += `Blood Pressure: ${patientData.healthMetrics.bloodPressure.systolic}/${patientData.healthMetrics.bloodPressure.diastolic} mmHg\n`;
  }
  
  if (patientData.healthMetrics.heartRate) {
    prompt += `Heart Rate: ${patientData.healthMetrics.heartRate} bpm\n`;
  }
  
  if (patientData.healthMetrics.bloodGlucose) {
    prompt += `Blood Glucose: ${patientData.healthMetrics.bloodGlucose} mg/dL\n`;
  }
  
  prompt += '\n';

  // Medical Conditions
  prompt += '## MEDICAL CONDITIONS\n';
  if (patientData.medicalConditions && patientData.medicalConditions.length > 0) {
    patientData.medicalConditions.forEach((condition) => {
      prompt += `- ${condition.name}`;
      if (condition.severity) {
        prompt += ` (Severity: ${condition.severity})`;
      }
      if (condition.diagnosedDate) {
        prompt += ` [Diagnosed: ${condition.diagnosedDate}]`;
      }
      prompt += '\n';
    });
  } else {
    prompt += 'None reported\n';
  }
  prompt += '\n';

  // Allergies
  prompt += '## KNOWN ALLERGIES\n';
  if (patientData.allergies && patientData.allergies.length > 0) {
    patientData.allergies.forEach((allergy) => {
      prompt += `- Allergen: ${allergy.allergen}\n`;
      prompt += `  Reaction: ${allergy.reaction}\n`;
      prompt += `  Severity: ${allergy.severity}\n`;
    });
  } else {
    prompt += 'No known allergies\n';
  }
  prompt += '\n';

  // Past Surgeries
  if (patientData.pastSurgeries && patientData.pastSurgeries.length > 0) {
    prompt += '## PAST SURGERIES\n';
    patientData.pastSurgeries.forEach((surgery) => {
      prompt += `- ${surgery}\n`;
    });
    prompt += '\n';
  }

  // Family History
  if (patientData.familyHistory && patientData.familyHistory.length > 0) {
    prompt += '## FAMILY HISTORY\n';
    patientData.familyHistory.forEach((history) => {
      prompt += `- ${history}\n`;
    });
    prompt += '\n';
  }

  // Lifestyle Factors
  prompt += '## LIFESTYLE FACTORS\n';
  prompt += `Smoking: ${patientData.lifestyleFactors.smokingStatus}`;
  if (patientData.lifestyleFactors.packsPerDay) {
    prompt += ` (${patientData.lifestyleFactors.packsPerDay} packs/day)`;
  }
  prompt += '\n';
  
  prompt += `Alcohol: ${patientData.lifestyleFactors.alcoholConsumption}`;
  if (patientData.lifestyleFactors.drinksPerWeek) {
    prompt += ` (${patientData.lifestyleFactors.drinksPerWeek} drinks/week)`;
  }
  prompt += '\n';
  
  prompt += `Exercise: ${patientData.lifestyleFactors.exerciseFrequency}\n`;
  
  if (patientData.lifestyleFactors.dietType) {
    prompt += `Diet: ${patientData.lifestyleFactors.dietType}\n`;
  }
  
  if (patientData.lifestyleFactors.sleepHours) {
    prompt += `Sleep: ${patientData.lifestyleFactors.sleepHours} hours/night\n`;
  }
  prompt += '\n';

  // Current Medications
  prompt += '## CURRENT MEDICATIONS\n';
  if (patientData.currentMedications && patientData.currentMedications.length > 0) {
    patientData.currentMedications.forEach((med) => {
      prompt += `- ${med.name}: ${med.dosage}, ${med.frequency}`;
      if (med.duration) {
        prompt += `, Duration: ${med.duration}`;
      }
      if (med.purpose) {
        prompt += ` (Purpose: ${med.purpose})`;
      }
      prompt += '\n';
    });
  } else {
    prompt += 'None reported\n';
  }
  prompt += '\n';

  // Primary Complaint
  prompt += '## PRIMARY COMPLAINT\n';
  prompt += `Chief Complaint: ${patientData.primaryComplaint.complaint}\n`;
  prompt += `Severity: ${patientData.primaryComplaint.severity}\n`;
  prompt += `Duration: ${patientData.primaryComplaint.duration}\n`;
  prompt += `Impact on Life: ${patientData.primaryComplaint.impactOnLife}\n`;
  if (patientData.primaryComplaint.additionalNotes) {
    prompt += `Additional Notes: ${patientData.primaryComplaint.additionalNotes}\n`;
  }
  prompt += '\n';

  return prompt;
}
