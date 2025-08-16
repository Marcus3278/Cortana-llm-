class LearningSystem {
    constructor() {
        this.userProfile = {
            name: null,
            preferences: {},
            interests: [],
            conversationHistory: [],
            personalInfo: {},
            habits: {},
            learningData: {},
            personality: {
                traits: {},
                communicationStyle: 'friendly',
                responseLength: 'medium',
                formalityLevel: 'casual'
            }
        };
        
        this.memoryStorage = {
            shortTerm: [], // Recent conversations
            longTerm: [], // Important facts and preferences
            episodic: [], // Specific events and experiences
            semantic: {}, // General knowledge about the user
            procedural: {} // How-to knowledge and skills
        };
        
        this.learningPatterns = {
            timePreferences: {},
            topicInterests: {},
            responseStyles: {},
            frequentRequests: {},
            emotionalPatterns: {},
            learningSpeed: {},
            retentionRate: {}
        };
        
        this.adaptiveBehavior = {
            responsePersonalization: true,
            contextualAwareness: true,
            emotionalIntelligence: true,
            proactiveAssistance: true
        };
        
        this.maxShortTermMemory = 100;
        this.maxLongTermMemory = 1000;
        this.learningThreshold = 2; // Reduced for faster learning
        this.confidenceThreshold = 0.7;
        
        this.init();
    }
    
    init() {
        this.loadUserProfile();
        this.loadMemoryStorage();
        this.startLearningAnalysis();
    }
    
    // User Profile Management
    loadUserProfile() {
        try {
            const saved = localStorage.getItem('cortana-user-profile');
            if (saved) {
                this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
                console.log('User profile loaded:', this.userProfile.name || 'Anonymous');
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }
    
    saveUserProfile() {
        try {
            localStorage.setItem('cortana-user-profile', JSON.stringify(this.userProfile));
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    }
    
    loadMemoryStorage() {
        try {
            const saved = localStorage.getItem('cortana-memory-storage');
            if (saved) {
                this.memoryStorage = { ...this.memoryStorage, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading memory storage:', error);
        }
    }
    
    saveMemoryStorage() {
        try {
            localStorage.setItem('cortana-memory-storage', JSON.stringify(this.memoryStorage));
        } catch (error) {
            console.error('Error saving memory storage:', error);
        }
    }
    
    // Learning from Conversations
    learnFromConversation(userInput, assistantResponse, context = {}) {
        const timestamp = Date.now();
        const conversation = {
            userInput,
            assistantResponse,
            timestamp,
            context,
            id: this.generateId()
        };
        
        // Add to short-term memory
        this.addToShortTermMemory(conversation);
        
        // Extract learning patterns
        this.extractLearningPatterns(userInput, context);
        
        // Detect personal information
        this.detectPersonalInfo(userInput);
        
        // Learn preferences
        this.learnPreferences(userInput, context);
        
        // Update conversation history
        this.updateConversationHistory(conversation);
        
        // Save changes
        this.saveUserProfile();
        this.saveMemoryStorage();
    }
    
    addToShortTermMemory(conversation) {
        this.memoryStorage.shortTerm.unshift(conversation);
        
        // Maintain size limit
        if (this.memoryStorage.shortTerm.length > this.maxShortTermMemory) {
            const removed = this.memoryStorage.shortTerm.pop();
            this.considerForLongTermMemory(removed);
        }
    }
    
    considerForLongTermMemory(conversation) {
        // Criteria for long-term memory
        const isImportant = this.isConversationImportant(conversation);
        const hasPersonalInfo = this.containsPersonalInfo(conversation.userInput);
        const isFrequentTopic = this.isFrequentTopic(conversation.userInput);
        
        if (isImportant || hasPersonalInfo || isFrequentTopic) {
            this.addToLongTermMemory(conversation);
        }
    }
    
    addToLongTermMemory(conversation) {
        this.memoryStorage.longTerm.unshift(conversation);
        
        // Maintain size limit
        if (this.memoryStorage.longTerm.length > this.maxLongTermMemory) {
            this.memoryStorage.longTerm.pop();
        }
    }
    
    // Pattern Recognition
    extractLearningPatterns(userInput, context) {
        const hour = new Date().getHours();
        const dayOfWeek = new Date().getDay();
        
        // Time-based patterns
        if (!this.learningPatterns.timePreferences[hour]) {
            this.learningPatterns.timePreferences[hour] = [];
        }
        this.learningPatterns.timePreferences[hour].push({
            input: userInput,
            timestamp: Date.now()
        });
        
        // Topic interest patterns
        const topics = this.extractTopics(userInput);
        topics.forEach(topic => {
            if (!this.learningPatterns.topicInterests[topic]) {
                this.learningPatterns.topicInterests[topic] = 0;
            }
            this.learningPatterns.topicInterests[topic]++;
        });
        
        // Frequent request patterns
        const requestType = this.categorizeRequest(userInput);
        if (!this.learningPatterns.frequentRequests[requestType]) {
            this.learningPatterns.frequentRequests[requestType] = 0;
        }
        this.learningPatterns.frequentRequests[requestType]++;
    }
    
    detectPersonalInfo(userInput) {
        const input = userInput.toLowerCase();
        
        // Name detection
        const namePatterns = [
            /my name is (\w+)/i,
            /i'm (\w+)/i,
            /call me (\w+)/i,
            /i am (\w+)/i
        ];
        
        namePatterns.forEach(pattern => {
            const match = input.match(pattern);
            if (match && match[1]) {
                this.userProfile.name = match[1];
                this.addToSemanticMemory('name', match[1]);
            }
        });
        
        // Age detection
        const agePattern = /i am (\d+) years old|i'm (\d+)|my age is (\d+)/i;
        const ageMatch = input.match(agePattern);
        if (ageMatch) {
            const age = ageMatch[1] || ageMatch[2] || ageMatch[3];
            this.userProfile.personalInfo.age = parseInt(age);
            this.addToSemanticMemory('age', age);
        }
        
        // Location detection
        const locationPatterns = [
            /i live in (\w+)/i,
            /i'm from (\w+)/i,
            /my city is (\w+)/i
        ];
        
        locationPatterns.forEach(pattern => {
            const match = input.match(pattern);
            if (match && match[1]) {
                this.userProfile.personalInfo.location = match[1];
                this.addToSemanticMemory('location', match[1]);
            }
        });
        
        // Occupation detection
        const jobPatterns = [
            /i work as (\w+)/i,
            /i'm a (\w+)/i,
            /my job is (\w+)/i,
            /i am a (\w+)/i
        ];
        
        jobPatterns.forEach(pattern => {
            const match = input.match(pattern);
            if (match && match[1]) {
                this.userProfile.personalInfo.occupation = match[1];
                this.addToSemanticMemory('occupation', match[1]);
            }
        });
    }
    
    learnPreferences(userInput, context) {
        const input = userInput.toLowerCase();
        
        // Music preferences
        if (input.includes('music') || input.includes('song') || input.includes('artist')) {
            const musicKeywords = this.extractMusicKeywords(input);
            musicKeywords.forEach(keyword => {
                if (!this.userProfile.preferences.music) {
                    this.userProfile.preferences.music = [];
                }
                if (!this.userProfile.preferences.music.includes(keyword)) {
                    this.userProfile.preferences.music.push(keyword);
                }
            });
        }
        
        // Food preferences
        if (input.includes('food') || input.includes('eat') || input.includes('restaurant')) {
            const foodKeywords = this.extractFoodKeywords(input);
            foodKeywords.forEach(keyword => {
                if (!this.userProfile.preferences.food) {
                    this.userProfile.preferences.food = [];
                }
                if (!this.userProfile.preferences.food.includes(keyword)) {
                    this.userProfile.preferences.food.push(keyword);
                }
            });
        }
        
        // Activity preferences
        if (input.includes('like') || input.includes('enjoy') || input.includes('love')) {
            const activities = this.extractActivities(input);
            activities.forEach(activity => {
                if (!this.userProfile.preferences.activities) {
                    this.userProfile.preferences.activities = [];
                }
                if (!this.userProfile.preferences.activities.includes(activity)) {
                    this.userProfile.preferences.activities.push(activity);
                }
            });
        }
    }
    
    addToSemanticMemory(key, value) {
        if (!this.memoryStorage.semantic[key]) {
            this.memoryStorage.semantic[key] = [];
        }
        
        const entry = {
            value,
            timestamp: Date.now(),
            confidence: 1.0
        };
        
        this.memoryStorage.semantic[key].push(entry);
    }
    
    // Utility Methods
    extractTopics(input) {
        const topics = [];
        const topicKeywords = {
            'weather': ['weather', 'temperature', 'rain', 'sunny', 'cloudy'],
            'technology': ['computer', 'software', 'app', 'tech', 'programming'],
            'music': ['music', 'song', 'artist', 'album', 'concert'],
            'food': ['food', 'restaurant', 'cooking', 'recipe', 'meal'],
            'sports': ['sports', 'game', 'team', 'player', 'match'],
            'travel': ['travel', 'trip', 'vacation', 'flight', 'hotel'],
            'work': ['work', 'job', 'career', 'office', 'meeting'],
            'health': ['health', 'doctor', 'exercise', 'fitness', 'medical']
        };
        
        Object.keys(topicKeywords).forEach(topic => {
            if (topicKeywords[topic].some(keyword => input.toLowerCase().includes(keyword))) {
                topics.push(topic);
            }
        });
        
        return topics;
    }
    
    categorizeRequest(input) {
        const input_lower = input.toLowerCase();
        
        if (input_lower.includes('what') || input_lower.includes('how') || input_lower.includes('why')) {
            return 'question';
        } else if (input_lower.includes('remind') || input_lower.includes('schedule')) {
            return 'reminder';
        } else if (input_lower.includes('play') || input_lower.includes('music')) {
            return 'entertainment';
        } else if (input_lower.includes('weather')) {
            return 'weather';
        } else if (input_lower.includes('calculate') || input_lower.includes('math')) {
            return 'calculation';
        } else {
            return 'general';
        }
    }
    
    extractMusicKeywords(input) {
        const musicGenres = ['rock', 'pop', 'jazz', 'classical', 'hip hop', 'country', 'electronic', 'blues'];
        const found = [];
        
        musicGenres.forEach(genre => {
            if (input.includes(genre)) {
                found.push(genre);
            }
        });
        
        return found;
    }
    
    extractFoodKeywords(input) {
        const foodTypes = ['pizza', 'burger', 'sushi', 'pasta', 'salad', 'chinese', 'italian', 'mexican', 'indian'];
        const found = [];
        
        foodTypes.forEach(food => {
            if (input.includes(food)) {
                found.push(food);
            }
        });
        
        return found;
    }
    
    extractActivities(input) {
        const activities = ['reading', 'gaming', 'cooking', 'traveling', 'sports', 'movies', 'music', 'art'];
        const found = [];
        
        activities.forEach(activity => {
            if (input.includes(activity)) {
                found.push(activity);
            }
        });
        
        return found;
    }
    
    isConversationImportant(conversation) {
        const importantKeywords = ['important', 'remember', 'don\'t forget', 'remind me', 'birthday', 'anniversary'];
        return importantKeywords.some(keyword => 
            conversation.userInput.toLowerCase().includes(keyword)
        );
    }
    
    containsPersonalInfo(input) {
        const personalKeywords = ['my name', 'i am', 'i live', 'my age', 'my job', 'i work'];
        return personalKeywords.some(keyword => 
            input.toLowerCase().includes(keyword)
        );
    }
    
    isFrequentTopic(input) {
        const topics = this.extractTopics(input);
        return topics.some(topic => 
            this.learningPatterns.topicInterests[topic] >= this.learningThreshold
        );
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    updateConversationHistory(conversation) {
        this.userProfile.conversationHistory.unshift(conversation);
        
        // Keep only recent conversations in profile
        if (this.userProfile.conversationHistory.length > 20) {
            this.userProfile.conversationHistory = this.userProfile.conversationHistory.slice(0, 20);
        }
    }
    
    startLearningAnalysis() {
        // Periodic analysis of learning patterns
        setInterval(() => {
            this.analyzeLearningPatterns();
        }, 300000); // Every 5 minutes
    }
    
    analyzeLearningPatterns() {
        // Analyze time-based patterns
        const currentHour = new Date().getHours();
        const hourlyPatterns = this.learningPatterns.timePreferences[currentHour];
        
        if (hourlyPatterns && hourlyPatterns.length > 5) {
            // User is active at this time - could suggest proactive assistance
            console.log(`User is typically active at ${currentHour}:00`);
        }
        
        // Analyze topic interests
        const topInterests = Object.entries(this.learningPatterns.topicInterests)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);
        
        if (topInterests.length > 0) {
            console.log('Top user interests:', topInterests.map(([topic]) => topic));
        }
    }
    
    // Public API Methods
    getUserProfile() {
        return this.userProfile;
    }
    
    getPersonalizedGreeting() {
        const hour = new Date().getHours();
        let timeGreeting;
        
        if (hour < 12) {
            timeGreeting = 'Good morning';
        } else if (hour < 18) {
            timeGreeting = 'Good afternoon';
        } else {
            timeGreeting = 'Good evening';
        }
        
        const name = this.userProfile.name;
        return name ? `${timeGreeting}, ${name}!` : `${timeGreeting}!`;
    }
    
    getContextualResponse(input) {
        // Generate contextual responses based on learned preferences
        const topics = this.extractTopics(input);
        const preferences = this.userProfile.preferences;
        
        let context = '';
        
        // Add personal context if relevant
        if (topics.includes('music') && preferences.music) {
            context += ` I remember you like ${preferences.music.join(', ')}.`;
        }
        
        if (topics.includes('food') && preferences.food) {
            context += ` You've mentioned enjoying ${preferences.food.join(', ')}.`;
        }
        
        return context;
    }
    
    getRelevantMemories(query) {
        const queryLower = query.toLowerCase();
        const relevantMemories = [];
        
        // Search short-term memory
        this.memoryStorage.shortTerm.forEach(memory => {
            if (memory.userInput.toLowerCase().includes(queryLower) ||
                memory.assistantResponse.toLowerCase().includes(queryLower)) {
                relevantMemories.push(memory);
            }
        });
        
        // Search long-term memory
        this.memoryStorage.longTerm.forEach(memory => {
            if (memory.userInput.toLowerCase().includes(queryLower) ||
                memory.assistantResponse.toLowerCase().includes(queryLower)) {
                relevantMemories.push(memory);
            }
        });
        
        return relevantMemories.slice(0, 5); // Return top 5 relevant memories
    }
    
    clearMemory() {
        this.memoryStorage = {
            shortTerm: [],
            longTerm: [],
            episodic: [],
            semantic: {}
        };
        this.saveMemoryStorage();
    }
    
    exportLearningData() {
        return {
            userProfile: this.userProfile,
            memoryStorage: this.memoryStorage,
            learningPatterns: this.learningPatterns
        };
    }
    
    importLearningData(data) {
        if (data.userProfile) this.userProfile = data.userProfile;
        if (data.memoryStorage) this.memoryStorage = data.memoryStorage;
        if (data.learningPatterns) this.learningPatterns = data.learningPatterns;
        
        this.saveUserProfile();
        this.saveMemoryStorage();
    }
}

// Export for use in other modules
window.LearningSystem = LearningSystem;
