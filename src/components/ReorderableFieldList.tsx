import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcon from './materialIcon';

export interface ReorderableItem {
  key: string | number;
  label: string;
  meta?: string;
}

interface ReorderableFieldListProps {
  items: ReorderableItem[];
  emptyText?: string;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
}

const ReorderableFieldList: React.FC<ReorderableFieldListProps> = ({
  items,
  emptyText,
  onEdit,
  onRemove,
  onMove,
}) => {
  if (items.length === 0 && emptyText) {
    return <Text style={styles.empty}>{emptyText}</Text>;
  }

  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <View key={item.key} style={styles.row}>
            <View style={styles.reorderColumn}>
              <TouchableOpacity
                style={[styles.reorderBtn, isFirst && styles.reorderBtnDisabled]}
                onPress={() => onMove(index, index - 1)}
                disabled={isFirst}
                hitSlop={6}
              >
                <MaterialIcon
                  name="chevron-up"
                  fontSize={18}
                  color={isFirst ? '#c5c5c5' : '#555'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reorderBtn, isLast && styles.reorderBtnDisabled]}
                onPress={() => onMove(index, index + 1)}
                disabled={isLast}
                hitSlop={6}
              >
                <MaterialIcon
                  name="chevron-down"
                  fontSize={18}
                  color={isLast ? '#c5c5c5' : '#555'}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.info}
              onPress={() => onEdit(index)}
              activeOpacity={0.75}
            >
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
              {item.meta ? <Text style={styles.meta}>{item.meta}</Text> : null}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onRemove(index)} hitSlop={8}>
              <MaterialIcon name="close-circle" fontSize={22} color="#D32F2F" />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  list: { gap: 8 },
  empty: { color: '#aaa', fontSize: 13, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f6ff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 8,
  },
  reorderColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  reorderBtnDisabled: {
    opacity: 0.4,
  },
  info: { flex: 1, paddingVertical: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#333' },
  meta: { fontSize: 12, color: '#777', marginTop: 2 },
});

export default ReorderableFieldList;
