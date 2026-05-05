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
    <View style={styles.row}>
      <Text style={styles.rowTeacher}>
        Docente: {teacherFirstName} {teacherLastName}
      </Text>
      <View style={[badgeStyles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={[badgeStyles.text, { color: colors.text }]}>{TEACHER_STATUS_LABELS[status]}</Text>
      </View>
      <Text style={styles.rowTeacher}>
          |   
      </Text>
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
  const [loading, setLoading] = useState(true);
  const [historyForm, setHistoryForm] = useState<Form | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<FormSubmission[]>([]);

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

  const openHistory = async (form: Form) => {
    setHistoryForm(form);
    setHistory([]);
    setHistoryLoading(true);
    try {
      const data = await formsRepository.fetchMyFormSubmissions(form.form_id);
      setHistory(data);
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
                onShowHistory={() => openHistory(item)}
              />
            );
          })
        }
      />

      <Modal
        visible={!!historyForm}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryForm(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
                Historial — {historyForm?.form_name}
              </Text>
              <TouchableOpacity onPress={() => setHistoryForm(null)} hitSlop={8}>
                <MaterialIcon name="close" fontSize={22} color="#333" />
              </TouchableOpacity>
            </View>
            {historyLoading ? (
              <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : history.length === 0 ? (
              <Text style={styles.empty}>Aún no enviaste respuestas para este formulario.</Text>
            ) : (
              <ScrollView>
                {history.map(submission => (
                  <View key={submission.submission_id} style={styles.row}>
                    <View style={styles.rowMain}>
                      <Text style={styles.rowDate}>{formatDate(submission.submitted_at)}</Text>
                    </View>
                    <View style={styles.badges}>
                      {historyForm?.requires_teacher_validation && (
                        <TeacherStatusBadge
                          status={submission.teacher_status}
                          teacherFirstName={submission.teacher_first_name}
                          teacherLastName={submission.teacher_last_name}
                        />
                      )}
                    </View>
                    <View style={styles.badges}>
                      <SubmissionStatusBadge value={submission.status.value} />
                    </View>
                  </View>
                ))}
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 18,
    maxHeight: '70%',
    gap: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1 },
  empty: { color: '#999', fontStyle: 'italic', paddingVertical: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  rowMain: { flex: 1 },
  rowDate: { fontSize: 14, color: '#333' },
  rowTeacher: { fontSize: 12, color: '#666', marginTop: 2 },
  badges: { alignItems: 'flex-end', gap: 4 },
});

export default FormsListScreen;
