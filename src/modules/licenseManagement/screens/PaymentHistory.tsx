import { useState } from "react";
// Components
import Header from "../../../components/templates/Header";
import {
  Input,
  Row,
  Col,
  Select,
  Table,
  Tag,
  Button,
  Typography,
  DatePicker,
} from "antd";
// Utils
import dayjs, { Dayjs } from "dayjs";
// Icons
import { PDFIcon } from "../../../assets/icons/Icons";
// Types
import type { ColumnsType } from "antd/es/table";
import type {
  PaymentHistoryParams,
  PaymentHistoryType,
  PaymentStatusType,
  ReceiptDataType,
  FeatureItem,
} from "../../../stores/interfaces/PaymentHistory";
import type { DatePickerProps } from "antd";
//  PDF
import { openReceiptPdf } from "../components/ReceiptPDF";
// Queries
import {
  getPaymentHistoryQuery,
  getPaymentStatusQuery,
  fetchReceiptByLicenseId,
} from "../../../utils/queriesGroup/paymentHistoryQueries";

const PaymentHistory = () => {
  const [curPage, setCurPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 🟢🟡🔴 Payment status filter state
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<number[]>([]);

  const handlePaymentStatusChange = (value: number) => {
    setPaymentStatusFilter(value ? [value] : []);
    setCurPage(1);
  };

  // Ant configuration
  const { Search } = Input;

  // 🔎 Search state
  const [search, setSearch] = useState<string>("");

  const onSearch = (value: string) => {
    setSearch(value.trim());
    setCurPage(1);
  };

  const handlePaginationChange = (page: number, size?: number) => {
    console.log("Pagination change:", { page, size });
    setCurPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurPage(1); // Reset to page 1 when page size changes
    }
  };

  const queryParams: PaymentHistoryParams = {
    curPage: curPage,
    perPage: pageSize,
    search: search || undefined,
    paymentStatusIds:
      paymentStatusFilter.length > 0 ? paymentStatusFilter : undefined,
  };

  const { data: paymentHistoryData, isLoading } =
    getPaymentHistoryQuery(queryParams);

  const { data: paymentStatusData } = getPaymentStatusQuery();

  const mapFeatures = (
    features: FeatureItem[],
    type: "standard" | "optional"
  ): FeatureItem[] => {
    return features.map((item, index) => ({
      id: item.feature.id,
      code: item.feature.name.toLowerCase().replace(/\s+/g, "_"),
      name: item.feature.name,
      type,
      price: item.price,
      sorted: index + 1,
      active: true,
      isDefault: type === "standard",
    }));
  };

  const onPdfClick = async (record: PaymentHistoryType) => {
    try {
      const data = await fetchReceiptByLicenseId(record.license.id);
      const receiptData: ReceiptDataType = {
        logo: data.logo,
        address: data.address,
        tableOrder: {
          createdAt: record.createdAt,
          orderNo: data.tableOrder.orderNo,
          paymentMethod: data.tableOrder.paymentMethod?.nameEn ?? "",
          status: data.tableOrder.status?.nameEn ?? "",
        },
        tableFeatures: {
          standardBasePrice: Number(data.tableFeatures.standardBasePrice),
          vatPercent: Number(data.tableFeatures.vatPercent),
          totalVat: Number(data.tableFeatures.totalVat),
          totalPrice:
            Number(data.tableFeatures.totalPriceWithVat) -
            Number(data.tableFeatures.totalVat),
          totalPriceWithVat: Number(data.tableFeatures.totalPriceWithVat),
          groupedData: {
            standard: mapFeatures(
              data.tableFeatures.groupedData.standard,
              "standard"
            ),
            optional: mapFeatures(
              data.tableFeatures.groupedData.optional,
              "optional"
            ),
          },
        },
        footerData: { supportEmail: data.footerData.supportEmail },
      };
      await openReceiptPdf(receiptData);
    } catch (error) {
      console.error("Error generating Receipt PDF:", error);
    }
  };

  // Columns
  const Columns: ColumnsType<PaymentHistoryType> = [
    {
      title: "Order no.",
      align: "center",
      dataIndex: "orderNo",
      render: (_, record) => {
        return (
          <Typography.Text>{record.license.orderNo || "-"}</Typography.Text>
        );
      },
    },
    {
      title: "Project name",
      align: "center",
      dataIndex: "project",
      render: (_, record) => {
        return <Typography.Text>{record.project.name || "-"}</Typography.Text>;
      },
    },
    {
      title: "Created date",
      align: "center",
      dataIndex: "createdAt",
      render: (_, record) => {
        return (
          <Typography.Text>
            {record.createdAt
              ? dayjs(record.createdAt).format("DD/MM/YYYY")
              : "-"}
          </Typography.Text>
        );
      },
    },
    {
      title: "Payment Date/Time",
      align: "center",
      dataIndex: "paymentAt",
      render: (_, record) => {
        return (
          <Typography.Text>
            {record.paymentAt
              ? dayjs(record.paymentAt).format("DD/MM/YYYY")
              : "-"}
          </Typography.Text>
        );
      },
    },
    {
      title: "Amount (Baht)",
      align: "center",
      dataIndex: "amount",
      render: (_, record) => {
        return (
          <Typography.Text strong style={{ color: "var(--primary-color)" }}>
            {Number(record.amount).toLocaleString() || "-"}
          </Typography.Text>
        );
      },
    },
    {
      title: "Payment method",
      align: "center",
      dataIndex: "paymentMethod",
      render: (_, record) => {
        return (
          <Typography.Text>
            {record.paymentMethod?.nameEn || "-"}
          </Typography.Text>
        );
      },
    },
    {
      title: "Status",
      align: "center",
      dataIndex: "status",
      render: (_, record) => {
        let color = "";
        let text = "";
        let backgroundColor = "";
        const status = record.paymentStatus?.nameCode;
        switch (status) {
          case "success":
            color = "#38BE43";
            text = record.paymentStatus.nameEn;
            backgroundColor = "#EEFDEF";
            break;
          case "pending":
            color = "#ECA013";
            text = record.paymentStatus.nameEn;
            backgroundColor = "#FFFCF3";
            break;
          case "fail":
            color = "#D73232";
            text = record.paymentStatus.nameEn;
            backgroundColor = "#FEF4F4";
            break;
          default:
            break;
        }
        return (
          <Tag
            style={{
              color: color,
              backgroundColor: backgroundColor,
              padding: "4px 10px",
              fontWeight: 500,
              borderColor: color,
              borderRadius: 6,
            }}
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Receipt",
      align: "center",
      dataIndex: "receipt",
      fixed: "right",
      width: 90,
      render: (_, record) => {
        if (record.paymentStatus.nameCode === "success") {
          return (
            <Button
              icon={<PDFIcon />}
              type="text"
              onClick={() => onPdfClick(record)}
            />
          );
        } else {
          return null;
        }
      },
    },
  ];

  const paymentStatusOptions = [
    { label: "All", value: "" },
    ...(paymentStatusData || []).map((status: PaymentStatusType) => ({
      label: status.nameEn,
      value: status.id,
    })),
  ];

  return (
    <>
      <Header title="Payment history" />
      <Row gutter={10}>
        <Col span={12}>
          <Search
            size="large"
            placeholder="Search by Order no. or Project name"
            onSearch={onSearch}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Select
            onChange={handlePaymentStatusChange}
            size="large"
            placeholder="Filter by status"
            style={{ width: "100%" }}
            options={paymentStatusOptions}
          />
        </Col>
        <Col span={6}>
          <DatePicker
            size="large"
            placeholder="Create date (within 90 days)"
            allowClear
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
          />
        </Col>
      </Row>
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Table
            rowKey="id"
            columns={Columns}
            dataSource={paymentHistoryData?.data}
            loading={isLoading}
            pagination={{
              current: curPage,
              pageSize: pageSize,
              total: paymentHistoryData?.total || 0,
              showSizeChanger: true,
              // showQuickJumper: true,
              // showTotal: (total, range) =>
              //   `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: handlePaginationChange,
              onShowSizeChange: handlePaginationChange,
            }}
            scroll={{ x: "max-content" }}
          />
        </Col>
      </Row>
    </>
  );
};

export default PaymentHistory;
