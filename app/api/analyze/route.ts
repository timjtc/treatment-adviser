/**
 * API Route: Treatment Plan Analysis
 * POST /api/analyze
 * 
 * Receives patient intake data, enriches with FDA/RxNorm APIs,
 * sends to OpenRouter LLM, returns validated treatment plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { openrouter, DEFAULT_MODEL } from '@/lib/llm';
import { enrichPatientData, formatPatientDataForPrompt } from '@/lib/medical-data-service';
import { patientIntakeSchema, treatmentAnalysisResponseSchema } from '@/lib/schemas';
import { SYSTEM_PROMPT } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 60; // Max 60 seconds for API route

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate patient intake data
    const validationResult = patientIntakeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid patient data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const patientData = validationResult.data;

    // Step 1: Enrich patient data with FDA/RxNorm APIs
    console.log('Enriching patient data with FDA and RxNorm APIs...');
    const enrichedData = await enrichPatientData(patientData);

    // Step 2: Build comprehensive prompt for LLM
    const patientContext = formatPatientDataForPrompt(enrichedData.patientInfo);
    const fdaContext = enrichedData.fdaContextSummary;

    const userPrompt = `${patientContext}\n\n${fdaContext}\n\n` +
      `=== TASK ===\n` +
      `Based ONLY on the patient information and FDA drug label data provided above, ` +
      `generate a comprehensive, safety-checked treatment plan.\n\n` +
      `YOU MUST:\n` +
      `1. Check for drug interactions between current medications and any new recommendations\n` +
      `2. Check for contraindications based on patient's conditions and allergies\n` +
      `3. Verify dosages are appropriate for patient's age, weight, and health status\n` +
      `4. Flag any safety concerns (HIGH, MEDIUM, or LOW severity)\n` +
      `5. Provide alternative treatments if primary recommendation has safety issues\n` +
      `6. Calculate overall risk score (0-10 scale)\n\n` +
      `RESPOND ONLY IN VALID JSON FORMAT matching the schema defined in the system prompt.`;

    // Step 3: Call OpenRouter LLM with closed-loop context
    console.log(`Calling OpenRouter LLM (model: ${DEFAULT_MODEL})...`);
    
    const completion = await openrouter.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.3, // Low temperature for consistent medical analysis
      response_format: { type: 'json_object' }, // Force JSON output
    });

    const llmResponse = completion.choices[0]?.message?.content;

    if (!llmResponse) {
      throw new Error('No response from LLM');
    }

    // Step 4: Parse and validate LLM JSON response
    console.log('Validating LLM response...');
    let parsedResponse;
    
    try {
      parsedResponse = JSON.parse(llmResponse);
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', parseError);
      return NextResponse.json(
        {
          error: 'Invalid JSON response from LLM',
          rawResponse: llmResponse,
        },
        { status: 500 }
      );
    }

    // Validate against Zod schema
    const validatedResponse = treatmentAnalysisResponseSchema.safeParse(parsedResponse);
    
    if (!validatedResponse.success) {
      console.error('LLM response failed schema validation:', validatedResponse.error);
      return NextResponse.json(
        {
          error: 'LLM response does not match expected schema',
          details: validatedResponse.error.errors,
          rawResponse: parsedResponse,
        },
        { status: 500 }
      );
    }

    // Step 5: Return validated treatment plan
    console.log('Treatment plan generated successfully');
    
    return NextResponse.json({
      success: true,
      treatmentPlan: validatedResponse.data,
      metadata: {
        model: DEFAULT_MODEL,
        enrichedMedicationsCount: enrichedData.currentMedicationData.length,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error in /api/analyze:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate treatment plan',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
