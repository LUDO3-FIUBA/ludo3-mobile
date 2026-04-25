import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import { formsRepository } from '../../repositories';
import FormProcedureType from '../../models/FormProcedureType';

const PROCEDURE_CONFIG: Record<string, { icon: string; color: string }> = {
  Administrativo: { icon: 'home-city', color: '#F9A825' },
  Exámenes: { icon: 'file-document', color: '#388E3C' },
  Carrera: { icon: 'school', color: '#D32F2F' },
  Cursada: { icon: 'calendar-month', color: '#1976D2' },
};

const CARD_SIZE = (Dimensions.get('window').width - 48) / 2;

const ProcedureTypesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [procedureTypes, setProcedureTypes] = useState<FormProcedureType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    formsRepository
      .fetchProcedureTypes()
      .then(setProcedureTypes)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los tipos de trámite.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={procedureTypes}
      keyExtractor={item => String(item.id)}
      numColumns={2}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => {
        const config = PROCEDURE_CONFIG[item.value] ?? { icon: 'folder', color: '#757575' };
        return (
          <TouchableOpacity
            style={[styles.card, { borderColor: config.color }]}
            onPress={() => navigation.navigate('FormList', { procedure: item })}
            activeOpacity={0.75}
          >
            <MaterialIcon name={config.icon} fontSize={40} color={config.color} />
            <Text style={[styles.cardText, { color: config.color }]}>{item.value}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: { padding: 16 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default ProcedureTypesScreen;
