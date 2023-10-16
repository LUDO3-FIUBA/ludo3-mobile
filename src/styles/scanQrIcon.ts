import { StyleSheet, Appearance } from 'react-native';
import basic from './basic';
import { lightModeColors, darkModeColors } from './colorPalette';

export default function getStyleSheet() {
    return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

const sharedStyle = StyleSheet.create({
    ...basic(),
    container: {
        position: 'absolute',
        bottom: -10,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    icon: { fontSize: 32, color: "black" },
    touchableOpacity: { padding: 12, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      borderColor: "black",
      borderWidth: 4 }
});

const lightMode = StyleSheet.create({
    ...sharedStyle,
    touchableOpacity: {
      ...sharedStyle.touchableOpacity,
      backgroundColor: lightModeColors.mainColor,
    },
  });
  
  const darkMode = StyleSheet.create({
    ...sharedStyle,
    touchableOpacity: {
      ...sharedStyle.touchableOpacity,
      backgroundColor: darkModeColors.mainColor,
    },
  });
  