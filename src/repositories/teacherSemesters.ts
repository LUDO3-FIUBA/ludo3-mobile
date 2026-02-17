import moment from 'moment';
import { TeacherSemester, TeacherSemesterSnakeCase } from '../models/TeacherSemester';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { deleteMethod, get, post, put } from './authenticatedRepository';
import { ClassAttendanceSnakeCase } from '../models/ClassAttendance';
import { AddedStudentToSemester } from '../models/AddedStudentToSemester';
import { UpdateSemesterDetails, UpdateSemesterDetailsSnakeCase } from '../models/UpdateSemesterDetails';

const domainUrl = 'api/semesters';
const COMMISION_PRESENT_SEMESTER = `${domainUrl}/commission_present_semester`

const BASE_TEACHER_SEMESTER = `api/teacher/semesters`
const ATTENDANCES = `${BASE_TEACHER_SEMESTER}/attendance`

interface SemesterCreationData {
  commission: number;
  year_moment: string;
  start_date: string;
  classes_amount: number | null;
  minimum_attendance: number | null;
}

export async function fetchPresentSemesterFromCommissionId(commissionId: number): Promise<TeacherSemester> {
  const presentSemester: TeacherSemesterSnakeCase = await get(COMMISION_PRESENT_SEMESTER, [{ key: 'commission_id', value: commissionId }]) as TeacherSemesterSnakeCase;
  return convertSnakeToCamelCase(presentSemester)
}

export async function createSemester(commissionId: number, yearMoment: string, startDate: Date, classesAmount: number | null, minimumAttendance: number | null) {
  const formattedDate = moment(startDate).toISOString(true)
  console.log("Formatted date", formattedDate);

  const body: SemesterCreationData = {
    commission: commissionId,
    year_moment: yearMoment,
    start_date: formattedDate,
    classes_amount: classesAmount,
    minimum_attendance: minimumAttendance
  }
  const createdSemester: TeacherSemesterSnakeCase = await post(BASE_TEACHER_SEMESTER, body) as TeacherSemesterSnakeCase;
  return convertSnakeToCamelCase(createdSemester)
}

export async function getSemesterAttendances(semesterId: number) {
  const attendancesData = await get(ATTENDANCES, [{ key: 'semester_id', value: semesterId }]) as ClassAttendanceSnakeCase
  return convertSnakeToCamelCase(attendancesData)
}

export async function addStudentToSemester(studentId: number, semesterId: number) {
  const bodyToSend = {
    student: studentId,
    semester: semesterId
  }
  console.log("About to add student to semester", bodyToSend);

  const addedStudent = await post(`api/teacher/commission_inscription/add_student`, bodyToSend) as AddedStudentToSemester
  return convertSnakeToCamelCase(addedStudent)
}

export async function updatedPresentStateToStudent(studentId: number, qrId: string) {
  const bodyToSend = {
    student: studentId,
    qrid: qrId
  }
  console.log("About to update present state to student", bodyToSend);
  const updatedStudent = await post(`${ATTENDANCES}/student`, bodyToSend)
  return convertSnakeToCamelCase(updatedStudent)
}

export async function removePresentStateFromStudent(studentId: number, qrId: string) {
  const bodyToSend = {
    student: studentId,
    qrid: qrId
  }
  console.log("About to remove present state from student", bodyToSend);
  const updatedStudent = await deleteMethod(`${ATTENDANCES}/student`, bodyToSend)
  return convertSnakeToCamelCase(updatedStudent)
}

export async function updateSemesterDetails(commissionId: number, yearMoment: string, startDate: string, amountOfClasses: number, minimum_attendance: number): Promise<UpdateSemesterDetails> {
  const body: SemesterCreationData = {
    commission: commissionId,
    year_moment: yearMoment,
    start_date: startDate,
    classes_amount: amountOfClasses,
    minimum_attendance: minimum_attendance
  }
  const updatedSemester: UpdateSemesterDetailsSnakeCase = await put(`api/teacher/semesters/update_semester`, body) as UpdateSemesterDetailsSnakeCase
  return convertSnakeToCamelCase(updatedSemester)
}

export default {
  fetchPresentSemesterFromCommissionId,
  createSemester,
  getSemesterAttendances,
  addStudentToSemester,
  updatedPresentStateToStudent,
  updateSemesterDetails,
  removePresentStateFromStudent
};
