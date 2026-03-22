// Web version of basic.ts — always returns light mode.
// basic.ts calls Appearance.getColorScheme() at module-init time when spread via
// `...basic()` inside StyleSheet.create() in other style files (e.g. finalExamList.ts).
// On web with OS dark mode active this produces backgroundColor:'black' before any
// Appearance override can run. This file removes that dependency entirely.
import { StyleSheet } from 'react-native';
import { lightModeColors } from './colorPalette';

const lightViewColors = {
  tintColor: lightModeColors.mainContrastColor,
  color: lightModeColors.mainColor,
};

const sharedStyle = StyleSheet.create({
  view: { flex: 1, flexDirection: 'column' },
  containerView: { flex: 1, padding: 15 },
  listView: { alignItems: 'stretch', paddingVertical: 5 },
  listHeaderFooter: { margin: 15 },
  scrollView: { flexGrow: 1, alignItems: 'stretch', justifyContent: 'space-between', padding: 15 },
  text: { fontSize: 15 },
  button: { fontSize: 15, fontWeight: 'bold', height: 50, borderRadius: 25 },
  textInput: { fontSize: 15, height: 50, borderWidth: 1 },
  textInputPlaceholder: { fontSize: 15, height: 50, borderWidth: 1, color: 'darkgray' },
  errorInInput: { fontSize: 13 },
  loading: { alignItems: 'center', justifyContent: 'center', width: '100%', height: '90%', backgroundColor: 'transparent', position: 'absolute', zIndex: 999 },
});

const lightMode = StyleSheet.create({
  ...sharedStyle,
  view: { ...sharedStyle.view, ...lightViewColors },
  containerView: { ...sharedStyle.containerView, ...lightViewColors },
  listView: { ...sharedStyle.listView, ...lightViewColors },
  scrollView: { ...sharedStyle.scrollView, ...lightViewColors },
  text: { ...sharedStyle.text, color: lightModeColors.mainContrastColor },
  button: { ...sharedStyle.button, backgroundColor: lightModeColors.secondaryColor },
  textInput: { ...sharedStyle.textInput, borderColor: lightModeColors.mainColor, color: lightModeColors.mainContrastColor },
  textInputPlaceholder: { ...sharedStyle.textInputPlaceholder, color: lightModeColors.darkGray },
  errorInInput: { ...sharedStyle.errorInInput, color: 'red' },
  loading: { ...sharedStyle.loading, color: lightModeColors.darkGray },
});

export default function getStyleSheet() {
  return lightMode;
}
