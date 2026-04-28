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
import FormSubmission from '../../models/FormSubmission';
import FormItem from './components/FormItem';

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
                    <SubmissionStatusBadge value={submission.status.value} />
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
});

export default FormsListScreen;
