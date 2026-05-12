import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { lightModeColors } from '../../styles/colorPalette';

export default function TeacherProceduresValidationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: lightModeColors.darkGray },
});
