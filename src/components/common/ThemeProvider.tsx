import { ReactNode, useEffect, useCallback } from 'react';
import { useThemeStore } from '../../store/themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { darkMode } = useThemeStore();

  const applyTheme = useCallback((isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Apply theme immediately
    applyTheme(darkMode);
  }, [darkMode, applyTheme]);

  return <>{children}</>;
};
