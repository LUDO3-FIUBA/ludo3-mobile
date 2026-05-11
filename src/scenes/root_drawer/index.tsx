import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import ImageComponent from "../../components/ImageComponent";
import {
  Appearance,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Loading, MaterialIcon } from '../../components';
import { usersRepository } from '../../repositories';
import notificationsRepository, { UserNotification } from '../../repositories/notifications';
import User from '../../models/User';
import { useAppDispatch } from '../../redux/hooks';
import { fetchUserDataAsync } from '../../redux/reducers/teacherUserDataSlice';
import { darkModeColors, lightModeColors } from '../../styles/colorPalette';
import HomeScreen from '../home';
import CalendarScreen from '../calendar';
import TeacherHomeScreen from '../teacher_home';
import NotificationList from '../admin_notifications/NotificationList';
import MapScreen from '../map';
import SubmenuScreen from '../submenu';
import { resolveMenu, canToggleRole, SubmenuItem } from './menu_config';

const Tab = createBottomTabNavigator();

const RootDrawer = () => {
  const colors = isDarkTheme() ? darkModeColors : lightModeColors;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<'student' | 'teacher'>('student');
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastNotification, setToastNotification] = useState<UserNotification | null>(null);
  const hasLoadedNotificationsRef = useRef(false);
  const knownNotificationIdsRef = useRef<Set<number>>(new Set());
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.is_read).length,
    [notifications],
  );

  const dropdownWidth = Math.min(Math.max(screenWidth - 24, 260), 360);
  const dropdownMaxHeight = Math.min(screenHeight * 0.65, 460);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationsRepository.fetchMyNotifications();
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.notification.created_at).getTime() -
          new Date(a.notification.created_at).getTime(),
      );

      if (!hasLoadedNotificationsRef.current) {
        knownNotificationIdsRef.current = new Set(sorted.map(i => i.id));
        hasLoadedNotificationsRef.current = true;
      } else {
        const incomingUnread = sorted.find(
          i => !knownNotificationIdsRef.current.has(i.id) && !i.is_read,
        );
        knownNotificationIdsRef.current = new Set(sorted.map(i => i.id));
        if (incomingUnread && !showNotificationsDropdown) {
          setToastNotification(incomingUnread);
          setShowToast(true);
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => setShowToast(false), 4200);
        }
      }
      setNotifications(sorted);
    } catch (e) {
      console.log('RootDrawer: Failed to fetch notifications', e);
    }
  }, [showNotificationsDropdown]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const fetchedUser = await usersRepository.getInfo();
        setUser(fetchedUser);
        dispatch(fetchUserDataAsync(fetchedUser));
        if (fetchedUser.isTeacher() && !fetchedUser.isStudent()) setActiveRole('teacher');
      } catch (e) {
        console.log('RootDrawer: Failed to fetch user', e);
        setUser(new User('', '', '', '', undefined, false, false, false));
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 10000);
    return () => {
      clearInterval(id);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [loadNotifications]);

  if (loading || !user) return <Loading />;

  const canToggle = canToggleRole(user);
  const menuItems = resolveMenu(user, activeRole);

  const onDeleteNotification = async (item: UserNotification) => {
    try {
      await notificationsRepository.deleteNotification(item.id);
      setNotifications(prev => prev.filter(n => n.id !== item.id));
    } catch (e) {
      console.log('RootDrawer: Failed deleting notification', e);
    }
  };

  const onNotificationPress = async (item: UserNotification) => {
    if (item.notification.image) setFullScreenImage(item.notification.image);
    if (item.is_read) return;
    try {
      await notificationsRepository.markNotificationAsRead(item.id);
      setNotifications(prev =>
        prev.map(n => n.id === item.id ? { ...n, is_read: true } : n),
      );
    } catch (e) {
      console.log('RootDrawer: Failed marking notification as read', e);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  };

  const openDropdownFromToast = () => {
    setShowToast(false);
    setShowNotificationsDropdown(true);
  };

  // Notification bell + optional role toggle shown in every tab header
  const headerRight = () => (
    <View style={styles.headerRightRow}>
      {canToggle && (
        <View style={styles.roleToggle}>
          <TouchableOpacity
            style={[styles.roleToggleOpt, activeRole === 'student' && { backgroundColor: colors.institutional }]}
            onPress={() => setActiveRole('student')}
            accessibilityLabel="Ver vista de alumno"
          >
            <Text style={[styles.roleToggleOptText, activeRole === 'student' && styles.roleToggleOptTextActive]}>
              Alumno
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleToggleOpt, activeRole === 'teacher' && { backgroundColor: colors.teacherAccent }]}
            onPress={() => setActiveRole('teacher')}
            accessibilityLabel="Ver vista de docente"
          >
            <Text style={[styles.roleToggleOptText, activeRole === 'teacher' && styles.roleToggleOptTextActive]}>
              Docente
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        onPress={() => setShowNotificationsDropdown(true)}
        style={styles.bellButton}
        accessibilityLabel="Mostrar notificaciones"
      >
        <Icon name="bell-outline" size={24} color={colors.mainContrastColor} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  // Build tabs from menu config
  const tabs = menuItems.map(item => {
    const iconFn = ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
      <Icon
        name={focused ? item.icon : item.iconOutline}
        size={size}
        color={color}
      />
    );

    if (item.kind === 'direct') {
      const DirectComp = DIRECT_SCREEN_COMPONENTS[item.route!];
      if (!DirectComp) return null;
      return (
        <Tab.Screen
          key={item.key}
          name={item.route!}
          component={DirectComp}
          options={{
            tabBarLabel: item.label,
            title: item.label,
            tabBarIcon: iconFn,
            headerRight,
          }}
        />
      );
    }

    // submenu tab
    const submenuItem = item as SubmenuItem;
    return (
      <Tab.Screen
        key={item.key}
        name={`Submenu_${item.key}`}
        options={{
          tabBarLabel: item.label,
          tabBarIcon: iconFn,
          title: item.label,
          headerRight,
        }}
      >
        {(props) => (
          <SubmenuScreen
            {...props}
            route={{
              ...props.route,
              params: {
                ...props.route.params,
                submenuKey: item.key,
                title: item.label,
                items: submenuItem.children,
                isMerged: false,
              },
            }}
          />
        )}
      </Tab.Screen>
    );
  }).filter(Boolean);

  const homeRoute = menuItems.find(
    i => i.kind === 'direct' && ((i as DirectItem).route === 'Home' || (i as DirectItem).route === 'TeacherHome'),
  ) as DirectItem | undefined;

  return (
    <>
      <Tab.Navigator
        key={canToggle ? activeRole : undefined}
        initialRouteName={homeRoute?.route}
        screenOptions={{
          tabBarActiveTintColor: canToggle && activeRole === 'teacher' ? colors.teacherAccent : colors.institutional,
          tabBarInactiveTintColor: colors.darkGray,
          tabBarStyle: { borderTopColor: colors.lightGray },
          headerStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
          headerTintColor: colors.mainContrastColor,
        }}
      >
        {tabs}
      </Tab.Navigator>

      {/* Toast */}
      {showToast && toastNotification && !showNotificationsDropdown && (
        <View style={[styles.toastLayer, { pointerEvents: 'box-none' }]}>
          <TouchableOpacity activeOpacity={0.92} style={styles.toastCard} onPress={openDropdownFromToast}>
            <View style={styles.toastHeader}>
              <Text style={styles.toastLabel}>Nueva notificación</Text>
              {toastNotification.notification.is_urgent && (
                <Text style={styles.toastUrgent}>URGENTE</Text>
              )}
            </View>
            <Text numberOfLines={1} style={styles.toastTitle}>
              {toastNotification.notification.title}
            </Text>
            <Text numberOfLines={2} style={styles.toastMessage}>
              {toastNotification.notification.message}
            </Text>
            <ImageComponent
              uri={toastNotification.notification.image}
              imageStyle={styles.toastThumbnail}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Full-screen image */}
      <Modal visible={fullScreenImage !== null} transparent={false} animationType="fade" onRequestClose={() => setFullScreenImage(null)}>
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity style={styles.fullScreenCloseButton} onPress={() => setFullScreenImage(null)}>
            <Text style={styles.fullScreenCloseText}>✕</Text>
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

      {/* Notifications dropdown */}
      <Modal visible={showNotificationsDropdown} transparent animationType="fade" onRequestClose={() => setShowNotificationsDropdown(false)}>
        <TouchableOpacity style={styles.notificationsBackdrop} activeOpacity={1} onPress={() => setShowNotificationsDropdown(false)} />
        <View style={[styles.notificationsLayer, { pointerEvents: 'box-none' }]}>
          <View style={[styles.notificationsDropdown, { width: dropdownWidth, maxHeight: dropdownMaxHeight }]}>
            <View style={styles.notificationsHeader}>
              <Text style={styles.notificationsTitle}>Notificaciones</Text>
              <Text style={styles.notificationsSubtitle}>{unreadCount} sin leer</Text>
            </View>
            {notifications.length === 0 ? (
            <View style={styles.notificationsEmptyContainer}>
              <Text style={styles.notificationsEmptyText}>No tenés notificaciones</Text>
            </View>
            ) : (
              <ScrollView style={styles.notificationsList} contentContainerStyle={styles.notificationsListContent} showsVerticalScrollIndicator>
                {notifications.slice(0, 5).map(item => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => onNotificationPress(item)}
                    style={[
                      styles.notificationItem,
                      !item.is_read ? styles.notificationItemUnread : undefined,
                      item.notification.is_urgent ? styles.notificationItemUrgentAccent : undefined,
                    ]}
                  >
                    <View style={styles.notificationItemHeader}>
                      {item.notification.is_urgent && (
                        <MaterialIcon name="alert-circle" fontSize={14} color="#b42318" />
                      )}
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.notificationItemTitle,
                          !item.is_read && styles.notificationItemTitleUnread,
                        ]}
                      >
                        {item.notification.title}
                      </Text>
                      <View style={styles.notificationItemActions}>
                        {item.notification.is_urgent && (
                          <View style={styles.notificationItemUrgentBadge}>
                            <Text style={styles.notificationItemUrgentText}>URGENTE</Text>
                          </View>
                        )}
                        {!item.is_read && <View style={styles.notificationItemDot} />}
                        <TouchableOpacity onPress={e => { e.stopPropagation(); onDeleteNotification(item); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Icon name="trash-can-outline" size={16} color="#9ca3af" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {item.notification.semester_info ? (
                      <View style={styles.notificationItemContext}>
                        <Icon name="school" size={11} color="#6b7280" />
                        <Text numberOfLines={1} style={styles.notificationItemContextText}>
                          {item.notification.semester_info.subject_name}
                          {item.notification.semester_info.period_label ? ` · ${item.notification.semester_info.period_label}` : ''}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.notificationItemContext}>
                        <Icon name="bullhorn" size={11} color="#6b7280" />
                        <Text numberOfLines={1} style={styles.notificationItemContextText}>Aviso institucional</Text>
                      </View>
                    )}
                    <Text numberOfLines={2} style={styles.notificationItemMessage}>
                      {item.notification.message}
                    </Text>
                    <ImageComponent
                      uri={item.notification.image}
                      imageStyle={styles.notificationItemThumbnail}
                      resizeMode="cover"
                    />
                    <Text numberOfLines={1} style={styles.notificationItemDate}>
                      {item.notification.sender_name
                        ? `${item.notification.sender_name} · ${formatDate(item.notification.created_at)}`
                        : formatDate(item.notification.created_at)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.notificationsSeeAll}
              onPress={() => {
                setShowNotificationsDropdown(false);
                navigation.navigate('Notifications');
              }}
            >
              <Text style={styles.notificationsSeeAllText}>Ver todas las notificaciones</Text>
              <Icon name="chevron-right" size={18} color={lightModeColors.institutional} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Screens that can appear as top-level direct tabs
const DIRECT_SCREEN_COMPONENTS: Record<string, React.ComponentType<any>> = {
  Home: HomeScreen,
  Calendar: CalendarScreen,
  TeacherHome: TeacherHomeScreen,
  AdminNotificationList: NotificationList,
  Map: MapScreen,
};

function isDarkTheme() {
  return Appearance.getColorScheme() === 'dark';
}

const styles = StyleSheet.create({
  headerRightRow: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  roleToggle: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#f1f5f9', marginRight: 4, overflow: 'hidden' },
  roleToggleOpt: { paddingHorizontal: 10, paddingVertical: 5 },
  roleToggleOptText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  roleToggleOptTextActive: { color: '#fff' },
  bellButton: { paddingVertical: 4, paddingHorizontal: 6 },
  badge: {
    position: 'absolute', top: -3, right: -4, minWidth: 18, height: 18,
    borderRadius: 9, paddingHorizontal: 4, backgroundColor: '#c1121f',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff',
  },
  roleSwitchContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: lightModeColors.institutional,
    borderRadius: 8,
  },
  roleTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  roleTabTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  notificationBellButton: {
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#c1121f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  notificationsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  notificationsLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingHorizontal: 12,
  },
  notificationsDropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6e8eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  notificationsHeader: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f1f3',
    backgroundColor: '#fbfcfe',
  },
  notificationsTitle: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
  },
  notificationsSubtitle: {
    marginTop: 2,
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  notificationsList: {
    flexGrow: 0,
  },
  notificationsListContent: {
    padding: 10,
    gap: 8,
  },
  notificationsEmptyContainer: {
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  notificationsEmptyText: {
    color: '#6b7280',
    textAlign: 'center',
    fontSize: 14,
  },
  notificationItem: {
    borderWidth: 1,
    borderColor: '#eceef2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  notificationItemUnread: {
    backgroundColor: '#eaf3ff',
    borderLeftWidth: 4,
    borderLeftColor: lightModeColors.institutional,
  },
  notificationItemTitleUnread: {
    color: lightModeColors.institutional,
    fontWeight: '800',
  },
  notificationItemUrgentAccent: {
    borderRightWidth: 4,
    borderRightColor: '#b42318',
  },
  notificationItemUrgentBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  notificationItemUrgentText: {
    color: '#b42318',
    fontSize: 9,
    fontWeight: '800',
  },
  notificationItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  notificationItemTitle: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  notificationItemMessage: {
    color: '#374151',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationItemDate: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
  },
  notificationItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  notificationItemThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginTop: 6,
    marginBottom: 6,
  },
  notificationItemContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  notificationItemContextText: {
    flex: 1,
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  notificationsSeeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 4,
  },
  notificationsSeeAllText: {
    color: lightModeColors.institutional,
    fontSize: 14,
    fontWeight: '600',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  fullScreenCloseText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenImageFallback: {
    backgroundColor: 'transparent',
  },
  toastLayer: {
    position: 'absolute',
    top: 72,
    left: 12,
    right: 12,
    alignItems: 'center',
    zIndex: 30,
  },
  toastCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dce5f6',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  toastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  toastLabel: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  toastUrgent: {
    color: '#b42318',
    fontSize: 10,
    fontWeight: '800',
  },
  toastTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  toastMessage: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  toastThumbnail: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    marginTop: 8,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

export default RootDrawer;
