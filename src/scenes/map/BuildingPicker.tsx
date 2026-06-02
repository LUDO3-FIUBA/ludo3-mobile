import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { BuildingEntry } from './floors/index';
import { lightModeColors } from '../../styles/colorPalette';

type Props = {
  buildings: BuildingEntry[];
  currentBuildingId: string;
  onSelect: (buildingId: string) => void;
};

export default function BuildingPicker({ buildings, currentBuildingId, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {buildings.map((building, index) => {
        const isActive = building.id === currentBuildingId;
        const isFirst = index === 0;
        const isLast = index === buildings.length - 1;
        return (
          <TouchableOpacity
            key={building.id}
            style={[
              styles.segment,
              isFirst && styles.segmentFirst,
              isLast && styles.segmentLast,
              isActive && styles.segmentActive,
            ]}
            onPress={() => onSelect(building.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {building.shortLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightModeColors.lightGray,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  segment: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: lightModeColors.lightGray,
  },
  segmentFirst: {
    borderLeftWidth: 0,
  },
  segmentLast: {
    borderRightWidth: 0,
  },
  segmentActive: {
    backgroundColor: lightModeColors.institutional,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: lightModeColors.darkGray,
  },
  labelActive: {
    color: '#fff',
  },
});
