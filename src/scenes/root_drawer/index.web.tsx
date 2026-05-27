import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Loading } from '../../components';
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
import FormsListScreen from '../forms/FormsListScreen';
import TeacherFormsScreen from '../teacher_forms/TeacherFormsScreen';
import FormsManagerScreen from '../admin_forms/FormsManagerScreen';
import NewsList from '../news/NewsList';
import NewsDetail from '../news/NewsDetail';
import NewsForm from '../news/NewsForm';
import MapScreen from '../map';
import UsefulLinksScreen from '../useful_links';
import ProfileScreen from '../my_account';
import ChangePasswordScreen from '../password/change';
import FiubaMapScreen from '../fiuba_map';
import ContactsScreen from '../contacts';
import BedeliaClassroomChangeForm from '../bedelia/ClassroomChangeForm';

import {
  resolveMenu, canToggleRole,
  MenuItem, SubmenuItem, DirectItem,
  studentMenu, teacherMenu, adminMenu, bedeliaMenu,
  hiddenWebRoutes,
} from './config/menu_config';
import NotificationsDropdown from './shared/NotificationsDropdown';
import HeaderRight from './shared/HeaderRight';
import ToastCard from './shared/ToastCard';
import UserMenuDropdown from './web/UserMenuDropdown';
import FiubaPlanScreen from '../fiuba_plan';

// Detail / sub-page screens that used to be Stack-only on web.
// IMPORTANT: import directly from each scene to avoid a circular dependency
// with the scenes barrel (which re-exports RootDrawer).
import ViewSemesterScreen from '../view_semester';
import MyAttendancesScreen from '../view_semester/MyAttendances';
import MySubmissionsScreen from '../view_semester/MySubmissions';
import CorrelativeSubjects from '../correlative_subjects';
import ViewEvaluationsScreen from '../view_evaluations';
import ViewEvaluationDetailsScreen from '../view_evaluation_details';
import AddEvaluationSubmissionScreen from '../view_evaluation_details/AddEvaluationSubmission';
import ViewFinalDetailsScreen from '../view_final_details';
import ViewClassDetailsScreen from '../view_class_details';
import TeachersScreen from '../teachers';
import TeacherSemesterStudentsScreen from '../teacher_semester/SemesterStudents';
import TeacherSemesterEditScreen from '../teacher_semester/SemesterEditScreen';
import TeacherEvaluationsListScreen from '../teacher_evaluations/EvaluationsList';
import TeacherAddEvaluationScreen from '../teacher_evaluations/AddEvaluation';
import TeacherEditEvaluationScreen from '../teacher_evaluations/EditEvaluation';
import TeacherSubmissionsListScreen from '../teacher_evaluations/SubmissionsList';
import TeacherSubmissionDetailsScreen from '../teacher_evaluations/SubmissionDetails';
import TeacherFinalsListScreen from '../teacher_finals/FinalsList';
import TeacherAddFinalScreen from '../teacher_finals/AddFinal';
import TeacherFinalExamSubmissionsScreen from '../teacher_finals/FinalExamSubmissions';
import TeacherStaffScreen from '../teacher_staff/Teachers';
import TeacherStaffConfigurationScreen from '../teacher_staff/TeachersConfiguration';
import TeacherAddStaffScreen from '../teacher_staff/AddTeachersConfigurationList';
import TeacherSemesterAttendancesScreen from '../teacher_attendances/SemesterAttendances';
import TeacherAttendanceDetailsScreen from '../teacher_attendances/AttendanceDetails';
import TeacherAddClassToSemesterScreen from '../teacher_attendances/AddClassToSemester';
import TeacherStatsScreen from '../teacher_stats';
import TeacherSemesterCardScreen from '../teacher_semester/SemesterCard';
import TeacherSendCommissionNotificationScreen from '../teacher_notifications/SendCommissionNotification';
import TeacherSemesterNotificationHistoryScreen from '../teacher_notifications/SemesterNotificationHistory';
import DocumentFormScreen from '../forms/DocumentFormScreen';
import DigitalFormScreen from '../forms/DigitalFormScreen';
import FormDesignerScreen from '../admin_forms/FormDesignerScreen';

type WebViewStyle = ViewStyle & { transition?: string };

const LudoIcon = require('../../assets/ludo_icon.png');

const Drawer = createDrawerNavigator();

// ─── Static helpers ───────────────────────────────────────────────────────────

