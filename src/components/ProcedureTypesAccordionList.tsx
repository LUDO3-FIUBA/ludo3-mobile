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

export const PROCEDURE_CONFIG: Record<string, { icon: string; color: string }> = {
  Administrativo: { icon: 'home-city', color: '#F9A825' },
  Exámenes: { icon: 'file-document', color: '#388E3C' },
  Carrera: { icon: 'school', color: '#D32F2F' },
  Cursada: { icon: 'calendar-month', color: '#1976D2' },
};

export interface ProcedureSection<TItem> {
  procedure: { id: number; value: string };
  items: TItem[];
}

interface ProcedureTypesAccordionListProps<TItem> {
  sections: ProcedureSection<TItem>[];
  renderItems: (
    items: TItem[],
    section: ProcedureSection<TItem>,
    config: { icon: string; color: string },
  ) => React.ReactNode;
  emptyText?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const ProcedureTypesAccordionList = <TItem,>({
  sections,
  renderItems,
  emptyText = 'No hay formularios disponibles.',
  contentContainerStyle,
}: ProcedureTypesAccordionListProps<TItem>) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <ScrollView contentContainerStyle={[styles.list, contentContainerStyle]}>
      {sections.map(section => {
        const config =
          PROCEDURE_CONFIG[section.procedure.value] ?? { icon: 'folder', color: '#757575' };
        const isExpanded = expandedId === section.procedure.id;

        return (
          <View
            key={section.procedure.id}
            style={[styles.procedureBlock, { borderLeftColor: config.color }]}
          >
            <TouchableOpacity
              style={styles.procedureCard}
              onPress={() => setExpandedId(isExpanded ? null : section.procedure.id)}
              activeOpacity={0.75}
            >
              <View style={styles.procedureCardLeft}>
                <MaterialIcon name={config.icon} fontSize={28} color={config.color} />
                <Text style={[styles.procedureTitle, { color: config.color }]}>
                  {section.procedure.value}
                </Text>
              </View>
              <View style={styles.procedureCardRight}>
                <View style={[styles.badge, { backgroundColor: config.color }]}>
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
                  renderItems(section.items, section, config)
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

  procedureBlock: {
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
  procedureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  procedureCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  procedureCardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  procedureTitle: { fontSize: 17, fontWeight: '700' },
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

export default ProcedureTypesAccordionList;
