# Weather API Setup Guide

## Overview

The Cortana LLM application now includes full weather functionality using the OpenWeatherMap API. This guide will help you set up weather services to get current weather information and forecasts.

## Features

- ✅ Current weather conditions
- ✅ 5-day weather forecasts
- ✅ Location-based queries
- ✅ Automatic geolocation support
- ✅ Offline fallback responses
- ✅ Multiple location formats supported

## Setup Instructions

### 1. Get an API Key

1. Visit [OpenWeatherMap.org](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to the API keys section
4. Copy your API key

### 2. Configure the Application

#### Option A: Environment Variable (Recommended)
```bash
# Windows
set OPENWEATHER_API_KEY=your_api_key_here

# macOS/Linux
export OPENWEATHER_API_KEY=your_api_key_here
```

#### Option B: Create .env file
1. Copy `.env.example` to `.env`
2. Replace `your_api_key_here` with your actual API key
3. Restart the application

### 3. Test the Weather Functionality

Try these voice commands or text inputs:
- "What's the weather like?"
- "Weather in New York"
- "Will it rain tomorrow?"
- "5-day forecast for London"
- "Temperature in Tokyo"

## Supported Query Types

### Current Weather
- "What's the weather?"
- "Current weather in [location]"
- "Temperature outside"
- "Weather conditions"

### Forecasts
- "Weather forecast"
- "Will it rain tomorrow?"
- "3-day forecast for [location]"
- "Weather for the week"

### Location Formats
- City names: "New York", "London", "Tokyo"
- City, State: "San Francisco, CA"
- City, Country: "Paris, France"
- Current location: "weather here", "local weather"

## API Limits

**Free Tier:**
- 1,000 calls per day
- 60 calls per minute
- Current weather and 5-day forecast included

**Rate Limiting:**
The application automatically handles rate limiting and will show appropriate messages if limits are exceeded.

## Troubleshooting

### Common Issues

**"Weather service is not available"**
- Check that the weather service script is loaded
- Verify the API key is set correctly
- Restart the application

**"Weather API key is invalid or missing"**
- Verify your API key is correct
- Check that the environment variable is set
- Ensure there are no extra spaces in the key

**"Location not found"**
- Try a more specific location name
- Use "City, Country" format for international locations
- Check spelling of the location

**"Please check your internet connection"**
- Verify internet connectivity
- Check if OpenWeatherMap.org is accessible
- Try again in a few moments

### Debug Mode

To enable debug logging for weather services:
1. Open Developer Tools (F12)
2. Check the Console tab for weather-related messages
3. Look for API response details and error messages

## Privacy Notes

- Location requests require user permission
- Geolocation data is only used for weather queries
- No location data is stored permanently
- All weather data comes from OpenWeatherMap's servers

## Advanced Configuration

### Custom Default Location
Set a default location in your environment:
```bash
export DEFAULT_LOCATION="Your City, Your Country"
```

### Temperature Units
Configure temperature units (metric/imperial):
```bash
export WEATHER_UNITS=metric  # Celsius
export WEATHER_UNITS=imperial  # Fahrenheit
```

## API Documentation

For more details about the OpenWeatherMap API:
- [Current Weather API](https://openweathermap.org/current)
- [5-day Forecast API](https://openweathermap.org/forecast5)
- [Geocoding API](https://openweathermap.org/api/geocoding-api)

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify your API key and internet connection
3. Check the application console for error messages
4. Ensure you're using a supported location format

---

**Note:** Weather functionality works in offline mode with limited capabilities. For full features, an active internet connection and valid API key are required.
