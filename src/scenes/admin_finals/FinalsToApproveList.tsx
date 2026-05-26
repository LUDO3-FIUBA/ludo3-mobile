import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { adminFinalsRepository } from '../../repositories';
import { TeacherFinal } from '../../models/TeacherFinal';

const FinalsToApproveList: React.FC = () => {
  const navigation = useNavigation<any>();
  const [finals, setFinals] = useState<TeacherFinal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOnId, setActingOnId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFinalsRepository.fetchPending();
      setFinals(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los finales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  const handleApprove = (final: TeacherFinal) => {
    Alert.alert(
      'Aprobar final',
      `¿Confirmás aprobar el final de ${final.subject?.name ?? final.subject} del ${moment(final.date).format('DD/MM/YYYY HH:mm')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          onPress: async () => {
            setActingOnId(final.id);
            try {
              await adminFinalsRepository.approve(final.id);
              setFinals(prev => prev.filter(f => f.id !== final.id));
            } catch {
              Alert.alert('Error', 'No se pudo aprobar el final.');
            } finally {
              setActingOnId(null);
            }
          },
        },
      ],
    );
  };

  const handleReject = (final: TeacherFinal) => {
    Alert.alert(
      'Rechazar final',
      `¿Confirmás rechazar el final de ${final.subject?.name ?? final.subject} del ${moment(final.date).format('DD/MM/YYYY HH:mm')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            setActingOnId(final.id);
            try {
              await adminFinalsRepository.reject(final.id);
              setFinals(prev => prev.filter(f => f.id !== final.id));
            } catch {
              Alert.alert('Error', 'No se pudo rechazar el final.');
            } finally {
              setActingOnId(null);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (finals.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No hay finales pendientes de aprobación.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={finals}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const busy = actingOnId === item.id;
        const subjectName = (item.subject as any)?.name ?? String(item.subject ?? '');
        const commissionLabels = item.commissions?.map(c => `Comisión ${c.siuId ?? c.id}`).join(' · ') ?? '';
        return (
          <View style={styles.card}>
            <Text style={styles.subjectName}>{subjectName}</Text>
            <Text style={styles.date}>
              {moment(item.date).format('dddd D MMMM YYYY, HH:mm')}
            </Text>
            {commissionLabels ? (
              <Text style={styles.commissions}>{commissionLabels}</Text>
            ) : null}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton, busy && styles.disabled]}
                disabled={busy}
                onPress={() => handleReject(item)}
              >
                <Text style={styles.rejectText}>Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.approveButton, busy && styles.disabled]}
                disabled={busy}
                onPress={() => handleApprove(item)}
              >
                <Text style={styles.approveText}>Aprobar</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  subjectName: { fontSize: 16, fontWeight: '600', color: '#111' },
  date: { fontSize: 14, color: '#444', marginTop: 4 },
  commissions: { fontSize: 13, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 },
  button: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  rejectButton: { backgroundColor: '#fee2e2' },
  rejectText: { color: '#b91c1c', fontWeight: '600' },
  approveButton: { backgroundColor: '#dcfce7' },
  approveText: { color: '#15803d', fontWeight: '600' },
  disabled: { opacity: 0.5 },
});

export default FinalsToApproveList;
