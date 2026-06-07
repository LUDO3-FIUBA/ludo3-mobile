import { OwnershipGroupMembership } from './Department';

export default interface Secretary {
  id: number;
  name: string;
  parentSecretary: number | null;
  location: string;
  schedule: string;
  contactInfo: string;
  subsecretaries: Secretary[];
  ownershipGroups: OwnershipGroupMembership[];
  createdAt: string;
  updatedAt: string;
}
