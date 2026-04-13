import {post as publicPost} from '../networking';

export function refresh(token: string): Promise<object> {
  return publicPost('auth/jwt/refresh', {refresh: token});
}
