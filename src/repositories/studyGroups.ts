import { get, post, deleteMethod } from './authenticatedRepository';

export interface GroupMember {
  padron: string;
  full_name: string;
  email: string;
  status: 'P' | 'A';
}

export interface StudyGroup {
  id: number;
  name: string;
  created_at: string;
  is_creator: boolean;
  my_status: 'P' | 'A';
  member_count: number;
  members: GroupMember[];
}

export interface GroupBlock {
  padron: string;
  full_name: string;
  subject_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface GapMember {
  padron: string;
  full_name: string;
}

export interface RankedGap {
  day_of_week: number;
  start_time: string;
  end_time: string;
  free_count: number;
  total_count: number;
  free_members: GapMember[];
  busy_members: GapMember[];
  type: 'all' | 'majority' | 'minority';
}

export interface GroupSchedule {
  group_id: number;
  group_name: string;
  members: Array<{ padron: string; full_name: string; is_creator: boolean; block_count: number }>;
  blocks: GroupBlock[];
  free_gaps: RankedGap[];
}

async function fetchGroups(): Promise<StudyGroup[]> {
  const r = await get('api/study-groups');
  return Array.isArray(r) ? r as StudyGroup[] : [];
}

async function createGroup(name: string): Promise<StudyGroup> {
  return post('api/study-groups', { name }) as Promise<StudyGroup>;
}

async function inviteMember(groupId: number, padron: string): Promise<{ id: number; status: string }> {
  return post(`api/study-groups/${groupId}/invite`, { padron }) as Promise<{ id: number; status: string }>;
}

async function acceptInvitation(groupId: number): Promise<{ id: number; status: string }> {
  return post(`api/study-groups/${groupId}/accept`, {}) as Promise<{ id: number; status: string }>;
}

async function leaveGroup(groupId: number): Promise<void> {
  await deleteMethod(`api/study-groups/${groupId}/leave`, {});
}

async function fetchGroupSchedule(groupId: number): Promise<GroupSchedule> {
  return get(`api/study-groups/${groupId}/schedule`) as Promise<GroupSchedule>;
}

export default { fetchGroups, createGroup, inviteMember, acceptInvitation, leaveGroup, fetchGroupSchedule };
