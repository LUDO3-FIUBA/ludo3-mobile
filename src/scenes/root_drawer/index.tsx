import React from "react";
import { DrawerContentComponentProps, DrawerContentOptions, DrawerContentScrollView, DrawerItem, DrawerItemList, createDrawerNavigator } from "@react-navigation/drawer";
import { ApprovedSubjectsScreen, CalendarScreen, HomeScreen, PendingSubjectsScreen } from "..";
import { ProfileOverview } from "../../components";
import { SessionManager } from "../../managers";
import { darkModeColors, lightModeColors } from "../../styles/colorPalette";
import { Appearance } from "react-native";
import InCourseSubjects from "../in_course_subjects";
import FilterNavBarButton from "../home/filterNavBarButton";
import DeliverFinalExam from "../home/subsections/HomeOptions/DeliverFinalExam";
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
      }} />
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
        options={{ headerShown: true, title: 'Inicio' }}
      />

      <Drawer.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ headerShown: true, title: 'Calendario' }}
      />

      <Drawer.Screen
        name="InCourseSubjects"
        component={InCourseSubjects}
        options={{
          headerShown: true,
          title: 'Materias en curso',
        }}
      />

      <Drawer.Screen
        name="ApprovedSubjects"
        component={ApprovedSubjectsScreen}
        options={{
          headerShown: true,
          title: 'Materias aprobadas',
          headerRight: () => <FilterNavBarButton />,
        }}
      />

      <Drawer.Screen
        name="PendingSubjects"
        component={PendingSubjectsScreen}
        options={{
          headerShown: true,
          title: 'Materias pendientes',
          headerRight: () => <FilterNavBarButton />,
        }}
      />

      <Drawer.Screen
        name="DeliverFinalExam"
        component={DeliverFinalExam}
        options={{ headerShown: true, title: 'Entregar examen final' }}
      />

      <Drawer.Screen
        name="VerifyIdentity"
        component={VerifyIdentity}
        options={{ headerShown: true, title: 'Verificar identidad' }}
      />
    </Drawer.Navigator>
  )
}

function isDarkTheme() {
  return Appearance.getColorScheme() === 'dark';
}

export default RootDrawer;
