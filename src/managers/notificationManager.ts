import PushNotification from 'react-native-push-notification';
import {usersRepository} from '../repositories';

export default class NotificationManager {
  static myInstance = new NotificationManager();

  static getInstance() {
    return this.myInstance;
  }

  onNotification(notification) {
    console.log('NotificationManager:', notification);

    if (typeof this._onNotification === 'function') {
      this._onNotification(notification);
    }
  }

  onRegister(token) {
    console.log('NotificationManager:', token);
    usersRepository.sendPushToken(token.token);

    if (typeof this._onRegister === 'function') {
      this._onRegister(token);
    }
  }

  onAction(notification) {
    console.log('Notification action received:');
    console.log(notification.action);
    console.log(notification);

    if (notification.action === 'Yes') {
      PushNotification.invokeApp(notification);
    }
  }

  // (optional) Called when the user fails to register for remote notifications.
  // Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError(err) {
    console.log(err);
  }

  // Public interface

  attachRegister(handler) {
    this._onRegister = handler;
  }

  attachNotification(handler) {
    this._onNotification = handler;
  }

  checkPermissions(callback) {
    return PushNotification.checkPermissions(callback);
  }

  requestPermissions() {
    return PushNotification.requestPermissions();
  }
}

const manager = NotificationManager.getInstance();

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: manager.onRegister.bind(manager),

  // (required) Called when a remote or local notification is opened or received
  onNotification: manager.onNotification.bind(manager),

  // (optional) Called when Action is pressed (Android)
  onAction: manager.onAction.bind(manager),

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: manager.onRegistrationError.bind(manager),

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   */
  requestPermissions: false,
});
