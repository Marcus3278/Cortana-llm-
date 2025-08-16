# Cortana-Style LLM Desktop Assistant

A desktop application that mimics Microsoft Cortana's functionality using local AI models. Features voice recognition, text-to-speech, animated avatar, and intelligent task processing.

![Cortana LLM](https://img.shields.io/badge/Cortana-LLM-blue?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-Framework-lightblue?style=flat-square)
![Ollama](https://img.shields.io/badge/Ollama-Local%20AI-green?style=flat-square)

## 🌟 Features

### 🎤 Voice Interaction
- **Wake Word Detection**: Activate with "Hey Cortana" or Ctrl+Shift+C
- **Speech Recognition**: Natural language voice input
- **Text-to-Speech**: Cortana-style voice responses
- **Continuous Listening**: Always ready to help

### 🤖 AI Capabilities
- **Local LLM**: Powered by Ollama for privacy and offline use
- **Task Processing**: Weather, system info, file search, calculations
- **Context Awareness**: Remembers conversation history
- **Smart Responses**: Cortana-like personality and helpfulness

### 🎨 Visual Interface
- **Animated Avatar**: Dynamic visual feedback with state changes
- **Modern UI**: Sleek, Cortana-inspired design
- **Real-time Animations**: Listening, speaking, and thinking states
- **Responsive Design**: Adapts to different screen sizes

### 🛠️ System Integration
- **File Search**: Find files across your system
- **System Information**: Hardware specs and performance
- **Window Management**: Minimize, close, and control
- **Cross-platform**: Windows, macOS, and Linux support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Ollama (will be installed during setup)

### Installation

1. **Clone and Install**
   ```bash
   cd cortana-llm
   npm install
   ```

2. **Setup Ollama and AI Model**
   ```bash
   npm run install-ollama
   ```
   This will:
   - Download and install Ollama
   - Pull the recommended AI model (llama2:7b-chat)
   - Test the setup

3. **Start the Application**
   ```bash
   npm start
   ```

### Alternative Manual Setup

If automatic setup fails:

1. **Install Ollama manually**
   - Visit [ollama.ai](https://ollama.ai)
   - Download for your platform
   - Install and start the service

2. **Pull AI Model**
   ```bash
   ollama pull llama2:7b-chat
   ```

3. **Start Ollama Service**
   ```bash
   ollama serve
   ```

4. **Launch Application**
   ```bash
   npm start
   ```

## 🎯 Usage

### Voice Commands
- **"Hey Cortana"** - Wake word activation
- **"What's the weather?"** - Weather information
- **"What time is it?"** - Current time
- **"Find my documents"** - File search
- **"Calculate 15 * 24"** - Math calculations
- **"System information"** - Computer specs
- **"Help"** - Available commands

### Text Input
- Type messages in the chat interface
- Press Enter to send
- Use the microphone button for voice input

### Keyboard Shortcuts
- **Ctrl+Shift+C** - Activate voice input
- **Enter** - Send text message
- **Escape** - Cancel current operation

## 🏗️ Architecture

### Core Components

```
cortana-llm/
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── src/
│   ├── index.html       # Main UI
│   ├── css/styles.css   # Styling and animations
│   └── js/
│       ├── app.js       # Main application logic
│       ├── avatar.js    # Avatar animations
│       ├── speech.js    # Voice recognition/synthesis
│       └── llm-client.js # AI model communication
├── config/
│   ├── ollama-setup.js  # Ollama installation
│   └── tasks.json       # Task definitions
└── assets/              # Icons and resources
```

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Desktop Framework**: Electron
- **AI Engine**: Ollama + Llama 2
- **Speech**: Web Speech API
- **Graphics**: HTML5 Canvas
- **Build**: Node.js, npm

## 🔧 Configuration

### Settings Panel
Access via the settings icon or modify `config/tasks.json`:

```json
{
  "settings": {
    "wakeWords": ["hey cortana", "cortana"],
    "speechRate": 1.0,
    "wakeWordSensitivity": 0.7,
    "voiceEnabled": true,
    "animationsEnabled": true
  }
}
```

### AI Model Configuration
Change the AI model in `src/js/llm-client.js`:

```javascript
this.currentModel = 'llama2:7b-chat'; // or 'codellama', 'mistral', etc.
```

Available models:
- `llama2:7b-chat` - General conversation (recommended)
- `llama2:13b-chat` - Better quality, slower
- `codellama:7b` - Code-focused
- `mistral:7b` - Fast and efficient

## 🎨 Customization

### Avatar Appearance
Modify `src/js/avatar.js` to change:
- Colors and themes
- Animation styles
- Visual effects
- State indicators

### Voice Settings
Adjust in `src/js/speech.js`:
- Voice selection
- Speech rate
- Wake word sensitivity
- Language settings

### UI Themes
Edit `src/css/styles.css` for:
- Color schemes
- Layout changes
- Animation timing
- Responsive breakpoints

## 🔍 Troubleshooting

### Common Issues

**Ollama Connection Failed**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama service
ollama serve
```

**Speech Recognition Not Working**
- Ensure microphone permissions are granted
- Check browser compatibility (Chrome/Edge recommended)
- Verify microphone is not muted

**Model Loading Slow**
- First-time model loading takes time
- Ensure stable internet connection
- Consider using smaller models for testing

**Voice Synthesis Issues**
- Check system audio settings
- Verify speakers/headphones are connected
- Try different voice selections

### Debug Mode
Enable debug logging:
```javascript
// In src/js/app.js
console.log('Debug mode enabled');
window.cortanaApp.getStatus(); // Check component status
```

### Performance Optimization
- Use smaller AI models for faster responses
- Reduce animation complexity for older hardware
- Adjust conversation history length
- Close unnecessary applications

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

### Code Style
- Use ES6+ features
- Follow existing naming conventions
- Add comments for complex logic
- Test on multiple platforms

### Adding New Tasks
1. Define task in `config/tasks.json`
2. Add handler in `src/js/llm-client.js`
3. Update UI if needed
4. Test functionality

## 📝 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Ollama** - Local AI model serving
- **Electron** - Cross-platform desktop framework
- **Web Speech API** - Voice recognition and synthesis
- **Microsoft Cortana** - Inspiration for design and functionality

## 🔮 Future Enhancements

- [ ] Weather API integration
- [ ] Calendar and reminder system
- [ ] Plugin architecture
- [ ] Multi-language support
- [ ] Custom wake words
- [ ] Voice training
- [ ] Smart home integration
- [ ] Mobile companion app

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with details
4. Join our community discussions

---

**Made with ❤️ for the AI community**

*Bringing the power of local AI to your desktop with the familiar Cortana experience.*
