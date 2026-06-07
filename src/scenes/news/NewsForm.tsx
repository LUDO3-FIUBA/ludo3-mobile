import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AlertDialog from '../../components/AlertDialog';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcon, RoundedButton } from '../../components';
import { departmentsRepository, newsRepository, usersRepository } from '../../repositories';
import News, { NewsTag } from '../../models/News';
import { NewsImagePayload } from '../../repositories/news';
import Department from '../../models/Department';
import User from '../../models/User';

type NewsFormRouteParams = {
  NewsForm: {
    post?: News;
  };
};

const NewsForm: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<NewsFormRouteParams, 'NewsForm'>>();
  const existing = route.params?.post;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [tag, setTag] = useState<string>(existing?.tag ?? '');
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [image, setImage] = useState<NewsImagePayload | null>(null);
  const [keepExistingImage, setKeepExistingImage] = useState<boolean>(!!existing?.image);
  const [saving, setSaving] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(existing?.department?.id ?? null);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);

  useEffect(() => {
    newsRepository
      .fetchTags()
      .then(fetched => {
        setTags(fetched);
        if (!tag && fetched.length > 0) {
          setTag(fetched[0].key);
        }
      })
      .catch(() => setAlertDialog({ title: 'Error', message: 'No se pudieron cargar las categorías.' }));
  }, []);

  useEffect(() => {
    usersRepository.getInfo().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const isSuperAdmin = currentUser?.isSuperAdmin?.() ?? false;
  const isDeptAdmin = currentUser?.isDepartmentAdmin?.() ?? false;

  useEffect(() => {
    if (!isSuperAdmin && !isDeptAdmin) return;
    departmentsRepository.fetchAll().then(setDepartments).catch(() => {});
  }, [isSuperAdmin, isDeptAdmin]);

  const dropdownDepartment = departments.find(d => d.id === selectedDepartmentId) ?? null;
  const myDepartment = isDeptAdmin && currentUser?.departmentId
    ? departments.find(d => d.id === currentUser.departmentId) ?? null
    : null;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setAlertDialog({ title: 'Permiso denegado', message: 'Necesitamos acceso a tu galería para adjuntar imágenes.' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      setImage({
        uri: asset.uri,
        type: asset.mimeType ?? `image/${ext}`,
        name: asset.fileName ?? `news.${ext}`,
      });
      setKeepExistingImage(false);
    }
  };

  const removePicture = () => {
    setImage(null);
    setKeepExistingImage(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setAlertDialog({ title: 'Error', message: 'El título es obligatorio.' });
      return;
    }
    if (!tag) {
      setAlertDialog({ title: 'Error', message: 'Seleccioná una categoría.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        tag,
        image,
        departmentId: isSuperAdmin ? selectedDepartmentId : undefined,
      };
      if (existing) {
        await newsRepository.updateNews(existing.id, payload);
        setAlertDialog({ title: 'Éxito', message: 'Novedad actualizada correctamente.', onConfirm: () => navigation.goBack() });
      } else {
        await newsRepository.createNews(payload);
        setAlertDialog({ title: 'Éxito', message: 'Novedad creada correctamente.', onConfirm: () => navigation.goBack() });
      }
    } catch {
      setAlertDialog({ title: 'Error', message: 'No se pudo guardar la novedad. Intentá de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <AlertDialog
      visible={alertDialog !== null}
      title={alertDialog?.title ?? ''}
      message={alertDialog?.message ?? ''}
      mode="info"
      confirmLabel="Aceptar"
      onConfirm={() => { alertDialog?.onConfirm?.(); setAlertDialog(null); }}
    />
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ej: Nueva fecha de torneo de fútbol"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.tagsGrid}>
            {tags.map(t => {
              const active = tag === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setTag(t.key)}
                  style={[
                    styles.tagChip,
                    { backgroundColor: t.color, opacity: active ? 1 : 0.45 },
                  ]}
                >
                  <Text style={styles.tagChipText}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {isDeptAdmin && myDepartment && (
          <View style={styles.field}>
            <Text style={styles.label}>Departamento</Text>
            <View style={styles.deptChip}>
              <MaterialIcon name="office-building" fontSize={14} color="#1e40af" />
              <Text style={styles.deptChipText}>{myDepartment.name}</Text>
            </View>
            <Text style={styles.deptHint}>La novedad queda etiquetada con tu departamento.</Text>
          </View>
        )}

        {isSuperAdmin && (
          <View style={styles.field}>
            <Text style={styles.label}>Departamento (opcional)</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDepartmentPicker(true)}>
              {dropdownDepartment ? (
                <Text style={styles.pickerText}>{dropdownDepartment.name}</Text>
              ) : (
                <Text style={styles.pickerPlaceholder}>Sin departamento (novedad institucional)</Text>
              )}
              <MaterialIcon name="chevron-down" fontSize={20} color="#666" />
            </TouchableOpacity>
            {dropdownDepartment && (
              <TouchableOpacity onPress={() => setSelectedDepartmentId(null)} style={styles.clearDept}>
                <Text style={styles.clearDeptText}>Quitar tag</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Detalles adicionales..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Imagen (opcional)</Text>
          {image ? (
            <View>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImage} onPress={removePicture}>
                <MaterialIcon name="close-circle" fontSize={22} color="#ef4444" />
                <Text style={styles.removeImageText}>Quitar imagen</Text>
              </TouchableOpacity>
            </View>
          ) : keepExistingImage && existing?.image ? (
            <View>
              <Image source={{ uri: existing.image }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <MaterialIcon name="image-edit" fontSize={22} color="#6b7280" />
                <Text style={styles.imagePickerText}>Reemplazar imagen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <MaterialIcon name="image-plus" fontSize={24} color="#6b7280" />
              <Text style={styles.imagePickerText}>Adjuntar imagen</Text>
            </TouchableOpacity>
          )}
        </View>

        <RoundedButton
          text={saving ? 'Guardando...' : existing ? 'Guardar cambios' : 'Publicar novedad'}
          enabled={!saving}
          onPress={handleSubmit}
          style={{}}
        />
      </ScrollView>

      <Modal visible={showDepartmentPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar departamento</Text>
            <TouchableOpacity onPress={() => setShowDepartmentPicker(false)}>
              <MaterialIcon name="close" fontSize={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={departments}
            keyExtractor={d => String(d.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deptOption}
                onPress={() => {
                  setSelectedDepartmentId(item.id);
                  setShowDepartmentPicker(false);
                }}
              >
                <Text style={styles.deptOptionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#666' }}>No hay departamentos.</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    minHeight: 120,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  imagePicker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  imagePickerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  removeImage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  removeImageText: {
    color: '#ef4444',
    fontSize: 14,
  },
  deptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#dbeafe',
    borderRadius: 16,
  },
  deptChipText: {
    color: '#1e40af',
    fontSize: 13,
    fontWeight: '600',
  },
  deptHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 15,
    color: '#111',
    flex: 1,
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: '#aaa',
    flex: 1,
  },
  clearDept: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  clearDeptText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  deptOption: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    padding: 14,
  },
  deptOptionText: {
    fontSize: 15,
    color: '#111',
  },
});

export default NewsForm;
