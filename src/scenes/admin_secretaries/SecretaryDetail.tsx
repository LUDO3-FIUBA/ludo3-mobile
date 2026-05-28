import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RoundedButton, MaterialIcon} from '../../components';
import {secretariesRepository, formsRepository, usersRepository} from '../../repositories';
import Secretary from '../../models/Secretary';
import FormOwnershipGroup from '../../models/FormOwnershipGroup';

type SecretaryDetailRouteParams = {
  AdminSecretaryDetail: {
    secretaryId: number;
    isAdmin: boolean;
  };
};

interface PendingMembership {
  groupId: number;
  groupName: string;
  isEditor: boolean;
}

const SecretaryDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<SecretaryDetailRouteParams, 'AdminSecretaryDetail'>>();
  const {secretaryId, isAdmin} = route.params;

  const [secretary, setSecretary] = useState<Secretary | null>(null);
  const [parentName, setParentName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  const [editingGroups, setEditingGroups] = useState(false);
  const [allGroups, setAllGroups] = useState<FormOwnershipGroup[]>([]);
  const [pending, setPending] = useState<PendingMembership[]>([]);
  const [savingGroups, setSavingGroups] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const listRoute = isAdmin ? 'AdminSecretaryList' : 'StudentSecretaryList';
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate(listRoute)}
            style={styles.backButton}
          >
            <MaterialIcon name="arrow-left" fontSize={24} color="#333" />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, isAdmin]);

  useEffect(() => {
    Promise.all([
      secretariesRepository.fetchOne(secretaryId),
      usersRepository.getInfo(),
    ])
      .then(([sec, user]) => {
        setSecretary(sec);
        setIsSuperAdmin(user.isSuperAdmin?.() ?? false);
        setIsTeacher(user.isTeacher() && !user.isAdmin());
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar la secretaría.'))
      .finally(() => setLoading(false));
  }, [secretaryId]);

  useEffect(() => {
    if (secretary?.parentSecretary != null) {
      secretariesRepository
        .fetchOne(secretary.parentSecretary)
        .then(parent => setParentName(parent.name))
        .catch(() => {});
    }
  }, [secretary?.parentSecretary]);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar secretaría',
      `¿Estás seguro de que querés eliminar "${secretary?.name}"?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await secretariesRepository.deleteSecretary(secretaryId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la secretaría.');
            }
          },
        },
      ],
    );
  };

  const startEditingGroups = async () => {
    try {
      const groups = await formsRepository.fetchOwnershipGroups();
      setAllGroups(groups);
      const current: PendingMembership[] = (secretary?.ownershipGroups ?? []).map(m => ({
        groupId: m.groupId,
        groupName: m.groupName,
        isEditor: m.isEditor,
      }));
      setPending(current);
      setEditingGroups(true);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los grupos de propiedad.');
    }
  };

  const toggleGroup = (group: FormOwnershipGroup) => {
    setPending(prev => {
      const exists = prev.find(p => p.groupId === group.id);
      if (exists) {
        return prev.filter(p => p.groupId !== group.id);
      }
      return [...prev, {groupId: group.id, groupName: group.name, isEditor: false}];
    });
  };

  const toggleEditor = (groupId: number) => {
    setPending(prev =>
      prev.map(p => (p.groupId === groupId ? {...p, isEditor: !p.isEditor} : p)),
    );
  };

  const saveGroupMemberships = async () => {
    setSavingGroups(true);
    try {
      const updated = await secretariesRepository.updateMemberships(
        secretaryId,
        pending.map(p => ({groupId: p.groupId, isEditor: p.isEditor})),
      );
      setSecretary(updated);
      setEditingGroups(false);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'No se pudieron guardar los grupos.';
      Alert.alert('Error', msg);
    } finally {
      setSavingGroups(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!secretary) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Secretaría no encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{secretary.name}</Text>

      {secretary.parentSecretary != null && (
        <Section title="Subsecretaría de">
          <Text style={styles.bodyText}>{parentName ?? '...'}</Text>
        </Section>
      )}

      {secretary.location ? (
        <Section title="Ubicación">
          <Text style={styles.bodyText}>{secretary.location}</Text>
        </Section>
      ) : null}

      {secretary.schedule ? (
        <Section title="Horario de atención">
          <Text style={styles.bodyText}>{secretary.schedule}</Text>
        </Section>
      ) : null}

      {secretary.contactInfo ? (
        <Section title="Información de contacto">
          <Text style={styles.bodyText}>{secretary.contactInfo}</Text>
        </Section>
      ) : null}

      {secretary.subsecretaries && secretary.subsecretaries.length > 0 ? (
        <Section title="Subsecretarías">
          {secretary.subsecretaries.map(sub => (
            <TouchableOpacity
              key={sub.id}
              style={styles.subItem}
              onPress={() =>
                navigation.navigate('AdminSecretaryDetail', {
                  secretaryId: sub.id,
                  isAdmin,
                })
              }>
              <View style={styles.subItemContent}>
                <Text style={styles.subItemName}>{sub.name}</Text>
                {sub.location ? (
                  <Text style={styles.subItemLocation}>{sub.location}</Text>
                ) : null}
              </View>
              <Text style={styles.subItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </Section>
      ) : null}

      {/* Ownership groups section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Grupos de propiedad</Text>
          {isSuperAdmin && !editingGroups && (
            <TouchableOpacity onPress={startEditingGroups} style={styles.editGroupsButton}>
              <Text style={styles.editGroupsButtonText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        {!editingGroups ? (
          secretary.ownershipGroups && secretary.ownershipGroups.length > 0 ? (
            <>
              {secretary.ownershipGroups.map(g => {
                const onPress = isAdmin
                  ? () => navigation.navigate('FormsManager')
                  : isTeacher
                  ? undefined
                  : () => navigation.navigate('FormsList');
                const Wrapper = onPress ? TouchableOpacity : View;
                return (
                  <Wrapper
                    key={g.groupId}
                    style={styles.groupItem}
                    onPress={onPress}>
                    <View style={styles.groupItemContent}>
                      <Text style={styles.groupItemName}>{g.groupName}</Text>
                      <Text style={styles.groupItemRole}>
                        {g.isEditor ? 'Editor' : 'Lector'}
                      </Text>
                    </View>
                    {onPress ? <Text style={styles.groupItemArrow}>›</Text> : null}
                  </Wrapper>
                );
              })}
            </>
          ) : (
            <Text style={styles.emptyText}>Sin grupos asignados</Text>
          )
        ) : (
          <View>
            {allGroups.map(g => {
              const membership = pending.find(p => p.groupId === g.id);
              const isSelected = !!membership;
              return (
                <View key={g.id} style={styles.groupEditRow}>
                  <TouchableOpacity
                    style={styles.groupEditCheckbox}
                    onPress={() => toggleGroup(g)}>
                    <MaterialIcon
                      name={
                        isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'
                      }
                      fontSize={22}
                      color={isSelected ? '#1a56db' : '#aaa'}
                    />
                    <Text style={styles.groupEditName}>{g.name}</Text>
                  </TouchableOpacity>
                  {isSelected && (
                    <View style={styles.editorToggle}>
                      <Text style={styles.editorToggleLabel}>Editor</Text>
                      <Switch
                        value={membership.isEditor}
                        onValueChange={() => toggleEditor(g.id)}
                        trackColor={{true: '#1a56db'}}
                      />
                    </View>
                  )}
                </View>
              );
            })}
            <View style={styles.editActions}>
              <RoundedButton
                text={savingGroups ? 'Guardando...' : 'Guardar'}
                enabled={!savingGroups}
                onPress={saveGroupMemberships}
                style={{}}
              />
              <TouchableOpacity
                onPress={() => setEditingGroups(false)}
                style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {isAdmin && (
        <View style={styles.adminActions}>
          <RoundedButton
            text="Editar"
            onPress={() =>
              navigation.navigate('AdminSecretaryEdit', {secretary})
            }
            style={{}}
          />
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const Section: React.FC<{title: string; children: React.ReactNode}> = ({
  title,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 15,
    color: '#222',
    lineHeight: 22,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subItemContent: {
    flex: 1,
  },
  subItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111',
  },
  subItemLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  subItemArrow: {
    fontSize: 20,
    color: '#aaa',
    marginLeft: 8,
  },
  editGroupsButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#e8eeff',
    borderRadius: 6,
  },
  editGroupsButtonText: {
    fontSize: 13,
    color: '#1a56db',
    fontWeight: '600',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  groupItemContent: {
    flex: 1,
  },
  groupItemName: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  groupItemRole: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  groupItemArrow: {
    fontSize: 20,
    color: '#aaa',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  groupEditRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  groupEditCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupEditName: {
    fontSize: 15,
    color: '#222',
    marginLeft: 8,
    flex: 1,
  },
  editorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingLeft: 30,
  },
  editorToggleLabel: {
    fontSize: 13,
    color: '#555',
    marginRight: 8,
  },
  editActions: {
    marginTop: 12,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 15,
  },
  adminActions: {
    marginTop: 8,
  },
  addSubButton: {
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  deleteButton: {
    alignItems: 'center',
    padding: 12,
  },
  deleteButtonText: {
    color: '#e53e3e',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginLeft: 16,
    padding: 4,
  },
});

export default SecretaryDetail;
