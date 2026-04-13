import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RoundedButton } from '../../components';
import { departmentsRepository } from '../../repositories';
import Department from '../../models/Department';

type DepartmentDetailRouteParams = {
  DepartmentDetail: {
    departmentId: number;
    isAdmin: boolean;
  };
};

const DepartmentDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<DepartmentDetailRouteParams, 'DepartmentDetail'>>();
  const { departmentId, isAdmin } = route.params;

  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentsRepository
      .fetchOne(departmentId)
      .then(setDepartment)
      .catch(() => Alert.alert('Error', 'No se pudo cargar el departamento.'))
      .finally(() => setLoading(false));
  }, [departmentId]);

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

      {department.procedures ? (
        <Section title="Trámites">
          <Text style={styles.bodyText}>{department.procedures}</Text>
        </Section>
      ) : null}

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
  sectionTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 15,
    color: '#222',
    lineHeight: 22,
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
});

export default DepartmentDetail;
