import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcon from '../../../components/materialIcon';
import SubmissionStatusBadge from '../../../components/SubmissionStatusBadge';
import { lightModeColors } from '../../../styles/colorPalette';
import Form from '../../../models/Form';
import FormSubmission, { FormSubmissionStatusValue, TeacherValidationStatusValue } from '../../../models/FormSubmission';

interface ManagerFormItemProps {
  form: Form;
  color: string;
  isExpanded: boolean;
  submissions: FormSubmission[];
  submissionsLoading: boolean;
  hasSubmissionsCache: boolean;
  isDigital: boolean;
  isRefreshing: boolean;
  isDeleting: boolean;
  isExporting: boolean;
  downloadingSubmissionId: number | null;
  onToggle: () => void;
  onRefresh: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onOpenAnswers: (submission: FormSubmission) => void;
  onDownloadAdjunto: (submission: FormSubmission) => void;
  onDeleteSubmission: (submission: FormSubmission) => void;
  onChangeSubmissionStatus: (submission: FormSubmission, status: FormSubmissionStatusValue) => void;
  updatingStatusSubmissionId: number | null;
  daysSince: (dateStr: string) => string;
}

const TEACHER_STATUS_LABELS: Record<TeacherValidationStatusValue, string> = {
  pending: 'Pendiente docente',
  approved: 'Aprobado por docente',
  denied: 'Rechazado por docente',
};

const TEACHER_STATUS_COLORS: Record<TeacherValidationStatusValue, string> = {
  pending: '#EF6C00',
  approved: '#1B5E20',
  denied: '#B71C1C',
};

const TEACHER_STATUS_BG: Record<TeacherValidationStatusValue, string> = {
  pending: '#FFF3E0',
  approved: '#E8F5E9',
  denied: '#FFEBEE',
};

const STATUS_LABELS: Record<FormSubmissionStatusValue, string> = {
  sent: 'Enviado',
  pending_approval: 'Pendiente',
  approved: 'Aprobado',
  denied: 'Rechazado',
};

