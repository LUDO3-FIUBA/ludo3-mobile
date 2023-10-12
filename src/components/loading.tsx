import React, { FC } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getStyleSheet as style } from '../styles';

const Loading: FC = () => {
  return (
    <View style={style().loading}>
      <ActivityIndicator size={64} color={style().loading.color} />
    </View>
  );
};

export default Loading;
