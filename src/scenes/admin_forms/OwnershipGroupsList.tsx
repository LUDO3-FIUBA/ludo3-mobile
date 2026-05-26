import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AlertDialog, MaterialIcon } from '../../components';
import { formsRepository, usersRepository } from '../../repositories';
import FormOwnershipGroup from '../../models/FormOwnershipGroup';
import { lightModeColors } from '../../styles/colorPalette';

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

const OwnershipGroupsList: React.FC = () => {
  const navigation = useNavigation<any>();
  const [groups, setGroups] = useState<FormOwnershipGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupToDelete, setGroupToDelete] = useState<FormOwnershipGroup | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAnyAdmin, setIsAnyAdmin] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const [data, user] = await Promise.all([
        formsRepository.fetchOwnershipGroups(),
        usersRepository.getInfo(),
      ]);
      setGroups(data);
      setIsSuperAdmin(user.isSuperAdmin?.() ?? false);
      setIsAnyAdmin(user.isAdmin?.() ?? false);
    } catch {
      showMessage('Error', 'No se pudieron cargar los grupos de propiedad.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
    const unsub = navigation.addListener('focus', loadGroups);
    return unsub;
  }, [navigation, loadGroups]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 16, padding: 4 }}
          onPress={() => navigation.navigate('FormsManager')}
        >
          <MaterialIcon name="arrow-left" fontSize={24} color="#333" />
        </TouchableOpacity>
      ),
      headerRight: isAnyAdmin
        ? () => (
            <TouchableOpacity
              style={{ marginRight: 16 }}
              onPress={() => navigation.navigate('OwnershipGroupEditor')}
            >
              <MaterialIcon name="plus" fontSize={24} color={lightModeColors.mainContrastColor} />
            </TouchableOpacity>
          )
        : undefined,
    });
  }, [navigation, isSuperAdmin, isAnyAdmin]);

  const confirmDelete = async () => {
    if (!groupToDelete) return;
    setDeleting(true);
    try {
      await formsRepository.deleteOwnershipGroup(groupToDelete.id);
      setGroups(prev => prev.filter(g => g.id !== groupToDelete.id));
    } catch (err: any) {
      const detail = err?.info?.detail ?? err?.info;
      const msg = typeof detail === 'string' ? detail : 'No se pudo eliminar el grupo.';
      showMessage('Error', msg);
    } finally {
      setDeleting(false);
      setGroupToDelete(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={groups}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={groups.length === 0 ? styles.centerContent : styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay grupos de propiedad registrados.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardMain}
              onPress={isSuperAdmin ? () => navigation.navigate('OwnershipGroupEditor', { groupId: item.id }) : undefined}
              activeOpacity={isSuperAdmin ? 0.7 : 1}
            >
              <View style={styles.cardIcon}>
                <MaterialIcon name="folder-account" fontSize={22} color={lightModeColors.institutional} />
              </View>
              <Text style={styles.cardName}>{item.name}</Text>
              {isSuperAdmin && <MaterialIcon name="chevron-right" fontSize={20} color="#bbb" />}
            </TouchableOpacity>
            {isSuperAdmin && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => setGroupToDelete(item)}
                hitSlop={8}
              >
                <MaterialIcon name="delete-outline" fontSize={20} color="#D32F2F" />
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <AlertDialog
        visible={!!groupToDelete}
        title="Eliminar grupo"
        message={
          groupToDelete
            ? `¿Estás seguro de eliminar el grupo "${groupToDelete.name}"? Solo se puede eliminar si no tiene formularios asociados.`
            : ''
        }
        destructive
        loading={deleting}
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setGroupToDelete(null)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  listContent: { padding: 16, gap: 10 },
  emptyText: { color: '#888', fontSize: 15, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#222' },
  deleteBtn: { padding: 6 },
});

export default OwnershipGroupsList;
