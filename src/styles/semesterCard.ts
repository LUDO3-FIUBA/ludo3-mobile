import { StyleSheet, Appearance } from 'react-native';
import basic from './basic';
import {lightModeColors, darkModeColors} from './colorPalette';

export default function getStyleSheet() {
  return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  mainView: {
    ...basic().view,
    marginHorizontal: 12,
    marginBottom: 120,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  text: {
    ...basic().text,
    fontSize: 18
  },
});

const lightMode = StyleSheet.create({
  ...sharedStyle,
});

const darkMode = StyleSheet.create({
  ...sharedStyle,
});
