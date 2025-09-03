import { useState, useEffect } from "react";
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
} from "antd";
import dayjs from "dayjs";
import DevTeamListEditModal from "../components/DevTeamListEditModal";

// API Hooks
import { getDeveloperTeamListQuery } from "../../../utils/queriesGroup/developerTeamQueries";
import { useDeleteDeveloperTeamMutation } from "../../../utils/mutationsGroup/developerTeamMutations";

// Icons
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

// Types
import type { ColumnsType } from "antd/es/table";
import type {
  DeveloperTeamType,
  DeveloperTeamListParams,
} from "../../../stores/interfaces/DeveloperTeam";

const DevTeamList = () => {
  // States
  const [params, setParams] = useState<DeveloperTeamListParams>({
    perPage: 10,
    curPage: 1,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditRecord, setSelectedEditRecord] =
    useState<DeveloperTeamType | null>(null);

  // API Hooks
  const {
    data: teamListData,
    isLoading: teamListLoading,
    refetch: refetchTeamList,
    error: teamListError,
  } = getDeveloperTeamListQuery(params);

  // Mutations
  const deleteMutation = useDeleteDeveloperTeamMutation();

  // Date picker
  const { RangePicker } = DatePicker;
  const dateFormat = "MMMM,YYYY";
  const customFormat: DatePickerProps["format"] = (value) =>
    `Month : ${value.format(dateFormat)}`;

  const handleDate = async (dates: any) => {
    if (dates && dates.length === 2) {
      setParams((prev) => ({
        ...prev,
        startDate: dayjs(dates[0]).startOf("month").format("YYYY-MM"),
        endDate: dayjs(dates[1]).endOf("month").format("YYYY-MM"),
        curPage: 1,
      }));
    } else {
      // Clear date filter
      setParams((prev) => ({
        ...prev,
        startDate: undefined,
        endDate: undefined,
        curPage: 1,
      }));
    }
  };

  // Search
  const { Search } = Input;
  const onSearch = (value: string) => {
    setParams((prev) => ({
      ...prev,
      search: value || undefined,
      curPage: 1,
    }));
  };

  // Edit handlers
  const onEdit = (record: DeveloperTeamType) => {
    setSelectedEditRecord(record);
    setIsEditModalOpen(true);
  };

  const onEditCancel = () => {
    setIsEditModalOpen(false);
    setSelectedEditRecord(null);
  };

  const onEditOk = () => {
    setIsEditModalOpen(false);
    setSelectedEditRecord(null);
  };

  const onRefresh = () => {
    refetchTeamList();
  };

  // Delete handler
  const showDeleteConfirm = (record: DeveloperTeamType) => {
    callConfirmModal({
      title: "Delete team member?",
      message: "Do you really want to delete this team member?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: () => {
        if (record.id || record.userId) {
          const deleteId = record.id || record.userId;
          deleteMutation.mutate(
            { userId: deleteId!, isListDelete: true },
            {
              onSuccess: () => {
                refetchTeamList();
              },
            }
          );
        }
      },
    });
  };

  // Table pagination handler
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setParams((prev) => ({
      ...prev,
      curPage: pagination.current || 1,
      perPage: pagination.pageSize || 10,
      sort: sorter?.order ? sorter.order.slice(0, -3) : undefined, // remove 'end' from 'ascend'/'descend'
      sortBy: sorter?.field || undefined,
    }));
  };

  // Table columns
  const columns: ColumnsType<DeveloperTeamType> = [
    {
      title: "Name-Surname",
      key: "name",
      align: "center",
      sorter: true,
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
      key: "role",
      align: "center",
      sorter: true,
      render: (_, record) => {
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
      sorter: true,
    },
    {
      title: "Phone number",
      key: "contact",
      align: "center",
      sorter: true,
      render: (_, record) => {
        return <div>{record.phone || record.contact || "-"}</div>;
      },
    },
    {
      title: "Created by",
      key: "createdBy",
      align: "center",
      render: (_, record) => {
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
      key: "createdAt",
      align: "center",
      sorter: true,
      render: (_, record) => {
        return (
          <div>
            {record.createdAt
              ? dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")
              : "-"}
          </div>
        );
      },
    },
    {
      title: "Last Update",
      key: "updatedAt",
      align: "center",
      sorter: true,
      render: (_, record) => {
        const updateDate =
          record.updatedAt || record.verifiedDate || record.activateDate;
        return (
          <div>
            {updateDate ? dayjs(updateDate).format("DD/MM/YYYY HH:mm") : "-"}
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: "10%",
      render: (_, record) => {
        return (
          <Row justify={"center"}>
            <Col>
              <Button
                className="iconButton"
                type="text"
                size="large"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
            </Col>
            <Col>
              <Button
                className="iconButton"
                type="text"
                size="large"
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(record)}
                loading={
                  deleteMutation.isPending &&
                  deleteMutation.variables?.userId ===
                    (record.id || record.userId)
                }
              />
            </Col>
          </Row>
        );
      },
    },
  ];

  if (teamListError) {
    console.error("Team List API Error:", teamListError);
  }

  return (
    <>
      <Header title="Developer team list" />
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
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={teamListData?.rows || []}
            loading={teamListLoading}
            pagination={{
              current: params.curPage,
              pageSize: params.perPage,
              total: teamListData?.total || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={handleTableChange}
            rowKey={(record) => record.id || record.key || record.userId}
            scroll={{ x: "max-content" }}
          />
        </Col>
      </Row>

      <DevTeamListEditModal
        isEditModalOpen={isEditModalOpen}
        onOk={onEditOk}
        onCancel={onEditCancel}
        onRefresh={onRefresh}
        selectedRecord={selectedEditRecord}
      />
    </>
  );
};

export default DevTeamList;
