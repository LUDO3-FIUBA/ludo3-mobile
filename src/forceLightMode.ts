import { Appearance } from 'react-native';

// Always pretend the OS is in light mode so the app keeps its original palette
// even when the device is in dark mode. Must be imported before any module
// whose top-level StyleSheet.create reads Appearance.getColorScheme().
Appearance.getColorScheme = () => 'light';
