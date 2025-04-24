import type { WeatherData, GrowingSeason } from "@shared/schema";

// Function to get current weather data
export async function getWeatherData(): Promise<WeatherData> {
  try {
    // Get user's location if possible
    let lat, lon;
    
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          });
        });
        
        lat = position.coords.latitude;
        lon = position.coords.longitude;
      }
    } catch (err) {
      console.log('Geolocation error or denied, using default location');
      // Default coordinates will be used
    }
    
    // Fetch weather data
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching weather: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Return fallback data if API call fails
    return {
      temperature: 78,
      condition: "Partly Cloudy",
      humidity: 65,
      windSpeed: 5,
      windDirection: "NE",
      precipitation: 10,
      icon: "fa-cloud-sun",
    };
  }
}

// Function to get current growing season
export async function getGrowingSeason(): Promise<GrowingSeason> {
  try {
    const response = await fetch('/api/growing-season', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching growing season: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching growing season data:', error);
    
    // Return fallback data if API call fails
    return {
      currentSeason: "Summer",
      plantsToGrow: ["Tomatoes", "Peppers", "Cucumbers", "Summer Squash", "Beans"],
    };
  }
}
