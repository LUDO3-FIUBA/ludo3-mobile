import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import ImageComponent from '../../components/ImageComponent';
import AlertDialog from '../../components/AlertDialog';
import { notificationsRepository } from '../../repositories';
import { Notification } from '../../repositories/notifications';
import { lightModeColors } from '../../styles/colorPalette';

interface RouteParams {
    semesterId: number;
}

const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString();
};

const SemesterAnnouncements: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { semesterId } = (route.params || {}) as RouteParams;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

    const load = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const data = await notificationsRepository.fetchStudentSemesterNotifications(semesterId);
            const sorted = [...data].sort(
                (a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            );
            setNotifications(sorted);
        } catch {
            setAlertDialog({
                title: 'Error',
                message: 'No se pudieron cargar los anuncios del cuatrimestre.',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [semesterId]);

    useEffect(() => {
        load();
        const unsubscribe = navigation.addListener('focus', () => load());
        return unsubscribe;
    }, [navigation, load]);

    const content = loading ? (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color={lightModeColors.institutional} />
        </View>
    ) : notifications.length === 0 ? (
        <View style={styles.centered}>
            <MaterialIcon name="bullhorn-outline" fontSize={48} color="gray" />
            <Text style={styles.emptyTitle}>No hay anuncios</Text>
            <Text style={styles.emptyText}>
                Cuando tu catedra publique anuncios, van a aparecer aca.
            </Text>
        </View>
    ) : (
        <FlatList
            data={notifications}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.list}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        load(true);
                    }}
                />
            }
            renderItem={({ item }) => {
                const imageUri = item.image ?? null;
                return (
                <View style={styles.item}>
                    <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                        {item.is_urgent && (
                            <View style={styles.urgentBadge}>
                                <Text style={styles.urgentText}>URGENTE</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.itemMessage}>{item.message}</Text>
                    {imageUri ? (
                        <TouchableOpacity onPress={() => setFullScreenImage(imageUri)}>
                            <ImageComponent
                                uri={imageUri}
                                imageStyle={styles.itemImage}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ) : (
                        <ImageComponent
                            uri={imageUri}
                            imageStyle={styles.itemImage}
                            resizeMode="cover"
                        />
                    )}
                    <Text style={styles.itemMeta} numberOfLines={1}>
                        {item.sender_name
                            ? `${item.sender_name} · ${formatDate(item.created_at)}`
                            : formatDate(item.created_at)}
                    </Text>
                </View>
                );
            }}
        />
    );

    return (
        <View style={{ flex: 1 }}>
            {content}
            <AlertDialog
                visible={alertDialog !== null}
                title={alertDialog?.title ?? ''}
                message={alertDialog?.message ?? ''}
                mode="info"
                confirmLabel="Aceptar"
                onConfirm={() => setAlertDialog(null)}
            />
            <Modal
                visible={!!fullScreenImage}
                transparent
                animationType="fade"
                onRequestClose={() => setFullScreenImage(null)}
            >
                <View style={styles.fullScreenBackdrop}>
                    <TouchableOpacity
                        style={styles.fullScreenClose}
                        onPress={() => setFullScreenImage(null)}
                    >
                        <MaterialIcon name="close" fontSize={28} color="white" />
                    </TouchableOpacity>
                    <ImageComponent
                        uri={fullScreenImage}
                        imageStyle={styles.fullScreenImage}
                        resizeMode="contain"
                        showFallbackWhenMissing
                        fallbackIconSize={40}
                        fallbackIconColor="#d1d5db"
                        fallbackContainerStyle={styles.fullScreenImageFallback}
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 4,
    },
    emptyText: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
    },
    list: {
        padding: 16,
        gap: 10,
    },
    item: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 14,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
        gap: 8,
    },
    itemTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },
    urgentBadge: {
        backgroundColor: '#fee2e2',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    urgentText: {
        color: '#b42318',
        fontSize: 10,
        fontWeight: '800',
    },
    itemMessage: {
        fontSize: 13,
        color: '#555',
        marginBottom: 8,
    },
    itemImage: {
        width: '100%',
        height: 160,
        borderRadius: 8,
        marginBottom: 8,
    },
    itemMeta: {
        fontSize: 12,
        color: '#9ca3af',
    },
    fullScreenBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenClose: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
    fullScreenImageFallback: {
        backgroundColor: 'transparent',
    },
});

export default SemesterAnnouncements;
