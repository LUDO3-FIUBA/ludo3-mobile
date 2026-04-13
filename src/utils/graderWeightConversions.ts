import { TeacherTuple } from '../models/TeacherTuple';

export function mapWeightToPercentage(teacherWeight: number, staffTeachers: TeacherTuple[], chiefTeacherWeight: number): string {
  if (!staffTeachers) {
    return '';
  }

  const totalWeight = getTotalWeight(staffTeachers, chiefTeacherWeight);
  const percentage = (teacherWeight / totalWeight) * 100;
  return percentage.toFixed(2);
}

export function mapPercentageToWeight(teacherDNI: string, percentage: number, staffTeachers: TeacherTuple[], chiefTeacherWeight: number): number {
  if (!staffTeachers) {
    return NaN;
  }

  const staffTeachersWithoutCurrent = staffTeachers.filter((teacherRole) => teacherRole.teacher.dni !== teacherDNI);
  const totalWeightWithoutCurrent = getTotalWeight(staffTeachersWithoutCurrent, chiefTeacherWeight);
  return percentage * totalWeightWithoutCurrent / (1 - percentage);
};

export function mapChiefPercentageToWeight(percentage: number, staffTeachers: TeacherTuple[]): number {
  if (!staffTeachers) {
    return NaN;
  }

  const totalWeightWithoutChief = getTotalWeight(staffTeachers, 0); // exclude chief teacher from calculation
  return percentage * totalWeightWithoutChief / (1 - percentage);
};

function getTotalWeight(staffTeachers: TeacherTuple[], chiefTeacherWeight: number): number {
  return staffTeachers.reduce((sum, teacher) => sum + teacher.graderWeight, 0) + chiefTeacherWeight;
}
