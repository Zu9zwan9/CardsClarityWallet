import { useColorScheme } from 'react-native';

// Define the colors interface
export interface DynamicColors {
  cardShadow: ColorValue;
  cardBorder: ColorValue;
  secondaryText: ColorValue;
  text: ColorValue;
  primary: string;
  accent: string;
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  notification: string;
  success: string;
  error: string;
  warning: string;
  cardBackground: string;
  glassBorder: string;
  shadow: string;
  buttonBackground: string;
}

/**
 * A hook that returns colors based on the current color scheme (light/dark)
 * following Apple's Human Interface Guidelines
 */
export const useDynamicColors = (): DynamicColors => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    primary: isDark ? '#0A84FF' : '#007AFF', // iOS blue
    accent: isDark ? '#0A84FF' : '#007AFF', // Same as primary for consistency
    background: isDark ? '#000000' : '#F2F2F7',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    textPrimary: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#EBEBF5' : '#3A3A3C',
    border: isDark ? '#38383A' : '#C6C6C8',
    notification: '#FF3B30',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    cardBackground: isDark
        ? 'rgba(44, 44, 46, 0.8)'
        : 'rgba(255, 255, 255, 0.8)',
    glassBorder: isDark
        ? 'rgba(84, 84, 88, 0.65)'
        : 'rgba(209, 209, 214, 0.65)',
    shadow: isDark
        ? 'rgba(0, 0, 0, 0.5)'
        : 'rgba(0, 0, 0, 0.1)',
    buttonBackground: isDark
        ? 'rgba(44, 44, 46, 0.9)'
        : 'rgba(255, 255, 255, 0.9)',
  };
};
