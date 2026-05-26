export interface OwnershipGroupMembership {
  groupId: number;
  groupName: string;
  isEditor: boolean;
}

export default interface Department {
  id: number;
  name: string;
  location: string;
  schedule: string;
  contactInfo: string;
  procedures: string;
  ownershipGroups: OwnershipGroupMembership[];
  createdAt: string;
  updatedAt: string;
}
