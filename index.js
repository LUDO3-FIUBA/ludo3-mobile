/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']); // To fix this we should upgrade to react-navigation 6.X AFAIK

AppRegistry.registerComponent(appName, () => App);
