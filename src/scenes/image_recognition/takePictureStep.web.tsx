import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { RoundedButton, Loading } from '../../components';
import TakePictureStepConfiguration from './takePictureStepConfiguration';

interface TakePictureStepProps {
  navigation: any;
  route: any;
  configuration?: any;
}

// Web version - Skip camera and continue with registration
const TakePictureStepScreen: React.FC<TakePictureStepProps> = ({ 
  navigation, 
  route, 
  configuration: propConfiguration 
}) => {
  const [loading, setLoading] = useState(false);
  
  const getConfiguration = (): TakePictureStepConfiguration | null => {
    if (propConfiguration) {
      return TakePictureStepConfiguration.fromObject(propConfiguration);
    }
    if (route?.params?.configuration) {
      return TakePictureStepConfiguration.fromObject(route.params.configuration);
    }
    return null;
  };

  const handleContinueWithoutPhoto = async () => {
    setLoading(true);
    const config = getConfiguration();
    
    if (!config) {
      Alert.alert('Error', 'No se pudo obtener la configuración');
      setLoading(false);
      return;
    }

    try {
      console.log('[Web TakePicture] Starting registration without photo');
      // Create a minimal valid base64 image (1x1 pixel transparent PNG)
      const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const disableLoading = () => {
        console.log('[Web TakePicture] Disabling loading');
        setLoading(false);
      };
      
      console.log('[Web TakePicture] Calling onDataObtained');
      await config.onDataObtained(placeholderImage, navigation, disableLoading);
      console.log('[Web TakePicture] onDataObtained completed successfully');
    } catch (error) {
      console.error('[Web TakePicture] Error:', error);
      setLoading(false);
      Alert.alert('Error', `Hubo un error al procesar el registro: ${error}`);
    }
  };

  const config = getConfiguration();
  
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.text}>
            Funcionalidad de cámara no disponible en versión web
          </Text>
          <Text style={styles.subtext}>
            {config?.description || 'Puedes continuar sin foto o usar la aplicación móvil'}
          </Text>
          {loading && <Loading />}
          <RoundedButton
            text="Continuar sin foto"
            onPress={handleContinueWithoutPhoto}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    minWidth: 200,
  },
});

export default TakePictureStepScreen;


