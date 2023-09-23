import {Component} from 'react';
import {MustLoginAgain} from '../repositories';

interface AuthenticatedComponentProps {
  navigation: any; // specify a more detailed type if available
}

export default class AuthenticatedComponent extends Component<AuthenticatedComponentProps> {
  // f is an async function that returns a promise
  // and that may result in a MustLoginAgain error
  request(f: any) {
    const { navigation } = this.props;
    return makeRequest(f, navigation);
  }
}

function makeRequest(f: any, navigation: any) {
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

export {AuthenticatedComponent, makeRequest};
