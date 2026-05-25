export type EntityType = 'department' | 'secretary';

export interface EligibleEntity {
  entity_type: EntityType;
  entity_id: number;
  name: string;
  parent_secretary_name?: string | null;
}

export interface OwnershipMemberInput {
  entity_type: EntityType;
  entity_id: number;
  is_editor: boolean;
}

export interface GroupMember {
  entity_type: EntityType;
  entity_id: number;
  name: string;
  is_editor: boolean;
  parent_secretary_name?: string | null;
}

export default interface FormOwnershipGroup {
  id: number;
  name: string;
  /** Annotated by the backend for authenticated admin users. Undefined for students/super-admin list. */
  is_editor?: boolean;
}

export interface FormOwnershipGroupDetail extends FormOwnershipGroup {
  members: GroupMember[];
}
