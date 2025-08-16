class WebSearchService {
    constructor() {
        // Using DuckDuckGo Instant Answer API (no API key required)
        this.duckDuckGoUrl = 'https://api.duckduckgo.com/';
        this.searchEngines = {
            duckduckgo: 'https://duckduckgo.com/?q=',
            google: 'https://www.google.com/search?q=',
            bing: 'https://www.bing.com/search?q='
        };
        this.defaultEngine = 'duckduckgo';
    }

    async searchWeb(query, options = {}) {
        const { 
            engine = this.defaultEngine,
            maxResults = 5,
            safeSearch = true,
            instantAnswer = true
        } = options;

        try {
            // First try to get instant answers from DuckDuckGo
            if (instantAnswer) {
                const instantResult = await this.getInstantAnswer(query);
                if (instantResult && instantResult.hasAnswer) {
                    return instantResult;
                }
            }

            // If no instant answer, provide search suggestions
            return this.generateSearchResponse(query, engine);

        } catch (error) {
            console.error('Web search error:', error);
            return this.getOfflineSearchResponse(query, error.message);
        }
    }

    async getInstantAnswer(query) {
        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(
                `${this.duckDuckGoUrl}?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`DuckDuckGo API error: ${response.status}`);
            }

            const data = await response.json();
            return this.formatInstantAnswer(data, query);

        } catch (error) {
            console.error('Instant answer error:', error);
            return { hasAnswer: false, error: error.message };
        }
    }

    formatInstantAnswer(data, query) {
        let response = '';
        let hasAnswer = false;
        let answerData = {};

        // Check for abstract (Wikipedia-style answers)
        if (data.Abstract && data.Abstract.trim()) {
            response = data.Abstract;
            hasAnswer = true;
            answerData.source = data.AbstractSource || 'Wikipedia';
            answerData.url = data.AbstractURL;
        }
        // Check for definition
        else if (data.Definition && data.Definition.trim()) {
            response = data.Definition;
            hasAnswer = true;
            answerData.source = data.DefinitionSource || 'Dictionary';
            answerData.url = data.DefinitionURL;
        }
        // Check for answer (direct answers)
        else if (data.Answer && data.Answer.trim()) {
            response = data.Answer;
            hasAnswer = true;
            answerData.source = data.AnswerType || 'Calculation';
        }
        // Check for infobox data
        else if (data.Infobox && data.Infobox.content && data.Infobox.content.length > 0) {
            const infoItems = data.Infobox.content
                .filter(item => item.data_type === 'string' && item.value)
                .slice(0, 3)
                .map(item => `${item.label}: ${item.value}`)
                .join('\n');
            
            if (infoItems) {
                response = `Here's what I found about "${query}":\n\n${infoItems}`;
                hasAnswer = true;
                answerData.source = 'Infobox';
            }
        }

        if (hasAnswer) {
            // Add related topics if available
            if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                const relatedTopics = data.RelatedTopics
                    .slice(0, 3)
                    .map(topic => topic.Text)
                    .filter(text => text && text.trim())
                    .join('\n• ');
                
                if (relatedTopics) {
                    response += `\n\nRelated topics:\n• ${relatedTopics}`;
                }
            }

            return {
                type: 'web_search',
                response: response,
                hasAnswer: true,
                data: {
                    query,
                    source: answerData.source,
                    url: answerData.url,
                    timestamp: Date.now(),
                    searchType: 'instant_answer'
                }
            };
        }

        return { hasAnswer: false };
    }

    generateSearchResponse(query, engine) {
        const searchUrl = this.searchEngines[engine] + encodeURIComponent(query);
        
        const response = `I'll help you search for "${query}". Here are some ways to find information:

🔍 **Search Suggestions:**
• Try searching for more specific terms
• Use quotes for exact phrases: "${query}"
• Add context words to narrow results

🌐 **Search Online:**
You can search for this on ${engine === 'duckduckgo' ? 'DuckDuckGo' : engine === 'google' ? 'Google' : 'Bing'}.

💡 **Quick Tips:**
• For definitions, try: "define ${query}"
• For recent news, try: "${query} news"
• For how-to guides, try: "how to ${query}"`;

        return {
            type: 'web_search',
            response,
            data: {
                query,
                searchUrl,
                engine,
                suggestions: this.generateSearchSuggestions(query),
                timestamp: Date.now(),
                searchType: 'search_suggestions'
            }
        };
    }

    generateSearchSuggestions(query) {
        const suggestions = [];
        const lowerQuery = query.toLowerCase();

        // Add contextual suggestions based on query type
        if (lowerQuery.includes('how to') || lowerQuery.includes('how do')) {
            suggestions.push(`${query} tutorial`, `${query} guide`, `${query} step by step`);
        } else if (lowerQuery.includes('what is') || lowerQuery.includes('define')) {
            suggestions.push(`${query} definition`, `${query} meaning`, `${query} explanation`);
        } else if (lowerQuery.includes('best') || lowerQuery.includes('top')) {
            suggestions.push(`${query} 2024`, `${query} reviews`, `${query} comparison`);
        } else {
            // General suggestions
            suggestions.push(
                `${query} tutorial`,
                `${query} guide`,
                `${query} examples`,
                `latest ${query}`,
                `${query} news`
            );
        }

        return suggestions.slice(0, 5);
    }

    getOfflineSearchResponse(query, error) {
        let response = `I'm unable to search the web for "${query}" right now.`;
        
        if (error.includes('network') || error.includes('fetch')) {
            response += '\n\nPlease check your internet connection and try again.';
        } else {
            response += '\n\nThere seems to be an issue with the search service.';
        }

        response += `\n\n💡 **Alternative suggestions:**
• Try searching directly on your preferred search engine
• Check if the query spelling is correct
• Try using different keywords
• Search for "${query}" when you're back online`;

        return {
            type: 'web_search',
            response,
            data: { 
                query, 
                error, 
                offline: true,
                timestamp: Date.now(),
                searchType: 'offline'
            }
        };
    }

    // Utility methods
    isSearchQuery(input) {
        const searchKeywords = [
            'search', 'google', 'look up', 'find information', 'search for',
            'what is', 'who is', 'where is', 'when is', 'how to', 'why',
            'tell me about', 'information about', 'learn about'
        ];
        
        const lowerInput = input.toLowerCase();
        return searchKeywords.some(keyword => lowerInput.includes(keyword));
    }

    extractSearchQuery(input) {
        const patterns = [
            /search\s+(?:for\s+)?(.+)/i,
            /google\s+(.+)/i,
            /look\s+up\s+(.+)/i,
            /find\s+information\s+(?:about\s+)?(.+)/i,
            /what\s+is\s+(.+)/i,
            /who\s+is\s+(.+)/i,
            /where\s+is\s+(.+)/i,
            /when\s+is\s+(.+)/i,
            /how\s+to\s+(.+)/i,
            /why\s+(.+)/i,
            /tell\s+me\s+about\s+(.+)/i,
            /information\s+about\s+(.+)/i,
            /learn\s+about\s+(.+)/i
        ];

        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        // If no pattern matches but it's identified as a search query,
        // return the input with common search words removed
        const searchWords = ['search', 'google', 'look up', 'find', 'information'];
        let cleanQuery = input.toLowerCase();
        
        searchWords.forEach(word => {
            cleanQuery = cleanQuery.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
        });
        
        return cleanQuery.trim() || input;
    }

    getSearchEngineInfo(engine) {
        const engines = {
            duckduckgo: {
                name: 'DuckDuckGo',
                description: 'Privacy-focused search engine',
                features: ['No tracking', 'Instant answers', 'Privacy protection']
            },
            google: {
                name: 'Google',
                description: 'Most comprehensive search results',
                features: ['Comprehensive results', 'Advanced algorithms', 'Rich snippets']
            },
            bing: {
                name: 'Bing',
                description: 'Microsoft\'s search engine',
                features: ['Visual search', 'Rewards program', 'Integration with Microsoft services']
            }
        };

        return engines[engine] || engines.duckduckgo;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSearchService;
} else {
    window.WebSearchService = WebSearchService;
}
