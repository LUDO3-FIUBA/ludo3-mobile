import { post } from './authenticatedRepository';
import { Attendance } from '../models';

const domainUrl = 'api/semesters/attendance';

async function submitAttendance(qrid: string): Promise<Attendance> {
    // TODO: error handling like in finalExamsRepository.submitExam
    return await post(`${domainUrl}`, { qrid: qrid }) as Attendance
}

export default {
    submitAttendance
};