const StudentDepartmentListScreen = () => <DepartmentList isAdmin={false} />;
const AdminDepartmentListScreen = () => <DepartmentList isAdmin={true} />;
const StudentNewsListScreen = () => <NewsList isAdmin={false} />;
const AdminNewsListScreen = () => <NewsList isAdmin={true} />;

const WEB_SCREEN_COMPONENTS: Record<string, React.ComponentType<any>> = {
  Home: HomeScreen,
  Calendar: CalendarScreen,
  CurrentCommissionInscriptions: CommissionInscriptionsScreen,
  ApprovedSubjects: ApprovedSubjectsScreen,
  PendingSubjects: PendingSubjectsScreen,
  StudentCredential: StudentCredentialScreen,
  StudentStats: StatsScreen,
  FormsList: FormsListScreen,
  Map: MapScreen,
  FiubaMap: FiubaMapScreen,
  Contacts: ContactsScreen,
  StudentDepartmentList: StudentDepartmentListScreen,
  TeacherHome: TeacherHomeScreen,
  CreateSemester: CreateSemester,
  TeacherForms: TeacherFormsScreen,
  AdminDepartmentList: AdminDepartmentListScreen,
  AdminCommissionList: CommissionList,
  AdminUserSearch: UserSearch,
  AdminNotificationList: NotificationList,
  FormsManager: FormsManagerScreen,
  BedeliaClassroomChange: BedeliaClassroomChangeForm,
  AdminDepartmentDetail: DepartmentDetail,
  AdminDepartmentCreate: DepartmentForm,
  AdminDepartmentEdit: DepartmentForm,
  AdminCommissionCreate: CommissionForm,
  AdminCommissionDetail: CommissionDetail,
  AdminCommissionEdit: CommissionForm,
  AdminUserDetail: UserDetail,
  AdminNotificationCreate: NotificationForm,
  Notifications: NotificationsScreen,
  StudentNewsList: StudentNewsListScreen,
  AdminNewsList: AdminNewsListScreen,
  NewsDetail: NewsDetail,
  AdminNewsCreate: NewsForm,
  AdminNewsEdit: NewsForm,
  StudentUsefulLinks: UsefulLinksScreen,
  TeacherUsefulLinks: UsefulLinksScreen,
  MyAccount: ProfileScreen,
  ChangePassword: ChangePasswordScreen,
  FiubaPlan: FiubaPlanScreen,

  // Student detail / sub-pages
  ViewSemester: ViewSemesterScreen,
  MyAttendances: MyAttendancesScreen,
  MySubmissions: MySubmissionsScreen,
  CorrelativeSubjects: CorrelativeSubjects,
  ViewEvaluations: ViewEvaluationsScreen,
  ViewEvaluationDetails: ViewEvaluationDetailsScreen,
  AddEvaluationSubmission: AddEvaluationSubmissionScreen,
  ViewFinalDetails: ViewFinalDetailsScreen,
  ViewClassDetails: ViewClassDetailsScreen,
  Teachers: TeachersScreen,
  Stats: StatsScreen,

  // Teacher cuatrimestre sub-pages
  SemesterCard: TeacherSemesterCardScreen,
  SemesterStudents: TeacherSemesterStudentsScreen,
  SemesterEditScreen: TeacherSemesterEditScreen,
  EvaluationsList: TeacherEvaluationsListScreen,
  AddEvaluation: TeacherAddEvaluationScreen,
  EditEvaluation: TeacherEditEvaluationScreen,
  SubmissionsList: TeacherSubmissionsListScreen,
  TeacherSubmissionDetails: TeacherSubmissionDetailsScreen,
  FinalsList: TeacherFinalsListScreen,
  AddFinal: TeacherAddFinalScreen,
  FinalExamSubmissions: TeacherFinalExamSubmissionsScreen,
  TeacherStaff: TeacherStaffScreen,
  TeachersConfiguration: TeacherStaffConfigurationScreen,
  AddTeachersConfigurationList: TeacherAddStaffScreen,
  SemesterAttendances: TeacherSemesterAttendancesScreen,
  AttendanceDetails: TeacherAttendanceDetailsScreen,
  AddClassToSemester: TeacherAddClassToSemesterScreen,
  TeacherStats: TeacherStatsScreen,
  SendCommissionNotification: TeacherSendCommissionNotificationScreen,
  SemesterNotificationHistory: TeacherSemesterNotificationHistoryScreen,

  // Forms detail screens
  DocumentForm: DocumentFormScreen,
  DigitalForm: DigitalFormScreen,
  FormDesigner: FormDesignerScreen,
};

