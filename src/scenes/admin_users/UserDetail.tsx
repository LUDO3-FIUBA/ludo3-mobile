import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RoundedButton } from '../../components';
import { adminUsersRepository } from '../../repositories';
import AdminUser from '../../models/AdminUser';

type UserDetailRouteParams = {
  UserDetail: {
    userId: number;
  };
};

const UserDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<UserDetailRouteParams, 'UserDetail'>>();
  const { userId } = route.params;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [padron, setPadron] = useState('');
  const [legajo, setLegajo] = useState('');

  // Promotion fields
  const [newLegajo, setNewLegajo] = useState('');
  const [newPadron, setNewPadron] = useState('');

  const loadUser = async () => {
    try {
      const data = await adminUsersRepository.fetchOne(userId);
      setUser(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setEmail(data.email);
      setDni(data.dni);
      setPadron(data.padron ?? '');
      setLegajo(data.legajo ?? '');
    } catch {
      Alert.alert('Error', 'No se pudo cargar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  const handleSave = async () => {
    if (!user) return;

    const changes: Record<string, any> = {};

    if (firstName !== user.firstName) changes.firstName = firstName;
    if (lastName !== user.lastName) changes.lastName = lastName;
    if (email !== user.email) changes.email = email;
    if (dni !== user.dni) changes.dni = dni;
    if (user.isStudent && padron !== (user.padron ?? '')) changes.padron = padron;
    if (user.isTeacher && legajo !== (user.legajo ?? '')) changes.legajo = legajo;

    if (Object.keys(changes).length === 0) {
      Alert.alert('Sin cambios', 'No se realizaron modificaciones.');
      return;
    }

    setSaving(true);
    try {
      const updated = await adminUsersRepository.updateUser(userId, changes);
      setUser(updated);
      Alert.alert('Éxito', 'Usuario actualizado correctamente.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handlePromoteToTeacher = async () => {
    if (!newLegajo.trim()) {
      Alert.alert('Error', 'El legajo es obligatorio para promover a docente.');
      return;
    }

    Alert.alert(
      'Promover a docente',
      `¿Estás seguro de que querés agregar el rol de docente a este usuario?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setSaving(true);
            try {
              const updated = await adminUsersRepository.updateUser(userId, {
                promoteToTeacher: true,
                newLegajo: newLegajo.trim(),
              });
              setUser(updated);
              setLegajo(updated.legajo ?? '');
              setNewLegajo('');
              Alert.alert('Éxito', 'Usuario promovido a docente correctamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo promover al usuario.');
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const handlePromoteToStudent = async () => {
    if (!newPadron.trim()) {
      Alert.alert('Error', 'El padrón es obligatorio para promover a estudiante.');
      return;
    }

    Alert.alert(
      'Promover a estudiante',
      `¿Estás seguro de que querés agregar el rol de estudiante a este usuario?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setSaving(true);
            try {
              const updated = await adminUsersRepository.updateUser(userId, {
                promoteToStudent: true,
                newPadron: newPadron.trim(),
              });
              setUser(updated);
              setPadron(updated.padron ?? '');
              setNewPadron('');
              Alert.alert('Éxito', 'Usuario promovido a estudiante correctamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo promover al usuario.');
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Usuario no encontrado.</Text>
      </View>
    );
  }

  const isAdmin = user.isStaff;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Role badges */}
        <View style={styles.badgeRow}>
          {user.isStudent && (
            <View style={[styles.badge, styles.badgeStudent]}>
              <Text style={styles.badgeText}>Estudiante</Text>
            </View>
          )}
          {user.isTeacher && (
            <View style={[styles.badge, styles.badgeTeacher]}>
              <Text style={styles.badgeText}>Docente</Text>
            </View>
          )}
          {user.isStaff && (
            <View style={[styles.badge, styles.badgeAdmin]}>
              <Text style={styles.badgeText}>Admin</Text>
            </View>
          )}
        </View>

        {isAdmin && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Los usuarios administradores son de solo lectura.
            </Text>
          </View>
        )}

        {/* User fields */}
        <Field
          label="Nombre"
          value={firstName}
          onChangeText={setFirstName}
          editable={!isAdmin}
        />
        <Field
          label="Apellido"
          value={lastName}
          onChangeText={setLastName}
          editable={!isAdmin}
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          editable={!isAdmin}
          keyboardType="email-address"
        />
        <Field
          label="DNI"
          value={dni}
          onChangeText={setDni}
          editable={!isAdmin}
          keyboardType="numeric"
        />

        {user.isStudent && (
          <Field
            label="Padrón"
            value={padron}
            onChangeText={setPadron}
            editable={!isAdmin}
          />
        )}

        {user.isTeacher && (
          <Field
            label="Legajo"
            value={legajo}
            onChangeText={setLegajo}
            editable={!isAdmin}
          />
        )}

        {!isAdmin && (
          <RoundedButton
            text={saving ? 'Guardando...' : 'Guardar cambios'}
            enabled={!saving}
            onPress={handleSave}
            style={{}}
          />
        )}

        {/* Promotion sections */}
        {!isAdmin && !user.isTeacher && (
          <View style={styles.promotionSection}>
            <Text style={styles.promotionTitle}>Agregar rol de docente</Text>
            <Field
              label="Legajo del nuevo docente *"
              value={newLegajo}
              onChangeText={setNewLegajo}
              placeholder="Ej: 12345"
            />
            <RoundedButton
              text={saving ? 'Promoviendo...' : 'Promover a docente'}
              enabled={!saving}
              onPress={handlePromoteToTeacher}
              style={{}}
            />
          </View>
        )}

        {!isAdmin && !user.isStudent && (
          <View style={styles.promotionSection}>
            <Text style={styles.promotionTitle}>Agregar rol de estudiante</Text>
            <Field
              label="Padrón del nuevo estudiante *"
              value={newPadron}
              onChangeText={setNewPadron}
              placeholder="Ej: 108765"
            />
            <RoundedButton
              text={saving ? 'Promoviendo...' : 'Promover a estudiante'}
              enabled={!saving}
              onPress={handlePromoteToStudent}
              style={{}}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  editable = true,
  placeholder,
  keyboardType,
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.inputDisabled]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      keyboardType={keyboardType}
    />
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
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  badgeStudent: {
    backgroundColor: '#dbeafe',
  },
  badgeTeacher: {
    backgroundColor: '#dcfce7',
  },
  badgeAdmin: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
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
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  promotionSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  promotionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 14,
  },
});

export default UserDetail;
