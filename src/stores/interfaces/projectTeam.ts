export interface conditionPage {
  perPage: number;
  curPage: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  sortBy?: string;
  unitId?: string;
}

export interface ProjectTeamType {
  id: string;
  code: any;
  lastName: string;
  firstName: string;
  middleName: string;
  contact: string;
  email: string;
  expireDate: string;
  activate: boolean;
  activateBy: any;
  activateDate: any;
  failReason: any;
  createdAt: string;
  project: Project;
  role: Role;
  createdBy: CreatedBy;
  [k: string]: any;
}

export interface ProjectTeamListType {
  familyName: string;
  givenName: string;
  middleName?: string;
  nickName: string;
  email: string;
  birthDate: any;
  active: boolean;
  imageProfile: string;
  contact: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  project: Project;
  role: Role;
  createdByUser: CreatedByUser;
  userId: string;
}

export interface CreatedByUser {
  familyName: string;
  givenName: string;
  middleName: any;
}

export interface Project {
  stepSetup: string;
  name: string;
  lat: number;
  long: number;
}

export interface Role {
  name: string;
}

export interface CreatedBy {
  familyName: string;
  givenName: string;
}

// ===== ProjectTeam Types =====

export type ProjectTeamEditPayload = {
  givenName: string;
  familyName: string;
  middleName?: string;
  contact: string;
  roleId: string | number;
};

export type ProjectJuristicInvitationCreatePayload = {
  projectId: string;
  roleId: number | string;
  firstName: string;
  middleName?: string;
  lastName: string;
  contact: string;
  email: string | boolean;
};

export type ProjectJuristicInvitationUpdatePayload = {
  projectId: string;
  roleId: number | string;
  firstName: string;
  middleName?: string;
  lastName: string;
  contact: string;
};

export interface ProjectTeamInvitationsParams {
  activate: boolean;
  curPage: number;
  perPage: number;
  search?: string;
}

export interface OptionItem {
  id: string | number;
  name: string;
  value: string | number;
  label: string;
  // อนุญาต field อื่นๆ ติดมาด้วย
  [k: string]: any;
}

export interface ProjectTeamInvitationsResponse {
  rows?: ProjectTeamType[];
  total?: number;
  [k: string]: any;
}

export type PTMSortOrder = "asc" | "desc";

export type PTMSortByField =
  | "firstName"
  | "lastName"
  | "blockNo"
  | "unitNo"
  | "email"
  | "role"
  | "updatedAt"
  | "createdAt"
  | "rejectAt";

export interface ProjectTeamManagementListParams {
  curPage: number;
  perPage: number;
  search?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  projectId?: string | number;
  sort?: PTMSortOrder;
  sortBy?: PTMSortByField;
}

// ปล่อยกว้างไว้เพื่อให้เข้ากับรูปแบบ response ของ API จริง
export type ProjectTeamManagementListResponse = any;
