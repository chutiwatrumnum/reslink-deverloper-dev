import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  TimePicker,
  Select,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import FormModal from "../../../components/common/FormModal";
import { callConfirmModal } from "../../../components/common/Modal";
import SmallButton from "../../../components/common/SmallButton";
import UploadImageWithCrop from "../../projectManagement/components/UploadImageWithCrop";

import type {
  DeveloperNewsType,
  DeveloperNewsEditPayload,
} from "../../../stores/interfaces/DeveloperNews";
import { useUpdateDeveloperNewsMutation } from "../../../utils/mutationsGroup/developerNewsMutations";
import "../styles/developerNews.css";

const { TextArea } = Input;

type Props = {
  isEditModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  onRefresh: () => void;
  selectedRecord?: DeveloperNewsType | null;
  projectsData?: Array<{ label: string; value: string }>;
  projectsLoading?: boolean;
};

export default function DeveloperNewsEditModal({
  isEditModalOpen,
  onOk,
  onCancel,
  onRefresh,
  selectedRecord,
  projectsData = [],
  projectsLoading = false,
}: Props) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  // Use mutation
  const updateMutation = useUpdateDeveloperNewsMutation();
  const isSubmitting = updateMutation.isPending;

  useEffect(() => setOpen(isEditModalOpen), [isEditModalOpen]);

  useEffect(() => {
    if (!selectedRecord || !isEditModalOpen) return;

    console.log("🔄 Setting form values for edit modal...");
    console.log("📋 Selected Record:", selectedRecord);

    // Parse dates และ times
    const startDate = selectedRecord.startDate
      ? dayjs(selectedRecord.startDate)
      : null;
    const endDate = selectedRecord.endDate
      ? dayjs(selectedRecord.endDate)
      : null;

    // Extract time จาก datetime
    const startTime = selectedRecord.startDate
      ? dayjs(selectedRecord.startDate)
      : null;
    const endTime = selectedRecord.endDate
      ? dayjs(selectedRecord.endDate)
      : null;

    // Get selected projects - รองรับทั้ง newsToProjects และ projects format
    let selectedProjects: string[] = [];

    // ลองดู newsToProjects ก่อน (API ใหม่)
    if (
      selectedRecord.newsToProjects &&
      selectedRecord.newsToProjects.length > 0
    ) {
      console.log("📋 Using newsToProjects:", selectedRecord.newsToProjects);
      selectedProjects = selectedRecord.newsToProjects
        .map((ntp) => {
          // ตรวจสอบ structure ของ newsToProjects
          if (ntp.project && ntp.project.id) {
            return ntp.project.id; // ใช้ project.id
          } else if (ntp.projectId) {
            return ntp.projectId; // fallback ใช้ projectId
          }
          return null;
        })
        .filter(Boolean); // กรองค่า null/undefined ออก
    }
    // Fallback ไปใช้ projects (format เดิม)
    else if (selectedRecord.projects && selectedRecord.projects.length > 0) {
      console.log("📋 Using projects:", selectedRecord.projects);
      selectedProjects = selectedRecord.projects
        .map((p) => p.projectId)
        .filter(Boolean); // กรองค่า null/undefined ออก
    }

    console.log("📋 Selected Projects IDs:", selectedProjects);
    console.log("📋 Available Project Options:", projectsData);

    console.log("🔄 Setting form values:", {
      title: selectedRecord.title,
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime,
      projects: selectedProjects,
      imageUrl: selectedRecord.imageUrl || "",
    });

    form.setFieldsValue({
      title: selectedRecord.title || "",
      type: "developer_news",
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime,
      projects: selectedProjects, // ตั้งค่า selected projects
      description: selectedRecord.description || "",
      url: selectedRecord.url || "",
      imageUrl: selectedRecord.imageUrl || "", // ใช้ Form.Item name="imageUrl"
    });
  }, [selectedRecord, isEditModalOpen, form, projectsData]);

  const onFinish = (values: any) => {
    if (!selectedRecord?.id) {
      console.error("❌ No selectedRecord.id found");
      message.error("Error: No news ID found");
      return;
    }

    console.log("📝 Form values:", values);
    console.log("📋 Selected record:", selectedRecord);

    callConfirmModal({
      title: "Edit news?",
      message: "Are you sure you want to edit this news?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: () => {
        // ตรวจสอบว่ามี date และ time หรือไม่
        if (!values.startDate || !values.endDate) {
          message.error("Please select both start date and end date");
          return;
        }

        // ตรวจสอบว่ามี projects หรือไม่
        if (!values.projects || values.projects.length === 0) {
          message.error("Please select at least one project");
          return;
        }

        const payload: DeveloperNewsEditPayload = {
          title: values.title,
          description: values.description || "",
          url: values.url || "",
          imageUrl: values.imageUrl || "", // ใช้ imageUrl จาก form values
          startDate: values.startDate
            ? dayjs(values.startDate).format("YYYY-MM-DD")
            : "",
          endDate: values.endDate
            ? dayjs(values.endDate).format("YYYY-MM-DD")
            : "",
          startTime: values.startTime
            ? dayjs(values.startTime).format("HH:mm")
            : undefined,
          endTime: values.endTime
            ? dayjs(values.endTime).format("HH:mm")
            : undefined,
          projects:
            values.projects?.map((id: string) => ({ projectId: id })) || [],
        };

        console.log("🚀 Final payload:", payload);
        console.log("🆔 News ID:", selectedRecord.id);

        updateMutation.mutate(
          { newsId: selectedRecord.id, payload },
          {
            onSuccess: () => {
              console.log("✅ Update successful");
              form.resetFields();
              onOk();
              onRefresh();
            },
            onError: (error) => {
              console.error("❌ Update error:", error);
            },
          }
        );
      },
    });
  };

  const handleClose = () => {
    form.resetFields();
    onCancel();
  };

  const Content = (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="developerNews-form"
      initialValues={{ type: "developer_news" }}>
      <Row gutter={24} className="developerNews-grid">
        <Col span={12} className="developerNews-col-left">
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Please input title!" },
              { max: 200, message: "Title must be less than 200 characters" },
            ]}>
            <Input
              size="large"
              placeholder="Please input Title"
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item label="Type" name="type">
            <Select
              size="large"
              disabled
              options={[{ value: "developer_news", label: "Developer news" }]}
              placeholder="Developer news"
            />
          </Form.Item>

          {/* แก้ไขส่วนนี้ - ใช้ Form.Item กับ name="imageUrl" */}
          <Form.Item
            label="Image"
            name="imageUrl"
            className="developerNews-image-item">
            <UploadImageWithCrop
              aspectRatio={16 / 9}
              disabled={isSubmitting}
              height={220}
              ratio="*File size <1MB, 16:9 ratio (1280x720 px)"
            />
          </Form.Item>
        </Col>

        <Col span={12} className="developerNews-col-right">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Start date"
                name="startDate"
                rules={[
                  { required: true, message: "Please select start date!" },
                ]}>
                <DatePicker
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Select date"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="End date"
                name="endDate"
                rules={[
                  { required: true, message: "Please select end date!" },
                ]}>
                <DatePicker
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Select date"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Start time" name="startTime">
                <TimePicker
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Select time"
                  format="HH:mm"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="End time" name="endTime">
                <TimePicker
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Select time"
                  format="HH:mm"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Select project"
            name="projects"
            rules={[
              {
                required: true,
                message: "Please select at least one project!",
              },
            ]}>
            <Select
              mode="multiple"
              size="large"
              placeholder={
                projectsLoading
                  ? "Loading projects..."
                  : "Please select projects"
              }
              loading={projectsLoading}
              options={projectsData}
              fieldNames={{ label: "label", value: "value" }}
              suffixIcon={<SearchOutlined />}
              showSearch
              allowClear
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={
                projectsLoading ? "Loading..." : "No projects found"
              }
              onSelect={(value, option) => {
                console.log("🎯 Project selected:", { value, option });
              }}
              onDeselect={(value, option) => {
                console.log("❌ Project deselected:", { value, option });
              }}
              onChange={(values) => {
                console.log("🔄 Projects changed:", values);
              }}
              onDropdownVisibleChange={(open) => {
                if (open) {
                  console.log(
                    "📋 Dropdown opened - Current form values:",
                    form.getFieldValue("projects")
                  );
                  console.log("📋 Available options:", projectsData);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label="Announcement body"
            name="description"
            rules={[
              {
                max: 1000,
                message: "Description must be less than 1000 characters",
              },
            ]}>
            <TextArea
              placeholder="Please input announcement body"
              rows={5}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            label="URL"
            name="url"
            rules={[{ type: "url", message: "Please input a valid URL!" }]}
            className="developerNews-url-item">
            <Input size="large" placeholder="https://example.com" />
          </Form.Item>
        </Col>
      </Row>

      <div className="developerNews-actions">
        <SmallButton
          className="saveButton"
          message={isSubmitting ? "Updating..." : "Update"}
          form={form}
          disabled={isSubmitting}
        />
      </div>
    </Form>
  );

  return (
    <FormModal
      isOpen={open}
      title="Edit developer news"
      content={Content}
      onOk={() => {}}
      onCancel={handleClose}
      className="developerNewsFormModal"
      destroyOnClose
      width="840px"
      maskClosable={!isSubmitting}
    />
  );
}
