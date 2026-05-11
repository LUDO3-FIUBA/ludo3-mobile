import { get, postWithStatus } from './authenticatedRepository';
import { Attendance } from '../models';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { MyAttendance, MyAttendanceSnakeCase } from '../models/StudentAttendance';

const domainUrl = 'api/semesters/attendance';
const MY_ATTENDANCES_URL = `${domainUrl}/my_attendances`;

export interface AttendanceResult {
    attendance: Attendance;
    isNew: boolean;
}

async function submitAttendance(
    qrid: string,
    latitude?: number,
    longitude?: number,
): Promise<AttendanceResult> {
    const body: Record<string, unknown> = { qrid };
    if (latitude !== undefined && longitude !== undefined) {
        body.latitude = latitude;
        body.longitude = longitude;
    }
    const { data, status } = await postWithStatus(domainUrl, body) as { data: Attendance; status: number };
    return { attendance: data, isNew: status === 201 };
}

async function getMyAttendances(semesterId: number): Promise<MyAttendance[]> {
    const attendances = await get(MY_ATTENDANCES_URL, [{ key: 'semester_id', value: semesterId }]) as MyAttendanceSnakeCase[];
    return convertSnakeToCamelCase(attendances) as MyAttendance[];
}

export default {
    submitAttendance,
    getMyAttendances,
};
