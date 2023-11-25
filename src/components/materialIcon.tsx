import React, { FC } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { lightModeColors } from '../styles/colorPalette';

interface MaterialIconProps {
  name: string;
  fontSize: number;
  color?: string;
  style?: object;
}

const MaterialIcon: FC<MaterialIconProps> = ({ name, fontSize, color = lightModeColors.institutional, style }) => {
  return (
    <Icon name={name} style={{ fontSize, color, ...style }} />
  );
};

export default MaterialIcon;
