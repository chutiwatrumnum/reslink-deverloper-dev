import { useState } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";
// Components
import Header from "../../../components/templates/Header";
import ConfirmModal from "../../../components/common/ConfirmModal";
import {
  Row,
  Col,
  Input,
  Button,
  Flex,
  Tabs,
  Table,
  Image,
  Typography,
  Tag,
  message,
  Modal,
  Collapse,
  Empty,
  Skeleton,
  Space,
  Spin,
} from "antd";
import CreateProjectModal from "../components/modals/CreateProjectModal";
import EditProjectModal from "../components/modals/EditProjectModal";
import { callConfirmModal } from "../../../components/common/Modal";
// Types
import type { TabsProps, CollapseProps } from "antd";
import type { ColumnsType } from "antd/es/table";
// Data & APIs
import type { ProjectManageType } from "../../../stores/interfaces/ProjectManage";
// Icons
import {
  EditOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ContainerOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
// APIs & Data
import {
  useProjectManagementQuery,
  useProjectByIdQuery,
  useFeatureByProjectIdQuery,
  useFeaturesAndProjectByIdQuery,
} from "../../../utils/queriesGroup/projectManagementQueries";
import { useDeleteProjectManagementMutation } from "../../../utils/mutationsGroup/projectManagement";
import "../styles/projectManagement.css";

const ProjectManagement = () => {
  const { perPage, pageSizeOptions } = usePagination({
    initialPage: 1,
    initialPerPage: 10,
  });

  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [approvedPage, setApprovedPage] = useState(1);
  const [unapprovedPage, setUnapprovedPage] = useState(1);
  const [search, setSearch] = useState<string>("");

  const [selectedRecord, setSelectedRecord] =
    useState<ProjectManageType | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | number | null
  >(null);

  // Query for approved (activated: true)
  const {
    data: approvedProjectData,
    isLoading: approvedProjectLoading,
    refetch: refetchApprovedProject,
  } = useProjectManagementQuery({
    activated: true,
    curPage: approvedPage,
    perPage,
    search,
  });

  // Query for unapproved (activated: false)
  const {
    data: unapprovedProjectData,
    isLoading: unapprovedProjectLoading,
    refetch: refetchUnapprovedProject,
  } = useProjectManagementQuery({
    activated: false,
    curPage: unapprovedPage,
    perPage,
    search,
  });

  const currentProjectData = isApproved
    ? approvedProjectData
    : unapprovedProjectData;

  const currentLoading = isApproved
    ? approvedProjectLoading
    : unapprovedProjectLoading;
  const currentPage = isApproved ? approvedPage : unapprovedPage;

  const currentDataSource = isApproved
    ? currentProjectData?.rows?.filter((project) => {
        const status = project?.status?.nameCode;
        return status === "activated";
      }) || []
    : currentProjectData?.rows?.filter((project) => {
        const status = project?.status?.nameCode;
        return (
          status === "draft_project" ||
          status === "pending" ||
          status === "waiting_payment"
        );
      }) || [];

  const currentTotal = (() => {
    const total = currentProjectData?.total ?? 0;
    const currentPageSize = currentProjectData?.rows?.length ?? 0;
    const filteredPageSize = currentDataSource.length;

    if (currentPageSize > 0 && filteredPageSize / currentPageSize < 0.5) {
      return filteredPageSize;
    }
    return total;
  })();

  const onPageChange = (page: number) => {
    if (isApproved) {
      setApprovedPage(page);
    } else {
      setUnapprovedPage(page);
    }
  };

  // Mutations
  const deleteMutation = useDeleteProjectManagementMutation();

  const { data: featureByProjectId, isLoading: infoLoading } =
    useFeatureByProjectIdQuery(selectedRecord?.id?.toString());

  const licenseData = featureByProjectId || [];

  // Access the first license (most common case)
  const primaryLicense = licenseData[0];

  // const dataById = projectByIdData || selectedInfo;
  // const dataFeatureByProjectId = featuresByProjectId || selectedInfo;

  // const projectData = featureAndProjectById?.project || selectedInfo;
  // const licenseData = featureAndProjectById?.licenses || selectedInfo;

  const [currentStep, setCurrentStep] = useState<number>(1);

  const [dataEdit, setDataEdit] = useState<ProjectManageType>();

  // Modal states
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState<boolean>(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] =
    useState<boolean>(false);
  const [isInfoProjectModalOpen, setIsInfoProjectModalOpen] =
    useState<boolean>(false);

  const [refresh, setRefresh] = useState<boolean>(false);

  // Ant component configuration
  const { Text } = Typography;

  // Search
  const { Search } = Input;
  const onSearch = (value: string) => {
    setSearch(value);
  };

  // Tab configuration
  const items: TabsProps["items"] = [
    { key: "approved", label: "My project" },
    { key: "unapproved", label: "Waiting for approve" },
  ];

  const onTabsChange = (key: string) => {
    setIsApproved(key === "approved");
    if (key === "approved") {
      setApprovedPage(1);
    } else {
      setUnapprovedPage(1);
    }
  };
  // 🪧➕ Request new project Modal
  const onCreate = () => {
    setIsCreateProjectModalOpen(true);
    setProjectId(null);
    setLicenseId(null);
    setCurrentStep(1);
  };
  const onCreateCancel = () => {
    setIsCreateProjectModalOpen(false);
    setCurrentStep(1);
    setProjectId(null);
    setLicenseId(null);
  };

  // 🪧📋 Info project Modal
  const onInfo = (record: ProjectManageType) => {
    setSelectedRecord(record);
    // setSelectedProjectId(String(record.project?.id));
    setIsInfoProjectModalOpen(true);
  };
  const onInfoCancel = () => {
    setIsInfoProjectModalOpen(false);
    setSelectedRecord(null);
  };

  // 🪧🖋️ Edit project form Modal
  const onEditProject = async (data: ProjectManageType) => {
    setDataEdit(data);
    setIsEditProjectModalOpen(true);
  };
  const onEditProjectOk = () => {
    setIsEditProjectModalOpen(false);
  };
  const onEditProjectCancel = () => {
    setIsEditProjectModalOpen(false);
  };

  const onRefresh = () => {
    setRefresh(!refresh);
    refetchApprovedProject();
    refetchUnapprovedProject();
  };

  const [projectId, setProjectId] = useState<string | null>(null);

  const [licenseId, setLicenseId] = useState<string | null>(null);

  const onContinue = (record: ProjectManageType) => {
    const projectId = record.id;
    // const licenses = featureAndProjectById?.result?.licenses || [];
    // const license = licenses.find((i) => i.projectId === projectId);
    const licId = record?.licenseId ?? null;
    if (!projectId) {
      message.error("Project ID not found");
      return;
    }

    if (record.status?.nameCode === "waiting_payment") {
      if (!licId) {
        message.error("no license pending payment");
        return;
      }
      // setLicenseId(license.licenseId.toString());
      setLicenseId(licId);
      setCurrentStep(3);
    } else if (record.status?.nameCode === "draft_project") {
      setProjectId(projectId.toString());
      setCurrentStep(2);
    } else {
      setProjectId(projectId.toString());
      setCurrentStep(1);
    }

    setIsCreateProjectModalOpen(true);
  };
  // Map click
  const onViewMap = (
    lat: number | string | undefined,
    lng: number | string | undefined
  ) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const showDeleteUnverifiedConfirm = (record: ProjectManageType) => {
    callConfirmModal({
      title: `Delete ${record.name}`,
      message: `Do you really want to delete ${record.name}?`,
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        if (record.id) {
          const deleteId = record.id;
          deleteMutation.mutate(
            { id: deleteId! },
            {
              onSuccess: () => {
                refetchApprovedProject();
                refetchUnapprovedProject();
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

  // Table
  const columns: ColumnsType<ProjectManageType> = [
    {
      title: "Logo project",
      key: "logo",
      dataIndex: "logo",
      align: "center",
      render: (_, record) => (
        <>
          {!record?.logo ? (
            <Flex
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 8,
                width: 180,
                height: 120,
                margin: "auto",
              }}
              justify="center"
              align="center"
            >
              <PictureOutlined style={{ fontSize: 36, color: "#bfbfbf" }} />
            </Flex>
          ) : (
            <Image
              src={record?.logo}
              height={120}
              style={{
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          )}
        </>
      ),
    },
    {
      title: "Project image",
      key: "image",
      dataIndex: "image",
      align: "center",
      render: (_, record) => (
        <>
          {!record?.image ? (
            <Flex
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 8,
                width: 180,
                height: 120,
                margin: "auto",
              }}
              justify="center"
              align="center"
            >
              <PictureOutlined style={{ fontSize: 36, color: "#bfbfbf" }} />
            </Flex>
          ) : (
            <Image
              src={record?.image}
              height={120}
              style={{
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          )}
        </>
      ),
    },
    {
      title: "Project name",
      align: "center",
      render: (_, record) => {
        return <div>{record.name || "-"}</div>;
      },
    },
    {
      title: "Status",
      key: "statusDisplay",
      dataIndex: "statusDisplay",
      align: "center",
      render: (_, record) => {
        let color = "";
        let backgroundColor = "";
        let text = "";
        let icon = <CheckCircleOutlined />;
        const status = record?.statusDisplay;
        if (status === "Activated") {
          color = "#38BE43";
          backgroundColor = "#E6F9E6";
          text = "Activated";
          icon = <CheckCircleOutlined />;
        } else if (status === "Draft project") {
          color = "#34495d";
          backgroundColor = "#f6f6f6";
          text = "Draft project";
          icon = <ContainerOutlined />;
        } else if (status === "Pending activate") {
          color = "#ECA013";
          backgroundColor = "#FFF7DA";
          text = "Pending";
          icon = <ExclamationCircleOutlined />;
        } else if (status === "Waiting for payment") {
          color = "#d4380d";
          backgroundColor = "#fff2e8";
          text = "Waiting for payment";
          icon = <ClockCircleOutlined />;
        } else if (status === "inactive") {
          color = "#D73232";
          backgroundColor = "#FFE3E3";
          text = "Inactive";
          icon = <CloseCircleOutlined />;
        }
        return (
          <Tag
            icon={icon}
            style={{
              color,
              backgroundColor,
              borderColor: color,
              margin: 0,
            }}
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Created by",
      key: "createdBy",
      dataIndex: "createdBy",
      align: "center",
      render: (_, record) => {
        const fullName = `${record?.createdBy?.givenName} ${record?.createdBy?.familyName}`;
        return (
          <Flex vertical={true}>
            <p style={{ margin: 0, textTransform: "capitalize" }}>
              <span>{fullName || "-"}</span>
            </p>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record?.createdBy?.role?.name || "-"}
            </Text>
          </Flex>
        );
      },
    },
    {
      title: "Location",
      align: "center",
      render: (_, record) => {
        if (!record?.lat || !record?.long) return "-";

        return (
          <Button
            size="small"
            type="link"
            onClick={() => onViewMap(record?.lat, record?.long)}
            style={{ border: `1px solid var(--secondary-color)`, fontSize: 12 }}
          >
            Google map
          </Button>
        );
      },
    },
    {
      title: "Package",
      key: "active",
      dataIndex: "active",
      align: "center",
      render: (_, record) => {
        const active = record?.active;
        const status = record?.statusDisplay;
        if (active === true) {
          return (
            <Tag
              style={{
                color: "#38BE43",
                backgroundColor: "#E6F9E6",
                borderColor: "#38BE43",
                margin: 0,
              }}
            >
              Success
            </Tag>
          );
        }
        // if (active === false) {
        //   return (
        //     <Tag
        //       style={{
        //         color: "#D73232",
        //         backgroundColor: "#FFE3E3",
        //         borderColor: "#D73232",
        //         margin: 0,
        //       }}
        //       // icon={<CloseCircleOutlined />}
        //     >
        //       Inactive
        //     </Tag>
        //   );
        // }
        switch (status) {
          case "Draft project":
          case "Waiting for payment":
            return (
              <Button
                size="small"
                type="primary"
                onClick={() => onContinue(record)}
                style={{ fontSize: 12 }}
              >
                Continue
              </Button>
            );
          case "Pending activate":
            return (
              <Button
                size="small"
                type="primary"
                disabled
                style={{ fontSize: 12 }}
              >
                Continue
              </Button>
            );
          case "Expired":
            return (
              <Tag
                style={{
                  color: "#D73232",
                  backgroundColor: "#FFE3E3",
                  borderColor: "#D73232",
                  margin: 0,
                }}
              >
                Expired
              </Tag>
            );
          default:
            return null;
        }
      },
    },
    {
      title: "Action",
      align: "center",
      fixed: "right",
      width: 130,
      render: (_, record) => {
        return (
          <Row justify={"center"}>
            <Col>
              <Button
                onClick={() => onInfo(record)}
                type="text"
                icon={
                  <InfoCircleOutlined
                    style={{ fontSize: 18, color: "#403d38" }}
                  />
                }
              />
            </Col>
            <Col>
              <Button
                type="text"
                onClick={() => onEditProject(record)}
                icon={
                  <EditOutlined style={{ fontSize: 18, color: "#403d38" }} />
                }
              />
            </Col>
            <Col>
              <Button
                type="text"
                onClick={() => showDeleteUnverifiedConfirm(record)}
                icon={
                  <DeleteOutlined style={{ fontSize: 18, color: "#403d38" }} />
                }
              />
            </Col>
          </Row>
        );
      },
    },
  ];

  const getStatusStyle = (status: string) => {
    const statusMap: any = {
      Activated: {
        color: "#38BE43",
        backgroundColor: "#E6F9E6",
        text: "Activated",
      },
      "Draft Project": {
        color: "#34495d",
        backgroundColor: "#FFF7DA",
        text: "Draft Project",
      },
      "Pending activated": {
        color: "#ECA013",
        backgroundColor: "#FFF7DA",
        text: "Pending",
      },
      "Waiting for payment": {
        color: "#d4380d",
        backgroundColor: "#fff2e8",
        text: "Waiting for payment",
      },
      inactive: {
        color: "#D73232",
        backgroundColor: "#FFE3E3",
        text: "Inactive",
      },
    };

    return (
      statusMap[status] || {
        color: "#666",
        backgroundColor: "#f0f0f0",
        text: status,
      }
    );
  };
  const statusStyle = getStatusStyle(selectedRecord?.statusDisplay);
  return (
    <>
      <Header title="Project management" />
      <Row style={{ marginTop: 24 }}>
        <Col span={6}>
          <Search
            placeholder="Search by project name"
            allowClear
            onSearch={onSearch}
            className="searchBox"
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={12}></Col>
        <Col span={6}>
          <Button type="primary" onClick={onCreate} style={{ width: "100%" }}>
            Request new project
          </Button>
        </Col>
      </Row>
      <Flex align="center" justify="space-between" style={{ marginTop: 8 }}>
        <Tabs
          defaultActiveKey="approved"
          items={items}
          onChange={onTabsChange}
        />
      </Flex>
      <Row>
        <Col span={24}>
          <Table
            columns={columns}
            loading={currentLoading}
            dataSource={currentDataSource}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: perPage,
              total: currentTotal,
              pageSizeOptions,
              showSizeChanger: false,
              onChange: onPageChange,
            }}
            scroll={{ x: "max-content" }}
          />
        </Col>
      </Row>
      {/* Request new project Modal */}
      <CreateProjectModal
        isCreateModalOpen={isCreateProjectModalOpen}
        onCancel={onCreateCancel}
        onRefresh={onRefresh}
        projectId={projectId}
        licenseId={licenseId}
        initialStep={currentStep}
      />
      {/* Edit project form Modal */}
      <EditProjectModal
        data={dataEdit}
        isEditModalOpen={isEditProjectModalOpen}
        onCancel={onEditProjectCancel}
        onOk={onEditProjectOk}
        onRefresh={onRefresh}
      />
      <Modal
        width={"85%"}
        open={isInfoProjectModalOpen}
        onCancel={onInfoCancel}
        title="Information"
        footer={false}
        centered={true}
        style={{
          maxHeight: "90vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {selectedRecord && (
          <div
            style={{
              maxHeight: "75vh",
              overflowY: "auto",
            }}
          >
            <Row gutter={24} style={{ marginTop: 24 }}>
              {/* Image and Logo Info */}
              <Col span={4}>
                <Flex vertical={true} gap={6} style={{ marginBottom: 16 }}>
                  <Text strong>Project image</Text>
                  {!selectedRecord?.image ? (
                    <Flex
                      style={{
                        backgroundColor: "#f5f5f5",
                        borderRadius: 8,
                        width: "100%",
                        height: 140,
                      }}
                      justify="center"
                      align="center"
                    >
                      <PictureOutlined
                        style={{ fontSize: 36, color: "#bfbfbf" }}
                      />
                    </Flex>
                  ) : (
                    <>
                      <Image
                        height={"100%"}
                        src={selectedRecord?.image}
                        style={{
                          objectFit: "contain",
                          borderRadius: 8,
                          border: "1px solid #C6C8C9",
                        }}
                      />
                    </>
                  )}
                </Flex>
                <Flex vertical={true} gap={6}>
                  <Text strong>Logo project</Text>
                  {!selectedRecord?.logo ? (
                    <Flex
                      style={{
                        backgroundColor: "#f5f5f5",
                        borderRadius: 8,
                        width: "100%",
                        height: 140,
                      }}
                      justify="center"
                      align="center"
                    >
                      <PictureOutlined
                        style={{ fontSize: 36, color: "#bfbfbf" }}
                      />
                    </Flex>
                  ) : (
                    <>
                      <Image
                        height={"100%"}
                        src={selectedRecord?.logo}
                        style={{
                          objectFit: "contain",
                          borderRadius: 8,
                          border: "1px solid #C6C8C9",
                        }}
                      />
                    </>
                  )}
                </Flex>
              </Col>
              {/* Text Info */}
              <Col span={9}>
                <Row style={{ marginBottom: 6 }}>
                  <Col span={24}>
                    <Text style={{ fontWeight: 600 }}>Project information</Text>
                  </Col>
                </Row>
                <Row
                  style={{
                    border: "1px solid #C6C8C9",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <Col span={24}>
                    <Row gutter={8} style={{ marginBottom: 24 }}>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Project name</Text>
                          <Text>{selectedRecord?.name || "-"}</Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Country</Text>
                          <Text>{selectedRecord?.country || "-"}</Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Phone</Text>
                          <Text>{selectedRecord?.contactNumber || "-"}</Text>
                        </Flex>
                      </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: 24 }}>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Project type</Text>
                          <Text>{selectedRecord?.type?.nameEn || "-"}</Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Province</Text>
                          <Text>{selectedRecord?.province || "-"}</Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Map</Text>
                          {selectedRecord?.lat && selectedRecord?.long && (
                            <Button
                              size="small"
                              type="link"
                              onClick={() =>
                                onViewMap(
                                  selectedRecord?.lat,
                                  selectedRecord?.long
                                )
                              }
                              style={{
                                border: `1px solid var(--secondary-color)`,
                                fontSize: 12,
                                padding: "2px 8px",
                              }}
                            >
                              View Map
                            </Button>
                          )}
                        </Flex>
                      </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: 24 }}>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Address</Text>
                          <Text>{selectedRecord?.address || "-"}</Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>District</Text>
                          <Text>{selectedRecord.district || "-"}</Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Status</Text>
                          <Tag
                            style={{
                              color: statusStyle.color,
                              backgroundColor: statusStyle.backgroundColor,
                              borderColor: statusStyle.color,
                              textAlign: "center",
                              margin: 0,
                              padding: 2,
                            }}
                          >
                            {statusStyle.text}
                          </Tag>
                        </Flex>
                      </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: 24 }}>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Soi</Text>
                          <Text>{selectedRecord?.subStreet || "-"}</Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Sub-district</Text>
                          <Text>{selectedRecord?.subdistrict || "-"}</Text>
                        </Flex>
                      </Col>
                    </Row>
                    <Row gutter={8}>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Road</Text>
                          <Text>{selectedRecord?.road || "-"}</Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong>Postal code</Text>
                          <Text>{selectedRecord?.zipCode || "-"}</Text>
                        </Flex>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
              {/* Standard package and Optional feature preview */}
              <Col span={11}>
                <Flex vertical={true} gap={6} style={{ marginBottom: 6 }}>
                  <Text strong>
                    Current package:{" "}
                    {infoLoading ? (
                      <></>
                    ) : (
                      `Standard + ${
                        primaryLicense?.optionalFeatureLength || 0
                      } optional features`
                    )}
                  </Text>
                </Flex>
                {infoLoading ? (
                  <Spin tip="loading">
                    <div
                      style={{
                        width: "100%",
                        height: 120,
                        backgroundColor: "#fafafa",
                      }}
                    ></div>
                  </Spin>
                ) : licenseData.length === 0 ? (
                  <Flex
                    style={{
                      padding: 48,
                      width: "100%",
                      border: "1px solid #c7c9c9",
                      borderRadius: 8,
                    }}
                    justify="center"
                    align="center"
                  >
                    <Empty />
                  </Flex>
                ) : (
                  // Your existing collapse/feature rendering logic
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {/* Standard Features */}
                    <Collapse
                      collapsible="header"
                      defaultActiveKey={["1"]}
                      items={[
                        {
                          key: "1",
                          label: `Standard (License period: ${
                            primaryLicense?.features?.standard?.period || "N/A"
                          })`,
                          children: (
                            <Row gutter={[8, 8]}>
                              {primaryLicense?.features?.standard?.features?.map(
                                (feature, index) => (
                                  <Col span={8} key={index}>
                                    <Flex gap={8} align="center">
                                      <CheckCircleFilled
                                        style={{
                                          color: "var(--success-color)",
                                        }}
                                      />
                                      <Text style={{ margin: 0, fontSize: 12 }}>
                                        {feature.feature.name}
                                      </Text>
                                    </Flex>
                                  </Col>
                                )
                              ) || (
                                <Col span={24}>
                                  <Text>No standard features</Text>
                                </Col>
                              )}
                            </Row>
                          ),
                        },
                      ]}
                    />

                    {/* Optional Features */}
                    {primaryLicense?.features?.optional?.features &&
                      primaryLicense.features.optional.features.length > 0 && (
                        <>
                          {primaryLicense.features.optional.features.map(
                            (feature, index) => (
                              <Collapse
                                key={index}
                                items={[
                                  {
                                    key: index.toString(),
                                    label: `Optional (License period: ${feature.startDate} - ${feature.endDate})`,
                                    children: (
                                      <Row gutter={[8, 8]}>
                                        <Col span={24}>
                                          <Flex gap={8} align="center">
                                            <CheckCircleFilled
                                              style={{
                                                color: "var(--success-color)",
                                              }}
                                            />
                                            <Text
                                              style={{
                                                margin: 0,
                                                fontSize: 12,
                                              }}
                                            >
                                              {feature.feature.name}
                                            </Text>
                                          </Flex>
                                        </Col>
                                      </Row>
                                    ),
                                  },
                                ]}
                              />
                            )
                          )}
                        </>
                      )}
                  </Space>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProjectManagement;
