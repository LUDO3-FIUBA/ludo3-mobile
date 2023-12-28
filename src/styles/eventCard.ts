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
    elevation: 3,
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 12
  },
  name: {
    ...basic().text,
    fontSize: 20,
    color: 'white',
  },
  subjectName: {
    ...basic().text,
    fontSize: 18,
    color: 'lightgray'
  },
  date: {
    ...basic().text,
    fontSize: 15,
    paddingVertical: 5,
    color: 'lightgray'
  },
  grade: {
    ...basic().text,
    fontSize: 20,
    paddingVertical: 5,
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
    backgroundColor: lightModeColors.institutional,
  },
  name: {
    ...sharedStyle.name,
  },
});

const darkMode = StyleSheet.create({
  ...sharedStyle,
  view: {
    ...sharedStyle.view,
    backgroundColor: darkModeColors.institutional,
  },
  name: {
    ...sharedStyle.name,
  },
});
