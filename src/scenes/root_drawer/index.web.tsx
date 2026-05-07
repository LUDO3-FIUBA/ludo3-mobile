import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Loading, ProfileOverview } from '../../components';
import { SessionManager } from '../../managers';
import { lightModeColors } from '../../styles/colorPalette';
import { usersRepository } from '../../repositories';
import notificationsRepository, { UserNotification } from '../../repositories/notifications';
import User from '../../models/User';
import { useAppDispatch } from '../../redux/hooks';
import { fetchUserDataAsync } from '../../redux/reducers/teacherUserDataSlice';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Screens
import HomeScreen from '../home';
import CalendarScreen from '../calendar';
import CommissionInscriptionsScreen from '../commission_inscriptions';
import ApprovedSubjectsScreen from '../approved_subjects';
import PendingSubjectsScreen from '../pending_subjects';
import StatsScreen from '../stats';
import TeacherHomeScreen from '../teacher_home';
import CreateSemester from '../teacher_semester/CreateSemester';
import TeacherProfileScreen from '../teacher_profile';
import DepartmentList from '../admin_departments/DepartmentList';
import DepartmentDetail from '../admin_departments/DepartmentDetail';
import DepartmentForm from '../admin_departments/DepartmentForm';
import CommissionList from '../admin_commissions/CommissionList';
import CommissionDetail from '../admin_commissions/CommissionDetail';
import CommissionForm from '../admin_commissions/CommissionForm';
import UserSearch from '../admin_users/UserSearch';
import UserDetail from '../admin_users/UserDetail';
import NotificationList from '../admin_notifications/NotificationList';
import NotificationForm from '../admin_notifications/NotificationForm';
import NotificationsScreen from '../notifications';
import StudentCredentialScreen from '../student_credential';
import StudentProceduresScreen from '../student_procedures';
import TeacherProceduresValidationScreen from '../teacher_procedures_validation';
import AdminProceduresManagerScreen from '../admin_procedures';

import { resolveMenu, isMergedMenu, MenuItem, SubmenuItem, DirectItem } from './menu_config';

const LudoIcon = require('../../assets/ludo_icon.png');

const Drawer = createDrawerNavigator();

const RAIL_WIDTH = 80;
const SIDEBAR_WIDTH = 260;
const STORAGE_KEY = '@sidebar_expanded';

// ─── Custom Drawer Content ────────────────────────────────────────────────────

type WebDrawerContentProps = DrawerContentComponentProps & {
  user: User | null;
  menuItems: MenuItem[];
  merged: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
};

