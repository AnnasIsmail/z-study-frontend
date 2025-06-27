// Central color configuration - Ubah warna di sini untuk mengatur seluruh website
export const colors = {
  // Primary colors
  primary: {
    light: '#3B82F6', // Blue
    dark: '#60A5FA',
  },
  secondary: {
    light: '#8B5CF6', // Purple
    dark: '#A78BFA',
  },
  accent: {
    light: '#10B981', // Emerald
    dark: '#34D399',
  },
  
  // Background colors
  background: {
    light: '#FFFFFF',
    dark: '#0F172A', // Slate 900
  },
  surface: {
    light: '#F8FAFC', // Slate 50
    dark: '#1E293B', // Slate 800
  },
  card: {
    light: '#FFFFFF',
    dark: '#334155', // Slate 700
  },
  
  // Text colors
  text: {
    primary: {
      light: '#0F172A', // Slate 900
      dark: '#F8FAFC', // Slate 50
    },
    secondary: {
      light: '#64748B', // Slate 500
      dark: '#CBD5E1', // Slate 300
    },
    muted: {
      light: '#94A3B8', // Slate 400
      dark: '#64748B', // Slate 500
    },
  },
  
  // Border colors
  border: {
    light: '#E2E8F0', // Slate 200
    dark: '#475569', // Slate 600
  },
  
  // Status colors
  success: {
    light: '#10B981',
    dark: '#34D399',
  },
  warning: {
    light: '#F59E0B',
    dark: '#FBBF24',
  },
  error: {
    light: '#EF4444',
    dark: '#F87171',
  },
};

// CSS variables untuk Tailwind
export const getCSSVariables = (isDark: boolean) => ({
  '--color-primary': isDark ? colors.primary.dark : colors.primary.light,
  '--color-secondary': isDark ? colors.secondary.dark : colors.secondary.light,
  '--color-accent': isDark ? colors.accent.dark : colors.accent.light,
  '--color-background': isDark ? colors.background.dark : colors.background.light,
  '--color-surface': isDark ? colors.surface.dark : colors.surface.light,
  '--color-card': isDark ? colors.card.dark : colors.card.light,
  '--color-text-primary': isDark ? colors.text.primary.dark : colors.text.primary.light,
  '--color-text-secondary': isDark ? colors.text.secondary.dark : colors.text.secondary.light,
  '--color-text-muted': isDark ? colors.text.muted.dark : colors.text.muted.light,
  '--color-border': isDark ? colors.border.dark : colors.border.light,
  '--color-success': isDark ? colors.success.dark : colors.success.light,
  '--color-warning': isDark ? colors.warning.dark : colors.warning.light,
  '--color-error': isDark ? colors.error.dark : colors.error.light,
});