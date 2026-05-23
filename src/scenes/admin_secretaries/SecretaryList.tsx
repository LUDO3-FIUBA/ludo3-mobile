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
import { secretariesRepository } from '../../repositories';
import Secretary from '../../models/Secretary';

interface Props {
  isAdmin: boolean;
}

const SecretaryList: React.FC<Props> = ({ isAdmin }) => {
  const navigation = useNavigation<any>();
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSecretaries = async () => {
    try {
      const data = await secretariesRepository.fetchAll();
      setSecretaries(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las secretarías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecretaries();
    const unsubscribe = navigation.addListener('focus', loadSecretaries);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (isAdmin) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminSecretaryCreate')}
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

  if (secretaries.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No hay secretarías registradas.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={secretaries}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate('AdminSecretaryDetail', { secretaryId: item.id, isAdmin })
          }
        >
          <View style={styles.itemContent}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.location ? <Text style={styles.itemLocation}>{item.location}</Text> : null}
            {item.subsecretaries && item.subsecretaries.length > 0 ? (
              <Text style={styles.subsecCount}>
                {item.subsecretaries.length} subsecretar{item.subsecretaries.length === 1 ? 'ía' : 'ías'}
              </Text>
            ) : null}
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
  subsecCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

export default SecretaryList;
