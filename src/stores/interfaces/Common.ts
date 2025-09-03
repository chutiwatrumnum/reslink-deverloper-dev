export interface CommonType {
  masterData: any;
  accessibility: any;
  unitOptions: Array<{ label: string; value: number }>;
  unitFilter: any;
  permission?: PermissionType[];
}

export interface MenuItemAccessibilityType {
  available: boolean;
  allowAdd: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
} 

export interface MasterDataType {
  test: boolean;
}

export interface AccessibilityType {
  team_user_profile: MenuItemAccessibilityType;
  team_user_management: MenuItemAccessibilityType;
  team_facility_management: MenuItemAccessibilityType;
  team_announcement: MenuItemAccessibilityType;
  team_team_management: MenuItemAccessibilityType;
}
export interface MenuItemAccessibilityType {
  permissionCode: string;
  permissionName: string;
  allowAdd: boolean;
  allowView: boolean;
  allowDelete: boolean;
  allowEdit: boolean;
}

export interface PermissionType {
  permissionRoleManageCode: string;
  allowAdd: boolean;
  allowView: boolean;
  allowDelete: boolean;
  allowEdit: boolean;
  featuresName: string;
  permissionNameCode: string;
}

export type PermissionNameCode =
  | "users"
  | "team_management"
  | "room_management"
  | "profile"
  | "warranty_tracking"
  | "sos_security"
  | "chat"
  | "announcement"
  | "project_news"
  | "people_counting"
  | "parcels"
  | "news"
  | "my_pet"
  | "maintenance_guide"
  | "fixing_report_chat"
  | "fixing_report"
  | "facility"
  | "sos_security"
  | "events"
  | "document_home"
  | "contact_list"
  | "vms"
  | "permission"
  | "smart_home"
  | "my_home";
