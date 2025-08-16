class SpeechManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.wakeWords = ['hey cortana', 'cortana', 'hey assistant'];
        this.currentVoice = null;
        this.speechRate = 1.0;
        this.wakeWordSensitivity = 0.7;
        
        // Enhanced audio input features
        this.audioContext = null;
        this.mediaStream = null;
        this.audioAnalyser = null;
        this.audioBuffer = [];
        this.isRecording = false;
        this.silenceThreshold = 0.01;
        this.silenceTimeout = 2000; // 2 seconds of silence
        this.lastSpeechTime = 0;
        
        // Callbacks
        this.onSpeechResult = null;
        this.onSpeechStart = null;
        this.onSpeechEnd = null;
        this.onWakeWordDetected = null;
        this.onAudioLevel = null;
        
        this.init();
    }
    
    init() {
        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.setupRecognitionEvents();
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
        
        // Initialize speech synthesis
        this.loadVoices();
        
        // Listen for voice changes
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
    }
    
    setupRecognitionEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.onSpeechStart) this.onSpeechStart();
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onSpeechEnd) this.onSpeechEnd();
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Check for wake words in interim results
            const fullTranscript = (finalTranscript + interimTranscript).toLowerCase().trim();
            if (this.detectWakeWord(fullTranscript)) {
                if (this.onWakeWordDetected) this.onWakeWordDetected();
                return;
            }
            
            // Process final results
            if (finalTranscript && this.onSpeechResult) {
                this.onSpeechResult(finalTranscript.trim());
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            if (this.onSpeechEnd) this.onSpeechEnd();
        };
    }
    
    detectWakeWord(transcript) {
        return this.wakeWords.some(wakeWord => {
            const similarity = this.calculateSimilarity(transcript, wakeWord);
            return similarity >= this.wakeWordSensitivity;
        });
    }
    
    calculateSimilarity(str1, str2) {
        // Simple similarity calculation based on word matching
        const words1 = str1.toLowerCase().split(' ');
        const words2 = str2.toLowerCase().split(' ');
        
        let matches = 0;
        words2.forEach(word => {
            if (words1.some(w => w.includes(word) || word.includes(w))) {
                matches++;
            }
        });
        
        return matches / words2.length;
    }
    
    loadVoices() {
        const voices = this.synthesis.getVoices();
        
        // Prefer female voices for Cortana-like experience
        const preferredVoices = [
            'Microsoft Zira Desktop',
            'Microsoft Hazel Desktop',
            'Google UK English Female',
            'Google US English Female',
            'Samantha',
            'Victoria',
            'Fiona',
            'Karen',
            'Moira',
            'Tessa',
            'Veena',
            'Yelda'
        ];
        
        // Find the best available voice
        for (const preferred of preferredVoices) {
            const voice = voices.find(v => v.name.includes(preferred));
            if (voice) {
                this.currentVoice = voice;
                break;
            }
        }
        
        // Enhanced fallback to female voices
        if (!this.currentVoice) {
            // Look for female indicators in voice names
            this.currentVoice = voices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('female') || 
                       name.includes('woman') ||
                       name.includes('zira') ||
                       name.includes('hazel') ||
                       name.includes('cortana') ||
                       name.includes('samantha') ||
                       name.includes('victoria') ||
                       name.includes('karen') ||
                       name.includes('moira') ||
                       name.includes('tessa') ||
                       name.includes('susan') ||
                       name.includes('allison') ||
                       name.includes('ava') ||
                       name.includes('serena');
            });
        }
        
        // If still no female voice found, filter by language and gender
        if (!this.currentVoice) {
            this.currentVoice = voices.find(v => 
                v.lang.startsWith('en') && 
                (v.name.toLowerCase().includes('female') || v.voiceURI.toLowerCase().includes('female'))
            );
        }
        
        // Final fallback - use first English voice
        if (!this.currentVoice) {
            this.currentVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
        
        console.log('Selected voice:', this.currentVoice?.name || 'None available');
        return voices;
    }
    
    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
            }
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }
            
            // Stop any current speech
            this.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configure utterance with enhanced female voice settings
            utterance.voice = options.voice || this.currentVoice;
            utterance.rate = options.rate || this.speechRate;
            utterance.pitch = options.pitch || 1.1; // Slightly higher pitch for more feminine sound
            utterance.volume = options.volume || 1.0;
            
            utterance.onstart = () => {
                this.isSpeaking = true;
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.isSpeaking = false;
                reject(new Error(`Speech synthesis error: ${event.error}`));
            };
            
            this.synthesis.speak(utterance);
        });
    }
    
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
    }
    
    // Continuous listening for wake words
    startWakeWordDetection() {
        if (this.recognition && !this.isListening) {
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.startListening();
        }
    }
    
    stopWakeWordDetection() {
        this.stopListening();
    }
    
    // Configuration methods
    setVoice(voiceName) {
        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => v.name === voiceName);
        if (voice) {
            this.currentVoice = voice;
            console.log('Voice changed to:', voice.name);
        }
    }
    
    setSpeechRate(rate) {
        this.speechRate = Math.max(0.1, Math.min(2.0, rate));
    }
    
    setWakeWordSensitivity(sensitivity) {
        this.wakeWordSensitivity = Math.max(0.1, Math.min(1.0, sensitivity));
    }
    
    // Enhanced Audio Input Methods
    async requestMicrophoneAccess() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                } 
            });
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioAnalyser = this.audioContext.createAnalyser();
            
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            source.connect(this.audioAnalyser);
            
            this.audioAnalyser.fftSize = 256;
            this.audioAnalyser.smoothingTimeConstant = 0.8;
            
            console.log('Microphone access granted');
            return true;
        } catch (error) {
            console.error('Microphone access denied:', error);
            return false;
        }
    }
    
    startEnhancedListening() {
        if (!this.audioContext || !this.audioAnalyser) {
            console.warn('Audio context not initialized. Requesting microphone access...');
            this.requestMicrophoneAccess().then(success => {
                if (success) this.startEnhancedListening();
            });
            return;
        }
        
        this.isRecording = true;
        this.monitorAudioLevel();
        this.startListening();
    }
    
    monitorAudioLevel() {
        if (!this.isRecording || !this.audioAnalyser) return;
        
        const bufferLength = this.audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const checkAudioLevel = () => {
            if (!this.isRecording) return;
            
            this.audioAnalyser.getByteFrequencyData(dataArray);
            
            // Calculate average audio level
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength / 255;
            
            // Trigger audio level callback for visual feedback
            if (this.onAudioLevel) {
                this.onAudioLevel(average);
            }
            
            // Detect speech activity
            if (average > this.silenceThreshold) {
                this.lastSpeechTime = Date.now();
            }
            
            // Auto-stop after silence
            if (Date.now() - this.lastSpeechTime > this.silenceTimeout && this.lastSpeechTime > 0) {
                this.stopEnhancedListening();
                return;
            }
            
            requestAnimationFrame(checkAudioLevel);
        };
        
        checkAudioLevel();
    }
    
    stopEnhancedListening() {
        this.isRecording = false;
        this.stopListening();
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
    }
    
    // Force reload voices and select best female voice
    forceSelectFemaleVoice() {
        this.loadVoices();
        const voices = this.synthesis.getVoices();
        
        // Debug: log all available voices
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Try to find the best female voice
        const femaleVoice = voices.find(v => {
            const name = v.name.toLowerCase();
            return name.includes('zira') || 
                   name.includes('hazel') || 
                   name.includes('female') ||
                   name.includes('samantha') ||
                   name.includes('victoria');
        });
        
        if (femaleVoice) {
            this.currentVoice = femaleVoice;
            console.log('Forced female voice selection:', femaleVoice.name);
        }
    }
    
    // Event handlers
    onSpeechResultReceived(callback) {
        this.onSpeechResult = callback;
    }
    
    onSpeechStarted(callback) {
        this.onSpeechStart = callback;
    }
    
    onSpeechEnded(callback) {
        this.onSpeechEnd = callback;
    }
    
    onWakeWordDetection(callback) {
        this.onWakeWordDetected = callback;
    }
    
    // Utility methods
    isSupported() {
        return !!(this.recognition && this.synthesis);
    }
    
    getAvailableVoices() {
        return this.synthesis ? this.synthesis.getVoices() : [];
    }
    
    getCurrentVoice() {
        return this.currentVoice;
    }
    
    getStatus() {
        return {
            isListening: this.isListening,
            isSpeaking: this.isSpeaking,
            isSupported: this.isSupported(),
            currentVoice: this.currentVoice?.name || 'None',
            speechRate: this.speechRate,
            wakeWordSensitivity: this.wakeWordSensitivity
        };
    }
}

// Export for use in other modules
window.SpeechManager = SpeechManager;
