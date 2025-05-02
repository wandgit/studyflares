import { ReactNode, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  console.log('ThemeProvider rendering');
  const { darkMode } = useThemeStore();
  
  // Apply dark mode class to the html element
  useEffect(() => {
    console.log('ThemeProvider useEffect running, darkMode:', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return <>{children}</>;
};
