import React, { useState } from 'react';
import { View, Alert, Image, StyleSheet, Text, Modal, TextInput, TouchableOpacity } from 'react-native';
import { authorize } from 'react-native-app-auth';
import { RoundedButton } from '../../components';
import { landing as style } from '../../styles';
import { authenticationRepository, usersRepository } from '../../repositories';
import SessionManager from '../../managers/sessionManager';
import { lightModeColors } from '../../styles/colorPalette';
const LudoIcon = require('../../assets/ludo_icon.png');

interface Props {
  navigation: any;
}

const Landing = ({ navigation }: Props) => {
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [showDniModal, setShowDniModal] = useState(false);
  const [dni, setDni] = useState('');
  const redirectUrl = 'org.erinc.ludo://oauth';

  const handleLogin = async () => {
    setLoginInProgress(true);
    const config = {
      issuer: 'https://auth.fi.uba.ar/',
      clientId: 'ed6fdc77-51b0-4828-be5d-37d23d1b6880',
      redirectUrl,
      scopes: ['openid', 'profile', 'email'],
      response_type: 'code',
      skipCodeExchange: true,
      usePKCE: false,
      additionalParameters: {},
    };

    console.log('[Login] Starting OAuth flow with config:', JSON.stringify(config, null, 2));

    try {
      console.log('[Login] Calling authorize...');
      const { authorizationCode } = await authorize(config);
      console.log('[Login] Authorization code received');
      const response = await authenticationRepository.login(
        authorizationCode,
        redirectUrl
      );
      const sessionManager: SessionManager = await SessionManager.getInstance()!;
      if (sessionManager) {
        sessionManager.saveCredentials(response);
        const user = await usersRepository.getInfo();

        if (!user.isStudent()) {
          throw new authenticationRepository.NotAStudent();
        }
        setLoginInProgress(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'RootDrawer' }],
        });
      }
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: 'Home' }],
      // });
    } catch (error) {
      if (error instanceof authenticationRepository.NotAStudent) {
        showRoleError();
      } else if (error instanceof authenticationRepository.AccountNotApproved) {
        showAccountNotApprovedError();
      } else if (!isCancellationError(error as { message: string })) {
        console.error('[Login] Error details:', JSON.stringify(error, null, 2));
        showGenericError(error);
      }
      setLoginInProgress(false);
    }
  };

  const handleClassicLogin = async () => {
    if (!dni.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu DNI');
      return;
    }

    setLoginInProgress(true);
    setShowDniModal(false);
    
    try {
      console.log('[Classic Login] Starting login with DNI:', dni);
      const response = await authenticationRepository.classicLogin(dni.trim());
      const sessionManager: SessionManager = await SessionManager.getInstance()!;
      
      if (sessionManager) {
        sessionManager.saveCredentials(response);
        const user = await usersRepository.getInfo();

        if (!user.isStudent()) {
          throw new authenticationRepository.NotAStudent();
        }
        setLoginInProgress(false);
        setDni('');
        navigation.reset({
          index: 0,
          routes: [{ name: 'RootDrawer' }],
        });
      }
    } catch (error) {
      if (error instanceof authenticationRepository.NotAStudent) {
        showRoleError();
      } else if (error instanceof authenticationRepository.AccountNotApproved) {
        showAccountNotApprovedError();
      } else {
        console.error('[Classic Login] Error details:', JSON.stringify(error, null, 2));
        showGenericError(error);
      }
      setLoginInProgress(false);
      setDni('');
    }
  };

  return (
    <View style={style().view}>
      <View style={styles.card}>
        <View style={styles.cardItem}>
          <Image source={LudoIcon} style={{ width: 130, height: 130 }} />
          <View style={{flexDirection: 'column'}}>
          <Text style={styles.cardTitle}>LUDO</Text>
          <Text style={styles.cardLabel}>Libreta Universitaria</Text>
          <Text style={styles.cardLabel}>Digital Oficial</Text>
          </View>
        </View>
      </View>
      <RoundedButton
        text="Pre-registro"
        enabled={!loginInProgress}
        onPress={() => navigation.navigate('PreRegister')}
      />
      <RoundedButton
        text="Login FIUBA"
        enabled={!loginInProgress}
        onPress={handleLogin}
      />
      <RoundedButton
        text="Ingreso clásico"
        enabled={!loginInProgress}
        onPress={() => setShowDniModal(true)}
      />

      <Modal
        visible={showDniModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDniModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ingreso clásico</Text>
            <Text style={styles.modalLabel}>Ingresa tu DNI:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="DNI"
              keyboardType="numeric"
              value={dni}
              onChangeText={setDni}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDniModal(false);
                  setDni('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleClassicLogin}
              >
                <Text style={styles.confirmButtonText}>Ingresar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const isCancellationError = (error: { message: string }) => {
  return (
    error.message === 'User cancelled flow' ||
    error.message === 'The operation couldn’t be completed. (org.openid.appauth.general error -3.)'
  );
};

const showGenericError = (error?: any) => {
  const errorMsg = error?.message || error?.toString() || 'Error desconocido';
  Alert.alert(
    'Error de autenticación', 
    `No se pudo completar el inicio de sesión.\n\nDetalles: ${errorMsg}\n\nChequeá que hayas ingresado correctamente tus datos.`
  );
};

const showAccountNotApprovedError = () => {
  Alert.alert(
    'Error',
    'Tu cuenta no ha sido aprobada aún. Probablemente Admisión esté ' +
    'verificando la imagen subida.'
  );
};

const showRoleError = () => {
  Alert.alert(
    'Error',
    '¿Te has registrado? ' +
    'Te recordamos que esta app es para alumnos. Si lo sos, ' +
    'chequeá que hayas ingresado correctamente tus datos.'
  );
};

export default Landing;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    flexDirection: 'column',
    marginBottom: 28,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    gap: 18
  },
  cardItem: {
    flexDirection: 'row',
    margin: 18,
    alignItems: 'center',
    gap: 14
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightModeColors.institutional,
  },
  cardLabel: {
    fontSize: 18,
    color: 'gray',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: lightModeColors.institutional,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: lightModeColors.institutional,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
