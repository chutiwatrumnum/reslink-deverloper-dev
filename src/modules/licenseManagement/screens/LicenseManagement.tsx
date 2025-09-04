// src/modules/licenseManagement/screens/LicenseManagement.tsx - อัปเดตให้ส่ง projectId แทน id
import { useState } from "react";

// Components
import Header from "../../../components/templates/Header";
import { Row, Col, Input, Button, Table, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { InfoCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { callConfirmModal } from "../../../components/common/Modal";
import StatusPill from "../components/StatusPill";
import LicenseActionCell from "../components/LicenseActionCell";
import InfoModal from "../components/modals/InfoModal";
import AssignProjectModal from "../components/modals/AssignProjectModal";
import SelectPackageModal from "../components/modals/SelectPackageModal";

// API (ใช้แค่ React Query ไม่ใช้ Redux)
import { getLicenseQuery } from "../../../utils/queriesGroup/licenseQueries";
import {
  useRenewLicenseMutation,
  useMakePaymentMutation,
} from "../../../utils/mutationsGroup/licenseMutations";
import type {
  LicenseItem,
  GetLicenseParams,
} from "../../../stores/interfaces/License";

const LicenseManagement = () => {
  // ใช้แค่ local state เพื่อหลีกเลี่ยงการทำงานซ้ำซ้อนกับ Redux
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");

  // Modal states
  const [infoOpen, setInfoOpen] = useState(false);
  const [isSelectPackageModalOpen, setIsSelectPackageModalOpen] =
    useState(false);
  const [isAssignProjectOpen, setIsAssignProjectOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();

  // API query - ใช้แค่ React Query
  const queryParams: GetLicenseParams = {
    curPage: currentPage,
    perPage: pageSize,
    search: search || undefined,
    paymentStatus: paymentStatusFilter || undefined,
  };

  const {
    data: licenseData,
    isLoading,
    refetch,
  } = getLicenseQuery(queryParams);

  // Mutations
  const renewLicenseMutation = useRenewLicenseMutation();
  const makePaymentMutation = useMakePaymentMutation();

  // Event handlers
  const handleSearch = (value: string) => {
    setSearch(value.trim());
    setCurrentPage(1); // Reset to first page
  };

  const handlePaymentStatusChange = (value: string) => {
    setPaymentStatusFilter(value);
    setCurrentPage(1); // Reset to first page
  };

  const handleRefresh = () => {
    refetch();
  };

  // Pagination handlers - รวมเป็นตัวเดียวเพื่อไม่ให้ซ้ำซ้อน
  const handlePaginationChange = (page: number, size?: number) => {
    console.log("Pagination change:", { page, size });
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to page 1 when page size changes
    }
  };

  // Modal handlers
  const handleBuyNew = () => setIsAssignProjectOpen(true);
  const handleAssignCancel = () => setIsAssignProjectOpen(false);

  const handleAssignContinue = (projectId: string) => {
    setIsAssignProjectOpen(false);
    setSelectedProjectId(projectId);
    setIsSelectPackageModalOpen(true);
  };

  const handleSelectPackageCancel = () => {
    setIsSelectPackageModalOpen(false);
    setSelectedProjectId(undefined);
  };

  // License actions
  const handleRenew = (record: LicenseItem) => {
    callConfirmModal({
      title: "Renew license",
      message: `Renew license for "${record.project.name}"?`,
      okMessage: "Renew",
      cancelMessage: "Cancel",
      onOk: async () => {
        await renewLicenseMutation.mutateAsync({
          licenseId: record.id,
          packageType: record.packageName || "Standard",
        });
      },
    });
  };

  const handleMakePayment = (record: LicenseItem) => {
    callConfirmModal({
      title: "Make payment",
      message: `Proceed to payment for "${record.project.name}"?`,
      alertMessage: "Please ensure you have the payment slip ready for upload.",
      okMessage: "Pay now",
      cancelMessage: "Cancel",
      onOk: () => {
        window.open("#/license/payment", "_blank");
      },
    });
  };

  // Table columns
  const columns: ColumnsType<LicenseItem> = [
    {
      title: "Project name",
      dataIndex: ["project", "name"],
      key: "projectName",
      align: "center",
    },
    {
      title: "Package",
      dataIndex: "packageName",
      key: "packageName",
      align: "center",
      render: (pkg) => pkg || "Standard",
    },
    {
      title: "Order no.",
      dataIndex: "orderNo",
      key: "orderNo",
      align: "center",
    },
    {
      title: "Buying date",
      dataIndex: "buyingDate",
      key: "buyingDate",
      align: "center",
      render: (date) => date || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (status ? <StatusPill status={status} /> : "N/A"),
    },
    // {
    //   title: "Payment Status",
    //   dataIndex: ["paymentStatus", "nameEn"],
    //   key: "paymentStatus",
    //   align: "center",
    //   render: (status, record) => (
    //     <span
    //       style={{
    //         color:
    //           record.paymentStatus.nameCode === "success"
    //             ? "#38BE43"
    //             : record.paymentStatus.nameCode === "pending"
    //             ? "#ECA013"
    //             : "#D73232",
    //         fontWeight: "500",
    //       }}>
    //       {status}
    //     </span>
    //   ),
    // },
    {
      title: "License",
      key: "license",
      align: "center",
      render: (_, record) => (
        <LicenseActionCell
          record={record}
          onRenew={handleRenew}
          onMakePayment={handleMakePayment}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          type="text"
          icon={<InfoCircleOutlined style={{ fontSize: 18 }} />}
          onClick={() => {
            // ใช้ project.id แทน record.id เพื่อส่งไปยัง InfoModal
            setSelectedProjectId(record.project.id);
            setInfoOpen(true);
          }}
        />
      ),
    },
  ];

  // Constants
  const paymentStatusOptions = [
    { label: "All", value: "" },
    { label: "Success", value: "success" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <>
      <Header title="License" />

      {/* Filters */}
      <Row style={{ marginTop: 24 }} gutter={[16, 16]} align="middle">
        <Col xs={24} md={8} lg={6}>
          <Input.Search
            placeholder="Search by project name"
            allowClear
            onSearch={handleSearch}
            style={{ width: "100%" }}
            size="large"
          />
        </Col>
        <Col xs={24} md={6} lg={5}>
          <Select
            placeholder="Payment Status"
            options={paymentStatusOptions}
            onChange={handlePaymentStatusChange}
            style={{ width: "100%" }}
            size="large"
            allowClear
          />
        </Col>
        <Col>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            size="large"
            loading={isLoading}>
            Refresh
          </Button>
        </Col>
        <Col flex="auto" />
        <Col xs={24} md={8} lg={6}>
          <Button
            size="large"
            type="primary"
            onClick={handleBuyNew}
            style={{ width: "100%" }}>
            Buy new license
          </Button>
        </Col>
      </Row>

      {/* Table */}
      <Row style={{ marginTop: 12 }}>
        <Col span={24}>
          <Table<LicenseItem>
            rowKey="id"
            columns={columns}
            dataSource={licenseData?.data || []}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: licenseData?.total || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: handlePaginationChange,
              onShowSizeChange: handlePaginationChange,
            }}
            scroll={{ x: "max-content" }}
          />
        </Col>
      </Row>

      

      {/* Modals */}
      <AssignProjectModal
        open={isAssignProjectOpen}
        onCancel={handleAssignCancel}
        onContinue={handleAssignContinue}
      />

      <SelectPackageModal
        isSelectPackageModalOpen={isSelectPackageModalOpen}
        onCancel={handleSelectPackageCancel}
      />

      {/* อัปเดต InfoModal ให้ใช้ projectId แทน id */}
      <InfoModal
        isInfoModalOpen={infoOpen}
        onCancel={() => {
          setInfoOpen(false);
          setSelectedProjectId(undefined);
        }}
        projectId={selectedProjectId}
      />
    </>
  );
};

export default LicenseManagement;
