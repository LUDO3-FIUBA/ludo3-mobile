import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcon, RoundedButton } from '../../components';
import { formsRepository } from '../../repositories';
import { StatusCodeError } from '../../networking';
import FormProcedureType from '../../models/FormProcedureType';
import { lightModeColors } from '../../styles/colorPalette';

interface FieldOption {
  form_option_value: string;
  form_option_label: string;
}

interface DesignerField {
  form_field_label: string;
  form_field_type_id: number;
  form_field_type_value: string;
  form_field_require: boolean;
  catalog_id: number | null;
  options: FieldOption[];
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  texto: 'Texto libre',
  numero: 'Número',
  padron: 'Padrón',
  mail: 'Email',
  options: 'Opciones (lista)',
  catalog: 'Catálogo',
  checkbox: 'Casilla de verificación',
};

type SubmitStatus = {
  type: 'success' | 'error';
  message: string;
};

const FormDesignerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingFormId: number | undefined = route.params?.formId;
  const isEditing = typeof editingFormId === 'number';

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [procedureTypes, setProcedureTypes] = useState<FormProcedureType[]>([]);
  const [formTypes, setFormTypes] = useState<{ id: number; value: string }[]>([]);
  const [fieldTypes, setFieldTypes] = useState<{ id: number; value: string }[]>([]);
  const [catalogs, setCatalogs] = useState<{ catalog_id: number; catalog_name: string }[]>([]);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formInformation, setFormInformation] = useState('');
  const [procedureId, setProcedureId] = useState<number | null>(null);
  const [isDigital, setIsDigital] = useState(true);
  const [documentUrl, setDocumentUrl] = useState('');
  const [fields, setFields] = useState<DesignerField[]>([]);

  const [saving, setSaving] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [fieldModal, setFieldModal] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);

  const [modalLabel, setModalLabel] = useState('');
  const [modalTypeId, setModalTypeId] = useState<number | null>(null);
  const [modalTypeValue, setModalTypeValue] = useState('');
  const [modalRequired, setModalRequired] = useState(false);
  const [modalCatalogId, setModalCatalogId] = useState<number | null>(null);
  const [modalOptions, setModalOptions] = useState<FieldOption[]>([]);
  const [modalOptValue, setModalOptValue] = useState('');
  const [modalOptLabel, setModalOptLabel] = useState('');

  const [catalogModalVisible, setCatalogModalVisible] = useState(false);
  const [creatingCatalog, setCreatingCatalog] = useState(false);
  const [newCatalogName, setNewCatalogName] = useState('');
  const [newCatalogKey, setNewCatalogKey] = useState('');
  const [newCatalogDescription, setNewCatalogDescription] = useState('');
  const [newCatalogItems, setNewCatalogItems] = useState<{ value: string; label: string }[]>([]);
  const [newCatalogItemValue, setNewCatalogItemValue] = useState('');
  const [newCatalogItemLabel, setNewCatalogItemLabel] = useState('');
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    const availableFieldTypes = fieldTypes.filter(ft => ft.value !== 'adjunto');
    if (availableFieldTypes.length > 0 && modalTypeId === null) {
      setModalTypeId(availableFieldTypes[0].id);
      setModalTypeValue(availableFieldTypes[0].value);
    }
  }, [fieldTypes, modalTypeId]);

  useEffect(() => {
    Promise.all([
      formsRepository.fetchProcedureTypes(),
      formsRepository.fetchFormTypes(),
      formsRepository.fetchFieldTypes(),
      formsRepository.fetchCatalogs().catch(() => []),
      isEditing ? formsRepository.fetchFormDetail(editingFormId) : Promise.resolve(null),
    ])
      .then(([procs, types, fts, cats, existingForm]) => {
        setProcedureTypes(procs);
        if (procs.length > 0 && !isEditing) setProcedureId(procs[0].id);
        setFormTypes(types);
        const digital = types.find(t => t.value === 'Digital');
        if (digital && !isEditing) setIsDigital(true);
        setFieldTypes(fts);
        const available = fts.filter(ft => ft.value !== 'adjunto');
        if (available.length > 0) {
          setModalTypeId(available[0].id);
          setModalTypeValue(available[0].value);
        }
        setCatalogs(cats as { catalog_id: number; catalog_name: string }[]);

        if (existingForm) {
          setFormName(existingForm.form_name);
          setFormDescription(existingForm.form_description);
          setFormInformation(existingForm.form_information ?? '');
          setProcedureId(existingForm.form_procedure.id);

          const editingDigital = existingForm.form_type.value === 'Digital';
          setIsDigital(editingDigital);
          setDocumentUrl(existingForm.document_source ?? '');

          if (editingDigital) {
            setFields(
              existingForm.fields.map(field => ({
                form_field_label: field.form_field_label,
                form_field_type_id: field.form_field_type.id,
                form_field_type_value: field.form_field_type.value,
                form_field_require: field.form_field_require,
                catalog_id: field.catalog?.catalog_id ?? null,
                options: (field.options ?? []).map(option => ({
                  form_option_value: option.form_option_value,
                  form_option_label: option.form_option_label,
                })),
              })),
            );
          } else {
            setFields([]);
          }
        }
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar la configuración del formulario.'))
      .finally(() => setLoadingConfig(false));
  }, [isEditing, editingFormId]);

  const resetModal = () => {
    setEditingFieldIndex(null);
    setModalLabel('');
    const available = fieldTypes.filter(ft => ft.value !== 'adjunto');
    setModalTypeId(available[0]?.id ?? null);
    setModalTypeValue(available[0]?.value ?? '');
    setModalRequired(false);
    setModalCatalogId(null);
    setModalOptions([]);
    setModalOptValue('');
    setModalOptLabel('');
  };

  const openEditModal = (index: number) => {
    const f = fields[index];
    setEditingFieldIndex(index);
    setModalLabel(f.form_field_label);
    setModalTypeId(f.form_field_type_id);
    setModalTypeValue(f.form_field_type_value);
    setModalRequired(f.form_field_require);
    setModalCatalogId(f.catalog_id);
    setModalOptions([...f.options]);
    setModalOptValue('');
    setModalOptLabel('');
    setFieldModal(true);
  };

  const addOption = () => {
    if (!modalOptValue.trim() || !modalOptLabel.trim()) return;
    setModalOptions(prev => [...prev, { form_option_value: modalOptValue.trim(), form_option_label: modalOptLabel.trim() }]);
    setModalOptValue('');
    setModalOptLabel('');
  };

  const confirmAddField = () => {
    if (!modalLabel.trim()) {
      Alert.alert('Error', 'El nombre del campo es obligatorio.');
      return;
    }
    if (modalTypeValue === 'options' && modalOptions.length === 0) {
      Alert.alert('Error', 'Los campos de tipo opciones deben tener al menos una opción.');
      return;
    }
    if (modalTypeValue === 'catalog' && !modalCatalogId) {
      Alert.alert('Error', 'Los campos de tipo catálogo deben tener un catálogo seleccionado.');
      return;
    }
    const updated: DesignerField = {
      form_field_label: modalLabel.trim(),
      form_field_type_id: modalTypeId!,
      form_field_type_value: modalTypeValue,
      form_field_require: modalRequired,
      catalog_id: modalTypeValue === 'catalog' ? modalCatalogId : null,
      options: modalTypeValue === 'options' ? [...modalOptions] : [],
    };
    if (editingFieldIndex !== null) {
      setFields(prev => prev.map((f, i) => (i === editingFieldIndex ? updated : f)));
    } else {
      setFields(prev => [...prev, updated]);
    }
    setFieldModal(false);
    resetModal();
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const resetCatalogModal = () => {
    setNewCatalogName('');
    setNewCatalogKey('');
    setNewCatalogDescription('');
    setNewCatalogItems([]);
    setNewCatalogItemValue('');
    setNewCatalogItemLabel('');
    setCatalogError(null);
  };

  const addNewCatalogItem = () => {
    if (!newCatalogItemValue.trim() || !newCatalogItemLabel.trim()) return;
    setNewCatalogItems(prev => [
      ...prev,
      { value: newCatalogItemValue.trim(), label: newCatalogItemLabel.trim() },
    ]);
    setNewCatalogItemValue('');
    setNewCatalogItemLabel('');
  };

  const handleCreateCatalog = async () => {
    if (!newCatalogName.trim()) {
      setCatalogError('El nombre del catálogo es obligatorio.');
      return;
    }
    if (!newCatalogKey.trim()) {
      setCatalogError('La clave (catalog_key) es obligatoria.');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(newCatalogKey.trim())) {
      setCatalogError('La clave solo puede contener minúsculas, números y guión bajo.');
      return;
    }
    if (newCatalogItems.length === 0) {
      setCatalogError('Agregá al menos un item al catálogo.');
      return;
    }

    setCreatingCatalog(true);
    setCatalogError(null);
    try {
      const created = await formsRepository.createCatalog({
        catalog_key: newCatalogKey.trim(),
        catalog_name: newCatalogName.trim(),
        catalog_description: newCatalogDescription.trim() || null,
        items: newCatalogItems.map((item, i) => ({
          catalog_item_value: item.value,
          catalog_item_label: item.label,
          catalog_item_order: i + 1,
        })),
      });
      setCatalogs(prev => [
        ...prev,
        { catalog_id: created.catalog_id, catalog_name: created.catalog_name },
      ]);
      setModalCatalogId(created.catalog_id);
      setCatalogModalVisible(false);
      resetCatalogModal();
    } catch (err) {
      setCatalogError(extractApiError(err));
    } finally {
      setCreatingCatalog(false);
    }
  };

  const extractApiError = (err: unknown): string => {
    if (err instanceof StatusCodeError && err.info && err.info !== '<not available>') {
      const info = err.info;
      if (typeof info === 'string') return info;
      const messages = Object.values(info).flat().filter((v): v is string => typeof v === 'string');
      if (messages.length) return messages.join('\n');
    }
    return 'No se pudo guardar el formulario. Verificá los datos e intentá nuevamente.';
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert('Error', 'El título del formulario es obligatorio.');
      return;
    }
    if (!formDescription.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria.');
      return;
    }
    if (!procedureId) {
      Alert.alert('Error', 'Seleccioná un tipo de trámite.');
      return;
    }
    if (!isDigital && !documentUrl.trim()) {
      Alert.alert('Error', 'La URL del documento es obligatoria para formularios tipo Documento.');
      return;
    }
    if (isDigital && fields.length === 0) {
      Alert.alert('Error', 'Un formulario Digital debe tener al menos un campo.');
      return;
    }

    const digitalTypeId = formTypes.find(t => t.value === 'Digital')?.id;
    const documentTypeId = formTypes.find(t => t.value === 'Documento')?.id;
    const formTypeId = isDigital ? digitalTypeId : documentTypeId;

    if (!formTypeId) {
      Alert.alert('Error', 'No se pudo determinar el tipo de formulario.');
      return;
    }

    const payload: Record<string, unknown> = {
      form_name: formName.trim(),
      form_description: formDescription.trim(),
      form_information: formInformation.trim() || null,
      form_procedure_id: procedureId,
      form_type_id: formTypeId,
    };

    if (!isDigital) {
      payload.document_source = documentUrl.trim();
    } else {
      payload.fields = fields.map((f, i) => ({
        form_field_label: f.form_field_label,
        form_field_type_id: f.form_field_type_id,
        form_field_require: f.form_field_require,
        form_field_order: i + 1,
        catalog_id: f.catalog_id ?? null,
        options: f.options,
      }));
    }

    setSaving(true);
    setSubmitStatus(null);
    try {
      if (isEditing && editingFormId) {
        await formsRepository.updateForm(editingFormId, payload);
      } else {
        await formsRepository.createForm(payload);
      }
      setSubmitStatus({
        type: 'success',
        message: isEditing ? 'Formulario actualizado correctamente.' : 'Formulario guardado correctamente.',
      });
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (err) {
      setSubmitStatus({ type: 'error', message: extractApiError(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loadingConfig) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const availableFieldTypes = fieldTypes.filter(ft => ft.value !== 'adjunto');

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información general</Text>

          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            value={formName}
            onChangeText={setFormName}
            maxLength={100}
            placeholder="Nombre del formulario"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={formDescription}
            onChangeText={setFormDescription}
            maxLength={300}
            multiline
            numberOfLines={3}
            placeholder="Breve descripción del trámite"
            placeholderTextColor="#aaa"
            textAlignVertical="top"
          />

          <Text style={styles.label}>Información importante</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={formInformation}
            onChangeText={setFormInformation}
            maxLength={2000}
            multiline
            numberOfLines={4}
            placeholder="Información adicional (opcional)"
            placeholderTextColor="#aaa"
            textAlignVertical="top"
          />

          <Text style={styles.label}>Tipo de trámite *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={procedureId}
              onValueChange={v => setProcedureId(Number(v))}
            >
              {procedureTypes.map(pt => (
                <Picker.Item key={pt.id} label={pt.value} value={pt.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de formulario</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, isDigital && styles.toggleBtnActive]}
              onPress={() => setIsDigital(true)}
            >
              <MaterialIcon name="pencil-box" fontSize={18} color={isDigital ? 'white' : '#555'} />
              <Text style={[styles.toggleText, isDigital && styles.toggleTextActive]}>Digital</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !isDigital && styles.toggleBtnActive]}
              onPress={() => setIsDigital(false)}
            >
              <MaterialIcon name="file-pdf-box" fontSize={18} color={!isDigital ? 'white' : '#555'} />
              <Text style={[styles.toggleText, !isDigital && styles.toggleTextActive]}>Documento</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!isDigital ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fuente del documento</Text>
            <Text style={styles.label}>URL del documento (PDF) *</Text>
            <TextInput
              style={styles.input}
              value={documentUrl}
              onChangeText={setDocumentUrl}
              placeholder="https://cms.fi.uba.ar/uploads/..."
              placeholderTextColor="#aaa"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Campos del formulario</Text>
            {fields.length === 0 && (
              <Text style={styles.emptyFields}>Aún no hay campos. Agregá al menos uno.</Text>
            )}
            {fields.map((f, i) => (
              <TouchableOpacity key={i} style={styles.fieldChip} onPress={() => openEditModal(i)} activeOpacity={0.75}>
                <View style={styles.fieldChipInfo}>
                  <Text style={styles.fieldChipLabel}>{f.form_field_label}</Text>
                  <Text style={styles.fieldChipMeta}>
                    {FIELD_TYPE_LABELS[f.form_field_type_value] ?? f.form_field_type_value}
                    {f.form_field_require ? ' · obligatorio' : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeField(i)} hitSlop={8}>
                  <MaterialIcon name="close-circle" fontSize={22} color="#D32F2F" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addFieldBtn} onPress={() => setFieldModal(true)}>
              <MaterialIcon name="plus" fontSize={18} color={lightModeColors.institutional} />
              <Text style={styles.addFieldText}>Agregar campo</Text>
            </TouchableOpacity>
          </View>
        )}

        {submitStatus ? (
          <View
            style={[
              styles.statusCard,
              submitStatus.type === 'success' ? styles.statusCardSuccess : styles.statusCardError,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                submitStatus.type === 'success' ? styles.statusTextSuccess : styles.statusTextError,
              ]}
            >
              {submitStatus.message}
            </Text>
          </View>
        ) : null}

        <View style={styles.buttonWrapper}>
          <RoundedButton
            text={saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar formulario'}
            enabled={!saving}
            onPress={handleSave}
          />
          {saving ? (
            <View style={styles.buttonSpinnerOverlay} pointerEvents="none">
              <ActivityIndicator color="white" />
            </View>
          ) : null}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={fieldModal} transparent animationType="slide" onRequestClose={() => { setFieldModal(false); resetModal(); }}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalCard} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingFieldIndex !== null ? 'Editar campo' : 'Nuevo campo'}</Text>
              <TouchableOpacity onPress={() => { setFieldModal(false); resetModal(); }}>
                <MaterialIcon name="close" fontSize={22} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nombre del campo *</Text>
            <TextInput
              style={styles.input}
              value={modalLabel}
              onChangeText={setModalLabel}
              placeholder="ej: Carrera"
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Tipo de campo *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={modalTypeId}
                onValueChange={(v) => {
                  const ft = availableFieldTypes.find(f => f.id === Number(v));
                  if (ft) {
                    setModalTypeId(ft.id);
                    setModalTypeValue(ft.value);
                    setModalOptions([]);
                    setModalCatalogId(null);
                  }
                }}
              >
                {availableFieldTypes.map(ft => (
                  <Picker.Item key={ft.id} label={FIELD_TYPE_LABELS[ft.value] ?? ft.value} value={ft.id} />
                ))}
              </Picker>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Obligatorio</Text>
              <Switch
                value={modalRequired}
                onValueChange={setModalRequired}
                trackColor={{ true: lightModeColors.institutional }}
              />
            </View>

            {modalTypeValue === 'options' && (
              <View style={styles.optionsSection}>
                <Text style={styles.label}>Opciones</Text>
                {modalOptions.map((opt, i) => (
                  <View key={i} style={styles.optionChip}>
                    <Text style={styles.optionChipText}>{opt.form_option_label} ({opt.form_option_value})</Text>
                    <TouchableOpacity onPress={() => setModalOptions(prev => prev.filter((_, j) => j !== i))}>
                      <MaterialIcon name="close" fontSize={16} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.optionInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={modalOptValue}
                    onChangeText={setModalOptValue}
                    placeholder="Valor (ej: M)"
                    placeholderTextColor="#aaa"
                  />
                  <TextInput
                    style={[styles.input, { flex: 2 }]}
                    value={modalOptLabel}
                    onChangeText={setModalOptLabel}
                    placeholder="Etiqueta (ej: Mañana)"
                    placeholderTextColor="#aaa"
                  />
                  <TouchableOpacity style={styles.optionAddBtn} onPress={addOption}>
                    <MaterialIcon name="plus" fontSize={18} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {modalTypeValue === 'catalog' && (
              <View>
                <View style={styles.catalogHeader}>
                  <Text style={styles.label}>Catálogo *</Text>
                  <TouchableOpacity
                    style={styles.createCatalogBtn}
                    onPress={() => {
                      resetCatalogModal();
                      setCatalogModalVisible(true);
                    }}
                  >
                    <MaterialIcon name="plus" fontSize={14} color={lightModeColors.institutional} />
                    <Text style={styles.createCatalogText}>Crear nuevo</Text>
                  </TouchableOpacity>
                </View>
                {catalogs.length === 0 ? (
                  <Text style={styles.emptyFields}>
                    No hay catálogos disponibles. Creá uno con el botón "Crear nuevo".
                  </Text>
                ) : (
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={modalCatalogId}
                      onValueChange={v => setModalCatalogId(Number(v))}
                    >
                      <Picker.Item label="Seleccionar catálogo..." value={null} />
                      {catalogs.map(c => (
                        <Picker.Item key={c.catalog_id} label={c.catalog_name} value={c.catalog_id} />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>
            )}

            <RoundedButton text={editingFieldIndex !== null ? 'Guardar cambios' : 'Agregar campo'} enabled={true} onPress={confirmAddField} />
            <View style={{ height: 16 }} />
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={catalogModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setCatalogModalVisible(false);
          resetCatalogModal();
        }}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalCard} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo catálogo</Text>
              <TouchableOpacity
                onPress={() => {
                  setCatalogModalVisible(false);
                  resetCatalogModal();
                }}
              >
                <MaterialIcon name="close" fontSize={22} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={newCatalogName}
              onChangeText={setNewCatalogName}
              placeholder="ej: Carreras"
              placeholderTextColor="#aaa"
              maxLength={100}
            />

            <Text style={styles.label}>Clave (catalog_key) *</Text>
            <TextInput
              style={styles.input}
              value={newCatalogKey}
              onChangeText={t => setNewCatalogKey(t.toLowerCase())}
              placeholder="ej: carreras (a-z, 0-9, _)"
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={50}
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={newCatalogDescription}
              onChangeText={setNewCatalogDescription}
              placeholder="Descripción opcional"
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              maxLength={300}
            />

            <Text style={styles.label}>Items *</Text>
            {newCatalogItems.length === 0 && (
              <Text style={styles.emptyFields}>Agregá al menos un item.</Text>
            )}
            {newCatalogItems.map((item, i) => (
              <View key={i} style={styles.optionChip}>
                <Text style={styles.optionChipText}>
                  {item.label} ({item.value})
                </Text>
                <TouchableOpacity
                  onPress={() => setNewCatalogItems(prev => prev.filter((_, j) => j !== i))}
                >
                  <MaterialIcon name="close" fontSize={16} color="#D32F2F" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.optionInputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={newCatalogItemValue}
                onChangeText={setNewCatalogItemValue}
                placeholder="Valor"
                placeholderTextColor="#aaa"
              />
              <TextInput
                style={[styles.input, { flex: 2 }]}
                value={newCatalogItemLabel}
                onChangeText={setNewCatalogItemLabel}
                placeholder="Etiqueta"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity style={styles.optionAddBtn} onPress={addNewCatalogItem}>
                <MaterialIcon name="plus" fontSize={18} color="white" />
              </TouchableOpacity>
            </View>

            {catalogError ? (
              <View style={[styles.statusCard, styles.statusCardError]}>
                <Text style={[styles.statusText, styles.statusTextError]}>{catalogError}</Text>
              </View>
            ) : null}

            <View style={styles.buttonWrapper}>
              <RoundedButton
                text={creatingCatalog ? 'Creando...' : 'Crear catálogo'}
                enabled={!creatingCatalog}
                onPress={handleCreateCatalog}
              />
              {creatingCatalog ? (
                <View style={styles.buttonSpinnerOverlay} pointerEvents="none">
                  <ActivityIndicator color="white" />
                </View>
              ) : null}
            </View>
            <View style={{ height: 16 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16, gap: 16 },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: lightModeColors.institutional, marginBottom: 2 },
  label: { fontSize: 13, fontWeight: '600', color: '#444' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  toggleBtnActive: {
    backgroundColor: lightModeColors.institutional,
    borderColor: lightModeColors.institutional,
  },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#555' },
  toggleTextActive: { color: 'white' },
  emptyFields: { color: '#aaa', fontSize: 13, fontStyle: 'italic' },
  fieldChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f6ff',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  fieldChipInfo: { flex: 1 },
  fieldChipLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  fieldChipMeta: { fontSize: 12, color: '#777', marginTop: 2 },
  addFieldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightModeColors.institutional,
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
  },
  addFieldText: { color: lightModeColors.institutional, fontWeight: '600', fontSize: 14 },
  statusCard: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusCardSuccess: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  statusCardError: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#C62828',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusTextSuccess: {
    color: '#1B5E20',
  },
  statusTextError: {
    color: '#B71C1C',
  },
  buttonWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  buttonSpinnerOverlay: {
    position: 'absolute',
    right: 18,
  },
  switchRow: { flexDirection: 'column', alignItems: 'flex-start', gap: 8 },
  optionsSection: { gap: 8 },
  optionChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  optionChipText: { fontSize: 13, color: '#333' },
  optionInputRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  optionAddBtn: {
    backgroundColor: lightModeColors.institutional,
    borderRadius: 8,
    padding: 10,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  createCatalogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: lightModeColors.institutional,
    borderStyle: 'dashed',
  },
  createCatalogText: {
    color: lightModeColors.institutional,
    fontWeight: '600',
    fontSize: 12,
  },
});

export default FormDesignerScreen;
