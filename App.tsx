import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './calendars.config';
import * as React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
  SplashScreen, LandingScreen, PreRegisterScreen, PreRegisterPasswordScreen, TakePictureStepScreen, PreRegisterLastInstructionsScreen,
  RootDrawer, CorrelativeSubjects, ViewSemesterScreen, MyAttendancesScreen, AttendanceLocationSubmitScreen, MySubmissionsScreen, ViewEvaluationsScreen, ViewEvaluationDetailsScreen, AddEvaluationSubmissionScreen, ViewFinalDetailsScreen, ViewClassDetailsScreen, TeachersScreen, StatsScreen,
  GoogleRegisterScreen,
  ChangePasswordScreen,
  ForgotPasswordRequestScreen,
  ForgotPasswordConfirmScreen,
  CompleteFaceRegistrationScreen,
  NotificationsScreen,
  CommissionInscriptionsScreen,
  ApprovedSubjectsScreen,
  PendingSubjectsScreen,
  StudentCredentialScreen,
  MyAccountScreen,
  UsefulLinksScreen,
  // Teacher screens
  TeacherSemesterStudentsScreen, TeacherSemesterEditScreen,
  TeacherEvaluationsListScreen, TeacherAddEvaluationScreen, TeacherSubmissionsListScreen, TeacherSubmissionDetailsScreen,
  TeacherFinalsListScreen, TeacherAddFinalScreen,
  TeacherStaffScreen, TeacherStaffConfigurationScreen, TeacherAddStaffScreen,
  TeacherSemesterAttendancesScreen, TeacherAttendanceDetailsScreen,
  TeacherSemesterAttendanceQRScreen, TeacherEvaluationQRScreen, TeacherFinalExamQRScreen,
  TeacherStatsScreen, TeacherFinalExamSubmissionsScreen, TeacherAddClassToSemesterScreen,
  TeacherSemesterCardScreen, TeacherEditEvaluationScreen,
  // Forms screens
  FormsListScreen, DocumentFormScreen, DigitalFormScreen,
  TeacherFormsScreen, FormsManagerScreen, FormDesignerScreen,
  TeacherSendCommissionNotificationScreen, TeacherSemesterNotificationHistoryScreen,
  FiubaMapScreen,
  ContactsScreen,
  ContactSubjectsScreen,
} from './src/scenes';
import StudentIdentityViewerScreen from './src/scenes/student_identity_viewer';
import ScanQR from './src/scenes/home/subsections/HomeOptions/ScanQR';
import VerifyIdentity from './src/scenes/home/subsections/HomeOptions/VerifyIdentity';
import CreateSemester from './src/scenes/teacher_semester/CreateSemester';
import BedeliaClassroomChangeForm from './src/scenes/bedelia/ClassroomChangeForm';
import DepartmentList from './src/scenes/admin_departments/DepartmentList';
import DepartmentDetail from './src/scenes/admin_departments/DepartmentDetail';
import DepartmentForm from './src/scenes/admin_departments/DepartmentForm';
import CommissionList from './src/scenes/admin_commissions/CommissionList';
import CommissionDetail from './src/scenes/admin_commissions/CommissionDetail';
import CommissionForm from './src/scenes/admin_commissions/CommissionForm';
import FinalsToApproveList from './src/scenes/admin_finals/FinalsToApproveList';
import UserSearch from './src/scenes/admin_users/UserSearch';
import UserDetail from './src/scenes/admin_users/UserDetail';
import NotificationList from './src/scenes/admin_notifications/NotificationList';
import NotificationForm from './src/scenes/admin_notifications/NotificationForm';
import NewsList from './src/scenes/news/NewsList';
import NewsDetail from './src/scenes/news/NewsDetail';
import NewsForm from './src/scenes/news/NewsForm';
import MapScreen from './src/scenes/map';
import FiubaPlanScreen from './src/scenes/fiuba_plan';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { Appearance, Platform } from 'react-native';
import { useEffect } from 'react';
import { configureGoogle } from './src/auth/google_signin';

