import { Appearance, StyleSheet } from 'react-native';
import basic from '../basic';
import { darkModeColors, lightModeColors } from '../colorPalette';

export default function getStyleSheet() {
  return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  view: {
    ...basic().view,
    alignItems: 'stretch',
    flex: 1,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  scrollView: {
    flexGrow: 1,
    alignItems: 'center',
    gap: 8,
    marginTop: 30,
  },
  text: {
    ...basic().text,
    fontSize: 25,
    marginVertical: 5,
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
