import { StyleSheet, Appearance} from 'react-native';
import basic from './basic';
import {lightModeColors, darkModeColors} from './colorPalette';

export default function getStyleSheet() {
  return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  view: {
    borderWidth: 2,
    margin: 5,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  filterName: {
    ...basic().text,
    fontSize: 25,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  filterValue: {
    ...basic().text,
    fontSize: 15,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  closeButton: {
    ...basic().text,
    fontSize: 20,
  },
});

const lightMode = StyleSheet.create({
  ...sharedStyle,
  view: {
    ...sharedStyle.view,
    borderColor: lightModeColors.mainColor,
  },
  closeButton: {
    ...sharedStyle.closeButton,
    color: lightModeColors.darkGray,
  },
});

const darkMode = StyleSheet.create({
  ...sharedStyle,
  view: {
    ...sharedStyle.view,
    borderColor: darkModeColors.mainColor,
  },
  closeButton: {
    ...sharedStyle.closeButton,
    color: darkModeColors.lightGray,
  },
});
