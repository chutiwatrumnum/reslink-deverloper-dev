import { useState } from "react";
// Components
import Header from "../../../components/templates/Header";
import { callConfirmModal } from "../../../components/common/Modal";
import {
  Row,
  Col,
  Table,
  DatePicker,
  DatePickerProps,
  Button,
  Input,
  Flex,
  Tabs,
  message,
  Modal,
} from "antd";
import dayjs from "dayjs";
import TeamInvitationCreateModal from "../components/TeamInvitationCreateModal";
import TeamInvitationEditModal from "../components/TeamInvitationEditModal";

// API Hooks
import {
  getDeveloperTeamInvitationsQuery,
  getDeveloperTeamRoleQuery,
} from "../../../utils/queriesGroup/developerTeamQueries";
import {
  postCreateDeveloperTeamMutation,
  useResendDeveloperTeamInvitationMutation,
  useDeleteDeveloperTeamMutation,
} from "../../../utils/mutationsGroup/developerTeamMutations";

// Icons
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

// Types
import type { TabsProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DeveloperTeamType } from "../../../stores/interfaces/DeveloperTeam";

const DevTeamInvitations = () => {
  // States
  const [isVerified, setIsVerified] = useState(false);
  const [curPage, setCurPage] = useState(1);
  const [search, setSearch] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<DeveloperTeamType | null>(null);
  const [selectedEditRecord, setSelectedEditRecord] =
    useState<DeveloperTeamType | null>(null);

  // Modal states
  const [onCreateModalOpen, setOnCreateModalOpen] = useState(false);
  const [onEditModalOpen, setOnEditModalOpen] = useState(false);

  // API Hooks
  const {
    data: invitationsData,
    isLoading: invitationsLoading,
    refetch: refetchInvitations,
    error: invitationsError,
  } = getDeveloperTeamInvitationsQuery({
    activate: isVerified,
    curPage: curPage,
    search: search || undefined,
  });

  const { data: roleData, isLoading: roleLoading } =
    getDeveloperTeamRoleQuery();

  // Mutations
  const createMutation = postCreateDeveloperTeamMutation();
  const resendMutation = useResendDeveloperTeamInvitationMutation();
  const deleteMutation = useDeleteDeveloperTeamMutation();

  // Tab configuration
  const items: TabsProps["items"] = [
    { key: "unverified", label: "Waiting for Verification" },
    { key: "verified", label: "Verified" },
  ];

  const onTabsChange = (key: string) => {
    setIsVerified(key === "verified");
    setCurPage(1);
  };

  // Date picker
  const { RangePicker } = DatePicker;
  const dateFormat = "MMMM,YYYY";
  const customFormat: DatePickerProps["format"] = (value) =>
    `Month : ${value.format(dateFormat)}`;

  const handleDate = async (e: any) => {
    // TODO: Implement date filtering
    console.log("Date range selected:", e);
  };

  // Search
  const { Search } = Input;
  const onSearch = (value: string) => {
    setSearch(value);
    setCurPage(1);
  };

  const onCreate = () => {
    setOnCreateModalOpen(true);
  };

  const onCreateOk = () => {
    setOnCreateModalOpen(false);
  };

  const onCreateCancel = () => {
    setOnCreateModalOpen(false);
  };

  const onEdit = (record: DeveloperTeamType) => {
    setSelectedEditRecord(record);
    setOnEditModalOpen(true);
  };

  const onEditOk = () => {
    setOnEditModalOpen(false);
    setSelectedEditRecord(null);
  };

  const onEditCancel = () => {
    setOnEditModalOpen(false);
    setSelectedEditRecord(null);
  };

  // Show detail modal
  const showDetailModal = (record: DeveloperTeamType) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // Resend invitation
  const handleResendInvitation = (invitationId: string) => {
    callConfirmModal({
      title: "Resend Invitation",
      message: "Are you sure you want to resend this invitation?",
      okMessage: "Yes, Resend",
      cancelMessage: "Cancel",
      onOk: () => {
        setResendingId(invitationId);
        resendMutation.mutate(invitationId, {
          onSuccess: () => {
            setResendingId(null);
          },
          onError: () => {
            setResendingId(null);
          },
        });
      },
    });
  };

  // Delete handler
  const showDeleteUnverifiedConfirm = (record: DeveloperTeamType) => {
    callConfirmModal({
      title: "Delete confirmation?",
      message: "Do you really want to delete this item?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        if (record.id || record.userId) {
          const deleteId = record.id || record.userId;
          deleteMutation.mutate(
            { userId: deleteId!, isListDelete: false },
            {
              onSuccess: () => {
                refetchInvitations();
              },
            }
          );
        } else {
          console.error("No ID found for deletion");
          message.error("Cannot delete: No ID found");
        }
      },
    });
  };

  // Resend verify button
  const onResendVerify = (record: DeveloperTeamType) => {
    if (record.id) {
      handleResendInvitation(record.id);
    }
  };

  const onRefresh = () => {
    refetchInvitations();
  };

  // Table columns
  const defaultColumns: ColumnsType<DeveloperTeamType> = [
    {
      title: "Name-Surname",
      align: "center",
      render: (_, record) => {
        const firstName = record.firstName || record.givenName || "";
        const middleName = record.middleName ? ` ${record.middleName}` : "";
        const lastName = record.lastName || record.familyName || "";

        const fullName = `${firstName}${middleName} ${lastName}`.trim();
        return <div>{fullName || record.name || "-"}</div>;
      },
    },
    {
      title: "Role",
      align: "center",
      render: (_, record) => {
        // รองรับทั้ง string และ object
        if (typeof record.role === "object" && record.role?.name) {
          return <div>{record.role.name}</div>;
        }
        return <div>{record.role || "-"}</div>;
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Phone number",
      align: "center",
      render: (_, record) => {
        return <div>{record.phone || record.contact || "-"}</div>;
      },
    },
    {
      title: "Created by",
      align: "center",
      render: (_, record) => {
        // รองรับ format ต่างๆ ของ createdBy
        if (typeof record.createdBy === "object") {
          return (
            <div>
              {record.createdBy?.givenName ||
                record.createdBy?.firstName ||
                "-"}
            </div>
          );
        }
        return <div>{record.createdBy || "-"}</div>;
      },
    },
    {
      title: "Created date & time",
      align: "center",
      render: (_, record) => {
        return (
          <div>
            {record.createdAt !== "-" && record.createdAt
              ? dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")
              : "-"}
          </div>
        );
      },
    },
  ];

  const unverifiedColumns: ColumnsType<DeveloperTeamType> = [
    ...defaultColumns,
    {
      title: "Invite expired",
      align: "center",
      render: (_, record) => {
        const expireDate = record.invitedExpired || record.expireDate;
        return (
          <div>
            {expireDate ? dayjs(expireDate).format("DD/MM/YYYY HH:mm") : "-"}
          </div>
        );
      },
    },
    {
      title: "Verification",
      align: "center",
      render: (_, record) => {
        return (
          <Button
            size="middle"
            onClick={() => onResendVerify(record)}
            type="text"
            loading={resendingId === record.id}
            disabled={resendingId === record.id}
            style={{ border: "solid", borderColor: "#4a95ff" }}
            icon={<ReloadOutlined />}
          >
            Resend verify
          </Button>
        );
      },
    },
    {
      title: "Action",
      align: "center",
      width: "10%",
      render: (_, record) => {
        return (
          <Row justify={"center"}>
            <Col>
              <Button
                type="text"
                onClick={() => showDetailModal(record)}
                icon={
                  <InfoCircleOutlined
                    style={{ fontSize: 20, color: "#403d38" }}
                  />
                }
                title="View Details"
              />
            </Col>
            <Col>
              <Button
                type="text"
                onClick={() => onEdit(record)}
                icon={
                  <EditOutlined style={{ fontSize: 20, color: "#403d38" }} />
                }
                title="Edit"
              />
            </Col>
            <Col>
              <Button
                onClick={() => showDeleteUnverifiedConfirm(record)}
                type="text"
                loading={
                  deleteMutation.isPending &&
                  deleteMutation.variables?.userId ===
                    (record.id || record.userId)
                }
                icon={
                  <DeleteOutlined style={{ fontSize: 20, color: "#403d38" }} />
                }
                title="Delete"
              />
            </Col>
          </Row>
        );
      },
    },
  ];

  const verifiedColumns: ColumnsType<DeveloperTeamType> = [
    ...defaultColumns,
    {
      title: "Phone No.",
      align: "center",
      render: (_, record) => {
        return <div>{record.phone || record.contact || "-"}</div>;
      },
    },
    {
      title: "Verified date & time",
      align: "center",
      render: (_, record) => {
        const verifiedDate = record.verifiedDate || record.activateDate;
        return (
          <div>
            {verifiedDate
              ? dayjs(verifiedDate).format("DD/MM/YYYY HH:mm")
              : "-"}
          </div>
        );
      },
    },
    {
      title: "Action",
      align: "center",
      render: (_, record) => {
        return (
          <Row gutter={[8, 8]} justify="center">
            <Col>
              <Button
                type="text"
                onClick={() => showDetailModal(record)}
                icon={
                  <InfoCircleOutlined
                    style={{ fontSize: 20, color: "#403d38" }}
                  />
                }
                title="View Details"
              />
            </Col>
          </Row>
        );
      },
    },
  ];

  // Error handling
  if (invitationsError) {
    console.error("Invitations API Error:", invitationsError);
  }

  return (
    <>
      <Header title="Developer team invitations" />
      <Row gutter={10} style={{ marginTop: 24 }}>
        <Col span={6}>
          <RangePicker
            style={{ width: "100%" }}
            picker="month"
            format={customFormat}
            onChange={handleDate}
          />
        </Col>
        <Col span={6}>
          <Search
            placeholder="Search by name"
            allowClear
            onSearch={onSearch}
            className="searchBox"
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={onCreate}
            type="primary"
            size="middle"
            style={{ width: 200 }}
            loading={createMutation.isPending}
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
            dataSource={invitationsData?.rows || []}
            loading={invitationsLoading}
            pagination={{
              current: curPage,
              pageSize: 10,
              total: invitationsData?.total || 0,
              onChange: (page) => setCurPage(page),
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            rowKey={(record) => record.id || record.key || record.userId}
            scroll={{ x: "max-content" }}
          />
        </Col>
      </Row>

      <TeamInvitationCreateModal
        isCreateModalOpen={onCreateModalOpen}
        onCancel={onCreateCancel}
        onOk={onCreateOk}
        onRefresh={onRefresh}
        roleData={roleData}
        roleLoading={roleLoading}
        createMutation={createMutation}
      />

      <TeamInvitationEditModal
        isEditModalOpen={onEditModalOpen}
        onCancel={onEditCancel}
        onOk={onEditOk}
        onRefresh={onRefresh}
        selectedRecord={selectedEditRecord}
        roleData={roleData}
        roleLoading={roleLoading}
      />

      {/* Detail Modal */}
      <Modal
        title="Invitation Details"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRecord(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setSelectedRecord(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedRecord && (
          <div style={{ padding: "16px 0" }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div>
                  <strong>Name:</strong>
                </div>
                <div>
                  {selectedRecord?.firstName || selectedRecord?.givenName}{" "}
                  {selectedRecord?.middleName || ""}{" "}
                  {selectedRecord?.lastName || selectedRecord?.familyName}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Email:</strong>
                </div>
                <div>{selectedRecord?.email || "-"}</div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Contact:</strong>
                </div>
                <div>
                  {selectedRecord?.contact || selectedRecord?.phone || "-"}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Role:</strong>
                </div>
                <div>
                  {typeof selectedRecord?.role === "object"
                    ? selectedRecord.role?.name
                    : selectedRecord?.role || "-"}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Created At:</strong>
                </div>
                <div>
                  {selectedRecord?.createdAt
                    ? dayjs(selectedRecord.createdAt).format("DD/MM/YYYY HH:mm")
                    : "-"}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Expire At:</strong>
                </div>
                <div>
                  {selectedRecord?.expireDate || selectedRecord?.invitedExpired
                    ? dayjs(
                        selectedRecord.expireDate ||
                          selectedRecord.invitedExpired
                      ).format("DD/MM/YYYY HH:mm")
                    : "-"}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Created By:</strong>
                </div>
                <div>
                  {typeof selectedRecord?.createdBy === "object"
                    ? `${
                        selectedRecord.createdBy?.givenName ||
                        selectedRecord.createdBy?.firstName ||
                        ""
                      } ${
                        selectedRecord.createdBy?.familyName ||
                        selectedRecord.createdBy?.lastName ||
                        ""
                      }`
                    : selectedRecord?.createdBy || "-"}
                </div>
              </Col>
              {selectedRecord?.failReason && (
                <Col span={24}>
                  <div>
                    <strong>Fail Reason:</strong>
                  </div>
                  <div style={{ color: "#ff4d4f" }}>
                    {selectedRecord.failReason}
                  </div>
                </Col>
              )}
              {selectedRecord?.activate && selectedRecord?.activateBy && (
                <>
                  <Col span={12}>
                    <div>
                      <strong>Activated By:</strong>
                    </div>
                    <div>
                      {selectedRecord.activateBy.givenName}{" "}
                      {selectedRecord.activateBy.familyName}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <strong>Activated At:</strong>
                    </div>
                    <div>
                      {selectedRecord?.activateDate
                        ? dayjs(selectedRecord.activateDate).format(
                            "DD/MM/YYYY HH:mm"
                          )
                        : "-"}
                    </div>
                  </Col>
                </>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </>
  );
};

export default DevTeamInvitations;
