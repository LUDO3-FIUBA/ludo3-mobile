import React, { FC } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { roundedButton as style } from '../styles';

interface RoundedButtonProps {
  text?: string;
  enabled?: boolean;
  onPress?: () => void;
  style?: {
    MainContainer?: StyleProp<ViewStyle>;
    TextStyle?: StyleProp<TextStyle>;
    tintColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  };
}

const RoundedButton: FC<RoundedButtonProps> = ({
  text = 'Button',
  enabled = true,
  onPress = () => Alert.alert('Pre-registro'),
  style: customStyle,
}) => {
  return (
    <View style={[style.MainContainer, customStyle?.MainContainer]}>
      <TouchableOpacity
        style={enabled ? style.EnabledSubmitButtonStyle : style.DisabledSubmitButtonStyle}
        activeOpacity={style.DisabledSubmitButtonStyle.opacity}
        disabled={!enabled}
        onPress={onPress}
      >
        <Text
          style={[
            style.TextStyle,
            {
              color: customStyle?.tintColor,
              fontSize: customStyle?.fontSize,
              fontFamily: customStyle?.fontFamily,
              fontWeight: customStyle?.fontWeight,
            },
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoundedButton;
