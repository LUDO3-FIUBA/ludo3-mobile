import {StyleSheet} from 'react-native';
import basic from '../basic';

export default function getStyleSheet() {
  return sharedStyle;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  view: {
    ...basic().view,
    justifyContent: 'space-around',
    padding: 10,
  },
  text: {
    ...basic().text,
    flex: 1,
    fontSize: 25,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  innerView: {
    flex: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    padding: 20,
  },
  loadingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingBackground: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000088',
    borderRadius: 10,
  },
  capture: {
    fontSize: 50,
    color: '#fff',
    padding: 15,
    paddingHorizontal: 20,
    backgroundColor: '#000'
  },
});
