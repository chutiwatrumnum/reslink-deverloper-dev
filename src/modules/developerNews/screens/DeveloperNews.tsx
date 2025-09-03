// src/modules/developerNews/screens/DeveloperNews.tsx
import { useState } from "react";
// Components
import Header from "../../../components/templates/Header";
import { callConfirmModal } from "../../../components/common/Modal";
import { Row, Col, Table, DatePicker, Button, Input, Tag, Image } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DeveloperNewsCreateModal from "../components/DeveloperNewsCreateModal";
import DeveloperNewsEditModal from "../components/DeveloperNewsEditModal";
import DeveloperNewsDetailModal from "../components/DeveloperNewsDetailModal";
import { usePagination } from "../../../utils/hooks/usePagination";

// API Hooks
import {
  getDeveloperNewsQuery,
  getDeveloperNewsProjectsQuery,
} from "../../../utils/queriesGroup/developerNewsQueries";
import {
  useCreateDeveloperNewsMutation,
  useDeleteDeveloperNewsMutation,
} from "../../../utils/mutationsGroup/developerNewsMutations";

// Icons
import {
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

// Types
import type { ColumnsType } from "antd/es/table";
import type {
  DeveloperNewsType,
  GetDeveloperNewsParams,
} from "../../../stores/interfaces/DeveloperNews";

const DeveloperNews = () => {
  // Pagination hook
  const { curPage, perPage, onPageChange, onShowSizeChange } = usePagination({
    initialPage: 1,
    initialPerPage: 10,
  });

  // States
  const [params, setParams] = useState<GetDeveloperNewsParams>({
    perPage: perPage,
    curPage: curPage,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<DeveloperNewsType | null>(null);
  const [selectedEditRecord, setSelectedEditRecord] =
    useState<DeveloperNewsType | null>(null);

  // Modal states
  const [onCreateModalOpen, setOnCreateModalOpen] = useState(false);
  const [onEditModalOpen, setOnEditModalOpen] = useState(false);

  // API Hooks
  const {
    data: newsData,
    isLoading: newsLoading,
    refetch: refetchNews,
    error: newsError,
  } = getDeveloperNewsQuery(params);

  const { data: projectsData, isLoading: projectsLoading } =
    getDeveloperNewsProjectsQuery();

  // Mutations
  const createMutation = useCreateDeveloperNewsMutation();
  const deleteMutation = useDeleteDeveloperNewsMutation();

  // Date picker
  const { RangePicker } = DatePicker;

  // แก้ไข handleDate ให้ส่ง format YYYY-MM แทน
  const handleDate = async (dates: any, dateStrings: [string, string]) => {
    if (dates && dates.length === 2) {
      // ใช้ YYYY-MM format สำหรับ API
      const startMonth = dayjs(dates[0]).format("YYYY-MM");
      const endMonth = dayjs(dates[1]).format("YYYY-MM");

      setParams((prev) => ({
        ...prev,
        startMonth: startMonth,
        endMonth: endMonth,
        curPage: 1,
      }));
    } else {
      // Clear date filter
      setParams((prev) => ({
        ...prev,
        startMonth: undefined,
        endMonth: undefined,
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

  // Create handlers
  const onCreate = () => {
    setOnCreateModalOpen(true);
  };

  const onCreateOk = () => {
    setOnCreateModalOpen(false);
  };

  const onCreateCancel = () => {
    setOnCreateModalOpen(false);
  };

  // Edit handlers
  const onEdit = (record: DeveloperNewsType) => {
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

  const onRefresh = () => {
    refetchNews();
  };

  // Show detail modal - ใช้ข้อมูลจาก table
  const showDetailModal = (record: DeveloperNewsType) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedRecord(null);
  };

  // Delete handler
  const showDeleteConfirm = (record: DeveloperNewsType) => {
    callConfirmModal({
      title: "Delete news?",
      message: "Do you really want to delete this news?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: () => {
        if (record.id) {
          deleteMutation.mutate(record.id.toString(), {
            onSuccess: () => {
              refetchNews();
            },
          });
        }
      },
    });
  };

  // Table pagination handler
  const handleTableChange = (pagination: any) => {
    const newPage = pagination.current || 1;
    const newPageSize = pagination.pageSize || 10;

    onPageChange(newPage);
    if (newPageSize !== perPage) {
      onShowSizeChange(newPage, newPageSize);
    }

    setParams((prev) => ({
      ...prev,
      curPage: newPage,
      perPage: newPageSize,
    }));
  };

  // Get status tag
  const getStatusTag = (record: DeveloperNewsType) => {
    const now = dayjs();
    const startDate = dayjs(record.startDate);
    const endDate = dayjs(record.endDate);

    if (!record.active || !record.isPublish) {
      return <Tag color="red">Inactive</Tag>;
    }

    if (now.isBefore(startDate)) {
      return <Tag color="blue">Scheduled</Tag>;
    }

    if (now.isAfter(endDate)) {
      return <Tag color="gray">Expired</Tag>;
    }

    return <Tag color="green">Activated</Tag>;
  };

  // Get creator name from new API format - ไม่มี fallback data
  const getCreatorName = (record: DeveloperNewsType) => {
    // ใช้ createBy จาก API ใหม่
    if (record.createBy) {
      const fullName = `${record.createBy.givenName || ""} ${
        record.createBy.familyName || ""
      }`.trim();
      return fullName || "-";
    }

    // Fallback ไปใช้ createdBy format เดิม
    if (typeof record.createdBy === "object" && record.createdBy) {
      const fullName = `${record.createdBy.givenName || ""} ${
        record.createdBy.familyName || ""
      }`.trim();
      return fullName || "-";
    }

    if (typeof record.createdBy === "string" && record.createdBy.trim()) {
      return record.createdBy.trim();
    }

    return "-";
  };

  // Table columns
  const columns: ColumnsType<DeveloperNewsType> = [
    {
      title: "Picture",
      key: "picture",
      align: "center",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {record.imageUrl ? (
            <Image
              width={80}
              height={60}
              src={record.imageUrl}
              style={{
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #f0f0f0",
              }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 60,
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                color: "#bbb",
                fontSize: 12,
                border: "1px solid #f0f0f0",
              }}>
              No Image
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Title",
      key: "title",
      width: 280,
      align: "center",
      render: (_, record) => (
        <div
          style={{
            fontWeight: 500,
            marginBottom: 4,
            lineHeight: "1.4",
          }}>
          {record.title || "-"}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      width: 100,
      render: (_, record) => getStatusTag(record),
    },
    {
      title: "Create at",
      key: "createdAt",
      align: "center",
      width: 120,
      render: (_, record) => (
        <div>
          <div>
            {record.createdAt
              ? dayjs(record.createdAt).format("DD/MM/YY")
              : "-"}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {record.createdAt ? dayjs(record.createdAt).format("HH:mm") : "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Last update",
      key: "updatedAt",
      align: "center",
      width: 120,
      render: (_, record) => (
        <div>
          <div>
            {record.updatedAt
              ? dayjs(record.updatedAt).format("DD/MM/YY")
              : "-"}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {record.updatedAt ? dayjs(record.updatedAt).format("HH:mm") : "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Created By",
      key: "createdBy",
      align: "center",
      width: 120,
      render: (_, record) => <div>{getCreatorName(record)}</div>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <Button
            type="text"
            size="small"
            onClick={() => showDetailModal(record)}
            icon={
              <InfoCircleOutlined style={{ fontSize: 16, color: "#666" }} />
            }
            title="View Details"
            style={{
              padding: "4px 8px",
              height: "auto",
              border: "none",
            }}
          />
          <Button
            type="text"
            size="small"
            onClick={() => onEdit(record)}
            icon={<EditOutlined style={{ fontSize: 16, color: "#666" }} />}
            title="Edit"
            style={{
              padding: "4px 8px",
              height: "auto",
              border: "none",
            }}
          />
          <Button
            type="text"
            size="small"
            onClick={() => showDeleteConfirm(record)}
            loading={
              deleteMutation.isPending &&
              deleteMutation.variables === record.id?.toString()
            }
            icon={<DeleteOutlined style={{ fontSize: 16, color: "#666" }} />}
            title="Delete"
            style={{
              padding: "4px 8px",
              height: "auto",
              border: "none",
            }}
          />
        </div>
      ),
    },
  ];

  // Error handling
  if (newsError) {
    // Handle error silently
  }

  return (
    <>
      <Header title="Developer news" />

      {/* Search and Filter Controls */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={6}>
          <RangePicker
            style={{ width: "100%" }}
            placeholder={["Start month", "End month"]}
            onChange={handleDate}
            picker="month" // เปลี่ยนเป็น month picker
            format="YYYY-MM" // กำหนด format
            suffixIcon={<CalendarOutlined />}
            allowClear
            size="large"
          />
        </Col>
        <Col span={6}>
          <Search
            placeholder="Search by title"
            allowClear
            onSearch={onSearch}
            style={{ width: "100%" }}
            size="large"
          />
        </Col>
        <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={onCreate}
            type="primary"
            size="large"
            style={{
              width: 150,
              backgroundColor: "#002c55",
              borderColor: "#002c55",
            }}
            loading={createMutation.isPending}>
            Add News
          </Button>
        </Col>
      </Row>

      {/* Table */}
      <div style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={newsData?.rows || []}
          loading={newsLoading}
          pagination={{
            current: curPage,
            pageSize: perPage,
            total: newsData?.total || 0,
            onChange: onPageChange,
            onShowSizeChange: onShowSizeChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ["10", "20", "50"],
            style: { marginTop: 16 },
          }}
          onChange={handleTableChange}
          rowKey={(record) => record.id?.toString() || record.key}
          scroll={{ x: 1000 }}
          size="middle"
          style={{
            backgroundColor: "#fff",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        />
      </div>

      {/* Modals */}
      <DeveloperNewsCreateModal
        isCreateModalOpen={onCreateModalOpen}
        onCancel={onCreateCancel}
        onOk={onCreateOk}
        onRefresh={onRefresh}
        projectsData={projectsData}
        projectsLoading={projectsLoading}
        createMutation={createMutation}
      />

      <DeveloperNewsEditModal
        isEditModalOpen={onEditModalOpen}
        onCancel={onEditCancel}
        onOk={onEditOk}
        onRefresh={onRefresh}
        selectedRecord={selectedEditRecord}
        projectsData={projectsData}
        projectsLoading={projectsLoading}
      />

      {/* Detail Modal - ใช้ข้อมูลจาก table */}
      <DeveloperNewsDetailModal
        visible={detailModalVisible}
        onClose={closeDetailModal}
        newsData={selectedRecord}
      />
    </>
  );
};

export default DeveloperNews;
