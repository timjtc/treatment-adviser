/**
 * OpenAI LLM client configuration
 */

import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
export const DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || '0.3');

/**
 * Configuration for structured JSON output
 */
export const JSON_RESPONSE_FORMAT = {
  type: 'json_object' as const,
};
