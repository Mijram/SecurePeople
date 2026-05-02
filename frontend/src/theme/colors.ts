// SecurePeople - Dark Theme Color Palette
export const Colors = {
  // Backgrounds
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  card: '#1E1E1E',

  // Primary accent - Red/Orange
  primary: '#E53935',
  primaryLight: '#FF6B6B',
  primaryDark: '#B71C1C',

  // Secondary accent - Orange
  secondary: '#FF6D00',
  secondaryLight: '#FF9E40',

  // Info accent - Blue
  accent: '#1565C0',
  accentLight: '#42A5F5',
  accentBright: '#2196F3',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#6B6B6B',
  textDisabled: '#404040',

  // Borders
  border: '#2C2C2C',
  borderLight: '#3A3A3A',

  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Danger levels
  dangerLow: '#4CAF50',      // 1-3
  dangerMedium: '#FF9800',   // 4-6
  dangerHigh: '#F44336',     // 7-8
  dangerCritical: '#B71C1C', // 9-10

  // Map marker colors by category
  markerRobo: '#E53935',
  markerAccidente: '#FF6D00',
  markerIncendio: '#FF1744',
  markerEmergencia: '#D500F9',
  markerManifestacion: '#2196F3',
  markerObstruccion: '#FF9800',
  markerSospechoso: '#FFC107',
  markerOtro: '#9E9E9E',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',

  // Input
  inputBackground: '#1E1E1E',
  inputBorder: '#333333',
  inputFocused: '#E53935',

  // Tab bar
  tabBarBackground: '#111111',
  tabBarActive: '#E53935',
  tabBarInactive: '#555555',
};

export const getDangerColor = (level: number): string => {
  if (level <= 3) return Colors.dangerLow;
  if (level <= 6) return Colors.dangerMedium;
  if (level <= 8) return Colors.dangerHigh;
  return Colors.dangerCritical;
};

export const getCategoryColor = (category: string): string => {
  const map: Record<string, string> = {
    'Robo': Colors.markerRobo,
    'Accidente': Colors.markerAccidente,
    'Incendio': Colors.markerIncendio,
    'Emergencia médica': Colors.markerEmergencia,
    'Manifestación': Colors.markerManifestacion,
    'Obstrucción vial': Colors.markerObstruccion,
    'Situación sospechosa': Colors.markerSospechoso,
    'Otro': Colors.markerOtro,
  };
  return map[category] || Colors.markerOtro;
};
