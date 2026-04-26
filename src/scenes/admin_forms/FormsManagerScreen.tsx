import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Platform,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import * as XLSX from 'xlsx';
import { MaterialIcon } from '../../components';
import { formsRepository } from '../../repositories';
import SessionManager from '../../managers/sessionManager';
import Form from '../../models/Form';
import FormSubmission from '../../models/FormSubmission';
import FormDetail from '../../models/FormDetail';
import { FormAnswer } from '../../models/FormSubmission';
import { lightModeColors } from '../../styles/colorPalette';

const PROCEDURE_CONFIG: Record<string, { icon: string; color: string }> = {
  Administrativo: { icon: 'home-city', color: '#F9A825' },
  Exámenes: { icon: 'file-document', color: '#388E3C' },
  Carrera: { icon: 'school', color: '#D32F2F' },
  Cursada: { icon: 'calendar-month', color: '#1976D2' },
};

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

function askConfirmation(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise(resolve => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Confirmar', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

const FormsManagerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProcedureId, setExpandedProcedureId] = useState<number | null>(null);
  const [expandedFormId, setExpandedFormId] = useState<number | null>(null);
  const [submissionsCache, setSubmissionsCache] = useState<Record<number, FormSubmission[]>>({});
  const [formDetailsCache, setFormDetailsCache] = useState<Record<number, FormDetail>>({});
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [deletingFormId, setDeletingFormId] = useState<number | null>(null);
  const [resettingFormId, setResettingFormId] = useState<number | null>(null);
  const [exportingFormId, setExportingFormId] = useState<number | null>(null);
  const [downloadingSubmissionId, setDownloadingSubmissionId] = useState<number | null>(null);
  const [answersModal, setAnswersModal] = useState<{ submission: FormSubmission; formId: number } | null>(null);

  const loadForms = useCallback(async () => {
    try {
      const data = await formsRepository.fetchForms();
      setForms(data);
    } catch {
      showMessage('Error', 'No se pudieron cargar los formularios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
    const unsub = navigation.addListener('focus', loadForms);
    return unsub;
  }, [navigation, loadForms]);

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

  const sections = useMemo(() => {
    const configuredOrder = Object.keys(PROCEDURE_CONFIG);
    const map = new Map<number, { procedure: Form['form_procedure']; forms: Form[] }>();
    forms.forEach(form => {
      const proc = form.form_procedure;
      if (!map.has(proc.id)) map.set(proc.id, { procedure: proc, forms: [] });
      map.get(proc.id)!.forms.push(form);
    });
    return Array.from(map.values()).sort((a, b) => {
      const aIndex = configuredOrder.indexOf(a.procedure.value);
      const bIndex = configuredOrder.indexOf(b.procedure.value);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      return a.procedure.value.localeCompare(b.procedure.value);
    });
  }, [forms]);

  const toggleForm = async (form: Form) => {
    if (expandedFormId === form.form_id) {
      setExpandedFormId(null);
      return;
    }
    setExpandedFormId(form.form_id);
    if (submissionsCache[form.form_id]) return;
    setSubmissionsLoading(true);
    try {
      const [subs, detail] = await Promise.all([
        formsRepository.fetchFormSubmissions(form.form_id),
        formDetailsCache[form.form_id]
          ? Promise.resolve(formDetailsCache[form.form_id])
          : formsRepository.fetchFormDetail(form.form_id),
      ]);
      setSubmissionsCache(prev => ({ ...prev, [form.form_id]: subs }));
      setFormDetailsCache(prev => ({ ...prev, [form.form_id]: detail }));
    } catch {
      showMessage('Error', 'No se pudieron cargar las respuestas.');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const getModalAnswerValue = (answer: FormAnswer, formId: number): string => {
    const detail = formDetailsCache[formId];
    if (!detail || answer.answer_value == null || answer.answer_value === '') {
      return answer.answer_value ?? '—';
    }

    const field = detail.fields.find(f => f.form_field_id === answer.field_id);
    if (!field) return answer.answer_value;

    if (field.form_field_type.value === 'catalog' && field.catalog) {
      const item = field.catalog.items.find(
        catalogItem => String(catalogItem.catalog_item_id) === String(answer.answer_value),
      );
      if (item) {
        return item.catalog_item_value;
      }
    }

    return answer.answer_value;
  };

  const handleDeleteSubmission = (submission: FormSubmission, formId: number) => {
    askConfirmation(
      'Eliminar respuesta',
      `¿Estas seguro de eliminar la respuesta de ${submission.student_first_name} ${submission.student_last_name}?`,
    ).then(async confirmed => {
      if (!confirmed) return;

      try {
        await formsRepository.deleteSubmission(submission.submission_id);
        const [formsData, subs] = await Promise.all([
          formsRepository.fetchForms(),
          formsRepository.fetchFormSubmissions(formId),
        ]);
        setForms(formsData);
        setSubmissionsCache(prev => ({ ...prev, [formId]: subs }));
      } catch {
        showMessage('Error', 'No se pudo eliminar la respuesta.');
      }
    });
  };

  const handleDeleteForm = (form: Form) => {
    askConfirmation(
      'Eliminar formulario',
      `¿Estas seguro de eliminar el formulario "${form.form_name}"? Esta acción no se puede deshacer.`,
    ).then(async confirmed => {
      if (!confirmed) return;

      setDeletingFormId(form.form_id);
      try {
        await formsRepository.deleteForm(form.form_id);
        const formsData = await formsRepository.fetchForms();
        setForms(formsData);
        setSubmissionsCache(prev => {
          const next = { ...prev };
          delete next[form.form_id];
          return next;
        });
        if (expandedFormId === form.form_id) {
          setExpandedFormId(null);
        }
      } catch {
        showMessage('Error', 'No se pudo eliminar el formulario.');
      } finally {
        setDeletingFormId(null);
      }
    });
  };

  const handleRequireAgainResponse = (form: Form) => {
    askConfirmation(
      'Requerir respuesta nuevamente',
      `Se eliminarán las respuestas actuales de "${form.form_name}" para solicitar que vuelvan a completarlo. ¿Continuar?`,
    ).then(async confirmed => {
      if (!confirmed) return;

      setResettingFormId(form.form_id);
      try {
        await formsRepository.resetFormSubmissions(form.form_id);
        setSubmissionsCache(prev => ({ ...prev, [form.form_id]: [] }));
        showMessage('Éxito', 'Ahora el formulario requiere nuevamente respuestas.');
      } catch {
        showMessage('Error', 'No se pudo reiniciar las respuestas del formulario.');
      } finally {
        setResettingFormId(null);
      }
    });
  };

  const normalizeAnswerValue = (
    answerValue: string | null,
    field: FormDetail['fields'][number],
  ): string => {
    if (answerValue === null || answerValue === '') return '';

    const fieldType = field.form_field_type.value;

    if (fieldType === 'checkbox') {
      return String(answerValue).toLowerCase() === 'true' ? 'Si' : 'No';
    }

    if (fieldType === 'options' && field.options) {
      const option = field.options.find(opt => String(opt.form_option_id) === String(answerValue));
      return option?.form_option_label ?? String(answerValue);
    }

    if (fieldType === 'catalog' && field.catalog) {
      const item = field.catalog.items.find(item => String(item.catalog_item_id) === String(answerValue));
      return item?.catalog_item_label ?? String(answerValue);
    }

    return String(answerValue);
  };

  const handleExportExcel = async (form: Form, submissions: FormSubmission[]) => {
    if (submissions.length === 0 || exportingFormId === form.form_id) {
      return;
    }

    setExportingFormId(form.form_id);
    try {
      const detail = await formsRepository.fetchFormDetail(form.form_id);
      const fieldById = new Map(detail.fields.map(field => [field.form_field_id, field]));

      const rows = submissions.map(submission => {
        const row: Record<string, string | number> = {
          submitted_at: submission.submitted_at,
          user_id: submission.user_id,
          email: submission.email,
          first_name: submission.first_name,
          last_name: submission.last_name,
          role: submission.role,
        };

        detail.fields.forEach(field => {
          row[field.form_field_label] = '';
        });

        submission.answers.forEach(answer => {
          const field = fieldById.get(answer.field_id);
          if (!field) return;
          row[field.form_field_label] = normalizeAnswerValue(answer.answer_value, field);
        });

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Respuestas');

      const safeName = form.form_name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 50) || 'formulario';
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      const fileName = `${safeName}_respuestas_${timestamp}.xlsx`;

      if (Platform.OS === 'web') {
        const wbArray = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbArray], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const base64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
        const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        await RNFS.writeFile(path, base64, 'base64');
        await Share.share({
          title: 'Exportar respuestas',
          message: `Archivo exportado: ${fileName}`,
          url: `file://${path}`,
        });
      }
    } catch {
      showMessage('Error', 'No se pudo exportar el Excel.');
    } finally {
      setExportingFormId(null);
    }
  };

  const findAdjuntoUrl = (submission: FormSubmission, formId: number): string | null => {
    const detail = formDetailsCache[formId];
    if (!detail) return null;
    const adjuntoField = detail.fields.find(f => f.form_field_type.value === 'adjunto');
    if (!adjuntoField) return null;
    const answer = submission.answers.find(a => a.field_id === adjuntoField.form_field_id);
    return answer?.answer_value || null;
  };

  const handleDownloadAdjunto = async (submission: FormSubmission, formId: number) => {
    if (downloadingSubmissionId === submission.submission_id) return;
    const url = findAdjuntoUrl(submission, formId);
    if (!url) {
      showMessage('Sin archivo', 'Esta respuesta no tiene un archivo adjunto.');
      return;
    }

    setDownloadingSubmissionId(submission.submission_id);
    try {
      const token = SessionManager.getInstance()?.getAuthToken();
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const remoteName = url.split('/').filter(Boolean).pop() ?? `submission_${submission.submission_id}`;
      const fileName = `submission_${submission.submission_id}_${remoteName}`;

      if (Platform.OS === 'web') {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } else {
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = global.btoa(binary);
        const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        await RNFS.writeFile(path, base64, 'base64');
        await Share.share({
          title: 'Descargar adjunto',
          message: `Archivo descargado: ${fileName}`,
          url: `file://${path}`,
        });
      }
    } catch {
      showMessage('Error', 'No se pudo descargar el archivo adjunto.');
    } finally {
      setDownloadingSubmissionId(null);
    }
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
      <ScrollView contentContainerStyle={styles.list}>
        {sections.map(({ procedure, forms: sectionForms }) => {
          const config = PROCEDURE_CONFIG[procedure.value] ?? { icon: 'folder', color: '#757575' };
          const isProcExpanded = expandedProcedureId === procedure.id;

          return (
            <View key={procedure.id}>
              <TouchableOpacity
                style={[styles.procedureCard, { borderLeftColor: config.color }]}
                onPress={() => setExpandedProcedureId(isProcExpanded ? null : procedure.id)}
                activeOpacity={0.75}
              >
                <View style={styles.procedureCardLeft}>
                  <MaterialIcon name={config.icon} fontSize={26} color={config.color} />
                  <Text style={[styles.procedureTitle, { color: config.color }]}>
                    {procedure.value}
                  </Text>
                </View>
                <View style={styles.procedureCardRight}>
                  <View style={[styles.badge, { backgroundColor: config.color }]}>
                    <Text style={styles.badgeText}>{sectionForms.length}</Text>
                  </View>
                  <MaterialIcon
                    name={isProcExpanded ? 'chevron-up' : 'chevron-down'}
                    fontSize={20}
                    color="#666"
                  />
                </View>
              </TouchableOpacity>

              {isProcExpanded && (
                <View style={styles.formsContainer}>
                  {sectionForms.map(item => {
                    const isFormExpanded = expandedFormId === item.form_id;
                    const submissions = submissionsCache[item.form_id] ?? [];
                    const isDigital = item.form_type.value === 'Digital';

                    return (
                      <View
                        key={item.form_id}
                        style={[styles.formCard, { borderLeftColor: config.color }]}
                      >
                        <TouchableOpacity
                          onPress={() => toggleForm(item)}
                          activeOpacity={0.8}
                          style={styles.formHeader}
                        >
                          <View style={styles.formHeaderText}>
                            <Text style={styles.formName}>{item.form_name}</Text>
                            <Text style={[styles.formType, { color: config.color }]}>
                              {item.form_type.value}
                            </Text>
                          </View>
                          <View style={styles.formHeaderActions}>
                            <TouchableOpacity
                              onPress={(event) => {
                                event.stopPropagation();
                                handleRequireAgainResponse(item);
                              }}
                              disabled={resettingFormId === item.form_id}
                              hitSlop={8}
                            >
                              {resettingFormId === item.form_id ? (
                                <ActivityIndicator size="small" color="#EF6C00" />
                              ) : (
                                <MaterialIcon name="refresh" fontSize={20} color="#EF6C00" />
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={(event) => {
                                event.stopPropagation();
                                navigation.navigate('FormDesigner', { formId: item.form_id });
                              }}
                              hitSlop={8}
                            >
                              <MaterialIcon name="pencil" fontSize={20} color={lightModeColors.institutional} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={(event) => {
                                event.stopPropagation();
                                handleDeleteForm(item);
                              }}
                              disabled={deletingFormId === item.form_id}
                              hitSlop={8}
                            >
                              {deletingFormId === item.form_id ? (
                                <ActivityIndicator size="small" color="#D32F2F" />
                              ) : (
                                <MaterialIcon name="trash-can-outline" fontSize={20} color="#D32F2F" />
                              )}
                            </TouchableOpacity>
                            <MaterialIcon
                              name={isFormExpanded ? 'chevron-up' : 'chevron-down'}
                              fontSize={20}
                              color="#666"
                            />
                          </View>
                        </TouchableOpacity>

                        {isFormExpanded && (
                          <View style={styles.submissionsSection}>
                            {submissionsLoading && !submissionsCache[item.form_id] ? (
                              <ActivityIndicator style={{ marginVertical: 12 }} />
                            ) : (
                              <>
                                <View style={styles.submissionsHeader}>
                                  <Text style={styles.submissionsCount}>
                                    {submissions.length}{' '}
                                    {submissions.length === 1 ? 'respuesta' : 'respuestas'}
                                  </Text>
                                  {isDigital && (
                                    <TouchableOpacity
                                      onPress={() => handleExportExcel(item, submissions)}
                                      disabled={submissions.length === 0 || exportingFormId === item.form_id}
                                    >
                                      {exportingFormId === item.form_id ? (
                                        <ActivityIndicator size="small" color="#388E3C" />
                                      ) : (
                                        <MaterialIcon
                                          name="microsoft-excel"
                                          fontSize={22}
                                          color={submissions.length === 0 ? '#BDBDBD' : '#388E3C'}
                                        />
                                      )}
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
                                          <Text style={styles.subPadron}>
                                            Padrón: {sub.student_padron}
                                          </Text>
                                        )}
                                        <Text style={styles.subDate}>
                                          {daysSince(sub.submitted_at)}
                                        </Text>
                                      </View>
                                      <View style={styles.subActions}>
                                        {isDigital && (
                                          <TouchableOpacity
                                            onPress={() =>
                                              setAnswersModal({ submission: sub, formId: item.form_id })
                                            }
                                          >
                                            <MaterialIcon name="eye" fontSize={20} color="#1976D2" />
                                          </TouchableOpacity>
                                        )}
                                        {!isDigital && (
                                          <TouchableOpacity
                                            onPress={() => handleDownloadAdjunto(sub, item.form_id)}
                                            disabled={downloadingSubmissionId === sub.submission_id}
                                          >
                                            {downloadingSubmissionId === sub.submission_id ? (
                                              <ActivityIndicator size="small" color="#1976D2" />
                                            ) : (
                                              <MaterialIcon name="download" fontSize={20} color="#1976D2" />
                                            )}
                                          </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                          onPress={() =>
                                            handleDeleteSubmission(sub, item.form_id)
                                          }
                                        >
                                          <MaterialIcon
                                            name="trash-can"
                                            fontSize={20}
                                            color="#D32F2F"
                                          />
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
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

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
                {answersModal?.submission.student_first_name} {answersModal?.submission.student_last_name}
              </Text>
              <TouchableOpacity onPress={() => setAnswersModal(null)}>
                <MaterialIcon name="close" fontSize={22} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {(answersModal?.submission.answers ?? []).map((ans, i) => (
                <View key={i} style={styles.answerRow}>
                  <Text style={styles.answerLabel}>{ans.field_label}</Text>
                  <Text style={styles.answerValue}>
                    {answersModal ? getModalAnswerValue(ans, answersModal.formId) : '—'}
                  </Text>
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
    justifyContent: 'space-between',
    padding: 14,
    gap: 8,
  },
  formHeaderText: { flex: 1 },
  formHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  formName: { fontSize: 15, fontWeight: '700', color: '#222' },
  formType: { fontSize: 12, marginTop: 2, fontWeight: '600' },

  submissionsSection: { borderTopWidth: 1, borderTopColor: '#f0f0f0', padding: 14, gap: 8 },
  submissionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
