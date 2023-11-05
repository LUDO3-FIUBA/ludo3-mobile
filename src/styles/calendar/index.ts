import { StyleSheet, Appearance } from 'react-native';
import { lightModeColors, darkModeColors } from '../colorPalette';

export default function getStyleSheet() {
    return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

const styles = StyleSheet.create({
    calendar: {
        paddingLeft: 20,
        paddingRight: 20
    },
    header: {
        backgroundColor: 'lightgrey'
    },
    section: {
        backgroundColor: 'white',
        color: 'darkgray',
    }
});

const darkMode = StyleSheet.create({
    ...styles
});

const lightMode = StyleSheet.create({
    ...styles
});
