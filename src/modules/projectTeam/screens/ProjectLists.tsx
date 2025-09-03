import { usePagination } from "../../../utils/hooks/usePagination";
import Header from "../../../components/templates/Header";
import { callConfirmModal } from "../../../components/common/Modal";
import { Row, Col, Input, Button, Table } from "antd";
import dayjs from "dayjs";
// Icons
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

// APIs
import { useProjectTeamManagementListQuery } from "../../../utils/queriesGroup/projectTeamQueries";
import { useDeleteProjectTeamMemberMutation } from "../../../utils/mutationsGroup/projectTeamMutations";

import type { ColumnsType } from "antd/es/table";
import type { ProjectTeamListType } from "../../../stores/interfaces/projectTeam";
import { useState } from "react";
import ProjectListEditModal from "../components/ProjectListEditModal";

const ProjectLists = () => {
  const {
    curPage,
    perPage,
    pageSizeOptions,
    onPageChange,
    deleteAndHandlePagination,
  } = usePagination({
    initialPage: 1,
    initialPerPage: 10,
  });

  const { Search } = Input;

  const scroll: { x?: number | string } = {
    x: "max-content", // ปรับค่าตามความกว้างรวมของคอลัมน์
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<ProjectTeamListType>();
  const [search, setSearch] = useState("");

  // Data
  const {
    data: projectListData,
    isLoading: projectListLoading,
    refetch: refetchProjectList,
  } = useProjectTeamManagementListQuery({
    perPage,
    curPage,
    search,
  });

  const deleteProjectTeamData = useDeleteProjectTeamMemberMutation();

  const onEdit = (record: ProjectTeamListType) => {
    setEditData(record);
    setIsEditModalOpen(true);
  };

  const onEditOk = () => {
    setIsEditModalOpen(false);
  };

  const onEditCancel = () => {
    setIsEditModalOpen(false);
  };

  const onRefresh: VoidFunction = () => {
    refetchProjectList();
  };

  const onSearch = async (value: string) => {
    setSearch(value);
  };

  const showDeleteConfirm = (record: ProjectTeamListType) => {
    callConfirmModal({
      title: "Delete project list?",
      message: "Do you really want to delete this item?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        await deleteAndHandlePagination({
          dataLength: projectListData?.rows?.length ?? 0,
          onDelete: async () => {
            await deleteProjectTeamData.mutateAsync({
              userId: record.userId,
            });
          },
          fetchData: refetchProjectList,
        });
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  const columns: ColumnsType<ProjectTeamListType> = [
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
        <div>{`${record?.givenName} ${record?.middleName ?? ""} ${
          record?.familyName
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
      title: "email",
      key: "email",
      dataIndex: "email",
      align: "center",
    },
    {
      title: "Phone number",
      key: "contact",
      align: "center",
      render: (_, record) => (
        <div>{record?.contact ? record?.contact : "-"}</div>
      ),
    },
    {
      title: "Created date & time",
      key: "createdAt",
      dataIndex: "createdAt",
      align: "center",
      render: (_, record) => (
        <div>
          {record.createdAt !== "-"
            ? dayjs(record.createdAt).format(`DD/MM/YYYY, HH:mm`)
            : "-"}
        </div>
      ),
    },
    {
      title: "Created by",
      key: "createdBy",
      align: "center",
      render: (_, record) => (
        <div>{`${record?.createdByUser?.givenName} ${record?.createdByUser?.familyName}`}</div>
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
              onClick={() => {
                onEdit(record);
              }}
              type="text"
              icon={<EditOutlined style={{ fontSize: 20, color: "#403d38" }} />}
            />
          </Col>
          <Col>
            <Button
              onClick={() => {
                showDeleteConfirm(record);
              }}
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
      <Header title="Project list" />
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
      </Row>
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Table
            dataSource={projectListData?.rows}
            loading={projectListLoading}
            columns={columns}
            scroll={scroll}
            pagination={{
              current: curPage,
              pageSize: perPage,
              total: projectListData?.total,
              pageSizeOptions,
              showSizeChanger: false,
              onChange: onPageChange,
              // showTotal: (total, range) =>
              //   `${range[0]}-${range[1]} of ${total} items`,
            }}
            rowKey={(record) => record.userId}
          />
        </Col>
      </Row>
      <ProjectListEditModal
        isProjectListModalOpen={isEditModalOpen}
        data={editData}
        onOk={onEditOk}
        onCancel={onEditCancel}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default ProjectLists;
