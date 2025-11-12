import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'gaming';

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    success: string;
    warning: string;
    destructive: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export const THEMES: Record<Theme, ThemeConfig> = {
  light: {
    name: 'Light',
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#FFFFFF',
      foreground: '#1F2937',
      muted: '#F3F4F6',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      destructive: '#EF4444',
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#8B5CF6',
      secondary: '#06B6D4',
      accent: '#F59E0B',
      background: '#0F172A',
      foreground: '#F8FAFC',
      muted: '#1E293B',
      border: '#334155',
      success: '#10B981',
      warning: '#F59E0B',
      destructive: '#EF4444',
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  },
  gaming: {
    name: 'Gaming',
    colors: {
      primary: '#A855F7',
      secondary: '#06B6D4',
      accent: '#F59E0B',
      background: '#0A0A0A',
      foreground: '#FFFFFF',
      muted: '#1A1A1A',
      border: '#333333',
      success: '#00FF88',
      warning: '#FFB800',
      destructive: '#FF4444',
    },
    fonts: {
      heading: 'Orbitron, monospace',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  config: ThemeConfig;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { ThemeContextType };


