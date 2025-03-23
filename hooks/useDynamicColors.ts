import { useColorScheme } from 'react-native';

// Define the colors interface
export interface DynamicColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  secondaryText: string;
  success: string;
  error: string;
  warning: string;
  cardBackground: string;
  cardBorder: string;
  cardShadow: string;
}

/**
 * A hook that returns colors based on the current color scheme (light/dark)
 * following Apple's Human Interface Guidelines
 */
export const useDynamicColors = (): DynamicColors => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    // Primary brand color
    primary: isDark ? '#0A84FF' : '#007AFF', // iOS blue

    // Background colors
    background: isDark ? '#000000' : '#F2F2F7', // System background
    card: isDark ? '#1C1C1E' : '#FFFFFF', // Card background

    // Text colors
    text: isDark ? '#FFFFFF' : '#000000', // Primary text
    secondaryText: isDark ? '#EBEBF5' : '#3A3A3C', // Secondary text with 60% opacity

    // Border and divider colors
    border: isDark ? '#38383A' : '#C6C6C8', // Separator color

    // Notification and status colors
    notification: '#FF3B30', // Red for notifications
    success: '#34C759', // Green for success states
    error: '#FF3B30', // Red for error states
    warning: '#FF9500', // Orange for warning states

    // Glassmorphic effect colors
    cardBackground: isDark 
      ? 'rgba(44, 44, 46, 0.8)' // Dark gray with transparency
      : 'rgba(255, 255, 255, 0.8)', // White with transparency
    cardBorder: isDark 
      ? 'rgba(84, 84, 88, 0.65)' // Subtle border for dark mode
      : 'rgba(209, 209, 214, 0.65)', // Subtle border for light mode
    cardShadow: isDark 
      ? 'rgba(0, 0, 0, 0.5)' // Darker shadow for dark mode
      : 'rgba(0, 0, 0, 0.1)', // Lighter shadow for light mode
  };
};
