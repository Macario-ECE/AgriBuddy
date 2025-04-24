import { useEffect, useState } from 'react';
import { getWeatherData } from '@/lib/weather';
import type { WeatherData } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeatherData();
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeather();
  }, []);
  
  if (isLoading) {
    return (
      <div className="bg-background p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <div className="mt-2">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }
  
  if (!weather) {
    return (
      <div className="bg-background p-4 rounded-xl">
        <div className="text-sm text-gray-500">Unable to load weather data</div>
      </div>
    );
  }
  
  return (
    <div className="bg-background p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-semibold">{weather.temperature}°F</div>
          <div className="text-sm text-gray-600">{weather.condition}</div>
        </div>
        <div className="text-5xl text-accent">
          <i className={`fas ${weather.icon}`}></i>
        </div>
      </div>
      <div className="mt-2 text-sm">
        <div className="flex justify-between">
          <span>Humidity:</span>
          <span className="font-medium">{weather.humidity}%</span>
        </div>
        <div className="flex justify-between">
          <span>Wind:</span>
          <span className="font-medium">{weather.windSpeed} mph {weather.windDirection}</span>
        </div>
        <div className="flex justify-between">
          <span>Precipitation:</span>
          <span className="font-medium">{weather.precipitation}%</span>
        </div>
      </div>
    </div>
  );
}
