import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ImageComponent from '../../../components/ImageComponent';
import { UserNotification } from '../../../repositories/notifications';

type Props = {
  notification: UserNotification;
  visible: boolean;
  onPress: () => void;
};

const ToastCard: React.FC<Props> = ({ notification, visible, onPress }) => {
  if (!visible) return null;
  return (
    <View style={[styles.layer, { pointerEvents: 'box-none' } as any]}>
      <TouchableOpacity activeOpacity={0.92} style={styles.card} onPress={onPress}>
        <View style={styles.header}>
          <Text style={styles.label}>Nueva notificación</Text>
          {notification.notification.is_urgent && <Text style={styles.urgent}>URGENTE</Text>}
        </View>
        <Text numberOfLines={1} style={styles.title}>{notification.notification.title}</Text>
        <Text numberOfLines={2} style={styles.message}>{notification.notification.message}</Text>
        <ImageComponent uri={notification.notification.image} imageStyle={styles.thumbnail} resizeMode="cover" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 72, left: 12, right: 12, alignItems: 'center', zIndex: 30 },
  card: {
    width: '100%', maxWidth: 480, borderRadius: 14, borderWidth: 1, borderColor: '#dce5f6',
    backgroundColor: '#ffffff', paddingVertical: 10, paddingHorizontal: 12,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: '#334155', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  urgent: { color: '#b42318', fontSize: 10, fontWeight: '800' },
  title: { color: '#0f172a', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  message: { color: '#334155', fontSize: 13, lineHeight: 18 },
  thumbnail: { width: '100%', height: 100, borderRadius: 6, marginTop: 8 },
});

export default ToastCard;
