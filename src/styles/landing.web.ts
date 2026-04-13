// Web version of landing.ts — always returns light mode.
// landing.ts spreads basic() at module-init time inside StyleSheet.create(),
// which in a dark-mode OS evaluates to backgroundColor:'black' before any
// Appearance override can run. This file avoids that dependency entirely.
import { StyleSheet } from 'react-native';
import { lightModeColors } from './colorPalette';

const style = StyleSheet.create({
  view: {
    flex: 1,
    flexDirection: 'column',
    tintColor: lightModeColors.mainContrastColor,
    color: lightModeColors.mainColor,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 22,
  },
  button: {
    fontSize: 15,
    fontWeight: 'bold',
    height: 70,
    borderRadius: 35,
    width: '50%',
    backgroundColor: lightModeColors.mainColor,
  },
  containerView: {
    flex: 1,
    padding: 15,
    tintColor: lightModeColors.mainContrastColor,
    color: lightModeColors.mainColor,
  },
  text: {
    fontSize: 15,
    color: lightModeColors.mainContrastColor,
  },
  textInput: {
    fontSize: 15,
    height: 50,
    borderWidth: 1,
    borderColor: lightModeColors.mainColor,
    color: lightModeColors.mainContrastColor,
  },
  textInputPlaceholder: {
    fontSize: 15,
    height: 50,
    borderWidth: 1,
    color: lightModeColors.darkGray,
  },
  errorInInput: {
    fontSize: 13,
    color: 'red',
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '90%',
    backgroundColor: 'transparent',
    position: 'absolute',
    zIndex: 999,
    color: lightModeColors.darkGray,
  },
});

export default function getStyleSheet() {
  return style;
}
