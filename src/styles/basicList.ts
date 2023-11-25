import { StyleSheet, Appearance } from 'react-native';
import basic from './basic';
import {lightModeColors, darkModeColors} from './colorPalette';

export default function getStyleSheet() {
  return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  header1: {
    fontSize: 24
  },
  itemText: {
    ...basic().text,
    fontSize: 18
  },
  touchableOpacity: { padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center' },
  separator: {borderWidth: 0.25, opacity: 0.5}
});

const lightMode = StyleSheet.create({
  ...sharedStyle,
  header1: {
    ...sharedStyle.header1,
    color: lightModeColors.black
  },
  separator: {
    ...sharedStyle.separator,
    borderColor: lightModeColors.darkGray
  }
});

const darkMode = StyleSheet.create({
  ...sharedStyle,
  header1: {
    ...sharedStyle.header1,
    color: darkModeColors.lightGray
  },
  separator: {
    ...sharedStyle.separator,
    borderColor: darkModeColors.lightGray
  }
});
