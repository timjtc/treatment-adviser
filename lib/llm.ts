/**
 * OpenRouter LLM client configuration
 * Using OpenAI SDK with OpenRouter's OpenAI-compatible API
 */

import OpenAI from 'openai';

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY environment variable is not set');
}

// OpenRouter client configured with their base URL
export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Treatment Plan Assistant',
  },
});

// Free models available on OpenRouter (no cost)
export const FREE_MODELS = {
  GEMINI_FLASH: 'google/gemini-2.0-flash-exp:free',
  LLAMA_3_1: 'meta-llama/llama-3.1-8b-instruct:free',
  QWEN_72B: 'qwen/qwen-2.5-72b-instruct:free',
  MISTRAL_7B: 'mistralai/mistral-7b-instruct:free',
} as const;

// Default model - Gemini Flash is best free model for medical reasoning
export const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || FREE_MODELS.GEMINI_FLASH;
export const DEFAULT_TEMPERATURE = parseFloat(process.env.OPENROUTER_TEMPERATURE || '0.3');

/**
 * Configuration for structured JSON output
 * Note: Not all free models support response_format, so we'll rely on prompt engineering
 */
export const JSON_RESPONSE_FORMAT = {
  type: 'json_object' as const,
};
