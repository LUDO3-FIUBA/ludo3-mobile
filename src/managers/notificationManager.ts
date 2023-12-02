import { NotificationBackgroundFetchResult, Notifications, Registered } from 'react-native-notifications';
import { usersRepository } from '../repositories';
import { PermissionsAndroid } from 'react-native';

export default class NotificationManager {
  static myInstance = new NotificationManager();
  _onRegister: any;
  _onNotification: any;

  static getInstance() {
    return this.myInstance;
  }

  onNotification(notification) {
    console.log('NotificationManager:', notification);

    if (typeof this._onNotification === 'function') {
      this._onNotification(notification);
    }
  }

  onRegister(event: Registered) {
    console.log('NotificationManager:', event);
    usersRepository.sendPushToken(event.deviceToken);

    if (typeof this._onRegister === 'function') {
      this._onRegister(event);
    }
  }

  registerCallbacks() {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

    Notifications.registerRemoteNotifications();
    Notifications.events().registerRemoteNotificationsRegistered(manager.onRegister.bind(manager))
    Notifications.events().registerRemoteNotificationsRegistrationFailed(manager.onRegistrationError.bind(manager))
    Notifications.events().registerRemoteNotificationsRegistrationDenied(manager.onRegistrationDenied.bind(manager))
    Notifications.events().registerNotificationReceivedBackground((notif, completion) => { console.log("Background Notif:", notif); completion(NotificationBackgroundFetchResult.NO_DATA) })
    Notifications.events().registerNotificationReceivedForeground((notif, completion) => {
      console.log("Foreground Notif:", notif);
      Notifications.postLocalNotification({
        body: notif.payload["gcm.notification.body"],
        title: notif.payload["gcm.notification.title"],
      });
      completion({ badge: false, alert: false, sound: false })
    })

    console.log('NotificationManager: Registered notification permissions')
  }

  // (optional) Called when the user fails to register for remote notifications.
  // Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError(err) {
    console.log(err);
  }

  onRegistrationDenied() {
    console.log("NotificationManager: Registration Denied");
  }
}

const manager = NotificationManager.getInstance();
