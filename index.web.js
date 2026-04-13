import { AppRegistry, Appearance } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import moment from 'moment';
import 'moment/locale/es';
moment.locale('es');

// Force light mode on web.
// The app's dark mode sets backgroundColor: 'black' on all views (basic.ts),
// which creates a broken experience on web since not all components handle dark mode.
// Locking to light mode here keeps the web UI consistent.
Appearance.getColorScheme = () => 'light';
Appearance.addChangeListener = () => ({ remove: () => {} });

AppRegistry.registerComponent(appName, () => App);

AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
