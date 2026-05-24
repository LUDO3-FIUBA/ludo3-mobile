import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RoundedButton, MaterialIcon} from '../../components';
import {secretariesRepository} from '../../repositories';
import Secretary from '../../models/Secretary';

type SecretaryDetailRouteParams = {
  AdminSecretaryDetail: {
    secretaryId: number;
    isAdmin: boolean;
  };
};

const SecretaryDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<SecretaryDetailRouteParams, 'AdminSecretaryDetail'>>();
  const {secretaryId, isAdmin} = route.params;

  const [secretary, setSecretary] = useState<Secretary | null>(null);
  const [parentName, setParentName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    secretariesRepository
      .fetchOne(secretaryId)
      .then(setSecretary)
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
