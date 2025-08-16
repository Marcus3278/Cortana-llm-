# Cortana LLM Setup Guide

## Quick Start (Without Local AI)

The application can run immediately with basic functionality:

```bash
cd cortana-llm
npm start
```

## Full Setup (With Local AI)

### Step 1: Install Ollama

**Option A: Manual Download**
1. Visit [ollama.ai](https://ollama.ai)
2. Download the Windows installer
3. Run the installer and follow instructions
4. Restart your terminal/command prompt

**Option B: Using Package Manager**
```bash
# Using winget (Windows 10/11)
winget install Ollama.Ollama

# Using chocolatey
choco install ollama
```

### Step 2: Start Ollama Service

```bash
# Start Ollama service
ollama serve
```

Keep this terminal open - Ollama needs to run in the background.

### Step 3: Download AI Model

Open a new terminal and run:

```bash
# Download recommended model (7GB download)
ollama pull llama2:7b-chat

# Or for faster/smaller model
ollama pull llama2:7b

# Or for coding assistance
ollama pull codellama:7b
```

### Step 4: Test the Model

```bash
# Test the model
ollama run llama2:7b-chat "Hello, how are you?"
```

### Step 5: Launch Cortana LLM

```bash
cd cortana-llm
npm start
```

## Available Models

| Model | Size | Best For | Download Time |
|-------|------|----------|---------------|
| `llama2:7b-chat` | ~7GB | General conversation | 10-30 min |
| `llama2:13b-chat` | ~13GB | Better quality responses | 20-60 min |
| `codellama:7b` | ~7GB | Code assistance | 10-30 min |
| `mistral:7b` | ~7GB | Fast responses | 10-30 min |
| `phi:2.7b` | ~2.7GB | Lightweight option | 5-15 min |

## Features Available

### Without Ollama (Offline Mode)
- ✅ Voice recognition and text-to-speech
- ✅ Animated avatar with visual feedback
- ✅ Basic calculations and math
- ✅ Time and date queries
- ✅ System information
- ✅ File search
- ✅ Simple responses

### With Ollama (Full AI Mode)
- ✅ All offline features
- ✅ Intelligent conversation
- ✅ Context awareness
- ✅ Complex question answering
- ✅ Task understanding
- ✅ Personality and humor
- ✅ Learning from conversation

## Troubleshooting

### Ollama Issues

**"ollama: command not found"**
- Restart your terminal after installation
- Check if Ollama is in your PATH
- Try running from full path: `C:\Users\%USERNAME%\AppData\Local\Programs\Ollama\ollama.exe`

**"Connection refused"**
- Make sure `ollama serve` is running
- Check if port 11434 is available
- Try restarting the Ollama service

**Model download fails**
- Check internet connection
- Ensure sufficient disk space (10GB+ recommended)
- Try downloading a smaller model first

### Application Issues

**Voice recognition not working**
- Grant microphone permissions
- Use Chrome/Edge browser engine
- Check microphone is not muted

**Avatar not animating**
- Enable hardware acceleration
- Update graphics drivers
- Try reducing animation complexity

## Performance Tips

### For Better Performance
- Use smaller models (phi:2.7b) on older hardware
- Close unnecessary applications
- Ensure 8GB+ RAM available
- Use SSD storage for models

### For Better Quality
- Use larger models (llama2:13b-chat)
- Increase conversation history length
- Fine-tune response parameters

## Usage Examples

### Voice Commands
- "Hey Cortana, what time is it?"
- "Calculate 15 times 24"
- "Find my documents"
- "What's my system information?"
- "Tell me a joke"

### Text Input
- Type questions in the chat interface
- Use mathematical expressions: "2+2*3"
- Ask for help: "What can you do?"

## Advanced Configuration

### Model Settings
Edit `src/js/llm-client.js`:
```javascript
this.currentModel = 'llama2:7b-chat'; // Change model
this.maxHistoryLength = 10; // Conversation memory
```

### Voice Settings
Edit `src/js/speech.js`:
```javascript
this.speechRate = 1.0; // Speech speed
this.wakeWordSensitivity = 0.7; // Wake word detection
```

### Avatar Settings
Edit `src/js/avatar.js`:
```javascript
this.colors.primary = '#00d4ff'; // Change colors
// Modify animations and effects
```

## Next Steps

1. **Test Basic Functionality**: Try voice commands and text input
2. **Install Ollama**: Follow the setup guide above
3. **Download Models**: Start with llama2:7b-chat
4. **Customize**: Adjust settings to your preference
5. **Explore**: Try different typesIt seems that the command to check the version of Ollama did not return any output. Let me try running the Ollama service directly to see if it starts correctly:

<execute_command>
<command>ollama serve</command>
</execute_command>
