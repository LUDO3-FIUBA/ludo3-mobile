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
import { adminCommissionsRepository } from '../../repositories';
import AdminCommission from '../../models/AdminCommission';

const CommissionList: React.FC = () => {
  const navigation = useNavigation<any>();
  const [commissions, setCommissions] = useState<AdminCommission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCommissions = async () => {
    try {
      const data = await adminCommissionsRepository.fetchAll();
      setCommissions(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las comisiones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
    const unsubscribe = navigation.addListener('focus', loadCommissions);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminCommissionCreate')}
          style={{ marginRight: 16 }}
        >
          <MaterialIcon name="plus" fontSize={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (commissions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No hay comisiones registradas.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={commissions}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate('AdminCommissionDetail', { commissionId: item.id })
          }
        >
          <View style={styles.itemContent}>
            <Text style={styles.itemName}>{item.subjectName}</Text>
            <Text style={styles.itemSubtitle}>
              {item.chiefTeacher.lastName}, {item.chiefTeacher.firstName}
            </Text>
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
  itemSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

export default CommissionList;
