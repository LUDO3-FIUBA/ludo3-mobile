import { get } from './authenticatedRepository';

export interface TeacherProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  legajo: string;
  linkedin_url: string;
  github_url: string;
  profile_photo: string | null;
}

export async function fetchTeacherProfile(teacherUserId: number): Promise<TeacherProfile> {
  return await get(`api/teachers/${teacherUserId}/profile`) as TeacherProfile;
}

export default { fetchTeacherProfile };
