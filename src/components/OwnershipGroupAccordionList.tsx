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

const DEFAULT_ICON = 'folder';
const DEFAULT_COLOR = '#757575';

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
          <View
            key={section.ownership_group.id}
            style={[styles.groupBlock, { borderLeftColor: DEFAULT_COLOR }]}
          >
            <TouchableOpacity
              style={styles.groupCard}
              onPress={() => setExpandedId(isExpanded ? null : section.ownership_group.id)}
              activeOpacity={0.75}
            >
              <View style={styles.groupCardLeft}>
                <MaterialIcon name={DEFAULT_ICON} fontSize={28} color={DEFAULT_COLOR} />
                <Text style={[styles.groupTitle, { color: DEFAULT_COLOR }]}>
                  {section.ownership_group.name}
                </Text>
              </View>
              <View style={styles.groupCardRight}>
                {renderSectionAction?.(section)}
                <View style={[styles.badge, { backgroundColor: DEFAULT_COLOR }]}>
                  <Text style={styles.badgeText}>{section.items.length}</Text>
                </View>
                <MaterialIcon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  fontSize={20}
                  color="#666"
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
    borderLeftWidth: 4,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  groupCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupCardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupTitle: { fontSize: 17, fontWeight: '700' },
  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: 'white', fontSize: 12, fontWeight: '700' },

  formsContainer: { gap: 8 },
  emptyText: { color: '#aaa', fontSize: 13 },
});

export default OwnershipGroupAccordionList;
