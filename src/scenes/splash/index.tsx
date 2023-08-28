import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import SessionManager from '../../managers/sessionManager';

interface Props {
  navigation: any;
}

const Splash = ({ navigation }: Props) => {
  useEffect(() => {
    const init = async () => {
      const sessionInstance: SessionManager = await SessionManager.getInstance()! 
      if (sessionInstance) {
        sessionInstance.getCredentials();
        const loggedIn = sessionInstance.isLoggedIn();
        navigation.replace(loggedIn ? 'Home' : 'Landing');
      }
    };

    init();
  }, [navigation]);

  return (
    <View>
      <Text>LUDO</Text>
      <Text>
        Libreta Universitaria
        {'\n'}
        Digital Oficial
      </Text>
    </View>
  );
};

export default Splash;
