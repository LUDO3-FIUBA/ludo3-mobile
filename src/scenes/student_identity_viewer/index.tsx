import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { fetchIdentityByToken, StudentIdentity, CredentialExpired } from '../../repositories/studentIdentity';
import { MaterialIcon } from '../../components';
import { lightModeColors } from '../../styles/colorPalette';

type ViewerRouteParams = {
  StudentIdentityViewer: { token: string };
};

const LUDO_GREEN  = '#27AE60';
const LUDO_YELLOW = '#F2C14E';
const LUDO_BLUE   = '#2980B9';
const LUDO_RED    = '#E74C3C';
const LUDO_DARK   = '#1E2D3D';

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
    <ScrollView contentContainerStyle={styles.page}>
      {/* Card */}
      <View style={styles.card}>

        {/* Header: cuatro cuadrantes estilo LUDO */}
        <View style={styles.quadrantHeader}>
          <View style={[styles.quadrant, { backgroundColor: LUDO_GREEN, borderTopLeftRadius: 16 }]} />
          <View style={[styles.quadrant, { backgroundColor: LUDO_YELLOW, borderTopRightRadius: 16 }]} />
          <View style={[styles.quadrant, { backgroundColor: LUDO_BLUE, borderBottomLeftRadius: 0 }]} />
          <View style={[styles.quadrant, { backgroundColor: LUDO_RED, borderBottomRightRadius: 0 }]} />
          {/* Separador central oscuro */}
          <View style={styles.quadrantCenterH} />
          <View style={styles.quadrantCenterV} />
          {/* Foto centrada encima */}
          <View style={styles.photoWrapper}>
            {identity.image ? (
              <Image source={{ uri: identity.image }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialIcon name="account" fontSize={56} color="#aaa" />
              </View>
            )}
          </View>
        </View>

        {/* Cuerpo de la credencial */}
        <View style={styles.body}>
          <View style={styles.validBadge}>
            <MaterialIcon name="check-circle" fontSize={16} color={LUDO_GREEN} />
            <Text style={[styles.validText, { color: LUDO_GREEN }]}>Credencial válida</Text>
          </View>

          <Text style={styles.name}>{identity.firstName} {identity.lastName}</Text>
          <Text style={styles.subtitle}>Alumno — FIUBA</Text>

          <View style={styles.divider} />

          <View style={styles.dataRow}>
            <View style={[styles.dataBlock, { borderLeftColor: LUDO_BLUE }]}>
              <Text style={styles.dataLabel}>PADRÓN</Text>
              <Text style={styles.dataValue}>{identity.padron}</Text>
            </View>
            <View style={[styles.dataBlock, { borderLeftColor: LUDO_RED }]}>
              <Text style={styles.dataLabel}>DNI</Text>
              <Text style={styles.dataValue}>{identity.dni}</Text>
            </View>
          </View>
        </View>

        {/* Footer con logo LUDO */}
        <View style={styles.footer}>
          <View style={styles.footerDots}>
            <View style={[styles.dot, { backgroundColor: LUDO_GREEN }]} />
            <View style={[styles.dot, { backgroundColor: LUDO_YELLOW }]} />
            <View style={[styles.dot, { backgroundColor: LUDO_BLUE }]} />
            <View style={[styles.dot, { backgroundColor: LUDO_RED }]} />
          </View>
          <Text style={styles.footerText}>LUDO · FIUBA</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f0f2f5',
  },
  errorBackground: {
    backgroundColor: '#c0392b',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  /* Cuadrantes */
  quadrantHeader: {
    height: 160,
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
  },
  quadrant: {
    width: '50%',
    height: '50%',
  },
  quadrantCenterH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 4,
    marginTop: -2,
    backgroundColor: LUDO_DARK,
  },
  quadrantCenterV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 4,
    marginLeft: -2,
    backgroundColor: LUDO_DARK,
  },
  photoWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    left: 0,
    right: 0,
    bottom: -44,
    alignItems: 'center',
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: 'white',
  },
  photoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#e8e8e8',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Cuerpo */
  body: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  validText: {
    fontSize: 13,
    fontWeight: '600',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: LUDO_DARK,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    marginBottom: 16,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e8e8e8',
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  dataBlock: {
    flex: 1,
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  dataValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LUDO_DARK,
    marginTop: 2,
  },
  /* Footer */
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerDots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footerText: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '600',
    letterSpacing: 1,
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
