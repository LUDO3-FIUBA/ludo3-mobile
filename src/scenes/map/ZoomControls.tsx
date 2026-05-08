import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { lightModeColors } from '../../styles/colorPalette';

type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export default function ZoomControls({ onZoomIn, onZoomOut, onReset }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={onZoomIn}>
        <Text style={styles.label}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onZoomOut}>
        <Text style={styles.label}>−</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.resetBtn]} onPress={onReset}>
        <Text style={styles.label}>⌂</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    gap: 6,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: lightModeColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  resetBtn: {},
  label: {
    fontSize: 18,
    color: lightModeColors.darkGray,
    lineHeight: 22,
  },
});
