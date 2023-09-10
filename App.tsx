import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
// import 'react-native-gesture-handler';
// import 'moment/locale/es';
import { SplashScreen, LandingScreen, PreRegisterScreen, HomeScreen } from './src/scenes';
import HomeOptions from './src/scenes/home/subsections';

const Stack = createStackNavigator();

const App = () => {
  return (
      <ActionSheetProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ gestureEnabled: false }}
          >
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
              name="Home"
              component={HomeScreen}
              options={{ headerShown: true }}
              initialParams={{ subsection: new HomeOptions.VerifyIdentity() }}
            />
            {/* <Stack.Screen
              name="PreRegisterDone"
              component={PreRegisterLastInstructionsScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="TakePicture"
              component={TakePictureStepScreen}
              options={({ route }) => ({ title: route.params.title })}
            />


            <Stack.Screen
              name="Materias aprobadas"
              component={HomeScreen}
              options={{ headerShown: true }}
              initialParams={{ subsection: new HomeOptions.ApprovedSubjects() }}
            />

            <Stack.Screen
              name="Materias pendientes"
              component={HomeScreen}
              options={{ headerShown: true }}
              initialParams={{ subsection: new HomeOptions.PendingSubjects() }}
            />

            <Stack.Screen
              name="Historial de una materia"
              component={SubjectHistoryScreen}
              options={({ route }) => ({
                title: route.params.subject.name,
                headerShown: true,
              })}
            /> */}
          </Stack.Navigator>
        </NavigationContainer>
      </ActionSheetProvider>
  );
};

export default App;
