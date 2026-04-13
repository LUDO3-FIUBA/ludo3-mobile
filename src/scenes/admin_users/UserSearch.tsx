import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import { adminUsersRepository } from '../../repositories';
import AdminUser from '../../models/AdminUser';

const UserSearch: React.FC = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const dni = query.trim();
    if (!dni) {
      Alert.alert('Error', 'Ingresá un DNI para buscar.');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await adminUsersRepository.searchByDni(dni);
      setResults(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la búsqueda.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadges = (user: AdminUser) => {
    const badges: string[] = [];
    if (user.isStudent) badges.push('Estudiante');
    if (user.isTeacher) badges.push('Docente');
    if (user.isStaff) badges.push('Admin');
    return badges;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por DNI..."
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={setQuery}
          keyboardType="numeric"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <MaterialIcon name="magnify" fontSize={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No se encontraron usuarios.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                navigation.navigate('AdminUserDetail', { userId: item.id })
              }
            >
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>
                  {item.lastName}, {item.firstName}
                </Text>
                <Text style={styles.itemDni}>DNI: {item.dni}</Text>
                <View style={styles.badgeRow}>
                  {getRoleBadges(item).map(badge => (
                    <View
                      key={badge}
                      style={[
                        styles.badge,
                        badge === 'Admin' && styles.badgeAdmin,
                        badge === 'Docente' && styles.badgeTeacher,
                        badge === 'Estudiante' && styles.badgeStudent,
                      ]}
                    >
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <MaterialIcon name="chevron-right" fontSize={20} color="#aaa" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  itemDni: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  badgeStudent: {
    backgroundColor: '#dbeafe',
  },
  badgeTeacher: {
    backgroundColor: '#dcfce7',
  },
  badgeAdmin: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
});

export default UserSearch;
