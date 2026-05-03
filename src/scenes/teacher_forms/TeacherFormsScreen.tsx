import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Platform,
  TextInput,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import { formsRepository } from '../../repositories';
import FormSubmission, { TeacherValidationStatusValue } from '../../models/FormSubmission';
import { lightModeColors } from '../../styles/colorPalette';

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

const STATUS_LABELS: Record<NonNullable<TeacherValidationStatusValue>, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  denied: 'Rechazado',
};

const STATUS_COLORS: Record<NonNullable<TeacherValidationStatusValue>, { bg: string; border: string; text: string }> = {
  pending:  { bg: '#FFF8E1', border: '#F9A825', text: '#E65100' },
  approved: { bg: '#E8F5E9', border: '#2E7D32', text: '#1B5E20' },
  denied:   { bg: '#FFEBEE', border: '#C62828', text: '#B71C1C' },
};

// ── Teacher-status badge ──────────────────────────────────────────────────────

const TeacherStatusBadge: React.FC<{ status: TeacherValidationStatusValue | null }> = ({ status }) => {
  if (!status) return null;
  const colors = STATUS_COLORS[status];
  return (
    <View style={[badge.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[badge.text, { color: colors.text }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
};

const badge = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '700' },
});

// ── Submission card ───────────────────────────────────────────────────────────

interface SubmissionCardProps {
  submission: FormSubmission;
  onViewAnswers: () => void;
  onValidate: () => void;
  onOpenDocument: () => void;
  isDocument: boolean;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({
  submission,
  onViewAnswers,
  onValidate,
  onOpenDocument,
  isDocument,
}) => {
  const date = new Date(submission.submitted_at);
  const dateStr = Number.isNaN(date.getTime()) ? submission.submitted_at : date.toLocaleDateString('es-AR');

  return (
    <View style={card.container}>
      <View style={card.row}>
        <View style={{ flex: 1 }}>
          <Text style={card.formName} numberOfLines={1}>{submission.form_name}</Text>
          <Text style={card.studentName}>
            {submission.student_first_name} {submission.student_last_name}
            {submission.student_padron ? ` · ${submission.student_padron}` : ''}
          </Text>
          <Text style={card.date}>{dateStr}</Text>
        </View>
        <TeacherStatusBadge status={submission.teacher_status} />
      </View>

      {!!submission.teacher_comment && submission.teacher_status !== 'pending' && (
        <View style={card.commentBox}>
          <MaterialIcon name="comment-text" fontSize={14} color="#888" />
          <Text style={card.commentText} numberOfLines={2}>{submission.teacher_comment}</Text>
        </View>
      )}

      <View style={card.actions}>
        {isDocument ? (
          <TouchableOpacity style={card.actionBtn} onPress={onOpenDocument}>
            <MaterialIcon name="file-eye" fontSize={16} color="#1976D2" />
            <Text style={card.actionBtnText}>Ver documento</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={card.actionBtn} onPress={onViewAnswers}>
            <MaterialIcon name="eye" fontSize={16} color="#1976D2" />
            <Text style={card.actionBtnText}>Ver respuestas</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[card.actionBtn, card.validateBtn]}
          onPress={onValidate}
          disabled={submission.teacher_status !== 'pending' && submission.teacher_status !== null}
        >
          <MaterialIcon name="check-decagram" fontSize={16} color={submission.teacher_status === 'pending' || submission.teacher_status === null ? '#388E3C' : '#aaa'} />
          <Text style={[card.actionBtnText, { color: submission.teacher_status === 'pending' || submission.teacher_status === null ? '#388E3C' : '#aaa' }]}>
            {submission.teacher_status === 'approved' ? 'Ya aprobado' :
             submission.teacher_status === 'denied' ? 'Ya rechazado' : 'Validar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const card = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  formName: { fontSize: 15, fontWeight: '700', color: lightModeColors.institutional, marginBottom: 2 },
  studentName: { fontSize: 14, color: '#333', fontWeight: '500' },
  date: { fontSize: 12, color: '#aaa', marginTop: 2 },
  commentBox: { flexDirection: 'row', gap: 6, backgroundColor: '#f9f9f9', borderRadius: 6, padding: 8, alignItems: 'flex-start' },
  commentText: { flex: 1, fontSize: 13, color: '#555', fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f0f4ff', borderRadius: 7, paddingVertical: 7, paddingHorizontal: 10 },
  validateBtn: { backgroundColor: '#f0faf1' },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#1976D2' },
});

// ── Main screen ───────────────────────────────────────────────────────────────

const TeacherFormsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Answers modal
  const [answersModal, setAnswersModal] = useState<FormSubmission | null>(null);

  // Validate modal
  const [validateModal, setValidateModal] = useState<FormSubmission | null>(null);
  const [validateStatus, setValidateStatus] = useState<'approved' | 'denied'>('approved');
  const [validateComment, setValidateComment] = useState('');
  const [submittingValidation, setSubmittingValidation] = useState(false);

  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await formsRepository.fetchMyTeacherFormSubmissions();
      setSubmissions(data);
    } catch {
      showMessage('Error', 'No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', () => load(true));
    return unsub;
  }, [navigation, load]);

  const openValidateModal = (sub: FormSubmission) => {
    setValidateModal(sub);
    setValidateStatus(sub.teacher_status === 'denied' ? 'denied' : 'approved');
    setValidateComment(sub.teacher_comment ?? '');
  };

  const submitValidation = async () => {
    if (!validateModal || submittingValidation) return;
    setSubmittingValidation(true);
    try {
      const updated = await formsRepository.updateTeacherSubmissionStatus(
        validateModal.submission_id,
        validateStatus,
        validateComment.trim(),
      );
      setSubmissions(prev => prev.map(s => s.submission_id === updated.submission_id ? updated : s));
      setValidateModal(null);
    } catch {
      showMessage('Error', 'No se pudo guardar la validación. Intentá nuevamente.');
    } finally {
      setSubmittingValidation(false);
    }
  };

  const openDocumentUrl = (sub: FormSubmission) => {
    // For document submissions the file URL is stored in the first answer_value
    const url = sub.answers?.[0]?.answer_value;
    if (!url) {
      showMessage('Sin documento', 'No hay documento disponible para esta solicitud.');
      return;
    }
    Linking.openURL(url).catch(() => showMessage('Error', 'No se pudo abrir el documento.'));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const pending = submissions.filter(s => s.teacher_status === 'pending' || s.teacher_status === null);
  const resolved = submissions.filter(s => s.teacher_status === 'approved' || s.teacher_status === 'denied');

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {refreshing && (
          <View style={styles.refreshingRow}>
            <ActivityIndicator size="small" color={lightModeColors.institutional} />
            <Text style={styles.refreshingText}>Actualizando...</Text>
          </View>
        )}

        {submissions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcon name="clipboard-check-outline" fontSize={56} color="#ccc" />
            <Text style={styles.emptyTitle}>Sin solicitudes pendientes</Text>
            <Text style={styles.emptySubtitle}>Cuando un alumno te designe como validador, las solicitudes aparecerán aquí.</Text>
          </View>
        ) : null}

        {pending.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Pendientes de validación ({pending.length})</Text>
            {pending.map(sub => (
              <SubmissionCard
                key={sub.submission_id}
                submission={sub}
                isDocument={sub.answers.length === 0 || (sub.answers.length === 1 && (sub.answers[0].answer_value ?? '').startsWith('http'))}
                onViewAnswers={() => setAnswersModal(sub)}
                onValidate={() => openValidateModal(sub)}
                onOpenDocument={() => openDocumentUrl(sub)}
              />
            ))}
          </>
        )}

        {resolved.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Historial ({resolved.length})</Text>
            {resolved.map(sub => (
              <SubmissionCard
                key={sub.submission_id}
                submission={sub}
                isDocument={sub.answers.length === 0 || (sub.answers.length === 1 && (sub.answers[0].answer_value ?? '').startsWith('http'))}
                onViewAnswers={() => setAnswersModal(sub)}
                onValidate={() => openValidateModal(sub)}
                onOpenDocument={() => openDocumentUrl(sub)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Answers modal */}
      <Modal
        visible={!!answersModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAnswersModal(null)}
      >
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
            <Text style={styles.modalFormName}>{answersModal?.form_name}</Text>
            <ScrollView>
              {(answersModal?.answers ?? []).map((ans, i) => (
                <View key={i} style={styles.answerRow}>
                  <Text style={styles.answerLabel}>{ans.field_label}</Text>
                  <Text style={styles.answerValue}>{ans.answer_value ?? '—'}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.validateFromAnswersBtn}
              onPress={() => {
                const sub = answersModal;
                setAnswersModal(null);
                if (sub) openValidateModal(sub);
              }}
            >
              <MaterialIcon name="check-decagram" fontSize={18} color="white" />
              <Text style={styles.validateFromAnswersBtnText}>Ir a validar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Validate modal */}
      <Modal
        visible={!!validateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setValidateModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Validar solicitud</Text>
              <TouchableOpacity onPress={() => !submittingValidation && setValidateModal(null)}>
                <MaterialIcon name="close" fontSize={22} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalFormName}>{validateModal?.form_name}</Text>
            <Text style={styles.validateStudentName}>
              {validateModal?.student_first_name} {validateModal?.student_last_name}
              {validateModal?.student_padron ? ` · ${validateModal.student_padron}` : ''}
            </Text>

            <Text style={styles.fieldLabel}>Decisión</Text>
            <View style={styles.statusToggleRow}>
              <TouchableOpacity
                style={[styles.statusToggleBtn, validateStatus === 'approved' && styles.statusToggleBtnActiveApprove]}
                onPress={() => setValidateStatus('approved')}
              >
                <MaterialIcon name="check-circle" fontSize={18} color={validateStatus === 'approved' ? 'white' : '#388E3C'} />
                <Text style={[styles.statusToggleBtnText, validateStatus === 'approved' && styles.statusToggleBtnTextActive]}>Aprobar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusToggleBtn, validateStatus === 'denied' && styles.statusToggleBtnActiveDeny]}
                onPress={() => setValidateStatus('denied')}
              >
                <MaterialIcon name="close-circle" fontSize={18} color={validateStatus === 'denied' ? 'white' : '#C62828'} />
                <Text style={[styles.statusToggleBtnText, validateStatus === 'denied' && styles.statusToggleBtnTextActive]}>Rechazar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Comentario (opcional)</Text>
            <TextInput
              style={styles.commentInput}
              value={validateComment}
              onChangeText={setValidateComment}
              placeholder="Escribí un comentario para el alumno..."
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitValidationBtn, validateStatus === 'denied' && styles.submitValidationBtnDeny, submittingValidation && styles.submitValidationBtnDisabled]}
              onPress={submitValidation}
              disabled={submittingValidation}
            >
              {submittingValidation ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <MaterialIcon name={validateStatus === 'approved' ? 'check-circle' : 'close-circle'} fontSize={18} color="white" />
                  <Text style={styles.submitValidationBtnText}>
                    {validateStatus === 'approved' ? 'Confirmar aprobación' : 'Confirmar rechazo'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16, flexGrow: 1 },
  refreshingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  refreshingText: { fontSize: 13, color: '#888' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#555' },
  emptySubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  // modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '80%', gap: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  modalFormName: { fontSize: 14, color: lightModeColors.institutional, fontWeight: '600' },
  answerRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 3 },
  answerLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  answerValue: { fontSize: 15, color: '#333' },
  validateFromAnswersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightModeColors.institutional,
    borderRadius: 10,
    paddingVertical: 13,
  },
  validateFromAnswersBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  // validate modal
  validateStudentName: { fontSize: 14, color: '#555' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#666', textTransform: 'uppercase' },
  statusToggleRow: { flexDirection: 'row', gap: 10 },
  statusToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 9,
    paddingVertical: 11,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  statusToggleBtnActiveApprove: { backgroundColor: '#388E3C', borderColor: '#388E3C' },
  statusToggleBtnActiveDeny: { backgroundColor: '#C62828', borderColor: '#C62828' },
  statusToggleBtnText: { fontSize: 14, fontWeight: '700', color: '#333' },
  statusToggleBtnTextActive: { color: 'white' },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
    minHeight: 72,
  },
  submitValidationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#388E3C',
    borderRadius: 10,
    paddingVertical: 14,
  },
  submitValidationBtnDeny: { backgroundColor: '#C62828' },
  submitValidationBtnDisabled: { opacity: 0.6 },
  submitValidationBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
});

export default TeacherFormsScreen;
