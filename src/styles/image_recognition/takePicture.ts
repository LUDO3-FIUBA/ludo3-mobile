import {StyleSheet} from 'react-native';
import basic from '../basic';
import { darkModeColors } from '../colorPalette';

export default function getStyleSheet() {
  // TODO: make both dark/light schemes versions
  return sharedStyle;
}

const sharedStyle = StyleSheet.create({
  ...basic(),
  view: {
    ...basic().view,
    justifyContent: 'space-around',
    padding: 5,
  },
  text: {
    ...basic().text,
    flex: 0,
    fontSize: 25,
    marginBottom: 8
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
  captureContainer: {
    padding: 15,
    paddingHorizontal: 20,
    backgroundColor: darkModeColors.mainColor,
    borderRadius: 35,
  },
});
