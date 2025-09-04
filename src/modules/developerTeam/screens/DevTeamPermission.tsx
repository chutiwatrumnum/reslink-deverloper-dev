// src/modules/developerTeam/screens/DevTeamPermission.tsx
import { useState, useEffect, useMemo } from "react";
// Components
import Header from "../../../components/templates/Header";
import { callConfirmModal } from "../../../components/common/Modal";
import SmallButton from "../../../components/common/SmallButton";
import {
  Tabs,
  Form,
  Row,
  Col,
  Card,
  Button,
  Checkbox,
  Spin,
  Alert,
} from "antd";
// CSS
import "../styles/developerTeam.css";
// API Hooks
import { getDeveloperTeamPermissionsQuery } from "../../../utils/queriesGroup/developerTeamPermissionQueries";
import { useUpdateDeveloperTeamPermissionsMutation } from "../../../utils/mutationsGroup/developerTeamPermissionMutations";
// Types
import type { TabsProps, CheckboxProps, CheckboxChangeEvent } from "antd";
import type {
  PermissionItem,
  RolePermissions,
  UpdatePermissionPayload,
} from "../../../utils/queriesGroup/developerTeamPermissionQueries";

interface PermissionState {
  [roleCode: string]: {
    [nameCode: string]: {
      id: number;
      allowAdd: boolean;
      allowView: boolean;
      allowDelete: boolean;
      allowEdit: boolean;
      lock?: boolean;
    };
  };
}

// Permission name mapping for display
const PERMISSION_DISPLAY_NAMES: Record<string, string> = {
  dev_team_management: "Developer Team Management",
  users: "User Management",
  project_management: "Project Management",
  announcements: "Announcements",
  contact_list: "Contact List",
  fixing_report: "Fixing Report",
  live_chat: "Live Chat",
  document_form: "Document Form",
  home_automation: "Home Automation",
  maintenance_guide: "Maintenance Guide",
  events: "Events",
  left_home_with_guard: "Left Home with Guard",
  news_and_announcement: "News and Announcement",
};

