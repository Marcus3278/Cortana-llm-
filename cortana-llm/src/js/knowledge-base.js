class KnowledgeBase {
    constructor() {
        this.knowledgeGraph = new Map();
        this.factDatabase = new Map();
        this.conceptRelations = new Map();
        this.userKnowledge = new Map();
        this.contextualMemory = [];
        this.semanticIndex = new Map();
        
        // Initialize with broad knowledge categories
        this.initializeKnowledgeCategories();
        this.loadStoredKnowledge();
    }
    
    initializeKnowledgeCategories() {
        const categories = {
            'science': {
                'physics': ['quantum mechanics', 'relativity', 'thermodynamics', 'electromagnetism'],
                'chemistry': ['organic chemistry', 'inorganic chemistry', 'biochemistry', 'physical chemistry'],
                'biology': ['genetics', 'evolution', 'ecology', 'molecular biology'],
                'astronomy': ['planets', 'stars', 'galaxies', 'cosmology'],
                'mathematics': ['algebra', 'calculus', 'geometry', 'statistics']
            },
            'technology': {
                'programming': ['javascript', 'python', 'java', 'c++', 'web development'],
                'ai': ['machine learning', 'deep learning', 'neural networks', 'nlp'],
                'hardware': ['computers', 'smartphones', 'processors', 'memory'],
                'internet': ['protocols', 'security', 'cloud computing', 'networking']
            },
            'history': {
                'ancient': ['egypt', 'greece', 'rome', 'mesopotamia'],
                'medieval': ['middle ages', 'renaissance', 'crusades'],
                'modern': ['industrial revolution', 'world wars', 'cold war'],
                'contemporary': ['21st century', 'globalization', 'digital age']
            },
            'arts': {
                'visual': ['painting', 'sculpture', 'photography', 'digital art'],
                'performing': ['music', 'theater', 'dance', 'opera'],
                'literature': ['poetry', 'novels', 'drama', 'essays'],
                'film': ['cinema', 'documentaries', 'animation', 'genres']
            },
            'geography': {
                'continents': ['africa', 'asia', 'europe', 'north america', 'south america', 'australia', 'antarctica'],
                'countries': ['capitals', 'cultures', 'languages', 'economies'],
                'physical': ['mountains', 'rivers', 'oceans', 'climate'],
                'human': ['cities', 'population', 'migration', 'urbanization']
            },
            'health': {
                'medicine': ['anatomy', 'physiology', 'diseases', 'treatments'],
                'nutrition': ['vitamins', 'minerals', 'diet', 'metabolism'],
                'fitness': ['exercise', 'strength training', 'cardio', 'flexibility'],
                'mental': ['psychology', 'stress management', 'meditation', 'therapy']
            }
        };
        
        // Build knowledge graph
        Object.entries(categories).forEach(([domain, subdomains]) => {
            this.knowledgeGraph.set(domain, subdomains);
            Object.entries(subdomains).forEach(([subdomain, topics]) => {
                topics.forEach(topic => {
                    this.addConceptRelation(topic, subdomain, domain);
                });
            });
        });
    }
    
    addConceptRelation(concept, parent, domain) {
        if (!this.conceptRelations.has(concept)) {
            this.conceptRelations.set(concept, {
                parent,
                domain,
                related: [],
                confidence: 1.0,
                lastAccessed: Date.now()
            });
        }
    }
    
    addFact(subject, predicate, object, source = 'user', confidence = 0.8) {
        const factId = `${subject}_${predicate}_${object}`;
        const fact = {
            subject,
            predicate,
            object,
            source,
            confidence,
            timestamp: Date.now(),
            accessCount: 0
        };
        
        this.factDatabase.set(factId, fact);
        this.indexFact(fact);
        this.saveKnowledge();
    }
    
    indexFact(fact) {
        // Create semantic index for fast retrieval
        const terms = [fact.subject, fact.predicate, fact.object]
            .join(' ')
            .toLowerCase()
            .split(/\s+/);
        
        terms.forEach(term => {
            if (!this.semanticIndex.has(term)) {
                this.semanticIndex.set(term, []);
            }
            this.semanticIndex.get(term).push(fact);
        });
    }
    
    queryKnowledge(query, limit = 10) {
        const queryTerms = query.toLowerCase().split(/\s+/);
        const results = new Map();
        
        queryTerms.forEach(term => {
            if (this.semanticIndex.has(term)) {
                this.semanticIndex.get(term).forEach(fact => {
                    const factId = `${fact.subject}_${fact.predicate}_${fact.object}`;
                    if (!results.has(factId)) {
                        results.set(factId, { fact, score: 0 });
                    }
                    results.get(factId).score += fact.confidence;
                });
            }
        });
        
        // Sort by relevance score
        return Array.from(results.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(result => result.fact);
    }
    
    learnFromText(text, context = {}) {
        // Extract facts from natural language text
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        
        sentences.forEach(sentence => {
            const facts = this.extractFactsFromSentence(sentence.trim());
            facts.forEach(fact => {
                this.addFact(fact.subject, fact.predicate, fact.object, 'conversation', 0.7);
            });
        });
        
        // Learn user preferences and information
        this.extractUserInformation(text, context);
        
        // Update contextual memory
        this.updateContextualMemory(text, context);
    }
    
    extractFactsFromSentence(sentence) {
        const facts = [];
        const lowerSentence = sentence.toLowerCase();
        
        // Pattern matching for common fact structures
        const patterns = [
            // "X is Y" pattern
            {
                regex: /(.+?)\s+(?:is|are|was|were)\s+(.+)/,
                extract: (match) => ({
                    subject: match[1].trim(),
                    predicate: 'is',
                    object: match[2].trim()
                })
            },
            // "X has Y" pattern
            {
                regex: /(.+?)\s+(?:has|have|had)\s+(.+)/,
                extract: (match) => ({
                    subject: match[1].trim(),
                    predicate: 'has',
                    object: match[2].trim()
                })
            },
            // "X likes Y" pattern
            {
                regex: /(.+?)\s+(?:likes?|loves?|enjoys?|prefers?)\s+(.+)/,
                extract: (match) => ({
                    subject: match[1].trim(),
                    predicate: 'likes',
                    object: match[2].trim()
                })
            },
            // "X lives in Y" pattern
            {
                regex: /(.+?)\s+(?:lives?|lived)\s+(?:in|at)\s+(.+)/,
                extract: (match) => ({
                    subject: match[1].trim(),
                    predicate: 'lives_in',
                    object: match[2].trim()
                })
            },
            // "X works as Y" pattern
            {
                regex: /(.+?)\s+(?:works?|worked)\s+(?:as|at)\s+(.+)/,
                extract: (match) => ({
                    subject: match[1].trim(),
                    predicate: 'works_as',
                    object: match[2].trim()
                })
            }
        ];
        
        patterns.forEach(pattern => {
            const match = lowerSentence.match(pattern.regex);
            if (match) {
                facts.push(pattern.extract(match));
            }
        });
        
        return facts;
    }
    
    extractUserInformation(text, context) {
        const lowerText = text.toLowerCase();
        
        // Extract personal information
        const personalPatterns = {
            name: [/my name is (\w+)/i, /i'm (\w+)/i, /call me (\w+)/i],
            age: [/i am (\d+) years old/i, /i'm (\d+)/i, /my age is (\d+)/i],
            location: [/i live in ([^,.]+)/i, /i'm from ([^,.]+)/i, /my city is ([^,.]+)/i],
            occupation: [/i work as ([^,.]+)/i, /i'm a ([^,.]+)/i, /my job is ([^,.]+)/i],
            education: [/i studied ([^,.]+)/i, /i have a degree in ([^,.]+)/i, /i graduated from ([^,.]+)/i]
        };
        
        Object.entries(personalPatterns).forEach(([key, patterns]) => {
            patterns.forEach(pattern => {
                const match = text.match(pattern);
                if (match && match[1]) {
                    this.userKnowledge.set(key, {
                        value: match[1].trim(),
                        confidence: 0.9,
                        timestamp: Date.now(),
                        source: 'direct_statement'
                    });
                }
            });
        });
        
        // Extract interests and preferences
        const interestPatterns = [
            /i like ([^,.]+)/i,
            /i love ([^,.]+)/i,
            /i enjoy ([^,.]+)/i,
            /i'm interested in ([^,.]+)/i,
            /my favorite ([^,]+) is ([^,.]+)/i
        ];
        
        interestPatterns.forEach(pattern => {
            const matches = [...text.matchAll(new RegExp(pattern, 'gi'))];
            matches.forEach(match => {
                if (match[1]) {
                    const interest = match[1].trim();
                    this.addUserInterest(interest, 0.8);
                }
                if (match[2]) {
                    const favorite = match[2].trim();
                    this.addUserInterest(favorite, 0.9);
                }
            });
        });
    }
    
    addUserInterest(interest, confidence = 0.7) {
        const interestKey = `interest_${interest.toLowerCase().replace(/\s+/g, '_')}`;
        this.userKnowledge.set(interestKey, {
            value: interest,
            confidence,
            timestamp: Date.now(),
            type: 'interest'
        });
    }
    
    updateContextualMemory(text, context) {
        const memoryEntry = {
            text,
            context,
            timestamp: Date.now(),
            topics: this.extractTopics(text),
            sentiment: this.analyzeSentiment(text),
            importance: this.calculateImportance(text, context)
        };
        
        this.contextualMemory.unshift(memoryEntry);
        
        // Keep only recent contextual memory
        if (this.contextualMemory.length > 100) {
            this.contextualMemory = this.contextualMemory.slice(0, 100);
        }
    }
    
    extractTopics(text) {
        const topics = [];
        const lowerText = text.toLowerCase();
        
        // Check against knowledge graph
        this.knowledgeGraph.forEach((subdomains, domain) => {
            if (lowerText.includes(domain)) {
                topics.push(domain);
            }
            Object.entries(subdomains).forEach(([subdomain, topicList]) => {
                if (lowerText.includes(subdomain)) {
                    topics.push(subdomain);
                }
                topicList.forEach(topic => {
                    if (lowerText.includes(topic)) {
                        topics.push(topic);
                    }
                });
            });
        });
        
        return [...new Set(topics)]; // Remove duplicates
    }
    
    analyzeSentiment(text) {
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'enjoy', 'happy'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed'];
        
        const words = text.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) positiveCount++;
            if (negativeWords.includes(word)) negativeCount++;
        });
        
        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }
    
    calculateImportance(text, context) {
        let importance = 0.5; // Base importance
        
        // Increase importance for personal information
        if (text.toLowerCase().includes('my') || text.toLowerCase().includes('i am')) {
            importance += 0.3;
        }
        
        // Increase importance for preferences
        if (text.toLowerCase().includes('like') || text.toLowerCase().includes('prefer')) {
            importance += 0.2;
        }
        
        // Increase importance for questions
        if (text.includes('?')) {
            importance += 0.1;
        }
        
        // Increase importance for voice input
        if (context.source === 'voice') {
            importance += 0.1;
        }
        
        return Math.min(importance, 1.0);
    }
    
    generateContextualResponse(query) {
        const relevantFacts = this.queryKnowledge(query, 5);
        const userInfo = this.getUserRelevantInfo(query);
        const recentContext = this.getRecentContext(query);
        
        let response = '';
        
        // Add personal context if relevant
        if (userInfo.length > 0) {
            response += this.formatUserContext(userInfo) + ' ';
        }
        
        // Add factual information
        if (relevantFacts.length > 0) {
            response += this.formatFactualResponse(relevantFacts, query) + ' ';
        }
        
        // Add contextual information
        if (recentContext.length > 0) {
            response += this.formatContextualInfo(recentContext) + ' ';
        }
        
        return response.trim();
    }
    
    getUserRelevantInfo(query) {
        const relevantInfo = [];
        const queryLower = query.toLowerCase();
        
        this.userKnowledge.forEach((info, key) => {
            if (queryLower.includes(info.value.toLowerCase()) || 
                key.includes(queryLower.split(' ')[0])) {
                relevantInfo.push({ key, ...info });
            }
        });
        
        return relevantInfo;
    }
    
    getRecentContext(query) {
        const queryTopics = this.extractTopics(query);
        return this.contextualMemory
            .filter(entry => 
                entry.topics.some(topic => queryTopics.includes(topic)) ||
                entry.text.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 3);
    }
    
    formatUserContext(userInfo) {
        const contexts = userInfo.map(info => {
            switch (info.key) {
                case 'name':
                    return `Since your name is ${info.value}`;
                case 'location':
                    return `Given that you're from ${info.value}`;
                case 'occupation':
                    return `As someone who works as ${info.value}`;
                default:
                    return `Considering your interest in ${info.value}`;
            }
        });
        
        return contexts.join(', ');
    }
    
    formatFactualResponse(facts, query) {
        const responses = facts.map(fact => {
            return `${fact.subject} ${fact.predicate} ${fact.object}`;
        });
        
        return `Based on what I know: ${responses.join(', ')}.`;
    }
    
    formatContextualInfo(context) {
        if (context.length === 0) return '';
        
        const recentTopics = [...new Set(context.flatMap(c => c.topics))];
        return `We've been discussing ${recentTopics.join(', ')} recently.`;
    }
    
    saveKnowledge() {
        try {
            const knowledgeData = {
                factDatabase: Array.from(this.factDatabase.entries()),
                userKnowledge: Array.from(this.userKnowledge.entries()),
                contextualMemory: this.contextualMemory.slice(0, 50), // Save recent context
                conceptRelations: Array.from(this.conceptRelations.entries())
            };
            
            localStorage.setItem('cortana-knowledge-base', JSON.stringify(knowledgeData));
        } catch (error) {
            console.error('Error saving knowledge base:', error);
        }
    }
    
    loadStoredKnowledge() {
        try {
            const saved = localStorage.getItem('cortana-knowledge-base');
            if (saved) {
                const data = JSON.parse(saved);
                
                if (data.factDatabase) {
                    this.factDatabase = new Map(data.factDatabase);
                }
                
                if (data.userKnowledge) {
                    this.userKnowledge = new Map(data.userKnowledge);
                }
                
                if (data.contextualMemory) {
                    this.contextualMemory = data.contextualMemory;
                }
                
                if (data.conceptRelations) {
                    this.conceptRelations = new Map(data.conceptRelations);
                }
                
                // Rebuild semantic index
                this.rebuildSemanticIndex();
                
                console.log('Knowledge base loaded successfully');
            }
        } catch (error) {
            console.error('Error loading knowledge base:', error);
        }
    }
    
    rebuildSemanticIndex() {
        this.semanticIndex.clear();
        this.factDatabase.forEach(fact => {
            this.indexFact(fact);
        });
    }
    
    getKnowledgeStats() {
        return {
            totalFacts: this.factDatabase.size,
            userKnowledgeItems: this.userKnowledge.size,
            contextualMemoryEntries: this.contextualMemory.length,
            knowledgeDomains: this.knowledgeGraph.size,
            semanticIndexTerms: this.semanticIndex.size
        };
    }
    
    clearKnowledge() {
        this.factDatabase.clear();
        this.userKnowledge.clear();
        this.contextualMemory = [];
        this.semanticIndex.clear();
        this.saveKnowledge();
    }
    
    exportKnowledge() {
        return {
            factDatabase: Array.from(this.factDatabase.entries()),
            userKnowledge: Array.from(this.userKnowledge.entries()),
            contextualMemory: this.contextualMemory,
            stats: this.getKnowledgeStats()
        };
    }
    
    importKnowledge(data) {
        if (data.factDatabase) {
            this.factDatabase = new Map(data.factDatabase);
        }
        
        if (data.userKnowledge) {
            this.userKnowledge = new Map(data.userKnowledge);
        }
        
        if (data.contextualMemory) {
            this.contextualMemory = data.contextualMemory;
        }
        
        this.rebuildSemanticIndex();
        this.saveKnowledge();
    }
}

// Export for use in other modules
window.KnowledgeBase = KnowledgeBase;
