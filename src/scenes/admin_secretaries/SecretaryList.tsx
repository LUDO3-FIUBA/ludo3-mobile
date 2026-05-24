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

  const topLevel = secretaries.filter(s => s.parentSecretary === null);

  if (topLevel.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No hay secretarías registradas.</Text>
      </View>
    );
  }

  const navigateToDetail = (id: number) =>
    navigation.navigate('AdminSecretaryDetail', { secretaryId: id, isAdmin });

  return (
    <FlatList
      data={topLevel}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigateToDetail(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.location ? <Text style={styles.itemLocation}>{item.location}</Text> : null}
            </View>
            {isAdmin && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('AdminSecretaryCreate', { parentId: item.id })
                }
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.addSubButton}
              >
                <MaterialIcon name="plus-box-outline" fontSize={22} color="#555" />
              </TouchableOpacity>
            )}
            <MaterialIcon name="chevron-right" fontSize={20} color="#aaa" />
          </TouchableOpacity>

          {item.subsecretaries?.map(sub => (
            <TouchableOpacity
              key={sub.id}
              style={styles.subItem}
              onPress={() => navigateToDetail(sub.id)}
              activeOpacity={0.7}
            >
              <View style={styles.subIndent}>
                <MaterialIcon name="subdirectory-arrow-right" fontSize={16} color="#bbb" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.subName}>{sub.name}</Text>
                {sub.location ? <Text style={styles.itemLocation}>{sub.location}</Text> : null}
              </View>
              <MaterialIcon name="chevron-right" fontSize={18} color="#aaa" />
            </TouchableOpacity>
          ))}
        </View>
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
  group: {
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  subItem: {
    backgroundColor: '#fafafa',
    borderLeftWidth: 2,
    borderLeftColor: '#ddd',
    marginLeft: 16,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    paddingVertical: 10,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subIndent: {
    width: 32,
    alignItems: 'center',
  },
  addSubButton: {
    marginRight: 8,
    padding: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  subName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  itemLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

export default SecretaryList;