const HIDDEN_OPTIONS = { drawerLabel: () => null, drawerItemStyle: { display: 'none' as const } };

// Every route that's reachable directly from the side menu (top-level item or
// any submenu child). Used to decide which screens are "roots" and therefore
// must NOT show a back arrow even if the drawer happens to remember a
// previously-focused screen.
function collectMenuRoutes(menu: MenuItem[]): string[] {
  const routes: string[] = [];
  for (const item of menu) {
    if (item.kind === 'direct' && item.route) routes.push(item.route);
    else if (item.kind === 'submenu') {
      for (const child of item.children) if (child.route) routes.push(child.route);
    }
  }
  return routes;
}
const ALL_MENU_ROUTES = new Set<string>([
  ...collectMenuRoutes(studentMenu),
  ...collectMenuRoutes(teacherMenu),
  ...collectMenuRoutes(adminMenu),
  ...collectMenuRoutes(bedeliaMenu),
]);

// Routes that on mobile are Stack screens (and therefore show a back arrow).
// On web they live inside the drawer, so we replicate the back arrow only for
// these — drawer-menu items don't get one, matching mobile behavior.
const BACK_ENABLED_ROUTES = new Set<string>(
  hiddenWebRoutes.map(r => r.route).filter(r => !ALL_MENU_ROUTES.has(r)),
);

function HeaderBackButton() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  // No back arrow for drawer-root screens; keep a spacer so the screen title
  // doesn't end up flush against the side drawer.
  if (!BACK_ENABLED_ROUTES.has(route.name) || !navigation.canGoBack()) {
    return <View style={styles.headerLeftSpacer} />;
  }
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.headerBackButton}
      accessibilityLabel="Volver"
    >
      <Icon name="arrow-left" size={24} color={lightModeColors.mainContrastColor} />
    </TouchableOpacity>
  );
}

function buildMenuScreens(user: User): Map<string, { title: string; condition: boolean }> {
  const result = new Map<string, { title: string; condition: boolean }>();

  const add = (menu: MenuItem[], condition: boolean) => {
    for (const item of menu) {
      const directs = item.kind === 'submenu' ? item.children : [item];
      for (const d of directs) {
        if (!d.route || d.action || d.platform === 'mobile') continue;
        const prev = result.get(d.route);
        result.set(d.route, { title: d.label, condition: prev ? prev.condition || condition : condition });
      }
    }
  };

  add(studentMenu, user.isStudent());
  add(teacherMenu, user.isTeacher());
  add(adminMenu, user.isAdmin() && !(user.isBedelia?.() ?? false));
  add(bedeliaMenu, user.isBedelia?.() ?? false);

  return result;
}

const RAIL_WIDTH = 80;
const SIDEBAR_WIDTH = 260;

// ─── Custom Drawer Content ────────────────────────────────────────────────────

type WebDrawerContentProps = DrawerContentComponentProps & {
  user: User | null;
  menuItems: MenuItem[];
  canToggle: boolean;
  activeRole: 'student' | 'teacher';
  expanded: boolean;
  onSetExpanded: (val: boolean) => void;
};

