import React, { useState, useRef } from 'react';
import { View, TouchableHighlight, Animated, Image, LayoutChangeEvent, TouchableOpacity, Easing, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { RadialMenu } from '../../components';
import { home as style } from '../../styles';
import { SessionManager } from '../../managers';
import VerifyIdentity from './subsections/HomeOptions/VerifyIdentity';

Icon.loadFont();


const Home: React.FC<any> = () => {

  return (
    <View style={style().view}>
      {/* {!menuOpened && (
        <View
          onLayout={(event) => handleLayout(event, radialMenuLayoutRef)}
          style={style().menu}
        />
      )} */}
      <View style={style().mainView}>
        <Text style={style().text}>Bienvenido al Inicio</Text>
      </View>
    </View>
  );
};

export default Home;