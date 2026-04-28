import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcon from '../../../components/materialIcon';
import SubmissionStatusBadge from '../../../components/SubmissionStatusBadge';
import { lightModeColors } from '../../../styles/colorPalette';
import Form from '../../../models/Form';
import FormSubmission, { FormSubmissionStatusValue } from '../../../models/FormSubmission';

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

  const toggleStatusActions = (id: number) => {
    setShowStatusActions(prev => ({ ...prev, [id]: !prev[id] }));
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
          </View>
        </View>
        <View style={styles.formHeaderActions}>
          <TouchableOpacity
            onPress={event => {
              event.stopPropagation();
              onRefresh();
            }}
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
            onPress={event => {
              event.stopPropagation();
              onEdit();
            }}
            hitSlop={8}
          >
            <MaterialIcon name="pencil" fontSize={20} color={lightModeColors.institutional} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={event => {
              event.stopPropagation();
              onDelete();
            }}
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
                          { showStatusActions[sub.submission_id] ?
                            (
                                <TouchableOpacity onPress={() => toggleStatusActions(sub.submission_id)} hitSlop={8}>
                                  <MaterialIcon name="dots-horizontal" fontSize={20} color="#555" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => toggleStatusActions(sub.submission_id)} hitSlop={8}>
                                    <MaterialIcon name="check-circle-outline" fontSize={20} color="#1B5E20" />
                                </TouchableOpacity>
                            )
                          }
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
                              {showStatusActions[sub.submission_id] ? (
                                <>
                                  <TouchableOpacity
                                    style={[
                                      styles.statusBtn,
                                      styles.approveBtn,
                                      currentStatus === 'approved' && styles.statusBtnActive,
                                    ]}
                                    onPress={() => {
                                      onChangeSubmissionStatus(sub, 'approved');
                                      toggleStatusActions(sub.submission_id);
                                    }}
                                    disabled={currentStatus === 'approved'}
                                    hitSlop={4}
                                  >
                                    <MaterialIcon name="check" fontSize={14} color="#1B5E20" />
                                    <Text style={styles.approveText}>Aprobar</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[
                                      styles.statusBtn,
                                      styles.pendingBtn,
                                      currentStatus === 'pending_approval' && styles.statusBtnActive,
                                    ]}
                                    onPress={() => {
                                      onChangeSubmissionStatus(sub, 'pending_approval');
                                      toggleStatusActions(sub.submission_id);
                                    }}
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
                                    onPress={() => {
                                      onChangeSubmissionStatus(sub, 'denied');
                                      toggleStatusActions(sub.submission_id);
                                    }}
                                    disabled={currentStatus === 'denied'}
                                    hitSlop={4}
                                  >
                                    <MaterialIcon name="close" fontSize={14} color="#B71C1C" />
                                    <Text style={styles.denyText}>Rechazar</Text>
                                  </TouchableOpacity>
                                </>
                              ) : (
                                <></>
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
  formMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
});

export default ManagerFormItem;
