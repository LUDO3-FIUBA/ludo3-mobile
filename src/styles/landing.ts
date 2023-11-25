import { StyleSheet, Appearance } from 'react-native';
import basic from './basic';
import {lightModeColors, darkModeColors} from './colorPalette';

export default function getStyleSheet() {
  return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  view: {
    ...basic().view,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 22
  },
  button: {
    ...basic().button,
    width: '50%',
    height: 70,
    borderRadius: 35,
  },
});

const lightMode = StyleSheet.create({
  ...sharedStyle,
  button: {
    ...sharedStyle.button,
    backgroundColor: lightModeColors.mainColor,
  },
});

const darkMode = StyleSheet.create({
  ...sharedStyle,
  button: {
    ...sharedStyle.button,
    backgroundColor: darkModeColors.mainColor,
  },
});
