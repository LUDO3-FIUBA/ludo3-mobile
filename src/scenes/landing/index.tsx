import React, { useState } from 'react';
import { View, Alert, Image, StyleSheet, Text, TextInput } from 'react-native';
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
  const [dni, setDni] = useState('');

  const handleClassicLogin = async () => {
    if (!dni.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu DNI');
      return;
    }

    setLoginInProgress(true);
    
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

      <View style={styles.loginSection}>
        <Text style={styles.dniLabel}>Ingresá tu DNI:</Text>
        <TextInput
          style={styles.dniInput}
          placeholder="DNI"
          keyboardType="numeric"
          value={dni}
          onChangeText={setDni}
          editable={!loginInProgress}
        />
        <RoundedButton
          text="Ingresar"
          enabled={!loginInProgress && dni.trim().length > 0}
          onPress={handleClassicLogin}
        />
      </View>

      <View style={styles.preregisterSection}>
        <Text style={styles.preregisterText}>
          ¿Es tu primera vez?{' '}
          <Text
            style={styles.preregisterLink}
            onPress={() => navigation.navigate('PreRegister')}
          >
            Realizá el pre-registro
          </Text>
        </Text>
      </View>
    </View>
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
  loginSection: {
    width: '100%',
    marginBottom: 24,
  },
  dniLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  dniInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  preregisterSection: {
    marginTop: 24,
  },
  preregisterText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  preregisterLink: {
    color: lightModeColors.institutional,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
