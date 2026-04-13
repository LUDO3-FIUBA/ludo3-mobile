import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { lightModeColors } from '../styles/colorPalette';

interface SquaredButtonProps {
  text: string
  onPress?: () => void;
  color?: string;
  disabled?: boolean;
}

const SquaredButton: React.FC<SquaredButtonProps> = ({ text, onPress, color, disabled }) => {
  const selectedColor = color || lightModeColors.institutional
  const selectedDisabled = false || disabled
  const selectedOnPress = onPress || (() => { });

  return (
    <TouchableOpacity style={[styles.squaredButton, { backgroundColor: selectedColor }]} disabled={selectedDisabled} onPress={selectedOnPress}>
      <Text style={styles.squaredButtonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  squaredButton: {
    marginTop: 5,
    padding: 10,
    borderRadius: 5,
  },
  squaredButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SquaredButton;
