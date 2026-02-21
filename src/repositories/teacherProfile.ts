import { TeacherProfile } from '../models/TeacherProfile';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { get, post, put } from './authenticatedRepository';

const BASE_URL = 'api/teacher/profile';

function toInt(value: any): number | null {
  const n = parseInt(String(value), 10);
  return isNaN(n) ? null : n;
}

function toSnakeCase(profile: TeacherProfile): object {
  return {
    university: profile.university,
    degree: profile.degree,
    bio: profile.bio,
    current_position: profile.currentPosition,
    years_of_experience: profile.yearsOfExperience != null ? toInt(profile.yearsOfExperience) : null,
    certifications: profile.certifications ?? '',
    linkedin_url: profile.linkedinUrl ?? '',
    work_experience: profile.workExperience.map(item => ({
      company: item.company,
      position: item.position,
      start_year: toInt(item.startYear),
      end_year: item.endYear != null && item.endYear !== (undefined as any) ? toInt(item.endYear) : null,
      description: item.description ?? '',
    })),
  };
}

export async function fetchProfile(): Promise<TeacherProfile> {
  const data = await get(`${BASE_URL}/me`);
  return convertSnakeToCamelCase(data) as TeacherProfile;
}

export async function createProfile(profile: TeacherProfile): Promise<TeacherProfile> {
  const data = await post(`${BASE_URL}/create_profile`, toSnakeCase(profile));
  return convertSnakeToCamelCase(data) as TeacherProfile;
}

export async function updateProfile(profile: TeacherProfile): Promise<TeacherProfile> {
  const data = await put(`${BASE_URL}/update_profile`, toSnakeCase(profile));
  return convertSnakeToCamelCase(data) as TeacherProfile;
}

export default { fetchProfile, createProfile, updateProfile };
