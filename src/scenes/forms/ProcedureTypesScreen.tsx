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
          <View key={section.procedure.id}>
            <TouchableOpacity
              style={[styles.procedureCard, { borderLeftColor: config.color }]}
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
                      <View
                        key={item.form_id}
                        style={[styles.formCard, { borderLeftColor: config.color }]}
                      >
                        <Text style={styles.formName}>{item.form_name}</Text>
                        {!!item.form_description && (
                          <Text style={styles.formDesc}>{item.form_description}</Text>
                        )}
                        <View style={styles.actions}>
                          {isDocumento && (
                            <TouchableOpacity
                              style={[styles.btn, styles.btnSecondary]}
                              onPress={() =>
                                navigation.navigate('DocumentForm', {
                                  formId: item.form_id,
                                  action: 'download',
                                })
                              }
                            >
                              <MaterialIcon name="download" fontSize={15} color="#555" />
                              <Text style={styles.btnSecondaryText}>Descargar</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[styles.btn, { backgroundColor: config.color }]}
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

  procedureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderLeftWidth: 4,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
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

  formsContainer: { marginTop: 4, gap: 8, paddingLeft: 8 },
  emptyText: { color: '#aaa', fontSize: 13, paddingLeft: 4 },

  formCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderLeftWidth: 4,
    padding: 14,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  formName: { fontSize: 15, fontWeight: '700', color: '#222' },
  formDesc: { fontSize: 13, color: '#666' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4, alignSelf: 'flex-start' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  btnSecondary: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f5f5f5' },
  btnSecondaryText: { color: '#555', fontWeight: '600', fontSize: 13 },
});

export default ProcedureTypesScreen;
