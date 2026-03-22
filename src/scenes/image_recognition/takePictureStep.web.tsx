import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Web version - Camera not available
const TakePictureStepScreen: React.FC<any> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        📷 Funcionalidad de cámara no disponible en versión web
      </Text>
      <Text style={styles.subtext}>
        Por favor, usa la aplicación móvil para tomar fotos
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
});

export default TakePictureStepScreen;


