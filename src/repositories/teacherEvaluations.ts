import { CreatedEvaluation, CreatedEvaluationSnakeCase } from '../models/CreatedEvaluation';
import { TeacherEvaluation } from '../models/TeacherEvaluation';
import { TeacherSemester } from '../models/TeacherSemester';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { post } from './authenticatedRepository';
import { fetchPresentSemesterFromCommissionId } from './teacherSemesters';

const domainUrl = 'api/teacher/evaluations';

async function create(
  semester: TeacherSemester,
  evaluationName: string,
  startDate: Date,
  finishDate: Date,
  minimumPassingGrade: string,
  requiresQr: boolean,
  requiresIdentity: boolean,
): Promise<CreatedEvaluation> {
  const evaluationToBeCreated: CreatedEvaluationSnakeCase = {
    semester_id: semester.id,
    evaluation_name: evaluationName,
    is_graded: true,
    passing_grade: +minimumPassingGrade,
    start_date: startDate,
    end_date: finishDate,
    requires_qr: requiresQr,
    requires_identity: requiresIdentity
  }

  const response = await post(`${domainUrl}/add_evaluation`, evaluationToBeCreated)
  return convertSnakeToCamelCase(response) as CreatedEvaluation
}

export async function fetchPresentSemesterEvaluations(commissionId: number): Promise<TeacherEvaluation[]> {
  const presentSemester: TeacherSemester = await fetchPresentSemesterFromCommissionId(commissionId) as TeacherSemester;
  return presentSemester.evaluations
}

async function addSubmissionToEvaluation(evaluationId: number, studentId: number) {
  const studentToAdd = {
    evaluation: evaluationId,
    student: studentId,
    grade: null,
  }

  const data: any = await post(`${domainUrl}/submissions/add_evaluation_submission`, studentToAdd);
  return data;
}

async function notifyStudents(evaluationId: number): Promise<void> {
  await post(`${domainUrl}/${evaluationId}/notify_grades`, {})
  return;
}

export default { create, addSubmissionToEvaluation, fetchPresentSemesterEvaluations, notifyStudents }
