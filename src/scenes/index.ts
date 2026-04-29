// export SplashScreen from './splash';
// export LandingScreen from './landing';
// export PreRegisterScreen from './preregister';
// export ApprovedSubjectsScreen from './approved_subjects';
// export SubjectHistoryScreen from './subject_history';

export { default as SplashScreen } from './splash';
export { default as LandingScreen } from './landing';
export { default as PreRegisterScreen } from './preregister';
export { default as HomeScreen } from './home';
export { default as TakePictureStepScreen } from './image_recognition/takePictureStep';
export { default as CameraTestScreen } from './camera_test'
export { default as PendingSubjectsScreen } from './pending_subjects';
export { default as PreRegisterLastInstructionsScreen } from './preregister/done';
export { default as PreRegisterPasswordScreen } from './preregister/password';
export { default as ApprovedSubjectsScreen } from './approved_subjects';
export { default as ViewSemesterScreen } from './view_semester';
export { default as MyAttendancesScreen } from './view_semester/MyAttendances';
export { default as MySubmissionsScreen } from './view_semester/MySubmissions';
export { default as RootDrawer } from './root_drawer';
export { default as CorrelativeSubjects } from './correlative_subjects';
export { default as CalendarScreen } from './calendar';
export { default as CommissionInscriptionsScreen } from './commission_inscriptions';
export { default as ViewEvaluationsScreen } from './view_evaluations';
export { default as ViewEvaluationDetailsScreen } from './view_evaluation_details';
export { default as ViewFinalDetailsScreen } from './view_final_details';
export { default as ViewClassDetailsScreen } from './view_class_details';
export { default as AddEvaluationSubmissionScreen } from './view_evaluation_details/AddEvaluationSubmission';
export { default as TeachersScreen } from './teachers';
export { default as StatsScreen } from './stats';
export { default as GoogleRegisterScreen } from './google_register';
export { default as ChangePasswordScreen } from './password/change';
export { default as ForgotPasswordRequestScreen } from './password/forgot_request';
export { default as ForgotPasswordConfirmScreen } from './password/forgot_confirm';
export { default as CompleteFaceRegistrationScreen } from './complete_face_registration';

// Teacher scenes
export { default as TeacherHomeScreen } from './teacher_home';
export { default as TeacherCreateSemesterScreen } from './teacher_semester/CreateSemester';
export { default as TeacherSemesterStudentsScreen } from './teacher_semester/SemesterStudents';
export { default as TeacherSemesterEditScreen } from './teacher_semester/SemesterEditScreen';
export { default as TeacherEvaluationsListScreen } from './teacher_evaluations/EvaluationsList';
export { default as TeacherAddEvaluationScreen } from './teacher_evaluations/AddEvaluation';
export { default as TeacherSubmissionsListScreen } from './teacher_evaluations/SubmissionsList';
export { default as TeacherSubmissionDetailsScreen } from './teacher_evaluations/SubmissionDetails';
export { default as TeacherFinalsListScreen } from './teacher_finals/FinalsList';
export { default as TeacherAddFinalScreen } from './teacher_finals/AddFinal';
export { default as TeacherStaffScreen } from './teacher_staff/Teachers';
export { default as TeacherStaffConfigurationScreen } from './teacher_staff/TeachersConfiguration';
export { default as TeacherAddStaffScreen } from './teacher_staff/AddTeachersConfigurationList';
export { default as TeacherSemesterAttendancesScreen } from './teacher_attendances/SemesterAttendances';
export { default as TeacherAttendanceDetailsScreen } from './teacher_attendances/AttendanceDetails';
export { default as TeacherSemesterAttendanceQRScreen } from './teacher_qr/SemesterAttendanceQR';
export { default as TeacherEvaluationQRScreen } from './teacher_qr/EvaluationQR';
export { default as TeacherFinalExamQRScreen } from './teacher_qr/FinalExamQR';
export { default as TeacherStatsScreen } from './teacher_stats';
export { default as TeacherFinalExamSubmissionsScreen } from './teacher_finals/FinalExamSubmissions';
export { default as TeacherAddClassToSemesterScreen } from './teacher_attendances/AddClassToSemester';
export { default as TeacherSemesterCardScreen } from './teacher_semester/SemesterCard';
export { default as TeacherEditEvaluationScreen } from './teacher_evaluations/EditEvaluation';

// Forms — Student screens
export { default as FormsListScreen } from './forms/FormsListScreen';
export { default as DocumentFormScreen } from './forms/DocumentFormScreen';
export { default as DigitalFormScreen } from './forms/DigitalFormScreen';

// Forms — Admin screens
export { default as FormsManagerScreen } from './admin_forms/FormsManagerScreen';
export { default as FormDesignerScreen } from './admin_forms/FormDesignerScreen';
// Student identity screens
export { default as StudentCredentialScreen } from './student_credential';
export { default as StudentIdentityViewerScreen } from './student_identity_viewer';
