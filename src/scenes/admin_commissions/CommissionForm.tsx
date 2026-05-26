import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RoundedButton, MaterialIcon } from '../../components';
import AlertDialog from '../../components/AlertDialog';
import { adminCommissionsRepository, departmentsRepository, usersRepository } from '../../repositories';
import { get } from '../../repositories/authenticatedRepository';
import { convertSnakeToCamelCase } from '../../utils/convertSnakeToCamelCase';
import AdminCommission from '../../models/AdminCommission';
import Department from '../../models/Department';
import User from '../../models/User';
import { TeacherModel, TeacherModelSnakeCase } from '../../models/TeacherModel';

type CommissionFormRouteParams = {
  CommissionForm: {
    commission?: AdminCommission;
  };
};

const CommissionForm: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CommissionFormRouteParams, 'CommissionForm'>>();
  const existing = route.params?.commission;

  const [subjectName, setSubjectName] = useState(existing?.subjectName ?? '');
  const [subjectSiuId, setSubjectSiuId] = useState(existing?.subjectSiuId?.toString() ?? '');
  const [siuId, setSiuId] = useState(existing?.siuId?.toString() ?? '');
  const [chiefTeacherGraderWeight, setChiefTeacherGraderWeight] = useState(
    existing?.chiefTeacherGraderWeight?.toString() ?? '5.0'
  );
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherModel | null>(
    existing
      ? {
          id: existing.chiefTeacher.id,
          firstName: existing.chiefTeacher.firstName,
          lastName: existing.chiefTeacher.lastName,
          dni: existing.chiefTeacher.dni,
          email: existing.chiefTeacher.email,
          legajo: existing.chiefTeacher.legajo,
        }
      : null,
  );
  const [saving, setSaving] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{title: string; message: string; onConfirm?: () => void} | null>(null);

  // Teacher picker state
  const [showTeacherPicker, setShowTeacherPicker] = useState(false);
  const [teachers, setTeachers] = useState<TeacherModel[]>([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Department picker state (only shown to super admins)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(
    existing?.department ?? null,
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  useEffect(() => {
    usersRepository.getInfo().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const isSuperAdmin = currentUser?.isSuperAdmin?.() ?? false;

  useEffect(() => {
    if (!isSuperAdmin) return;
    setLoadingDepartments(true);
    departmentsRepository.fetchAll()
      .then(setDepartments)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los departamentos.'))
      .finally(() => setLoadingDepartments(false));
  }, [isSuperAdmin]);

  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId) ?? null;
  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().includes(departmentSearch.toLowerCase()),
  );

  const loadTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const data: TeacherModelSnakeCase[] = await get('api/teachers') as TeacherModelSnakeCase[];
      setTeachers(convertSnakeToCamelCase(data) as TeacherModel[]);
    } catch {
      setAlertDialog({ title: 'Error', message: 'No se pudieron cargar los docentes.' });
    } finally {
      setLoadingTeachers(false);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const search = teacherSearch.toLowerCase();
    return (
      t.firstName.toLowerCase().includes(search) ||
      t.lastName.toLowerCase().includes(search) ||
      t.legajo?.toLowerCase().includes(search) ||
      t.dni.toLowerCase().includes(search)
    );
  });

  const handleSubmit = async () => {
    if (!subjectName.trim()) {
      setAlertDialog({ title: 'Error', message: 'El nombre de la materia es obligatorio.' });
      return;
    }
    if (!subjectSiuId.trim() || isNaN(Number(subjectSiuId))) {
      setAlertDialog({ title: 'Error', message: 'El ID SIU de la materia debe ser un número válido.' });
      return;
    }
    if (!siuId.trim() || isNaN(Number(siuId))) {
      setAlertDialog({ title: 'Error', message: 'El ID SIU de la comisión debe ser un número válido.' });
      return;
    }
    if (!selectedTeacher) {
      setAlertDialog({ title: 'Error', message: 'Debés seleccionar un docente a cargo.' });
      return;
    }
    if (isSuperAdmin && selectedDepartmentId === null) {
      Alert.alert('Error', 'Debés seleccionar un departamento.');
      return;
    }

    setSaving(true);
    try {
      const data: Partial<AdminCommission> = {
        subjectName: subjectName.trim(),
        subjectSiuId: Number(subjectSiuId),
        siuId: Number(siuId),
        chiefTeacher: {
          id: selectedTeacher.id,
          firstName: selectedTeacher.firstName,
          lastName: selectedTeacher.lastName,
          dni: selectedTeacher.dni,
          email: selectedTeacher.email,
          legajo: selectedTeacher.legajo ?? '',
        },
        chiefTeacherGraderWeight: Number(chiefTeacherGraderWeight) || 5.0,
      };
      if (isSuperAdmin) {
        data.department = selectedDepartmentId;
      }

      if (existing) {
        await adminCommissionsRepository.updateCommission(existing.id, data);
        setAlertDialog({ title: 'Éxito', message: 'Comisión actualizada correctamente.', onConfirm: () => { setAlertDialog(null); navigation.goBack(); } });
      } else {
        await adminCommissionsRepository.createCommission(data);
        setAlertDialog({ title: 'Éxito', message: 'Comisión creada correctamente.', onConfirm: () => { setAlertDialog(null); navigation.goBack(); } });
      }
    } catch (error) {
      setAlertDialog({ title: 'Error', message: 'No se pudo guardar la comisión. Intente de nuevo.' });
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
          label="Nombre de la materia *"
          value={subjectName}
          onChangeText={setSubjectName}
          placeholder="Ej: Algoritmos y Programación II"
        />
        <Field
          label="ID SIU de la materia *"
          value={subjectSiuId}
          onChangeText={setSubjectSiuId}
          placeholder="Ej: 7541"
          keyboardType="numeric"
        />
        <Field
          label="ID SIU de la comisión *"
          value={siuId}
          onChangeText={setSiuId}
          placeholder="Ej: 1234"
          keyboardType="numeric"
        />

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Docente a cargo *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              loadTeachers();
              setShowTeacherPicker(true);
            }}
          >
            {selectedTeacher ? (
              <Text style={styles.pickerText}>
                {selectedTeacher.lastName}, {selectedTeacher.firstName} ({selectedTeacher.legajo})
              </Text>
            ) : (
              <Text style={styles.pickerPlaceholder}>Seleccionar docente...</Text>
            )}
            <MaterialIcon name="chevron-down" fontSize={20} color="#666" />
          </TouchableOpacity>
        </View>

        {isSuperAdmin && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Departamento *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDepartmentPicker(true)}
            >
              {selectedDepartment ? (
                <Text style={styles.pickerText}>{selectedDepartment.name}</Text>
              ) : (
                <Text style={styles.pickerPlaceholder}>Seleccionar departamento...</Text>
              )}
              <MaterialIcon name="chevron-down" fontSize={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        <Field
          label="Peso del corrector"
          value={chiefTeacherGraderWeight}
          onChangeText={setChiefTeacherGraderWeight}
          placeholder="5.0"
          keyboardType="numeric"
        />

        <RoundedButton
          text={saving ? 'Guardando...' : existing ? 'Guardar cambios' : 'Crear comisión'}
          enabled={!saving}
          onPress={handleSubmit}
          style={{}}
        />
      </ScrollView>

      <Modal visible={showDepartmentPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar departamento</Text>
            <TouchableOpacity onPress={() => setShowDepartmentPicker(false)}>
              <MaterialIcon name="close" fontSize={24} color="#333" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            placeholderTextColor="#aaa"
            value={departmentSearch}
            onChangeText={setDepartmentSearch}
          />
          {loadingDepartments ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <FlatList
              data={filteredDepartments}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.teacherItem}
                  onPress={() => {
                    setSelectedDepartmentId(item.id);
                    setShowDepartmentPicker(false);
                    setDepartmentSearch('');
                  }}
                >
                  <Text style={styles.teacherName}>{item.name}</Text>
                  {item.location ? (
                    <Text style={styles.teacherDetail}>{item.location}</Text>
                  ) : null}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.centered}>
                  <Text style={styles.emptyText}>No se encontraron departamentos.</Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>

      <Modal visible={showTeacherPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar docente</Text>
            <TouchableOpacity onPress={() => setShowTeacherPicker(false)}>
              <MaterialIcon name="close" fontSize={24} color="#333" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, legajo o DNI..."
            placeholderTextColor="#aaa"
            value={teacherSearch}
            onChangeText={setTeacherSearch}
          />
          {loadingTeachers ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <FlatList
              data={filteredTeachers}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.teacherItem}
                  onPress={() => {
                    setSelectedTeacher(item);
                    setShowTeacherPicker(false);
                    setTeacherSearch('');
                  }}
                >
                  <Text style={styles.teacherName}>
                    {item.lastName}, {item.firstName}
                  </Text>
                  <Text style={styles.teacherDetail}>
                    Legajo: {item.legajo} | DNI: {item.dni}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.centered}>
                  <Text style={styles.emptyText}>No se encontraron docentes.</Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
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
  keyboardType?: 'default' | 'numeric';
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      keyboardType={keyboardType}
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
  pickerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 15,
    color: '#111',
    flex: 1,
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: '#aaa',
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  searchInput: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  teacherItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 14,
  },
  teacherName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  teacherDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

export default CommissionForm;
