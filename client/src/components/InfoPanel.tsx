import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeatherWidget from './WeatherWidget';
import { getGrowingSeason } from '@/lib/weather';
import type { GrowingSeason } from '@shared/schema';

interface InfoPanelProps {
  className?: string;
  onClose?: () => void;
}

export default function InfoPanel({ className, onClose }: InfoPanelProps) {
  const [growingSeason, setGrowingSeason] = useState<GrowingSeason | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGrowingSeason = async () => {
      try {
        const data = await getGrowingSeason();
        setGrowingSeason(data);
      } catch (error) {
        console.error('Error fetching growing season:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrowingSeason();
  }, []);

  const quickTopics = [
    { icon: 'fa-bug', label: 'Pest Control' },
    { icon: 'fa-tint', label: 'Irrigation' },
    { icon: 'fa-leaf', label: 'Organic Tips' },
    { icon: 'fa-seedling', label: 'Seed Starting' },
  ];

  return (
    <aside className={`bg-white border-l border-gray-200 overflow-y-auto ${className}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-xl font-semibold text-primary flex items-center">
            <i className="fas fa-leaf mr-2"></i>
            Agricultural Resources
          </h2>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Weather widget */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Local Weather</h3>
          <WeatherWidget />
        </div>

        {/* Growing Calendar */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Current Growing Season</h3>
          <div className="bg-background p-4 rounded-xl">
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading growing season data...</div>
            ) : growingSeason ? (
              <>
                <div className="text-sm font-medium text-primary mb-2">
                  What to plant now ({growingSeason.currentSeason}):
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {growingSeason.plantsToGrow.map((plant, index) => (
                    <li key={index}>{plant}</li>
                  ))}
                </ul>
                <div className="mt-3 text-xs text-right text-primary">
                  <a href="#" className="hover:underline">View full calendar →</a>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Unable to load growing season data</div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Quick Topics</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickTopics.map((topic, index) => (
              <Button
                key={index}
                variant="outline"
                className="bg-secondary bg-opacity-20 hover:bg-opacity-30 text-primary-dark p-2 rounded-lg text-sm flex items-center justify-center transition-colors duration-200"
              >
                <i className={`fas ${topic.icon} mr-1`}></i> {topic.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
