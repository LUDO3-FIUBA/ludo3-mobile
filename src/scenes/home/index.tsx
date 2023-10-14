import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { home as style } from '../../styles';
import { SessionManager } from '../../managers';

Icon.loadFont();


const Home: React.FC<any> = () => {

  return (
    <View style={style().view}>
      <View style={style().mainView}>
        <Text style={style().text}>Bienvenido al Inicio</Text>
      </View>
    </View>
  );
};

export default Home;