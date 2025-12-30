// API Configuration
// Replace with your computer's local IP address when testing on physical device
// Use 'localhost' or '10.0.2.2' for Android emulator
// Use 'localhost' for iOS simulator

export const API_URL = 'http://192.168.1.100:5000/api';

// For Android Emulator, use:
// export const API_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator, use:
// export const API_URL = 'http://localhost:5000/api';

export const COLORS = {
  primary: '#16a34a',
  primaryDark: '#15803d',
  primaryLight: '#22c55e',
  secondary: '#f97316',
  background: '#f9fafb',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};
