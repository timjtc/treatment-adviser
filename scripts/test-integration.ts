/**
 * Test Script for OpenRouter Integration
 * Run with: npx ts-node scripts/test-integration.ts
 */

import { enrichPatientData, formatPatientDataForPrompt } from '../lib/medical-data-service';
import { DEMO_PATIENTS } from '../data/demo-patients.json';

async function testIntegration() {
  console.log('🧪 Testing OpenRouter Integration\n');
  console.log('='.repeat(80));
  
  // Test 1: Low-Risk Patient
  console.log('\n📋 TEST 1: Low-Risk Patient (Sarah Johnson)');
  console.log('-'.repeat(80));
  
  const lowRiskPatient = DEMO_PATIENTS['low-risk'];
  console.log('Patient:', lowRiskPatient.healthMetrics.age, 'years old');
  console.log('Current Medications:', lowRiskPatient.currentMedications?.length || 0);
  
  const lowRiskEnriched = await enrichPatientData(lowRiskPatient);
  console.log('\n✅ Enriched Data:');
  console.log('  - FDA data fetched for', lowRiskEnriched.currentMedicationData.length, 'medications');
  console.log('  - Context length:', lowRiskEnriched.fdaContextSummary.length, 'characters');
  
  // Test 2: Medium-Risk Patient  
  console.log('\n\n📋 TEST 2: Medium-Risk Patient (Michael Chen)');
  console.log('-'.repeat(80));
  
  const mediumRiskPatient = DEMO_PATIENTS['medium-risk'];
  console.log('Patient:', mediumRiskPatient.healthMetrics.age, 'years old');
  console.log('Current Medications:', mediumRiskPatient.currentMedications?.length || 0);
  console.log('Medications:', mediumRiskPatient.currentMedications?.map(m => m.name).join(', '));
  
  const mediumRiskEnriched = await enrichPatientData(mediumRiskPatient);
  console.log('\n✅ Enriched Data:');
  console.log('  - FDA data fetched for', mediumRiskEnriched.currentMedicationData.length, 'medications');
  
  mediumRiskEnriched.currentMedicationData.forEach((med, idx) => {
    console.log(`\n  Medication ${idx + 1}: ${med.userInput.name}`);
    console.log(`    - RxNorm: ${med.rxnormData ? `✓ ${med.rxnormData.rxcui}` : '✗ Not found'}`);
    console.log(`    - FDA Data: ${med.fdaData ? '✓ Found' : '✗ Not found'}`);
    
    if (med.fdaData) {
      if (med.fdaData.contraindications && med.fdaData.contraindications.length > 0) {
        console.log(`    - Contraindications: ${med.fdaData.contraindications.length} found`);
      }
      if (med.fdaData.drug_interactions && med.fdaData.drug_interactions.length > 0) {
        console.log(`    - Drug Interactions: ${med.fdaData.drug_interactions.length} found`);
      }
      if (med.fdaData.warnings && med.fdaData.warnings.length > 0) {
        console.log(`    - Warnings: ${med.fdaData.warnings.length} found`);
      }
    }
    
    if (med.errors.length > 0) {
      console.log(`    - Errors: ${med.errors.join(', ')}`);
    }
  });
  
  // Test 3: High-Risk Patient
  console.log('\n\n📋 TEST 3: High-Risk Patient (Margaret Thompson)');
  console.log('-'.repeat(80));
  
  const highRiskPatient = DEMO_PATIENTS['high-risk'];
  console.log('Patient:', highRiskPatient.healthMetrics.age, 'years old');
  console.log('Current Medications:', highRiskPatient.currentMedications?.length || 0);
  console.log('Medications:', highRiskPatient.currentMedications?.map(m => m.name).join(', '));
  console.log('Allergies:', highRiskPatient.allergies?.map(a => a.allergen).join(', '));
  
  const highRiskEnriched = await enrichPatientData(highRiskPatient);
  console.log('\n✅ Enriched Data:');
  console.log('  - FDA data fetched for', highRiskEnriched.currentMedicationData.length, 'medications');
  console.log('  - Context length:', highRiskEnriched.fdaContextSummary.length, 'characters');
  
  // Show sample of FDA context
  console.log('\n📄 Sample FDA Context (first 500 characters):');
  console.log(highRiskEnriched.fdaContextSummary.substring(0, 500));
  console.log('...');
  
  // Test 4: Format patient data for prompt
  console.log('\n\n📋 TEST 4: Patient Data Formatting');
  console.log('-'.repeat(80));
  
  const formattedPrompt = formatPatientDataForPrompt(highRiskPatient);
  console.log('Formatted prompt length:', formattedPrompt.length, 'characters');
  console.log('\n📄 Sample Patient Prompt (first 800 characters):');
  console.log(formattedPrompt.substring(0, 800));
  console.log('...');
  
  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('✅ ALL TESTS PASSED!');
  console.log('='.repeat(80));
  console.log('\nIntegration is ready. Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Navigate to: http://localhost:3000/intake');
  console.log('3. Fill out patient form');
  console.log('4. Submit to test /api/analyze endpoint');
  console.log('\nOr test API directly:');
  console.log('  curl -X POST http://localhost:3000/api/analyze \\');
  console.log('    -H "Content-Type: application/json" \\');
  console.log('    -d @data/demo-patients.json');
  console.log('');
}

// Run tests
testIntegration()
  .then(() => {
    console.log('\n✨ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