const DevTeamPermission = () => {
  const [form] = Form.useForm();
  const [permissionsState, setPermissionsState] = useState<PermissionState>({});
  const [activeRole, setActiveRole] = useState<string>("developer_admin");

  // API Hooks
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = getDeveloperTeamPermissionsQuery();

  const updatePermissionsMutation = useUpdateDeveloperTeamPermissionsMutation();

  const checkBoxOptions: string[] = [
    "allowView",
    "allowEdit",
    "allowAdd",
    "allowDelete",
  ];
  const checkBoxLabels: Record<string, string> = {
    allowView: "View",
    allowEdit: "Edit",
    allowAdd: "Add",
    allowDelete: "Delete",
  };

  const CheckboxGroup = Checkbox.Group;

  // Initialize permissions state from API data
  useEffect(() => {
    if (permissionsData?.result?.data) {
      const newState: PermissionState = {};

      permissionsData.result.data.forEach((roleData: RolePermissions) => {
        newState[roleData.roleManageCode] = {};

        roleData.permissions.forEach((permission: PermissionItem) => {
          newState[roleData.roleManageCode][permission.nameCode] = {
            id: permission.id,
            allowAdd: permission.allowAdd,
            allowView: permission.allowView,
            allowDelete: permission.allowDelete,
            allowEdit: permission.allowEdit,
            lock: permission.lock || false,
          };
        });
      });

      console.log("Initialized permissions state:", newState);
      setPermissionsState(newState);
    }
  }, [permissionsData]);

  // Get available roles from API data
  const availableRoles = useMemo(() => {
    if (!permissionsData?.result?.data) return [];

    return permissionsData.result.data.map((roleData: RolePermissions) => ({
      code: roleData.roleManageCode,
      label: roleData.roleManageCode
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
  }, [permissionsData]);

  // Get permissions for active role
  const currentRolePermissions = useMemo(() => {
    return permissionsState[activeRole] || {};
  }, [permissionsState, activeRole]);

  // Get unique permission codes for the current role
  const permissionCodes = useMemo(() => {
    return Object.keys(currentRolePermissions);
  }, [currentRolePermissions]);

  const handleCheckboxChange = (nameCode: string, checkedValues: string[]) => {
    setPermissionsState((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [nameCode]: {
          ...prev[activeRole][nameCode],
          allowAdd: checkedValues.includes("allowAdd"),
          allowView: checkedValues.includes("allowView"),
          allowDelete: checkedValues.includes("allowDelete"),
          allowEdit: checkedValues.includes("allowEdit"),
        },
      },
    }));

    console.log(`Permission ${nameCode} updated:`, checkedValues);
  };

  const onCheckAllChange =
    (nameCode: string): CheckboxProps["onChange"] =>
    (e: CheckboxChangeEvent) => {
      const allChecked = e.target.checked;
      const newValues = allChecked ? checkBoxOptions : [];

      setPermissionsState((prev) => ({
        ...prev,
        [activeRole]: {
          ...prev[activeRole],
          [nameCode]: {
            ...prev[activeRole][nameCode],
            allowAdd: allChecked,
            allowView: allChecked,
            allowDelete: allChecked,
            allowEdit: allChecked,
          },
        },
      }));
    };

  const isAllChecked = (nameCode: string) => {
    const permission = currentRolePermissions[nameCode];
    if (!permission) return false;

    return checkBoxOptions.every(
      (option) => permission[option as keyof typeof permission]
    );
  };

  const getCheckedValues = (nameCode: string): string[] => {
    const permission = currentRolePermissions[nameCode];
    if (!permission) return [];

    return checkBoxOptions.filter(
      (option) => permission[option as keyof typeof permission]
    );
  };

  const onReset = () => {
    const currentRoleName =
      availableRoles.find((role) => role.code === activeRole)?.label ||
      activeRole;

    callConfirmModal({
      title: "Reset permissions?",
      message: `Are you sure you want to clear all permissions for "${currentRoleName}"? `,
      okMessage: "Yes, Reset",
      cancelMessage: "Cancel",
     
      onOk: () => {
        // Clear all permissions for the current active role
        setPermissionsState((prev) => {
          const newState = { ...prev };
          if (newState[activeRole]) {
            const clearedPermissions = { ...newState[activeRole] };

            // Set all permission flags to false while keeping id and lock status
            Object.keys(clearedPermissions).forEach((nameCode) => {
              clearedPermissions[nameCode] = {
                ...clearedPermissions[nameCode],
                allowAdd: false,
                allowView: false,
                allowDelete: false,
                allowEdit: false,
              };
            });

            newState[activeRole] = clearedPermissions;
          }

          return newState;
        });

        // Reset form fields
        form.resetFields();

        console.log(`All permissions cleared for role: ${activeRole}`);
      },
    });
  };

  const onFinish = async () => {
    callConfirmModal({
      title: "Update permissions?",
      message: "Do you want to update permissions based on this information?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        try {
          // Prepare payload for API
          const payload: UpdatePermissionPayload[] = [];

          Object.entries(currentRolePermissions).forEach(
            ([nameCode, permission]) => {
              payload.push({
                id: permission.id,
                allowAdd: permission.allowAdd,
                allowView: permission.allowView,
                allowDelete: permission.allowDelete,
                allowEdit: permission.allowEdit,
              });
            }
          );

          console.log("Submitting permission updates:", payload);

          await updatePermissionsMutation.mutateAsync(payload);
        } catch (error) {
          console.error("Failed to update permissions:", error);
        }
      },
    });
  };

  const onTabsChange = (key: string) => {
    setActiveRole(key);
  };

  // Generate tabs from available roles
  const items: TabsProps["items"] = availableRoles.map((role) => ({
    key: role.code,
    label: role.label,
    children: (
      <Form
        form={form}
        name="permissionForm"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          console.log("Form validation failed");
        }}>
        <Row gutter={10}>
          {permissionCodes.map((nameCode, index) => {
            const permission = currentRolePermissions[nameCode];
            const isLocked = permission?.lock || false;
            const displayName =
              PERMISSION_DISPLAY_NAMES[nameCode] ||
              nameCode
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());

            return (
              <Col span={8} key={nameCode} style={{ marginBottom: 16 }}>
                <Card
                  variant="borderless"
                  hoverable={!isLocked}
                  size="small"
                  style={{
                    opacity: isLocked ? 0.6 : 1,
                    cursor: isLocked ? "not-allowed" : "default",
                  }}>
                  <Form.Item
                    label={displayName}
                    name={nameCode}
                    className="custom-form-label">
                    <Checkbox
                      onChange={onCheckAllChange(nameCode)}
                      checked={isAllChecked(nameCode)}
                      disabled={isLocked}>
                      Select All
                    </Checkbox>
                    <CheckboxGroup
                      options={checkBoxOptions.map((option) => ({
                        label: checkBoxLabels[option],
                        value: option,
                        disabled: isLocked,
                      }))}
                      value={getCheckedValues(nameCode)}
                      onChange={(checkedValues) =>
                        handleCheckboxChange(
                          nameCode,
                          checkedValues as string[]
                        )
                      }
                      className="checkboxGroup"
                    />
                  </Form.Item>
                </Card>
              </Col>
            );
          })}
        </Row>

        <Row style={{ marginTop: 24 }}>
          <Col
            span={24}
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}>
            <Form.Item>
              <Button
                type="text"
                size="large"
                onClick={onReset}
                className="reset-button"
                loading={permissionsLoading}>
                Reset
              </Button>
              <SmallButton
                message={
                  updatePermissionsMutation.isPending ? "Saving..." : "Save"
                }
                form={form}
                className="save-button"
                disabled={
                  updatePermissionsMutation.isPending || permissionsLoading
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    ),
  }));

  if (permissionsError) {
    return (
      <>
        <Header title="Developer team permission" />
        <Alert
          message="Error loading permissions"
          description={
            permissionsError.message || "Failed to load permission data"
          }
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => refetchPermissions()}>
              Retry
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <Header title="Developer team permission" />
      <Card
        title="Permissions"
        className="custom-card-title"
        variant="outlined">
        {permissionsLoading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading permissions...</div>
          </div>
        ) : (
          <Tabs
            tabBarGutter={2}
            animated={true}
            tabPosition="left"
            items={items}
            className="custom-tabs"
            activeKey={activeRole}
            onChange={onTabsChange}
          />
        )}
      </Card>
    </>
  );
};

export default DevTeamPermission;
