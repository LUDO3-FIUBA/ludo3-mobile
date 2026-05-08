import { post, get } from './authenticatedRepository';
import { Attendance } from '../models';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { MyAttendance, MyAttendanceSnakeCase } from '../models/StudentAttendance';

const domainUrl = 'api/semesters/attendance';
const MY_ATTENDANCES_URL = `${domainUrl}/my_attendances`;
const LOCATION_URL = `${domainUrl}/location`;

async function submitAttendance(qrid: string): Promise<Attendance> {
    return await post(`${domainUrl}`, { qrid: qrid }) as Attendance;
}

async function submitLocationAttendance(
    sessionId: string,
    latitude: number,
    longitude: number,
): Promise<Attendance> {
    return await post(LOCATION_URL, { session_id: sessionId, latitude, longitude }) as Attendance;
}

async function getMyAttendances(semesterId: number): Promise<MyAttendance[]> {
    const attendances = await get(MY_ATTENDANCES_URL, [{ key: 'semester_id', value: semesterId }]) as MyAttendanceSnakeCase[];
    return convertSnakeToCamelCase(attendances) as MyAttendance[];
}

export default {
    submitAttendance,
    submitLocationAttendance,
    getMyAttendances,
};
