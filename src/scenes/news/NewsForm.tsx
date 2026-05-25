import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
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
import { newsRepository } from '../../repositories';
import News, { NewsTag } from '../../models/News';
import { NewsImagePayload } from '../../repositories/news';

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
});

export default NewsForm;
