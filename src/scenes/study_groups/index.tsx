import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, RefreshControl,
  SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { lightModeColors } from '../../styles/colorPalette';
import { studyGroupsRepository } from '../../repositories';
import type { StudyGroup } from '../../repositories/studyGroups';

const StudyGroupsScreen: React.FC<any> = () => {
  const navigation = useNavigation<any>();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const load = useCallback(async () => {
    try { setGroups(await studyGroupsRepository.fetchGroups()); }
    catch { Alert.alert('Error', 'No se pudieron cargar los grupos.'); }
    finally { setLoading(false); }
  }, []);

  const onRefresh = useCallback(async () => { setRefreshing(true); await load(); setRefreshing(false); }, [load]);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const g = await studyGroupsRepository.createGroup(newName.trim());
      setGroups(prev => [...prev, { ...g, is_creator: true, my_status: 'A', member_count: 1, members: [] }]);
      setNewName('');
      setCreating(false);
    } catch { Alert.alert('Error', 'No se pudo crear el grupo.'); }
  };

  const handleAccept = async (groupId: number) => {
    try {
      await studyGroupsRepository.acceptInvitation(groupId);
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, my_status: 'A' } : g));
    } catch { Alert.alert('Error', 'No se pudo aceptar.'); }
  };

  const handleLeave = (groupId: number) => {
    const confirm = typeof window !== 'undefined'
      ? window.confirm('¿Abandonar este grupo?')
      : false;
    if (!confirm) {
      Alert.alert('Abandonar grupo', '¿Querés abandonar este grupo?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abandonar', style: 'destructive', onPress: async () => {
          await studyGroupsRepository.leaveGroup(groupId);
          setGroups(prev => prev.filter(g => g.id !== groupId));
        }},
      ]);
      return;
    }
    studyGroupsRepository.leaveGroup(groupId).then(() => setGroups(prev => prev.filter(g => g.id !== groupId)));
  };

  if (loading) return <SafeAreaView style={s.container}><ActivityIndicator size="large" color={lightModeColors.mainColor} style={{ flex: 1 }} /></SafeAreaView>;

  const pending = groups.filter(g => g.my_status === 'P');
  const active = groups.filter(g => g.my_status === 'A');

  return (
    <SafeAreaView style={s.container}>
      {creating ? (
        <View style={s.createBar}>
          <TextInput style={s.createInput} placeholder="Nombre del grupo..." value={newName} onChangeText={setNewName} autoFocus />
          <TouchableOpacity accessibilityLabel="confirmar-crear-grupo" style={s.createBtn} onPress={handleCreate}><Icon name="check" size={20} color="white" /></TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={() => { setCreating(false); setNewName(''); }}><Icon name="close" size={20} color={lightModeColors.darkGray} /></TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.newGroupBtn} onPress={() => setCreating(true)} accessibilityLabel="crear-grupo">
          <Icon name="account-group-outline" size={18} color="white" />
          <Text style={s.newGroupText}>Nuevo grupo</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={groups}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <>
            {pending.length > 0 && <Text style={s.sectionHeader}>Invitaciones ({pending.length})</Text>}
          </>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardInfo}>
              <Text style={s.cardName}>{item.name}</Text>
              <Text style={s.cardMeta}>{item.member_count} {item.member_count === 1 ? 'miembro' : 'miembros'} · {item.is_creator ? 'Creador' : item.my_status === 'P' ? 'Invitación pendiente' : 'Miembro'}</Text>
            </View>
            <View style={s.cardActions}>
              {item.my_status === 'P' && !item.is_creator && (
                <TouchableOpacity accessibilityLabel="aceptar-grupo" style={s.acceptBtn} onPress={() => handleAccept(item.id)}>
                  <Icon name="check" size={18} color="white" />
                </TouchableOpacity>
              )}
              {item.my_status === 'A' && (
                <TouchableOpacity accessibilityLabel="ver-horario-grupo" style={s.scheduleBtn} onPress={() => navigation.navigate('GroupSchedule', { group: item })}>
                  <Icon name="calendar-clock" size={18} color={lightModeColors.mainColor} />
                </TouchableOpacity>
              )}
              {item.is_creator && (
                <TouchableOpacity accessibilityLabel="invitar-miembro" style={s.scheduleBtn} onPress={() => navigation.navigate('GroupInvite', { group: item })}>
                  <Icon name="account-plus" size={18} color={lightModeColors.mainColor} />
                </TouchableOpacity>
              )}
              {!item.is_creator && (
                <TouchableOpacity accessibilityLabel="salir-grupo" style={s.leaveBtn} onPress={() => handleLeave(item.id)}>
                  <Icon name="exit-to-app" size={18} color={lightModeColors.failed} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Icon name="account-group-outline" size={56} color={lightModeColors.lightGray} />
            <Text style={s.emptyText}>No tenés grupos de estudio.{'\n'}Creá uno o esperá una invitación.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 12, flexGrow: 1 },
  createBar: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: lightModeColors.lightGray, alignItems: 'center', gap: 8 },
  createInput: { flex: 1, fontSize: 15, borderWidth: 1, borderColor: lightModeColors.lightGray, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  createBtn: { backgroundColor: lightModeColors.mainColor, borderRadius: 20, padding: 8 },
  cancelBtn: { padding: 8 },
  newGroupBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: lightModeColors.mainColor, margin: 12, borderRadius: 10, padding: 12, gap: 8 },
  newGroupText: { color: 'white', fontWeight: '600', fontSize: 15 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: lightModeColors.darkGray, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#000' },
  cardMeta: { fontSize: 12, color: lightModeColors.darkGray, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 6 },
  acceptBtn: { backgroundColor: '#28a745', borderRadius: 20, padding: 6 },
  scheduleBtn: { padding: 6 },
  leaveBtn: { padding: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { marginTop: 12, fontSize: 14, color: lightModeColors.darkGray, textAlign: 'center', lineHeight: 22 },
});

export default StudyGroupsScreen;
