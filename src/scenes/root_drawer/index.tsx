import React from "react";
import { DrawerContentComponentProps, DrawerContentOptions, DrawerContentScrollView, DrawerItem, DrawerItemList, createDrawerNavigator } from "@react-navigation/drawer";
import { ApprovedSubjectsScreen, CalendarScreen, CommissionInscriptionsScreen, HomeScreen, PendingSubjectsScreen } from "..";
import { MaterialIcon, ProfileOverview } from "../../components";
import { SessionManager } from "../../managers";
import { darkModeColors, lightModeColors } from "../../styles/colorPalette";
import { Appearance } from "react-native";
import FilterNavBarButton from "../home/filterNavBarButton";
import ScanQR from "../home/subsections/HomeOptions/ScanQR";
import VerifyIdentity from "../home/subsections/HomeOptions/VerifyIdentity";

const Drawer = createDrawerNavigator()

const CustomDrawerContent = (props: DrawerContentComponentProps<DrawerContentOptions>) => {
  return (
    <DrawerContentScrollView {...props}>
      <ProfileOverview />
      <DrawerItemList {...props} />
      <DrawerItem label="Cerrar Sesión" onPress={async () => {
          await SessionManager.getInstance()?.clearCredentials();
          props.navigation.reset({
            index: 0,
            routes: [{ name: 'Landing' }],
          })
        }}
        icon={makeDrawerIcon('logout-variant', 'logout-variant')}
      />
    </DrawerContentScrollView>
  );
}

const RootDrawer = () => {
  const colors = isDarkTheme() ? darkModeColors : lightModeColors;
  return (
    <Drawer.Navigator
      screenOptions={{ headerTintColor: colors.mainContrastColor }}
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
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
    </Drawer.Navigator>
  )
}

function makeDrawerIcon(focusedIcon: string, unfocusedIcon: string): ((props: { color: string; size: number; focused: boolean; }) => React.ReactNode) | undefined {
  return ({ focused, color, size }) => <MaterialIcon color={color} fontSize={size} name={focused ? focusedIcon : unfocusedIcon} style={{ marginRight: -8 }} />;
}

function isDarkTheme() {
  return Appearance.getColorScheme() === 'dark';
}

export default RootDrawer;
