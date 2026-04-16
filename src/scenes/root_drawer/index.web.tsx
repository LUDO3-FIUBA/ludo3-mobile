import React, { useEffect, useState } from "react";
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
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import FilterNavBarButton from "../home/filterNavBarButton";
import ScanQR from "../home/subsections/HomeOptions/ScanQR";
import VerifyIdentity from "../home/subsections/HomeOptions/VerifyIdentity";
import StudentCredentialScreen from "../student_credential";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { usersRepository } from "../../repositories";
import User from "../../models/User";
import { useAppDispatch } from "../../redux/hooks";
import { fetchUserDataAsync } from "../../redux/reducers/teacherUserDataSlice";

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
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [roleView, setRoleView] = useState<RoleView | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || roleView === null) {
    return <Loading />;
  }

  const showStudentScreens = roleView === "student" && (user?.isStudent() ?? true);
  const showTeacherScreens = roleView === "teacher" && (user?.isTeacher() ?? false);

  return (
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
              headerRight: () => <FilterNavBarButton />,
              drawerIcon: makeDrawerIcon("text-box-check", "text-box-check-outline"),
            }}
          />
          <Drawer.Screen
            name="PendingSubjects"
            component={PendingSubjectsScreen}
            options={{
              title: "Materias pendientes",
              headerRight: () => <FilterNavBarButton />,
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
    </Drawer.Navigator>
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
});

export default RootDrawer;
