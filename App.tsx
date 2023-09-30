import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
// import 'react-native-gesture-handler';
// import 'moment/locale/es';
import { SplashScreen, LandingScreen, PreRegisterScreen, HomeScreen, TakePictureStepScreen, CameraTestScreen, PreRegisterLastInstructionsScreen } from './src/scenes';
import HomeOptions from './src/scenes/home/subsections';
import ApprovedSubjects from './src/scenes/home/subsections/HomeOptions/ApprovedSubjects';
import PendingSubjects from './src/scenes/home/subsections/HomeOptions/PendingSubjects';
import DeliverFinalExam from './src/scenes/home/subsections/HomeOptions/DeliverFinalExam';
import VerifyIdentity from './src/scenes/home/subsections/HomeOptions/VerifyIdentity';

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
            options={{ headerShown: true, title: 'Inicio' }}
          />

          <Stack.Screen
            name="TakePicture"
            component={TakePictureStepScreen}
            options={({ route }) => ({ title: 'Tomar foto' })}
          />

          <Stack.Screen
            name="CameraTest"
            component={CameraTestScreen}
            options={({ route }) => ({ title: 'Prueba de cámara' })}
          />

          <Stack.Screen
            name="ApprovedSubjects"
            component={ApprovedSubjects}
            options={{ headerShown: true, title: 'Materias aprobadas' }}
          />

          <Stack.Screen
            name="PendingSubjects"
            component={PendingSubjects}
            options={{ headerShown: true, title: 'Materias pendientes'}}
          />

          <Stack.Screen
            name="DeliverFinalExam"
            component={DeliverFinalExam}
            options={{ headerShown: true, title: 'Entregar examen final' }}
          />

          <Stack.Screen
            name="VerifyIdentity"
            component={VerifyIdentity}
            options={{ headerShown: true, title: 'Verificar identidad' }}
          />

          <Stack.Screen
            name="PreRegisterDone"
            component={PreRegisterLastInstructionsScreen}
            options={{ headerShown: false }}
          />

          {/* 
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
