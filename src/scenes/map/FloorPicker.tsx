import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FloorEntry } from './floors/index';
import { lightModeColors } from '../../styles/colorPalette';

type Props = {
  floors: FloorEntry[];
  currentFloorId: string;
  onSelect: (floorId: string) => void;
};

export default function FloorPicker({ floors, currentFloorId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const currentFloor = floors.find(f => f.id === currentFloorId);

  return (
    <View style={[styles.container, { pointerEvents: 'box-none' }]}>
      {open && (
        <View style={styles.menu}>
          {[...floors].reverse().map(floor => (
            <TouchableOpacity
              key={floor.id}
              style={[styles.menuItem, floor.id === currentFloorId && styles.menuItemActive]}
              onPress={() => { onSelect(floor.id); setOpen(false); }}
            >
              <Text style={[styles.menuItemLabel, floor.id === currentFloorId && styles.menuItemLabelActive]}>
                {floor.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.btn} onPress={() => setOpen(o => !o)}>
        <MaterialCommunityIcons name="layers-outline" size={18} color={lightModeColors.darkGray} />
        <Text style={styles.btnLabel}>{currentFloor?.label ?? ''}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    alignItems: 'flex-start',
    gap: 6,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: lightModeColors.lightGray,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  btnLabel: {
    fontSize: 14,
    color: lightModeColors.darkGray,
    fontWeight: '500',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightModeColors.lightGray,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
    minWidth: 100,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItemActive: {
    backgroundColor: lightModeColors.institutional + '18',
  },
  menuItemLabel: {
    fontSize: 14,
    color: lightModeColors.darkGray,
  },
  menuItemLabelActive: {
    color: lightModeColors.institutional,
    fontWeight: '600',
  },
});
