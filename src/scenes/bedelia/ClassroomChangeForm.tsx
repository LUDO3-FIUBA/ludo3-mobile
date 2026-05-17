import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcon, RoundedButton } from '../../components';
import { bedeliaRepository } from '../../repositories';
import { BedeliaCommission } from '../../repositories/bedelia';

const ClassroomChangeForm: React.FC = () => {
  const [commissions, setCommissions] = useState<BedeliaCommission[]>([]);
  const [loadingCommissions, setLoadingCommissions] = useState(true);
  const [selectedCommission, setSelectedCommission] = useState<BedeliaCommission | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [message, setMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    bedeliaRepository
      .fetchCommissions()
      .then(setCommissions)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar las comisiones.'))
      .finally(() => setLoadingCommissions(false));
  }, []);

  const filteredCommissions = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return commissions;
    return commissions.filter(c =>
      c.subjectName.toLowerCase().includes(q) ||
      c.chiefTeacherName.toLowerCase().includes(q) ||
      String(c.siuId).includes(q),
    );
  }, [commissions, pickerQuery]);

  const handleSubmit = async () => {
    if (!selectedCommission) {
      Alert.alert('Error', 'Seleccioná una comisión.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Escribí el mensaje del cambio (ej: "Hoy 15:00 → Aula 200").');
      return;
    }
    setSaving(true);
    try {
      const result = await bedeliaRepository.announceClassroomChange({
        commissionId: selectedCommission.id,
        message: message.trim(),
        isUrgent,
        sendPush,
      });
      Alert.alert(
        'Anuncio enviado',
        `Se notificó a ${result.recipientCount} usuario${result.recipientCount === 1 ? '' : 's'}.`,
      );
      setMessage('');
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo enviar el anuncio. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingCommissions) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Notificá un cambio de aula a los alumnos y docentes de una comisión.
        </Text>

        <Text style={styles.label}>Comisión *</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setPickerOpen(true)}>
          <Text style={selectedCommission ? styles.pickerValue : styles.pickerPlaceholder}>
            {selectedCommission
              ? `${selectedCommission.subjectName} — ${selectedCommission.chiefTeacherName || 'Sin docente'}`
              : 'Seleccionar comisión...'}
          </Text>
          <MaterialIcon name="chevron-down" fontSize={20} color="#666" />
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 16 }]}>Mensaje *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Ej: Hoy 15:00 cambio de aula al 200."
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Marcar como urgente</Text>
          <Switch value={isUrgent} onValueChange={setIsUrgent} trackColor={{ true: '#3b82f6' }} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Enviar push</Text>
          <Switch value={sendPush} onValueChange={setSendPush} trackColor={{ true: '#3b82f6' }} />
        </View>

        <RoundedButton
          text={saving ? 'Enviando...' : 'Enviar anuncio'}
          enabled={!saving}
          onPress={handleSubmit}
          style={{}}
        />
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Elegí una comisión</Text>
              <TouchableOpacity onPress={() => setPickerOpen(false)}>
                <MaterialIcon name="close" fontSize={22} color="#333" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              value={pickerQuery}
              onChangeText={setPickerQuery}
              placeholder="Buscar por materia, docente o SIU id..."
              placeholderTextColor="#aaa"
            />
            <FlatList
              data={filteredCommissions}
              keyExtractor={item => String(item.id)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.commissionRow}
                  onPress={() => {
                    setSelectedCommission(item);
                    setPickerOpen(false);
                    setPickerQuery('');
                  }}
                >
                  <Text style={styles.commissionName}>{item.subjectName}</Text>
                  <Text style={styles.commissionMeta}>
                    {item.chiefTeacherName || 'Sin docente'} · SIU {item.siuId}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hay comisiones que coincidan.</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  content: { padding: 20, paddingBottom: 40, gap: 4 },
  description: { fontSize: 14, color: '#555', marginBottom: 16, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerPlaceholder: { color: '#999', fontSize: 15 },
  pickerValue: { color: '#111', fontSize: 15, flex: 1, marginRight: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: { minHeight: 100 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 12,
  },
  toggleLabel: { fontSize: 15, color: '#111' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  searchInput: {
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  commissionRow: {
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  commissionName: { fontSize: 15, fontWeight: '600', color: '#111' },
  commissionMeta: { fontSize: 13, color: '#666', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#666', paddingVertical: 16 },
});

export default ClassroomChangeForm;
