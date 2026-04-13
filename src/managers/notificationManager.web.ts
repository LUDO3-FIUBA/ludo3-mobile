// Web stub for NotificationManager
// Push notifications not supported in web version
export default class NotificationManager {
  static myInstance = new NotificationManager();
  _onRegister: any;
  _onNotification: any;

  static getInstance() {
    return this.myInstance;
  }

  onNotification(notification) {
    console.log('NotificationManager (Web): Notifications not supported in web');
  }

  onRegister(event) {
    console.log('NotificationManager (Web): Notifications not supported in web');
  }

  registerCallbacks() {
    console.log('NotificationManager (Web): Skipping notification registration');
  }

  onRegistrationError(err) {
    console.log('NotificationManager (Web):', err);
  }

  onRegistrationDenied() {
    console.log('NotificationManager (Web): Registration Denied');
  }
}

const manager = NotificationManager.getInstance();


