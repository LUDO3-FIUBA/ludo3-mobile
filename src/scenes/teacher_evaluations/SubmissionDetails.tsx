import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import moment from 'moment';
import {
	EvaluationDateRangeCard,
	EvaluationDetailsHeader,
	EvaluationResultCard,
	GraderUpdatedCard,
	MaterialIcon,
	SubmissionDateRow,
	SubmissionTextCard,
} from '../../components';
import { Submission } from '../../models/Submission';
import { TeacherEvaluation } from '../../models/TeacherEvaluation';
import { TeacherModel } from '../../models/TeacherModel';
import { lightModeColors } from '../../styles/colorPalette';
import DropDownPicker from 'react-native-dropdown-picker';
import { teacherSubmissionsRepository } from '../../repositories';
import EntitySelectionModal from './EntitySelectionModal';
import { useAppSelector } from '../../redux/hooks';
import { selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { selectStaffTeachers } from '../../redux/reducers/teacherStaffSlice';
import { selectUserData } from '../../redux/reducers/teacherUserDataSlice';
import { getLateSubmissionInfo } from '../../utils/lateSubmission';
import { evaluationDetailsScreenStyles as styles, evaluationDetailsTextStyles } from '../../styles/evaluationDetails';

type RouteParams = {
	evaluation: TeacherEvaluation;
	submission: Submission;
	subjectName?: string;
};

export default function SubmissionDetails({ route }: any) {
	const { evaluation, submission, subjectName: routeSubjectName } = route.params as RouteParams;
	const semester = useAppSelector(selectSemesterData);
	const teachersTuples = useAppSelector(selectStaffTeachers);
	const userData = useAppSelector(selectUserData);
	const isActualUserChiefTeacher = semester?.commission.chiefTeacher.id === userData?.id;
	const isGradeable = (evaluation as any).isGradeable ?? (evaluation as any).is_gradeable ?? true;
	const initialGrade = submission.grade ? String(submission.grade) : '';
	const initialStatus = (submission.submissionStatus || '').toUpperCase();
	const [editing, setEditing] = useState(false);
	const [grade, setGrade] = useState(initialGrade);
	const [status, setStatus] = useState<'aprobado' | 'desaprobado' | null>(
		initialStatus === 'APROBADO'
			? 'aprobado'
			: initialStatus === 'DESAPROBADO'
				? 'desaprobado'
				: null,
	);
	const [saving, setSaving] = useState(false);
	const [statusOpen, setStatusOpen] = useState(false);
	const [showTeacherSelectionModal, setShowTeacherSelectionModal] = useState(false);
	const [semesterTeachers, setSemesterTeachers] = useState<TeacherModel[]>([]);

	const evaluationName = (evaluation as any).evaluationName || (evaluation as any).evaluation_name || 'Evaluación';
	const subjectName = routeSubjectName || (evaluation as any).semester?.commission?.subjectName || (evaluation as any).semester?.commission?.subject_name || '–';

	const startDateRaw = (evaluation as any).startDate || (evaluation as any).start_date;
	const endDateRaw = (evaluation as any).endDate || (evaluation as any).end_date;
	const submissionCreatedAtRaw = (submission as any).createdAt || (submission as any).created_at;
	const submissionUpdatedAtRaw = (submission as any).updatedAt || (submission as any).updated_at;
	const submissionTextRaw = (submission as any).submissionText || (submission as any).submission_text;
	const [currentGrader, setCurrentGrader] = useState(submission.grader);
	const [currentUpdatedAt, setCurrentUpdatedAt] = useState(submissionUpdatedAtRaw);

	const passingGrade = (evaluation as any).passingGrade ?? (evaluation as any).passing_grade;
	const gradeNumber = grade ? Number(grade) : null;
	const submissionStatus = (status || '').toUpperCase();

	const statusLabel = useMemo(() => {
		if (isGradeable) {
			return gradeNumber === null ? 'Entregado, esperando corrección' : 'Corregido';
		}

		if (submissionStatus === 'APROBADO' || submissionStatus === 'DESAPROBADO') {
			return 'Corregido';
		}

		return 'Entregado, esperando corrección';
	}, [gradeNumber, isGradeable, submissionStatus]);

	const isApprovedSubmission = submissionStatus === 'APROBADO';
	const isFailedSubmission = submissionStatus === 'DESAPROBADO';
	const failedExam = isGradeable
		? gradeNumber !== null && gradeNumber < (passingGrade || 0)
		: isFailedSubmission;

	const circleProgress = isGradeable
		? (gradeNumber ?? 0) / 10
		: (isApprovedSubmission || isFailedSubmission)
			? 1
			: 0;

	const circleText = isGradeable
		? grade ?? '–'
		: isApprovedSubmission
			? 'Aprobado'
			: isFailedSubmission
				? 'Desaprobado'
				: '–';

	const lateInfo = useMemo(() => getLateSubmissionInfo(submissionCreatedAtRaw, endDateRaw), [submissionCreatedAtRaw, endDateRaw]);
	const isLate = lateInfo.isLate;
	const lateByText = lateInfo.lateByText;

	const onCirclePress = () => {
		setEditing(true);
	};

	const onGradeChange = (text: string) => {
		const onlyDigits = text.replace(/[^0-9]/g, '');
		if (onlyDigits === '') {
			setGrade('');
			return;
		}

		const parsed = Number(onlyDigits);
		if (Number.isNaN(parsed)) {
			return;
		}

		setGrade(String(Math.min(10, Math.max(0, parsed))));
	};

	const saveChanges = async () => {
		try {
			setSaving(true);
			if (isGradeable) {
				if (grade.trim() === '') {
					Alert.alert('Error', 'Ingresá una nota.');
					return;
				}
				const numericGrade = Number(grade);
				if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 10) {
					Alert.alert('Error', 'La nota debe estar entre 0 y 10.');
					return;
				}
				const gradeChange = await teacherSubmissionsRepository.gradeSubmission(submission.student.id, evaluation.id, numericGrade);
				setCurrentGrader(gradeChange.grader);
				setCurrentUpdatedAt(gradeChange.updatedAt);
			} else {
				if (!status) {
					Alert.alert('Error', 'Seleccioná un estado.');
					return;
				}
				const gradeChange = await teacherSubmissionsRepository.setSubmissionStatus(
					submission.student.id,
					evaluation.id,
					status === 'aprobado' ? 'APROBADO' : 'DESAPROBADO',
				);
				setCurrentGrader(gradeChange.grader);
				setCurrentUpdatedAt(gradeChange.updatedAt);
			}
			setEditing(false);
		} catch (error) {
			Alert.alert('Error', 'No pudimos guardar los cambios. Intenta nuevamente.');
			console.error('Error updating submission from details', error);
		} finally {
			setSaving(false);
		}
	};

	const submissionAlreadyGraded = grade.trim() !== '' || Boolean(status);

	const updateCorrectorToSubmission = () => {
		if (submissionAlreadyGraded) {
			Alert.alert('Error', 'No se puede cambiar el corrector de una entrega ya calificada.');
			return;
		}

		if (isActualUserChiefTeacher) {
			if (semester) {
				const commissionTeachers = teachersTuples.map(actual => actual.teacher);
				commissionTeachers.push(semester.commission.chiefTeacher);
				setSemesterTeachers(commissionTeachers);
			}
			setShowTeacherSelectionModal(true);
			return;
		}

		Alert.alert('Error', 'No tiene permisos para cambiar el corrector de esta entrega.');
	};

	const assignCorrectorToStudent = async (newCorrector: TeacherModel) => {
		setShowTeacherSelectionModal(false);

		try {
			await teacherSubmissionsRepository.assignGraderToSubmission(submission.student.id, evaluation.id, newCorrector.id);
			setCurrentGrader(newCorrector);
			setCurrentUpdatedAt(moment().toISOString());
		} catch (error) {
			Alert.alert('Error', 'Hubo un error al agregar el corrector');
			console.error('Error assigning grader from details', error);
		}
	};

	const content = (
		<>
			<EvaluationDetailsHeader title={evaluationName} subtitle={subjectName} />
			<EvaluationDateRangeCard startDate={formatDate(startDateRaw)} endDate={formatDate(endDateRaw)} />

			<View style={styles.card}>
				<View style={styles.cardItem}>
					<MaterialIcon name="account" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
					<View>
						<Text style={evaluationDetailsTextStyles.passingGradeText}>{submission.student.firstName} {submission.student.lastName}</Text>
						<Text style={evaluationDetailsTextStyles.passingGradeLabel}>Estudiante</Text>
					</View>
				</View>

				<View style={styles.cardItem}>
					<MaterialIcon name="information-outline" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
					<View>
						<Text style={evaluationDetailsTextStyles.passingGradeText}>{statusLabel}</Text>
						<Text style={evaluationDetailsTextStyles.passingGradeLabel}>Estado</Text>
					</View>
				</View>

				<SubmissionDateRow dateText={formatDate(submissionCreatedAtRaw)} isLate={isLate} lateByText={lateByText} />
			</View>

			<SubmissionTextCard submissionText={submissionTextRaw} />

			<EvaluationResultCard
				progress={circleProgress}
				circleText={String(circleText)}
				failed={failedExam}
				isNumericEvaluation={isGradeable}
				passingGrade={passingGrade}
				onPressCircle={onCirclePress}
				showEditHint
			>
				{editing && (
					<View style={styles.editorCard}>
						{isGradeable ? (
							<>
								<Text style={styles.editorLabel}>Editar nota</Text>
								<TextInput
									style={styles.editorInput}
									keyboardType="numeric"
									maxLength={2}
									value={grade}
									onChangeText={onGradeChange}
									placeholder="Ingresá una nota"
								/>
							</>
						) : (
							<>
								<Text style={styles.editorLabel}>Editar estado</Text>
								<DropDownPicker
									open={statusOpen}
									value={status}
									items={[
										{ label: 'Aprobado', value: 'aprobado' },
										{ label: 'Desaprobado', value: 'desaprobado' },
									]}
									setOpen={setStatusOpen}
									setValue={(callback) => setStatus(callback(status))}
									placeholder="Seleccioná un estado"
								/>
							</>
						)}
						<TouchableOpacity style={styles.saveButton} onPress={saveChanges} disabled={saving}>
							<Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
						</TouchableOpacity>
					</View>
				)}
			</EvaluationResultCard>

			<GraderUpdatedCard
				graderName={getGraderName(currentGrader)}
				updatedAt={formatDate(currentUpdatedAt)}
				onPressGrader={updateCorrectorToSubmission}
				canEditGrader={isActualUserChiefTeacher}
			/>
		</>
	);

	return (
		<>
			<FlatList
				style={styles.container}
				data={[{ key: 'content' }]}
				renderItem={() => null}
				ListHeaderComponent={content}
				keyExtractor={(item) => item.key}
			/>
			<EntitySelectionModal
				visible={showTeacherSelectionModal}
				entities={semesterTeachers}
				onSelect={(selectedTeacher) => assignCorrectorToStudent(selectedTeacher as TeacherModel)}
				onClose={() => setShowTeacherSelectionModal(false)}
				title="Asignar corrector"
			/>
		</>
	);
}

function formatDate(date: string | Date | null | undefined): string {
	if (!date) return '–';
	return moment(date).format('HH:mm D/MM/YY');
}

function getGraderName(grader: any): string {
	if (!grader) return '–';
	return `${grader.firstName || grader.first_name || ''} ${grader.lastName || grader.last_name || ''}`.trim();
}
