import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './App';

LogBox.ignoreLogs([
  'ReactImageView: Image source "null"',
]);

import moment from 'moment';
import 'moment/locale/es';
moment.locale('es');

import './calendars.config';

registerRootComponent(App);
