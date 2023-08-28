import {Component} from 'react';
import {MustLoginAgain} from '../repositories';

export default class AuthenticatedComponent extends Component {
  // f is an async function that returns a promise
  // and that may result in a MustLoginAgain error
  request(f) {
    const {navigation} = this.props;
    return makeRequest(f, navigation);
  }
}

function makeRequest(f, navigation) {
  return f().catch(error => {
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
