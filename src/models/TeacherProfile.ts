export interface WorkExperience {
  id?: number;
  company: string;
  position: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

export interface TeacherProfile {
  university: string;
  degree: string;
  bio: string;
  currentPosition: string;
  yearsOfExperience?: number;
  certifications?: string;
  workExperience: WorkExperience[];
}
