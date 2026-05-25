import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AlertDialog from '../../components/AlertDialog';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ImageComponent, RoundedButton } from '../../components';
import { newsRepository } from '../../repositories';
import News from '../../models/News';

type NewsDetailRouteParams = {
  NewsDetail: {
    newsId: number;
    isAdmin: boolean;
  };
};

const NewsDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<NewsDetailRouteParams, 'NewsDetail'>>();
  const { newsId, isAdmin } = route.params;

  const [post, setPost] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const load = () => {
    setLoading(true);
    newsRepository
      .fetchOne(newsId)
      .then(setPost)
      .catch(() => setAlertDialog({ title: 'Error', message: 'No se pudo cargar la novedad.' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [newsId, navigation]);

  const handleDelete = () => {
    setConfirmDialog({
      title: 'Eliminar novedad',
      message: `¿Estás seguro de que querés eliminar "${post?.title}"?`,
      onConfirm: async () => {
        try {
          await newsRepository.deleteNews(newsId);
          navigation.goBack();
        } catch {
          setAlertDialog({ title: 'Error', message: 'No se pudo eliminar la novedad.' });
        }
      },
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
  };

  let content: React.ReactNode;
  if (loading) {
    content = (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (!post) {
    content = (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Novedad no encontrada.</Text>
      </View>
    );
  } else {
    content = (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ImageComponent uri={post.image} imageStyle={styles.picture} expandOnPress />

      <View style={[styles.tagChip, { backgroundColor: post.tagColor }]}>
        <Text style={styles.tagChipText}>{post.tagLabel}</Text>
      </View>

      <Text style={styles.title}>{post.title}</Text>

      <Text style={styles.meta}>{formatDate(post.createdAt)}</Text>

      {post.description ? (
        <Text style={styles.description}>{post.description}</Text>
      ) : null}

      {isAdmin && (
        <View style={styles.adminActions}>
          <RoundedButton
            text="Editar"
            onPress={() => navigation.navigate('AdminNewsEdit', { post })}
            style={{}}
          />
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
    );
  }

  return (
    <>
      {content}
      <AlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => setAlertDialog(null)}
      />
      <AlertDialog
        visible={confirmDialog !== null}
        title={confirmDialog?.title ?? ''}
        message={confirmDialog?.message ?? ''}
        mode="confirm"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => { confirmDialog?.onConfirm(); setConfirmDialog(null); }}
        onCancel={() => setConfirmDialog(null)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  picture: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 16,
  },
  tagChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  tagChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#222',
    lineHeight: 22,
  },
  adminActions: {
    marginTop: 24,
  },
  deleteButton: {
    alignItems: 'center',
    padding: 12,
  },
  deleteButtonText: {
    color: '#e53e3e',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewsDetail;
