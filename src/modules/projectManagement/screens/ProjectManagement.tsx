import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Components
import Header from "../../../components/templates/Header";
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
  Empty,
} from "antd";
import CreateProjectModal from "../components/modals/CreateProjectModal";
import EditProjectModal from "../components/modals/EditProjectModal";
import { callConfirmModal } from "../../../components/common/Modal";
// Types
import type { TabsProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ProjectManageType } from "../../../stores/interfaces/ProjectManage";
// Icons
import {
  PictureOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ContainerOutlined,
  CheckCircleFilled,
  WarningOutlined,
} from "@ant-design/icons";
import { InfoIcon, TrashIcon, EditIcon } from "../../../assets/icons/Icons";
// APIs & Data
import { useProjectManagementQuery } from "../../../utils/queriesGroup/projectManagementQueries";
import { useDeleteProjectManagementMutation } from "../../../utils/mutationsGroup/projectManagement";
// CSS
import "../styles/projectManagement.css";

const ProjectManagement = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>("");
  const [curPage, setCurPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isApproved, setIsApproved] = useState(true);

  const [selectedRecord, setSelectedRecord] =
    useState<ProjectManageType | null>(null);

  const [dataEdit, setDataEdit] = useState<ProjectManageType | null>(null);

  const {
    data: projectData,
    isLoading: projectLoading,
    refetch: refetchProject,
  } = useProjectManagementQuery({
    active: isApproved,
    curPage: curPage,
    perPage: pageSize,
    search,
  });

  // Mutations
  const deleteMutation = useDeleteProjectManagementMutation();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Modal states
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState<boolean>(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] =
    useState<boolean>(false);
  const [isInfoProjectModalOpen, setIsInfoProjectModalOpen] =
    useState<boolean>(false);

  const [refresh, setRefresh] = useState<boolean>(false);

  const handlePaginationChange = (page: number, size?: number) => {
    // console.log("Pagination change:", { page, size });
    setCurPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurPage(1); // Reset to page 1 when page size changes
    }
  };

  // Ant component configuration
  const { Text } = Typography;

  // Search
  const { Search } = Input;

  const onSearch = (value: string) => {
    setSearch(value.trim());
    setCurPage(1);
  };

  // Tab configuration
  const items: TabsProps["items"] = [
    { key: "approved", label: "My project" },
    { key: "unapproved", label: "Waiting for approve" },
  ];

  const onTabsChange = (key: string) => {
    setCurPage(1);
    if (key === "approved") {
      setIsApproved(true);
    } else {
      setIsApproved(false);
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
    setDataEdit(null);
    setIsEditProjectModalOpen(false);
  };

  const onRefresh = () => {
    setRefresh(!refresh);
    refetchProject();
  };

  // Project id and License id state
  const [projectId, setProjectId] = useState<string | null>(null);
  const [licenseId, setLicenseId] = useState<string | null>(null);

  const onContinue = (record: ProjectManageType) => {
    const projectId = record.id;
    const licId = record?.licenseId ?? null;

    if (!projectId) {
      message.error("Project Id not found");
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
                refetchProject();
              },
            }
          );
        } else {
          console.error("No ID found for delete");
          message.error("Cannot delete: No ID found");
        }
      },
    });
  };

  // Table
  const approvedColumns: ColumnsType<ProjectManageType> = [
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
                borderRadius: 16,
                width: 140,
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
              width={140}
              height={"100%"}
              style={{
                objectFit: "contain",
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
      width: "15%",
      render: (_, record) => (
        <>
          {!record?.image ? (
            <Flex
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 16,
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
        } else if (status === "expired") {
          color = "#FFE3E3";
          backgroundColor = "#D73232";
          text = "Expired";
          icon = <WarningOutlined />;
        }
        return (
          <Tag
            icon={icon}
            style={{
              color,
              backgroundColor,
              borderColor: color,
              margin: 0,
              borderRadius: 6,
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
              {"(" + record?.createdBy?.role?.name + ")" || "-"}
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
            style={{
              border: `1px solid var(--secondary-color)`,
              fontSize: 12,
            }}
            className="buttonMap"
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
            <Text
              style={{
                color: "var(--primary-color)",
              }}
            >
              {record.package}
            </Text>
          );
        }
        switch (status) {
          case "Draft project":
          case "Waiting for payment":
            return (
              <Button
                size="small"
                type="primary"
                onClick={() => onContinue(record)}
                style={{ fontSize: 12 }}
                className="buttonContinue"
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
                className="buttonContinue"
              >
                Continue
              </Button>
            );
          case "expired":
            return (
              <Tag
                style={{
                  color: "#FFE3E3",
                  backgroundColor: "#D73232",
                  borderColor: "#FFE3E3",
                  margin: 0,
                  borderRadius: 8,
                }}
              >
                Expired
              </Tag>
            );
          case "inactive":
            return (
              <Button
                size="small"
                type="primary"
                disabled
                style={{ fontSize: 12 }}
                className="buttonContinue"
              >
                Continue
              </Button>
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
                icon={<InfoIcon style={{ fontSize: 18 }} />}
              />
            </Col>
            <Col>
              <Button
                type="text"
                onClick={() => onEditProject(record)}
                icon={<EditIcon style={{ fontSize: 18 }} />}
              />
            </Col>
            <Col>
              <Button
                type="text"
                onClick={() => showDeleteUnverifiedConfirm(record)}
                icon={<TrashIcon style={{ fontSize: 18 }} />}
              />
            </Col>
          </Row>
        );
      },
    },
  ];

  const unapprovedColumns: ColumnsType<ProjectManageType> = [
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
                borderRadius: 16,
                width: 140,
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
              width={140}
              height={"100%"}
              style={{
                objectFit: "contain",
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
      width: "15%",
      render: (_, record) => (
        <>
          {!record?.image ? (
            <Flex
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 16,
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
        } else if (status === "expired") {
          color = "#FFE3E3";
          backgroundColor = "#D73232";
          text = "Expired";
          icon = <WarningOutlined />;
        }
        return (
          <Tag
            icon={icon}
            style={{
              color,
              backgroundColor,
              borderColor: color,
              margin: 0,
              borderRadius: 6,
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
              {"(" + record?.createdBy?.role?.name + ")" || "-"}
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
            style={{
              border: `1px solid var(--secondary-color)`,
              fontSize: 12,
            }}
            className="buttonMap"
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
                borderRadius: 8,
              }}
            >
              Success
            </Tag>
          );
        }
        switch (status) {
          case "Draft project":
          case "Waiting for payment":
            return (
              <Button
                size="small"
                type="primary"
                onClick={() => onContinue(record)}
                style={{ fontSize: 12 }}
                className="buttonContinue"
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
                className="buttonContinue"
              >
                Continue
              </Button>
            );
          case "expired":
            return (
              <Tag
                style={{
                  color: "#FFE3E3",
                  backgroundColor: "#D73232",
                  borderColor: "#FFE3E3",
                  margin: 0,
                  borderRadius: 8,
                }}
              >
                Expired
              </Tag>
            );
          case "inactive":
            return (
              <Button
                size="small"
                type="primary"
                disabled
                style={{ fontSize: 12 }}
                className="buttonContinue"
              >
                Continue
              </Button>
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
                icon={<InfoIcon style={{ fontSize: 12 }} />}
              />
            </Col>
            <Col>
              <Button
                type="text"
                onClick={() => onEditProject(record)}
                icon={<EditIcon style={{ fontSize: 18 }} />}
              />
            </Col>
            <Col>
              <Button
                type="text"
                onClick={() => showDeleteUnverifiedConfirm(record)}
                icon={<TrashIcon style={{ fontSize: 18 }} />}
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
        text: "Activated",
      },
      "Draft project": {
        color: "var(--gray-color)",
        text: "Draft Project",
      },
      "Pending activate": {
        color: "#ECA013",
        text: "Pending",
      },
      "Waiting for payment": {
        color: "#d4380d",
        text: "Waiting for payment",
      },
      inactive: {
        color: "#D73232",
        text: "Inactive",
      },
      expired: {
        color: "#D73232",
        text: "Expired",
      },
    };

    return (
      statusMap[status] || {
        color: "#666",
        text: status,
      }
    );
  };
  const statusStyle = getStatusStyle(selectedRecord?.statusDisplay);

  // For render features in info modal
  const standardFeatures =
    selectedRecord?.currentActivateFeature?.standard ?? [];
  const optionalFeatures =
    selectedRecord?.currentActivateFeature?.optional ?? [];
  const features = standardFeatures.length > 0 || optionalFeatures.length > 0;

  return (
    <>
      <Header title="Project management" />
      <Row style={{ marginTop: 24 }}>
        <Col span={6}>
          <Search
            size="large"
            placeholder="Search by project name"
            allowClear
            onSearch={onSearch}
            className="searchBox"
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={12}></Col>
        <Col span={6}>
          <Button
            type="primary"
            onClick={onCreate}
            style={{ width: "100%" }}
            className="createProjectButton"
            size="large"
          >
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
            columns={isApproved ? approvedColumns : unapprovedColumns}
            loading={projectLoading}
            dataSource={projectData?.rows || []}
            rowKey="id"
            pagination={{
              current: curPage,
              pageSize: pageSize,
              total: projectData?.total || 0,
              showSizeChanger: true,
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
      {/* Modal Info */}
      <Modal
        width={"85%"}
        open={isInfoProjectModalOpen}
        onCancel={onInfoCancel}
        title="Information"
        footer={false}
        centered={true}
        className="infoModal"
      >
        {selectedRecord && (
          <div
            style={{
              overflowX: "hidden",
              height: "60dvh",
            }}
          >
            <Row gutter={24} style={{ marginTop: 24 }}>
              {/* Image and Logo Info */}
              <Col span={4}>
                <Flex vertical={true} gap={6} style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: "var(--primary-color)" }}>
                    Project image
                  </Text>
                  {!selectedRecord?.image ? (
                    <Flex
                      style={{
                        backgroundColor: "#f5f5f5",
                        borderRadius: 16,
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
                          borderRadius: 16,
                          border: "1px solid #C6C8C9",
                        }}
                      />
                    </>
                  )}
                </Flex>
                <Flex vertical={true} gap={6}>
                  <Text strong style={{ color: "var(--primary-color)" }}>
                    Logo project
                  </Text>
                  {!selectedRecord?.logo ? (
                    <Flex
                      style={{
                        backgroundColor: "#f5f5f5",
                        borderRadius: 16,
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
                          borderRadius: 16,
                          border: "1px solid #C6C8C9",
                        }}
                      />
                    </>
                  )}
                </Flex>
              </Col>
              {/* Project Info */}
              <Col span={9}>
                <Row style={{ marginBottom: 6 }}>
                  <Col span={24}>
                    <Text
                      style={{ fontWeight: 600, color: "var(--primary-color)" }}
                    >
                      Project information
                    </Text>
                  </Col>
                </Row>
                <Row
                  style={{
                    border: "1px solid #C6C8C9",
                    borderRadius: 16,
                    padding: 12,
                    height: "100%",
                  }}
                >
                  <Col span={24}>
                    <Row
                      gutter={8}
                      style={{
                        marginBottom: 24,
                      }}
                    >
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Project name
                          </Text>
                          <Text className="customTextInfo">
                            {selectedRecord?.name || "-"}
                          </Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Country
                          </Text>
                          <Text className="customTextInfo">
                            {selectedRecord?.country || "-"}
                          </Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Phone
                          </Text>
                          <Text className="customTextInfo">
                            {selectedRecord?.contactNumber || "-"}
                          </Text>
                        </Flex>
                      </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: 24 }}>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Project type
                          </Text>
                          <Text className="customTextInfo">
                            {selectedRecord?.type?.nameEn || "-"}
                          </Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Province
                          </Text>
                          <Text className="customTextInfo">
                            {selectedRecord?.province || "-"}
                          </Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Map
                          </Text>
                          {selectedRecord?.lat && selectedRecord?.long && (
                            <Button
                              size="middle"
                              type="link"
                              onClick={() =>
                                onViewMap(
                                  selectedRecord?.lat,
                                  selectedRecord?.long
                                )
                              }
                              className="buttonMapInfo"
                            >
                              Google map
                            </Button>
                          )}
                        </Flex>
                      </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: 24 }}>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Address
                          </Text>
                          <Text className="customTextInfo">
                            {selectedRecord?.address || "-"}
                          </Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            District
                          </Text>
                          <Text className="customTextInfo">
                            {selectedRecord.district || "-"}
                          </Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Status
                          </Text>
                          <Text
                            style={{
                              color: statusStyle.color,
                              fontWeight: 600,
                            }}
                          >
                            {statusStyle.text}
                          </Text>
                        </Flex>
                      </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: 24 }}>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Soi
                          </Text>
                          <Text className="customTextInfo">
                            {selectedRecord?.subStreet || "-"}
                          </Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Sub-district
                          </Text>
                          <Text className="customTextInfo">
                            {selectedRecord?.subdistrict || "-"}
                          </Text>
                        </Flex>
                      </Col>
                    </Row>
                    <Row gutter={8}>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Road
                          </Text>
                          <Text className="customTextInfo">
                            {selectedRecord?.road || "-"}
                          </Text>
                        </Flex>
                      </Col>
                      <Col span={8}>
                        <Flex vertical={true} gap={6}>
                          <Text strong className="customTextInfo">
                            Postal code
                          </Text>
                          <Text className="customTextInfo">
                            {selectedRecord?.zipCode || "-"}
                          </Text>
                        </Flex>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
              {/* Standard package and Optional feature preview */}
              <Col span={11}>
                <Flex vertical={true} style={{ marginBottom: 6 }}>
                  <Text strong style={{ color: "var(--primary-color)" }}>
                    Features available
                  </Text>
                </Flex>
                <Flex
                  style={{
                    border: "1px solid #C6C8C9",
                    borderRadius: 16,
                    padding: 12,
                    height: "100%",
                  }}
                  vertical={true}
                  justify="space-between"
                >
                  {/* Current Activated Features */}
                  {features ? (
                    <Flex vertical gap={12}>
                      {standardFeatures.length > 0 && (
                        <Flex vertical gap={6}>
                          <Text
                            style={{
                              marginBottom: 6,
                              color: "var(--primary-color)",
                            }}
                            strong
                          >
                            Standard
                          </Text>
                          <Row gutter={[10, 10]}>
                            {standardFeatures.map((item, index) => (
                              <Col span={8} key={item.featuresId || index}>
                                <Flex gap={8} align="start">
                                  <CheckCircleFilled
                                    style={{ color: "var(--success-color)" }}
                                  />
                                  <Text
                                    style={{
                                      margin: 0,
                                      fontSize: 12,
                                      color: "var(--primary-color)",
                                    }}
                                  >
                                    {item.feature?.name}
                                  </Text>
                                </Flex>
                              </Col>
                            ))}
                          </Row>
                        </Flex>
                      )}

                      {optionalFeatures.length > 0 && (
                        <Flex vertical gap={6}>
                          <Text
                            style={{
                              marginBottom: 6,
                              color: "var(--primary-color)",
                            }}
                            strong
                          >
                            Optional
                          </Text>
                          <Row gutter={[10, 10]}>
                            {optionalFeatures.map((item, index) => (
                              <Col span={8} key={item.featuresId || index}>
                                <Flex gap={8} align="start">
                                  <CheckCircleFilled
                                    style={{ color: "var(--success-color)" }}
                                  />
                                  <Text
                                    style={{
                                      margin: 0,
                                      fontSize: 12,
                                      color: "var(--primary-color)",
                                    }}
                                  >
                                    {item.feature?.name || "-"}
                                  </Text>
                                </Flex>
                              </Col>
                            ))}
                          </Row>
                        </Flex>
                      )}
                    </Flex>
                  ) : (
                    <Flex
                      vertical={true}
                      justify="center"
                      align="center"
                      style={{ height: "100%" }}
                    >
                      <Empty description={false} />
                      <Text style={{ color: "var(--gray-color)" }}>
                        No features available
                      </Text>
                    </Flex>
                  )}
                  <Row style={{ marginTop: 16 }}>
                    <Col
                      span={24}
                      style={{ display: "flex", justifyContent: "end" }}
                    >
                      <Button
                        onClick={() => {
                          const projectName = selectedRecord?.name || "";
                          navigate(
                            `/dashboard/license?search=${encodeURIComponent(
                              projectName
                            )}`
                          );
                        }}
                        size="middle"
                        type="text"
                        style={{
                          border: "2px solid var(--secondary-color)",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--primary-color)",
                          borderRadius: 8,
                        }}
                      >
                        Check license
                      </Button>
                    </Col>
                  </Row>
                </Flex>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProjectManagement;
