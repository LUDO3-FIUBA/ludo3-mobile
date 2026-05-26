import React, { useEffect, useState } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RoundedButton, MaterialIcon } from '../../components';
import { departmentsRepository } from '../../repositories';
import { formsRepository } from '../../repositories';
import { usersRepository } from '../../repositories';
import Department, { OwnershipGroupMembership } from '../../models/Department';
import FormOwnershipGroup from '../../models/FormOwnershipGroup';

type DepartmentDetailRouteParams = {
  DepartmentDetail: {
    departmentId: number;
    isAdmin: boolean;
  };
};

interface PendingMembership {
  groupId: number;
  groupName: string;
  isEditor: boolean;
}

const DepartmentDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<DepartmentDetailRouteParams, 'DepartmentDetail'>>();
  const { departmentId, isAdmin } = route.params;

  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [editingGroups, setEditingGroups] = useState(false);
  const [allGroups, setAllGroups] = useState<FormOwnershipGroup[]>([]);
  const [pending, setPending] = useState<PendingMembership[]>([]);
  const [savingGroups, setSavingGroups] = useState(false);

  useEffect(() => {
    Promise.all([
      departmentsRepository.fetchOne(departmentId),
      usersRepository.getInfo(),
    ])
      .then(([dept, user]) => {
        setDepartment(dept);
        setIsSuperAdmin(user.isSuperAdmin?.() ?? false);
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar el departamento.'))
      .finally(() => setLoading(false));
  }, [departmentId]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const listRoute = isAdmin ? 'AdminDepartmentList' : 'StudentDepartmentList';
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

  const handleDelete = () => {
    Alert.alert(
      'Eliminar departamento',
      `¿Estás seguro de que querés eliminar "${department?.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await departmentsRepository.deleteDepartment(departmentId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el departamento.');
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
      const current: PendingMembership[] = (department?.ownershipGroups ?? []).map(m => ({
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
      return [...prev, { groupId: group.id, groupName: group.name, isEditor: false }];
    });
  };

  const toggleEditor = (groupId: number) => {
    setPending(prev =>
      prev.map(p => (p.groupId === groupId ? { ...p, isEditor: !p.isEditor } : p)),
    );
  };

  const saveGroupMemberships = async () => {
    setSavingGroups(true);
    try {
      const updated = await departmentsRepository.updateMemberships(
        departmentId,
        pending.map(p => ({ groupId: p.groupId, isEditor: p.isEditor })),
      );
      setDepartment(updated);
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

  if (!department) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Departamento no encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{department.name}</Text>

      {department.location ? (
        <Section title="Ubicación">
          <Text style={styles.bodyText}>{department.location}</Text>
        </Section>
      ) : null}

      {department.schedule ? (
        <Section title="Horario de atención">
          <Text style={styles.bodyText}>{department.schedule}</Text>
        </Section>
      ) : null}

      {department.contactInfo ? (
        <Section title="Información de contacto">
          <Text style={styles.bodyText}>{department.contactInfo}</Text>
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
          department.ownershipGroups && department.ownershipGroups.length > 0 ? (
            department.ownershipGroups.map(g => (
              <TouchableOpacity
                key={g.groupId}
                style={styles.groupItem}
                onPress={() => navigation.navigate('FormsManager')}
              >
                <View style={styles.groupItemContent}>
                  <Text style={styles.groupItemName}>{g.groupName}</Text>
                  <Text style={styles.groupItemRole}>{g.isEditor ? 'Editor' : 'Lector'}</Text>
                </View>
                <Text style={styles.groupItemArrow}>›</Text>
              </TouchableOpacity>
            ))
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
                    onPress={() => toggleGroup(g)}
                  >
                    <MaterialIcon
                      name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
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
                        trackColor={{ true: '#1a56db' }}
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
                style={styles.cancelButton}
              >
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
              navigation.navigate('AdminDepartmentEdit', { department })
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

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
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

export default DepartmentDetail;
