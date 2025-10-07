// Design System Constants
export const DESIGN_TOKENS = {
  // Spacing Scale
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },
  
  // Typography Scale
  typography: {
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glow: '0 0 20px hsl(var(--primary) / 0.3)',
  },
  
  // Animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Component Variants
export const COMPONENT_VARIANTS = {
  button: {
    sizes: ['sm', 'md', 'lg'] as const,
    variants: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const,
  },
  card: {
    variants: ['default', 'elevated', 'outlined', 'filled'] as const,
  },
  input: {
    sizes: ['sm', 'md', 'lg'] as const,
    variants: ['default', 'filled', 'outlined'] as const,
  },
} as const;

// Theme Colors
export const THEME_COLORS = {
  light: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    foreground: '#1F2937',
  },
  dark: {
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    accent: '#F59E0B',
    background: '#0F172A',
    foreground: '#F8FAFC',
  },
  gaming: {
    primary: '#A855F7',    // Purple
    secondary: '#06B6D4',  // Cyan
    accent: '#F59E0B',     // Amber
    success: '#10B981',    // Emerald
    warning: '#F59E0B',    // Amber
    destructive: '#EF4444', // Red
    xp: '#F59E0B',         // Gold
  },
} as const;

// Utility Functions
export const getSpacing = (size: keyof typeof DESIGN_TOKENS.spacing) => 
  DESIGN_TOKENS.spacing[size];

export const getFontSize = (size: keyof typeof DESIGN_TOKENS.typography.fontSizes) => 
  DESIGN_TOKENS.typography.fontSizes[size];

export const getShadow = (size: keyof typeof DESIGN_TOKENS.shadows) => 
  DESIGN_TOKENS.shadows[size];
