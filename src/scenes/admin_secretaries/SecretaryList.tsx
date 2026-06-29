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
import { secretariesRepository, usersRepository } from '../../repositories';
import Secretary from '../../models/Secretary';

interface Props {
  isAdmin: boolean;
}

const SecretaryList: React.FC<Props> = ({ isAdmin }) => {
  const navigation = useNavigation<any>();
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  const loadSecretaries = async () => {
    try {
      const data = await secretariesRepository.fetchAll();
      setSecretaries(data);
    } catch (error) {
      setAlertDialog({ title: 'Error', message: 'No se pudieron cargar las secretarías.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    usersRepository.getInfo().then(u => setIsSuperAdmin(u.isSuperAdmin?.() ?? false)).catch(() => {});
    loadSecretaries();
    const unsubscribe = navigation.addListener('focus', loadSecretaries);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (isSuperAdmin) {
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
  }, [navigation, isSuperAdmin]);

  const topLevel = secretaries.filter(s => s.parentSecretary === null);

  const navigateToDetail = (id: number) =>
    navigation.navigate(isAdmin ? 'AdminSecretaryDetail' : 'StudentSecretaryDetail', { secretaryId: id, isAdmin });

  let content: React.ReactNode;
  if (loading) {
    content = (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (topLevel.length === 0) {
    content = (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No hay secretarías registradas.</Text>
      </View>
    );
  } else {
    content = (
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
              {isSuperAdmin && (
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
  }

  return (
    <>
      {content}
      <AlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => setAlertDialog(null)}
      />
    </>
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
