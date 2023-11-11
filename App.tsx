import 'react-native-gesture-handler';
import * as React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { SplashScreen, LandingScreen, PreRegisterScreen, TakePictureStepScreen, PreRegisterLastInstructionsScreen, RootDrawer, CorrelativeSubjects, ViewSemesterScreen, ViewEvaluationsScreen } from './src/scenes';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { Appearance } from 'react-native';

const Stack = createStackNavigator();


const App = () => {
  return (
    <Provider store={store}>
      <ActionSheetProvider>
        <NavigationContainer theme={isDarkTheme() ? DarkTheme : DefaultTheme}>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ gestureEnabled: false }}
          >
            <Stack.Screen
              name="RootDrawer"
              component={RootDrawer}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Landing"
              component={LandingScreen}
              options={{ headerShown: false, title: 'Inicio' }}
            />

            <Stack.Screen
              name="PreRegister"
              component={PreRegisterScreen}
              options={{ headerShown: true, title: 'Pre-registro' }}
            />

            <Stack.Screen
              name="PreRegisterDone"
              component={PreRegisterLastInstructionsScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="TakePicture"
              component={TakePictureStepScreen}
              options={({ route }) => ({ title: 'Tomar foto' })}
            />

            <Stack.Screen
              name="ViewSemester"
              component={ViewSemesterScreen}
              options={{ headerShown: true, title: "Comisión" }}
            />

            <Stack.Screen
              name="CorrelativeSubjects"
              component={CorrelativeSubjects}
              options={{ headerShown: true, title: "Correlativas" }}
            />

            <Stack.Screen
              name="ViewEvaluations"
              component={ViewEvaluationsScreen}
              options={{ headerShown: true, title: "Evaluaciones" }}
            />

            {/* <Stack.Screen
              name="CameraTest"
              component={CameraTestScreen}
              options={({ route }) => ({ title: 'Prueba de cámara' })}
            /> */}

            {/* <Stack.Screen
              name="SubjectHistoryScreen"
              component={SubjectHistoryScreen}
              options={({ route }) => ({
                title: route.params?.subject.name,
                headerShown: true,
              })}
            /> */}
          </Stack.Navigator>
        </NavigationContainer>
      </ActionSheetProvider>
    </Provider>
  );
};

export default App;

function isDarkTheme() {
  return Appearance.getColorScheme() === 'dark';
}
