import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import { adminNotificationsRepository } from '../../repositories';
import AdminNotification from '../../models/AdminNotification';

const NotificationList: React.FC = () => {
    const navigation = useNavigation<any>();
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        try {
            const data = await adminNotificationsRepository.fetchAll();
            setNotifications(data);
        } catch {
            Alert.alert('Error', 'No se pudieron cargar las notificaciones.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        const unsubscribe = navigation.addListener('focus', loadNotifications);
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('AdminNotificationCreate')}
                    style={{ marginRight: 16 }}
                >
                    <MaterialIcon name="plus" fontSize={24} color="#333" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (notifications.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.emptyText}>No hay notificaciones enviadas.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={notifications}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <View style={styles.item}>
                    <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                        {item.isUrgent && (
                            <View style={styles.urgentBadge}>
                                <Text style={styles.urgentText}>URGENTE</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
                    <View style={styles.itemFooter}>
                        <Text style={styles.itemMeta}>
                            {new Date(item.createdAt).toLocaleString()}
                        </Text>
                        <View style={styles.recipientPill}>
                            <MaterialIcon name="account-multiple" fontSize={13} color="#6b7280" />
                            <Text style={styles.recipientCount}>{item.recipientCount}</Text>
                        </View>
                    </View>
                </View>
            )}
        />
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
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemMeta: {
        fontSize: 12,
        color: '#9ca3af',
    },
    recipientPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    recipientCount: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '600',
    },
});

export default NotificationList;
