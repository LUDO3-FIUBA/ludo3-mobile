import React from 'react';
import { View, Text, TouchableOpacity, Pressable, Modal, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import User from '../../../models/User';
import UserAvatar from '../../../components/UserAvatar';

type Props = {
  visible: boolean;
  user: User;
  onClose: () => void;
  onLogout: () => void;
};

const UserMenuDropdown: React.FC<Props> = ({ visible, user, onClose, onLogout }) => {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.dropdown} onPress={() => {}}>
          <View style={styles.header}>
            <UserAvatar photoUrl={user.profilePhoto} size={36} />
            <View style={styles.headerText}>
              {!!fullName && <Text style={styles.name} numberOfLines={1}>{fullName}</Text>}
              {!!user.email && <Text style={styles.email} numberOfLines={1}>{user.email}</Text>}
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => { onClose(); onLogout(); }}>
            <Icon name="logout-variant" size={18} color="#b42318" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingHorizontal: 12,
  },
  dropdown: {
    width: 260, backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e6e8eb',
    shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16,
    elevation: 12, overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f1f3', backgroundColor: '#fbfcfe',
  },
  headerText: { marginLeft: 10, flex: 1 },
  name: { color: '#1f2937', fontSize: 14, fontWeight: '700' },
  email: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  logoutText: { color: '#b42318', fontSize: 14, fontWeight: '600' },
});

export default UserMenuDropdown;
