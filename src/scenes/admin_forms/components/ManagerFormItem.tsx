import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcon from '../../../components/materialIcon';
import { lightModeColors } from '../../../styles/colorPalette';
import Form from '../../../models/Form';
import FormSubmission from '../../../models/FormSubmission';

interface ManagerFormItemProps {
  form: Form;
  color: string;
  isExpanded: boolean;
  submissions: FormSubmission[];
  submissionsLoading: boolean;
  hasSubmissionsCache: boolean;
  isDigital: boolean;
  isResetting: boolean;
  isDeleting: boolean;
  isExporting: boolean;
  downloadingSubmissionId: number | null;
  onToggle: () => void;
  onRequireAgain: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onOpenAnswers: (submission: FormSubmission) => void;
  onDownloadAdjunto: (submission: FormSubmission) => void;
  onDeleteSubmission: (submission: FormSubmission) => void;
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
  isResetting,
  isDeleting,
  isExporting,
  downloadingSubmissionId,
  onToggle,
  onRequireAgain,
  onEdit,
  onDelete,
  onExport,
  onOpenAnswers,
  onDownloadAdjunto,
  onDeleteSubmission,
  daysSince,
}) => {
  const isLoadingSubmissions = submissionsLoading && !hasSubmissionsCache;

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
              onRequireAgain();
            }}
            disabled={isResetting}
            hitSlop={8}
          >
            {isResetting ? (
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
                ))
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    gap: 10,
  },
  subInfo: { flex: 1, gap: 3 },
  subName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  subPadron: { fontSize: 12, color: '#64748b' },
  subDate: { fontSize: 12, color: '#94a3b8' },
  subActions: { flexDirection: 'row', gap: 14 },
});

export default ManagerFormItem;
