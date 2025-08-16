class AdvancedFeatures {
    constructor(app) {
        this.app = app;
        this.emotionalState = {
            current: 'neutral',
            history: [],
            patterns: {}
        };
        
        this.contextualMemory = {
            currentTopic: null,
            topicHistory: [],
            conversationFlow: [],
            userMood: 'neutral'
        };
        
        this.proactiveAssistance = {
            suggestions: [],
            reminders: [],
            scheduledTasks: [],
            habits: {}
        };
        
        this.multimodalCapabilities = {
            textAnalysis: true,
            voiceAnalysis: true,
            emotionDetection: true,
            intentPrediction: true
        };
        
        this.init();
    }
    
    init() {
        this.loadAdvancedSettings();
        this.setupEmotionalIntelligence();
        this.initializeProactiveFeatures();
        this.setupMultimodalProcessing();
    }
    
    // Emotional Intelligence System
    setupEmotionalIntelligence() {
        this.emotionKeywords = {
            happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'love', 'awesome'],
            sad: ['sad', 'depressed', 'down', 'upset', 'disappointed', 'hurt', 'crying', 'terrible'],
            angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'hate'],
            anxious: ['worried', 'anxious', 'nervous', 'stressed', 'concerned', 'afraid', 'scared'],
            confused: ['confused', 'lost', 'unclear', 'puzzled', 'bewildered', 'perplexed'],
            excited: ['excited', 'thrilled', 'pumped', 'enthusiastic', 'eager', 'anticipating']
        };
        
        this.emotionalResponses = {
            happy: [
                "I'm so glad to hear that! Your happiness is contagious.",
                "That's wonderful! I love seeing you in such a positive mood.",
                "Your joy really brightens my day too!"
            ],
            sad: [
                "I'm sorry you're feeling down. I'm here if you need to talk.",
                "That sounds really difficult. Would you like to share more about it?",
                "I understand this must be hard for you. How can I help?"
            ],
            angry: [
                "I can sense your frustration. Let's work through this together.",
                "It sounds like something really bothered you. Want to tell me about it?",
                "I hear the anger in your words. Sometimes it helps to talk it out."
            ],
            anxious: [
                "I notice you seem worried. Take a deep breath - I'm here to help.",
                "Anxiety can be overwhelming. What's on your mind?",
                "Let's tackle this step by step. What's causing you the most concern?"
            ],
            confused: [
                "I can help clarify things for you. What specifically is unclear?",
                "Let's break this down together. What part is most confusing?",
                "No worries - confusion is normal. Let me help you understand."
            ],
            excited: [
                "Your excitement is infectious! Tell me more!",
                "I love your enthusiasm! What's got you so excited?",
                "That energy is amazing! Share the details with me!"
            ]
        };
    }
    
    detectEmotion(text, voiceData = null) {
        const words = text.toLowerCase().split(/\s+/);
        const emotionScores = {};
        
        // Initialize scores
        Object.keys(this.emotionKeywords).forEach(emotion => {
            emotionScores[emotion] = 0;
        });
        
        // Analyze text for emotional keywords
        words.forEach(word => {
            Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
                if (keywords.includes(word)) {
                    emotionScores[emotion]++;
                }
            });
        });
        
        // Analyze voice data if available
        if (voiceData) {
            this.analyzeVoiceEmotion(voiceData, emotionScores);
        }
        
        // Find dominant emotion
        const dominantEmotion = Object.entries(emotionScores)
            .reduce((max, [emotion, score]) => score > max.score ? {emotion, score} : max, {emotion: 'neutral', score: 0});
        
        // Update emotional state
        this.updateEmotionalState(dominantEmotion.emotion, dominantEmotion.score);
        
        return dominantEmotion.emotion;
    }
    
    analyzeVoiceEmotion(voiceData, emotionScores) {
        // Placeholder for voice emotion analysis
        // In a real implementation, this would analyze pitch, tone, speed, etc.
        if (voiceData.pitch > 200) emotionScores.excited += 0.5;
        if (voiceData.speed > 1.2) emotionScores.anxious += 0.3;
        if (voiceData.volume < 0.3) emotionScores.sad += 0.4;
    }
    
    updateEmotionalState(emotion, confidence) {
        this.emotionalState.current = emotion;
        this.emotionalState.history.push({
            emotion,
            confidence,
            timestamp: Date.now()
        });
        
        // Keep only recent emotional history
        if (this.emotionalState.history.length > 50) {
            this.emotionalState.history = this.emotionalState.history.slice(-50);
        }
        
        // Update patterns
        if (!this.emotionalState.patterns[emotion]) {
            this.emotionalState.patterns[emotion] = 0;
        }
        this.emotionalState.patterns[emotion]++;
    }
    
    generateEmotionalResponse(emotion) {
        const responses = this.emotionalResponses[emotion];
        if (responses && responses.length > 0) {
            return responses[Math.floor(Math.random() * responses.length)];
        }
        return '';
    }
    
    // Contextual Memory Enhancement
    updateContextualMemory(userInput, assistantResponse, context) {
        // Extract topic from input
        const topic = this.extractMainTopic(userInput);
        
        if (topic !== this.contextualMemory.currentTopic) {
            this.contextualMemory.topicHistory.push({
                topic: this.contextualMemory.currentTopic,
                timestamp: Date.now(),
                duration: Date.now() - (this.contextualMemory.lastTopicChange || Date.now())
            });
            
            this.contextualMemory.currentTopic = topic;
            this.contextualMemory.lastTopicChange = Date.now();
        }
        
        // Track conversation flow
        this.contextualMemory.conversationFlow.push({
            userInput,
            assistantResponse,
            topic,
            emotion: this.emotionalState.current,
            timestamp: Date.now()
        });
        
        // Keep conversation flow manageable
        if (this.contextualMemory.conversationFlow.length > 20) {
            this.contextualMemory.conversationFlow = this.contextualMemory.conversationFlow.slice(-20);
        }
    }
    
    extractMainTopic(text) {
        const topicKeywords = {
            'work': ['work', 'job', 'career', 'office', 'boss', 'colleague', 'meeting', 'project'],
            'family': ['family', 'mom', 'dad', 'parent', 'child', 'sibling', 'relative'],
            'health': ['health', 'doctor', 'medicine', 'sick', 'pain', 'exercise', 'diet'],
            'technology': ['computer', 'phone', 'app', 'software', 'internet', 'tech'],
            'entertainment': ['movie', 'music', 'game', 'book', 'show', 'fun', 'hobby'],
            'travel': ['travel', 'trip', 'vacation', 'flight', 'hotel', 'visit'],
            'education': ['school', 'study', 'learn', 'class', 'teacher', 'student'],
            'relationships': ['friend', 'relationship', 'dating', 'love', 'partner']
        };
        
        const words = text.toLowerCase().split(/\s+/);
        const topicScores = {};
        
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            topicScores[topic] = keywords.filter(keyword => 
                words.some(word => word.includes(keyword))
            ).length;
        });
        
        const mainTopic = Object.entries(topicScores)
            .reduce((max, [topic, score]) => score > max.score ? {topic, score} : max, {topic: 'general', score: 0});
        
        return mainTopic.topic;
    }
    
    // Proactive Assistance System
    initializeProactiveFeatures() {
        // Check for proactive opportunities every 5 minutes
        setInterval(() => {
            this.checkProactiveOpportunities();
        }, 300000);
        
        // Daily habit analysis
        setInterval(() => {
            this.analyzeUserHabits();
        }, 86400000); // 24 hours
    }
    
    checkProactiveOpportunities() {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        
        // Morning greeting suggestions
        if (hour === 8 && !this.hasGreetedToday()) {
            this.addProactiveSuggestion('greeting', 'Good morning! How are you feeling today?');
        }
        
        // Work break reminders
        if (this.isWorkingHours(hour) && this.hasBeenWorkingLong()) {
            this.addProactiveSuggestion('break', 'You\'ve been working for a while. How about taking a short break?');
        }
        
        // Evening wind-down
        if (hour === 21 && this.contextualMemory.userMood === 'stressed') {
            this.addProactiveSuggestion('relaxation', 'It seems like you\'ve had a stressful day. Would you like some relaxation suggestions?');
        }
    }
    
    addProactiveSuggestion(type, message) {
        this.proactiveAssistance.suggestions.push({
            type,
            message,
            timestamp: Date.now(),
            priority: this.calculateSuggestionPriority(type)
        });
        
        // Notify the main app if appropriate
        if (this.shouldShowProactiveSuggestion(type)) {
            this.app.showProactiveSuggestion(message);
        }
    }
    
    calculateSuggestionPriority(type) {
        const priorities = {
            'urgent': 5,
            'health': 4,
            'work': 3,
            'break': 2,
            'greeting': 1,
            'relaxation': 2
        };
        return priorities[type] || 1;
    }
    
    shouldShowProactiveSuggestion(type) {
        // Don't interrupt if user is actively engaged
        if (this.app.isProcessing) return false;
        
        // Check if similar suggestion was recently shown
        const recentSuggestions = this.proactiveAssistance.suggestions
            .filter(s => s.timestamp > Date.now() - 3600000) // Last hour
            .filter(s => s.type === type);
        
        return recentSuggestions.length === 0;
    }
    
    // Habit Analysis
    analyzeUserHabits() {
        const conversationTimes = this.contextualMemory.conversationFlow
            .map(c => new Date(c.timestamp).getHours());
        
        const timeFrequency = {};
        conversationTimes.forEach(hour => {
            timeFrequency[hour] = (timeFrequency[hour] || 0) + 1;
        });
        
        // Find peak usage hours
        const peakHours = Object.entries(timeFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => parseInt(hour));
        
        this.proactiveAssistance.habits.peakHours = peakHours;
        
        // Analyze topic preferences
        const topicFrequency = {};
        this.contextualMemory.conversationFlow.forEach(c => {
            topicFrequency[c.topic] = (topicFrequency[c.topic] || 0) + 1;
        });
        
        this.proactiveAssistance.habits.favoriteTopics = Object.entries(topicFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([topic]) => topic);
    }
    
    // Multimodal Processing
    setupMultimodalProcessing() {
        this.intentClassifier = {
