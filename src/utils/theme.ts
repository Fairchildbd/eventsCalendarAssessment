import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  purple: '#8A4488',
  pink: '#F187EF',
  deepPurple: '#372343',
  cream: '#F2EDE6',
  white: '#FFFFFF',
  text: '#372343',
  textMuted: '#6B6372',
  border: '#E3DCE6',
  borderStrong: '#CDBFD2',
  lavender: '#EFE4EF',
  pinkTint: '#FBE0FA',
  onDarkMuted: 'rgba(255,255,255,0.78)',
  success: '#2E7D4F',
  danger: '#B3261E',
  dangerBg: '#FDE8E7',
  warning: '#8A5A00',
  warningBg: '#FFF4D6',
  overlay: 'rgba(55,35,67,0.55)',
  unavailable: '#D9D2DC',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radii = { sm: 8, md: 12, lg: 18, xl: 28, pill: 999 } as const;

export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  subheading: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: 0.6 },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '700' },
} satisfies Record<string, TextStyle>;

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#372343',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    default: { elevation: 2 },
  }) as ViewStyle,
  raised: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#372343',
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -3 },
    },
    default: { elevation: 8 },
  }) as ViewStyle,
} as const;

export const MIN_TOUCH = 48;
export const LOGO_URL =
  'https://mohegansun.com/content/dam/mohegansun/Template-Assets/Logos/Logo-Mohegan_Sun-185x100.png';
