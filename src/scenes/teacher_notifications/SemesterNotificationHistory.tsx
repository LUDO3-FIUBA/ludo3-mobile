import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import { notificationsRepository } from '../../repositories';
import { TeacherSentNotification } from '../../repositories/notifications';
import { lightModeColors } from '../../styles/colorPalette';

interface RouteParams {
    semesterId: number;
    subjectName?: string;
}

const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString();
};

const SemesterNotificationHistory: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { semesterId, subjectName } = (route.params || {}) as RouteParams;

    const [notifications, setNotifications] = useState<TeacherSentNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const data = await notificationsRepository.fetchSemesterNotifications(semesterId);
            setNotifications(data);
        } catch {
            Alert.alert('Error', 'No se pudieron cargar los avisos del cuatrimestre.');
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

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() =>
                        navigation.navigate('SendCommissionNotification', {
                            semesterId,
                            subjectName,
                        })
                    }
                >
                    <MaterialIcon name="plus" fontSize={24} color="gray" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, semesterId, subjectName]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={lightModeColors.institutional} />
            </View>
        );
    }

    if (notifications.length === 0) {
        return (
            <View style={styles.centered}>
                <MaterialIcon name="bell-outline" fontSize={48} color="gray" />
                <Text style={styles.emptyTitle}>No enviaste avisos</Text>
                <Text style={styles.emptyText}>
                    Tocá el "+" arriba para enviar un aviso a los alumnos del cuatrimestre.
                </Text>
            </View>
        );
    }

    return (
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
            renderItem={({ item }) => (
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
                    {item.image && (
                        <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
                    )}
                    <View style={styles.itemFooter}>
                        <Text style={styles.itemMeta} numberOfLines={1}>
                            {item.sender_name} · {formatDate(item.created_at)}
                        </Text>
                        <View style={styles.recipientPill}>
                            <MaterialIcon name="account-multiple" fontSize={13} color="#6b7280" />
                            <Text style={styles.recipientCount}>{item.recipient_count}</Text>
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
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    itemMeta: {
        flex: 1,
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
    headerButton: {
        marginRight: 15,
    },
});

export default SemesterNotificationHistory;
