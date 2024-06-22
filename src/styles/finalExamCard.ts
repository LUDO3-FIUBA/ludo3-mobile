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
    padding: 15,
    elevation: 3,
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 12
  },
  subjectName: {
    ...basic().text,
    fontSize: 22,
    color: 'white'
  },
  professor: {
    ...basic().text,
    fontSize: 15,
    paddingVertical: 5,
    color: 'white'
  },
  grade: {
    ...basic().text,
    fontSize: 20,
    paddingVertical: 5,
    color: 'white'
  },
  date: {
    ...basic().text,
    fontSize: 13,
    color: 'white'
  },
  act: {
    ...basic().text,
    fontSize: 15,
    color: 'white'
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
