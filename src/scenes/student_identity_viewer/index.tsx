import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { fetchIdentityByToken, StudentIdentity, CredentialExpired } from '../../repositories/studentIdentity';
import { MaterialIcon } from '../../components';
import { lightModeColors } from '../../styles/colorPalette';

type ViewerRouteParams = {
  StudentIdentityViewer: { token: string };
};

const StudentIdentityViewerScreen: React.FC = () => {
  const route = useRoute<RouteProp<ViewerRouteParams, 'StudentIdentityViewer'>>();
  const { token } = route.params;

  const [identity, setIdentity] = useState<StudentIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    fetchIdentityByToken(token)
      .then(setIdentity)
      .catch(e => {
        if (e instanceof CredentialExpired) setExpired(true);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={lightModeColors.institutional} />
      </View>
    );
  }

  if (expired || !identity) {
    return (
      <View style={[styles.center, styles.errorBackground]}>
        <MaterialIcon name="alert-circle" fontSize={72} color="white" />
        <Text style={styles.expiredTitle}>Credencial inválida o expirada</Text>
        <Text style={styles.expiredSubtitle}>El alumno debe generar un nuevo QR</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.validBackground]}>
      <MaterialIcon name="check-circle" fontSize={52} color="white" />

      {identity.image ? (
        <Image source={{ uri: identity.image }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <MaterialIcon name="account" fontSize={80} color="#ccc" />
        </View>
      )}

      <Text style={styles.name}>{identity.firstName} {identity.lastName}</Text>

      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>DNI</Text>
          <Text style={styles.detailValue}>{identity.dni}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Padrón</Text>
          <Text style={styles.detailValue}>{identity.padron}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 20,
  },
  validBackground: {
    backgroundColor: '#1a8f4a',
  },
  errorBackground: {
    backgroundColor: '#c0392b',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  detailCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  expiredTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
  },
  expiredSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default StudentIdentityViewerScreen;
