import React, { useEffect } from 'react';
import { useThemeStore } from '../../stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    // Initialize theme on mount
    const cleanup = initializeTheme();
    
    // Return cleanup function if it exists
    return cleanup;
  }, [initializeTheme]);

  return <>{children}</>;
};