import {StyleSheet} from 'react-native';
import {Appearance} from 'react-native';
import basic from './basic';
import {lightModeColors, darkModeColors} from './colorPalette';

export default function getStyleSheet() {
  return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  view: {
    ...basic().view,
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 15,
  },
  subjectName: {
    ...basic().text,
    fontSize: 25,
  },
  professor: {
    ...basic().text,
    fontSize: 15,
    paddingVertical: 5,
  },
  grade: {
    ...basic().text,
    fontSize: 20,
    paddingVertical: 5,
  },
  date: {
    ...basic().text,
    fontSize: 13,
  },
  act: {
    ...basic().text,
    fontSize: 15,
  },
  container: {
    ...basic().view,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
});

const lightMode = StyleSheet.create({
  ...sharedStyle,
  view: {
    ...sharedStyle.view,
    backgroundColor: lightModeColors.mainColor,
  },
});

const darkMode = StyleSheet.create({
  ...sharedStyle,
  view: {
    ...sharedStyle.view,
    backgroundColor: darkModeColors.mainColor,
  },
});