const ManagerFormItem: React.FC<ManagerFormItemProps> = ({
  form,
  color,
  isExpanded,
  submissions,
  submissionsLoading,
  hasSubmissionsCache,
  isDigital,
  isRefreshing,
  isDeleting,
  isExporting,
  downloadingSubmissionId,
  onToggle,
  onRefresh,
  onEdit,
  onDelete,
  onExport,
  onOpenAnswers,
  onDownloadAdjunto,
  onDeleteSubmission,
  onChangeSubmissionStatus,
  updatingStatusSubmissionId,
  daysSince,
}) => {
  const isLoadingSubmissions = submissionsLoading && !hasSubmissionsCache;
  const [showStatusActions, setShowStatusActions] = useState<Record<number, boolean>>({});
  const [teacherModalSub, setTeacherModalSub] = useState<FormSubmission | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{
    submission: FormSubmission;
    newStatus: FormSubmissionStatusValue;
  } | null>(null);

  const toggleStatusActions = (id: number) => {
    setShowStatusActions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const pendingCount = submissions.filter(
    s => s.status?.value === 'sent' || s.status?.value === 'pending_approval',
  ).length;

  const handleStatusPress = (sub: FormSubmission, newStatus: FormSubmissionStatusValue) => {
    setShowStatusActions(prev => ({ ...prev, [sub.submission_id]: false }));
    setConfirmStatus({ submission: sub, newStatus });
  };

  const confirmStatusChange = () => {
    if (!confirmStatus) return;
    onChangeSubmissionStatus(confirmStatus.submission, confirmStatus.newStatus);
    setConfirmStatus(null);
  };

  const canApprove = (sub: FormSubmission): boolean => {
    if (!form.requires_teacher_validation) return true;
    return sub.teacher_status === 'approved';
  };

  return (
    <View style={styles.formCard}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8} style={styles.formHeader}>
        <View style={styles.formHeaderText}>
          <Text style={styles.formName}>{form.form_name}</Text>
          <View style={styles.formMetaRow}>
            <View style={[styles.formTypeBadge, { borderColor: color }]}>
              <Text style={[styles.formTypeText, { color }]}>{form.form_type.value}</Text>
            </View>
            {form.requires_teacher_validation && (
              <View style={styles.teacherValidationBadge}>
                <MaterialIcon name="account-check" fontSize={11} color="#1565C0" />
                <Text style={styles.teacherValidationText}>Val. docente</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.formHeaderActions}>
          {pendingCount > 0 && (
            <View style={[styles.submissionCountBadge, { backgroundColor: color + '18', borderColor: color + '55' }]}>
              <Text style={[styles.submissionCountText, { color }]}>
                {pendingCount}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={event => { event.stopPropagation(); onRefresh(); }}
            disabled={isRefreshing}
            hitSlop={8}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#EF6C00" />
            ) : (
              <MaterialIcon name="refresh" fontSize={20} color="#EF6C00" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={event => { event.stopPropagation(); onEdit(); }}
            hitSlop={8}
          >
            <MaterialIcon name="pencil" fontSize={20} color={lightModeColors.institutional} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={event => { event.stopPropagation(); onDelete(); }}
            disabled={isDeleting}
            hitSlop={8}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#D32F2F" />
            ) : (
              <MaterialIcon name="trash-can-outline" fontSize={20} color="#D32F2F" />
            )}
          </TouchableOpacity>
          <MaterialIcon name={isExpanded ? 'chevron-up' : 'chevron-down'} fontSize={20} color="#666" />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.submissionsSection}>
          {isLoadingSubmissions ? (
            <ActivityIndicator style={{ marginVertical: 12 }} />
          ) : (
            <>
              <View style={styles.submissionsHeader}>
                <Text style={styles.submissionsCount}>
                  {submissions.length} {submissions.length === 1 ? 'respuesta' : 'respuestas'}
                </Text>
                {isDigital && (
                  <TouchableOpacity
                    onPress={onExport}
                    disabled={submissions.length === 0 || isExporting}
                  >
                    {isExporting ? (
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
                submissions.map(sub => {
                  const isUpdatingStatus = updatingStatusSubmissionId === sub.submission_id;
                  const currentStatus = sub.status?.value;
                  const approveBlocked = currentStatus !== 'approved' &&
                    form.requires_teacher_validation &&
                    sub.teacher_status !== 'approved';

                  return (
                    <View key={sub.submission_id} style={styles.submissionRow}>
                      <View style={styles.subTopRow}>
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
                          {form.requires_teacher_validation && (
                            <TouchableOpacity onPress={() => setTeacherModalSub(sub)} hitSlop={8}>
                              <MaterialIcon
                                name="account-check"
                                fontSize={20}
                                color={sub.teacher_status === 'approved' ? '#1B5E20' :
                                  sub.teacher_status === 'denied' ? '#B71C1C' : '#EF6C00'}
                              />
                            </TouchableOpacity>
                          )}
                          {showStatusActions[sub.submission_id] ? (
                            <TouchableOpacity onPress={() => toggleStatusActions(sub.submission_id)} hitSlop={8}>
                              <MaterialIcon name="dots-horizontal" fontSize={20} color="#555" />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity onPress={() => toggleStatusActions(sub.submission_id)} hitSlop={8}>
                              <MaterialIcon name="check-circle-outline" fontSize={20} color="#1B5E20" />
                            </TouchableOpacity>
                          )}
                          {isDigital ? (
                            <TouchableOpacity onPress={() => onOpenAnswers(sub)}>
                              <MaterialIcon name="eye" fontSize={20} color="#1976D2" />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              onPress={() => onDownloadAdjunto(sub)}
                              disabled={downloadingSubmissionId === sub.submission_id}
                            >
                              {downloadingSubmissionId === sub.submission_id ? (
                                <ActivityIndicator size="small" color="#1976D2" />
                              ) : (
                                <MaterialIcon name="download" fontSize={20} color="#1976D2" />
                              )}
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={() => onDeleteSubmission(sub)}>
                            <MaterialIcon name="trash-can" fontSize={20} color="#D32F2F" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.statusRow}>
                        {currentStatus ? <SubmissionStatusBadge value={currentStatus} /> : null}
                        <View style={styles.statusActions}>
                          {isUpdatingStatus ? (
                            <ActivityIndicator size="small" color="#555" />
                          ) : (
                            <>
                              {showStatusActions[sub.submission_id] && (
                                <>
                                  <TouchableOpacity
                                    style={[
                                      styles.statusBtn,
                                      styles.approveBtn,
                                      (currentStatus === 'approved' || approveBlocked) && styles.statusBtnActive,
                                    ]}
                                    onPress={() => handleStatusPress(sub, 'approved')}
                                    disabled={currentStatus === 'approved' || approveBlocked}
                                    hitSlop={4}
                                  >
                                    <MaterialIcon name="check" fontSize={14} color="#1B5E20" />
                                    <Text style={styles.approveText}>
                                      {approveBlocked ? 'Esperando docente' : 'Aprobar'}
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[
                                      styles.statusBtn,
                                      styles.pendingBtn,
                                      currentStatus === 'pending_approval' && styles.statusBtnActive,
                                    ]}
                                    onPress={() => handleStatusPress(sub, 'pending_approval')}
                                    disabled={currentStatus === 'pending_approval'}
                                    hitSlop={4}
                                  >
                                    <MaterialIcon name="clock-outline" fontSize={14} color="#EF6C00" />
                                    <Text style={styles.pendingText}>Pendiente</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[
                                      styles.statusBtn,
                                      styles.denyBtn,
                                      currentStatus === 'denied' && styles.statusBtnActive,
                                    ]}
                                    onPress={() => handleStatusPress(sub, 'denied')}
                                    disabled={currentStatus === 'denied'}
                                    hitSlop={4}
                                  >
                                    <MaterialIcon name="close" fontSize={14} color="#B71C1C" />
                                    <Text style={styles.denyText}>Rechazar</Text>
                                  </TouchableOpacity>
                                </>
                              )}
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </>
          )}
        </View>
      )}

      {/* Teacher validation info modal */}
      <Modal
        visible={!!teacherModalSub}
        transparent
        animationType="fade"
        onRequestClose={() => setTeacherModalSub(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Validación docente</Text>
              <TouchableOpacity onPress={() => setTeacherModalSub(null)}>
                <MaterialIcon name="close" fontSize={22} color="#333" />
              </TouchableOpacity>
            </View>
            {teacherModalSub && (
              <>
                <View style={styles.infoRow}>
                  <MaterialIcon name="account-check" fontSize={16} color="#1565C0" />
                  <Text style={styles.infoLabel}>Estado requerido:</Text>
                  <Text style={styles.infoValue}>Sí — este formulario requiere aval docente</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcon name="account" fontSize={16} color="#555" />
                  <Text style={styles.infoLabel}>Docente requerido:</Text>
                  <Text style={styles.infoValue}>
                    {teacherModalSub.teacher_id
                      ? `${teacherModalSub.teacher_first_name} ${teacherModalSub.teacher_last_name}`
                      : '—'}
                  </Text>
                </View>
                {teacherModalSub.teacher_status && (
                  <View style={[
                    styles.teacherStatusChip,
                    { backgroundColor: TEACHER_STATUS_BG[teacherModalSub.teacher_status] },
                  ]}>
                    <Text style={[
                      styles.teacherStatusChipText,
                      { color: TEACHER_STATUS_COLORS[teacherModalSub.teacher_status] },
                    ]}>
                      {TEACHER_STATUS_LABELS[teacherModalSub.teacher_status]}
                    </Text>
                  </View>
                )}
                {teacherModalSub.teacher_comment ? (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentLabel}>Comentario del docente:</Text>
                    <Text style={styles.commentText}>{teacherModalSub.teacher_comment}</Text>
                  </View>
                ) : null}
                {teacherModalSub.teacher_status !== 'approved' && (
                  <View style={styles.warningBox}>
                    <MaterialIcon name="alert" fontSize={16} color="#E65100" />
                    <Text style={styles.warningText}>
                      El formulario no puede ser aprobado por el administrador hasta que el docente lo avale.
                    </Text>
                  </View>
                )}
              </>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setTeacherModalSub(null)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Status change confirmation dialog */}
      <Modal
        visible={!!confirmStatus}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmStatus(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar cambio de estado</Text>
              <TouchableOpacity onPress={() => setConfirmStatus(null)}>
                <MaterialIcon name="close" fontSize={22} color="#333" />
              </TouchableOpacity>
            </View>
            {confirmStatus && (
              <>
                <Text style={styles.confirmMessage}>
                  Vas a cambiar el estado de la respuesta de{' '}
                  <Text style={{ fontWeight: '700' }}>
                    {confirmStatus.submission.student_first_name} {confirmStatus.submission.student_last_name}
                  </Text>{' '}
                  a{' '}
                  <Text style={{ fontWeight: '700' }}>
                    {STATUS_LABELS[confirmStatus.newStatus]}
                  </Text>
                  .
                </Text>
                <View style={styles.confirmButtons}>
                  <TouchableOpacity
                    style={[styles.confirmBtn, styles.cancelBtn]}
                    onPress={() => setConfirmStatus(null)}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmBtn, styles.confirmActionBtn]}
                    onPress={confirmStatusChange}
                  >
                    <Text style={styles.confirmActionText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 10,
    backgroundColor: '#f8fafc',
  },
  formHeaderText: { flex: 1, gap: 6 },
  formMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  formHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  formName: { fontSize: 15, fontWeight: '700', color: '#1f2933' },
  formTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#ffffff',
  },
  formTypeText: { fontSize: 12, fontWeight: '700' },
  teacherValidationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1565C0',
    backgroundColor: '#E3F2FD',
  },
  teacherValidationText: { fontSize: 11, fontWeight: '700', color: '#1565C0' },
  submissionCountBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submissionCountText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  submissionsSection: {
    borderTopWidth: 1,
    borderTopColor: '#eef2f7',
    padding: 14,
    gap: 10,
    backgroundColor: 'white',
  },
  submissionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submissionsCount: { fontSize: 13, fontWeight: '700', color: '#475569' },
  emptyText: { color: '#94a3b8', fontSize: 13, fontStyle: 'italic' },
  submissionRow: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    gap: 10,
  },
  subTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subInfo: { flex: 1, gap: 3 },
  subName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  subPadron: { fontSize: 12, color: '#64748b' },
  subDate: { fontSize: 12, color: '#94a3b8' },
  subActions: { flexDirection: 'row', gap: 14 },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusActions: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBtnActive: { opacity: 0.45 },
  approveBtn: { backgroundColor: '#E8F5E9', borderColor: '#1B5E20' },
  approveText: { color: '#1B5E20', fontSize: 11, fontWeight: '700' },
  pendingBtn: { backgroundColor: '#FFF3E0', borderColor: '#EF6C00' },
  pendingText: { color: '#EF6C00', fontSize: 11, fontWeight: '700' },
  denyBtn: { backgroundColor: '#FFEBEE', borderColor: '#B71C1C' },
  denyText: { color: '#B71C1C', fontSize: 11, fontWeight: '700' },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' },
  infoLabel: { fontSize: 13, fontWeight: '600', color: '#555' },
  infoValue: { fontSize: 13, color: '#222', flex: 1 },
  teacherStatusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  teacherStatusChipText: { fontSize: 13, fontWeight: '700' },
  commentBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  commentLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  commentText: { fontSize: 14, color: '#333' },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 10,
  },
  warningText: { flex: 1, fontSize: 13, color: '#E65100', fontWeight: '500' },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: lightModeColors.institutional,
  },
  closeBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  confirmMessage: { fontSize: 14, color: '#333', lineHeight: 20 },
  confirmButtons: { flexDirection: 'row', gap: 10 },
  confirmBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd' },
  cancelBtnText: { color: '#555', fontWeight: '600', fontSize: 14 },
  confirmActionBtn: { backgroundColor: lightModeColors.institutional },
  confirmActionText: { color: 'white', fontWeight: '700', fontSize: 14 },
});

export default ManagerFormItem;
