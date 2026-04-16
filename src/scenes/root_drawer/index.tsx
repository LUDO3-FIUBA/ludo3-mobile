import React, { useEffect, useState } from "react";
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList, createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../home";
import CalendarScreen from "../calendar";
import CommissionInscriptionsScreen from "../commission_inscriptions";
import ApprovedSubjectsScreen from "../approved_subjects";
import PendingSubjectsScreen from "../pending_subjects";
import StatsScreen from "../stats";
import TeacherHomeScreen from "../teacher_home";
import CreateSemester from "../teacher_semester/CreateSemester";
import TeacherProfileScreen from "../teacher_profile";
import DepartmentList from "../admin_departments/DepartmentList";
import DepartmentDetail from "../admin_departments/DepartmentDetail";
import DepartmentForm from "../admin_departments/DepartmentForm";
import CommissionList from "../admin_commissions/CommissionList";
import CommissionDetail from "../admin_commissions/CommissionDetail";
import CommissionForm from "../admin_commissions/CommissionForm";
import UserSearch from "../admin_users/UserSearch";
import UserDetail from "../admin_users/UserDetail";
import { Loading, MaterialIcon, ProfileOverview } from "../../components";
import { SessionManager } from "../../managers";
import { darkModeColors, lightModeColors } from "../../styles/colorPalette";
import { Appearance, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import FilterNavBarButton from "../home/filterNavBarButton";
import ScanQR from "../home/subsections/HomeOptions/ScanQR";
import VerifyIdentity from "../home/subsections/HomeOptions/VerifyIdentity";
import StudentCredentialScreen from "../student_credential";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { usersRepository } from "../../repositories";
import User from "../../models/User";
import { useAppDispatch } from "../../redux/hooks";
import { fetchUserDataAsync } from "../../redux/reducers/teacherUserDataSlice";

const Drawer = createDrawerNavigator()

type RoleView = 'student' | 'teacher' | 'admin';

const CustomDrawerContent = (props: DrawerContentComponentProps & { user: User | null, roleView: RoleView, onSwitchRole: (role: RoleView) => void }) => {
  const { user, roleView, onSwitchRole, ...drawerProps } = props;
  const hasBothRoles = user?.isStudent() && user?.isTeacher() && !user?.isAdmin();

  return (
    <DrawerContentScrollView {...drawerProps}>
      <ProfileOverview />
      {hasBothRoles && (
        <View style={styles.roleSwitchContainer}>
          <TouchableOpacity
            style={[styles.roleTab, roleView === 'student' && styles.roleTabActive]}
            onPress={() => onSwitchRole('student')}
          >
            <MaterialIcon name="school" fontSize={16} color={roleView === 'student' ? 'white' : '#666'} />
            <Text style={[styles.roleTabText, roleView === 'student' && styles.roleTabTextActive]}>Alumno</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleTab, roleView === 'teacher' && styles.roleTabActive]}
            onPress={() => onSwitchRole('teacher')}
          >
            <MaterialIcon name="account-tie" fontSize={16} color={roleView === 'teacher' ? 'white' : '#666'} />
            <Text style={[styles.roleTabText, roleView === 'teacher' && styles.roleTabTextActive]}>Docente</Text>
          </TouchableOpacity>
        </View>
      )}
      <DrawerItemList {...drawerProps} />
      <DrawerItem
        label="Cambiar contraseña"
        onPress={() => drawerProps.navigation.navigate('ChangePassword')}
        icon={makeDrawerIcon('lock-reset', 'lock-reset')}
      />
      <DrawerItem label="Cerrar Sesión" onPress={async () => {
        await GoogleSignin.signOut();
        await SessionManager.getInstance()?.clearCredentials();
        drawerProps.navigation.reset({
          index: 0,
          routes: [{ name: 'Landing' }],
        })
      }}
        icon={makeDrawerIcon('logout-variant', 'logout-variant')}
      />
    </DrawerContentScrollView>
  );
}

