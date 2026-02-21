import { QRAttendance, QRAttendanceSnakeCase } from '../models/QRAttendance';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { post } from './authenticatedRepository';

const domainUrl = 'api/teacher/semesters/attendance/latest_qr';

export async function generateAttendanceQR(semesterId: number): Promise<QRAttendance> {
  const qrAttendanceSnakeCase: QRAttendanceSnakeCase = await post(`${domainUrl}`, {'semester': semesterId}) as QRAttendanceSnakeCase;
  return convertSnakeToCamelCase(qrAttendanceSnakeCase)
}

export default {generateAttendanceQR};
