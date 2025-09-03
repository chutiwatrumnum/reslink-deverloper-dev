import { useState, useEffect } from "react";

// APIs
import {
  useProjectTeamProjectQuery,
  useProjectTeamRoleQuery,
} from "../../../utils/queriesGroup/projectTeamQueries";
import { useEditProjectTeamMemberMutation } from "../../../utils/mutationsGroup/projectTeamMutations";

// Components
import { callConfirmModal } from "../../../components/common/Modal";
import SmallButton from "../../../components/common/SmallButton";
import { Form, Input, Row, Col, Select, Modal } from "antd";
// CSS
import "../style/projectTeam.css";

import type { ProjectTeamListType } from "../../../stores/interfaces/projectTeam";

type ProjectListEditModalType = {
  data?: ProjectTeamListType;
  isProjectListModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  onRefresh: () => void;
};

const ProjectListEditModal = ({
  data,
  isProjectListModalOpen,
  onOk,
  onCancel,
  onRefresh,
}: ProjectListEditModalType) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  // APIs & Data
  const { data: listData, isLoading: isListLoading } =
    useProjectTeamProjectQuery();

  const { data: roleData, isLoading: isRoleLoading } =
    useProjectTeamRoleQuery();

  const editMember = useEditProjectTeamMemberMutation();

  const onModalClose = () => {
    form.resetFields();
    onCancel();
  };

  const onFinish = async (value: any) => {
    callConfirmModal({
      title: "Edit project list",
      message: "Are you sure you want to edit project list?",
      okMessage: "Save",
      cancelMessage: "Cancel",
      onOk: async () => {
        // console.log(value);
        editMember
          .mutateAsync({ userId: data?.userId ?? "", payload: value })
          .then((res) => {
            console.log(res);
          });
        onOk();
        onRefresh();
      },
    });
  };

  const ModalContent = () => {
    return (
      <Form
        form={form}
        name="projectListEditModal"
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
              name="givenName"
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
              name="familyName"
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
                disabled
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

  // Actions
  useEffect(() => {
    setOpen(isProjectListModalOpen);
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
        givenName: data?.givenName,
        middleName: data?.middleName,
        familyName: data?.familyName,
        contact: data?.contact,
        roleId: roleId,
        projectId: projectId,
        email: data?.email,
      });
    }
  }, [isProjectListModalOpen]);

  return (
    <Modal
      open={open}
      title="Edit project list"
      onOk={onOk}
      onCancel={onModalClose}
      className="projectListFormModal"
      footer={null}
    >
      <ModalContent />
    </Modal>
  );
};

export default ProjectListEditModal;
