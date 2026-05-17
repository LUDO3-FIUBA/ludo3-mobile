import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { post as publicPost } from '../networking';

const REFRESH_KEY = '@refresh_secure';

export default class SessionManager {
  static myInstance: SessionManager | null = null;
  private _access: string | null = null;

  static getInstance(): SessionManager {
    if (SessionManager.myInstance == null) {
      SessionManager.myInstance = new SessionManager();
    }
    return SessionManager.myInstance;
  }

  async saveCredentials(credentials: any) {
    try {
      this._access = credentials.access;
      if (credentials.refresh) {
        await SecureStore.setItemAsync(REFRESH_KEY, credentials.refresh);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async getCredentials(): Promise<boolean> {
    // One-time migration: move legacy AsyncStorage refresh token to SecureStore.
    try {
      const legacyRefresh = await AsyncStorage.getItem('@refresh');
      if (legacyRefresh) {
        await SecureStore.setItemAsync(REFRESH_KEY, legacyRefresh);
        await AsyncStorage.removeItem('@access');
        await AsyncStorage.removeItem('@refresh');
      }
    } catch {}

    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      if (!refreshToken) return false;

      const result: any = await publicPost('auth/jwt/refresh', { refresh: refreshToken });
      this._access = result.access;
      if (result.refresh) {
        await SecureStore.setItemAsync(REFRESH_KEY, result.refresh);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async clearCredentials() {
    this._access = null;
    try {
      await SecureStore.deleteItemAsync(REFRESH_KEY);
    } catch {}
  }

  async invalidateSession() {
    this._access = null;
  }

  isLoggedIn() {
    return this._access != null;
  }

  getAuthToken() {
    return this._access;
  }

  getRefreshToken(): string | null {
    return null;
  }
}
