import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import { notificationsRepository } from '../../repositories';
import { UserNotification } from '../../repositories/notifications';
import { lightModeColors } from '../../styles/colorPalette';

const POLL_INTERVAL_MS = 10000;

const formatNotificationDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString();
};

const NotificationsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const isMountedRef = useRef(true);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.is_read).length,
        [notifications],
    );

    const load = useCallback(async (showSpinner = false) => {
        if (showSpinner) setLoading(true);
        try {
            const data = await notificationsRepository.fetchMyNotifications();
            const sorted = [...data].sort(
                (a, b) =>
                    new Date(b.notification.created_at).getTime() -
                    new Date(a.notification.created_at).getTime(),
            );
            if (isMountedRef.current) setNotifications(sorted);
        } catch (error) {
            console.log('NotificationsScreen: failed to fetch', error);
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        load(true);
        const intervalId = setInterval(() => load(false), POLL_INTERVAL_MS);
        const unsubscribe = navigation.addListener('focus', () => load(false));
        return () => {
            isMountedRef.current = false;
            clearInterval(intervalId);
            unsubscribe();
        };
    }, [navigation, load]);

    const onNotificationPress = async (item: UserNotification) => {
        if (item.notification.image) {
            setFullScreenImage(item.notification.image);
        }
        if (item.is_read) return;
        try {
            await notificationsRepository.markNotificationAsRead(item.id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)),
            );
        } catch (error) {
            console.log('NotificationsScreen: failed mark as read', error);
        }
    };

    const onDelete = async (item: UserNotification) => {
        try {
            await notificationsRepository.deleteNotification(item.id);
            setNotifications((prev) => prev.filter((n) => n.id !== item.id));
        } catch {
            Alert.alert('Error', 'No se pudo eliminar la notificación.');
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={lightModeColors.institutional} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.summaryBar}>
                <Text style={styles.summaryText}>
                    {notifications.length === 0
                        ? 'Sin notificaciones'
                        : `${notifications.length} notificación${notifications.length === 1 ? '' : 'es'} · ${unreadCount} sin leer`}
                </Text>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialIcon name="bell-outline" fontSize={48} color="gray" />
                    <Text style={styles.emptyTitle}>No tenés notificaciones</Text>
                    <Text style={styles.emptyText}>
                        Cuando recibas un aviso, va a aparecer acá.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                load(false);
                            }}
                        />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => onNotificationPress(item)}
                            style={[
                                styles.item,
                                !item.is_read && styles.itemUnread,
                            ]}
                        >
                            <View style={styles.itemHeader}>
                                <Text numberOfLines={1} style={[styles.itemTitle, !item.is_read && styles.itemTitleUnread]}>
                                    {item.notification.title}
                                </Text>
                                <View style={styles.itemActions}>
                                    {item.notification.is_urgent && (
                                        <View style={styles.urgentBadge}>
                                            <Text style={styles.urgentText}>URGENTE</Text>
                                        </View>
                                    )}
                                    {!item.is_read && <View style={styles.unreadDot} />}
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            onDelete(item);
                                        }}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <MaterialIcon
                                            name="trash-can-outline"
                                            fontSize={18}
                                            color="#9ca3af"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {item.notification.semester_info ? (
                                <View style={styles.contextRow}>
                                    <MaterialIcon name="school" fontSize={13} color="#6b7280" />
                                    <Text style={styles.contextText} numberOfLines={1}>
                                        {item.notification.semester_info.subject_name}
                                        {item.notification.semester_info.period_label
                                            ? ` · ${item.notification.semester_info.period_label}`
                                            : ''}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.contextRow}>
                                    <MaterialIcon name="bullhorn" fontSize={13} color="#6b7280" />
                                    <Text style={styles.contextText}>Aviso institucional</Text>
                                </View>
                            )}
                            <Text style={styles.itemMessage}>
                                {item.notification.message}
                            </Text>
                            {item.notification.image && (
                                <Image
                                    source={{ uri: item.notification.image }}
                                    style={styles.itemImage}
                                    resizeMode="cover"
                                />
                            )}
                            <Text style={styles.itemDate} numberOfLines={1}>
                                {item.notification.sender_name
                                    ? `${item.notification.sender_name} · ${formatNotificationDate(item.notification.created_at)}`
                                    : formatNotificationDate(item.notification.created_at)}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}

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
                    {fullScreenImage && (
                        <Image
                            source={{ uri: fullScreenImage }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryBar: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    summaryText: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '600',
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
    itemUnread: {
        backgroundColor: '#eaf3ff',
        borderLeftWidth: 4,
        borderLeftColor: lightModeColors.institutional,
        elevation: 2,
        shadowOpacity: 0.1,
    },
    itemTitleUnread: {
        color: lightModeColors.institutional,
        fontWeight: '800',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
        gap: 8,
    },
    itemTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: lightModeColors.institutional,
    },
    contextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    contextText: {
        flex: 1,
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '600',
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
    itemDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 6,
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
});

export default NotificationsScreen;
