import { useState, useEffect } from "react";

// APIs
import {
  useProjectTeamProjectQuery,
  useProjectTeamRoleQuery,
} from "../../../utils/queriesGroup/projectTeamQueries";
import { useEditProjectJuristicInvitationMutation } from "../../../utils/mutationsGroup/projectTeamMutations";

// Components
import FormModal from "../../../components/common/FormModal";
import { callConfirmModal } from "../../../components/common/Modal";
import SmallButton from "../../../components/common/SmallButton";
import { Form, Input, Row, Col, Select } from "antd";

// CSS
import "../style/projectTeam.css";

// Types
import type { ProjectTeamType } from "../../../stores/interfaces/projectTeam";

type InvitationUnverifiedEditModalType = {
  data?: ProjectTeamType;
  isEditUnverifiedModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  onRefresh: () => void;
};

const InvitationUnverifiedEditModal = ({
  data,
  isEditUnverifiedModalOpen,
  onOk,
  onCancel,
  onRefresh,
}: InvitationUnverifiedEditModalType) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  // APIs & Data
  const { data: listData, isLoading: isListLoading } =
    useProjectTeamProjectQuery();

  const { data: roleData, isLoading: isRoleLoading } =
    useProjectTeamRoleQuery();

  const editInvite = useEditProjectJuristicInvitationMutation();

  // Functions
  const onModalClose = () => {
    form.resetFields();
    onCancel();
  };

  const onFinish = async (value: any) => {
    callConfirmModal({
      title: "Edit the invitations?",
      message: "Are you sure you want to edit the invitation?",
      okMessage: "Save",
      cancelMessage: "Cancel",
      onOk: async () => {
        // console.log(value);
        editInvite
          .mutateAsync({ id: data?.id ?? "", payload: value })
          .then((res) => {
            console.log(res);
          });
        onOk();
        onRefresh();
      },
    });
  };

  useEffect(() => {
    setOpen(isEditUnverifiedModalOpen);
    if (data) {
      const roleId = roleData?.find(
        (x) =>
          `${x?.name ?? ""}`.trim().toLowerCase() ===
          `${data?.role?.name ?? ""}`.trim().toLowerCase()
      )?.id;

      const projectId = listData?.find(
        (x) =>
          `${x?.name ?? ""}`.trim().toLowerCase() ===
          `${data?.project?.name ?? ""}`.trim().toLowerCase()
      )?.id;

      form.setFieldsValue({
        firstName: data?.firstName,
        middleName: data?.middleName,
        lastName: data?.lastName,
        contact: data?.contact,
        roleId: roleId,
        projectId: projectId,
        email: data?.email,
      });
    }
  }, [isEditUnverifiedModalOpen]);

  const ModalContent = () => {
    return (
      <Form
        form={form}
        name="projectUnverifiedEditModal"
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
            <Form.Item
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
            <Form.Item
              label="Middle name"
              name="middleName"
              rules={[
                {
                  max: 120,
                  message: "First name must be less than 120 characters",
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
            <Form.Item
              label="Last name"
              name="lastName"
              rules={[
                {
                  required: true,
                  message: "Please input  surname!",
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
            <Form.Item
              label="Tel"
              name="contact"
              rules={[
                {
                  required: true,
                  message: "Please input tel",
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
            <Form.Item
              label="Role"
              name="roleId"
              rules={[{ required: true, message: "Please select role!" }]}
            >
              <Select
                size="large"
                loading={isRoleLoading}
                options={roleData}
                fieldNames={{ label: "name", value: "id" }}
                placeholder="Please select role"
              />
            </Form.Item>
            <Form.Item
              label="Project"
              name="projectId"
              rules={[{ required: true, message: "Please select project!" }]}
            >
              <Select
                size="large"
                loading={isListLoading}
                options={listData}
                fieldNames={{ label: "name", value: "id" }}
                placeholder="Please select project"
                allowClear
              />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input email!",
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
                disabled
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <SmallButton className="saveButton" message="Save" form={form} />
        </Form.Item>
      </Form>
    );
  };
  return (
    <FormModal
      isOpen={open}
      title="Edit invitations"
      content={<ModalContent />}
      onOk={onOk}
      onCancel={onModalClose}
      className="projectInvitationFormModal"
    />
  );
};

export default InvitationUnverifiedEditModal;
