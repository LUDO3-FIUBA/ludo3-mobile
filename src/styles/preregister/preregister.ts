import { StyleSheet, Appearance } from 'react-native';
import basic from '../basic';
import {lightModeColors, darkModeColors} from '../colorPalette';

export default function getStyleSheet() {
  return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  view: {
    ...basic().view,
    alignItems: 'stretch',
    flex: 1,
    backgroundColor: 'white'
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: 'grey',
  },
  button: {
    ...basic().button,
    marginVertical: 15,
  },
  inputLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'transparent',
    borderRadius: 5,
    display: 'flex',
    textAlign: 'center',
  }
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
