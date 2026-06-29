import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import AlertDialog from '../../components/AlertDialog';
import { departmentsRepository, usersRepository } from '../../repositories';
import Department from '../../models/Department';

interface Props {
  isAdmin: boolean;
}

const DepartmentList: React.FC<Props> = ({ isAdmin }) => {
  const navigation = useNavigation<any>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  const loadDepartments = async () => {
    try {
      const data = await departmentsRepository.fetchAll();
      setDepartments(data);
    } catch (error) {
      setAlertDialog({ title: 'Error', message: 'No se pudieron cargar los departamentos.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    usersRepository.getInfo().then(u => setIsSuperAdmin(u.isSuperAdmin?.() ?? false)).catch(() => {});
    loadDepartments();
    const unsubscribe = navigation.addListener('focus', loadDepartments);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (isSuperAdmin) {
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
  }, [navigation, isSuperAdmin]);

  const content = loading ? (
    <View style={styles.centered}>
      <ActivityIndicator size="large" />
    </View>
  ) : departments.length === 0 ? (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>No hay departamentos registrados.</Text>
    </View>
  ) : (
    <FlatList
      data={departments}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate(isAdmin ? 'AdminDepartmentDetail' : 'StudentDepartmentDetail', { departmentId: item.id, isAdmin })
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

  return (
    <View style={{ flex: 1 }}>
      {content}
      <AlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => setAlertDialog(null)}
      />
    </View>
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
