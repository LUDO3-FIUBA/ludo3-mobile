import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProcedureTypesAccordionList } from '../../components';
import { formsRepository } from '../../repositories';
import Form from '../../models/Form';
import FormProcedureType from '../../models/FormProcedureType';
import ProcedureTypeFormItem from './components/ProcedureTypeFormItem';

interface Section {
  procedure: FormProcedureType;
  forms: Form[];
}

const FormsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([formsRepository.fetchProcedureTypes(), formsRepository.fetchForms()])
      .then(([procedureTypes, forms]) => {
        setSections(
          procedureTypes.map(proc => ({
            procedure: proc,
            forms: forms.filter(f => f.form_procedure.id === proc.id),
          })),
        );
      })
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los trámites.'))
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
    <ProcedureTypesAccordionList
      sections={sections.map(section => ({
        procedure: section.procedure,
        items: section.forms,
      }))}
      renderItems={items =>
        items.map(item => {
          const isDocumento = item.form_type.value === 'Documento';
          return (
            <ProcedureTypeFormItem
              key={item.form_id}
              form={item}
              onSubmit={() => {
                if (isDocumento) {
                  navigation.navigate('DocumentForm', {
                    formId: item.form_id,
                    action: 'submit',
                  });
                } else {
                  navigation.navigate('DigitalForm', { formId: item.form_id });
                }
              }}
            />
          );
        })
      }
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default FormsListScreen;
