# 🦙 Ollama Local LLM Setup Guide

## Why Use Ollama?

- ✅ **100% Free** - No API costs
- ✅ **Privacy** - Data stays on your machine
- ✅ **No Rate Limits** - Use as much as you want
- ✅ **Offline Capable** - Works without internet
- ✅ **Fast** - Low latency on local machine

---

## Installation Steps

### 1. Install Ollama

**Windows:**
```powershell
# Download from: https://ollama.com/download
# Or use winget:
winget install Ollama.Ollama
```

**Mac:**
```bash
# Download from: https://ollama.com/download
# Or use Homebrew:
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Start Ollama Service

```powershell
# Ollama runs as a service automatically on Windows/Mac
# Verify it's running:
ollama --version

# If not running, start it:
ollama serve
```

### 3. Pull a Medical-Optimized Model

**Recommended models for medical use:**

```powershell
# Option 1: Llama 3.2 (3B - Fast, good for most cases)
ollama pull llama3.2

# Option 2: Llama 3.1 (8B - Better reasoning)
ollama pull llama3.1:8b

# Option 3: Qwen 2.5 (7B - Excellent for medical)
ollama pull qwen2.5:7b

# Option 4: DeepSeek R1 (Latest, great reasoning)
ollama pull deepseek-r1:7b

# Option 5: MedLlama2 (Fine-tuned for medical)
ollama pull medllama2
```

### 4. Test Ollama

```powershell
# Chat with the model to verify it works:
ollama run llama3.2

# In the chat, type:
# "What are the contraindications for lisinopril?"
# Press Ctrl+D to exit
```

### 5. Configure Your App

Update `.env.local`:

```env
# Use Ollama as provider
PROVIDER=ollama

# Choose your model (must match what you pulled)
PROVIDER_MODEL=llama3.2

# Ollama URL (default is localhost:11434)
OLLAMA_BASE_URL=http://localhost:11434/v1

# Temperature (0.3 for medical consistency)
PROVIDER_TEMPERATURE=0.3
```

### 6. Restart Your Dev Server

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Model Recommendations

### For Fast Response (Lower RAM):
- **llama3.2** (3B params) - ~2GB RAM
- **mistral** (7B params) - ~4GB RAM

### For Better Medical Reasoning (Higher RAM):
- **qwen2.5:7b** (7B params) - ~5GB RAM ⭐ **Recommended**
- **llama3.1:8b** (8B params) - ~5GB RAM
- **deepseek-r1:7b** (7B params) - ~5GB RAM

### For Maximum Accuracy (High RAM):
- **llama3.1:70b** (70B params) - ~40GB RAM (GPU recommended)
- **qwen2.5:72b** (72B params) - ~45GB RAM (GPU recommended)

---

## Performance Tips

### 1. Enable GPU Acceleration (if available)

Ollama automatically uses GPU if CUDA/Metal is available:

```powershell
# Check GPU support:
ollama ps
```

### 2. Adjust Context Window

For longer patient histories, increase context:

```env
# In your Ollama modelfile or via API
OLLAMA_NUM_CTX=4096
```

### 3. Use Smaller Models for Testing

During development, use smaller models for faster iteration:

```env
PROVIDER_MODEL=llama3.2  # 3B - Fast
```

Then switch to larger for production:

```env
PROVIDER_MODEL=qwen2.5:7b  # 7B - Better quality
```

---

## Troubleshooting

### Issue: "Connection refused"

**Solution:**
```powershell
# Check if Ollama is running:
ollama ps

# If not running:
ollama serve
```

### Issue: "Model not found"

**Solution:**
```powershell
# Pull the model first:
ollama pull llama3.2

# Verify it's available:
ollama list
```

### Issue: "Out of memory"

**Solution:**
```powershell
# Use a smaller model:
ollama pull llama3.2  # Only 3B parameters

# Or close other applications to free RAM
```

### Issue: "Slow responses"

**Solutions:**
1. Use a smaller model (llama3.2 instead of llama3.1:70b)
2. Enable GPU if available
3. Reduce `PROVIDER_TEMPERATURE` (less randomness = faster)
4. Increase Ollama's allowed RAM in settings

---

## Example: Complete Setup

```powershell
# 1. Install Ollama
winget install Ollama.Ollama

# 2. Pull medical model
ollama pull qwen2.5:7b

# 3. Test it works
ollama run qwen2.5:7b
# Type: "List contraindications for warfarin"
# Press Ctrl+D to exit

# 4. Update .env.local
# PROVIDER=ollama
# PROVIDER_MODEL=qwen2.5:7b
# OLLAMA_BASE_URL=http://localhost:11434/v1

# 5. Restart Next.js
npm run dev

# 6. Submit a patient form and test!
```

---

## Comparison: Ollama vs OpenRouter

| Feature | Ollama (Local) | OpenRouter (Cloud) |
|---------|----------------|-------------------|
| **Cost** | Free ✅ | Free tier + paid |
| **Privacy** | 100% private ✅ | Data sent to API |
| **Speed** | Fast (local) ✅ | Network latency |
| **Setup** | Requires installation | Just API key |
| **Models** | Limited to local | Access to all models |
| **RAM** | Requires 4-8GB+ | No local resources |
| **Offline** | Works offline ✅ | Requires internet |

---

## Next Steps

1. ✅ Ollama is now configured
2. ✅ Model is pulled and ready
3. ✅ `.env.local` is updated
4. ✅ Restart dev server
5. ✅ Submit a patient intake form
6. ✅ See AI treatment plan generated locally!

**Your data never leaves your machine! 🔒**
