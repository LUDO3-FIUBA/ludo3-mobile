import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Form from '../../../models/Form';
import MaterialIcon from '../../../components/materialIcon';

interface ProcedureTypeFormItemProps {
  form: Form;
  onSubmit: () => void;
}

const ProcedureTypeFormItem: React.FC<ProcedureTypeFormItemProps> = ({ form, onSubmit }) => (
  <View style={styles.formCard}>
    <View style={styles.formCardRow}>
      <View style={styles.formMainInfo}>
        <Text style={styles.formName}>{form.form_name}</Text>
        {!!form.form_description && <Text style={styles.formDesc}>{form.form_description}</Text>}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={onSubmit}>
          <MaterialIcon name="send" fontSize={15} color="white" />
          <Text style={styles.btnText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e2e2',
  },
  formCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  formMainInfo: {
    flex: 1,
    gap: 6,
  },
  formName: { fontSize: 15, fontWeight: '700', color: '#222' },
  formDesc: { fontSize: 13, color: '#666' },
  actions: {
    minWidth: 88,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#455A64',
  },
  btnText: { color: 'white', fontWeight: '600', fontSize: 13 },
});

export default ProcedureTypeFormItem;
