import { useState, useEffect } from "react";
// Components
import FormModal from "../../../components/common/FormModal";
import { callConfirmModal } from "../../../components/common/Modal";
import SmallButton from "../../../components/common/SmallButton";
import { Form, Input, Row, Col, Select, Spin } from "antd";
// CSS
import "../styles/developerTeam.css";
// Types
import type { DeveloperTeamAddNew } from "../../../stores/interfaces/DeveloperTeam";

type TeamInvitationCreateModalType = {
  isCreateModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  onRefresh: () => void;
  roleData?: any[];
  roleLoading?: boolean;
  createMutation?: any;
};

const TeamInvitationCreateModal = ({
  isCreateModalOpen,
  onOk,
  onCancel,
  onRefresh,
  roleData = [],
  roleLoading = false,
  createMutation,
}: TeamInvitationCreateModalType) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const onFinish = async (values: DeveloperTeamAddNew) => {
    console.log("Form values:", values);

    callConfirmModal({
      title: "Send invitation?",
      message: "Are you sure you want to send this invitation?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        if (createMutation) {
          // แปลงข้อมูลให้ตรงกับ API format
          const submitData = {
            roleId: Number(values.roleId), // แปลงเป็น number
            firstName: values.firstName,
            middleName: values.middleName || "",
            lastName: values.lastName,
            contact: values.contact,
            email: values.email,
          };

          console.log("Submitting create invitation with data:", submitData);

          createMutation.mutate(submitData, {
            onSuccess: () => {
              console.log("Create invitation successful");
              form.resetFields();
              onOk();
              onRefresh();
            },
            onError: (error: any) => {
              console.error("Create invitation failed:", error);
              // Error message จะแสดงจาก mutation แล้ว
            },
          });
        } else {
          // Fallback: ใช้วิธีเก่า
          console.log("Creating invitation with values:", values);
          onOk();
          onRefresh();
        }
      },
    });
  };

  const onModalClose = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    setOpen(isCreateModalOpen);
  }, [isCreateModalOpen]);

  const isSubmitting = createMutation?.isPending || false;

  const ModalContent = () => {
    return (
      <Form
        form={form}
        name="developerInvitationCreateModal"
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
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <SmallButton
            className="saveButton"
            message={isSubmitting ? "Sending..." : "Send"}
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
      title="New invitations"
      content={<ModalContent />}
      onOk={onOk}
      onCancel={onModalClose}
      className="developerInvitationFormModal"
      destroyOnClose={true}
      maskClosable={!isSubmitting}
    />
  );
};

export default TeamInvitationCreateModal;