function WebDrawerContent(props: WebDrawerContentProps) {
  const { menuItems, canToggle, activeRole, expanded, onSetExpanded, navigation, user, ...drawerProps } = props;
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());

  const activeRoute = props.state.routes[props.state.index]?.name ?? '';

  // Auto-expand the submenu that contains the active route
  useEffect(() => {
    for (const item of menuItems) {
      if (item.kind === 'submenu') {
        const hasActive = item.children.some(c => c.route === activeRoute);
        if (hasActive) {
          setOpenSubmenus(new Set([item.key]));
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
    if (item.route) {
      // Drawer menu items are navigation roots — reset the drawer history so
      // the back arrow on sub-pages doesn't surface unrelated screens the user
      // previously visited (e.g. MyAccount opened via the header user icon).
      navigation.reset({ index: 0, routes: [{ name: item.route as never }] });
    }
  };

  const handleSubmenuToggle = (key: string) => {
    setOpenSubmenus(prev => prev.has(key) ? new Set() : new Set([key]));
  };

  const itemColor = () => {
    if (canToggle && activeRole === 'teacher') return lightModeColors.teacherAccent;
    return lightModeColors.institutional;
  };

  const isActive = (route?: string) => !!route && route === activeRoute;

  return (
    <View style={{ flex: 1 }}>
      {/* Header — outside the scroll view so it stays visible when the menu is tall */}
      <View style={expanded ? styles.toggleButtonContainer : styles.toggleButtonContainerCollapsed}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={LudoIcon} style={styles.logoImage} />
          {expanded && (
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10, color: lightModeColors.institutional, letterSpacing: 1 }}>LUDO</Text>
          )}
        </View>
        {expanded && (
          <TouchableOpacity onPress={() => onSetExpanded(false)} style={styles.iconBox} accessibilityLabel="Colapsar menú">
            <Icon name="close" size={24} color={lightModeColors.darkGray} />
          </TouchableOpacity>
        )}
      </View>

      <DrawerContentScrollView {...drawerProps} style={styles.drawerScroll} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Expand arrow — only when collapsed */}
        {!expanded && (
          <>
            <TouchableOpacity onPress={() => onSetExpanded(true)} style={styles.expandArrowButton} accessibilityLabel="Expandir menú">
              <Icon name="chevron-right" size={20} color={lightModeColors.darkGray} />
            </TouchableOpacity>
            <View style={styles.menuSeparator} />
          </>
        )}

        {/* Menu items */}
        <View style={styles.menuList}>
          {menuItems.map(item => {
            const accentColor = itemColor();

            if (item.kind === 'direct') {
              const active = isActive(item.route);
              return (
                <TouchableOpacity
                  key={item.key}
                  // @ts-expect-error — title is a valid HTML attribute on web for native tooltips
                  title={expanded ? undefined : item.label}
                  onPress={() => handleDirectPress(item)}
                  accessibilityLabel={item.label}
                  style={[styles.menuRow, expanded && { alignSelf: 'stretch' }, active && { backgroundColor: `${accentColor}18` }]}
                >
                  <View style={styles.iconBox}>
                    <Icon name={active ? item.icon : item.iconOutline} size={20} color={active ? accentColor : lightModeColors.darkGray} />
                  </View>
                  {expanded && (
                    <Text style={[styles.menuLabel, { color: active ? accentColor : lightModeColors.darkGray }]}>{item.label}</Text>
                  )}
                </TouchableOpacity>
              );
            }

            // Submenu
            const submenuItem = item as SubmenuItem;
            const isOpen = openSubmenus.has(item.key);
            const hasActiveChild = submenuItem.children.some(c => isActive(c.route));
            const headerColor = hasActiveChild ? accentColor : lightModeColors.darkGray;

            return (
              <View key={item.key} style={expanded && { alignSelf: 'stretch' }}>
                <TouchableOpacity
                  // @ts-ignore
                  title={expanded ? undefined : item.label}
                  onPress={() => {
                    if (!expanded) {
                      onSetExpanded(true);
                      setOpenSubmenus(new Set([item.key]));
                    } else {
                      handleSubmenuToggle(item.key);
                    }
                  }}
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
                      const childAccent = itemColor();
                      const childActive = isActive(child.route);
                      return (
                        <TouchableOpacity
                          key={child.key}
                          onPress={() => handleDirectPress(child)}
                          accessibilityLabel={child.label}
                          style={[styles.submenuRow, childActive && { backgroundColor: `${childAccent}18` }]}
                        >
                          <Icon name={childActive ? child.icon : child.iconOutline} size={18} color={childActive ? childAccent : lightModeColors.darkGray} style={styles.submenuIcon} />
                          <Text style={[styles.submenuLabel, { color: childActive ? childAccent : lightModeColors.darkGray }]}>{child.label}</Text>
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
    </View>
  );
}

// ─── Root Drawer ──────────────────────────────────────────────────────────────

const RootDrawer = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<'student' | 'teacher'>('student');
  const [expanded, setExpanded] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
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

  const toggleExpanded = (val: boolean) => {
    setExpanded(val);
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
        // On a browser reload, deep linking bypasses Splash, so the in-memory
        // access token is gone. Hydrate from the httpOnly cookie before making
        // any authenticated request; if it fails, the session is expired and we
        // send the user to Landing.
        const sessionManager = SessionManager.getInstance();
        if (!sessionManager.getAuthToken()) {
          const ok = await sessionManager.getCredentials();
          if (!ok) {
            navigation.replace('Landing');
            return;
          }
        }
        const fetchedUser = await usersRepository.getInfo();
        setUser(fetchedUser);
        dispatch(fetchUserDataAsync(fetchedUser));
        setActiveRole(fetchedUser.isTeacher() && !fetchedUser.isStudent() ? 'teacher' : 'student');
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

  const canToggle = canToggleRole(user);
  const menuItems = resolveMenu(user, activeRole);
  const homeMenuItem = menuItems.find(i => i.kind === 'direct' && (i as DirectItem).route) as DirectItem | undefined;

  const onNotificationPress = async (item: UserNotification) => {
    if (item.is_read) return;
    try {
      await notificationsRepository.markNotificationAsRead(item.id);
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.log('RootDrawer (Web): Failed marking notification as read', e);
    }
  };

  const onDeleteNotification = async (item: UserNotification) => {
    try {
      await notificationsRepository.deleteNotification(item.id);
      setNotifications(prev => prev.filter(n => n.id !== item.id));
    } catch (e) {
      console.log('RootDrawer (Web): Failed deleting notification', e);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  };

  const handleLogout = async () => {
    await GoogleSignin.signOut();
    await SessionManager.getInstance()?.clearCredentials();
    navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
  };

  const HeaderRightInDrawer = () => (
    <HeaderRight
      canToggle={canToggle}
      activeRole={activeRole}
      onSetActiveRole={setActiveRole}
      unreadCount={unreadCount}
      onBellPress={() => setShowNotificationsDropdown(true)}
      colors={lightModeColors}
      user={user}
      onUserPress={() => setShowUserDropdown(true)}
    />
  );
  const headerRight = () => <HeaderRightInDrawer />;

  const menuScreens = buildMenuScreens(user);

  return (
    <>
      <Drawer.Navigator
        initialRouteName={homeMenuItem?.route}
        // Default 'firstRoute' makes goBack jump to the first registered
        // Drawer.Screen (which is the first menu item, e.g. MyAccount), instead
        // of the previously focused screen. 'history' tracks actual visits.
        backBehavior="history"
        screenOptions={{
          drawerType: 'permanent',
          drawerStyle: {
            width: expanded ? SIDEBAR_WIDTH : RAIL_WIDTH,
            borderRightWidth: 1,
            borderRightColor: lightModeColors.lightGray,
            ...(Platform.OS === 'web' ? { transition: 'width 0.2s ease' } as WebViewStyle : {})
          },
          headerLeft: () => <HeaderBackButton />,
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
            canToggle={canToggle}
            activeRole={activeRole}
            expanded={expanded}
            onSetExpanded={toggleExpanded}
          />
        )}
      >
        {Array.from(menuScreens.entries())
          .filter(([route, { condition }]) => condition && WEB_SCREEN_COMPONENTS[route])
          .map(([route, { title }]) => (
            <Drawer.Screen key={route} name={route} component={WEB_SCREEN_COMPONENTS[route]} options={{ title }} />
          ))}
        {hiddenWebRoutes
          .filter(r => {
            if (!r.roleFilter) return true;
            return (
              (r.roleFilter === 'admin' && user.isAdmin()) ||
              (r.roleFilter === 'teacher' && user.isTeacher()) ||
              (r.roleFilter === 'student' && user.isStudent())
            );
          })
          .filter(r => WEB_SCREEN_COMPONENTS[r.route])
          .map(r => (
            <Drawer.Screen key={r.route} name={r.route} component={WEB_SCREEN_COMPONENTS[r.route]} options={{ title: r.title, ...HIDDEN_OPTIONS }} />
          ))}
      </Drawer.Navigator>

      <ToastCard
        notification={toastNotification!}
        visible={showToast && !!toastNotification && !showNotificationsDropdown}
        onPress={() => { setShowToast(false); setShowNotificationsDropdown(true); }}
      />

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

      <UserMenuDropdown
        visible={showUserDropdown}
        user={user}
        onClose={() => setShowUserDropdown(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

const styles = StyleSheet.create({
  drawerScroll: { flex: 1, minWidth: 50 },
  toggleButtonContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 64, borderBottomWidth: 1, borderBottomColor: lightModeColors.lightGray,
  },
  toggleButtonContainerCollapsed: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 64, borderBottomWidth: 1, borderBottomColor: lightModeColors.lightGray,
  },
  toggleButton: { padding: 12, margin: 4 },
  logoImage: { width: 40, height: 40 },
  iconBox: { width: 45, height: 45, padding: 12, margin: 2, alignItems: 'center', justifyContent: 'center' },
  expandArrowButton: { alignSelf: 'center', width: 45, height: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 8, marginVertical: 4 },
  menuSeparator: { height: 1, backgroundColor: lightModeColors.lightGray, marginHorizontal: 8, marginBottom: 8 },
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
  headerBackButton: { paddingVertical: 4, paddingHorizontal: 12, marginLeft: 4 },
  headerLeftSpacer: { width: 16 },
});

export default RootDrawer;
