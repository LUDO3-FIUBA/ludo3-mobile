import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { lightModeColors } from '../../styles/colorPalette';
import { contactsRepository } from '../../repositories';
import { studyGroupsRepository } from '../../repositories';
import type { StudyGroup } from '../../repositories/studyGroups';
import type { ContactStudent } from '../../repositories/contacts';

const GroupInviteScreen: React.FC<any> = ({ route }) => {
  const { group } = route.params as { group: StudyGroup };
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContactStudent[]>([]);
  const [searching, setSearching] = useState(false);
  const [invited, setInvited] = useState<Set<string>>(new Set());

  const search = async (text: string) => {
    setQuery(text);
    if (text.length < 2) { setResults([]); return; }
    setSearching(true);
    try { setResults(await contactsRepository.searchStudents(text)); }
    catch { setResults([]); }
    finally { setSearching(false); }
  };

  const handleInvite = async (padron: string) => {
    try {
      await studyGroupsRepository.inviteMember(group.id, padron);
      setInvited(prev => new Set([...prev, padron]));
      Alert.alert('Invitación enviada');
    } catch (e: any) {
      Alert.alert('Error', e?.code === 409 ? 'Ya fue invitado.' : 'No se pudo invitar.');
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.searchRow}>
        <Icon name="magnify" size={18} color={lightModeColors.darkGray} style={{ marginRight: 6 }} />
        <TextInput style={s.input} placeholder="Buscar contacto..." value={query} onChangeText={search} autoCapitalize="none" />
        {searching && <ActivityIndicator size="small" color={lightModeColors.mainColor} />}
      </View>
      <FlatList
        data={results}
        keyExtractor={item => item.padron}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.full_name}</Text>
              <Text style={s.padron}>Padrón: {item.padron}</Text>
            </View>
            {invited.has(item.padron) ? (
              <Icon name="check-circle" size={22} color="#28a745" />
            ) : (
              <TouchableOpacity accessibilityLabel={`invitar-${item.padron}`} style={s.inviteBtn} onPress={() => handleInvite(item.padron)}>
                <Icon name="account-plus" size={18} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={query.length >= 2 && !searching ? <Text style={s.empty}>Sin resultados</Text> : null}
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchRow: { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  input: { flex: 1, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  name: { fontSize: 14, fontWeight: '600' },
  padron: { fontSize: 12, color: lightModeColors.darkGray },
  inviteBtn: { backgroundColor: lightModeColors.mainColor, borderRadius: 20, padding: 6 },
  empty: { textAlign: 'center', color: lightModeColors.darkGray, marginTop: 20 },
});

export default GroupInviteScreen;
