class CortanaApp {
    constructor() {
        // Core components
        this.avatar = null;
        this.speechManager = null;
        this.llmClient = null;
        
        // UI elements
        this.elements = {};
        
        // State
        this.isInitialized = false;
        this.isProcessing = false;
        this.currentConversation = [];
        
        // Settings
        this.settings = {
            autoListen: true,
            wakeWordEnabled: true,
            voiceEnabled: true,
            animationsEnabled: true
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
                return;
            }
            
            // Initialize UI elements
            this.initializeElements();
            
            // Initialize core components
            await this.initializeComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load settings
            this.loadSettings();
            
            // Start wake word detection if enabled
            if (this.settings.wakeWordEnabled) {
                this.startWakeWordDetection();
            }
            
            this.isInitialized = true;
            this.updateStatus('Ready');
            
            console.log('Cortana LLM initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Cortana LLM:', error);
            this.showError('Failed to initialize. Please refresh the page.');
        }
    }
    
    initializeElements() {
        this.elements = {
            // Avatar and status
            avatarCanvas: document.getElementById('avatarCanvas'),
            avatarStatus: document.getElementById('avatarStatus'),
            statusIndicator: document.querySelector('.status-indicator'),
            statusText: document.querySelector('.status-text'),
            
            // Voice controls
            voiceBtn: document.getElementById('voiceBtn'),
            
            // Chat
            chatContainer: document.getElementById('chatContainer'),
            textInput: document.getElementById('textInput'),
            sendBtn: document.getElementById('sendBtn'),
            
            // Window controls
            minimizeBtn: document.getElementById('minimizeBtn'),
            closeBtn: document.getElementById('closeBtn'),
            
            // Loading
            loadingOverlay: document.getElementById('loadingOverlay'),
            
            // Settings
            settingsPanel: document.getElementById('settingsPanel'),
            closeSettings: document.getElementById('closeSettings'),
            voiceSelect: document.getElementById('voiceSelect'),
            speechRate: document.getElementById('speechRate'),
            wakeWordSensitivity: document.getElementById('wakeWordSensitivity')
        };
    }
    
    async initializeComponents() {
        // Initialize avatar
        if (this.elements.avatarCanvas) {
            this.avatar = new CortanaAvatar('avatarCanvas');
        }
        
        // Initialize knowledge base
        this.knowledgeBase = new KnowledgeBase();
        
        // Initialize learning system
        this.learningSystem = new LearningSystem();
        
        // Initialize speech manager
        this.speechManager = new SpeechManager();
        this.setupSpeechCallbacks();
        
        // Force female voice selection after a short delay to ensure voices are loaded
        setTimeout(() => {
            if (this.speechManager) {
                this.speechManager.forceSelectFemaleVoice();
                this.populateVoiceSelection();
            }
        }, 1000);
        
        // Initialize LLM client
        this.llmClient = new LLMClient();
        
        // Populate voice selection
        this.populateVoiceSelection();
        
        // Request microphone access for enhanced audio input
        this.requestEnhancedAudioAccess();
    }
    
    setupSpeechCallbacks() {
        if (!this.speechManager) return;
        
        this.speechManager.onSpeechStarted(() => {
            this.updateStatus('Listening');
            if (this.avatar) this.avatar.startListening();
            this.elements.voiceBtn?.classList.add('listening');
        });
        
        this.speechManager.onSpeechEnded(() => {
            this.updateStatus('Ready');
            if (this.avatar) this.avatar.stopAll();
            this.elements.voiceBtn?.classList.remove('listening');
        });
        
        this.speechManager.onSpeechResultReceived((transcript) => {
            this.handleUserInput(transcript, 'voice');
        });
        
        this.speechManager.onWakeWordDetection(() => {
            this.handleWakeWord();
        });
    }
    
    setupEventListeners() {
        // Voice button
        this.elements.voiceBtn?.addEventListener('click', () => {
            this.toggleVoiceInput();
        });
        
        // Text input
        this.elements.textInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleTextInput();
            }
        });
        
        // Send button
        this.elements.sendBtn?.addEventListener('click', () => {
            this.handleTextInput();
        });
        
        // Window controls
        this.elements.minimizeBtn?.addEventListener('click', () => {
            if (window.electronAPI) {
                window.electronAPI.minimizeWindow();
            }
        });
        
        this.elements.closeBtn?.addEventListener('click', () => {
            if (window.electronAPI) {
                window.electronAPI.closeWindow();
            }
        });
        
        // Settings
        this.elements.closeSettings?.addEventListener('click', () => {
            this.elements.settingsPanel?.classList.remove('show');
        });
        
        this.elements.voiceSelect?.addEventListener('change', (e) => {
            this.speechManager?.setVoice(e.target.value);
            this.saveSettings();
        });
        
        this.elements.speechRate?.addEventListener('input', (e) => {
            this.speechManager?.setSpeechRate(parseFloat(e.target.value));
            this.saveSettings();
        });
        
        this.elements.wakeWordSensitivity?.addEventListener('input', (e) => {
            this.speechManager?.setWakeWordSensitivity(parseFloat(e.target.value));
            this.saveSettings();
        });
        
        // Global wake word shortcut
        if (window.electronAPI) {
            window.electronAPI.onWakeWordTriggered(() => {
                this.handleWakeWord();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                this.handleWakeWord();
            }
        });
    }
    
    populateVoiceSelection() {
        if (!this.speechManager || !this.elements.voiceSelect) return;
        
        const voices = this.speechManager.getAvailableVoices();
        this.elements.voiceSelect.innerHTML = '<option value="">Select Voice</option>';
        
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice === this.speechManager.getCurrentVoice()) {
                option.selected = true;
            }
            this.elements.voiceSelect.appendChild(option);
        });
    }
    
    async handleUserInput(input, source = 'text') {
        if (!input.trim() || this.isProcessing) return;
        
        this.isProcessing = true;
        this.showLoading(true);
        
        try {
            // Add user message to chat
            this.addMessageToChat(input, 'user');
            
            // Clear text input if it was text input
            if (source === 'text' && this.elements.textInput) {
                this.elements.textInput.value = '';
            }
            
            // Update avatar state
            this.updateStatus('Thinking');
            if (this.avatar) this.avatar.startThinking();
            
            // Get personalized context from learning system
            let personalizedResponse = '';
            if (this.learningSystem) {
                const contextualInfo = this.learningSystem.getContextualResponse(input);
                const greeting = this.learningSystem.getPersonalizedGreeting();
                
                // Use personalized greeting for first interaction
                if (this.currentConversation.length === 0) {
                    personalizedResponse = greeting + ' ';
                }
                
                personalizedResponse += contextualInfo;
            }
            
            // Detect task type and process
            const taskType = this.llmClient.detectTaskType(input);
            let response;
            
            if (taskType === 'general') {
                response = await this.llmClient.generateResponse(input);
            } else {
                response = await this.llmClient.processTask(taskType, { query: input });
            }
            
            // Combine personalized context with response
            if (personalizedResponse) {
                response = personalizedResponse + response;
            }
            
            // Learn from this conversation with both systems
            if (this.learningSystem) {
                this.learningSystem.learnFromConversation(input, response, {
                    source,
                    taskType,
                    timestamp: Date.now()
                });
            }
            
            // Add to knowledge base for broad learning
            if (this.knowledgeBase) {
                this.knowledgeBase.learnFromText(input, {
                    source,
                    taskType,
                    timestamp: Date.now()
                });
                
                // Get additional contextual information from knowledge base
                const knowledgeContext = this.knowledgeBase.generateContextualResponse(input);
                if (knowledgeContext && knowledgeContext.trim()) {
                    response += ' ' + knowledgeContext;
                }
            }
            
            // Add response to chat
            this.addMessageToChat(response, 'bot');
            
            // Speak response if voice is enabled
            if (this.settings.voiceEnabled && this.speechManager) {
                this.updateStatus('Speaking');
                if (this.avatar) this.avatar.startSpeaking();
                
                try {
                    await this.speechManager.speak(response);
                } catch (error) {
                    console.error('Speech synthesis error:', error);
                }
                
                if (this.avatar) this.avatar.stopAll();
            }
            
        } catch (error) {
            console.error('Error processing user input:', error);
            this.addMessageToChat('I apologize, but I encountered an error processing your request.', 'bot');
        } finally {
            this.isProcessing = false;
            this.showLoading(false);
            this.updateStatus('Ready');
            
            // Resume wake word detection if enabled
            if (this.settings.wakeWordEnabled && !this.speechManager.isListening) {
                setTimeout(() => this.startWakeWordDetection(), 1000);
            }
        }
    }
    
    handleTextInput() {
        const input = this.elements.textInput?.value.trim();
        if (input) {
            this.handleUserInput(input, 'text');
        }
    }
    
    toggleVoiceInput() {
        if (!this.speechManager || !this.speechManager.isSupported()) {
            this.showError('Speech recognition is not supported in this browser.');
            return;
        }
        
        if (this.speechManager.isListening) {
            this.speechManager.stopListening();
        } else {
            this.speechManager.startListening();
        }
    }
    
    handleWakeWord() {
        if (this.isProcessing) return;
        
        // Stop current speech
        if (this.speechManager.isSpeaking) {
            this.speechManager.stopSpeaking();
        }
        
        // Activate listening
        this.speechManager.stopWakeWordDetection();
        setTimeout(() => {
            this.speechManager.startListening();
        }, 500);
        
        // Visual feedback
        if (this.avatar) {
            this.avatar.startListening();
        }
        
        // Play activation sound (if available)
        this.playActivationSound();
    }
    
    startWakeWordDetection() {
        if (this.speechManager && this.settings.wakeWordEnabled) {
            this.speechManager.startWakeWordDetection();
        }
    }
    
    addMessageToChat(message, sender) {
        if (!this.elements.chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = this.formatMessage(message);
        
        messageDiv.appendChild(contentDiv);
        this.elements.chatContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
        
        // Store in conversation history
        this.currentConversation.push({ sender, message, timestamp: Date.now() });
    }
    
    formatMessage(message) {
        // Convert newlines to <br> and preserve formatting
        return message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    updateStatus(status) {
        if (this.elements.statusText) {
            this.elements.statusText.textContent = status;
        }
        
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = 'status-indicator';
            
            switch (status.toLowerCase()) {
                case 'listening':
                    this.elements.statusIndicator.classList.add('listening');
                    break;
                case 'speaking':
                    this.elements.statusIndicator.classList.add('speaking');
                    break;
                case 'thinking':
                    this.elements.statusIndicator.classList.add('processing');
                    break;
            }
        }
    }
    
    showLoading(show) {
        if (this.elements.loadingOverlay) {
            if (show) {
                this.elements.loadingOverlay.classList.add('show');
            } else {
                this.elements.loadingOverlay.classList.remove('show');
            }
        }
    }
    
    showError(message) {
        // Simple error display - could be enhanced with a proper modal
        this.addMessageToChat(`Error: ${message}`, 'bot');
    }
    
    playActivationSound() {
        // Play a subtle activation sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Ignore audio errors
        }
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('cortana-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
            
            // Apply settings to UI
            if (this.elements.speechRate) {
                this.elements.speechRate.value = this.speechManager?.speechRate || 1.0;
            }
            
            if (this.elements.wakeWordSensitivity) {
                this.elements.wakeWordSensitivity.value = this.speechManager?.wakeWordSensitivity || 0.7;
            }
            
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('cortana-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    // Enhanced Audio Input Methods
    async requestEnhancedAudioAccess() {
        if (!this.speechManager) return;
        
        try {
            const hasAccess = await this.speechManager.requestMicrophoneAccess();
            if (hasAccess) {
                console.log('Enhanced audio input enabled');
                
                // Set up audio level monitoring for visual feedback
                this.speechManager.onAudioLevel = (level) => {
                    if (this.avatar) {
                        this.avatar.updateWaveform([level * 255]);
                    }
                };
                
                // Update voice button to use enhanced listening
                this.elements.voiceBtn?.addEventListener('click', () => {
                    this.toggleEnhancedVoiceInput();
                });
                
            } else {
                console.warn('Enhanced audio input not available, falling back to basic speech recognition');
            }
        } catch (error) {
            console.error('Error requesting enhanced audio access:', error);
        }
    }
    
    toggleEnhancedVoiceInput() {
        if (!this.speechManager || !this.speechManager.isSupported()) {
            this.showError('Speech recognition is not supported in this browser.');
            return;
        }
        
        if (this.speechManager.isRecording) {
            this.speechManager.stopEnhancedListening();
        } else {
            this.speechManager.startEnhancedListening();
        }
    }
    
    // Learning System Integration Methods
    getUserLearningData() {
        return this.learningSystem ? this.learningSystem.exportLearningData() : null;
    }
    
    importUserLearningData(data) {
        if (this.learningSystem && data) {
            this.learningSystem.importLearningData(data);
        }
    }
    
    clearUserMemory() {
        if (this.learningSystem) {
            this.learningSystem.clearMemory();
            this.addMessageToChat('I\'ve cleared my memory. Nice to meet you again!', 'bot');
        }
    }
    
    showUserProfile() {
        if (this.learningSystem) {
            const profile = this.learningSystem.getUserProfile();
            let profileText = 'Here\'s what I know about you:\n\n';
            
            if (profile.name) {
                profileText += `Name: ${profile.name}\n`;
            }
            
            if (profile.personalInfo.age) {
                profileText += `Age: ${profile.personalInfo.age}\n`;
            }
            
            if (profile.personalInfo.location) {
                profileText += `Location: ${profile.personalInfo.location}\n`;
            }
            
            if (profile.personalInfo.occupation) {
                profileText += `Occupation: ${profile.personalInfo.occupation}\n`;
            }
            
            if (profile.preferences.music && profile.preferences.music.length > 0) {
                profileText += `Music preferences: ${profile.preferences.music.join(', ')}\n`;
            }
            
            if (profile.preferences.food && profile.preferences.food.length > 0) {
                profileText += `Food preferences: ${profile.preferences.food.join(', ')}\n`;
            }
            
            if (profile.preferences.activities && profile.preferences.activities.length > 0) {
                profileText += `Activities: ${profile.preferences.activities.join(', ')}\n`;
            }
            
            if (profileText === 'Here\'s what I know about you:\n\n') {
                profileText = 'I don\'t have much information about you yet. Keep chatting with me and I\'ll learn your preferences!';
            }
            
            this.addMessageToChat(profileText, 'bot');
        }
    }
    
    // Public methods for external control
    sendMessage(message) {
        this.handleUserInput(message, 'external');
    }
    
    clearConversation() {
        if (this.elements.chatContainer) {
            // Keep welcome message, clear the rest
            const welcomeMessage = this.elements.chatContainer.querySelector('.welcome-message');
            this.elements.chatContainer.innerHTML = '';
            if (welcomeMessage) {
                this.elements.chatContainer.appendChild(welcomeMessage);
            }
        }
        
        this.currentConversation = [];
        if (this.llmClient) {
            this.llmClient.clearHistory();
        }
    }
    
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isProcessing: this.isProcessing,
            speech: this.speechManager?.getStatus(),
            llm: this.llmClient?.getStatus(),
            conversationLength: this.currentConversation.length
        };
    }
}

// Initialize the app when the script loads
let cortanaApp;

document.addEventListener('DOMContentLoaded', () => {
    cortanaApp = new CortanaApp();
});

// Export for debugging and external access
window.CortanaApp = CortanaApp;
window.cortanaApp = cortanaApp;
