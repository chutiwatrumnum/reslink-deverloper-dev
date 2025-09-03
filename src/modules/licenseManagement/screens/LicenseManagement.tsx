import { useMemo, useState } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";

// Components
import Header from "../../../components/templates/Header";
import { Row, Col, Input, Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { InfoCircleOutlined } from "@ant-design/icons";
import { callConfirmModal } from "../../../components/common/Modal";
import StatusPill from "../components/StatusPill";
import LicenseActionCell from "../components/LicenseActionCell";
import InfoModal from "../components/modals/InfoModal";
import AssignProjectModal from "../components/modals/AssignProjectModal";
import SelectPackageModal from "../components/modals/SelectPackageModal";

import { licenseData } from "../mockData/mockData";
import type { LicenseItem } from "../../../stores/interfaces/License";

const LicenseManagement = () => {
  // initial
  const { curPage, perPage } = usePagination();

  // search
  const { Search } = Input;
  const [search, setSearch] = useState("");

  // modal
  const [infoOpen, setInfoOpen] = useState(false);
  const [isSelectPackageModalOpen, setIsSelectPackageModalOpen] =
    useState(false);
  const [isAssignProjectOpen, setIsAssignProjectOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();

  const onSearch = (value: string) => setSearch(value.trim());

  const filtered = useMemo(() => {
    if (!search) return licenseData;
    const q = search.toLowerCase();
    return licenseData.filter((d) => d.projectName.toLowerCase().includes(q));
  }, [search]);

  // actions
  const onBuyNew = () => {
    setIsAssignProjectOpen(true);
  };

  const onRenew = (rec: LicenseItem) => {
    callConfirmModal({
      title: "Renew license",
      message: `Renew license for "${rec.projectName}"?`,
      okMessage: "Renew",
      cancelMessage: "Cancel",
      onOk: async () => {},
      onCancel: () => {},
    });
  };

  const onMakePayment = (rec: LicenseItem) => {
    callConfirmModal({
      title: "Make payment",
      message: `Proceed to payment for "${rec.projectName}"?`,
      okMessage: "Pay now",
      cancelMessage: "Cancel",
      onOk: async () => window.open("#/license/payment", "_blank"),
      onCancel: () => {},
    });
  };

  const handleAssignCancel = () => {
    setIsAssignProjectOpen(false);
  };

  const handleAssignContinue = (projectId: string) => {
    setIsAssignProjectOpen(false);
    setSelectedProjectId(projectId);
    setIsSelectPackageModalOpen(true);
  };

  const handleSelectPackageCancel = () => {
    setIsSelectPackageModalOpen(false);
    setSelectedProjectId(undefined);
  };

  const columns: ColumnsType<LicenseItem> = [
    {
      title: "Project name",
      dataIndex: "projectName",
      key: "projectName",
      align: "center",
    },
    {
      title: "Package",
      dataIndex: "packageName",
      key: "packageName",
      align: "center",
      render: (pkg) => <span>{pkg}</span>,
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
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => <StatusPill status={status} />,
    },
    {
      title: "License",
      key: "license",
      align: "center",
      render: (_, record) => (
        <LicenseActionCell
          record={record}
          onRenew={onRenew}
          onMakePayment={onMakePayment}
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
            setSelectedProjectId(record.id); // ส่ง id ที่มีใน mock; ไม่ส่งก็ได้ (modal จะ fallback)
            setInfoOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <Header title="License" />

      <Row style={{ marginTop: 24 }} gutter={[16, 16]} align="middle">
        <Col xs={24} md={10} lg={8}>
          <Search
            placeholder="Search by project name"
            allowClear
            onSearch={onSearch}
            className="searchBox"
            style={{ width: "100%" }}
            size="large"
          />
        </Col>
        <Col flex="auto" />
        <Col xs={24} md={8} lg={6}>
          <Button
            size="large"
            type="primary"
            onClick={onBuyNew}
            style={{ width: "100%" }}
          >
            Buy new license
          </Button>
        </Col>
      </Row>

      <Row style={{ marginTop: 12 }}>
        <Col span={24}>
          <Table<LicenseItem>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={{
              pageSize: perPage,
              current: curPage,
              total: filtered.length,
            }}
            scroll={{ x: "max-content" }}
          />
        </Col>
      </Row>

      <AssignProjectModal
        open={isAssignProjectOpen}
        onCancel={handleAssignCancel}
        onContinue={handleAssignContinue}
      />

      <SelectPackageModal
        isSelectPackageModalOpen={isSelectPackageModalOpen}
        onCancel={handleSelectPackageCancel}
      />

      <InfoModal
        isInfoModalOpen={infoOpen}
        onCancel={() => setInfoOpen(false)}
        id={selectedProjectId}
      />
    </>
  );
};

export default LicenseManagement;
