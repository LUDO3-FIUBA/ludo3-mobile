import { StyleSheet, Appearance } from 'react-native';
import basic from './basic';
import {lightModeColors, darkModeColors} from './colorPalette';

export default function getStyleSheet() {
  return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

import { ViewStyle, TextStyle, ImageStyle, StyleProp } from 'react-native';

const menuItem: StyleProp<ViewStyle | TextStyle | ImageStyle> = {
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 25,
  width: 50,
  height: 50,
};

const menuImageItem: StyleProp<ViewStyle | TextStyle | ImageStyle> = {
  ...menuItem,
  padding: 3,
};
// ... rest of the code


const sharedStyle = StyleSheet.create({
  ...basic(),
  mainView: {
    ...basic().view,
    marginHorizontal: 12,
    marginBottom: 120,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  menuOpenerContainer: {
    ...menuItem,
    position: 'absolute',
    right: 30,
    bottom: 30,
  },
  menuOpener: menuItem,
  menuImageOpener: menuImageItem,
  menu: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem,
  menuImageItem,
  menuRootItem: menuItem,
  menuRootImageItem: menuImageItem,
  itemIcon: {
    fontSize: 32,
    color: 'black',
  },
  itemImage: {
    tintColor: 'white',
  },
  itemText: {
    color: 'white',
  },
  filterButton: {
    ...menuItem,
  },
  filterButtonIcon: {
    fontSize: 20,
  },
  header1: {
    fontSize: 24
  },
  centeredHeader1: {
    fontSize: 24,
    textAlign: 'center'
  },
  text: {
    ...basic().text,
    fontSize: 18
  },
  centeredText: {
    ...basic().text,
    fontSize: 18,
    textAlign: 'center'
  }
});

const lightMode = StyleSheet.create({
  ...sharedStyle,
  menuImageOpener: {
    ...sharedStyle.menuOpener,
    backgroundColor: lightModeColors.menuOpener,
  },
  menuRootImageItem: {
    ...sharedStyle.menuRootItem,
    backgroundColor: lightModeColors.menuOpener,
  },
  menuImageItem: {
    ...sharedStyle.menuItem,
    backgroundColor: lightModeColors.menuOption,
  },
  menuOpener: {
    ...sharedStyle.menuOpener,
    backgroundColor: lightModeColors.menuOpener,
  },
  menuRootItem: {
    ...sharedStyle.menuRootItem,
    backgroundColor: lightModeColors.menuOpener,
  },
  menuItem: {
    ...sharedStyle.menuItem,
    backgroundColor: lightModeColors.menuOption,
  },
  header1: {
    ...sharedStyle.header1,
    color: lightModeColors.black
  },
  centeredHeader1: {
    ...sharedStyle.centeredHeader1,
    color: lightModeColors.black
  }
});

const darkMode = StyleSheet.create({
  ...sharedStyle,
  menuImageOpener: {
    ...sharedStyle.menuOpener,
    backgroundColor: darkModeColors.menuOpener,
  },
  menuRootImageItem: {
    ...sharedStyle.menuRootItem,
    backgroundColor: darkModeColors.menuOpener,
  },
  menuImageItem: {
    ...sharedStyle.menuItem,
    backgroundColor: darkModeColors.menuOption,
  },
  menuOpener: {
    ...sharedStyle.menuOpener,
    backgroundColor: darkModeColors.menuOpener,
  },
  menuRootItem: {
    ...sharedStyle.menuRootItem,
    backgroundColor: darkModeColors.menuOpener,
  },
  menuItem: {
    ...sharedStyle.menuItem,
    backgroundColor: darkModeColors.menuOption,
  },
  header1: {
    ...sharedStyle.header1,
    color: darkModeColors.lightGray
  },
  centeredHeader1: {
    ...sharedStyle.centeredHeader1,
    color: darkModeColors.lightGray
  }
});
