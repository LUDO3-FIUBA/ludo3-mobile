import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { lightModeColors } from '../../styles/colorPalette';
import { contactsRepository, Contact, ContactStudent } from '../../repositories/contacts';

// ─── Search Bar ────────────────────────────────────────────────────────────────

const SearchBar: React.FC<{ onAdd: (padron: string) => void }> = ({ onAdd }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContactStudent[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const data = await contactsRepository.searchStudents(text);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputRow}>
        <Icon name="magnify" size={20} color={lightModeColors.darkGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o padrón..."
          placeholderTextColor={lightModeColors.darkGray}
          value={query}
          onChangeText={search}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
            <Icon name="close-circle" size={18} color={lightModeColors.darkGray} />
          </TouchableOpacity>
        )}
      </View>

      {searching && <ActivityIndicator size="small" color={lightModeColors.mainColor} style={{ marginTop: 8 }} />}

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={item => item.padron}
          style={styles.searchResults}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={styles.searchResultRow}>
              <View style={styles.searchResultInfo}>
                <Text style={styles.searchResultName}>{item.full_name}</Text>
                <Text style={styles.searchResultPadron}>Padrón: {item.padron}</Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => { onAdd(item.padron); setQuery(''); setResults([]); }}
              >
                <Icon name="account-plus" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

// ─── Contact Card ──────────────────────────────────────────────────────────────

const ContactCard: React.FC<{
  contact: Contact;
  onAccept: (id: number) => void;
  onRemove: (id: number) => void;
  onViewSubjects: (contact: Contact) => void;
  isReceived: boolean;
}> = ({ contact, onAccept, onRemove, onViewSubjects, isReceived }) => {
  const isPending = contact.status === 'P';

  return (
    <View style={styles.card}>
      <View style={styles.cardAvatar}>
        <Icon name="account-circle" size={40} color={lightModeColors.mainColor} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{contact.contact.full_name || 'Sin nombre'}</Text>
        <Text style={styles.cardPadron}>Padrón: {contact.contact.padron}</Text>
        {isPending && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>{isReceived ? 'Solicitud recibida' : 'Solicitud enviada'}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardActions}>
        {isPending && isReceived && (
          <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(contact.id)}>
            <Icon name="check" size={20} color="white" />
          </TouchableOpacity>
        )}
        {!isPending && (
          <TouchableOpacity style={styles.subjectsBtn} onPress={() => onViewSubjects(contact)}>
            <Icon name="book-open-variant" size={20} color={lightModeColors.mainColor} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(contact.id)}>
          <Icon name="account-remove" size={20} color={lightModeColors.failed} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────

const ContactsScreen: React.FC<any> = () => {
  const navigation = useNavigation<any>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myPadron, setMyPadron] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await contactsRepository.fetchContacts();
      setContacts(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los contactos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (padron: string) => {
    try {
      const contact = await contactsRepository.sendRequest(padron);
      setContacts(prev => [...prev, contact]);
      Alert.alert('Solicitud enviada', 'La solicitud de contacto fue enviada.');
    } catch (e: any) {
      const msg = e?.code === 409 ? 'Ya existe una solicitud con este alumno.' : 'No se pudo enviar la solicitud.';
      Alert.alert('Error', msg);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      const updated = await contactsRepository.acceptRequest(id);
      setContacts(prev => prev.map(c => c.id === id ? updated : c));
    } catch {
      Alert.alert('Error', 'No se pudo aceptar la solicitud.');
    }
  };

  const handleRemove = (id: number) => {
    Alert.alert(
      'Eliminar contacto',
      '¿Querés eliminar este contacto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await contactsRepository.removeContact(id);
              setContacts(prev => prev.filter(c => c.id !== id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el contacto.');
            }
          },
        },
      ]
    );
  };

  const handleViewSubjects = (contact: Contact) => {
    navigation.navigate('ContactSubjects', { contact });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={lightModeColors.mainColor} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const pending = contacts.filter(c => c.status === 'P');
  const accepted = contacts.filter(c => c.status === 'A');

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar onAdd={handleAdd} />
      <FlatList
        data={contacts}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {pending.length > 0 && <Text style={styles.sectionHeader}>Solicitudes pendientes ({pending.length})</Text>}
          </>
        }
        renderItem={({ item }) => (
          <ContactCard
            contact={item}
            onAccept={handleAccept}
            onRemove={handleRemove}
            onViewSubjects={handleViewSubjects}
            isReceived={item.status === 'P'}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="account-group-outline" size={56} color={lightModeColors.lightGray} />
            <Text style={styles.emptyText}>Todavía no tenés contactos.{'\n'}Buscá compañeros por nombre o padrón.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// ─── Contact Subjects Screen ───────────────────────────────────────────────────

export const ContactSubjectsScreen: React.FC<any> = ({ route }) => {
  const { contact } = route.params as { contact: Contact };
  const [subjects, setSubjects] = useState<{ subject_name: string; subject_siu_id: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contactsRepository.fetchContactSubjects(contact.id)
      .then(setSubjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contact.id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={lightModeColors.mainColor} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subjectsHeader}>
        <Icon name="account-circle" size={32} color={lightModeColors.mainColor} />
        <Text style={styles.subjectsTitle}>{contact.contact.full_name}</Text>
      </View>
      {subjects.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="book-open-outline" size={48} color={lightModeColors.lightGray} />
          <Text style={styles.emptyText}>No está cursando materias actualmente.</Text>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={item => String(item.subject_siu_id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.subjectRow}>
              <Icon name="book-open-variant" size={20} color={lightModeColors.mainColor} style={{ marginRight: 10 }} />
              <Text style={styles.subjectName}>{item.subject_name}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContent: { padding: 12, flexGrow: 1 },

  // Search
  searchContainer: { padding: 12, borderBottomWidth: 1, borderBottomColor: lightModeColors.lightGray },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, fontSize: 15, color: '#000' },
  searchResults: { maxHeight: 220, marginTop: 8, borderRadius: 8, borderWidth: 1, borderColor: lightModeColors.lightGray },
  searchResultRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: lightModeColors.lightGray },
  searchResultInfo: { flex: 1 },
  searchResultName: { fontSize: 14, fontWeight: '600', color: '#000' },
  searchResultPadron: { fontSize: 12, color: lightModeColors.darkGray, marginTop: 2 },
  addButton: { backgroundColor: lightModeColors.mainColor, borderRadius: 20, padding: 6, marginLeft: 8 },

  // Section
  sectionHeader: { fontSize: 13, fontWeight: '700', color: lightModeColors.darkGray, marginBottom: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Card
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  cardAvatar: { marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#000' },
  cardPadron: { fontSize: 13, color: lightModeColors.darkGray, marginTop: 2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pendingBadge: { marginTop: 4, backgroundColor: '#fff3cd', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  pendingText: { fontSize: 11, color: '#856404' },
  acceptBtn: { backgroundColor: '#28a745', borderRadius: 20, padding: 6 },
  removeBtn: { padding: 6 },
  subjectsBtn: { padding: 6 },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { marginTop: 12, fontSize: 14, color: lightModeColors.darkGray, textAlign: 'center', lineHeight: 22 },

  // Subjects screen
  subjectsHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: lightModeColors.lightGray, gap: 10 },
  subjectsTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  subjectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  subjectName: { fontSize: 15, color: '#000', flex: 1 },
});

export default ContactsScreen;
