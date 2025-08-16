class LLMClient {
    constructor() {
        this.ollamaUrl = 'http://localhost:11434';
        this.currentModel = 'llama2:7b-chat';
        this.conversationHistory = [];
        this.maxHistoryLength = 10;
        this.isConnected = false;
        
        // System prompt for Cortana-like behavior
        this.systemPrompt = `You are Cortana, a helpful AI assistant. You should be friendly, concise, and helpful. 
        You can help with:
        - Weather information (ask user for location if needed)
        - System information and computer tasks
        - File searches and organization
        - Calculations and conversions
        - Reminders and scheduling
        - General questions and conversation
        
        Keep responses conversational and under 100 words unless more detail is specifically requested.
        If you need to perform system tasks, clearly explain what you're doing.`;
        
        this.init();
    }
    
    async init() {
        await this.checkConnection();
        if (!this.isConnected) {
            console.warn('Ollama not connected. Some features may not work.');
        }
    }
    
    async checkConnection() {
        try {
            const response = await fetch(`${this.ollamaUrl}/api/tags`);
            this.isConnected = response.ok;
            return this.isConnected;
        } catch (error) {
            console.error('Failed to connect to Ollama:', error);
            this.isConnected = false;
            return false;
        }
    }
    
    async getAvailableModels() {
        try {
            const response = await fetch(`${this.ollamaUrl}/api/tags`);
            if (response.ok) {
                const data = await response.json();
                return data.models || [];
            }
        } catch (error) {
            console.error('Failed to get models:', error);
        }
        return [];
    }
    
    async generateResponse(userInput, options = {}) {
        if (!this.isConnected) {
            return this.getFallbackResponse(userInput);
        }
        
        try {
            // Add user message to history
            this.addToHistory('user', userInput);
            
            // Prepare messages for the API
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...this.conversationHistory.slice(-this.maxHistoryLength)
            ];
            
            const requestBody = {
                model: options.model || this.currentModel,
                messages: messages,
                stream: false,
                options: {
                    temperature: options.temperature || 0.7,
                    top_p: options.top_p || 0.9,
                    max_tokens: options.max_tokens || 150
                }
            };
            
            const response = await fetch(`${this.ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const assistantResponse = data.message?.content || 'I apologize, but I couldn\'t generate a response.';
            
            // Add assistant response to history
            this.addToHistory('assistant', assistantResponse);
            
            return assistantResponse;
            
        } catch (error) {
            console.error('Error generating response:', error);
            return this.getFallbackResponse(userInput);
        }
    }
    
    getFallbackResponse(userInput) {
        const input = userInput.toLowerCase();
        
        // Greetings and introductions
        if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('good morning') || input.includes('good afternoon') || input.includes('good evening')) {
            const greetings = [
                "Hello! I'm Cortana, your personal AI assistant. How can I help you today?",
                "Hi there! I'm ready to assist you with various tasks. What would you like to do?",
                "Hey! Great to see you. I can help with weather, calculations, file searches, and much more!",
                "Good to see you! I'm Cortana, and I'm here to make your day more productive. What can I do for you?"
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }
        
        // Weather queries
        if (input.includes('weather') || input.includes('temperature') || input.includes('forecast') || input.includes('rain') || input.includes('sunny') || input.includes('cloudy')) {
            const weatherResponses = [
                "I'd love to help with weather information! The weather service is available - just specify your location and I'll get the current conditions for you.",
                "Weather updates coming right up! Which location would you like me to check? I can provide current conditions and forecasts.",
                "I can get weather information for you! Just tell me the city or location you're interested in."
            ];
            return weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
        }
        
        // Time queries
        if (input.includes('time') || input.includes('clock') || input.includes('what time')) {
            const now = new Date();
            const timeResponses = [
                `The current time is ${now.toLocaleTimeString()}.`,
                `It's ${now.toLocaleTimeString()} right now.`,
                `The time is currently ${now.toLocaleTimeString()}.`
            ];
            return timeResponses[Math.floor(Math.random() * timeResponses.length)];
        }
        
        // Date queries
        if (input.includes('date') || input.includes('today') || input.includes('what day')) {
            const now = new Date();
            const dateString = now.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const dateResponses = [
                `Today is ${dateString}.`,
                `It's ${dateString} today.`,
                `The current date is ${dateString}.`
            ];
            return dateResponses[Math.floor(Math.random() * dateResponses.length)];
        }
        
        // Calculator
        if (input.includes('calculate') || input.includes('math') || input.includes('add') || input.includes('subtract') || input.includes('multiply') || input.includes('divide') || /[\d+\-*/]/.test(input)) {
            try {
                // Extract mathematical expression
                const mathExpression = input.match(/[\d+\-*/.() ]+/);
                if (mathExpression) {
                    const expression = mathExpression[0].trim();
                    const result = Function('"use strict"; return (' + expression + ')')();
                    const calcResponses = [
                        `The result of ${expression} is ${result}.`,
                        `${expression} equals ${result}.`,
                        `That calculation gives us ${result}.`
                    ];
                    return calcResponses[Math.floor(Math.random() * calcResponses.length)];
                }
            } catch (error) {
                const errorResponses = [
                    "I couldn't calculate that. Could you please rephrase your math question?",
                    "That doesn't look like a valid mathematical expression. Try something like '2 + 2' or '10 * 5'.",
                    "I'm having trouble with that calculation. Please check the format and try again."
                ];
                return errorResponses[Math.floor(Math.random() * errorResponses.length)];
            }
        }
        
        // Search queries
        if (input.includes('search') || input.includes('find') || input.includes('look up') || input.includes('google')) {
            const searchResponses = [
                "I can help you search for information! The web search service is available - just tell me what you'd like to search for.",
                "Ready to search! What would you like me to look up for you? I can search the web and provide instant answers.",
                "I have web search capabilities! Just let me know what information you're looking for."
            ];
            return searchResponses[Math.floor(Math.random() * searchResponses.length)];
        }
        
        // File operations
        if (input.includes('file') || input.includes('document') || input.includes('folder') || input.includes('locate')) {
            const fileResponses = [
                "I can help you find files on your system! Just tell me what file or document you're looking for.",
                "File search is available! What file would you like me to locate for you?",
                "I can search through your files. What are you trying to find?"
            ];
            return fileResponses[Math.floor(Math.random() * fileResponses.length)];
        }
        
        // System information
        if (input.includes('system') || input.includes('computer') || input.includes('specs') || input.includes('performance')) {
            const systemResponses = [
                "I can provide system information! Would you like to know about your computer's specifications?",
                "System details coming up! I can show you information about your computer's hardware and performance.",
                "I have access to your system information. What would you like to know about your computer?"
            ];
            return systemResponses[Math.floor(Math.random() * systemResponses.length)];
        }
        
        // Help and capabilities
        if (input.includes('help') || input.includes('what can you do') || input.includes('capabilities') || input.includes('features')) {
            return `I'm Cortana, your AI assistant! Here's what I can help you with:

🌤️ **Weather**: Get current conditions and forecasts for any location
🔍 **Web Search**: Search the internet and get instant answers
📁 **File Search**: Find files and documents on your computer
🧮 **Calculations**: Solve math problems and equations
⏰ **Time & Date**: Get current time and date information
💻 **System Info**: Check your computer's specifications
💬 **Conversation**: Chat and ask questions about various topics

Just ask me naturally, like "What's the weather in New York?" or "Calculate 15 * 8" or "Search for artificial intelligence"!`;
        }
        
        // Personality responses
        if (input.includes('how are you') || input.includes('how do you feel')) {
            const personalityResponses = [
                "I'm doing great, thank you for asking! I'm ready to help you with whatever you need.",
                "I'm functioning perfectly and excited to assist you today! How can I help?",
                "I'm excellent, thanks! My systems are running smoothly and I'm ready for any task you have.",
                "I'm doing wonderful! I love helping people accomplish their goals. What can I do for you?"
            ];
            return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
        }
        
        if (input.includes('thank you') || input.includes('thanks')) {
            const thankResponses = [
                "You're very welcome! I'm always happy to help.",
                "My pleasure! Feel free to ask if you need anything else.",
                "Glad I could help! Is there anything else you'd like to know?",
                "You're welcome! I'm here whenever you need assistance."
            ];
            return thankResponses[Math.floor(Math.random() * thankResponses.length)];
        }
        
        if (input.includes('who are you') || input.includes('what are you')) {
            return "I'm Cortana, your personal AI assistant! I'm designed to help you with various tasks like getting weather information, searching the web, finding files, doing calculations, and having conversations. I run locally on your computer to keep your data private and secure.";
        }
        
        // Jokes and fun
        if (input.includes('joke') || input.includes('funny') || input.includes('humor')) {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything! 😄",
                "I told my computer a joke about UDP... but I'm not sure if it got it! 😂",
                "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
                "How do you comfort a JavaScript bug? You console it! 😊"
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
        }
        
        // Default conversational responses
        const defaultResponses = [
            "That's interesting! I'm currently running in offline mode, but I can still help with weather, web searches, calculations, file searches, and system information. What would you like to do?",
            "I understand! While I'm in offline mode right now, I have many capabilities available. I can help with weather updates, web searches, math calculations, finding files, and more. How can I assist you?",
            "I hear you! Even in offline mode, I can be quite helpful. I can check the weather, search the web, do calculations, find files on your computer, and provide system information. What interests you?",
            "I'm listening! Although I'm running in offline mode, I still have access to weather services, web search, calculation tools, file search, and system information. What can I help you with today?"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    addToHistory(role, content) {
        this.conversationHistory.push({ role, content });
        
        // Keep history within limits
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }
    }
    
    clearHistory() {
        this.conversationHistory = [];
    }
    
    async processTask(taskType, taskData) {
        switch (taskType) {
            case 'weather':
                return await this.handleWeatherTask(taskData);
            case 'system_info':
                return await this.handleSystemInfoTask();
            case 'file_search':
                return await this.handleFileSearchTask(taskData);
            case 'calculation':
                return await this.handleCalculationTask(taskData);
            case 'reminder':
                return await this.handleReminderTask(taskData);
            default:
                return await this.generateResponse(taskData.query || taskData);
        }
    }
    
    async handleWeatherTask(data) {
        // In a real implementation, you'd integrate with a weather API
        const location = data.location || 'your location';
        return `I'd love to get weather information for ${location}, but I need to connect to weather services. This feature will be available once weather API integration is set up.`;
    }
    
    async handleSystemInfoTask() {
        try {
            if (window.electronAPI) {
                const systemInfo = await window.electronAPI.getSystemInfo();
                return `Here's your system information:
                Platform: ${systemInfo.platform}
                Architecture: ${systemInfo.arch}
                CPU Cores: ${systemInfo.cpus}
                Memory: ${systemInfo.memory}
                Uptime: ${systemInfo.uptime}`;
            }
        } catch (error) {
            console.error('Error getting system info:', error);
        }
        return "I couldn't retrieve system information at the moment.";
    }
    
    async handleFileSearchTask(data) {
        try {
            if (window.electronAPI && data.query) {
                const files = await window.electronAPI.searchFiles(data.query);
                if (files.length > 0) {
                    const fileList = files.slice(0, 5).map(file => `• ${file}`).join('\n');
                    return `I found ${files.length} files matching "${data.query}". Here are the first 5:\n${fileList}`;
                } else {
                    return `I couldn't find any files matching "${data.query}".`;
                }
            }
        } catch (error) {
            console.error('Error searching files:', error);
        }
        return "I couldn't search for files at the moment.";
    }
    
    async handleCalculationTask(data) {
        try {
            const expression = data.expression || data.query;
            // Simple math evaluation (be careful with eval in production)
            const result = Function('"use strict"; return (' + expression + ')')();
            return `The result of ${expression} is ${result}.`;
        } catch (error) {
            return "I couldn't calculate that. Please check your math expression.";
        }
    }
    
    async handleReminderTask(data) {
        // In a real implementation, you'd integrate with a reminder system
        return `I'd love to set reminders for you! This feature will be available in a future update. For now, you might want to use your system's built-in reminder app.`;
    }
    
    // Configuration methods
    setModel(modelName) {
        this.currentModel = modelName;
    }
    
    setMaxHistoryLength(length) {
        this.maxHistoryLength = Math.max(1, Math.min(50, length));
    }
    
    getStatus() {
        return {
            isConnected: this.isConnected,
            currentModel: this.currentModel,
            historyLength: this.conversationHistory.length,
            maxHistoryLength: this.maxHistoryLength
        };
    }
    
    // Utility method to detect task type from user input
    detectTaskType(input) {
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('weather') || lowerInput.includes('temperature') || lowerInput.includes('forecast')) {
            return 'weather';
        }
        
        if (lowerInput.includes('system') || lowerInput.includes('computer') || lowerInput.includes('specs')) {
            return 'system_info';
        }
        
        if (lowerInput.includes('find file') || lowerInput.includes('search file') || lowerInput.includes('locate')) {
            return 'file_search';
        }
        
        if (lowerInput.includes('calculate') || lowerInput.includes('math') || /[\d+\-*/=]/.test(lowerInput)) {
            return 'calculation';
        }
        
        if (lowerInput.includes('remind') || lowerInput.includes('reminder') || lowerInput.includes('schedule')) {
            return 'reminder';
        }
        
        return 'general';
    }
}

// Export for use in other modules
window.LLMClient = LLMClient;
