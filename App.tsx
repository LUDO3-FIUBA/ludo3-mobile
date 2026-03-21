import 'react-native-gesture-handler';
import * as React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
  SplashScreen, LandingScreen, PreRegisterScreen, PreRegisterPasswordScreen, TakePictureStepScreen, PreRegisterLastInstructionsScreen,
  RootDrawer, CorrelativeSubjects, ViewSemesterScreen, ViewEvaluationsScreen, ViewEvaluationDetailsScreen, TeachersScreen, StatsScreen,
  GoogleRegisterScreen,
  // Teacher screens
  TeacherSemesterStudentsScreen, TeacherSemesterEditScreen,
  TeacherEvaluationsListScreen, TeacherAddEvaluationScreen, TeacherSubmissionsListScreen,
  TeacherFinalsListScreen, TeacherAddFinalScreen,
  TeacherStaffScreen, TeacherStaffConfigurationScreen, TeacherAddStaffScreen,
  TeacherSemesterAttendancesScreen, TeacherAttendanceDetailsScreen,
  TeacherSemesterAttendanceQRScreen, TeacherEvaluationQRScreen, TeacherFinalExamQRScreen,
  TeacherStatsScreen, TeacherFinalExamSubmissionsScreen, TeacherAddClassToSemesterScreen,
  TeacherSemesterCardScreen, TeacherEditEvaluationScreen,
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

            {/* Teacher Stack screens */}
            <Stack.Screen
              name="SemesterStudents"
              component={TeacherSemesterStudentsScreen}
              options={{ headerShown: true, title: 'Alumnos del cuatrimestre' }}
            />
            <Stack.Screen
              name="SemesterEditScreen"
              component={TeacherSemesterEditScreen}
              options={{ headerShown: true, title: 'Editar cuatrimestre' }}
            />
            <Stack.Screen
              name="EvaluationsList"
              component={TeacherEvaluationsListScreen}
              options={{ headerShown: true, title: 'Evaluaciones' }}
            />
            <Stack.Screen
              name="AddEvaluation"
              component={TeacherAddEvaluationScreen}
              options={{ headerShown: true, title: 'Agregar evaluación' }}
            />
            <Stack.Screen
              name="SubmissionsList"
              component={TeacherSubmissionsListScreen}
              options={{ headerShown: true, title: 'Entregas' }}
            />
            <Stack.Screen
              name="FinalsList"
              component={TeacherFinalsListScreen}
              options={{ headerShown: true, title: 'Finales' }}
            />
            <Stack.Screen
              name="AddFinal"
              component={TeacherAddFinalScreen}
              options={{ headerShown: true, title: 'Agregar final' }}
            />
            <Stack.Screen
              name="TeacherStaff"
              component={TeacherStaffScreen}
              options={{ headerShown: true, title: 'Cuerpo Docente' }}
            />
            <Stack.Screen
              name="TeachersConfiguration"
              component={TeacherStaffConfigurationScreen}
              options={{ headerShown: true, title: 'Configurar docentes' }}
            />
            <Stack.Screen
              name="AddTeachersConfigurationList"
              component={TeacherAddStaffScreen}
              options={{ headerShown: true, title: 'Agregar docente' }}
            />
            <Stack.Screen
              name="SemesterAttendances"
              component={TeacherSemesterAttendancesScreen}
              options={{ headerShown: true, title: 'Asistencias' }}
            />
            <Stack.Screen
              name="AttendanceDetails"
              component={TeacherAttendanceDetailsScreen}
              options={{ headerShown: true, title: 'Detalles de asistencia' }}
            />
            <Stack.Screen
              name="SemesterAttendanceQR"
              component={TeacherSemesterAttendanceQRScreen}
              options={{ headerShown: true, title: 'QR de Asistencia' }}
            />
            <Stack.Screen
              name="EvaluationQR"
              component={TeacherEvaluationQRScreen}
              options={{ headerShown: true, title: 'QR de Evaluación' }}
            />
            <Stack.Screen
              name="FinalExamQR"
              component={TeacherFinalExamQRScreen}
              options={{ headerShown: true, title: 'QR de Final' }}
            />
            <Stack.Screen
              name="TeacherStats"
              component={TeacherStatsScreen}
              options={{ headerShown: true, title: 'Estadísticas' }}
            />
            <Stack.Screen
              name="FinalExamSubmissions"
              component={TeacherFinalExamSubmissionsScreen}
              options={{ headerShown: true, title: 'Inscriptos al final' }}
            />
            <Stack.Screen
              name="AddClassToSemester"
              component={TeacherAddClassToSemesterScreen}
              options={{ headerShown: true, title: 'Agregar clase' }}
            />
            <Stack.Screen
              name="SemesterCard"
              component={TeacherSemesterCardScreen}
              options={{ headerShown: true, title: 'Cuatrimestre' }}
            />
            <Stack.Screen
              name="EditEvaluation"
              component={TeacherEditEvaluationScreen}
              options={{ headerShown: true, title: 'Editar evaluación' }}
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
