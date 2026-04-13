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
import { adminCommissionsRepository } from '../../repositories';
import AdminCommission from '../../models/AdminCommission';

type CommissionDetailRouteParams = {
  CommissionDetail: {
    commissionId: number;
  };
};

const CommissionDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CommissionDetailRouteParams, 'CommissionDetail'>>();
  const { commissionId } = route.params;

  const [commission, setCommission] = useState<AdminCommission | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCommission = async () => {
    try {
      const data = await adminCommissionsRepository.fetchOne(commissionId);
      setCommission(data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar la comisión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommission();
    const unsubscribe = navigation.addListener('focus', loadCommission);
    return unsubscribe;
  }, [commissionId, navigation]);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar comisión',
      `¿Estás seguro de que querés eliminar la comisión de "${commission?.subjectName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminCommissionsRepository.deleteCommission(commissionId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la comisión.');
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

  if (!commission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Comisión no encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{commission.subjectName}</Text>

      <Section title="ID SIU de Materia">
        <Text style={styles.bodyText}>{commission.subjectSiuId}</Text>
      </Section>

      <Section title="ID SIU de Comisión">
        <Text style={styles.bodyText}>{commission.siuId}</Text>
      </Section>

      <Section title="Docente a cargo">
        <Text style={styles.bodyText}>
          {commission.chiefTeacher.lastName}, {commission.chiefTeacher.firstName}
        </Text>
        <Text style={styles.secondaryText}>{commission.chiefTeacher.email}</Text>
        <Text style={styles.secondaryText}>Legajo: {commission.chiefTeacher.legajo}</Text>
      </Section>

      <Section title="Peso del corrector (jefe de cátedra)">
        <Text style={styles.bodyText}>{commission.chiefTeacherGraderWeight}</Text>
      </Section>

      <View style={styles.adminActions}>
        <RoundedButton
          text="Editar"
          onPress={() =>
            navigation.navigate('AdminCommissionEdit', { commission })
          }
          style={{}}
        />
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
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
  secondaryText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
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

export default CommissionDetail;
