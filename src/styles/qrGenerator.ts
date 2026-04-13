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
  },
});
