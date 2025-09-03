import { useState, useEffect } from "react";
// Components
import FormModal from "../../../components/common/FormModal";
import { callConfirmModal } from "../../../components/common/Modal";
import SmallButton from "../../../components/common/SmallButton";
import { Form, Input, Row, Col, Select, Spin } from "antd";
// CSS
import "../styles/developerTeam.css";
// API Hooks
import { useEditDeveloperTeamMutation } from "../../../utils/mutationsGroup/developerTeamMutations";
import { getDeveloperTeamRoleQuery } from "../../../utils/queriesGroup/developerTeamQueries";
// Types
import type {
  DeveloperTeamType,
  DeveloperTeamAddNew,
} from "../../../stores/interfaces/DeveloperTeam";

type DevTeamListEditModalType = {
  isEditModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  onRefresh: () => void;
  selectedRecord?: DeveloperTeamType | null;
};

const DevTeamListEditModal = ({
  isEditModalOpen,
  onOk,
  onCancel,
  onRefresh,
  selectedRecord,
}: DevTeamListEditModalType) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  // API Hooks
  const { data: roleData, isLoading: roleLoading } =
    getDeveloperTeamRoleQuery();
  const editMutation = useEditDeveloperTeamMutation();

  const onFinish = async (values: DeveloperTeamAddNew) => {
    console.log("Form values:", values);

    if (!selectedRecord?.id && !selectedRecord?.userId) {
      console.error("No ID found for editing");
      return;
    }

    callConfirmModal({
      title: "Edit team member?",
      message: "Are you sure you want to edit this team member?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        const userId = selectedRecord.id || selectedRecord.userId!;
        const payload = {
          givenName: values.firstName,
          familyName: values.lastName,
          middleName: values.middleName || "",
          contact: values.contact,
          roleId: Number(values.roleId), // แปลงเป็น number
        };

        console.log(
          "Submitting edit with userId:",
          userId,
          "and payload:",
          payload
        );

        editMutation.mutate(
          { userId, payload, isListEdit: true },
          {
            onSuccess: () => {
              console.log("Edit team member successful");
              form.resetFields();
              onOk();
              onRefresh();
            },
            onError: (error: any) => {
              console.error("Edit team member failed:", error);
              // Error message จะแสดงจาก mutation แล้ว
            },
          }
        );
      },
    });
  };

  const onModalClose = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    setOpen(isEditModalOpen);
  }, [isEditModalOpen]);

  // Set form values when selectedRecord changes
  useEffect(() => {
    if (isEditModalOpen && selectedRecord) {
      const formValues = {
        firstName: selectedRecord.firstName || selectedRecord.givenName || "",
        middleName: selectedRecord.middleName || "",
        lastName: selectedRecord.lastName || selectedRecord.familyName || "",
        contact: selectedRecord.contact || selectedRecord.phone || "",
        email: selectedRecord.email || "",
        roleId:
          selectedRecord.roleId ||
          (typeof selectedRecord.role === "object"
            ? selectedRecord.role.id
            : null),
      };

      console.log("Setting form values for team member:", formValues);
      form.setFieldsValue(formValues);
    }

    return () => {
      if (!isEditModalOpen) {
        form.resetFields();
      }
    };
  }, [isEditModalOpen, selectedRecord, form]);

  const isSubmitting = editMutation.isPending;

  const ModalContent = () => {
    return (
      <Form
        form={form}
        name="developerTeamListEditModal"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}
      >
        <Row gutter={20} style={{ marginTop: "10px" }}>
          <Col span={12}>
            <Form.Item<DeveloperTeamAddNew>
              label="First name"
              name="firstName"
              rules={[
                {
                  required: true,
                  message: "Please input first name!",
                },
                {
                  max: 120,
                  message: "First name must be less than 120 characters",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Please input first name"
                maxLength={120}
                showCount
              />
            </Form.Item>

            <Form.Item<DeveloperTeamAddNew>
              label="Middle name"
              name="middleName"
              rules={[
                {
                  max: 120,
                  message: "Middle name must be less than 120 characters",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Please input middle name"
                maxLength={120}
                showCount
              />
            </Form.Item>

            <Form.Item<DeveloperTeamAddNew>
              label="Last name"
              name="lastName"
              rules={[
                {
                  required: true,
                  message: "Please input last name!",
                },
                {
                  max: 120,
                  message: "Last name must be less than 120 characters",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Please input surname"
                maxLength={120}
                showCount
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item<DeveloperTeamAddNew>
              label="Tel"
              name="contact"
              rules={[
                {
                  required: true,
                  message: "Please input tel!",
                },
                {
                  pattern: /^[0-9]*$/,
                  message: "Contact no. is not valid!",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Please input tel"
                maxLength={10}
                showCount
              />
            </Form.Item>

            <Form.Item<DeveloperTeamAddNew>
              label="Role"
              name="roleId"
              rules={[
                {
                  required: true,
                  message: "Please select role!",
                },
              ]}
            >
              <Select
                size="large"
                placeholder={
                  roleLoading ? "Loading roles..." : "Please select role"
                }
                loading={roleLoading}
                notFoundContent={
                  roleLoading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spin size="small" />
                      <div style={{ marginTop: "8px" }}>Loading...</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ marginBottom: "8px" }}>📭</div>
                      <div>No roles available</div>
                    </div>
                  )
                }
                fieldNames={{ label: "name", value: "id" }}
                options={roleData || []}
                showSearch
                filterOption={(input, option) =>
                  (option?.name ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item<DeveloperTeamAddNew>
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input email!",
                },
                {
                  type: "email",
                  message: "Please input a valid email!",
                },
                {
                  max: 120,
                  message: "Email must be less than 120 characters",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Please input email"
                maxLength={120}
                disabled={true} // Usually email is not editable
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <SmallButton
            className="saveButton"
            message={isSubmitting ? "Updating..." : "Update"}
            form={form}
            disabled={isSubmitting}
          />
        </Form.Item>
      </Form>
    );
  };

  return (
    <FormModal
      isOpen={open}
      title="Edit team member"
      content={<ModalContent />}
      onOk={onOk}
      onCancel={onModalClose}
      className="developerInvitationFormModal"
      destroyOnClose={true}
      maskClosable={!isSubmitting}
    />
  );
};

export default DevTeamListEditModal;
