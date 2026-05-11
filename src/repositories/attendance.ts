import { post, get } from './authenticatedRepository';
import { Attendance } from '../models';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { MyAttendance, MyAttendanceSnakeCase } from '../models/StudentAttendance';

const domainUrl = 'api/semesters/attendance';
const MY_ATTENDANCES_URL = `${domainUrl}/my_attendances`;

async function submitAttendance(
    qrid: string,
    latitude?: number,
    longitude?: number,
): Promise<Attendance> {
    const body: Record<string, unknown> = { qrid };
    if (latitude !== undefined && longitude !== undefined) {
        body.latitude = latitude;
        body.longitude = longitude;
    }
    return await post(domainUrl, body) as Attendance;
}

async function getMyAttendances(semesterId: number): Promise<MyAttendance[]> {
    const attendances = await get(MY_ATTENDANCES_URL, [{ key: 'semester_id', value: semesterId }]) as MyAttendanceSnakeCase[];
    return convertSnakeToCamelCase(attendances) as MyAttendance[];
}

export default {
    submitAttendance,
    getMyAttendances,
};
