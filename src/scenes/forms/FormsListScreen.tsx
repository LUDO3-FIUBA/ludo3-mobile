import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  MaterialIcon,
  ProcedureTypesAccordionList,
  SubmissionStatusBadge,
} from '../../components';
import { formsRepository } from '../../repositories';
import Form from '../../models/Form';
import FormProcedureType from '../../models/FormProcedureType';
import FormSubmission, { TeacherValidationStatusValue } from '../../models/FormSubmission';
import FormItem from './components/FormItem';

const TEACHER_STATUS_LABELS: Record<NonNullable<TeacherValidationStatusValue>, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  denied: 'Rechazado',
};

const TEACHER_STATUS_COLORS: Record<
  NonNullable<TeacherValidationStatusValue>,
  { bg: string; border: string; text: string }
> = {
  pending: { bg: '#FFF8E1', border: '#F9A825', text: '#E65100' },
  approved: { bg: '#E8F5E9', border: '#2E7D32', text: '#1B5E20' },
  denied: { bg: '#FFEBEE', border: '#C62828', text: '#B71C1C' },
};

const TeacherStatusBadge: React.FC<{ status: TeacherValidationStatusValue | null, teacherFirstName: string | null, teacherLastName: string | null }> = ({
  status,
  teacherFirstName,
  teacherLastName
}) => {
  if (!status) return null;
  const colors = TEACHER_STATUS_COLORS[status];
  return (
    <View style={styles.rowAlignLeft}>
      <Text style={styles.rowTeacher}>
        Docente: {teacherFirstName} {teacherLastName}
      </Text>
      <View style={[badgeStyles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={[badgeStyles.text, { color: colors.text }]}>{TEACHER_STATUS_LABELS[status]}</Text>
      </View>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700' },
});

interface Section {
  procedure: FormProcedureType;
  forms: Form[];
}

const FormsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [sections, setSections] = useState<Section[]>([]);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<FormSubmission[]>([]);

  useEffect(() => {
    Promise.all([formsRepository.fetchProcedureTypes(), formsRepository.fetchForms()])
      .then(([procedureTypes, forms]) => {
        setAllForms(forms);
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

  const formById = React.useMemo(() => {
    const map = new Map<number, Form>();
    allForms.forEach(f => map.set(f.form_id, f));
    return map;
  }, [allForms]);

  const openHistory = async () => {
    setHistoryOpen(true);
    setHistory([]);
    setHistoryLoading(true);
    try {
      const results = await Promise.all(
        allForms.map(f =>
          formsRepository
            .fetchMyFormSubmissions(f.form_id)
            .catch(() => [] as FormSubmission[]),
        ),
      );
      const merged = results
        .flat()
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
      setHistory(merged);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el historial.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.historyBtn} onPress={openHistory}>
          <MaterialIcon name="history" fontSize={16} color="#455A64" />
          <Text style={styles.historyBtnText}>Historial</Text>
        </TouchableOpacity>
      </View>

      <ProcedureTypesAccordionList
        sections={sections.map(section => ({
          procedure: section.procedure,
          items: section.forms,
        }))}
        renderItems={items =>
          items.map(item => {
            const isDocumento = item.form_type.value === 'Documento';
            return (
              <FormItem
                key={item.form_id}
                form={item}
                onSubmit={() => {
                  if (isDocumento) {
                    navigation.navigate('DocumentForm', {
                      formId: item.form_id,
                      action: 'submit',
                    });
                  } else {
                    navigation.navigate('DigitalForm', { formId: item.form_id });
                  }
                }}
              />
            );
          })
        }
      />

      <Modal
        visible={historyOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setHistoryOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
                Historial de envíos
              </Text>
              <TouchableOpacity onPress={() => setHistoryOpen(false)} hitSlop={8}>
                <MaterialIcon name="close" fontSize={22} color="#333" />
              </TouchableOpacity>
            </View>
            {historyLoading ? (
              <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : history.length === 0 ? (
              <Text style={styles.empty}>Aún no enviaste respuestas.</Text>
            ) : (
              <ScrollView>
                {history.map(submission => {
                  const form = formById.get(submission.form_id);
                  const requiresTeacher =
                    form?.requires_teacher_validation ?? submission.form_requires_teacher_validation;
                  return (
                    <View key={submission.submission_id} style={styles.row}>
                      <View style={styles.rowMain}>
                        <Text style={styles.rowFormName} numberOfLines={2}>
                          {submission.form_name}
                        </Text>
                        <Text style={styles.rowDate}>{formatDate(submission.submitted_at)}</Text>
                      </View>
                      <View>
                        <View style={styles.badgesLeft}>
                        {requiresTeacher && (
                          <View style={styles.rowAlignLeft}>
                            <TeacherStatusBadge
                              status={submission.teacher_status}
                              teacherFirstName={submission.teacher_first_name}
                              teacherLastName={submission.teacher_last_name}
                            />
                          </View>
                        )}
                        </View>
                        <View style={styles.rowAlignLeft}>
                          <Text style={styles.rowTeacher}>Estado: </Text>
                          <SubmissionStatusBadge value={submission.status.value} />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#455A64',
  },
  historyBtnText: { color: '#455A64', fontWeight: '600', fontSize: 13 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    maxWidth: 520,
    maxHeight: '80%',
    gap: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1 },
  empty: { color: '#999', fontStyle: 'italic', paddingVertical: 12 },
  row: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  rowEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 10,
  },
  rowAlignLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 5,
    gap: 10,
  },
  rowMain: { flex: 1 },
  rowFormName: { fontSize: 14, fontWeight: '700', color: '#222' },
  rowDate: { fontSize: 12, color: '#666', marginTop: 2 },
  rowTeacher: { fontSize: 12, color: '#666', marginTop: 2 },
  badges: { alignItems: 'flex-end', gap: 4 },
  badgesLeft: { alignItems: 'flex-start', gap: 4 },
});

export default FormsListScreen;
