import 'react-native-gesture-handler';
import * as React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { DrawerItemList, DrawerContentScrollView, createDrawerNavigator, DrawerItem, DrawerContentComponentProps, DrawerContentOptions } from '@react-navigation/drawer';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { SplashScreen, LandingScreen, PreRegisterScreen, HomeScreen, TakePictureStepScreen, PreRegisterLastInstructionsScreen, ApprovedSubjectsScreen, PendingSubjectsScreen, ViewCommissionScreen } from './src/scenes';
import DeliverFinalExam from './src/scenes/home/subsections/HomeOptions/DeliverFinalExam';
import VerifyIdentity from './src/scenes/home/subsections/HomeOptions/VerifyIdentity';
import FilterNavBarButton from './src/scenes/home/filterNavBarButton';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import InCourseSubjects from './src/scenes/in_course_subjects';
import { darkModeColors, lightModeColors } from './src/styles/colorPalette';
import { Appearance } from 'react-native';
import { SessionManager } from './src/managers';
import { ProfileOverview } from './src/components';

const Drawer = createDrawerNavigator();

const DRAWER_MENU_SHOWN_SCREENS = [
  "Home",
  "InCourseSubjects",
  "PendingSubjects",
  "ApprovedSubjects",
  "DeliverFinalExam",
  "VerifyIdentity"
]

const FilteredDrawerContent = (props: DrawerContentComponentProps<DrawerContentOptions>) => {
  const { state, ...rest } = props;
  const newState = {
    ...state, routes: state.routes.filter((route: any) => {
      return DRAWER_MENU_SHOWN_SCREENS.includes(route.name);
    })
  };

  return (
    <DrawerContentScrollView {...props}>
      <ProfileOverview />
      <DrawerItemList {...rest} state={newState} />
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

const App = () => {
  const colors = isDarkTheme() ? darkModeColors : lightModeColors;
  return (
    <Provider store={store}>
      <ActionSheetProvider>
        <NavigationContainer theme={isDarkTheme() ? DarkTheme : DefaultTheme}>
          <Drawer.Navigator
            initialRouteName="Landing"
            screenOptions={{ headerTintColor: colors.mainContrastColor }}
            drawerContent={props => <FilteredDrawerContent {...props} />}
          >
            <Drawer.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: true, title: 'Inicio' }}
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

            <Drawer.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />

            <Drawer.Screen
              name="Landing"
              component={LandingScreen}
              options={{ headerShown: false, title: 'Inicio' }}
            />

            <Drawer.Screen
              name="PreRegister"
              component={PreRegisterScreen}
              options={{ headerShown: true, title: 'Pre-registro' }}
            />

            <Drawer.Screen
              name="PreRegisterDone"
              component={PreRegisterLastInstructionsScreen}
              options={{ headerShown: false }}
            />

            <Drawer.Screen
              name="TakePicture"
              component={TakePictureStepScreen}
              options={({ route }) => ({ title: 'Tomar foto' })}
            />

            <Drawer.Screen
              name="ViewCommission"
              component={ViewCommissionScreen}
              options={{ headerShown: true, title: "Comisión" }}
            />

            {/* <Drawer.Screen
              name="CameraTest"
              component={CameraTestScreen}
              options={({ route }) => ({ title: 'Prueba de cámara' })}
            /> */}

            {/* <Drawer.Screen
              name="SubjectHistoryScreen"
              component={SubjectHistoryScreen}
              options={({ route }) => ({
                title: route.params?.subject.name,
                headerShown: true,
              })}
            /> */}
          </Drawer.Navigator>
        </NavigationContainer>
      </ActionSheetProvider>
    </Provider>
  );
};

export default App;

function isDarkTheme() {
  return Appearance.getColorScheme() === 'dark';
}
