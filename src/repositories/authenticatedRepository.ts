import {
  get as basicGet,
  post as basicPost,
  put as basicPut,
  StatusCodeError,
} from '../networking';
import { refresh } from './authentication';
import SessionManager from '../managers/sessionManager';

export class MustLoginAgain extends Error {
  constructor() {
    super('Must login afresh again.');
    this.name = 'MustLoginAgain';
  }
}

export function post(
  url: string,
  body: any,
  queryParams = [],
  headers = {},
): Promise<Object> {
  const sessionManager: SessionManager | null = SessionManager.getInstance() 
  const token = sessionManager?.getAuthToken();
  if (!token) {
    return Promise.reject(new MustLoginAgain());
  }
  return basicPost(url, body, queryParams, {
    ...headers,
    Authorization: `Bearer ${token}`,
  }).catch(error => {
    return reLogInIfNecessary(error).then(newToken => {
      return basicPost(url, body, queryParams, {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      });
    });
  });
}

export function get(url: string, queryParams = [], headers = {}): Promise<Object> {
  const sessionManager: SessionManager | null = SessionManager.getInstance() 
  const token = sessionManager?.getAuthToken();
  if (!token) {
    return Promise.reject(new MustLoginAgain());
  }
  return basicGet(url, queryParams, {
    ...headers,
    Authorization: `Bearer ${token}`,
  }).catch(error => {
    return reLogInIfNecessary(error).then(newToken => {
      return basicGet(url, queryParams, {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      });
    });
  });
}

export function put(
  url: string,
  body: any,
  queryParams = [],
  headers = {},
): Promise<Object> {
  const sessionManager: SessionManager | null = SessionManager.getInstance() 
  const token = sessionManager?.getAuthToken();
  if (!token) {
    return Promise.reject(new MustLoginAgain());
  }
  return basicPut(url, body, queryParams, {
    ...headers,
    Authorization: `Bearer ${token}`,
  }).catch(error => {
    return reLogInIfNecessary(error).then(newToken => {
      return basicPut(url, body, queryParams, {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      });
    });
  });
}

interface RefreshJsonObject {
  refresh?: string;
  access?: string;
}

function reLogInIfNecessary(error: unknown): Promise<string> {
  if (error instanceof StatusCodeError && error.code == 401) {
    const sessionManager: SessionManager | null = SessionManager.getInstance() 
    const refreshToken = sessionManager?.getRefreshToken();
    if (refreshToken) {
      return refresh(refreshToken).then(async json => {
          json.refresh = refreshToken;
          await sessionManager?.saveCredentials(json);
          return json.access;
        })
        .catch(async error => {
          if (error instanceof StatusCodeError && error.code == 401) {
            await sessionManager?.clearCredentials();
            return Promise.reject(new MustLoginAgain());
          }
          return Promise.reject(error);
        });
    }
    return Promise.reject(new MustLoginAgain());
  }
  return Promise.reject(error);
}

export default {post, get, MustLoginAgain};
