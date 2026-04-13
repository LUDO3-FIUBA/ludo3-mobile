import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { notificationsRepository, UserNotification } from '../../repositories';

const NotificationsScreen = () => {
    const [items, setItems] = useState<UserNotification[]>([]);
    const [loading, setLoading] = useState(false);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await notificationsRepository.fetchMyNotifications();
            setItems(data);
        } catch (error) {
            console.log('Failed loading notifications', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [loadNotifications]),
    );

    useEffect(() => {
        const intervalId = setInterval(() => {
            loadNotifications();
        }, 10000);

        return () => {
            clearInterval(intervalId);
        };
    }, [loadNotifications]);

    const onMarkAsRead = async (item: UserNotification) => {
        if (item.is_read) {
            return;
        }

        try {
            await notificationsRepository.markNotificationAsRead(item.id);
            setItems(prev => prev.map(n => (n.id === item.id ? { ...n, is_read: true } : n)));
        } catch (error) {
            console.log('Failed marking notification as read', error);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNotifications} />}
                ListEmptyComponent={<Text style={styles.empty}>No tenés notificaciones</Text>}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => onMarkAsRead(item)}
                        style={[styles.card, item.is_read ? styles.cardRead : styles.cardUnread]}
                    >
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>{item.notification.title}</Text>
                            {item.notification.is_urgent && <Text style={styles.urgent}>URGENTE</Text>}
                        </View>
                        <Text style={styles.message}>{item.notification.message}</Text>
                        <Text style={styles.date}>{new Date(item.notification.created_at).toLocaleString()}</Text>
                        {!item.is_read && <Text style={styles.hint}>Tocá para marcar como leída</Text>}
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12,
        backgroundColor: '#fff',
    },
    empty: {
        textAlign: 'center',
        marginTop: 24,
        color: '#666',
    },
    card: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        marginBottom: 10,
    },
    cardUnread: {
        backgroundColor: '#f2f8ff',
        borderColor: '#9ec5fe',
    },
    cardRead: {
        backgroundColor: '#fafafa',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontWeight: '700',
        fontSize: 15,
        flex: 1,
        marginRight: 8,
    },
    urgent: {
        color: '#b42318',
        fontWeight: '700',
        fontSize: 12,
    },
    message: {
        color: '#222',
        marginBottom: 8,
    },
    date: {
        color: '#777',
        fontSize: 12,
    },
    hint: {
        marginTop: 8,
        color: '#0c63e7',
        fontSize: 12,
    },
});

export default NotificationsScreen;
