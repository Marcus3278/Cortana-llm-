class TaskHandler {
    constructor(llmClient, electronAPI) {
        this.llmClient = llmClient;
        this.electronAPI = electronAPI;
        this.tasks = null;
        this.weatherService = null;
        this.webSearchService = null;
        this.loadTaskDefinitions();
        this.initializeServices();
    }

    async initializeServices() {
        // Initialize weather service
        if (typeof WeatherService !== 'undefined') {
            this.weatherService = new WeatherService();
        } else {
            // Try to load weather service dynamically
            try {
                const WeatherServiceModule = await import('./weather-service.js');
                const WeatherServiceClass = WeatherServiceModule.default || WeatherServiceModule.WeatherService;
                this.weatherService = new WeatherServiceClass();
            } catch (error) {
                console.warn('Weather service not available:', error);
            }
        }

        // Initialize web search service
        if (typeof WebSearchService !== 'undefined') {
            this.webSearchService = new WebSearchService();
        } else {
            // Try to load web search service dynamically
            try {
                const WebSearchServiceModule = await import('./web-search-service.js');
                const WebSearchServiceClass = WebSearchServiceModule.default || WebSearchServiceModule.WebSearchService;
                this.webSearchService = new WebSearchServiceClass();
            } catch (error) {
                console.warn('Web search service not available:', error);
            }
        }
    }

    async loadTaskDefinitions() {
        try {
            const response = await fetch('../config/tasks.json');
            this.tasks = await response.json();
        } catch (error) {
            console.error('Failed to load task definitions:', error);
            this.tasks = this.getDefaultTasks();
        }
    }

    getDefaultTasks() {
        return {
            tasks: {
                weather: { keywords: ['weather', 'temperature', 'forecast'] },
                system_info: { keywords: ['system', 'computer', 'specs'] },
                file_search: { keywords: ['find', 'search', 'locate', 'file'] },
                calculation: { keywords: ['calculate', 'math', 'add', 'subtract'] },
                time_date: { keywords: ['time', 'date', 'clock', 'today'] }
            }
        };
    }

    detectTaskType(input) {
        if (!this.tasks) return 'general';

        const lowerInput = input.toLowerCase();
        let bestMatch = 'general';
        let maxScore = 0;

        for (const [taskType, taskConfig] of Object.entries(this.tasks.tasks)) {
            const score = this.calculateTaskScore(lowerInput, taskConfig.keywords || []);
            if (score > maxScore) {
                maxScore = score;
                bestMatch = taskType;
            }
        }

        return maxScore > 0.3 ? bestMatch : 'general';
    }

    calculateTaskScore(input, keywords) {
        let score = 0;
        const inputWords = input.split(' ');

        keywords.forEach(keyword => {
            if (input.includes(keyword.toLowerCase())) {
                score += 1;
            }
            
            // Check for partial matches
            inputWords.forEach(word => {
                if (word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word)) {
                    score += 0.5;
                }
            });
        });

        return score / keywords.length;
    }

    async executeTask(taskType, input, context = {}) {
        switch (taskType) {
            case 'weather':
                return await this.handleWeatherTask(input, context);
            case 'system_info':
                return await this.handleSystemInfoTask(input, context);
            case 'file_search':
                return await this.handleFileSearchTask(input, context);
            case 'calculation':
                return await this.handleCalculationTask(input, context);
            case 'time_date':
                return await this.handleTimeDateTask(input, context);
            case 'reminders':
                return await this.handleReminderTask(input, context);
            case 'applications':
                return await this.handleApplicationTask(input, context);
            case 'web_search':
                return await this.handleWebSearchTask(input, context);
            default:
                return await this.handleGeneralTask(input, context);
        }
    }

    async handleWeatherTask(input, context) {
        if (!this.weatherService) {
            return {
                type: 'weather',
                response: 'Weather service is not available. Please ensure the weather service is properly configured.',
                data: { error: 'service_unavailable' }
            };
        }

        try {
            // Extract location from input
            const location = this.weatherService.extractLocation(input) || context.location;
            
            // Determine if this is a forecast request
            const isForecast = this.weatherService.isForecastRequest(input);
            
            if (isForecast) {
                // Extract number of days if specified
                const daysMatch = input.match(/(\d+)\s*days?/i);
                const days = daysMatch ? Math.min(parseInt(daysMatch[1]), 5) : 3;
                
                return await this.weatherService.getWeatherForecast(location, days);
            } else {
                return await this.weatherService.getCurrentWeather(location);
            }
        } catch (error) {
            console.error('Weather task error:', error);
            return {
                type: 'weather',
                response: 'I encountered an error getting weather information. Please try again or check your internet connection.',
                data: { error: error.message }
            };
        }
    }

    async handleSystemInfoTask(input, context) {
        try {
            if (this.electronAPI && this.electronAPI.getSystemInfo) {
                const systemInfo = await this.electronAPI.getSystemInfo();
                
                const response = `Here's your system information:
• Platform: ${systemInfo.platform}
• Architecture: ${systemInfo.arch}
• CPU Cores: ${systemInfo.cpus}
• Memory: ${systemInfo.memory}
• Uptime: ${systemInfo.uptime}`;

                return {
                    type: 'system_info',
                    response,
                    data: systemInfo
                };
            }
        } catch (error) {
            console.error('Error getting system info:', error);
        }

        return {
            type: 'system_info',
            response: "I couldn't retrieve system information at the moment. Please ensure the application has the necessary permissions.",
            data: null
        };
    }

    async handleFileSearchTask(input, context) {
        // Extract search query
        const searchTerms = this.extractSearchTerms(input);
        
        if (!searchTerms) {
            return {
                type: 'file_search',
                response: "What would you like me to search for? Please specify a filename or keyword.",
                data: null
            };
        }

        try {
            if (this.electronAPI && this.electronAPI.searchFiles) {
                const files = await this.electronAPI.searchFiles(searchTerms);
                
                if (files.length > 0) {
                    const fileList = files.slice(0, 5).map(file => `• ${this.getFileName(file)}`).join('\n');
                    const response = `I found ${files.length} files matching "${searchTerms}". Here are the first 5:\n${fileList}`;
                    
                    return {
                        type: 'file_search',
                        response,
                        data: { query: searchTerms, results: files, count: files.length }
                    };
                } else {
                    return {
                        type: 'file_search',
                        response: `I couldn't find any files matching "${searchTerms}". Try using different keywords or check the file location.`,
                        data: { query: searchTerms, results: [], count: 0 }
                    };
                }
            }
        } catch (error) {
            console.error('Error searching files:', error);
        }

        return {
            type: 'file_search',
            response: "I'm unable to search files at the moment. Please check that the application has file system access.",
            data: null
        };
    }

    extractSearchTerms(input) {
        // Remove common words and extract meaningful search terms
        const commonWords = ['find', 'search', 'locate', 'look', 'for', 'my', 'the', 'a', 'an'];
        const words = input.toLowerCase().split(' ').filter(word => 
            word.length > 2 && !commonWords.includes(word)
        );
        
        return words.join(' ') || null;
    }

    getFileName(filePath) {
        return filePath.split(/[/\\]/).pop() || filePath;
    }

    async handleCalculationTask(input, context) {
        try {
            // Extract mathematical expression
            const expression = this.extractMathExpression(input);
            
            if (!expression) {
                return {
                    type: 'calculation',
                    response: "I couldn't find a mathematical expression to calculate. Please provide a clear math problem.",
                    data: null
                };
            }

            // Safely evaluate the expression
            const result = this.evaluateExpression(expression);
            
            return {
                type: 'calculation',
                response: `The result of ${expression} is ${result}.`,
                data: { expression, result }
            };
            
        } catch (error) {
            return {
                type: 'calculation',
                response: "I couldn't calculate that. Please check your math expression and try again.",
                data: { error: error.message }
            };
        }
    }

    extractMathExpression(input) {
        // Look for mathematical expressions
        const mathPattern = /[\d+\-*/.() ]+/g;
        const matches = input.match(mathPattern);
        
        if (matches) {
            // Return the longest match
            return matches.reduce((a, b) => a.length > b.length ? a : b).trim();
        }
        
        // Try to extract from common phrases
        const phrases = [
            /calculate\s+(.*)/i,
            /what\s+is\s+(.*)/i,
            /math[:\s]+(.*)/i
        ];
        
        for (const phrase of phrases) {
            const match = input.match(phrase);
            if (match) {
                return match[1].trim();
            }
        }
        
        return null;
    }

    evaluateExpression(expression) {
        // Simple and safe math evaluation
        // Remove any non-math characters for security
        const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
        
        // Use Function constructor for safer evaluation than eval
        try {
            return Function('"use strict"; return (' + sanitized + ')')();
        } catch (error) {
            throw new Error('Invalid mathematical expression');
        }
    }

    async handleTimeDateTask(input, context) {
        const now = new Date();
        
        if (input.toLowerCase().includes('time')) {
            const timeString = now.toLocaleTimeString();
            return {
                type: 'time_date',
                response: `The current time is ${timeString}.`,
                data: { type: 'time', value: timeString, timestamp: now.getTime() }
            };
        }
        
        if (input.toLowerCase().includes('date') || input.toLowerCase().includes('today')) {
            const dateString = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            return {
                type: 'time_date',
                response: `Today is ${dateString}.`,
                data: { type: 'date', value: dateString, timestamp: now.getTime() }
            };
        }
        
        // Default to both time and date
        const timeString = now.toLocaleTimeString();
        const dateString = now.toLocaleDateString();
        
        return {
            type: 'time_date',
            response: `It's ${timeString} on ${dateString}.`,
            data: { 
                type: 'both', 
                time: timeString, 
                date: dateString, 
                timestamp: now.getTime() 
            }
        };
    }

    async handleReminderTask(input, context) {
        // Extract reminder details
        const reminderText = this.extractReminderText(input);
        const reminderTime = this.extractReminderTime(input);
        
        return {
            type: 'reminders',
            response: `I'd love to set reminders for you! This feature will be available in a future update. For now, you might want to use your system's built-in reminder app.`,
            data: { 
                text: reminderText, 
                time: reminderTime, 
                status: 'not_implemented' 
            }
        };
    }

    extractReminderText(input) {
        const patterns = [
            /remind me to (.*?)(?:\s+at|\s+in|\s+on|$)/i,
            /reminder[:\s]+(.*?)(?:\s+at|\s+in|\s+on|$)/i
        ];
        
        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        
        return input;
    }

    extractReminderTime(input) {
        const timePatterns = [
            /at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
            /in\s+(\d+\s*(?:minutes?|hours?|days?))/i,
            /on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
        ];
        
        for (const pattern of timePatterns) {
            const match = input.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        
        return null;
    }

    async handleApplicationTask(input, context) {
        return {
            type: 'applications',
            response: "Application control features are coming soon! For now, you can use your system's built-in app launcher.",
            data: { status: 'not_implemented' }
        };
    }

    async handleWebSearchTask(input, context) {
        if (!this.webSearchService) {
            return {
                type: 'web_search',
                response: 'Web search service is not available. Please ensure the web search service is properly configured.',
                data: { error: 'service_unavailable' }
            };
        }

        try {
            // Extract search query from input
            const searchQuery = this.webSearchService.extractSearchQuery(input);
            
            if (!searchQuery) {
                return {
                    type: 'web_search',
                    response: 'What would you like me to search for? Please provide a search query.',
                    data: null
                };
            }

            // Perform the web search
            return await this.webSearchService.searchWeb(searchQuery, {
                maxResults: 5,
                instantAnswer: true
            });

        } catch (error) {
            console.error('Web search task error:', error);
            return {
                type: 'web_search',
                response: 'I encountered an error while searching. Please try again or check your internet connection.',
                data: { error: error.message }
            };
        }
    }

    async handleGeneralTask(input, context) {
        // Check if this might be a web search query
        if (this.webSearchService && this.webSearchService.isSearchQuery(input)) {
            return await this.handleWebSearchTask(input, context);
        }

        // Use the LLM for general conversation
        if (this.llmClient) {
            const response = await this.llmClient.generateResponse(input);
            return {
                type: 'general',
                response,
                data: { input, context }
            };
        }
        
        return {
            type: 'general',
            response: "I'm here to help! You can ask me about weather, time, calculations, file searches, system information, web searches, and general questions.",
            data: null
        };
    }

    // Utility methods
    getTaskDefinition(taskType) {
        return this.tasks?.tasks?.[taskType] || null;
    }

    getAvailableTasks() {
        return this.tasks ? Object.keys(this.tasks.tasks) : [];
    }

    getTaskExamples(taskType) {
        const task = this.getTaskDefinition(taskType);
        return task?.examples || [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskHandler;
} else {
    window.TaskHandler = TaskHandler;
}
