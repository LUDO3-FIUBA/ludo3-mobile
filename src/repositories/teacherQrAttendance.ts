import { AttendanceMode, Campus } from '../models/ClassAttendance';
import { QRAttendance, QRAttendanceSnakeCase } from '../models/QRAttendance';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { post } from './authenticatedRepository';

const domainUrl = 'api/teacher/semesters/attendance/latest_qr';

export async function generateAttendanceQR(
  semesterId: number,
  mode: AttendanceMode = 'qr',
  campus?: Campus,
): Promise<QRAttendance> {
  const payload: Record<string, unknown> = { semester: semesterId, mode };
  if (campus) payload.campus = campus;
  const qrAttendanceSnakeCase: QRAttendanceSnakeCase = await post(domainUrl, payload) as QRAttendanceSnakeCase;
  return convertSnakeToCamelCase(qrAttendanceSnakeCase);
}

export default { generateAttendanceQR };
