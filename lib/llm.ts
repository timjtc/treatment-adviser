/**
 * LLM Provider Configuration
 * Supports multiple providers (OpenRouter, OpenAI, Anthropic) via environment variables
 */

import OpenAI from 'openai';

type Provider = 'openrouter' | 'openai' | 'anthropic' | 'ollama';

const PROVIDER: Provider = (process.env.PROVIDER || 'openrouter') as Provider;
const API_KEY = process.env.PROVIDER_API_KEY || process.env[`${PROVIDER.toUpperCase()}_API_KEY`];
const MODEL = process.env.PROVIDER_MODEL || 'gpt-4o';
const TEMPERATURE = parseFloat(process.env.PROVIDER_TEMPERATURE || '0.3');

// For Ollama, API key is not required
if (!API_KEY && PROVIDER !== 'ollama') {
  throw new Error(
    `No API key found for provider "${PROVIDER}". ` +
    `Set PROVIDER_API_KEY or ${PROVIDER.toUpperCase()}_API_KEY environment variable.`
  );
}

/**
 * Create provider-specific LLM client
 */
function createLLMClient(): OpenAI {
  switch (PROVIDER) {
    case 'openrouter':
      return new OpenAI({
        apiKey: API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Treatment Plan Assistant',
        },
      });

    case 'openai':
      return new OpenAI({
        apiKey: API_KEY,
      });

    case 'anthropic':
      // Anthropic SDK uses different client; for now use OpenAI-compatible wrapper
      // In production, you'd use @anthropic-ai/sdk
      return new OpenAI({
        apiKey: API_KEY,
        baseURL: 'https://api.anthropic.com/v1',
      });

    case 'ollama':
      // Ollama runs locally with OpenAI-compatible API
      return new OpenAI({
        apiKey: 'ollama', // Ollama doesn't need a real API key
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
      });

    default:
      throw new Error(`Unknown provider: ${PROVIDER}`);
  }
}

export const llmClient = createLLMClient();

export const DEFAULT_MODEL = MODEL;
export const DEFAULT_TEMPERATURE = TEMPERATURE;
export const ACTIVE_PROVIDER = PROVIDER;

/**
 * Configuration for structured JSON output
 */
export const JSON_RESPONSE_FORMAT = {
  type: 'json_object' as const,
};
