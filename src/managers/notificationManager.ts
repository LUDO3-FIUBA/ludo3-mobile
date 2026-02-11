import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { usersRepository } from '../repositories';

export default class NotificationManager {
  static myInstance = new NotificationManager();
  _onRegister: any;
  _onNotification: any;

  static getInstance() {
    return this.myInstance;
  }

  onNotification(notification: Notifications.Notification) {
    console.log('NotificationManager:', notification);

    if (typeof this._onNotification === 'function') {
      this._onNotification(notification);
    }
  }

  async registerCallbacks() {
    if (Platform.OS === 'web') {
      console.log('NotificationManager (Web): Skipping notification registration');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('NotificationManager: Permission not granted');
      return;
    }

    try {
      const tokenData = await Notifications.getDevicePushTokenAsync();
      console.log('NotificationManager: Token received', tokenData.data);
      usersRepository.sendPushToken(tokenData.data).catch(() => {});

      if (typeof this._onRegister === 'function') {
        this._onRegister(tokenData);
      }
    } catch (err) {
      console.log('NotificationManager: Registration error', err);
    }

    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Foreground Notif:', notification);
      this.onNotification(notification);
    });

    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification Response:', response);
    });

    console.log('NotificationManager: Registered notification permissions');
  }
}

const manager = NotificationManager.getInstance();
