import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Appearance,
  Linking,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import { usersRepository } from '../../repositories';
import { fetchMyIdentityLink } from '../../repositories/studentIdentity';
import User from '../../models/User';
import { darkModeColors, lightModeColors } from '../../styles/colorPalette';
import { MaterialIcon } from '../../components';

const StudentCredentialScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const colors = Appearance.getColorScheme() === 'dark' ? darkModeColors : lightModeColors;
  const [user, setUser] = useState<User | null>(null);
  const [identityUrl, setIdentityUrl] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState(false);

  const openPublicCredential = useCallback(async () => {
    setLinkLoading(true);
    setLinkError(false);
    try {
      // Reusamos el link ya cargado para el QR; si no está, lo pedimos.
      const url = identityUrl ?? (await fetchMyIdentityLink()).url;
      if (Platform.OS === 'web') {
        await Linking.openURL(url);
      } else {
        // En nativo el link apunta a FRONTEND_BASE_URL (p. ej. localhost:8081),
        // que no es alcanzable desde el dispositivo/emulador y no se rutea al
        // viewer in-app. Extraemos el token y abrimos el viewer directamente:
        // este consulta la API por API_URL, que sí es alcanzable.
        const token = url.match(/\/credencial\/(.+)$/)?.[1];
        if (!token) throw new Error('No token in identity link');
        navigation.navigate('StudentIdentityViewer', { token });
      }
    } catch {
      setLinkError(true);
    } finally {
      setLinkLoading(false);
    }
  }, [navigation, identityUrl]);

  const loadQR = useCallback(async () => {
    setQrLoading(true);
    setQrError(false);
    try {
      // El QR se renderiza en el cliente a partir del identity link. Así
      // evitamos el fetch binario (blob + FileReader), poco confiable en RN.
      const { url } = await fetchMyIdentityLink();
      setIdentityUrl(url);
    } catch {
      setQrError(true);
    } finally {
      setQrLoading(false);
    }
  }, []);

  useEffect(() => {
    const userPromise = usersRepository.getInfo().then(setUser).catch(() => {});
    const qrPromise = loadQR();
    Promise.all([userPromise, qrPromise]).finally(() => setInitialLoading(false));
  }, []);

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.institutional} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.qrArea}>
        {qrLoading ? (
          <ActivityIndicator size="large" color={colors.institutional} />
        ) : qrError ? (
          <View style={styles.errorBox}>
            <MaterialIcon name="alert-circle-outline" fontSize={48} color={colors.failed} />
            <Text style={[styles.errorText, { color: colors.failed }]}>
              No se pudo cargar el QR
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.institutional }]}
              onPress={loadQR}
            >
              <Text style={styles.buttonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : identityUrl ? (
          <QRCode value={identityUrl} size={240} quietZone={10} />
        ) : null}
      </View>

      <Text style={styles.expiry}>Este QR expira en 24 horas</Text>

      {user && (
        <View style={styles.infoCard}>
          <Text style={styles.name}>{user.fullName()}</Text>
          <View style={styles.detailRow}>
            <MaterialIcon name="card-account-details-outline" fontSize={18} color={colors.darkGray} />
            <Text style={styles.detail}>DNI: {user.dni}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcon name="school-outline" fontSize={18} color={colors.darkGray} />
            <Text style={styles.detail}>Padrón: {user.studentId}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.institutional }, qrLoading && styles.buttonDisabled]}
        onPress={loadQR}
        disabled={qrLoading}
      >
        <MaterialIcon name="refresh" fontSize={18} color="white" style={{ marginRight: 6 }} />
        <Text style={styles.buttonText}>Actualizar QR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.linkButton, linkLoading && styles.buttonDisabled]}
        onPress={openPublicCredential}
        disabled={linkLoading}
      >
        {linkLoading ? (
          <ActivityIndicator size="small" color={colors.institutional} style={{ marginRight: 6 }} />
        ) : (
          <MaterialIcon name="open-in-new" fontSize={18} color={colors.institutional} style={{ marginRight: 6 }} />
        )}
        <Text style={[styles.buttonText, { color: colors.institutional }]}>Abrir credencial pública</Text>
      </TouchableOpacity>

      {linkError && (
        <Text style={styles.linkErrorText}>No se pudo obtener el enlace. Intentá nuevamente.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  qrArea: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  qrImage: {
    width: 260,
    height: 260,
  },
  errorBox: {
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
  },
  expiry: {
    fontSize: 13,
    color: '#888',
    marginBottom: 24,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    gap: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detail: {
    fontSize: 15,
    color: '#444',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  linkButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#888',
    marginTop: 8,
  },
  linkErrorText: {
    fontSize: 13,
    color: '#c0392b',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default StudentCredentialScreen;
