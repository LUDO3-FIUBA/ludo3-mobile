import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import {
  Appearance,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Loading } from '../../components';
import HeaderRight from './shared/HeaderRight';
import ToastCard from './shared/ToastCard';
import FullScreenImageModal from './mobile/FullScreenImageModal';
import NotificationsDropdown from './shared/NotificationsDropdown';
import { usersRepository } from '../../repositories';
import notificationsRepository, { UserNotification } from '../../repositories/notifications';
import User from '../../models/User';
import { useAppDispatch } from '../../redux/hooks';
import { fetchUserDataAsync } from '../../redux/reducers/teacherUserDataSlice';
import { setProfilePhoto } from '../../redux/reducers/currentUserSlice';
import { darkModeColors, lightModeColors } from '../../styles/colorPalette';
import HomeScreen from '../home';
import CalendarScreen from '../calendar';
import TeacherHomeScreen from '../teacher_home';
import NotificationList from '../admin_notifications/NotificationList';
import MapScreen from '../map';
import FiubaMapScreen from '../fiuba_map';
import SubmenuScreen from '../submenu';
import DepartmentList from '../admin_departments/DepartmentList';
import CommissionList from '../admin_commissions/CommissionList';
import UserSearch from '../admin_users/UserSearch';
import NewsList from '../news/NewsList';
import BedeliaClassroomChangeForm from '../bedelia/ClassroomChangeForm';
import { resolveMenu, canToggleRole, SubmenuItem, DirectItem } from './config/menu_config';

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
        dispatch(setProfilePhoto(fetchedUser.profilePhoto));
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

  const headerRight = () => (
    <HeaderRight
      canToggle={canToggle}
      activeRole={activeRole}
      onSetActiveRole={setActiveRole}
      unreadCount={unreadCount}
      onBellPress={() => setShowNotificationsDropdown(true)}
      colors={colors}
    />
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
      const DirectComp = item.route ? DIRECT_SCREEN_COMPONENTS[item.route] : undefined;
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

      <ToastCard
        notification={toastNotification!}
        visible={showToast && !!toastNotification && !showNotificationsDropdown}
        onPress={openDropdownFromToast}
      />

      <FullScreenImageModal uri={fullScreenImage} onClose={() => setFullScreenImage(null)} />

      <NotificationsDropdown
        visible={showNotificationsDropdown}
        notifications={notifications}
        unreadCount={unreadCount}
        dropdownWidth={dropdownWidth}
        dropdownMaxHeight={dropdownMaxHeight}
        onClose={() => setShowNotificationsDropdown(false)}
        onNotificationPress={onNotificationPress}
        onDeleteNotification={onDeleteNotification}
        onSeeAll={() => { setShowNotificationsDropdown(false); navigation.navigate('Notifications'); }}
        formatDate={formatDate}
      />
    </>
  );
};

// Screens that can appear as top-level direct tabs
const StudentDepartmentListScreen = () => <DepartmentList isAdmin={false} />;
const AdminDepartmentListScreen = () => <DepartmentList isAdmin={true} />;
const StudentNewsListScreen = () => <NewsList isAdmin={false} />;
const AdminNewsListScreen = () => <NewsList isAdmin={true} />;

const DIRECT_SCREEN_COMPONENTS: Record<string, React.ComponentType<any>> = {
  Home: HomeScreen,
  Calendar: CalendarScreen,
  TeacherHome: TeacherHomeScreen,
  AdminNotificationList: NotificationList,
  Map: MapScreen,
  FiubaMap: FiubaMapScreen,
  StudentDepartmentList: StudentDepartmentListScreen,
  AdminDepartmentList: AdminDepartmentListScreen,
  AdminCommissionList: CommissionList,
  AdminUserSearch: UserSearch,
  StudentNewsList: StudentNewsListScreen,
  AdminNewsList: AdminNewsListScreen,
  BedeliaClassroomChange: BedeliaClassroomChangeForm,
};

function isDarkTheme() {
  return Appearance.getColorScheme() === 'dark';
}

export default RootDrawer;