const DrawerMenuButton = ({ color }: { color: string }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{ marginLeft: 16 }}
      accessibilityLabel="Show navigation menu"
    >
      <MaterialIcon name="menu" fontSize={24} color={color} />
    </TouchableOpacity>
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
        let initialRole: RoleView;
        if (fetchedUser.isAdmin()) {
          initialRole = 'admin';
        } else if (!fetchedUser.isStudent() && fetchedUser.isTeacher()) {
          initialRole = 'teacher';
        } else {
          initialRole = 'student';
        }
        setUser(fetchedUser);
        setRoleView(initialRole);
        dispatch(fetchUserDataAsync(fetchedUser));
      } catch (e) {
        console.log('RootDrawer: Failed to fetch user', e);
        setRoleView('student');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading || roleView === null) {
    return <Loading />;
  }

  const showStudentScreens = roleView === 'student' && (user?.isStudent() ?? true);
  const showTeacherScreens = roleView === 'teacher' && (user?.isTeacher() ?? false);
  const showAdminScreens = roleView === 'admin' && (user?.isAdmin() ?? false);

  const AdminDepartmentListScreen = () => <DepartmentList isAdmin={true} />;
  const StudentDepartmentListScreen = () => <DepartmentList isAdmin={false} />;

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTintColor: colors.mainContrastColor,
        headerLeft: () => <DrawerMenuButton color={colors.mainContrastColor} />,
      }}
      drawerContent={props => (
        <CustomDrawerContent
          {...props}
          user={user}
          roleView={roleView}
          onSwitchRole={(role) => {
            setRoleView(role);
          }}
        />
      )}
    >
      {/* Student screens */}
      {showStudentScreens && (
        <>
          <Drawer.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: true,
              title: 'Inicio',
              drawerIcon: makeDrawerIcon('home', 'home-outline')
            }}
          />

          <Drawer.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{ headerShown: true, title: 'Calendario', drawerIcon: makeDrawerIcon('calendar', 'calendar-outline') }}
          />

          <Drawer.Screen
            name="CurrentCommissionInscriptions"
            component={CommissionInscriptionsScreen}
            options={{
              headerShown: true,
              title: 'Materias en curso',
              drawerIcon: makeDrawerIcon('text-box-multiple', 'text-box-multiple-outline')
            }}
          />

          <Drawer.Screen
            name="ApprovedSubjects"
            component={ApprovedSubjectsScreen}
            options={{
              headerShown: true,
              title: 'Materias aprobadas',
              headerRight: () => <FilterNavBarButton />,
              drawerIcon: makeDrawerIcon('text-box-check', 'text-box-check-outline')
            }}
          />

          <Drawer.Screen
            name="PendingSubjects"
            component={PendingSubjectsScreen}
            options={{
              headerShown: true,
              title: 'Materias pendientes',
              headerRight: () => <FilterNavBarButton />,
              drawerIcon: makeDrawerIcon('file-clock', 'file-clock-outline')
            }}
          />

          <Drawer.Screen
            name="ScanQR"
            component={ScanQR}
            options={{ headerShown: true, title: 'Escanear QR', drawerIcon: makeDrawerIcon('qrcode-scan', 'qrcode-scan') }}
          />

          <Drawer.Screen
            name="VerifyIdentity"
            component={VerifyIdentity}
            options={{ headerShown: true, title: 'Verificar identidad', drawerIcon: makeDrawerIcon('face-recognition', 'face-recognition') }}
          />

          <Drawer.Screen
            name="StudentCredential"
            component={StudentCredentialScreen}
            options={{ headerShown: true, title: 'Mi credencial', drawerIcon: makeDrawerIcon('card-account-details', 'card-account-details-outline') }}
          />

          <Drawer.Screen
            name="StudentStats"
            component={StatsScreen}
            options={{ headerShown: true, title: 'Estadisticas', drawerIcon: makeDrawerIcon('chart-box', 'chart-box-outline') }}
          />

          <Drawer.Screen
            name="StudentDepartmentList"
            component={StudentDepartmentListScreen}
            options={{ headerShown: true, title: 'Departamentos', drawerIcon: makeDrawerIcon('office-building', 'office-building-outline') }}
          />

          <Drawer.Screen
            name="AdminDepartmentDetail"
            component={DepartmentDetail}
            options={{ headerShown: true, title: 'Departamento', drawerLabel: () => null, drawerItemStyle: { display: 'none' } }}
          />
        </>
      )}

      {/* Teacher screens */}
      {showTeacherScreens && (
        <>
          <Drawer.Screen
            name="TeacherHome"
            component={TeacherHomeScreen}
            options={{
              headerShown: true,
              title: 'Mis Comisiones',
              drawerIcon: makeDrawerIcon('home', 'home-outline')
            }}
          />

          <Drawer.Screen
            name="CreateSemester"
            component={CreateSemester}
            options={{
              headerShown: true,
              title: 'Crear Cuatrimestre',
              drawerIcon: makeDrawerIcon('plus-circle', 'plus-circle-outline')
            }}
          />

          <Drawer.Screen
            name="TeacherProfile"
            component={TeacherProfileScreen}
            options={{
              headerShown: true,
              title: 'Mi Perfil Profesional',
              drawerIcon: makeDrawerIcon('account-details', 'account-details-outline')
            }}
          />

          <Drawer.Screen
            name="TeacherDepartmentList"
            component={StudentDepartmentListScreen}
            options={{ headerShown: true, title: 'Departamentos', drawerIcon: makeDrawerIcon('office-building', 'office-building-outline') }}
          />

          <Drawer.Screen
            name="AdminDepartmentDetail"
            component={DepartmentDetail}
            options={{ headerShown: true, title: 'Departamento', drawerLabel: () => null, drawerItemStyle: { display: 'none' } }}
          />
        </>
      )}

      {/* Admin screens */}
      {showAdminScreens && (
        <>
          <Drawer.Screen
            name="AdminDepartmentList"
            component={AdminDepartmentListScreen}
            options={{
              headerShown: true,
              title: 'Departamentos',
              drawerIcon: makeDrawerIcon('office-building', 'office-building-outline')
            }}
          />

          <Drawer.Screen
            name="AdminDepartmentCreate"
            component={DepartmentForm}
            options={{ headerShown: true, title: 'Nuevo Departamento', drawerLabel: () => null, drawerItemStyle: { display: 'none' } }}
          />

          <Drawer.Screen
            name="AdminDepartmentDetail"
            component={DepartmentDetail}
            options={{ headerShown: true, title: 'Departamento', drawerLabel: () => null, drawerItemStyle: { display: 'none' } }}
          />

          <Drawer.Screen
            name="AdminDepartmentEdit"
            component={DepartmentForm}
            options={{ headerShown: true, title: 'Editar Departamento', drawerLabel: () => null, drawerItemStyle: { display: 'none' } }}
          />

          <Drawer.Screen
            name="AdminCommissionList"
            component={CommissionList}
            options={{
              headerShown: true,
              title: 'Comisiones',
              drawerIcon: makeDrawerIcon('account-group', 'account-group-outline')
            }}
          />

          <Drawer.Screen
            name="AdminCommissionCreate"
            component={CommissionForm}
            options={{ headerShown: true, title: 'Nueva Comisión', drawerLabel: () => null, drawerItemStyle: { display: 'none' } }}
          />

          <Drawer.Screen
            name="AdminCommissionDetail"
            component={CommissionDetail}
            options={{ headerShown: true, title: 'Comisión', drawerLabel: () => null, drawerItemStyle: { display: 'none' } }}
          />

          <Drawer.Screen
            name="AdminCommissionEdit"
            component={CommissionForm}
            options={{ headerShown: true, title: 'Editar Comisión', drawerLabel: () => null, drawerItemStyle: { display: 'none' } }}
          />

          <Drawer.Screen
            name="AdminUserSearch"
            component={UserSearch}
            options={{
              headerShown: true,
              title: 'Buscar Usuarios',
              drawerIcon: makeDrawerIcon('account-search', 'account-search-outline')
            }}
          />

          <Drawer.Screen
            name="AdminUserDetail"
            component={UserDetail}
            options={{ headerShown: true, title: 'Usuario', drawerLabel: () => null, drawerItemStyle: { display: 'none' } }}
          />
        </>
      )}
    </Drawer.Navigator>
  )
}

function makeDrawerIcon(focusedIcon: string, unfocusedIcon: string): ((props: { color: string; size: number; focused: boolean; }) => React.ReactNode) {
  return ({ focused, color, size }) => <MaterialIcon color={color} fontSize={size} name={focused ? focusedIcon : unfocusedIcon} style={{ marginRight: -8 }} />;
}

function isDarkTheme() {
  return Appearance.getColorScheme() === 'dark';
}

const styles = StyleSheet.create({
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
});

export default RootDrawer;
