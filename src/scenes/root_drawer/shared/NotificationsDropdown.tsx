import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialIcon } from '../../../components';
import ImageComponent from '../../../components/ImageComponent';
import { UserNotification } from '../../../repositories/notifications';
import { lightModeColors } from '../../../styles/colorPalette';

type Props = {
  visible: boolean;
  notifications: UserNotification[];
  unreadCount: number;
  dropdownWidth: number;
  dropdownMaxHeight: number;
  onClose: () => void;
  onNotificationPress: (item: UserNotification) => void;
  onDeleteNotification: (item: UserNotification) => void;
  onSeeAll: () => void;
  formatDate: (iso: string) => string;
};

const NotificationsDropdown: React.FC<Props> = ({
  visible,
  notifications,
  unreadCount,
  dropdownWidth,
  dropdownMaxHeight,
  onClose,
  onNotificationPress,
  onDeleteNotification,
  onSeeAll,
  formatDate,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
    <View style={[styles.layer, { pointerEvents: 'box-none' } as any]}>
      <View style={[styles.dropdown, { width: dropdownWidth, maxHeight: dropdownMaxHeight }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Notificaciones</Text>
          <Text style={styles.subtitle}>{unreadCount} sin leer</Text>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tenés notificaciones</Text>
          </View>
        ) : (
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator>
            {notifications.slice(0, 5).map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() => onNotificationPress(item)}
                style={[
                  styles.item,
                  !item.is_read && styles.itemUnread,
                  item.notification.is_urgent && styles.itemUrgentAccent,
                ]}
              >
                <View style={styles.itemHeader}>
                  {item.notification.is_urgent && (
                    <MaterialIcon name="alert-circle" fontSize={14} color="#b42318" />
                  )}
                  <Text
                    numberOfLines={1}
                    style={[styles.itemTitle, !item.is_read && styles.itemTitleUnread]}
                  >
                    {item.notification.title}
                  </Text>
                  <View style={styles.itemActions}>
                    {item.notification.is_urgent && (
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>URGENTE</Text>
                      </View>
                    )}
                    {!item.is_read && <View style={styles.dot} />}
                    <TouchableOpacity
                      onPress={e => { e.stopPropagation(); onDeleteNotification(item); }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon name="trash-can-outline" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </View>

                {item.notification.semester_info ? (
                  <View style={styles.context}>
                    <Icon name="school" size={11} color="#6b7280" />
                    <Text numberOfLines={1} style={styles.contextText}>
                      {item.notification.semester_info.subject_name}
                      {item.notification.semester_info.period_label
                        ? ` · ${item.notification.semester_info.period_label}`
                        : ''}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.context}>
                    <Icon name="bullhorn" size={11} color="#6b7280" />
                    <Text numberOfLines={1} style={styles.contextText}>Aviso institucional</Text>
                  </View>
                )}

                <Text numberOfLines={2} style={styles.itemMessage}>{item.notification.message}</Text>
                <ImageComponent uri={item.notification.image} imageStyle={styles.thumbnail} resizeMode="cover" />
                <Text numberOfLines={1} style={styles.itemDate}>
                  {item.notification.sender_name
                    ? `${item.notification.sender_name} · ${formatDate(item.notification.created_at)}`
                    : formatDate(item.notification.created_at)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity style={styles.seeAll} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>Ver todas las notificaciones</Text>
          <Icon name="chevron-right" size={18} color={lightModeColors.institutional} />
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  layer: { ...StyleSheet.absoluteFillObject, alignItems: 'flex-end', paddingTop: 70, paddingHorizontal: 12 },
  dropdown: {
    backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e6e8eb',
    shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16,
    elevation: 12, overflow: 'hidden',
  },
  header: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f1f3', backgroundColor: '#fbfcfe' },
  title: { color: '#1f2937', fontSize: 16, fontWeight: '700' },
  subtitle: { marginTop: 2, color: '#6b7280', fontSize: 12, fontWeight: '500' },
  list: { flexGrow: 0 },
  listContent: { padding: 10, gap: 8 },
  emptyContainer: { paddingHorizontal: 14, paddingVertical: 20 },
  emptyText: { color: '#6b7280', textAlign: 'center', fontSize: 14 },
  item: { borderWidth: 1, borderColor: '#eceef2', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#ffffff' },
  itemUnread: { backgroundColor: '#eaf3ff', borderLeftWidth: 4, borderLeftColor: lightModeColors.institutional },
  itemUrgentAccent: { borderRightWidth: 4, borderRightColor: '#b42318' },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  itemTitle: { flex: 1, color: '#111827', fontSize: 14, fontWeight: '700' },
  itemTitleUnread: { color: lightModeColors.institutional, fontWeight: '800' },
  itemMessage: { color: '#374151', fontSize: 13, lineHeight: 18, marginBottom: 6 },
  itemDate: { color: '#6b7280', fontSize: 11, fontWeight: '500' },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb' },
  urgentBadge: { backgroundColor: '#fee2e2', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  urgentText: { color: '#b42318', fontSize: 9, fontWeight: '800' },
  thumbnail: { width: '100%', height: 120, borderRadius: 6, marginTop: 6, marginBottom: 6 },
  context: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  contextText: { flex: 1, fontSize: 11, color: '#6b7280', fontWeight: '600' },
  seeAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#eee', gap: 4 },
  seeAllText: { color: lightModeColors.institutional, fontSize: 14, fontWeight: '600' },
});

export default NotificationsDropdown;
