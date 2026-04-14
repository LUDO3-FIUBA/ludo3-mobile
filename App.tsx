import 'react-native-gesture-handler';
import * as React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
  SplashScreen, LandingScreen, PreRegisterScreen, PreRegisterPasswordScreen, TakePictureStepScreen, PreRegisterLastInstructionsScreen,
  RootDrawer, CorrelativeSubjects, ViewSemesterScreen, ViewEvaluationsScreen, ViewEvaluationDetailsScreen, AddEvaluationSubmissionScreen, TeachersScreen, StatsScreen,
  GoogleRegisterScreen,
  ChangePasswordScreen,
  ForgotPasswordRequestScreen,
  ForgotPasswordConfirmScreen,
  // Teacher screens
  TeacherSemesterStudentsScreen, TeacherSemesterEditScreen,
  TeacherEvaluationsListScreen, TeacherAddEvaluationScreen, TeacherSubmissionsListScreen, TeacherSubmissionDetailsScreen,
  TeacherFinalsListScreen, TeacherAddFinalScreen,
  TeacherStaffScreen, TeacherStaffConfigurationScreen, TeacherAddStaffScreen,
  TeacherSemesterAttendancesScreen, TeacherAttendanceDetailsScreen,
  TeacherSemesterAttendanceQRScreen, TeacherEvaluationQRScreen, TeacherFinalExamQRScreen,
  TeacherStatsScreen, TeacherFinalExamSubmissionsScreen, TeacherAddClassToSemesterScreen,
  TeacherSemesterCardScreen, TeacherEditEvaluationScreen,
} from './src/scenes';
import ScanQR from './src/scenes/home/subsections/HomeOptions/ScanQR';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { Appearance, Platform } from 'react-native';
import { useEffect } from 'react';
import { configureGoogle } from './src/auth/google_signin';

const Stack = createStackNavigator();

const webLinking = {
  prefixes: ['http://localhost:8081'],
  config: {
    screens: {
      Splash: 'splash',
      Landing: 'login',
      ForgotPasswordRequest: 'password/forgot',
      ForgotPasswordConfirm: 'password/forgot/confirm',
      GoogleRegister: 'registro/google',
      PreRegister: 'registro',
      PreRegisterPassword: 'registro/password',
      ChangePassword: 'app/cambiar-password',
      PreRegisterDone: 'registro/completado',
      TakePicture: 'registro/foto',
      RootDrawer: {
        path: 'app',
        screens: {
          Home: 'inicio',
          Calendar: 'calendario',
          CurrentCommissionInscriptions: 'materias-en-curso',
          ApprovedSubjects: 'materias-aprobadas',
          PendingSubjects: 'materias-pendientes',
          ScanQR: 'escanear-qr',
          VerifyIdentity: 'verificar-identidad',
          StudentStats: 'estadisticas',
          TeacherHome: 'mis-comisiones',
          CreateSemester: 'crear-cuatrimestre',
        },
      },
      ViewSemester: 'comision',
      CorrelativeSubjects: 'correlativas',
      ViewEvaluations: 'evaluaciones',
      ViewEvaluationDetails: 'evaluacion',
      Teachers: 'docentes',
      Stats: 'estadisticas-alumno',
      SemesterCard: 'cuatrimestre',
      SemesterStudents: 'cuatrimestre/alumnos',
      SemesterEditScreen: 'cuatrimestre/editar',
      EvaluationsList: 'cuatrimestre/evaluaciones',
      AddEvaluation: 'cuatrimestre/evaluaciones/agregar',
      SubmissionsList: 'cuatrimestre/evaluaciones/entregas',
      FinalsList: 'cuatrimestre/finales',
      AddFinal: 'cuatrimestre/finales/agregar',
      FinalExamSubmissions: 'cuatrimestre/finales/inscriptos',
      FinalExamQR: 'cuatrimestre/finales/qr',
      TeacherStaff: 'cuatrimestre/docentes',
      TeachersConfiguration: 'cuatrimestre/docentes/configurar',
      AddTeachersConfigurationList: 'cuatrimestre/docentes/agregar',
      SemesterAttendances: 'cuatrimestre/asistencias',
      AttendanceDetails: 'cuatrimestre/asistencias/detalle',
      AddClassToSemester: 'cuatrimestre/asistencias/agregar-clase',
      SemesterAttendanceQR: 'cuatrimestre/asistencias/qr',
      EvaluationQR: 'cuatrimestre/evaluaciones/qr',
      TeacherStats: 'cuatrimestre/estadisticas',
    },
  },
};

const App = () => {
  useEffect(() => {
    configureGoogle();
  }, []);

  return (
    <Provider store={store}>
      <ActionSheetProvider>
        <NavigationContainer theme={isDarkTheme() ? DarkTheme : DefaultTheme} linking={Platform.OS === 'web' ? webLinking : undefined}>
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
              name="ForgotPasswordRequest"
              component={ForgotPasswordRequestScreen}
              options={{ headerShown: true, title: 'Recuperar contraseña' }}
            />

            <Stack.Screen
              name="ForgotPasswordConfirm"
              component={ForgotPasswordConfirmScreen}
              options={{ headerShown: true, title: 'Confirmar recuperación' }}
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
              options={{ headerShown: true, title: "Evaluación" }}
            />

            <Stack.Screen
              name="ScanQRScreen"
              component={ScanQR}
              options={{ headerShown: true, title: 'Escanear QR' }}
            />

            <Stack.Screen
              name="AddEvaluationSubmission"
              component={AddEvaluationSubmissionScreen}
              options={{ headerShown: true, title: 'Agregar entrega' }}
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

            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ headerShown: true, title: 'Cambiar contraseña' }}
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
              name="TeacherSubmissionDetails"
              component={TeacherSubmissionDetailsScreen}
              options={{ headerShown: true, title: 'Detalle de entrega' }}
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
  if (Platform.OS === 'web') return false;
  return Appearance.getColorScheme() === 'dark';
}
