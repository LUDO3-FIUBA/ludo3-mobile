import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import AlertDialog from '../../components/AlertDialog';
import { useNavigation } from '@react-navigation/native';
import { ImageComponent, MaterialIcon } from '../../components';
import { newsRepository } from '../../repositories';
import News from '../../models/News';

interface Props {
  isAdmin: boolean;
}

const NewsList: React.FC<Props> = ({ isAdmin }) => {
  const navigation = useNavigation<any>();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  const loadNews = async () => {
    try {
      const data = await newsRepository.fetchAll();
      setNews(data);
    } catch {
      setAlertDialog({ title: 'Error', message: 'No se pudieron cargar las novedades.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    const unsubscribe = navigation.addListener('focus', loadNews);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (isAdmin) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminNewsCreate')}
            style={{ marginRight: 16 }}
          >
            <MaterialIcon name="plus" fontSize={24} color="#333" />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, isAdmin]);

  let content: React.ReactNode;
  if (loading) {
    content = (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (news.length === 0) {
    content = (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No hay novedades publicadas.</Text>
      </View>
    );
  } else {
    content = (
    <FlatList
      data={news}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate('NewsDetail', { newsId: item.id, isAdmin })
          }
        >
          <ImageComponent uri={item.image} imageStyle={styles.thumbnail} />
          <View style={styles.itemContent}>
            <View style={[styles.tagChip, { backgroundColor: item.tagColor }]}>
              <Text style={styles.tagChipText}>{item.tagLabel}</Text>
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      )}
    />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => setAlertDialog(null)}
      />
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  thumbnail: {
    width: '100%',
    height: 160,
  },
  itemContent: {
    padding: 14,
  },
  tagChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  tagChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  itemDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});

export default NewsList;
