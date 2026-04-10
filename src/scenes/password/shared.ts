import {Appearance, StyleSheet} from 'react-native';
import {darkModeColors, lightModeColors} from '../../styles/colorPalette';

function colors() {
  return Appearance.getColorScheme() === 'dark'
    ? darkModeColors
    : lightModeColors;
}

export function createPasswordScreenStyles() {
  const palette = colors();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Appearance.getColorScheme() === 'dark' ? '#000' : '#f6f7fb',
    },
    content: {
      flexGrow: 1,
      padding: 20,
      justifyContent: 'center',
    },
    card: {
      backgroundColor: Appearance.getColorScheme() === 'dark' ? '#121212' : '#fff',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: palette.lightGray,
      gap: 14,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.mainContrastColor,
    },
    description: {
      fontSize: 15,
      lineHeight: 22,
      color: palette.darkGray,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.mainContrastColor,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.lightGray,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: palette.mainContrastColor,
      backgroundColor: Appearance.getColorScheme() === 'dark' ? '#1b1b1b' : '#fff',
      marginBottom: 14,
    },
    hint: {
      fontSize: 13,
      color: palette.darkGray,
      marginTop: -4,
      marginBottom: 10,
    },
    error: {
      color: '#c62828',
      fontSize: 14,
      marginBottom: 4,
    },
    success: {
      color: '#2e7d32',
      fontSize: 14,
      marginBottom: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    link: {
      color: palette.institutional,
      fontSize: 15,
      fontWeight: '600',
      textDecorationLine: 'underline',
      textAlign: 'center',
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: Appearance.getColorScheme() === 'dark' ? '#1b1b1b' : '#eef3f8',
      borderRadius: 12,
      padding: 4,
      marginVertical: 6,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 10,
    },
    tabActive: {
      backgroundColor: palette.institutional,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.mainContrastColor,
    },
    tabTextActive: {
      color: '#fff',
    },
    buttonTextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
  });
}
