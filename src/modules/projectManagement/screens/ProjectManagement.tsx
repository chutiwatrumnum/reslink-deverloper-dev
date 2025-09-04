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
} from "antd";
import CreateProjectModal from "../components/modals/CreateProjectModal";
import EditProjectModal from "../components/modals/EditProjectModal";
import { callConfirmModal } from "../../../components/common/Modal";
// Types
import type { TabsProps } from "antd";
import type { ColumnsType } from "antd/es/table";
// Data & APIs
import type {
  ProjectFromDataType,
  ProjectManageType,
  ProjectResponse,
} from "../../../stores/interfaces/ProjectManage";
// Icons
import {
  EditOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  PictureOutlined,
} from "@ant-design/icons";
// APIs & Data
import {
  useProjectManagementQuery,
  useProjectByIdQuery,
  useFeaturesByProjectIdQuery,
  useFeaturesAndProjectByIdQuery,
} from "../../../utils/queriesGroup/projectManagementQueries";
import { useDeleteProjectManagementMutation } from "../../../utils/mutationsGroup/projectManagement";

const ProjectManagement = () => {
  const { perPage, pageSizeOptions } = usePagination({
    initialPage: 1,
    initialPerPage: 10,
  });

  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [approvedPage, setApprovedPage] = useState(1);
  const [unapprovedPage, setUnapprovedPage] = useState(1);
  const [search, setSearch] = useState<string>("");

  const [selectedInfo, setSelectedInfo] = useState<ProjectResponse | null>(
    null
  );
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

  const [dataEdit, setDataEdit] = useState();

  // Mutations
  const deleteMutation = useDeleteProjectManagementMutation();

  const { data: projectByIdData } = useProjectByIdQuery(
    selectedProjectId?.toString()
  );
  const { data: featuresByProjectId } = useFeaturesByProjectIdQuery(
    selectedProjectId?.toString()
  );
  const { data: featureAndProjectById } = useFeaturesAndProjectByIdQuery(
    selectedProjectId?.toString()
  );

  const dataById = projectByIdData || selectedInfo;
  const dataFeatureByProjectId = featuresByProjectId || selectedInfo;

  const projectData = featureAndProjectById?.project || selectedInfo;
  const licenseData = featureAndProjectById?.licenses || selectedInfo;

  const [currentStep, setCurrentStep] = useState<number>(1);

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
  const onInfo = (record: ProjectResponse) => {
    setSelectedInfo(record);
    setSelectedProjectId(String(record.project?.id));
    setIsInfoProjectModalOpen(true);
  };
  const onInfoCancel = () => {
    setIsInfoProjectModalOpen(false);
    setSelectedInfo(null);
    setSelectedProjectId(null);
  };

  // 🪧🖋️ Edit project form Modal
  const onEditProject = async (data: any) => {
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
    const licenses = featureAndProjectById?.result?.licenses || [];
    const license = licenses.find((i) => i.projectId === projectId);

    if (!projectId) {
      message.error("Project ID not found");
      return;
    }

    if (record.status?.nameCode === "waiting_payment") {
      if (!license) {
        message.error("License not found for this project");
        return;
      }
      setLicenseId(license.licenseId.toString());
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

  // const onPackageContinue = (id, currentStep) => {};

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
      key: "status",
      dataIndex: "status",
      align: "center",
      render: (_, record) => {
        let color = "#fff";
        let backgroundColor = "#fff";
        let text = record?.status?.nameCode;
        const status = record?.status?.nameCode;
        if (status === "activated") {
          color = "#38BE43";
          backgroundColor = "#E6F9E6";
          text = "Activated";
        } else if (status === "draft_project") {
          color = "#D73232";
          backgroundColor = "#FFE3E3";
          text = "Draft Project";
        } else if (status === "pending") {
          color = "#ECA013";
          backgroundColor = "#FFF7DA";
          text = "Pending";
        } else if (status === "waiting_payment") {
          color = "#d4380d";
          backgroundColor = "#fff2e8";
          text = "Waiting for payment";
        } else if (status === "expired") {
          color = "#D73232";
          backgroundColor = "#FFE3E3";
          text = "Expired";
        }
        return (
          <Tag
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
            <p style={{ margin: 0 }}>
              <span>{fullName === null || "" ? fullName : "-"}</span>
            </p>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record?.createdBy?.role?.name || ""}
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
        const status = record?.status?.nameCode;
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
        switch (status) {
          case "draft_project":
          case "waiting_payment":
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
          case "pending":
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
          case "expired":
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
      activated: {
        color: "#38BE43",
        backgroundColor: "#E6F9E6",
        text: "Activated",
      },
      draft_project: {
        color: "#D73232",
        backgroundColor: "#FFE3E3",
        text: "Draft Project",
      },
      pending: {
        // Updated to match API
        color: "#ECA013",
        backgroundColor: "#FFF7DA",
        text: "Pending",
      },
      waiting_payment: {
        color: "#d4380d",
        backgroundColor: "#fff2e8",
        text: "Waiting for payment",
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

  // Then use it in your JSX:
  const statusStyle = getStatusStyle(dataById?.status?.nameCode);

  // const filteredData =
  //   projectData?.rows?.filter((project) => {
  //     const status = project?.status?.nameCode;
  //     if (isApproved) {
  //       return status === "activated";
  //     } else {
  //       return (
  //         status === "draft_project" ||
  //         status === "pending" ||
  //         status === "waiting_payment"
  //       );
  //     }
  //   }) || [];

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
        width={"80%"}
        open={isInfoProjectModalOpen}
        onCancel={onInfoCancel}
        title="Information"
        footer={false}
        centered={true}
      >
        {projectData ? (
          <Row gutter={24} style={{ marginTop: 24 }}>
            {/* Image and Logo Info */}
            <Col span={4}>
              <Flex vertical={true} gap={6} style={{ marginBottom: 16 }}>
                <Text strong>Project image</Text>
                {!projectData?.image ? (
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
                      src={projectData?.image}
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
                {!projectData?.logo ? (
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
                      src={projectData?.logo}
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
            <Col span={10}>
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
                        <Text>{projectData?.name || "-"}</Text>
                      </Flex>
                    </Col>
                    <Col span={8}>
                      <Flex vertical={true} gap={6}>
                        <Text strong>Road</Text>
                        <Text>{projectData?.road || "-"}</Text>
                      </Flex>
                    </Col>
                    <Col span={8}>
                      <Flex vertical={true} gap={6}>
                        <Text strong>Email</Text>
                        <Text></Text>
                      </Flex>
                    </Col>
                  </Row>
                  <Row gutter={8} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                      <Flex vertical={true} gap={6}>
                        <Text strong>Project type</Text>
                        <Text>{projectData?.type?.nameEn || "-"}</Text>
                      </Flex>
                    </Col>
                    <Col span={8}>
                      <Flex vertical={true} gap={6}>
                        <Text strong>Soi</Text>
                        <Text>{projectData?.subStreet || "-"}</Text>
                      </Flex>
                    </Col>
                    <Col span={8}>
                      <Flex vertical={true} gap={6}>
                        <Text strong>Map</Text>
                        {projectData?.lat && projectData?.long && (
                          <Button
                            size="small"
                            type="link"
                            onClick={() =>
                              onViewMap(projectData?.lat, projectData?.long)
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
                        <Text strong>Province</Text>
                        <Text>{projectData.project?.province || "-"}</Text>
                      </Flex>
                    </Col>
                    <Col span={8}>
                      <Flex vertical={true} gap={6}>
                        <Text strong>Address</Text>
                        <Text>{projectData.project?.address || "-"}</Text>
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
                        <Text strong>District</Text>
                        <Text>{projectData?.district || "-"}</Text>
                      </Flex>
                    </Col>
                    <Col span={8}>
                      <Flex vertical={true} gap={6}>
                        <Text strong>Postal code</Text>
                        <Text>{projectData?.zipCode || "-"}</Text>
                      </Flex>
                    </Col>
                  </Row>
                  <Row gutter={8}>
                    <Col span={8}>
                      <Flex vertical={true} gap={6}>
                        <Text strong>Sub-district</Text>
                        <Text>{projectData?.subdistrict || "-"}</Text>
                      </Flex>
                    </Col>
                    <Col span={8}>
                      <Flex vertical={true} gap={6}>
                        <Text strong>Phone number</Text>
                        <Text>{projectData?.contactNumber || "-"}</Text>
                      </Flex>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            {/* Standard package and Optional feature preview */}
            <Col span={10}>
              <Flex vertical={true} gap={6}>
                {licenseData ? (
                  <Text style={{ fontWeight: 600 }}>
                    Current package:{" "}
                    {`Standard + ${
                      licenseData[0]?.optionalFeatureLength || 0
                    } optional features`}
                  </Text>
                ) : (
                  <Text style={{ fontWeight: 600 }}>Current package: 0</Text>
                )}
                {dataFeatureByProjectId?.features ? (
                  <></>
                ) : (
                  <Flex
                    justify="center"
                    align="center"
                    style={{
                      padding: "50px",
                      border: "1px solid #C6C8C9",
                      borderRadius: 8,
                    }}
                  >
                    <Empty />
                  </Flex>
                )}
              </Flex>
            </Col>
          </Row>
        ) : (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Empty />
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProjectManagement;
