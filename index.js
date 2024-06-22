/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import { LogBox } from 'react-native';
LogBox.ignoreLogs([
    'new NativeEventEmitter', // To fix this we should upgrade to react-navigation 6.X AFAIK
    'TypeError: _reactNative.Dimensions.removeEventListener is not a function (it is undefined)' // To fix this we should... probably also upgrade react-navigation
]);

import moment from "moment";
import "moment/locale/es"
moment.locale('es');

import "./calendars.config";

AppRegistry.registerComponent(appName, () => App);
