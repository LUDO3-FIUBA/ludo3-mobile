import {StyleSheet} from 'react-native';
import basic from './basic';

export default function getStyleSheet() {
  return sharedStyle;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  textContainer: {
    padding: 15,
  },
  text: {
    ...basic().text,
    fontSize: 20,
  },
});
