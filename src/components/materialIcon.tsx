import React, { FC } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface MaterialIconProps {
  name: string;
  fontSize: number;
  color?: string;
  style?: object;
}

const MaterialIcon: FC<MaterialIconProps> = ({ name, fontSize, color = 'white', style }) => {
  return (
    <Icon name={name} style={{ fontSize, color, ...style }} />
  );
};

export default MaterialIcon;