const Stack = createStackNavigator();

const StudentDepartmentListScreen = () => <DepartmentList isAdmin={false} />;
const AdminDepartmentListScreen = () => <DepartmentList isAdmin={true} />;
const StudentNewsListScreen = () => <NewsList isAdmin={false} />;
const AdminNewsListScreen = () => <NewsList isAdmin={true} />;

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
      PreRegisterDone: 'registro/completado',
      TakePicture: 'registro/foto',
      RootDrawer: {
        path: 'app',
        screens: {
          // On web these live inside the drawer (skipOnWeb hides them from the
          // Stack), so their URL paths must be declared here — declaring them
          // at the top level produces `/app/app/<path>` and confuses the
          // drawer's linking state.
          MyAccount: 'mi-cuenta',
          ChangePassword: 'cambiar-password',
          // Student direct tabs
          Home: 'inicio',
          Calendar: 'calendario',
          // Student submenu content (Drawer.Screen on web)
          CurrentCommissionInscriptions: 'materias-en-curso',
          ApprovedSubjects: 'materias-aprobadas',
          PendingSubjects: 'materias-pendientes',
          StudentStats: 'estadisticas',
          StudentDepartmentList: 'departamentos',
          FormsList: 'tramites',
          FiubaMap: 'plan-de-carrera',
          Contacts: 'contactos',
          ScanQR: 'escanear-qr',
          VerifyIdentity: 'verificar-identidad',
          StudentCredential: 'mi-credencial',
          StudentUsefulLinks: 'enlaces-utiles',
          StudentNewsList: 'novedades',
          // Teacher
          TeacherHome: 'mis-comisiones',
          CreateSemester: 'crear-cuatrimestre',
          TeacherForms: 'validacion-tramites',
          TeacherDepartmentList: 'docente/departamentos',
          TeacherUsefulLinks: 'docente/enlaces-utiles',
          // Admin
          AdminDepartmentList: 'admin/departamentos',
          AdminCommissionList: 'admin/comisiones',
          AdminFinalsToApprove: 'admin/finales-a-aprobar',
          AdminUserSearch: 'admin/usuarios',
          AdminNotificationList: 'admin/avisos',
          FormsManager: 'admin/tramites',
          AdminNewsList: 'admin/novedades',
          BedeliaClassroomChange: 'bedelia/cambio-aula',
          Map: 'mapa',
          Notifications: 'notificaciones',
          // Note: detail / sub-pages (SemesterCard, ViewSemester, TeacherStats,
          // etc.) are registered as hidden drawer routes in menu_config.ts
          // and rendered inside the drawer, but they have no URL paths because
          // they require non-serializable params (e.g. a TeacherSemester object)
          // and would crash on direct URL load.
        },
      },
      // Mobile-only Stack screens that aren't reachable through the web drawer
      FinalExamQR: 'cuatrimestre/finales/qr',
      SemesterAttendanceQR: 'cuatrimestre/asistencias/qr',
      EvaluationQR: 'cuatrimestre/evaluaciones/qr',
      StudentIdentityViewer: 'credencial/:token',
    },
  },
};

