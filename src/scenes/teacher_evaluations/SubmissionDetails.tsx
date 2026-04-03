import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import moment from 'moment';
import { MaterialIcon } from '../../components';
import { Submission } from '../../models/Submission';
import { TeacherEvaluation } from '../../models/TeacherEvaluation';
import { lightModeColors } from '../../styles/colorPalette';
import DropDownPicker from 'react-native-dropdown-picker';
import { teacherSubmissionsRepository } from '../../repositories';

type RouteParams = {
	evaluation: TeacherEvaluation;
	submission: Submission;
};

export default function SubmissionDetails({ route }: any) {
	const { evaluation, submission } = route.params as RouteParams;
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

	const evaluationName = (evaluation as any).evaluationName || (evaluation as any).evaluation_name || 'Evaluacion';
	const subjectName = (evaluation as any).semester?.commission?.subjectName || (evaluation as any).semester?.commission?.subject_name || '–';

	const startDateRaw = (evaluation as any).startDate || (evaluation as any).start_date;
	const endDateRaw = (evaluation as any).endDate || (evaluation as any).end_date;
	const submissionCreatedAtRaw = (submission as any).createdAt || (submission as any).created_at;
	const submissionUpdatedAtRaw = (submission as any).updatedAt || (submission as any).updated_at;

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

	const isLate = useMemo(() => {
		if (!submissionCreatedAtRaw || !endDateRaw) return false;
		return moment(submissionCreatedAtRaw).isAfter(moment(endDateRaw));
	}, [submissionCreatedAtRaw, endDateRaw]);

	const lateByText = useMemo(() => {
		if (!isLate || !submissionCreatedAtRaw || !endDateRaw) return null;

		const ms = moment(submissionCreatedAtRaw).diff(moment(endDateRaw));
		const minutes = Math.floor(ms / (1000 * 60));
		const days = Math.floor(minutes / (60 * 24));
		const hours = Math.floor((minutes % (60 * 24)) / 60);
		const mins = minutes % 60;

		if (days > 0) {
			return `${days} dia${days > 1 ? 's' : ''} ${hours} hora${hours !== 1 ? 's' : ''}`;
		}

		return `${hours} hora${hours !== 1 ? 's' : ''} ${mins} minuto${mins !== 1 ? 's' : ''}`;
	}, [isLate, submissionCreatedAtRaw, endDateRaw]);

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
				await teacherSubmissionsRepository.gradeSubmission(submission.student.id, evaluation.id, numericGrade);
			} else {
				if (!status) {
					Alert.alert('Error', 'Seleccioná un estado.');
					return;
				}
				await teacherSubmissionsRepository.setSubmissionStatus(
					submission.student.id,
					evaluation.id,
					status === 'aprobado' ? 'APROBADO' : 'DESAPROBADO',
				);
			}
			setEditing(false);
		} catch (error) {
			Alert.alert('Error', 'No pudimos guardar los cambios. Intenta nuevamente.');
			console.error('Error updating submission from details', error);
		} finally {
			setSaving(false);
		}
	};

	const content = (
		<>
			<Text style={styles.header}>{evaluationName}</Text>
			<Text style={styles.header2}>{subjectName}</Text>

			<View style={styles.card}>
				<View style={styles.cardItem}>
					<MaterialIcon name="calendar-clock" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
					<View style={{ flexGrow: 1 }}>
						<Text style={styles.cardTitle}>Inicio</Text>
						<Text style={styles.cardText}>{formatDate(startDateRaw)}</Text>
					</View>
					<MaterialIcon name="chevron-right" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
					<View style={{ flexGrow: 0.5 }}>
						<Text style={styles.cardTitle}>Fin</Text>
						<Text style={styles.cardText}>{formatDate(endDateRaw)}</Text>
					</View>
				</View>
			</View>

			<View style={styles.card}>
				<View style={styles.cardItem}>
					<MaterialIcon name="account" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
					<View>
						<Text style={styles.passingGradeText}>{submission.student.firstName} {submission.student.lastName}</Text>
						<Text style={styles.passingGradeLabel}>Estudiante</Text>
					</View>
				</View>

				<View style={styles.cardItem}>
					<MaterialIcon name="information-outline" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
					<View>
						<Text style={styles.passingGradeText}>{statusLabel}</Text>
						<Text style={styles.passingGradeLabel}>Estado</Text>
					</View>
				</View>

				<View style={styles.cardItem}>
					<MaterialIcon name="calendar-today" fontSize={24} color={isLate ? '#E67E22' : lightModeColors.institutional} style={styles.iconMargin} />
					<View>
						<Text style={[styles.passingGradeText, isLate && styles.lateText]}>{formatDate(submissionCreatedAtRaw)}</Text>
						<Text style={styles.passingGradeLabel}>Fecha de entrega</Text>
						{isLate && <Text style={styles.lateWarning}>Entregado fuera de término</Text>}
						{isLate && lateByText && <Text style={styles.lateByText}>Se entregó con {lateByText} de retraso</Text>}
					</View>
				</View>
			</View>

			<View style={styles.card}>
				<View style={{ alignItems: 'center', gap: 8 }}>
					<TouchableOpacity activeOpacity={0.8} onPress={onCirclePress}>
						<Progress.Circle
							progress={circleProgress}
							formatText={() => String(circleText)}
							color={failedExam ? lightModeColors.failed : lightModeColors.passed}
							unfilledColor={failedExam ? lightModeColors.failed_background : lightModeColors.passed_background}
							strokeCap="round"
							size={135}
							thickness={12}
							showsText
							borderWidth={0}
							textStyle={typeof circleText === 'string' && (circleText === 'Aprobado' || circleText === 'Desaprobado') ? styles.progressTextSmall : styles.progressText}
						/>
						</TouchableOpacity>
						<Text style={styles.passingGradeLabel}>{isGradeable ? 'Nota obtenida' : 'Estado de entrega'}</Text>
						<Text style={styles.editHint}>Presionar para editar</Text>
					</View>

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

					{isGradeable && (
						<View>
							<Text style={styles.passingGradeLabel}>Nota mínima de aprobación: {passingGrade ?? '–'}</Text>
						</View>
					)}
				</View>

				<View style={[styles.card, { marginBottom: 120 }]}> 
					<View style={styles.cardItem}>
						<MaterialIcon name="account-supervisor" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
						<View>
							<Text style={styles.passingGradeText}>{getGraderName(submission.grader)}</Text>
							<Text style={styles.passingGradeLabel}>Corrector</Text>
						</View>
					</View>
					<View style={styles.cardItem}>
						<MaterialIcon name="calendar-edit" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
						<View>
							<Text style={styles.passingGradeText}>{formatDate(submissionUpdatedAtRaw)}</Text>
							<Text style={styles.passingGradeLabel}>Ultima fecha de actualización</Text>
						</View>
					</View>
				</View>
		</>
	);

	return (
		<FlatList
			style={styles.container}
			data={[{ key: 'content' }]}
			renderItem={() => null}
			ListHeaderComponent={content}
			keyExtractor={(item) => item.key}
		/>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	header2: {
		fontSize: 20,
		marginBottom: 18,
	},
	card: {
		flexDirection: 'column',
		marginBottom: 20,
		backgroundColor: 'white',
		padding: 15,
		borderRadius: 8,
		elevation: 3,
		gap: 18,
	},
	cardItem: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	cardTitle: {
		fontWeight: 'bold',
		fontSize: 16,
		marginBottom: 2,
	},
	cardText: {
		color: 'gray',
	},
	passingGradeText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: lightModeColors.institutional,
	},
	passingGradeLabel: {
		fontSize: 14,
		color: 'gray',
	},
	iconMargin: {
		marginRight: 10,
	},
	progressText: {
		fontWeight: 'bold',
		fontSize: 22,
	},
	progressTextSmall: {
		fontWeight: 'bold',
		fontSize: 16,
	},
	lateText: {
		color: '#E67E22',
	},
	lateWarning: {
		color: '#E67E22',
		fontSize: 13,
		fontWeight: '600',
		marginTop: 2,
	},
	lateByText: {
		color: '#E67E22',
		fontSize: 12,
		marginTop: 2,
	},
	editHint: {
		fontSize: 12,
		color: 'gray',
	},
	editorCard: {
		gap: 10,
		paddingTop: 8,
	},
	editorLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
	},
	editorInput: {
		height: 42,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		paddingHorizontal: 12,
		backgroundColor: 'white',
	},
	saveButton: {
		backgroundColor: lightModeColors.institutional,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 4,
	},
	saveButtonText: {
		color: 'white',
		fontWeight: 'bold',
	},
});

function formatDate(date: string | Date | null | undefined): string {
	if (!date) return '–';
	return moment(date).format('HH:mm D/MM/YY');
}

function getGraderName(grader: any): string {
	if (!grader) return '–';
	return `${grader.firstName || grader.first_name || ''} ${grader.lastName || grader.last_name || ''}`.trim();
}
