/**
 * API Route: Treatment Plan Analysis
 * POST /api/analyze
 * 
 * Receives patient intake data, enriches with FDA/RxNorm APIs,
 * sends to LLM provider (OpenRouter/OpenAI/Anthropic), returns validated treatment plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { llmClient, DEFAULT_MODEL, ACTIVE_PROVIDER } from '@/lib/llm';
import { enrichPatientData, formatPatientDataForPrompt } from '@/lib/medical-data-service';
import { patientIntakeSchema, treatmentAnalysisResponseSchema } from '@/lib/schemas';
import { SYSTEM_PROMPT } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 540; // Max 9 minutes for API route (LLM inference can be slow, especially local)

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    console.log('Received patient data:', JSON.stringify(body, null, 2));

    // Validate patient intake data
    const validationResult = patientIntakeSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation failed:', JSON.stringify(validationResult.error.issues, null, 2));
      return NextResponse.json(
        {
          error: 'Invalid patient data',
          details: validationResult.error.issues,
          receivedData: body,
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
      `4. Flag any safety concerns (critical, warning, or info severity)\n` +
      `5. Provide alternative treatments if primary recommendation has safety issues\n` +
      `6. Include lifestyle modifications based on patient's current lifestyle factors\n` +
      `7. Include follow-up recommendations for monitoring\n\n` +
      `IMPORTANT: Always include lifestyleModifications array (even if empty) and followUpRecommendations array in your response.\n\n` +
      `RESPOND ONLY IN VALID JSON FORMAT matching the schema defined in the system prompt.`;

    // Step 3: Call LLM provider with closed-loop context
    console.log(`Calling ${ACTIVE_PROVIDER} LLM (model: ${DEFAULT_MODEL})...`);
    
    const completion = await llmClient.chat.completions.create({
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
      console.error('LLM response failed schema validation:', JSON.stringify(validatedResponse.error.issues, null, 2));
      return NextResponse.json(
        {
          error: 'LLM response does not match expected schema',
          details: validatedResponse.error.issues,
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
        provider: ACTIVE_PROVIDER,
        model: DEFAULT_MODEL,
        enrichedMedicationsCount: enrichedData.currentMedicationData.length,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error in /api/analyze:', error);

    // Detect error types
    const isTimeout =
      (error instanceof Error && error.message.toLowerCase().includes('timeout')) ||
      (error instanceof Error && error.message.toLowerCase().includes('signal'));

    const isAuthError = (error as any)?.status === 401 || (error as any)?.code === 401;

    let errorMessage = isTimeout
      ? `LLM inference timeout. Local models like Ollama can be slow. Try: (1) Using a faster model/provider, (2) Increasing system resources, (3) Retrying with smaller input.`
      : isAuthError
      ? `Authentication failed (401). Check: (1) Is your API key correct? (2) Does PROVIDER match your key type? (e.g., PROVIDER=openai for sk-proj-* keys). (3) Is the key still valid?`
      : error instanceof Error
      ? error.message
      : 'Unknown error';

    return NextResponse.json(
      {
        error: isAuthError ? 'Authentication failed' : isTimeout ? 'Request timeout - LLM inference too slow' : 'Failed to generate treatment plan',
        message: errorMessage,
        provider: ACTIVE_PROVIDER,
        model: DEFAULT_MODEL,
        authError: isAuthError,
        timeout: isTimeout,
      },
      { status: isAuthError ? 401 : isTimeout ? 504 : 500 }
    );
  }
}