// Route names that render INSIDE the web drawer; on web they must not also live
// at the Stack root, or we'd have duplicate routes and the Stack version would
// shadow the drawer one.
const WEB_DRAWER_EMBEDDED_ROUTES = new Set<string>([
  'ViewSemester', 'MyAttendances', 'MySubmissions', 'CorrelativeSubjects',
  'ViewEvaluations', 'ViewEvaluationDetails', 'AddEvaluationSubmission',
  'ViewFinalDetails', 'ViewClassDetails', 'Teachers', 'Stats',
  'StudentCredential', 'StudentStats', 'CurrentCommissionInscriptions',
  'ApprovedSubjects', 'PendingSubjects', 'StudentDepartmentList', 'FormsList',
  'StudentUsefulLinks', 'TeacherUsefulLinks', 'Map', 'FiubaPlan', 'FiubaMap',
  'Contacts',
  'CreateSemester', 'TeacherForms', 'AdminDepartmentList', 'AdminCommissionList',
  'AdminUserSearch', 'AdminNotificationList', 'FormsManager',
  'BedeliaClassroomChange', 'AdminDepartmentDetail', 'AdminDepartmentCreate',
  'AdminDepartmentEdit', 'AdminCommissionCreate', 'AdminCommissionDetail',
  'AdminCommissionEdit', 'AdminUserDetail', 'AdminNotificationCreate',
  'Notifications', 'StudentNewsList', 'AdminNewsList', 'NewsDetail',
  'AdminNewsCreate', 'AdminNewsEdit', 'ChangePassword', 'MyAccount',
  'SemesterStudents', 'SemesterEditScreen', 'EvaluationsList', 'AddEvaluation',
  'EditEvaluation', 'SubmissionsList', 'TeacherSubmissionDetails',
  'FinalsList', 'AddFinal', 'TeacherStaff', 'TeachersConfiguration',
  'AddTeachersConfigurationList', 'SemesterAttendances', 'AttendanceDetails',
  'AddClassToSemester', 'TeacherStats', 'FinalExamSubmissions', 'SemesterCard',
  'DocumentForm', 'DigitalForm', 'FormDesigner', 'SendCommissionNotification',
  'SemesterNotificationHistory',
]);

const skipOnWeb = (name: string): boolean =>
  Platform.OS === 'web' && WEB_DRAWER_EMBEDDED_ROUTES.has(name);

