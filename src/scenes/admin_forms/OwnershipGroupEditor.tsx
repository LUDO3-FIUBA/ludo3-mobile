import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcon, RoundedButton } from '../../components';
import { formsRepository, usersRepository } from '../../repositories';
import { EligibleEntity, EntityType, GroupMember, OwnershipMemberInput } from '../../models/FormOwnershipGroup';
import User from '../../models/User';
import { StatusCodeError } from '../../networking';
import { lightModeColors } from '../../styles/colorPalette';

type SubmitStatus = { type: 'success' | 'error'; message: string };

const OwnershipGroupEditor: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingGroupId: number | undefined = route.params?.groupId;
  const isEditing = typeof editingGroupId === 'number';

  const [loadingData, setLoadingData] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [groupName, setGroupName] = useState('');
  const [eligibleEntities, setEligibleEntities] = useState<EligibleEntity[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<OwnershipMemberInput[]>([]);

  const [saving, setSaving] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);

  useEffect(() => {
    setLoadingData(true);
    setGroupName('');
    setSelectedMembers([]);
    setSubmitStatus(null);

    const loads: Promise<unknown>[] = [
      formsRepository.fetchEligibleEntities(),
      usersRepository.getInfo(),
    ];
    if (isEditing) {
      loads.push(formsRepository.fetchOwnershipGroup(editingGroupId));
    }
    Promise.all(loads)
      .then(([entities, user, detail]) => {
        setEligibleEntities(entities as EligibleEntity[]);
        setCurrentUser(user as User);
        if (detail) {
          const d = detail as { name: string; members: GroupMember[] };
          setGroupName(d.name);
          setSelectedMembers(
            d.members.map(m => ({
              entity_type: m.entity_type,
              entity_id: m.entity_id,
              is_editor: m.is_editor,
            })),
          );
        }
      })
      .catch(() => {
        if (Platform.OS === 'web') {
          window.alert('Error\n\nNo se pudo cargar la información.');
        } else {
          Alert.alert('Error', 'No se pudo cargar la información.');
        }
      })
      .finally(() => setLoadingData(false));
  }, [isEditing, editingGroupId]);

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
    });
  }, [navigation]);

  const toggleMember = (entity: EligibleEntity) => {
    const key = `${entity.entity_type}:${entity.entity_id}`;
    setSelectedMembers(prev => {
      const exists = prev.find(m => `${m.entity_type}:${m.entity_id}` === key);
      if (exists) {
        return prev.filter(m => `${m.entity_type}:${m.entity_id}` !== key);
      }
      return [...prev, { entity_type: entity.entity_type, entity_id: entity.entity_id, is_editor: false }];
    });
  };

  const toggleEditor = (entity: EligibleEntity) => {
    const key = `${entity.entity_type}:${entity.entity_id}`;
    setSelectedMembers(prev =>
      prev.map(m =>
        `${m.entity_type}:${m.entity_id}` === key ? { ...m, is_editor: !m.is_editor } : m,
      ),
    );
  };

  const extractApiError = (err: unknown): string => {
    if (err instanceof StatusCodeError && err.info && err.info !== '<not available>') {
      const info = err.info;
      if (typeof info === 'string') return info;
      const messages = Object.values(info as Record<string, unknown>)
        .flat()
        .filter((v): v is string => typeof v === 'string');
      if (messages.length) return messages.join('\n');
    }
    return 'No se pudo guardar el grupo. Verificá los datos e intentá nuevamente.';
  };

  const isSuperAdmin = currentUser?.isSuperAdmin?.() ?? false;
  const userEntityType: EntityType | null = currentUser?.departmentId
    ? 'department'
    : currentUser?.secretaryId ? 'secretary' : null;
  const userEntityId: number | null = currentUser?.departmentId ?? currentUser?.secretaryId ?? null;

  const handleSave = async () => {
    if (!groupName.trim()) {
      setSubmitStatus({ type: 'error', message: 'El nombre del grupo es obligatorio.' });
      return;
    }
    if (isSuperAdmin && selectedMembers.length > 0 && !selectedMembers.some(m => m.is_editor)) {
      setSubmitStatus({ type: 'error', message: 'Al menos un miembro debe tener rol de editor.' });
      return;
    }
    setSaving(true);
    setSubmitStatus(null);
    try {
      if (isEditing) {
        await formsRepository.updateOwnershipGroup(editingGroupId, groupName.trim(), selectedMembers);
      } else {
        await formsRepository.createOwnershipGroup(groupName.trim(), selectedMembers);
      }
      setSubmitStatus({
        type: 'success',
        message: isEditing ? 'Grupo actualizado correctamente.' : 'Grupo creado correctamente.',
      });
      setTimeout(() => navigation.navigate('FormsManager'), 1500);
    } catch (err) {
      setSubmitStatus({ type: 'error', message: extractApiError(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del grupo</Text>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={groupName}
          onChangeText={text => {
            setGroupName(text);
            if (submitStatus?.type === 'error') setSubmitStatus(null);
          }}
          maxLength={100}
          placeholder="ej: Trámites de Alumnos"
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Miembros</Text>

        {isSuperAdmin ? (
          <>
            <View style={styles.editorWarningBanner}>
              <MaterialIcon name="alert-circle" fontSize={15} color="#92400E" />
              <Text style={styles.editorWarningText}>
                Al menos un miembro debe tener rol de{' '}
                <Text style={styles.editorWarningBold}>Editor</Text> para poder guardar.
              </Text>
            </View>

            {eligibleEntities.length === 0 ? (
              <Text style={styles.emptyText}>No hay departamentos ni secretarías disponibles.</Text>
            ) : (
              eligibleEntities.map(entity => {
                const key = `${entity.entity_type}:${entity.entity_id}`;
                const member = selectedMembers.find(m => `${m.entity_type}:${m.entity_id}` === key);
                const isSelected = !!member;
                const isSubsecretary =
                  entity.entity_type === 'secretary' && !!entity.parent_secretary_name;

                return (
                  <View key={key} style={[styles.entityRow, isSelected && styles.entityRowSelected]}>
                    <TouchableOpacity
                      style={styles.entityRowMain}
                      onPress={() => toggleMember(entity)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.entityCheckbox, isSelected && styles.entityCheckboxChecked]}>
                        {isSelected && <MaterialIcon name="check" fontSize={14} color="white" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.entityName}>{entity.name}</Text>
                        <Text style={styles.entityType}>
                          {entity.entity_type === 'department'
                            ? 'Departamento'
                            : isSubsecretary
                            ? `Subsecretaría · depende de ${entity.parent_secretary_name}`
                            : 'Secretaría'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {isSelected && (
                      <TouchableOpacity
                        style={styles.editorToggleRow}
                        onPress={() => toggleEditor(entity)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.editorCheckbox, member.is_editor && styles.editorCheckboxChecked]}>
                          {member.is_editor && <MaterialIcon name="check" fontSize={14} color="white" />}
                        </View>
                        <Text style={styles.editorToggleLabel}>Editor</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            <View style={styles.readOnlyBanner}>
              <MaterialIcon name="information" fontSize={15} color="#1e40af" />
              <Text style={styles.readOnlyBannerText}>
                Los miembros se asignan automáticamente según tu perfil.
              </Text>
            </View>

            {eligibleEntities.map(entity => {
              const key = `${entity.entity_type}:${entity.entity_id}`;
              const isSubsecretary = entity.entity_type === 'secretary' && !!entity.parent_secretary_name;
              const willBeEditor =
                entity.entity_type === userEntityType && entity.entity_id === userEntityId;

              return (
                <View key={key} style={[styles.entityRow, styles.entityRowSelected]}>
                  <View style={styles.entityRowMain}>
                    <View style={[styles.entityCheckbox, styles.entityCheckboxChecked]}>
                      <MaterialIcon name="check" fontSize={14} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entityName}>{entity.name}</Text>
                      <Text style={styles.entityType}>
                        {entity.entity_type === 'department'
                          ? 'Departamento'
                          : isSubsecretary
                          ? `Subsecretaría · depende de ${entity.parent_secretary_name}`
                          : 'Secretaría'}
                      </Text>
                    </View>
                    <MaterialIcon name="lock" fontSize={14} color="#6d28d9" />
                  </View>
                  <View style={[styles.editorToggleRow, { opacity: 0.6 }]}>
                    <View style={[styles.editorCheckbox, willBeEditor && styles.editorCheckboxChecked]}>
                      {willBeEditor && <MaterialIcon name="check" fontSize={14} color="white" />}
                    </View>
                    <Text style={styles.editorToggleLabel}>Editor</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>

      {submitStatus ? (
        <View
          style={[
            styles.statusCard,
            submitStatus.type === 'success' ? styles.statusCardSuccess : styles.statusCardError,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              submitStatus.type === 'success' ? styles.statusTextSuccess : styles.statusTextError,
            ]}
          >
            {submitStatus.message}
          </Text>
        </View>
      ) : null}

      <View style={styles.buttonWrapper}>
        <RoundedButton
          text={saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear grupo'}
          enabled={!saving}
          onPress={handleSave}
        />
        {saving ? (
          <View pointerEvents="none" style={styles.buttonSpinnerOverlay}>
            <ActivityIndicator color="white" />
          </View>
        ) : null}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16, gap: 16 },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: lightModeColors.institutional,
    marginBottom: 2,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#444' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#fafafa',
  },
  emptyText: { color: '#888', fontSize: 14 },
  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 10,
  },
  readOnlyBannerText: { flex: 1, fontSize: 13, color: '#1e3a8a', lineHeight: 18 },
  editorWarningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
  },
  editorWarningText: { flex: 1, fontSize: 13, color: '#78350F', lineHeight: 18 },
  editorWarningBold: { fontWeight: '700' },
  entityRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    gap: 8,
    backgroundColor: '#fafafa',
  },
  entityRowSelected: {
    borderColor: lightModeColors.institutional,
    backgroundColor: '#F0F4FF',
  },
  entityRowMain: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  entityCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entityCheckboxChecked: {
    backgroundColor: lightModeColors.institutional,
    borderColor: lightModeColors.institutional,
  },
  entityName: { fontSize: 14, fontWeight: '600', color: '#222' },
  entityType: { fontSize: 12, color: '#888', marginTop: 1 },
  editorToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
    paddingLeft: 32,
    borderTopWidth: 1,
    borderTopColor: '#e0e8ff',
  },
  editorToggleLabel: { fontSize: 13, fontWeight: '600', color: '#444' },
  editorCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorCheckboxChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  statusCard: { borderRadius: 8, padding: 12 },
  statusCardSuccess: { backgroundColor: '#DCFCE7' },
  statusCardError: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 14, fontWeight: '500' },
  statusTextSuccess: { color: '#166534' },
  statusTextError: { color: '#991B1B' },
  buttonWrapper: { position: 'relative' },
  buttonSpinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});

export default OwnershipGroupEditor;
