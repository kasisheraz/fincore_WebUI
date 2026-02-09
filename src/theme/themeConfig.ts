// Multi-theme configuration for FinCore application
// Supports Green, Burgundy, and Red color schemes

export interface ThemeColors {
  sidebar: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentBg: string;
}

export const themes = {
  green: {
    sidebar: '#003D2A',        // Dark Forest Green
    primary: '#1F7A5C',         // Action Green
    primaryLight: '#2D8A6A',
    primaryDark: '#0D5940',
    accent: '#E6F4F0',          // Light green accent
    accentBg: '#F0FDF4',
  },
  burgundy: {
    sidebar: '#5C0E20',         // Dark Burgundy
    primary: '#9B2150',          // Burgundy
    primaryLight: '#B92D61',
    primaryDark: '#7A1A3E',
    accent: '#FDF2F8',          // Light pink accent
    accentBg: '#FDF4F8',
  },
};

export type ThemeMode = keyof typeof themes;

export const getThemeColors = (mode: ThemeMode = 'green'): ThemeColors => {
  return themes[mode];
};