function WebDrawerContent(props: WebDrawerContentProps) {
  const { user, menuItems, merged, expanded, onToggleExpanded, navigation } = props;
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const activeRoute = props.state.routes[props.state.index]?.name ?? '';

  // Auto-expand the submenu that contains the active route
  useEffect(() => {
    for (const item of menuItems) {
      if (item.kind === 'submenu') {
        const hasActive = item.children.some(c => c.route === activeRoute);
        if (hasActive) {
          setOpenSubmenu(item.key);
          return;
        }
      }
    }
  }, [activeRoute, menuItems]);

  const handleDirectPress = async (item: DirectItem) => {
    if (item.action === 'logout') {
      await GoogleSignin.signOut();
      await SessionManager.getInstance()?.clearCredentials();
      navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
      return;
    }
    if (item.route) navigation.navigate(item.route as never);
  };

  const handleSubmenuToggle = (key: string) => {
    setOpenSubmenu(prev => (prev === key ? null : key));
  };

  const itemColor = (item: DirectItem) => {
    if (merged && item.scope === 'teacher') return lightModeColors.teacherAccent;
    return lightModeColors.institutional;
  };

  const isActive = (route?: string) => !!route && route === activeRoute;

  return (
    <DrawerContentScrollView {...props} scrollEnabled={false} style={styles.drawerScroll}>
      {/* Toggle button */}
      <View style={expanded ? styles.toggleButtonContainer : styles.toggleButtonContainerCollapsed}>
        <Image source={LudoIcon} style={styles.logoImage} />
        <TouchableOpacity onPress={onToggleExpanded} style={expanded ? styles.toggleButton : styles.iconBox} accessibilityLabel={expanded ? 'Colapsar menú' : 'Expandir menú'}>
          <Icon name={expanded ? 'chevron-left' : 'chevron-right'} size={20} color={lightModeColors.darkGray} />
        </TouchableOpacity>
      </View>

      {/* Profile overview — only when expanded */}
      {expanded && (
        <View style={styles.profileSection}>
          <ProfileOverview />
        </View>
      )}

      {/* Menu items */}
      <View style={styles.menuList}>
        {menuItems.map(item => {
          const isTeacher = merged && item.scope === 'teacher';
          const accentColor = isTeacher ? lightModeColors.teacherAccent : lightModeColors.institutional;

          if (item.kind === 'direct') {
            const active = isActive(item.route);
            return (
              <TouchableOpacity
                key={item.key}
                // @ts-ignore — title is a valid HTML attribute on web for native tooltips
                title={expanded ? undefined : item.label}
                onPress={() => handleDirectPress(item)}
                accessibilityLabel={`${item.label}${isTeacher ? ', sólo docente' : ''}`}
                style={[styles.menuRow, expanded && { alignSelf: 'stretch' }, active && { backgroundColor: `${accentColor}18` }, active && isTeacher && styles.teacherActiveBorder]}
              >
                <View style={styles.iconBox}>
                  <Icon name={active ? item.icon : item.iconOutline} size={20} color={active ? accentColor : lightModeColors.darkGray} />
                </View>
                {expanded && (
                  <>
                    <Text style={[styles.menuLabel, { color: active ? accentColor : lightModeColors.darkGray }]}>{item.label}</Text>
                    {isTeacher && <View style={styles.teacherPill}><Text style={styles.teacherPillText}>Docente</Text></View>}
                  </>
                )}
              </TouchableOpacity>
            );
          }

          // Submenu
          const submenuItem = item as SubmenuItem;
          const isOpen = openSubmenu === item.key;
          const hasActiveChild = submenuItem.children.some(c => isActive(c.route));
          const headerColor = hasActiveChild ? accentColor : lightModeColors.darkGray;

          return (
            <View key={item.key} style={expanded && { alignSelf: 'stretch' }}>
              <TouchableOpacity
                // @ts-ignore
                title={expanded ? undefined : item.label}
                onPress={() => { if (expanded) { handleSubmenuToggle(item.key); } else { onToggleExpanded(); setOpenSubmenu(item.key); } }}
                accessibilityLabel={item.label}
                style={[styles.menuRow, expanded && { alignSelf: 'stretch' }, hasActiveChild && !expanded && { backgroundColor: `${accentColor}18` }]}
              >
                <View style={styles.iconBox}>
                  <Icon name={hasActiveChild ? item.icon : item.iconOutline} size={20} color={headerColor} />
                </View>
                {expanded && (
                  <>
                    <Text style={[styles.menuLabel, { color: headerColor, flex: 1 }]}>{item.label}</Text>
                    <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={lightModeColors.darkGray} />
                  </>
                )}
              </TouchableOpacity>

              {expanded && isOpen && (
                <View style={styles.submenuList}>
                  {submenuItem.children.map(child => {
                    const childIsTeacher = merged && child.scope === 'teacher';
                    const childAccent = childIsTeacher ? lightModeColors.teacherAccent : lightModeColors.institutional;
                    const childActive = isActive(child.route);
                    return (
                      <TouchableOpacity
                        key={child.key}
                        onPress={() => handleDirectPress(child)}
                        accessibilityLabel={`${child.label}${childIsTeacher ? ', sólo docente' : ''}`}
                        style={[styles.submenuRow, childActive && { backgroundColor: `${childAccent}18` }, childActive && childIsTeacher && styles.teacherActiveBorder]}
                      >
                        <Icon name={childActive ? child.icon : child.iconOutline} size={18} color={childActive ? childAccent : lightModeColors.darkGray} style={styles.submenuIcon} />
                        <Text style={[styles.submenuLabel, { color: childActive ? childAccent : lightModeColors.darkGray }]}>{child.label}</Text>
                        {childIsTeacher && <View style={styles.teacherPill}><Text style={styles.teacherPillText}>Docente</Text></View>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}

// ─── Root Drawer ──────────────────────────────────────────────────────────────

const RootDrawer = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastNotification, setToastNotification] = useState<UserNotification | null>(null);
  const hasLoadedNotificationsRef = useRef(false);
  const knownNotificationIdsRef = useRef<Set<number>>(new Set());
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.is_read).length,
    [notifications],
  );

  const dropdownWidth = Math.min(Math.max(screenWidth - 24, 280), 380);
  const dropdownMaxHeight = Math.min(screenHeight * 0.7, 520);

  // Persist expanded state
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val !== null) setExpanded(val === 'true');
    });
  }, []);

  const toggleExpanded = () => {
    setExpanded(prev => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationsRepository.fetchMyNotifications();
      const sorted = [...data].sort(
        (a, b) => new Date(b.notification.created_at).getTime() - new Date(a.notification.created_at).getTime(),
      );
      if (!hasLoadedNotificationsRef.current) {
        knownNotificationIdsRef.current = new Set(sorted.map(i => i.id));
        hasLoadedNotificationsRef.current = true;
      } else {
        const incomingUnread = sorted.find(i => !knownNotificationIdsRef.current.has(i.id) && !i.is_read);
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
      console.log('RootDrawer (Web): Failed to fetch notifications', e);
    }
  }, [showNotificationsDropdown]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const fetchedUser = await usersRepository.getInfo();
        setUser(fetchedUser);
        dispatch(fetchUserDataAsync(fetchedUser));
      } catch (e) {
        console.log('RootDrawer (Web): Failed to fetch user', e);
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

  const menuItems = resolveMenu(user);
  const merged = isMergedMenu(user);

  const markAsRead = async (item: UserNotification) => {
    if (item.is_read) return;
    try {
      await notificationsRepository.markNotificationAsRead(item.id);
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.log('RootDrawer (Web): Failed marking notification as read', e);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  };

  const headerRight = () => (
    <TouchableOpacity onPress={() => setShowNotificationsDropdown(true)} style={styles.bellButton} accessibilityLabel="Mostrar notificaciones">
      <Icon name="bell-outline" size={24} color={lightModeColors.mainContrastColor} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const StudentDepartmentListScreen = () => <DepartmentList isAdmin={false} />;
  const AdminDepartmentListScreen = () => <DepartmentList isAdmin={true} />;
  const hidden = { drawerLabel: () => null, drawerItemStyle: { display: 'none' as const } };

  return (
    <>
      <Drawer.Navigator
        screenOptions={{
          drawerType: 'permanent',
          drawerStyle: { width: expanded ? SIDEBAR_WIDTH : RAIL_WIDTH, borderRightWidth: 1, borderRightColor: lightModeColors.lightGray },
          headerLeft: () => null,
          headerRight,
          headerTintColor: lightModeColors.mainContrastColor,
          headerStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: lightModeColors.lightGray },
          drawerActiveTintColor: lightModeColors.institutional,
          drawerInactiveTintColor: lightModeColors.darkGray,
        }}
        drawerContent={drawerProps => (
          <WebDrawerContent
            {...drawerProps}
            user={user}
            menuItems={menuItems}
            merged={merged}
            expanded={expanded}
            onToggleExpanded={toggleExpanded}
          />
        )}
      >
        {/* ── Student ── */}
        <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
        <Drawer.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendario' }} />
        <Drawer.Screen name="CurrentCommissionInscriptions" component={CommissionInscriptionsScreen} options={{ title: 'Materias en curso' }} />
        <Drawer.Screen name="ApprovedSubjects" component={ApprovedSubjectsScreen} options={{ title: 'Materias aprobadas' }} />
        <Drawer.Screen name="PendingSubjects" component={PendingSubjectsScreen} options={{ title: 'Materias pendientes' }} />
        <Drawer.Screen name="StudentCredential" component={StudentCredentialScreen} options={{ title: 'Mi credencial' }} />
        <Drawer.Screen name="StudentStats" component={StatsScreen} options={{ title: 'Estadísticas' }} />
        <Drawer.Screen name="StudentDepartmentList" component={StudentDepartmentListScreen} options={{ title: 'Departamentos' }} />
        <Drawer.Screen name="StudentProcedures" component={StudentProceduresScreen} options={{ title: 'Trámites' }} />

        {/* ── Teacher ── */}
        <Drawer.Screen name="TeacherHome" component={TeacherHomeScreen} options={{ title: 'Mis Comisiones' }} />
        <Drawer.Screen name="CreateSemester" component={CreateSemester} options={{ title: 'Crear cuatrimestre' }} />
        <Drawer.Screen name="TeacherProfile" component={TeacherProfileScreen} options={{ title: 'Mi perfil profesional' }} />
        <Drawer.Screen name="TeacherProceduresValidation" component={TeacherProceduresValidationScreen} options={{ title: 'Validación de trámites' }} />

        {/* ── Admin ── */}
        <Drawer.Screen name="AdminDepartmentList" component={AdminDepartmentListScreen} options={{ title: 'Departamentos' }} />
        <Drawer.Screen name="AdminCommissionList" component={CommissionList} options={{ title: 'Comisiones' }} />
        <Drawer.Screen name="AdminUserSearch" component={UserSearch} options={{ title: 'Buscar Usuarios' }} />
        <Drawer.Screen name="AdminNotificationList" component={NotificationList} options={{ title: 'Avisos' }} />
        <Drawer.Screen name="AdminProceduresManager" component={AdminProceduresManagerScreen} options={{ title: 'Gestor de Trámites' }} />

        {/* ── Hidden detail routes ── */}
        <Drawer.Screen name="AdminDepartmentDetail" component={DepartmentDetail} options={{ title: 'Departamento', ...hidden }} />
        <Drawer.Screen name="AdminDepartmentCreate" component={DepartmentForm} options={{ title: 'Nuevo Departamento', ...hidden }} />
        <Drawer.Screen name="AdminDepartmentEdit" component={DepartmentForm} options={{ title: 'Editar Departamento', ...hidden }} />
        <Drawer.Screen name="AdminCommissionCreate" component={CommissionForm} options={{ title: 'Nueva Comisión', ...hidden }} />
        <Drawer.Screen name="AdminCommissionDetail" component={CommissionDetail} options={{ title: 'Comisión', ...hidden }} />
        <Drawer.Screen name="AdminCommissionEdit" component={CommissionForm} options={{ title: 'Editar Comisión', ...hidden }} />
        <Drawer.Screen name="AdminUserDetail" component={UserDetail} options={{ title: 'Usuario', ...hidden }} />
        <Drawer.Screen name="AdminNotificationCreate" component={NotificationForm} options={{ title: 'Nuevo Aviso', ...hidden }} />

        {/* ── Shared ── */}
        <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones', ...hidden }} />
      </Drawer.Navigator>

      {/* Toast */}
      {showToast && toastNotification && !showNotificationsDropdown && (
        <View pointerEvents="box-none" style={styles.toastLayer}>
          <TouchableOpacity activeOpacity={0.92} style={styles.toastCard} onPress={() => { setShowToast(false); setShowNotificationsDropdown(true); }}>
            <View style={styles.toastHeader}>
              <Text style={styles.toastLabel}>Nueva notificación</Text>
              {toastNotification.notification.is_urgent && <Text style={styles.toastUrgent}>URGENTE</Text>}
            </View>
            <Text numberOfLines={1} style={styles.toastTitle}>{toastNotification.notification.title}</Text>
            <Text numberOfLines={2} style={styles.toastMessage}>{toastNotification.notification.message}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications dropdown */}
      <Modal visible={showNotificationsDropdown} transparent animationType="fade" onRequestClose={() => setShowNotificationsDropdown(false)}>
        <TouchableOpacity style={styles.notificationsBackdrop} activeOpacity={1} onPress={() => setShowNotificationsDropdown(false)} />
        <View pointerEvents="box-none" style={styles.notificationsLayer}>
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
                    onPress={() => markAsRead(item)}
                    style={[styles.notificationItem, !item.is_read && styles.notificationItemUnread]}
                  >
                    <View style={styles.notificationItemHeader}>
                      <Text numberOfLines={1} style={[styles.notificationItemTitle, !item.is_read && styles.notificationItemTitleUnread]}>
                        {item.notification.title}
                      </Text>
                      {!item.is_read && <View style={styles.notificationItemDot} />}
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
                    <Text numberOfLines={2} style={styles.notificationItemMessage}>{item.notification.message}</Text>
                    <Text numberOfLines={1} style={styles.notificationItemDate}>
                      {item.notification.sender_name ? `${item.notification.sender_name} · ${formatDate(item.notification.created_at)}` : formatDate(item.notification.created_at)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.notificationsSeeAll}
              onPress={() => { setShowNotificationsDropdown(false); navigation.navigate('RootDrawer', { screen: 'Notifications' }); }}
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

const styles = StyleSheet.create({
  drawerScroll: { flex: 1, minWidth: 50 },
  toggleButtonContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 8 },
  toggleButtonContainerCollapsed: { alignItems: 'center', paddingVertical: 8 },
  toggleButton: { padding: 12, margin: 4 },
  logoImage: { width: 40, height: 40 },
  iconBox: { width: 45, height: 45, padding: 12, margin: 2, alignItems: 'center', justifyContent: 'center' },
  profileSection: { borderBottomWidth: 1, borderBottomColor: lightModeColors.lightGray, marginBottom: 8 },
  menuList: { paddingHorizontal: 4, minWidth: 50, alignItems: 'center' },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, marginVertical: 2,
  },
  menuLabel: { fontSize: 14, fontWeight: '500', marginLeft: 6, flex: 1 },
  submenuList: { paddingLeft: 16, paddingBottom: 4 },
  submenuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, height: 40,
    borderRadius: 8, marginVertical: 1,
  },
  submenuIcon: { marginRight: 10 },
  submenuLabel: { flex: 1, fontSize: 13, fontWeight: '500' },
  teacherActiveBorder: { borderLeftWidth: 2, borderLeftColor: lightModeColors.teacherAccent },
  teacherPill: { backgroundColor: lightModeColors.teacherAccent, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 6 },
  teacherPillText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  bellButton: { marginRight: 16, paddingVertical: 4, paddingHorizontal: 6 },
  badge: { position: 'absolute', top: -3, right: -4, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: '#c1121f', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  notificationsBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  notificationsLayer: { ...StyleSheet.absoluteFillObject, alignItems: 'flex-end', paddingTop: 76, paddingHorizontal: 14 },
  notificationsDropdown: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e6e8eb', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 12, overflow: 'hidden' },
  notificationsHeader: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f1f3', backgroundColor: '#fbfcfe' },
  notificationsTitle: { color: '#1f2937', fontSize: 16, fontWeight: '700' },
  notificationsSubtitle: { marginTop: 2, color: '#6b7280', fontSize: 12, fontWeight: '500' },
  notificationsList: { flexGrow: 0 },
  notificationsListContent: { padding: 10, gap: 8 },
  notificationsEmptyContainer: { paddingHorizontal: 14, paddingVertical: 20 },
  notificationsEmptyText: { color: '#6b7280', textAlign: 'center', fontSize: 14 },
  notificationItem: { borderWidth: 1, borderColor: '#eceef2', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#fff' },
  notificationItemUnread: { backgroundColor: '#eaf3ff', borderLeftWidth: 4, borderLeftColor: lightModeColors.institutional },
  notificationItemTitleUnread: { color: lightModeColors.institutional, fontWeight: '800' },
  notificationItemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  notificationItemTitle: { flex: 1, color: '#111827', fontSize: 14, fontWeight: '700' },
  notificationItemMessage: { color: '#374151', fontSize: 13, lineHeight: 18, marginBottom: 6 },
  notificationItemDate: { color: '#6b7280', fontSize: 11, fontWeight: '500' },
  notificationItemDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb' },
  notificationItemContext: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  notificationItemContextText: { flex: 1, fontSize: 11, color: '#6b7280', fontWeight: '600' },
  notificationsSeeAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#eee', gap: 4 },
  notificationsSeeAllText: { color: lightModeColors.institutional, fontSize: 14, fontWeight: '600' },
  toastLayer: { position: 'absolute', top: 72, left: 12, right: 12, alignItems: 'center', zIndex: 30 },
  toastCard: { width: '100%', maxWidth: 520, borderRadius: 14, borderWidth: 1, borderColor: '#dce5f6', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 8 },
  toastHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  toastLabel: { color: '#334155', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  toastUrgent: { color: '#b42318', fontSize: 10, fontWeight: '800' },
  toastTitle: { color: '#0f172a', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  toastMessage: { color: '#334155', fontSize: 13, lineHeight: 18 },
});

export default RootDrawer;
