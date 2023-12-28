import React, { useEffect } from 'react';
import SessionManager from '../../managers/sessionManager';
import { Loading } from '../../components';

interface Props {
  navigation: any;
}

const Splash = ({ navigation }: Props) => {
  useEffect(() => {
    const init = async () => {
      const sessionInstance: SessionManager | null = SessionManager.getInstance()
      if (sessionInstance) {
        await sessionInstance.getCredentials();
        const loggedIn = sessionInstance.isLoggedIn();
        navigation.replace(loggedIn ? 'RootDrawer' : 'Landing');
      }
    };

    init();
  }, [navigation]);

  return (
    <Loading />
  );
};

export default Splash;
