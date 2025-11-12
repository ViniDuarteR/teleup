import { useState, useEffect, type ReactNode } from 'react';
import { ThemeContext, THEMES, type Theme } from './theme-context';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider = ({ children, defaultTheme = 'gaming' }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const config = THEMES[theme];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    const root = document.documentElement;
    Object.entries(config.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [theme, config]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, config }}>
      {children}
    </ThemeContext.Provider>
  );
};


