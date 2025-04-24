import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Info } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface HeaderProps {
  onToggleInfoPanel: () => void;
}

export default function Header({ onToggleInfoPanel }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="header-gradient text-white shadow-md z-10 relative">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="fas fa-seedling text-2xl text-secondary-light"></i>
          <h1 className="font-serif text-xl font-semibold">AGRIBUDDY</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary-dark transition-colors duration-200 text-white"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full hover:bg-primary-dark transition-colors duration-200 text-white"
            onClick={onToggleInfoPanel}
            aria-label="Toggle info panel"
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
