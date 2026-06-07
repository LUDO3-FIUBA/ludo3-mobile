import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RoundedButton, MaterialIcon } from '../../components';
import { departmentsRepository, formsRepository, usersRepository } from '../../repositories';
import AlertDialog from '../../components/AlertDialog';
import Department from '../../models/Department';
import FormOwnershipGroup from '../../models/FormOwnershipGroup';

type DepartmentFormRouteParams = {
  DepartmentForm: {
    department?: Department;
  };
};

interface PendingMembership {
  groupId: number;
  groupName: string;
  isEditor: boolean;
}

const DepartmentForm: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<DepartmentFormRouteParams, 'DepartmentForm'>>();
  const existing = route.params?.department;

  const [name, setName] = useState(existing?.name ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [schedule, setSchedule] = useState(existing?.schedule ?? '');
  const [contactInfo, setContactInfo] = useState(existing?.contactInfo ?? '');
  const [saving, setSaving] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{title: string; message: string; onConfirm?: () => void} | null>(null);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [allGroups, setAllGroups] = useState<FormOwnershipGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<PendingMembership[]>([]);
  const [showGroupPicker, setShowGroupPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const currentExisting = route.params?.department;
      setName(currentExisting?.name ?? '');
      setLocation(currentExisting?.location ?? '');
      setSchedule(currentExisting?.schedule ?? '');
      setContactInfo(currentExisting?.contactInfo ?? '');

      Promise.all([
        usersRepository.getInfo(),
        formsRepository.fetchOwnershipGroups(),
      ]).then(([user, groups]) => {
        const superAdmin = user.isSuperAdmin?.() ?? false;
        setIsSuperAdmin(superAdmin);
        setAllGroups(groups);
        if (superAdmin && currentExisting) {
          setSelectedGroups(
            (currentExisting.ownershipGroups ?? []).map(m => ({
              groupId: m.groupId,
              groupName: m.groupName,
              isEditor: m.isEditor,
            })),
          );
        }
      }).catch(() => {});
    }, [route.params]),
  );

  useEffect(() => {
    const title = existing ? 'Editar Departamento' : 'Nuevo Departamento';
    const options: Record<string, any> = { title };
    if (Platform.OS === 'web') {
      options.headerLeft = () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminDepartmentList')}
          style={styles.backButton}
        >
          <MaterialIcon name="arrow-left" fontSize={24} color="#333" />
        </TouchableOpacity>
      );
    }
    navigation.setOptions(options);
  }, [navigation, existing]);

  const toggleGroup = (group: FormOwnershipGroup) => {
    setSelectedGroups(prev => {
      const exists = prev.find(p => p.groupId === group.id);
      if (exists) return prev.filter(p => p.groupId !== group.id);
      return [...prev, { groupId: group.id, groupName: group.name, isEditor: false }];
    });
  };

  const toggleEditor = (groupId: number) => {
    setSelectedGroups(prev =>
      prev.map(p => (p.groupId === groupId ? { ...p, isEditor: !p.isEditor } : p)),
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setAlertDialog({ title: 'Error', message: 'El nombre del departamento es obligatorio.' });
      return;
    }

    setSaving(true);
    try {
      const data = { name: name.trim(), location, schedule, contactInfo };
      if (existing) {
        await departmentsRepository.updateDepartment(existing.id, data);
        if (isSuperAdmin) {
          await departmentsRepository.updateMemberships(
            existing.id,
            selectedGroups.map(g => ({ groupId: g.groupId, isEditor: g.isEditor })),
          );
        }
        setAlertDialog({ title: 'Éxito', message: 'Departamento actualizado correctamente.' });
        navigation.goBack();
      } else {
        const created = await departmentsRepository.createDepartment(data);
        if (isSuperAdmin && selectedGroups.length > 0) {
          await departmentsRepository.updateMemberships(
            created.id,
            selectedGroups.map(g => ({ groupId: g.groupId, isEditor: g.isEditor })),
          );
        }
        setAlertDialog({ title: 'Éxito', message: 'Departamento creado correctamente.'});
        navigation.navigate('AdminDepartmentList');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.detail ?? 'No se pudo guardar el departamento. Intente de nuevo.';
      setAlertDialog({ title: 'Error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Field
          label="Nombre *"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Departamento de Computación"
        />
        <Field
          label="Ubicación"
          value={location}
          onChangeText={setLocation}
          placeholder="Ej: Pabellón I, Planta Baja"
        />
        <Field
          label="Horario de atención"
          value={schedule}
          onChangeText={setSchedule}
          placeholder="Ej: Lunes a Viernes de 10 a 17hs"
          multiline
          numberOfLines={3}
        />
        <Field
          label="Información de contacto"
          value={contactInfo}
          onChangeText={setContactInfo}
          placeholder="Ej: departamento@fi.uba.ar | (011) 5285-0000"
          multiline
          numberOfLines={3}
        />

        {isSuperAdmin && (
          <View style={styles.fieldContainer}>
            <TouchableOpacity
              style={styles.groupPickerHeader}
              onPress={() => setShowGroupPicker(prev => !prev)}
              activeOpacity={0.7}
            >
              <Text style={styles.label}>Grupos de propiedad</Text>
              <MaterialIcon
                name={showGroupPicker ? 'chevron-up' : 'chevron-down'}
                fontSize={18}
                color="#555"
              />
            </TouchableOpacity>

            {selectedGroups.length > 0 && !showGroupPicker && (
              <Text style={styles.groupSummary}>
                {selectedGroups.map(g => g.groupName).join(', ')}
              </Text>
            )}

            {showGroupPicker && (
              <View style={styles.groupPickerDropdown}>
                {allGroups.length === 0 ? (
                  <Text style={styles.emptyText}>No hay grupos disponibles</Text>
                ) : (
                  allGroups.map(g => {
                    const membership = selectedGroups.find(p => p.groupId === g.id);
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
                  })
                )}
              </View>
            )}
          </View>
        )}

        <RoundedButton
          text={saving ? 'Guardando...' : existing ? 'Guardar cambios' : 'Crear departamento'}
          enabled={!saving}
          onPress={handleSubmit}
          style={{}}
        />
      </ScrollView>
      <AlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={alertDialog?.onConfirm ?? (() => setAlertDialog(null))}
      />
    </KeyboardAvoidingView>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  multilineInput: {
    minHeight: 80,
    paddingTop: 10,
  },
  backButton: {
    marginLeft: 16,
    padding: 4,
  },
  groupPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  groupSummary: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 4,
  },
  groupPickerDropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  groupEditRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    marginTop: 6,
    paddingLeft: 30,
  },
  editorToggleLabel: {
    fontSize: 13,
    color: '#555',
    marginRight: 8,
  },
  emptyText: {
    padding: 12,
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
});

export default DepartmentForm;
