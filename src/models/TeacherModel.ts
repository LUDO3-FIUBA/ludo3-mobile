export interface TeacherModel {
  id:         number;
  firstName:  string;
  lastName:   string;
  dni:        string;
  email:      string;
  legajo?:    string;
  padron?:    string;
  githubUrl?: string;
}

export interface TeacherModelSnakeCase {
  id:         number;
  first_name: string;
  last_name:  string;
  dni:        string;
  email:      string;
  legajo?:    string;
  padron?:    string;
  github_url?: string;
}
