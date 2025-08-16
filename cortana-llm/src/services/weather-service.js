class WeatherService {
    constructor() {
        // Using OpenWeatherMap API (free tier)
        // Users will need to get their own API key from https://openweathermap.org/api
        this.apiKey = process.env.OPENWEATHER_API_KEY || 'demo_key';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.geocodingUrl = 'https://api.openweathermap.org/geo/1.0';
        this.defaultLocation = { lat: 40.7128, lon: -74.0060, name: 'New York' }; // Default to NYC
    }

    async getCurrentWeather(location) {
        try {
            const coordinates = await this.getCoordinates(location);
            if (!coordinates) {
                throw new Error('Location not found');
            }

            const response = await fetch(
                `${this.baseUrl}/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Weather API key is invalid or missing');
                }
                throw new Error(`Weather API error: ${response.status}`);
            }

            const data = await response.json();
            return this.formatCurrentWeather(data, coordinates.name);
        } catch (error) {
            console.error('Weather service error:', error);
            return this.getOfflineWeatherResponse(location, error.message);
        }
    }

    async getWeatherForecast(location, days = 5) {
        try {
            const coordinates = await this.getCoordinates(location);
            if (!coordinates) {
                throw new Error('Location not found');
            }

            const response = await fetch(
                `${this.baseUrl}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Weather API key is invalid or missing');
                }
                throw new Error(`Weather API error: ${response.status}`);
            }

            const data = await response.json();
            return this.formatForecast(data, coordinates.name, days);
        } catch (error) {
            console.error('Weather forecast error:', error);
            return this.getOfflineForecastResponse(location, error.message);
        }
    }

    async getCoordinates(location) {
        if (!location || location.toLowerCase().includes('current') || location.toLowerCase().includes('here')) {
            // Try to get user's current location
            return await this.getCurrentLocation();
        }

        try {
            const response = await fetch(
                `${this.geocodingUrl}/direct?q=${encodeURIComponent(location)}&limit=1&appid=${this.apiKey}`
            );

            if (!response.ok) {
                throw new Error('Geocoding API error');
            }

            const data = await response.json();
            if (data.length === 0) {
                return null;
            }

            return {
                lat: data[0].lat,
                lon: data[0].lon,
                name: data[0].name,
                country: data[0].country
            };
        } catch (error) {
            console.error('Geocoding error:', error);
            return this.defaultLocation;
        }
    }

    async getCurrentLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(this.defaultLocation);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        name: 'Your Location'
                    });
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    resolve(this.defaultLocation);
                },
                { timeout: 5000, enableHighAccuracy: false }
            );
        });
    }

    formatCurrentWeather(data, locationName) {
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const description = data.weather[0].description;
        const icon = data.weather[0].icon;
        const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h

        const response = `Current weather in ${locationName}:
🌡️ Temperature: ${temp}°C (feels like ${feelsLike}°C)
☁️ Conditions: ${this.capitalizeWords(description)}
💧 Humidity: ${humidity}%
💨 Wind: ${windSpeed} km/h`;

        return {
            type: 'weather',
            response,
            data: {
                location: locationName,
                temperature: temp,
                feelsLike,
                description,
                humidity,
                windSpeed,
                icon,
                timestamp: Date.now()
            }
        };
    }

    formatForecast(data, locationName, days) {
        const forecasts = data.list.slice(0, days * 8); // 8 forecasts per day (3-hour intervals)
        const dailyForecasts = this.groupForecastsByDay(forecasts);

        let response = `${days}-day weather forecast for ${locationName}:\n\n`;
        
        dailyForecasts.slice(0, days).forEach((day, index) => {
            const date = new Date(day.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
            });
            
            response += `${date}:\n`;
            response += `🌡️ ${day.minTemp}°C - ${day.maxTemp}°C\n`;
            response += `☁️ ${this.capitalizeWords(day.description)}\n`;
            if (index < days - 1) response += '\n';
        });

        return {
            type: 'weather_forecast',
            response,
            data: {
                location: locationName,
                forecasts: dailyForecasts,
                days,
                timestamp: Date.now()
            }
        };
    }

    groupForecastsByDay(forecasts) {
        const days = {};
        
        forecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000).toDateString();
            
            if (!days[date]) {
                days[date] = {
                    date: forecast.dt * 1000,
                    temps: [],
                    descriptions: [],
                    icons: []
                };
            }
            
            days[date].temps.push(forecast.main.temp);
            days[date].descriptions.push(forecast.weather[0].description);
            days[date].icons.push(forecast.weather[0].icon);
        });

        return Object.values(days).map(day => ({
            date: day.date,
            minTemp: Math.round(Math.min(...day.temps)),
            maxTemp: Math.round(Math.max(...day.temps)),
            description: this.getMostCommonDescription(day.descriptions),
            icon: this.getMostCommonIcon(day.icons)
        }));
    }

    getMostCommonDescription(descriptions) {
        const counts = {};
        descriptions.forEach(desc => {
            counts[desc] = (counts[desc] || 0) + 1;
        });
        
        return Object.keys(counts).reduce((a, b) => 
            counts[a] > counts[b] ? a : b
        );
    }

    getMostCommonIcon(icons) {
        const counts = {};
        icons.forEach(icon => {
            counts[icon] = (counts[icon] || 0) + 1;
        });
        
        return Object.keys(counts).reduce((a, b) => 
            counts[a] > counts[b] ? a : b
        );
    }

    capitalizeWords(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }

    getOfflineWeatherResponse(location, error) {
        let response = `I'm unable to get current weather information for ${location || 'your location'}.`;
        
        if (error.includes('API key')) {
            response += '\n\nTo enable weather features, please:';
            response += '\n1. Get a free API key from OpenWeatherMap.org';
            response += '\n2. Set the OPENWEATHER_API_KEY environment variable';
            response += '\n3. Restart the application';
        } else if (error.includes('Location not found')) {
            response += '\n\nPlease try a different location name or be more specific (e.g., "New York, NY" instead of just "NY").';
        } else {
            response += '\n\nPlease check your internet connection and try again.';
        }

        return {
            type: 'weather',
            response,
            data: { 
                location: location || 'unknown', 
                error, 
                offline: true,
                timestamp: Date.now()
            }
        };
    }

    getOfflineForecastResponse(location, error) {
        let response = `I'm unable to get weather forecast for ${location || 'your location'}.`;
        
        if (error.includes('API key')) {
            response += '\n\nWeather forecasts require an API key. Please set up OpenWeatherMap API access.';
        } else {
            response += '\n\nPlease check your internet connection and try again.';
        }

        return {
            type: 'weather_forecast',
            response,
            data: { 
                location: location || 'unknown', 
                error, 
                offline: true,
                timestamp: Date.now()
            }
        };
    }

    // Utility method to determine if input is asking for forecast
    isForecastRequest(input) {
        const forecastKeywords = ['forecast', 'tomorrow', 'week', 'days', 'future', 'later', 'upcoming'];
        return forecastKeywords.some(keyword => 
            input.toLowerCase().includes(keyword)
        );
    }

    // Extract location from user input
    extractLocation(input) {
        const locationPatterns = [
            /(?:in|for|at)\s+([a-zA-Z\s,]+?)(?:\s|$)/i,
            /weather\s+([a-zA-Z\s,]+?)(?:\s|$)/i,
            /([a-zA-Z\s,]+?)\s+weather/i
        ];

        for (const pattern of locationPatterns) {
            const match = input.match(pattern);
            if (match) {
                const location = match[1].trim();
                // Filter out common non-location words
                const excludeWords = ['today', 'tomorrow', 'now', 'current', 'like', 'going', 'be'];
                if (!excludeWords.some(word => location.toLowerCase().includes(word))) {
                    return location;
                }
            }
        }

        return null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherService;
} else {
    window.WeatherService = WeatherService;
}
