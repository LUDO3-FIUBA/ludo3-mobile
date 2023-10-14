import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { SplashScreen, LandingScreen, PreRegisterScreen, HomeScreen, TakePictureStepScreen, CameraTestScreen, PreRegisterLastInstructionsScreen } from './src/scenes';
import ApprovedSubjects from './src/scenes/home/subsections/HomeOptions/ApprovedSubjects';
import PendingSubjects from './src/scenes/home/subsections/HomeOptions/PendingSubjects';
import DeliverFinalExam from './src/scenes/home/subsections/HomeOptions/DeliverFinalExam';
import VerifyIdentity from './src/scenes/home/subsections/HomeOptions/VerifyIdentity';
import FilterNavBarButton from './src/scenes/home/filterNavBarButton';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { DrawerItemList, DrawerContentScrollView, createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

const TAB_MENU_SHOWN_SCREENS = [
  "Home",
  "PendingSubjects",
  "ApprovedSubjects",
  "DeliverFinalExam",
  "VerifyIdentity"
]

function CustomDrawerContent(props: any) {
  const { state, ...rest } = props;
  const newState = {
    ...state, routes: state.routes.filter((route: any) => {
      // Only include the routes you want here
      return TAB_MENU_SHOWN_SCREENS.includes(route.name);
    })
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...rest} state={newState} />
    </DrawerContentScrollView>
  );
}

const App = () => {
  return (
    <Provider store={store}>
      <ActionSheetProvider>
        <NavigationContainer>
          <Drawer.Navigator
            initialRouteName="Landing"
            drawerContent={props => <CustomDrawerContent {...props} />}
          >
            <Drawer.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: true, title: 'Inicio' }}
            />

            <Drawer.Screen
              name="ApprovedSubjects"
              component={ApprovedSubjects}
              options={{
                headerShown: true,
                title: 'Materias aprobadas',
                headerRight: () => <FilterNavBarButton />,
              }}
            />

            <Drawer.Screen
              name="PendingSubjects"
              component={PendingSubjects}
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

            {/* <Drawer.Screen
              name="CameraTest"
              component={CameraTestScreen}
              options={({ route }) => ({ title: 'Prueba de cámara' })}
            /> */}

            {/* <Drawer.Screen
              name="SubjectHistoryScreen"
              component={SubjectHistoryScreen}
              options={({ route }) => ({
                title: route.params.subject.name,
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
