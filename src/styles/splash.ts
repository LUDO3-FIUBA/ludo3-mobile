import {StyleSheet} from 'react-native';
import basic from './basic';

export default function getStyleSheet() {
  return sharedStyle;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  view: {
    ...basic().view,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 70,
  },
  title: {
    ...basic().text,
    fontWeight: 'bold',
    fontSize: 40,
  },
  subtitle: {
    ...basic().text,
    fontSize: 20,
    textAlign: 'center',
  },
});
