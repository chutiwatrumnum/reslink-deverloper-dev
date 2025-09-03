import { useState } from "react";
import dayjs from "dayjs";
import { usePagination } from "../../../utils/hooks/usePagination";

// Data & APIs
import { useProjectTeamInvitationsListQuery } from "../../../utils/queriesGroup/projectTeamQueries";
import {
  useDeleteProjectJuristicInvitationMutation,
  useResendProjectJuristicInvitationMutation,
} from "../../../utils/mutationsGroup/projectTeamMutations";

// Components
import Header from "../../../components/templates/Header";
import { callConfirmModal } from "../../../components/common/Modal";
import InvitationCreateModal from "../components/InvitationCreateModal";
import InvitationUnverifiedEditModal from "../components/InvitationUnverifiedEditModal";
import InvitationInfoModal from "../components/InvitationInfoModal";
import { Table, Row, Col, Button, Input, Flex, Tabs } from "antd";

// Icons
import {
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

// Types
import type { ColumnsType } from "antd/es/table";
import type { ProjectTeamType } from "../../../stores/interfaces/projectTeam";
import { TabsProps } from "antd";

const ProjectInvitation = () => {
  // Initial
  const {
    perPage,
    curPage,
    pageSizeOptions,
    onPageChange,
    deleteAndHandlePagination,
  } = usePagination({
    initialPage: 1,
    initialPerPage: 10,
  });

  const [dataEdit, setDataEdit] = useState<ProjectTeamType>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditUnverifiedModalOpen, setIsEditUnverifiedModalOpen] =
    useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [infoData, setInfoData] = useState<ProjectTeamType>();

  const [search, setSearch] = useState("");

  // Data & APIs
  const {
    data: invitationsData,
    isLoading: invitationsLoading,
    refetch: refetchInvitations,
  } = useProjectTeamInvitationsListQuery({
    activate: isVerified,
    curPage,
    perPage,
    search,
  });

  const deleteInvite = useDeleteProjectJuristicInvitationMutation();
  const resendInvite = useResendProjectJuristicInvitationMutation();

  // 🪧➕ Add invitation modal
  const onCreate = () => setIsCreateModalOpen(true);
  const onCreateOk = () => setIsCreateModalOpen(false);
  const onCreateCancel = () => setIsCreateModalOpen(false);

  // 🪧🖋️ Edit Unverified modal
  const onEditUnverified = async (data: ProjectTeamType) => {
    setDataEdit(data);
    setIsEditUnverifiedModalOpen(true);
  };
  const onEditUnverifiedOk = () => setIsEditUnverifiedModalOpen(false);
  const onEditUnverifiedCancel = () => setIsEditUnverifiedModalOpen(false);

  // 🪧📋 Info Unverified modal
  const onInfoUnverified = (record: ProjectTeamType) => {
    setInfoData(record);
    setIsInfoModalOpen(true);
  };
  const onInfoUnverifiedCancel = () => setIsInfoModalOpen(false);

  const onRefresh: VoidFunction = () => {
    setRefresh(!refresh);
    refetchInvitations();
  };

  // 🗑️ Delete
  const showDeleteUnverifiedConfirm = (record: ProjectTeamType) => {
    callConfirmModal({
      title: "Delete confirmation?",
      message: "Do you really want to delete this item?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        await deleteAndHandlePagination({
          dataLength: invitationsData?.rows?.length ?? 0,
          onDelete: async () => {
            await deleteInvite.mutateAsync({ id: record.id });
          },
          fetchData: refetchInvitations,
        });
      },
    });
  };

  // 🔎 Search
  const { Search } = Input;
  const onSearch = (value: string) => {
    setSearch(value);
  };

  // 🔲 resend verify
  const handleResendVerify = (record: ProjectTeamType) => {
    callConfirmModal({
      title: "Resend Invitation",
      message: "Are you sure you want to resend this invitation?",
      okMessage: "Yes, Resend",
      cancelMessage: "Cancel",
      onOk: async () => {
        await resendInvite.mutateAsync({ id: record.id });
        onRefresh();
      },
    });
  };

  // 📑 Tabs
  const items: TabsProps["items"] = [
    { key: "unverified", label: "Waiting for Verification" },
    { key: "verified", label: "Verified" },
  ];
  const onTabsChange = (key: string) => setIsVerified(key === "verified");

  // 📊 Columns
  const defaultColumns: ColumnsType<ProjectTeamType> = [
    {
      title: "Project Name",
      key: "projectName",
      align: "center",
      render: (_, record) => <div>{record?.project?.name}</div>,
    },
    {
      title: "Name-Surname",
      key: "name",
      align: "center",
      render: (_, record) => (
        <div>{`${record?.firstName} ${record?.middleName ?? ""} ${
          record?.lastName
        }`}</div>
      ),
    },
    {
      title: "Role",
      key: "role",
      align: "center",
      render: (_, record) => <div>{record?.role?.name}</div>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
  ];

  const verifiedColumns: ColumnsType<ProjectTeamType> = [
    ...defaultColumns,
    {
      title: "Phone number",
      key: "contact",
      dataIndex: "contact",
      align: "center",
    },
    {
      title: "Created by",
      key: "createdBy",
      align: "center",
      render: (_, record) => (
        <div>{`${record?.createdBy?.givenName} ${record?.createdBy?.familyName}`}</div>
      ),
    },
    {
      title: "Created date & time",
      key: "createdAt",
      dataIndex: "createdAt",
      align: "center",
      render: (_, record) =>
        record.createdAt !== "-"
          ? dayjs(record.createdAt).format(`DD/MM/YYYY HH:mm`)
          : "-",
    },
    {
      title: "Verified date & time",
      key: "verifiedDate",
      dataIndex: "verifiedDate",
      align: "center",
      render: (_, record) =>
        record.activateDate !== "-"
          ? dayjs(record.activateDate).format(`DD/MM/YYYY HH:mm`)
          : "-",
    },
  ];

  const unverifiedColumns: ColumnsType<ProjectTeamType> = [
    ...defaultColumns,
    {
      title: "Invited expired",
      key: "invitedExpired",
      dataIndex: "invitedExpired",
      align: "center",
      render: (_, record) =>
        record.expireDate !== "-"
          ? dayjs(record.expireDate).format(`DD/MM/YYYY HH:mm`)
          : "-",
    },
    {
      title: "Verification",
      align: "center",
      render: (_, record) => (
        <Button
          size="middle"
          onClick={() => handleResendVerify(record)}
          type="text"
          loading={resendInvite.isPending}
          disabled={resendInvite.isPending}
          style={{
            border: "2px solid var(--secondary-color)",
          }}
        >
          Resend verify
        </Button>
      ),
    },
    {
      title: "Action",
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Row justify={"center"}>
          <Col>
            <Button
              type="text"
              onClick={() => onInfoUnverified(record)}
              icon={
                <InfoCircleOutlined
                  style={{ fontSize: 20, color: "#403d38" }}
                />
              }
            />
          </Col>
          <Col>
            <Button
              type="text"
              onClick={() => onEditUnverified(record)}
              icon={<EditOutlined style={{ fontSize: 20, color: "#403d38" }} />}
            />
          </Col>
          <Col>
            <Button
              onClick={() => showDeleteUnverifiedConfirm(record)}
              type="text"
              icon={
                <DeleteOutlined style={{ fontSize: 20, color: "#403d38" }} />
              }
            />
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <>
      <Header title="Project invitations" />
      <Row gutter={10} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Search
            placeholder="Search by name"
            allowClear
            onSearch={onSearch}
            className="searchBox"
            style={{ width: "100%" }}
            size="large"
          />
        </Col>
        <Col
          span={12}
          offset={6}
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            onClick={onCreate}
            type="primary"
            size="large"
            style={{ width: 200 }}
          >
            New Invitations
          </Button>
        </Col>
      </Row>

      <Flex align="center" justify="space-between" style={{ marginTop: 8 }}>
        <Tabs
          defaultActiveKey="unverified"
          items={items}
          onChange={onTabsChange}
        />
      </Flex>

      <Row>
        <Col span={24}>
          <Table
            columns={isVerified ? verifiedColumns : unverifiedColumns}
            dataSource={invitationsData?.rows}
            loading={invitationsLoading}
            scroll={{ x: "max-content" }}
            rowKey="id"
            pagination={{
              current: curPage,
              pageSize: perPage,
              total: invitationsData?.total ?? 0,
              pageSizeOptions,
              showSizeChanger: false,
              onChange: onPageChange,
            }}
          />
        </Col>
      </Row>

      {/* Add new invitation Modal */}
      <InvitationCreateModal
        isCreateModalOpen={isCreateModalOpen}
        onRefresh={onRefresh}
        onCancel={onCreateCancel}
        onOk={onCreateOk}
      />

      {/* Edit Unverified Modal */}
      <InvitationUnverifiedEditModal
        data={dataEdit}
        isEditUnverifiedModalOpen={isEditUnverifiedModalOpen}
        onRefresh={onRefresh}
        onCancel={onEditUnverifiedCancel}
        onOk={onEditUnverifiedOk}
      />

      {/* Info Unverified Modal */}
      <InvitationInfoModal
        data={infoData}
        isInfoModalOpen={isInfoModalOpen}
        onCancel={onInfoUnverifiedCancel}
      />
    </>
  );
};

export default ProjectInvitation;
