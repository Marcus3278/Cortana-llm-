# Ollama Installation Guide for Cortana LLM

## Quick Installation Steps

### For Windows:
1. **Download Ollama:**
   - Visit: https://ollama.ai/download/windows
   - Download the Windows installer
   - Run the installer as Administrator

2. **Verify Installation:**
   ```cmd
   ollama --version
   ```

3. **Start Ollama Service:**
   ```cmd
   ollama serve
   ```

4. **Pull Recommended Model:**
   ```cmd
   ollama pull llama2:7b-chat
   ```

5. **Test the Model:**
   ```cmd
   ollama run llama2:7b-chat "Hello, how are you?"
   ```

### Alternative: Use Our Setup Script
```cmd
cd cortana-llm
node config/ollama-setup.js setup
```

## Manual Setup Process

If the automated setup doesn't work, follow these steps:

### Step 1: Install Ollama
- Download from https://ollama.ai
- Install following the platform-specific instructions
- Restart your terminal/command prompt

### Step 2: Start Ollama Service
```cmd
ollama serve
```
Keep this terminal window open - Ollama needs to run as a service.

### Step 3: Pull a Model
In a new terminal window:
```cmd
ollama pull llama2:7b-chat
```

This will download approximately 3.8GB of model data.

### Step 4: Test Integration
```cmd
cd cortana-llm
npm start
```

## Troubleshooting

### Common Issues:

1. **"ollama: command not found"**
   - Ollama is not installed or not in PATH
   - Reinstall Ollama and restart terminal

2. **"Connection refused" errors**
   - Ollama service is not running
   - Run `ollama serve` in a separate terminal

3. **Model download fails**
   - Check internet connection
   - Try a smaller model: `ollama pull llama2:7b-chat`

4. **Application shows "offline mode"**
   - Verify Ollama is running: http://localhost:11434
   - Check if model is pulled: `ollama list`

## Testing the Setup

1. **Check Ollama Status:**
   ```cmd
   curl http://localhost:11434/api/tags
   ```

2. **Test Model Response:**
   ```cmd
   curl http://localhost:11434/api/generate -d '{
     "model": "llama2:7b-chat",
     "prompt": "Hello",
     "stream": false
   }'
   ```

3. **Launch Cortana LLM:**
   ```cmd
   cd cortana-llm
   npm start
   ```

## Model Recommendations

- **For Development:** `llama2:7b-chat` (3.8GB)
- **For Production:** `llama2:13b-chat` (7.3GB) - Better quality
- **For Low Resources:** `llama2:7b-chat-q4_0` (3.8GB) - Quantized version

## Next Steps After Installation

1. Launch the Cortana LLM application
2. Test voice recognition and AI responses
3. Verify all features work with AI integration
4. Configure additional settings as needed

---

**Note:** The Cortana LLM application will work in offline mode with fallback responses even without Ollama. However, for the full AI experience, Ollama with a language model is required.
