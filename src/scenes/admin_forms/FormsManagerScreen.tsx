import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import { formsRepository } from '../../repositories';
import Form from '../../models/Form';
import FormSubmission from '../../models/FormSubmission';
import { lightModeColors } from '../../styles/colorPalette';

const PROCEDURE_COLORS: Record<string, string> = {
  Administrativo: '#F9A825',
  Exámenes: '#388E3C',
  Carrera: '#D32F2F',
  Cursada: '#1976D2',
};

const FormsManagerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [submissionsCache, setSubmissionsCache] = useState<Record<number, FormSubmission[]>>({});
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [answersModal, setAnswersModal] = useState<FormSubmission | null>(null);

  const loadForms = useCallback(async () => {
    try {
      const data = await formsRepository.fetchForms();
      setForms(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los formularios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
    const unsub = navigation.addListener('focus', loadForms);
    return unsub;
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={() => navigation.navigate('FormDesigner')}
        >
          <MaterialIcon name="plus" fontSize={24} color={lightModeColors.mainContrastColor} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const toggleExpand = async (form: Form) => {
    if (expandedId === form.form_id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(form.form_id);
    if (submissionsCache[form.form_id]) return;
    setSubmissionsLoading(true);
    try {
      const subs = await formsRepository.fetchFormSubmissions(form.form_id);
      setSubmissionsCache(prev => ({ ...prev, [form.form_id]: subs }));
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las respuestas.');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleDeleteSubmission = (submission: FormSubmission, formId: number) => {
    Alert.alert(
      'Eliminar respuesta',
      `¿Eliminás la respuesta de ${submission.student_first_name} ${submission.student_last_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await formsRepository.deleteSubmission(submission.submission_id);
              setSubmissionsCache(prev => ({
                ...prev,
                [formId]: (prev[formId] ?? []).filter(s => s.submission_id !== submission.submission_id),
              }));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la respuesta.');
            }
          },
        },
      ],
    );
  };

  const daysSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'hoy';
    if (days === 1) return 'hace 1 día';
    return `hace ${days} días`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={forms}
        keyExtractor={item => String(item.form_id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const color = PROCEDURE_COLORS[item.form_procedure.value] ?? '#757575';
          const isExpanded = expandedId === item.form_id;
          const submissions = submissionsCache[item.form_id] ?? [];
          const isDigital = item.form_type.value === 'Digital';

          return (
            <View style={[styles.formCard, { borderLeftColor: color }]}>
              <TouchableOpacity onPress={() => toggleExpand(item)} activeOpacity={0.8} style={styles.formHeader}>
                <View style={styles.formHeaderText}>
                  <Text style={styles.formName}>{item.form_name}</Text>
                  <Text style={[styles.formType, { color }]}>{item.form_type.value} · {item.form_procedure.value}</Text>
                </View>
                <MaterialIcon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  fontSize={22}
                  color="#666"
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.submissionsSection}>
                  {submissionsLoading && !submissionsCache[item.form_id] ? (
                    <ActivityIndicator style={{ marginVertical: 12 }} />
                  ) : (
                    <>
                      <View style={styles.submissionsHeader}>
                        <Text style={styles.submissionsCount}>
                          {submissions.length} {submissions.length === 1 ? 'respuesta' : 'respuestas'}
                        </Text>
                        {isDigital && (
                          <TouchableOpacity
                            onPress={() =>
                              Alert.alert('Exportar', 'Función de exportación a Excel no disponible aún.')
                            }
                          >
                            <MaterialIcon name="microsoft-excel" fontSize={22} color="#388E3C" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {submissions.length === 0 ? (
                        <Text style={styles.emptyText}>Sin respuestas aún.</Text>
                      ) : (
                        submissions.map(sub => (
                          <View key={sub.submission_id} style={styles.submissionRow}>
                            <View style={styles.subInfo}>
                              <Text style={styles.subName}>
                                {sub.student_first_name} {sub.student_last_name}
                              </Text>
                              {sub.student_padron && (
                                <Text style={styles.subPadron}>Padrón: {sub.student_padron}</Text>
                              )}
                              <Text style={styles.subDate}>{daysSince(sub.submitted_at)}</Text>
                            </View>
                            <View style={styles.subActions}>
                              {isDigital && (
                                <TouchableOpacity onPress={() => setAnswersModal(sub)}>
                                  <MaterialIcon name="eye" fontSize={20} color="#1976D2" />
                                </TouchableOpacity>
                              )}
                              <TouchableOpacity onPress={() => handleDeleteSubmission(sub, item.form_id)}>
                                <MaterialIcon name="trash-can" fontSize={20} color="#D32F2F" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))
                      )}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />

      <Modal visible={!!answersModal} transparent animationType="slide" onRequestClose={() => setAnswersModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {answersModal?.student_first_name} {answersModal?.student_last_name}
              </Text>
              <TouchableOpacity onPress={() => setAnswersModal(null)}>
                <MaterialIcon name="close" fontSize={22} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {(answersModal?.answers ?? []).map((ans, i) => (
                <View key={i} style={styles.answerRow}>
                  <Text style={styles.answerLabel}>{ans.field_label}</Text>
                  <Text style={styles.answerValue}>{ans.answer_value ?? '—'}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 12 },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 8,
  },
  formHeaderText: { flex: 1 },
  formName: { fontSize: 15, fontWeight: '700', color: '#222' },
  formType: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  submissionsSection: { borderTopWidth: 1, borderTopColor: '#f0f0f0', padding: 14, gap: 8 },
  submissionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  submissionsCount: { fontSize: 13, fontWeight: '700', color: '#555' },
  emptyText: { color: '#aaa', fontSize: 13, fontStyle: 'italic' },
  submissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 8,
  },
  subInfo: { flex: 1, gap: 2 },
  subName: { fontSize: 14, fontWeight: '600', color: '#333' },
  subPadron: { fontSize: 12, color: '#777' },
  subDate: { fontSize: 12, color: '#999' },
  subActions: { flexDirection: 'row', gap: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '70%',
    gap: 12,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  answerRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 3,
  },
  answerLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  answerValue: { fontSize: 15, color: '#333' },
});

export default FormsManagerScreen;
