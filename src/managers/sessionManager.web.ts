import { baseUrl } from '../networking';

const REFRESH_PATH = `${baseUrl}/auth/jwt/refresh/`;
const LOGOUT_PATH = `${baseUrl}/auth/jwt/logout/`;
const WEB_HEADERS = { 'Content-Type': 'application/json', 'X-Client': 'web' };

export default class SessionManager {
  static myInstance: SessionManager | null = null;
  private _access: string | null = null;

  static getInstance(): SessionManager {
    if (!SessionManager.myInstance) {
      SessionManager.myInstance = new SessionManager();
    }
    return SessionManager.myInstance;
  }

  async saveCredentials(credentials: { access: string; refresh?: string }) {
    this._access = credentials.access;
    return true;
  }

  async getCredentials(): Promise<boolean> {
    // One-time migration: if legacy localStorage tokens exist, exchange the
    // refresh token for a cookie then discard both legacy keys.
    const legacyRefresh = localStorage.getItem('@refresh');
    if (legacyRefresh) {
      try {
        const res = await fetch(REFRESH_PATH, {
          method: 'POST',
          headers: WEB_HEADERS,
          body: JSON.stringify({ refresh: legacyRefresh }),
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.access) {
            this._access = json.access;
            localStorage.removeItem('@access');
            localStorage.removeItem('@refresh');
            return true;
          }
        }
      } catch {}
      // Migration failed or returned invalid data — discard legacy keys anyway
      // so we don't retry on every load; user will re-login.
      localStorage.removeItem('@access');
      localStorage.removeItem('@refresh');
    }

    // Normal path: use the httpOnly refresh cookie.
    try {
      const res = await fetch(REFRESH_PATH, {
        method: 'POST',
        headers: WEB_HEADERS,
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.access) {
          this._access = json.access;
          return true;
        }
      }
    } catch {}

    return false;
  }

  async clearCredentials() {
    this._access = null;
    try {
      await fetch(LOGOUT_PATH, {
        method: 'POST',
        headers: WEB_HEADERS,
        credentials: 'include',
      });
    } catch {}
  }

  async invalidateSession() {
    this._access = null;
  }

  isLoggedIn() {
    return this._access !== null;
  }

  getAuthToken() {
    return this._access;
  }

  getRefreshToken(): string | null {
    return null;
  }
}
