import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import { formsRepository } from '../../repositories';
import Form from '../../models/Form';
import FormProcedureType from '../../models/FormProcedureType';

const PROCEDURE_COLORS: Record<string, string> = {
  Administrativo: '#F9A825',
  Exámenes: '#388E3C',
  Carrera: '#D32F2F',
  Cursada: '#1976D2',
};

interface RouteParams {
  procedure: FormProcedureType;
}

const FormListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { procedure } = route.params as RouteParams;
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  const borderColor = PROCEDURE_COLORS[procedure.value] ?? '#757575';

  useEffect(() => {
    navigation.setOptions({ title: procedure.value });
    formsRepository
      .fetchForms(procedure.id)
      .then(setForms)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los formularios.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (forms.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No hay formularios disponibles.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={forms}
      keyExtractor={item => String(item.form_id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const isDocumento = item.form_type.value === 'Documento';
        return (
          <View style={[styles.card, { borderLeftColor: borderColor }]}>
            <Text style={styles.formName}>{item.form_name}</Text>
            {!!item.form_description && (
              <Text style={styles.formDesc}>{item.form_description}</Text>
            )}
            <View style={styles.actions}>
              {isDocumento && (
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={() =>
                    navigation.navigate('DocumentForm', { formId: item.form_id, action: 'download' })
                  }
                >
                  <MaterialIcon name="download" fontSize={16} color="#555" />
                  <Text style={styles.btnSecondaryText}>Descargar recurso</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: borderColor }]}
                onPress={() => {
                  if (isDocumento) {
                    navigation.navigate('DocumentForm', { formId: item.form_id, action: 'submit' });
                  } else {
                    navigation.navigate('DigitalForm', { formId: item.form_id });
                  }
                }}
              >
                <MaterialIcon name="send" fontSize={16} color="white" />
                <Text style={styles.btnText}>Enviar formulario</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderLeftWidth: 4,
    padding: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  formName: { fontSize: 16, fontWeight: '700', color: '#222' },
  formDesc: { fontSize: 14, color: '#666' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  btnSecondary: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f5f5f5' },
  btnSecondaryText: { color: '#555', fontWeight: '600', fontSize: 13 },
});

export default FormListScreen;
