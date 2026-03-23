import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lightModeColors } from '../../styles/colorPalette';
import { ViewMode } from './index';

interface Props {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}

const MODES: { key: ViewMode; label: string }[] = [
  { key: 'month', label: 'Mes' },
  { key: 'week',  label: 'Semana' },
  { key: 'day',   label: 'Día' },
];

const ViewModeToggle = ({ mode, onChange }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        {MODES.map(({ key, label }) => {
          const selected = mode === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.segment, selected && styles.segmentSelected]}
              onPress={() => onChange(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, selected && styles.labelSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ViewModeToggle;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  segmentSelected: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  label: {
    fontSize: 13,
    color: '#888',
    fontWeight: '400',
  },
  labelSelected: {
    color: lightModeColors.institutional,
    fontWeight: '600',
  },
});
