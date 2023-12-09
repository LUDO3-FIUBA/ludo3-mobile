import { Commission } from ".";

export interface TeacherTuple {
  commission: Commission;
  teacher:    Teacher;
  role:       string;
}

export interface Teacher {
  first_name: string;
  last_name:  string;
  dni:        string;
  email:      string;
  legajo:     string;
}
