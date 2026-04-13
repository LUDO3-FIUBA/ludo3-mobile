import { MustLoginAgain } from '../repositories';

export function makeRequest(f: any, navigation: any) {
  return f().catch((error: unknown) => {
    if (error instanceof MustLoginAgain) {
      navigation.reset({
        index: 0,
        routes: [{name: 'Landing'}],
      });
    } else {
      return Promise.reject(error);
    }
  });
}
