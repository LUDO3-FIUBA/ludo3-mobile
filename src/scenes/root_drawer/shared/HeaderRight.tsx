import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { lightModeColors } from '../../../styles/colorPalette';

type Colors = typeof lightModeColors;

type Props = {
  canToggle: boolean;
  activeRole: 'student' | 'teacher';
  onSetActiveRole: (role: 'student' | 'teacher') => void;
  unreadCount: number;
  onBellPress: () => void;
  colors: Colors;
};

const HeaderRight: React.FC<Props> = ({
  canToggle,
  activeRole,
  onSetActiveRole,
  unreadCount,
  onBellPress,
  colors,
}) => (
  <View style={styles.container}>
    {canToggle && (
      <View style={styles.roleToggle}>
        <TouchableOpacity
          style={[styles.roleToggleOpt, activeRole === 'student' && { backgroundColor: colors.institutional }]}
          onPress={() => onSetActiveRole('student')}
          accessibilityLabel="Ver vista de alumno"
        >
          <Icon name="school" size={16} color={activeRole === 'student' ? '#fff' : colors.darkGray} style={{ marginRight: 4 }} />
          <Text style={[styles.roleToggleOptText, activeRole === 'student' && styles.roleToggleOptTextActive]}>
            Alumno
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleToggleOpt, activeRole === 'teacher' && { backgroundColor: colors.teacherAccent }]}
          onPress={() => onSetActiveRole('teacher')}
          accessibilityLabel="Ver vista de docente"
        >
          <Icon name="clipboard-edit-outline" size={16} color={activeRole === 'teacher' ? '#fff' : colors.darkGray} style={{ marginRight: 4 }} />
          <Text style={[styles.roleToggleOptText, activeRole === 'teacher' && styles.roleToggleOptTextActive]}>
            Docente
          </Text>
        </TouchableOpacity>
      </View>
    )}
    <TouchableOpacity onPress={onBellPress} style={styles.bellButton} accessibilityLabel="Mostrar notificaciones">
      <Icon name="bell-outline" size={24} color={colors.mainContrastColor} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  roleToggle: {
    flexDirection: 'row', borderRadius: 8, borderWidth: 1,
    borderColor: '#cbd5e1', backgroundColor: '#f1f5f9', marginRight: 12, overflow: 'hidden',
  },
  roleToggleOpt: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5 },
  roleToggleOptText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  roleToggleOptTextActive: { color: '#fff' },
  bellButton: { paddingVertical: 4, paddingHorizontal: 6 },
  badge: {
    position: 'absolute', top: -3, right: -4, minWidth: 18, height: 18,
    borderRadius: 9, paddingHorizontal: 4, backgroundColor: '#c1121f',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

export default HeaderRight;
