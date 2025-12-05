# 🔄 LLM Provider Configuration Guide

This project now supports flexible LLM provider switching via environment variables. Switch between **OpenRouter**, **OpenAI**, or **Anthropic** without code changes.

## Quick Start

### 1. Choose Your Provider

Set the `PROVIDER` environment variable in `.env.local`:

```bash
PROVIDER=openrouter    # Free models via OpenRouter
PROVIDER=openai        # OpenAI API (paid)
PROVIDER=anthropic     # Anthropic Claude (paid)
```

### 2. Set API Credentials

**Option A: Use generic key (recommended)**
```bash
PROVIDER_API_KEY=your_api_key_here
```

**Option B: Use provider-specific keys** (keys are checked in order)
```bash
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Configure Model & Temperature

```bash
PROVIDER_MODEL=google/gemini-2.0-flash-exp:free
PROVIDER_TEMPERATURE=0.3
```

## Provider Details

### 🔵 OpenRouter (Recommended for hackathons)

**Free models available:**
- `google/gemini-2.0-flash-exp:free` (best medical reasoning)
- `meta-llama/llama-3.1-8b-instruct:free`
- `qwen/qwen-2.5-72b-instruct:free`
- `mistralai/mistral-7b-instruct:free`

**Setup:**
```bash
PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-...
PROVIDER_MODEL=google/gemini-2.0-flash-exp:free
```

**Get API key:** https://openrouter.ai/keys

---

### 🟢 OpenAI

**Popular models:**
- `gpt-4o` (latest, recommended for medical)
- `gpt-4-turbo`
- `gpt-4`
- `gpt-3.5-turbo` (cheaper)

**Setup:**
```bash
PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
PROVIDER_MODEL=gpt-4o
```

**Get API key:** https://platform.openai.com/account/api-keys

---

### 🔴 Anthropic

**Popular models:**
- `claude-3-5-sonnet-20241022` (latest, strong medical reasoning)
- `claude-3-opus-20240229` (most capable)
- `claude-3-haiku-20240307` (cheaper)

**Setup:**
```bash
PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
PROVIDER_MODEL=claude-3-5-sonnet-20241022
```

**Get API key:** https://console.anthropic.com/account/keys

---

## How It Works

The system automatically:

1. **Detects** the provider from `PROVIDER` env var
2. **Resolves** API key (tries generic first, then provider-specific)
3. **Creates** the appropriate client with correct base URL
4. **Routes** requests through the unified `llmClient` interface

All providers are **OpenAI API-compatible**, so the same code works across all of them.

## Code Example

```typescript
import { llmClient, DEFAULT_MODEL, ACTIVE_PROVIDER } from '@/lib/llm';

// Use unified client (works with any provider)
const completion = await llmClient.chat.completions.create({
  model: DEFAULT_MODEL,
  messages: [{ role: 'user', content: 'Hello' }],
});

console.log(`Using ${ACTIVE_PROVIDER}`); // Logs "openrouter", "openai", or "anthropic"
```

## Switching Providers at Runtime

Simply update `.env.local` and restart the dev server:

```bash
# Current: OpenRouter
PROVIDER=openrouter
PROVIDER_API_KEY=sk-or-v1-...

# Change to OpenAI
PROVIDER=openai
PROVIDER_API_KEY=sk-proj-...
```

The `lib/llm.ts` client will automatically reconfigure on the next request.

## Troubleshooting

### ❌ "No API key found for provider"
- Ensure you've set `PROVIDER_API_KEY` or the provider-specific key
- Check that the key value is not empty

### ❌ Model not available
- Verify the model name is correct for your provider
- Some free models may have usage limits

### ❌ JSON response format errors
- Some models don't support `response_format: { type: 'json_object' }`
- System will attempt prompt engineering as fallback

## Environment Variables Reference

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `PROVIDER` | ✅ | `openrouter` | Which provider to use |
| `PROVIDER_API_KEY` | ✅ | `sk-...` | API key for provider |
| `PROVIDER_MODEL` | ✅ | `gpt-4o` | Model to use |
| `PROVIDER_TEMPERATURE` | ❌ | `0.3` | Model temperature (default: 0.3) |
| `OPENROUTER_API_KEY` | ⚠️ | `sk-or-v1-...` | Used if `PROVIDER_API_KEY` not set |
| `OPENAI_API_KEY` | ⚠️ | `sk-proj-...` | Used if `PROVIDER_API_KEY` not set |
| `ANTHROPIC_API_KEY` | ⚠️ | `sk-ant-...` | Used if `PROVIDER_API_KEY` not set |
| `NEXT_PUBLIC_APP_URL` | ❌ | `http://localhost:3000` | For OpenRouter referer header |
| `OPENFDA_API_KEY` | ❌ | `...` | OpenFDA API (higher rate limits) |
