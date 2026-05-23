export default interface Secretary {
  id: number;
  name: string;
  parentSecretary: number | null;
  location: string;
  schedule: string;
  contactInfo: string;
  subsecretaries: Secretary[];
  createdAt: string;
  updatedAt: string;
}