const App = () => {
  useEffect(() => {
    configureGoogle();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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

              {!skipOnWeb('ViewSemester') && (
                <Stack.Screen
                  name="ViewSemester"
                  component={ViewSemesterScreen}
                  options={{ headerShown: true, title: "Comisión" }}
                />
              )}

              {!skipOnWeb('MyAttendances') && (
                <Stack.Screen
                  name="MyAttendances"
                  component={MyAttendancesScreen}
                  options={{ headerShown: true, title: 'Mis asistencias' }}
                />
              )}

              <Stack.Screen
                name="AttendanceLocationSubmit"
                component={AttendanceLocationSubmitScreen}
                options={{ headerShown: true, title: 'Marcar presencia' }}
              />

              {!skipOnWeb('MySubmissions') && (
                <Stack.Screen
                  name="MySubmissions"
                  component={MySubmissionsScreen}
                  options={{ headerShown: true, title: 'Mis entregas' }}
                />
              )}

              {!skipOnWeb('CorrelativeSubjects') && (
                <Stack.Screen
                  name="CorrelativeSubjects"
                  component={CorrelativeSubjects}
                  options={{ headerShown: true, title: "Correlativas" }}
                />
              )}

              {!skipOnWeb('ViewEvaluations') && (
                <Stack.Screen
                  name="ViewEvaluations"
                  component={ViewEvaluationsScreen}
                  options={{ headerShown: true, title: "Evaluaciones" }}
                />
              )}

              {!skipOnWeb('ViewEvaluationDetails') && (
                <Stack.Screen
                  name="ViewEvaluationDetails"
                  component={ViewEvaluationDetailsScreen}
                  options={{ headerShown: true, title: "Evaluación" }}
                />
              )}

              {/* Screens that moved from the drawer to the root stack (mobile) */}
              <Stack.Screen name="ScanQR" component={ScanQR} options={{ headerShown: true, title: 'Escanear QR' }} />
              <Stack.Screen name="ScanQRScreen" component={ScanQR} options={{ headerShown: true, title: 'Escanear QR' }} />
              <Stack.Screen name="VerifyIdentity" component={VerifyIdentity} options={{ headerShown: true, title: 'Verificar identidad' }} />
              {!skipOnWeb('StudentCredential') && <Stack.Screen name="StudentCredential" component={StudentCredentialScreen} options={{ headerShown: true, title: 'Mi credencial' }} />}
              {!skipOnWeb('StudentStats') && <Stack.Screen name="StudentStats" component={StatsScreen} options={{ headerShown: true, title: 'Estadísticas' }} />}
              {!skipOnWeb('CurrentCommissionInscriptions') && <Stack.Screen name="CurrentCommissionInscriptions" component={CommissionInscriptionsScreen} options={{ headerShown: true, title: 'Materias en curso' }} />}
              {!skipOnWeb('ApprovedSubjects') && <Stack.Screen name="ApprovedSubjects" component={ApprovedSubjectsScreen} options={{ headerShown: true, title: 'Materias aprobadas' }} />}
              {!skipOnWeb('PendingSubjects') && <Stack.Screen name="PendingSubjects" component={PendingSubjectsScreen} options={{ headerShown: true, title: 'Materias pendientes' }} />}
              {!skipOnWeb('StudentDepartmentList') && <Stack.Screen name="StudentDepartmentList" component={StudentDepartmentListScreen} options={{ headerShown: true, title: 'Departamentos' }} />}
              {!skipOnWeb('FormsList') && <Stack.Screen name="FormsList" component={FormsListScreen} options={{ headerShown: true, title: 'Trámites' }} />}
              {!skipOnWeb('StudentUsefulLinks') && <Stack.Screen name="StudentUsefulLinks" component={UsefulLinksScreen} options={{ headerShown: true, title: 'Enlaces útiles' }} />}
              {!skipOnWeb('TeacherUsefulLinks') && <Stack.Screen name="TeacherUsefulLinks" component={UsefulLinksScreen} options={{ headerShown: true, title: 'Enlaces útiles' }} />}
              {!skipOnWeb('Map') && <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: true, title: 'Mapa' }} />}
              {!skipOnWeb('FiubaPlan') && <Stack.Screen name="FiubaPlan" component={FiubaPlanScreen} options={{ headerShown: true, title: 'FIUBA Plan' }} />}
              {!skipOnWeb('FiubaMap') && <Stack.Screen name="FiubaMap" component={FiubaMapScreen} options={{ headerShown: true, title: 'Plan de Carrera' }} />}
              {!skipOnWeb('Contacts') && <Stack.Screen name="Contacts" component={ContactsScreen} options={{ headerShown: true, title: 'Contactos' }} />}
              <Stack.Screen name="ContactSubjects" component={ContactSubjectsScreen} options={{ headerShown: true, title: 'Materias en curso' }} />
              {!skipOnWeb('CreateSemester') && <Stack.Screen name="CreateSemester" component={CreateSemester} options={{ headerShown: true, title: 'Crear cuatrimestre' }} />}
              {!skipOnWeb('TeacherForms') && <Stack.Screen name="TeacherForms" component={TeacherFormsScreen} options={{ headerShown: true, title: 'Validación de trámites' }} />}
              {!skipOnWeb('AdminDepartmentList') && <Stack.Screen name="AdminDepartmentList" component={AdminDepartmentListScreen} options={{ headerShown: true, title: 'Departamentos' }} />}
              {!skipOnWeb('AdminCommissionList') && <Stack.Screen name="AdminCommissionList" component={CommissionList} options={{ headerShown: true, title: 'Comisiones' }} />}
              {!skipOnWeb('AdminFinalsToApprove') && <Stack.Screen name="AdminFinalsToApprove" component={FinalsToApproveList} options={{ headerShown: true, title: 'Finales para aprobar' }} />}
              {!skipOnWeb('AdminUserSearch') && <Stack.Screen name="AdminUserSearch" component={UserSearch} options={{ headerShown: true, title: 'Buscar Usuarios' }} />}
              {!skipOnWeb('AdminNotificationList') && <Stack.Screen name="AdminNotificationList" component={NotificationList} options={{ headerShown: true, title: 'Avisos' }} />}
              {!skipOnWeb('FormsManager') && <Stack.Screen name="FormsManager" component={FormsManagerScreen} options={{ headerShown: true, title: 'Gestor de Trámites' }} />}
              {!skipOnWeb('BedeliaClassroomChange') && <Stack.Screen name="BedeliaClassroomChange" component={BedeliaClassroomChangeForm} options={{ headerShown: true, title: 'Cambio de aula' }} />}
              {/* Detail routes (formerly hidden drawer screens) */}
              {!skipOnWeb('AdminDepartmentDetail') && <Stack.Screen name="AdminDepartmentDetail" component={DepartmentDetail} options={{ headerShown: true, title: 'Departamento' }} />}
              {!skipOnWeb('AdminDepartmentCreate') && <Stack.Screen name="AdminDepartmentCreate" component={DepartmentForm} options={{ headerShown: true, title: 'Nuevo Departamento' }} />}
              {!skipOnWeb('AdminDepartmentEdit') && <Stack.Screen name="AdminDepartmentEdit" component={DepartmentForm} options={{ headerShown: true, title: 'Editar Departamento' }} />}
              {!skipOnWeb('AdminCommissionCreate') && <Stack.Screen name="AdminCommissionCreate" component={CommissionForm} options={{ headerShown: true, title: 'Nueva Comisión' }} />}
              {!skipOnWeb('AdminCommissionDetail') && <Stack.Screen name="AdminCommissionDetail" component={CommissionDetail} options={{ headerShown: true, title: 'Comisión' }} />}
              {!skipOnWeb('AdminCommissionEdit') && <Stack.Screen name="AdminCommissionEdit" component={CommissionForm} options={{ headerShown: true, title: 'Editar Comisión' }} />}
              {!skipOnWeb('AdminUserDetail') && <Stack.Screen name="AdminUserDetail" component={UserDetail} options={{ headerShown: true, title: 'Usuario' }} />}
              {!skipOnWeb('AdminNotificationCreate') && <Stack.Screen name="AdminNotificationCreate" component={NotificationForm} options={{ headerShown: true, title: 'Nuevo Aviso' }} />}
              {!skipOnWeb('Notifications') && <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notificaciones' }} />}
              {!skipOnWeb('StudentNewsList') && <Stack.Screen name="StudentNewsList" component={StudentNewsListScreen} options={{ headerShown: true, title: 'Novedades' }} />}
              {!skipOnWeb('AdminNewsList') && <Stack.Screen name="AdminNewsList" component={AdminNewsListScreen} options={{ headerShown: true, title: 'Novedades' }} />}
              {!skipOnWeb('NewsDetail') && <Stack.Screen name="NewsDetail" component={NewsDetail} options={{ headerShown: true, title: 'Novedad' }} />}
              {!skipOnWeb('AdminNewsCreate') && <Stack.Screen name="AdminNewsCreate" component={NewsForm} options={{ headerShown: true, title: 'Nueva Novedad' }} />}
              {!skipOnWeb('AdminNewsEdit') && <Stack.Screen name="AdminNewsEdit" component={NewsForm} options={{ headerShown: true, title: 'Editar Novedad' }} />}
              {!skipOnWeb('AddEvaluationSubmission') && (
                <Stack.Screen
                  name="AddEvaluationSubmission"
                  component={AddEvaluationSubmissionScreen}
                  options={{ headerShown: true, title: 'Agregar entrega' }}
                />
              )}


              {!skipOnWeb('ViewFinalDetails') && (
                <Stack.Screen
                  name="ViewFinalDetails"
                  component={ViewFinalDetailsScreen}
                  options={{ headerShown: true, title: "Final" }}
                />
              )}

              {!skipOnWeb('ViewClassDetails') && (
                <Stack.Screen
                  name="ViewClassDetails"
                  component={ViewClassDetailsScreen}
                  options={{ headerShown: true, title: "Cursada" }}
                />
              )}

              {!skipOnWeb('Teachers') && (
                <Stack.Screen
                  name="Teachers"
                  component={TeachersScreen}
                  options={{ headerShown: true, title: "Cuerpo Docente" }}
                />
              )}

              {!skipOnWeb('Stats') && (
                <Stack.Screen
                  name="Stats"
                  component={StatsScreen}
                  options={{ headerShown: true, title: "Estadisticas" }}
                />
              )}

              <Stack.Screen
                name="GoogleRegister"
                component={GoogleRegisterScreen}
                options={{ headerShown: true, title: 'Completar registro' }}
              />

              {!skipOnWeb('ChangePassword') && (
                <Stack.Screen
                  name="ChangePassword"
                  component={ChangePasswordScreen}
                  options={{ headerShown: true, title: 'Cambiar contraseña' }}
                />
              )}

              {!skipOnWeb('MyAccount') && (
                <Stack.Screen
                  name="MyAccount"
                  component={MyAccountScreen}
                  options={{ headerShown: true, title: 'Mi perfil' }}
                />
              )}

              <Stack.Screen
                name="CompleteFaceRegistration"
                component={CompleteFaceRegistrationScreen}
                options={{ headerShown: true, title: 'Completar registro facial' }}
              />

              {/* Teacher Stack screens */}
              {!skipOnWeb('SemesterStudents') && (
                <Stack.Screen
                  name="SemesterStudents"
                  component={TeacherSemesterStudentsScreen}
                  options={{ headerShown: true, title: 'Alumnos del cuatrimestre' }}
                />
              )}
              {!skipOnWeb('SemesterEditScreen') && (
                <Stack.Screen
                  name="SemesterEditScreen"
                  component={TeacherSemesterEditScreen}
                  options={{ headerShown: true, title: 'Editar cuatrimestre' }}
                />
              )}
              {!skipOnWeb('EvaluationsList') && (
                <Stack.Screen
                  name="EvaluationsList"
                  component={TeacherEvaluationsListScreen}
                  options={{ headerShown: true, title: 'Evaluaciones' }}
                />
              )}
              {!skipOnWeb('AddEvaluation') && (
                <Stack.Screen
                  name="AddEvaluation"
                  component={TeacherAddEvaluationScreen}
                  options={{ headerShown: true, title: 'Agregar evaluación' }}
                />
              )}
              {!skipOnWeb('SubmissionsList') && (
                <Stack.Screen
                  name="SubmissionsList"
                  component={TeacherSubmissionsListScreen}
                  options={{ headerShown: true, title: 'Entregas' }}
                />
              )}
              {!skipOnWeb('TeacherSubmissionDetails') && (
                <Stack.Screen
                  name="TeacherSubmissionDetails"
                  component={TeacherSubmissionDetailsScreen}
                  options={{ headerShown: true, title: 'Detalle de entrega' }}
                />
              )}
              {!skipOnWeb('FinalsList') && (
                <Stack.Screen
                  name="FinalsList"
                  component={TeacherFinalsListScreen}
                  options={{ headerShown: true, title: 'Finales' }}
                />
              )}
              {!skipOnWeb('AddFinal') && (
                <Stack.Screen
                  name="AddFinal"
                  component={TeacherAddFinalScreen}
                  options={{ headerShown: true, title: 'Agregar final' }}
                />
              )}
              {!skipOnWeb('TeacherStaff') && (
                <Stack.Screen
                  name="TeacherStaff"
                  component={TeacherStaffScreen}
                  options={{ headerShown: true, title: 'Cuerpo Docente' }}
                />
              )}
              {!skipOnWeb('TeachersConfiguration') && (
                <Stack.Screen
                  name="TeachersConfiguration"
                  component={TeacherStaffConfigurationScreen}
                  options={{ headerShown: true, title: 'Configurar docentes' }}
                />
              )}
              {!skipOnWeb('AddTeachersConfigurationList') && (
                <Stack.Screen
                  name="AddTeachersConfigurationList"
                  component={TeacherAddStaffScreen}
                  options={{ headerShown: true, title: 'Agregar docente' }}
                />
              )}
              {!skipOnWeb('SemesterAttendances') && (
                <Stack.Screen
                  name="SemesterAttendances"
                  component={TeacherSemesterAttendancesScreen}
                  options={{ headerShown: true, title: 'Asistencias' }}
                />
              )}
              {!skipOnWeb('AttendanceDetails') && (
                <Stack.Screen
                  name="AttendanceDetails"
                  component={TeacherAttendanceDetailsScreen}
                  options={{ headerShown: true, title: 'Detalles de asistencia' }}
                />
              )}
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
              {!skipOnWeb('TeacherStats') && (
                <Stack.Screen
                  name="TeacherStats"
                  component={TeacherStatsScreen}
                  options={{ headerShown: true, title: 'Estadísticas' }}
                />
              )}
              {!skipOnWeb('FinalExamSubmissions') && (
                <Stack.Screen
                  name="FinalExamSubmissions"
                  component={TeacherFinalExamSubmissionsScreen}
                  options={{ headerShown: true, title: 'Inscriptos al final' }}
                />
              )}
              {!skipOnWeb('AddClassToSemester') && (
                <Stack.Screen
                  name="AddClassToSemester"
                  component={TeacherAddClassToSemesterScreen}
                  options={{ headerShown: true, title: 'Agregar clase' }}
                />
              )}
              {!skipOnWeb('SemesterCard') && (
                <Stack.Screen
                  name="SemesterCard"
                  component={TeacherSemesterCardScreen}
                  options={{ headerShown: true, title: 'Cuatrimestre' }}
                />
              )}
              {!skipOnWeb('EditEvaluation') && (
                <Stack.Screen
                  name="EditEvaluation"
                  component={TeacherEditEvaluationScreen}
                  options={{ headerShown: true, title: 'Editar evaluación' }}
                />
              )}

              {/* Forms stack screens */}
              {!skipOnWeb('DocumentForm') && (
                <Stack.Screen
                  name="DocumentForm"
                  component={DocumentFormScreen}
                  options={{ headerShown: true, title: 'Formulario' }}
                />
              )}
              {!skipOnWeb('DigitalForm') && (
                <Stack.Screen
                  name="DigitalForm"
                  component={DigitalFormScreen}
                  options={{ headerShown: true, title: 'Completar formulario' }}
                />
              )}
              {!skipOnWeb('FormDesigner') && (
                <Stack.Screen
                  name="FormDesigner"
                  component={FormDesignerScreen}
                  options={{ headerShown: true, title: 'Nuevo formulario' }}
                />
              )}
              {!skipOnWeb('SendCommissionNotification') && (
                <Stack.Screen
                  name="SendCommissionNotification"
                  component={TeacherSendCommissionNotificationScreen}
                  options={{ headerShown: true, title: 'Enviar aviso' }}
                />
              )}
              {!skipOnWeb('SemesterNotificationHistory') && (
                <Stack.Screen
                  name="SemesterNotificationHistory"
                  component={TeacherSemesterNotificationHistoryScreen}
                  options={{ headerShown: true, title: 'Avisos enviados' }}
                />
              )}
              <Stack.Screen
                name="StudentIdentityViewer"
                component={StudentIdentityViewerScreen}
                options={{ headerShown: true, title: 'Credencial estudiantil' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ActionSheetProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;

function isDarkTheme() {
  if (Platform.OS === 'web') return false;
  return Appearance.getColorScheme() === 'dark';
}
