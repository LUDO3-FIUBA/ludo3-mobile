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
import { secretariesRepository } from '../../repositories';
import Secretary from '../../models/Secretary';

type SecretaryDetailRouteParams = {
  SecretaryDetail: {
    secretaryId: number;
    isAdmin: boolean;
  };
};

const SecretaryDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<SecretaryDetailRouteParams, 'SecretaryDetail'>>();
  const { secretaryId, isAdmin } = route.params;

  const [secretary, setSecretary] = useState<Secretary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    secretariesRepository
      .fetchOne(secretaryId)
      .then(setSecretary)
      .catch(() => Alert.alert('Error', 'No se pudo cargar la secretaría.'))
      .finally(() => setLoading(false));
  }, [secretaryId]);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar secretaría',
      `¿Estás seguro de que querés eliminar "${secretary?.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
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
                navigation.navigate('AdminSecretaryDetail', { secretaryId: sub.id, isAdmin })
              }
            >
              <Text style={styles.subItemName}>{sub.name}</Text>
              {sub.location ? <Text style={styles.subItemLocation}>{sub.location}</Text> : null}
            </TouchableOpacity>
          ))}
        </Section>
      ) : null}

      {isAdmin && (
        <View style={styles.adminActions}>
          <RoundedButton
            text="Editar"
            onPress={() =>
              navigation.navigate('AdminSecretaryEdit', { secretary })
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
  subItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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

export default SecretaryDetail;
