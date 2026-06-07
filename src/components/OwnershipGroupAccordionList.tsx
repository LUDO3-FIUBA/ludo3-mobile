import React, { useState } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import MaterialIcon from './materialIcon';
import { lightModeColors } from '../styles/colorPalette';

export interface OwnershipGroupSection<TItem> {
  ownership_group: { id: number; name: string };
  items: TItem[];
}

interface OwnershipGroupAccordionListProps<TItem> {
  sections: OwnershipGroupSection<TItem>[];
  renderItems: (
    items: TItem[],
    section: OwnershipGroupSection<TItem>,
  ) => React.ReactNode;
  renderSectionAction?: (
    section: OwnershipGroupSection<TItem>,
  ) => React.ReactNode;
  emptyText?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const OwnershipGroupAccordionList = <TItem,>({
  sections,
  renderItems,
  renderSectionAction,
  emptyText = 'No hay formularios disponibles.',
  contentContainerStyle,
}: OwnershipGroupAccordionListProps<TItem>) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <ScrollView contentContainerStyle={[styles.list, contentContainerStyle]}>
      {sections.map(section => {
        const isExpanded = expandedId === section.ownership_group.id;

        return (
          <View key={section.ownership_group.id} style={styles.groupBlock}>
            <TouchableOpacity
              style={styles.groupCard}
              onPress={() => setExpandedId(isExpanded ? null : section.ownership_group.id)}
              activeOpacity={0.75}
            >
              <View style={styles.groupCardLeft}>
                <View style={styles.groupIcon}>
                  <MaterialIcon name="folder-account" fontSize={22} color={lightModeColors.institutional} />
                </View>
                <Text style={styles.groupTitle}>
                  {section.ownership_group.name}
                </Text>
              </View>
              <View style={styles.groupCardRight}>
                {renderSectionAction?.(section)}
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{section.items.length}</Text>
                </View>
                <MaterialIcon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  fontSize={20}
                  color="#bbb"
                />
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.formsContainer}>
                {section.items.length === 0 ? (
                  <Text style={styles.emptyText}>{emptyText}</Text>
                ) : (
                  renderItems(section.items, section)
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },

  groupBlock: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 8,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  groupCardRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  groupTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#222' },
  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    backgroundColor: lightModeColors.institutional,
  },
  badgeText: { color: 'white', fontSize: 12, fontWeight: '700' },

  formsContainer: { gap: 8 },
  emptyText: { color: '#aaa', fontSize: 13 },
});

export default OwnershipGroupAccordionList;
