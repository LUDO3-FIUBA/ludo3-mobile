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
import { MaterialIcon } from '../../components';
import { departmentsRepository } from '../../repositories';
import Department from '../../models/Department';

interface Props {
  isAdmin: boolean;
}

const DepartmentList: React.FC<Props> = ({ isAdmin }) => {
  const navigation = useNavigation<any>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDepartments = async () => {
    try {
      const data = await departmentsRepository.fetchAll();
      setDepartments(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los departamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    const unsubscribe = navigation.addListener('focus', loadDepartments);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (isAdmin) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminDepartmentCreate')}
            style={{ marginRight: 16 }}
          >
            <MaterialIcon name="plus" fontSize={24} color="#333" />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, isAdmin]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (departments.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No hay departamentos registrados.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={departments}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate('AdminDepartmentDetail', { departmentId: item.id, isAdmin })
          }
        >
          <View style={styles.itemContent}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.location ? <Text style={styles.itemLocation}>{item.location}</Text> : null}
          </View>
          <MaterialIcon name="chevron-right" fontSize={20} color="#aaa" />
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
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
  itemLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

export default DepartmentList;
