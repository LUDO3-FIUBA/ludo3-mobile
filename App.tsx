import 'react-native-gesture-handler';
import * as React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
  SplashScreen, LandingScreen, PreRegisterScreen, PreRegisterPasswordScreen, TakePictureStepScreen, PreRegisterLastInstructionsScreen,
  RootDrawer, CorrelativeSubjects, ViewSemesterScreen, ViewEvaluationsScreen, ViewEvaluationDetailsScreen, TeachersScreen, StatsScreen,
  GoogleRegisterScreen
} from './src/scenes';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { Appearance } from 'react-native';
import { useEffect } from 'react';
import { configureGoogle } from './src/auth/google_signin';

const Stack = createStackNavigator();


const App = () => {
  useEffect(() => {
    configureGoogle();
  }, []);

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
              name="PreRegisterPassword"
              component={PreRegisterPasswordScreen}
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

            <Stack.Screen
              name="ViewEvaluationDetails"
              component={ViewEvaluationDetailsScreen}
              options={{ headerShown: true, title: "Evaluacion" }}
            />

            <Stack.Screen
              name="Teachers"
              component={TeachersScreen}
              options={{ headerShown: true, title: "Cuerpo Docente" }}
            />

            <Stack.Screen
              name="Stats"
              component={StatsScreen}
              options={{ headerShown: true, title: "Estadisticas" }}
            />
            
            <Stack.Screen
              name="GoogleRegister"
              component={GoogleRegisterScreen}
              options={{ headerShown: true, title: 'Completar registro' }}
            />
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
