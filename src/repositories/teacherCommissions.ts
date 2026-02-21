import { TeacherCommission } from '../models/TeacherCommission';
import { TeacherCommissionSnakeCase } from '../models/TeacherCommission';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { get, put } from './authenticatedRepository';

const domainUrl = 'api/teacher/commissions';

export async function fetchAll(): Promise<TeacherCommission[]> {
  const commissionsData: TeacherCommissionSnakeCase = await get(`${domainUrl}/my_commissions`) as TeacherCommissionSnakeCase

  const parsedCommissions: TeacherCommission[] = convertSnakeToCamelCase(commissionsData) as TeacherCommission[];

  return parsedCommissions;
}

export async function modifyChiefTeacherWeight(commissionId: number, graderWeight: number) {
  const body = {
    id: commissionId,
    chief_teacher_grader_weight: graderWeight,
  }
  const result = await put(`${domainUrl}/chief_teacher_grader_weight`, body) as TeacherCommissionSnakeCase
  return convertSnakeToCamelCase(result) as TeacherCommission;
}

export default { fetchAll, modifyChiefTeacherWeight };
