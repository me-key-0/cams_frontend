import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#030712' : '#ffffff');
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',
      
      setTheme: (theme: Theme) => {
        const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
        
        set({ theme, resolvedTheme });
        applyTheme(resolvedTheme);
        
        // Store preference in localStorage
        localStorage.setItem('theme-preference', theme);
      },
      
      toggleTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          // If system, toggle to opposite of current system preference
          const systemTheme = getSystemTheme();
          get().setTheme(systemTheme === 'dark' ? 'light' : 'dark');
        } else {
          // Toggle between light and dark
          get().setTheme(theme === 'light' ? 'dark' : 'light');
        }
      },
      
      initializeTheme: () => {
        const stored = localStorage.getItem('theme-preference') as Theme;
        const initialTheme = stored || 'system';
        const resolvedTheme = initialTheme === 'system' ? getSystemTheme() : initialTheme;
        
        set({ theme: initialTheme, resolvedTheme });
        applyTheme(resolvedTheme);
        
        // Listen for system theme changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = (e: MediaQueryListEvent) => {
            const { theme } = get();
            if (theme === 'system') {
              const newResolvedTheme = e.matches ? 'dark' : 'light';
              set({ resolvedTheme: newResolvedTheme });
              applyTheme(newResolvedTheme);
            }
          };
          
          mediaQuery.addEventListener('change', handleChange);
          
          // Cleanup function
          return () => mediaQuery.removeEventListener('change', handleChange);
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);