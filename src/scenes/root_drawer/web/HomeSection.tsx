import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcon } from '../../../components';
import { lightModeColors } from '../../../styles/colorPalette';

type Colors = typeof lightModeColors;

type Props = {
  icon: string;
  title: string;
  onVerMas: () => void;
  colors: Colors;
  children: React.ReactNode;
};

const HomeSection: React.FC<Props> = ({ icon, title, onVerMas, colors, children }) => (
  <View>
    <View style={styles.header}>
      <MaterialIcon name={icon} fontSize={24} color={colors.black} />
      <Text style={[styles.title, { color: colors.black }]}>{title}</Text>
    </View>
    {children}
    <TouchableOpacity style={styles.verMas} onPress={onVerMas}>
      <MaterialIcon name="arrow-right" fontSize={24} color={colors.mainContrastColor} />
      <Text style={[styles.verMasText, { color: colors.mainContrastColor }]}>Ver más</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 8 },
  title: { fontSize: 24, fontWeight: '600' },
  verMas: { flexDirection: 'row-reverse', marginLeft: 10, marginVertical: 4, alignItems: 'center' },
  verMasText: { fontSize: 18 },
});

export default HomeSection;
