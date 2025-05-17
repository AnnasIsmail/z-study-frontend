export const lightTheme = {
  primary: {
    main: '#3b82f6', // Blue
    light: '#93c5fd',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#7c3aed', // Purple
    light: '#a78bfa',
    dark: '#5b21b6',
    contrastText: '#ffffff',
  },
  accent: {
    main: '#ec4899', // Pink
    light: '#f9a8d4',
    dark: '#be185d',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981', // Green
    light: '#6ee7b7',
    dark: '#047857',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b', // Amber
    light: '#fcd34d',
    dark: '#b45309',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef4444', // Red
    light: '#fca5a5',
    dark: '#b91c1c',
    contrastText: '#ffffff',
  },
  background: {
    default: '#ffffff',
    paper: '#f3f4f6',
    card: '#ffffff',
  },
  text: {
    primary: '#1f2937',
    secondary: '#4b5563',
    disabled: '#9ca3af',
  },
  divider: '#e5e7eb',
};

export const darkTheme = {
  primary: {
    main: '#3b82f6', // Blue
    light: '#93c5fd',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#7c3aed', // Purple
    light: '#a78bfa',
    dark: '#5b21b6',
    contrastText: '#ffffff',
  },
  accent: {
    main: '#ec4899', // Pink
    light: '#f9a8d4',
    dark: '#be185d',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981', // Green
    light: '#6ee7b7',
    dark: '#047857',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b', // Amber
    light: '#fcd34d',
    dark: '#b45309',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef4444', // Red
    light: '#fca5a5',
    dark: '#b91c1c',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0f172a',
    paper: '#1e293b',
    card: '#1e293b',
  },
  text: {
    primary: '#f3f4f6',
    secondary: '#d1d5db',
    disabled: '#6b7280',
  },
  divider: '#334155',
};

// Custom breakpoints for responsive design
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Spacing system (based on 8px)
export const spacing = (factor: number) => `${factor * 8}px`;

// Typography
export const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
  },
};

// Border radius
export const borderRadius = {
  small: '4px',
  medium: '8px',
  large: '16px',
  xl: '24px',
  round: '50%',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

// Transitions
export const transitions = {
  duration: {
    short: '150ms',
    standard: '250ms',
    long: '375ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};