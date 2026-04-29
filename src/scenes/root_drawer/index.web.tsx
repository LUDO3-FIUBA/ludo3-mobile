import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import HomeScreen from "../home";
import CalendarScreen from "../calendar";
import CommissionInscriptionsScreen from "../commission_inscriptions";
import ApprovedSubjectsScreen from "../approved_subjects";
import PendingSubjectsScreen from "../pending_subjects";
import StatsScreen from "../stats";
import TeacherHomeScreen from "../teacher_home";
import CreateSemester from "../teacher_semester/CreateSemester";
import { Loading, MaterialIcon, ProfileOverview } from "../../components";
import { SessionManager } from "../../managers";
import { lightModeColors, darkModeColors } from "../../styles/colorPalette";
import {
  Appearance,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import FilterNavBarButton from "../home/filterNavBarButton";
import ScanQR from "../home/subsections/HomeOptions/ScanQR";
import VerifyIdentity from "../home/subsections/HomeOptions/VerifyIdentity";
import StudentCredentialScreen from "../student_credential";
import NotificationsScreen from "../notifications";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { usersRepository } from "../../repositories";
import User from "../../models/User";
import { useAppDispatch } from "../../redux/hooks";
import { fetchUserDataAsync } from "../../redux/reducers/teacherUserDataSlice";
import notificationsRepository, { UserNotification } from "../../repositories/notifications";

const Drawer = createDrawerNavigator();

type RoleView = "student" | "teacher";

const CustomDrawerContent = (
  props: DrawerContentComponentProps & {
    user: User | null;
    roleView: RoleView;
    onSwitchRole: (role: RoleView) => void;
  }
) => {
  const { user, roleView, onSwitchRole, ...drawerProps } = props;
  const hasBothRoles = user?.isStudent() && user?.isTeacher();

  return (
    <DrawerContentScrollView {...drawerProps}>
      <ProfileOverview />
      {hasBothRoles && (
        <View style={styles.roleSwitchContainer}>
          <TouchableOpacity
            style={[styles.roleTab, roleView === "student" && styles.roleTabActive]}
            onPress={() => onSwitchRole("student")}
          >
            <MaterialIcon
              name="school"
              fontSize={16}
              color={roleView === "student" ? "white" : "#666"}
            />
            <Text style={[styles.roleTabText, roleView === "student" && styles.roleTabTextActive]}>
              Alumno
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleTab, roleView === "teacher" && styles.roleTabActive]}
            onPress={() => onSwitchRole("teacher")}
          >
            <MaterialIcon
              name="account-tie"
              fontSize={16}
              color={roleView === "teacher" ? "white" : "#666"}
            />
            <Text style={[styles.roleTabText, roleView === "teacher" && styles.roleTabTextActive]}>
              Docente
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <DrawerItemList {...drawerProps} />
      <DrawerItem
        label="Cambiar contraseña"
        labelStyle={{ color: lightModeColors.darkGray, fontSize: 14, fontWeight: "500", marginLeft: 4 }}
        style={{ borderRadius: 8, marginHorizontal: 8, marginVertical: 2 }}
        onPress={() => drawerProps.navigation.navigate('ChangePassword')}
        icon={makeDrawerIcon("lock-reset", "lock-reset")}
      />
      <DrawerItem
        label="Cerrar Sesión"
        labelStyle={{ color: lightModeColors.darkGray, fontSize: 14, fontWeight: "500", marginLeft: 4 }}
        style={{ borderRadius: 8, marginHorizontal: 8, marginVertical: 2 }}
        onPress={async () => {
          await GoogleSignin.signOut();
          await SessionManager.getInstance()?.clearCredentials();
          drawerProps.navigation.reset({
            index: 0,
            routes: [{ name: "Landing" }],
          });
        }}
        icon={makeDrawerIcon("logout-variant", "logout-variant")}
      />
    </DrawerContentScrollView>
  );
};

const RootDrawer = () => {
  const colors = isDarkTheme() ? darkModeColors : lightModeColors;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<User | null>(null);
  const [roleView, setRoleView] = useState<RoleView | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastNotification, setToastNotification] = useState<UserNotification | null>(null);
  const hasLoadedNotificationsRef = useRef(false);
  const knownNotificationIdsRef = useRef<Set<number>>(new Set());
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  const dropdownWidth = Math.min(Math.max(screenWidth - 24, 280), 380);
  const dropdownMaxHeight = Math.min(screenHeight * 0.7, 520);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationsRepository.fetchMyNotifications();
      const sorted = [...data].sort(
        (left, right) =>
          new Date(right.notification.created_at).getTime() -
          new Date(left.notification.created_at).getTime(),
      );

      if (!hasLoadedNotificationsRef.current) {
        knownNotificationIdsRef.current = new Set(sorted.map((item) => item.id));
        hasLoadedNotificationsRef.current = true;
      } else {
        const incomingUnread = sorted.find(
          (item) => !knownNotificationIdsRef.current.has(item.id) && !item.is_read,
        );

        knownNotificationIdsRef.current = new Set(sorted.map((item) => item.id));

        if (incomingUnread && !showNotificationsDropdown) {
          setToastNotification(incomingUnread);
          setShowToast(true);

          if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
          }

          toastTimerRef.current = setTimeout(() => {
            setShowToast(false);
          }, 4200);
        }
      }

      setNotifications(sorted);
    } catch (error) {
      console.log("RootDrawer (Web): Failed to fetch notifications", error);
    }
  }, [showNotificationsDropdown]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const fetchedUser = await usersRepository.getInfo();
        const initialRole: RoleView =
          !fetchedUser.isStudent() && fetchedUser.isTeacher() ? "teacher" : "student";
        setUser(fetchedUser);
        setRoleView(initialRole);
        dispatch(fetchUserDataAsync(fetchedUser));
      } catch (e) {
        console.log("RootDrawer: Failed to fetch user", e);
        setRoleView("student");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    loadNotifications();
    const intervalId = setInterval(loadNotifications, 10000);

    return () => {
      clearInterval(intervalId);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [loadNotifications]);

  if (loading || roleView === null) {
    return <Loading />;
  }

  const showStudentScreens = roleView === "student" && (user?.isStudent() ?? true);
  const showTeacherScreens = roleView === "teacher" && (user?.isTeacher() ?? false);

  const markAsRead = async (item: UserNotification) => {
    if (item.is_read) {
      return;
    }

    try {
      await notificationsRepository.markNotificationAsRead(item.id);
      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification.id === item.id ? { ...notification, is_read: true } : notification,
        ),
      );
    } catch (error) {
      console.log("RootDrawer (Web): Failed marking notification as read", error);
    }
  };

  const formatNotificationDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleString();
  };

  const openDropdownFromToast = () => {
    setShowToast(false);
    setShowNotificationsDropdown(true);
  };

  return (
    <>
      <Drawer.Navigator
        screenOptions={{
          // Permanent sidebar — always visible on web
          drawerType: "permanent",
          drawerStyle: {
            width: 260,
            borderRightWidth: 1,
            borderRightColor: colors.lightGray,
          },
          // Active/inactive colors matching the app's institutional palette
          drawerActiveTintColor: colors.institutional,
          drawerInactiveTintColor: colors.darkGray,
          drawerActiveBackgroundColor: `${colors.institutional}18`, // 10% opacity tint
          drawerLabelStyle: {
            fontSize: 14,
            fontWeight: "500",
            marginLeft: 4,
          },
          drawerItemStyle: {
            borderRadius: 8,
            marginHorizontal: 8,
            marginVertical: 2,
          },
          // White background for the content area (react-native-web defaults to transparent)
          sceneContainerStyle: { backgroundColor: '#ffffff' },
          // Remove the drawer toggle button — sidebar is always visible on web
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowNotificationsDropdown(true)}
              style={styles.notificationBellButton}
              accessibilityLabel="Mostrar notificaciones"
            >
              <MaterialIcon name="bell-outline" fontSize={24} color={colors.mainContrastColor} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ),
          // Header matches the existing app header
          headerTintColor: colors.mainContrastColor,
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.lightGray,
          },
        }}
        drawerContent={(props) => (
          <CustomDrawerContent
            {...props}
            user={user}
            roleView={roleView}
            onSwitchRole={(role) => setRoleView(role)}
          />
        )}
      >
        {showStudentScreens && (
          <>
            <Drawer.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: "Inicio",
                drawerIcon: makeDrawerIcon("home", "home-outline"),
              }}
            />
            <Drawer.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{
                title: "Calendario",
                drawerIcon: makeDrawerIcon("calendar", "calendar-outline"),
              }}
            />
            <Drawer.Screen
              name="CurrentCommissionInscriptions"
              component={CommissionInscriptionsScreen}
              options={{
                title: "Materias en curso",
                drawerIcon: makeDrawerIcon("text-box-multiple", "text-box-multiple-outline"),
              }}
            />
            <Drawer.Screen
              name="ApprovedSubjects"
              component={ApprovedSubjectsScreen}
              options={{
                title: "Materias aprobadas",
                drawerIcon: makeDrawerIcon("text-box-check", "text-box-check-outline"),
              }}
            />
            <Drawer.Screen
              name="PendingSubjects"
              component={PendingSubjectsScreen}
              options={{
                title: "Materias pendientes",
                drawerIcon: makeDrawerIcon("file-clock", "file-clock-outline"),
              }}
            />
            <Drawer.Screen
              name="ScanQR"
              component={ScanQR}
              options={{
                title: "Escanear QR",
                drawerIcon: makeDrawerIcon("qrcode-scan", "qrcode-scan"),
              }}
            />
            <Drawer.Screen
              name="VerifyIdentity"
              component={VerifyIdentity}
              options={{
                title: "Verificar identidad",
                drawerIcon: makeDrawerIcon("face-recognition", "face-recognition"),
              }}
            />
            <Drawer.Screen
              name="StudentCredential"
              component={StudentCredentialScreen}
              options={{
                title: "Mi credencial",
                drawerIcon: makeDrawerIcon("card-account-details", "card-account-details-outline"),
              }}
            />
            <Drawer.Screen
              name="StudentStats"
              component={StatsScreen}
              options={{
                title: "Estadísticas",
                drawerIcon: makeDrawerIcon("chart-box", "chart-box-outline"),
              }}
            />
          </>
        )}

        {showTeacherScreens && (
          <>
            <Drawer.Screen
              name="TeacherHome"
              component={TeacherHomeScreen}
              options={{
                title: "Mis Comisiones",
                drawerIcon: makeDrawerIcon("home", "home-outline"),
              }}
            />
            <Drawer.Screen
              name="CreateSemester"
              component={CreateSemester}
              options={{
                title: "Crear Cuatrimestre",
                drawerIcon: makeDrawerIcon("plus-circle", "plus-circle-outline"),
              }}
            />
          </>
        )}

        <Drawer.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            title: 'Notificaciones',
            drawerIcon: makeDrawerIcon('bell', 'bell-outline'),
          }}
        />
      </Drawer.Navigator>

      {showToast && toastNotification && !showNotificationsDropdown && (
        <View pointerEvents="box-none" style={styles.toastLayer}>
          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.toastCard}
            onPress={openDropdownFromToast}
          >
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
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showNotificationsDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotificationsDropdown(false)}
      >
        <TouchableOpacity
          style={styles.notificationsBackdrop}
          activeOpacity={1}
          onPress={() => setShowNotificationsDropdown(false)}
        />

        <View pointerEvents="box-none" style={styles.notificationsLayer}>
          <View
            style={[
              styles.notificationsDropdown,
              {
                width: dropdownWidth,
                maxHeight: dropdownMaxHeight,
              },
            ]}
          >
            <View style={styles.notificationsHeader}>
              <Text style={styles.notificationsTitle}>Notificaciones</Text>
              <Text style={styles.notificationsSubtitle}>{unreadCount} sin leer</Text>
            </View>

            {notifications.length === 0 ? (
              <View style={styles.notificationsEmptyContainer}>
                <Text style={styles.notificationsEmptyText}>No tenés notificaciones</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.notificationsList}
                contentContainerStyle={styles.notificationsListContent}
                showsVerticalScrollIndicator
              >
                {notifications.slice(0, 5).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => markAsRead(item)}
                    style={[
                      styles.notificationItem,
                      !item.is_read ? styles.notificationItemUnread : undefined,
                    ]}
                  >
                    <View style={styles.notificationItemHeader}>
                      <Text numberOfLines={1} style={styles.notificationItemTitle}>
                        {item.notification.title}
                      </Text>
                      {!item.is_read && <View style={styles.notificationItemDot} />}
                    </View>
                    {item.notification.semester_info ? (
                      <View style={styles.notificationItemContext}>
                        <MaterialIcon name="school" fontSize={11} color="#6b7280" />
                        <Text numberOfLines={1} style={styles.notificationItemContextText}>
                          {item.notification.semester_info.subject_name}
                          {item.notification.semester_info.period_label
                            ? ` · ${item.notification.semester_info.period_label}`
                            : ''}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.notificationItemContext}>
                        <MaterialIcon name="bullhorn" fontSize={11} color="#6b7280" />
                        <Text numberOfLines={1} style={styles.notificationItemContextText}>
                          Aviso institucional
                        </Text>
                      </View>
                    )}
                    <Text numberOfLines={2} style={styles.notificationItemMessage}>
                      {item.notification.message}
                    </Text>
                    <Text numberOfLines={1} style={styles.notificationItemDate}>
                      {item.notification.sender_name
                        ? `${item.notification.sender_name} · ${formatNotificationDate(item.notification.created_at)}`
                        : formatNotificationDate(item.notification.created_at)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.notificationsSeeAll}
              onPress={() => {
                setShowNotificationsDropdown(false);
                navigation.navigate('RootDrawer', { screen: 'Notifications' });
              }}
            >
              <Text style={styles.notificationsSeeAllText}>Ver todas las notificaciones</Text>
              <MaterialIcon name="chevron-right" fontSize={18} color={lightModeColors.institutional} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

function makeDrawerIcon(
  focusedIcon: string,
  unfocusedIcon: string
): (props: { color: string; size: number; focused: boolean }) => React.ReactNode {
  return ({ focused, color, size }) => (
    <MaterialIcon
      color={color}
      fontSize={size}
      name={focused ? focusedIcon : unfocusedIcon}
      style={{ marginRight: 4 }}
    />
  );
}

function isDarkTheme() {
  return false; // Always light mode on web
}

const styles = StyleSheet.create({
  roleSwitchContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  roleTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: lightModeColors.institutional,
    borderRadius: 8,
  },
  roleTabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  roleTabTextActive: {
    color: "white",
    fontWeight: "bold",
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
    paddingTop: 76,
    paddingHorizontal: 14,
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
    backgroundColor: '#f6f9ff',
    borderColor: '#d6e4ff',
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
  notificationItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
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
    maxWidth: 520,
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
});

export default RootDrawer;
