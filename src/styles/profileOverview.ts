import { StyleSheet, Appearance } from 'react-native';
import basic from './basic';
import { lightModeColors, darkModeColors } from './colorPalette';

export default function getStyleSheet() {
  return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  view: {
    alignItems: 'center', marginTop: 12, marginBottom: 32
  },
  icon: { fontSize: 92 },
  text: {
    ...basic().text,
    fontSize: 18
  }
});

const lightMode = StyleSheet.create({
  ...sharedStyle,
  icon: {
    ...sharedStyle.icon,
    color: lightModeColors.mainContrastColor
  },
  text: {
    ...sharedStyle.text,
    color: lightModeColors.mainContrastColor,
  },
});

const darkMode = StyleSheet.create({
  ...sharedStyle,
  icon: {
    ...sharedStyle.icon,
    color: darkModeColors.mainContrastColor
  },
  text: {
    ...sharedStyle.text,
    color: darkModeColors.mainContrastColor,
  },
});
