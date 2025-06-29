import React, { useState } from 'react';
import { useThemeStore, Theme } from '../../stores/themeStore';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const themeOptions = [
  {
    value: 'light' as Theme,
    label: 'Light',
    icon: SunIcon,
    description: 'Light mode',
  },
  {
    value: 'dark' as Theme,
    label: 'Dark',
    icon: MoonIcon,
    description: 'Dark mode',
  },
  {
    value: 'system' as Theme,
    label: 'System',
    icon: ComputerDesktopIcon,
    description: 'Follow system preference',
  },
];

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themeOptions.find((option) => option.value === theme);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background"
        aria-label="Toggle theme"
      >
        {currentTheme && (
          <>
            <currentTheme.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{currentTheme.label}</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-medium z-20 animate-slide-in">
            <div className="py-1">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-background-secondary transition-colors duration-150 ${
                    theme === option.value
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  <option.icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-foreground-tertiary">
                      {option.description}
                    </div>
                  </div>
                  {theme === option.value && (
                    <div className="h-2 w-2 bg-primary-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};