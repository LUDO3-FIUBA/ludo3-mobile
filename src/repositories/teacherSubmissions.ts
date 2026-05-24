import { AssignGrader, AssignGraderCamelCase } from '../models/AssignGrader';
import { GradeChange, GradeChangeSnakeCase } from '../models/GradeChange';
import { Submission, SubmissionSnakeCase } from '../models/Submission';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { get, post, put } from './authenticatedRepository';

const domainUrl = 'api/teacher/evaluations/submissions';
const GET_SUBMISSIONS_ENDPOINT = `${domainUrl}/get_submissions`;
const GRADE_SUBMISSION_ENDPOINT = `${domainUrl}/grade`;
const STATUS_SUBMISSION_ENDPOINT = `${domainUrl}/grade`;
const ASSIGN_GRADER_TO_SUBMISSION_ENDPOINT = `${domainUrl}/assign_grader`
const AUTO_ASSIGN_GRADERS_ENDPOINT = `${domainUrl}/auto_assign_graders`

async function getSubmissions(evaluationId: number): Promise<Submission[]> {
  const submissionsSnakeCase: SubmissionSnakeCase[] = await get(`${GET_SUBMISSIONS_ENDPOINT}`, [{key: 'evaluation', value: evaluationId}]) as SubmissionSnakeCase[];

  const submissions: Submission[] = convertSnakeToCamelCase(submissionsSnakeCase) as Submission[];
  return submissions;
}

async function updateSubmission(
  studentId: number,
  evaluationId: number,
  payload: { grade?: number; submission_status?: 'APROBADO' | 'DESAPROBADO'; feedbackText?: string | null },
): Promise<GradeChange> {
  const snakeCaseBody: Record<string, number | string | null> = {
    student: studentId,
    evaluation: evaluationId,
  };

  if (payload.grade !== undefined) {
    snakeCaseBody.grade = payload.grade;
  }

  if (payload.submission_status !== undefined) {
    snakeCaseBody.submission_status = payload.submission_status;
  }

  if (payload.feedbackText !== undefined) {
    snakeCaseBody.feedback_text = payload.feedbackText;
  }

  console.log("Request body for updating submission:", snakeCaseBody);
  const gradeChange: GradeChangeSnakeCase = await put(`${GRADE_SUBMISSION_ENDPOINT}`, snakeCaseBody) as GradeChangeSnakeCase;
  return convertSnakeToCamelCase(gradeChange) as GradeChange;
}

async function gradeSubmission(
  studentId: number,
  evaluationId: number,
  grade: number,
): Promise<GradeChange> {
  return updateSubmission(studentId, evaluationId, { grade });
}

async function setSubmissionStatus(
  studentId: number,
  evaluationId: number,
  submission_status: 'APROBADO' | 'DESAPROBADO',
): Promise<GradeChange> {
  return updateSubmission(studentId, evaluationId, { submission_status });
}

async function updateFeedback(
  studentId: number,
  evaluationId: number,
  feedbackText: string | null,
): Promise<GradeChange> {
  return updateSubmission(studentId, evaluationId, { feedbackText });
}

async function assignGraderToSubmission(studentId: number, evaluationId: number, graderTeacher: number) {
  const snakeCaseBody = {
    "student": studentId,
    "evaluation": evaluationId,
    "grader_teacher": graderTeacher
  }

  const assignedGraderResponse: AssignGraderCamelCase = await put(ASSIGN_GRADER_TO_SUBMISSION_ENDPOINT, snakeCaseBody) as AssignGraderCamelCase
  console.log("Response:", assignedGraderResponse);

  return convertSnakeToCamelCase(assignedGraderResponse) as AssignGrader
}

async function autoAssignGraders(evaluationId: number) {
  const snakeCaseBody = {
    "evaluation": evaluationId,
  }

  const assignedGradersResponse: AssignGraderCamelCase[] = await put(AUTO_ASSIGN_GRADERS_ENDPOINT, snakeCaseBody) as AssignGraderCamelCase[]
  console.log("Response:", assignedGradersResponse);

  return convertSnakeToCamelCase(assignedGradersResponse) as AssignGrader[]
}

export default {
  getSubmissions,
  updateSubmission,
  gradeSubmission,
  setSubmissionStatus,
  updateFeedback,
  assignGraderToSubmission,
  autoAssignGraders,
};
