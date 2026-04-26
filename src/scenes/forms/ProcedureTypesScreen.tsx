import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import { formsRepository } from '../../repositories';
import Form from '../../models/Form';
import FormProcedureType from '../../models/FormProcedureType';

const PROCEDURE_CONFIG: Record<string, { icon: string; color: string }> = {
  Administrativo: { icon: 'home-city', color: '#F9A825' },
  Exámenes: { icon: 'file-document', color: '#388E3C' },
  Carrera: { icon: 'school', color: '#D32F2F' },
  Cursada: { icon: 'calendar-month', color: '#1976D2' },
};

interface Section {
  procedure: FormProcedureType;
  forms: Form[];
}

const ProcedureTypesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([formsRepository.fetchProcedureTypes(), formsRepository.fetchForms()])
      .then(([procedureTypes, forms]) => {
        setSections(
          procedureTypes.map(proc => ({
            procedure: proc,
            forms: forms.filter(f => f.form_procedure.id === proc.id),
          })),
        );
      })
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los trámites.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.list}>
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
                  <Text style={styles.badgeText}>{section.forms.length}</Text>
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
                {section.forms.length === 0 ? (
                  <Text style={styles.emptyText}>No hay formularios disponibles.</Text>
                ) : (
                  section.forms.map(item => {
                    const isDocumento = item.form_type.value === 'Documento';
                    return (
                      <View key={item.form_id} style={styles.formCard}>
                        <View style={styles.formCardRow}>
                          <View style={styles.formMainInfo}>
                            <Text style={styles.formName}>{item.form_name}</Text>
                            {!!item.form_description && (
                              <Text style={styles.formDesc}>{item.form_description}</Text>
                            )}
                          </View>
                          <View style={styles.actions}>
                            <TouchableOpacity
                              style={styles.btnPrimary}
                              onPress={() => {
                                if (isDocumento) {
                                  navigation.navigate('DocumentForm', {
                                    formId: item.form_id,
                                    action: 'submit',
                                  });
                                } else {
                                  navigation.navigate('DigitalForm', { formId: item.form_id });
                                }
                              }}
                            >
                              <MaterialIcon name="send" fontSize={15} color="white" />
                              <Text style={styles.btnText}>Enviar</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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

  formCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e2e2',
  },
  formCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  formMainInfo: {
    flex: 1,
    gap: 6,
  },
  formName: { fontSize: 15, fontWeight: '700', color: '#222' },
  formDesc: { fontSize: 13, color: '#666' },
  actions: {
    minWidth: 88,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#455A64',
  },
  btnText: { color: 'white', fontWeight: '600', fontSize: 13 },
});

export default ProcedureTypesScreen;
