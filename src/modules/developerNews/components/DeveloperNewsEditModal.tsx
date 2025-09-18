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

  const updateMutation = useUpdateDeveloperNewsMutation();
  const isSubmitting = updateMutation.isPending;

  useEffect(() => setOpen(isEditModalOpen), [isEditModalOpen]);

  useEffect(() => {
    if (!selectedRecord || !isEditModalOpen) return;

    // Parse dates และ times
    const startDate = selectedRecord.startDate
      ? dayjs(selectedRecord.startDate)
      : null;
    const endDate = selectedRecord.endDate
      ? dayjs(selectedRecord.endDate)
      : null;

    // แก้ไข: ตรวจสอบว่า startTime และ endTime มีค่าแยกหรือไม่
    let startTime = null;
    let endTime = null;

    // ถ้ามี startTime/endTime แยกใน record
    if (selectedRecord.startTime) {
      startTime = dayjs(selectedRecord.startTime, "HH:mm");
    } else if (selectedRecord.startDate) {
      const startDateTime = dayjs(selectedRecord.startDate);
      if (startDateTime.hour() !== 0 || startDateTime.minute() !== 0) {
        startTime = startDateTime;
      }
    }

    if (selectedRecord.endTime) {
      endTime = dayjs(selectedRecord.endTime, "HH:mm");
    } else if (selectedRecord.endDate) {
      const endDateTime = dayjs(selectedRecord.endDate);
      if (
        !(endDateTime.hour() === 0 && endDateTime.minute() === 0) &&
        !(endDateTime.hour() === 23 && endDateTime.minute() === 59)
      ) {
        endTime = endDateTime;
      }
    }

    // Get selected projects - รองรับทั้ง newsToProjects และ projects format
    let selectedProjects: string[] = [];

    if (
      selectedRecord.newsToProjects &&
      selectedRecord.newsToProjects.length > 0
    ) {
      selectedProjects = selectedRecord.newsToProjects
        .map((ntp) => {
          if (ntp.project && ntp.project.id) {
            return ntp.project.id;
          } else if (ntp.projectId) {
            return ntp.projectId;
          }
          return null;
        })
        .filter(Boolean);
    } else if (selectedRecord.projects && selectedRecord.projects.length > 0) {
      selectedProjects = selectedRecord.projects
        .map((p) => p.projectId)
        .filter(Boolean);
    }

    form.setFieldsValue({
      title: selectedRecord.title || "",
      type: "developer_news",
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime,
      projects: selectedProjects,
      description: selectedRecord.description || "",
      url: selectedRecord.url || "",
      imageUrl: selectedRecord.imageUrl || "",
    });
  }, [selectedRecord, isEditModalOpen, form, projectsData]);

  const onFinish = (values: any) => {
    if (!selectedRecord?.id) {
      message.error("Error: No news ID found");
      return;
    }

    callConfirmModal({
      title: "Edit news?",
      message: "Are you sure you want to edit this news?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: () => {
        if (!values.startDate || !values.endDate) {
          message.error("Please select both start date and end date");
          return;
        }

        if (!values.projects || values.projects.length === 0) {
          message.error("Please select at least one project");
          return;
        }

        // จัดการ projects - ถ้าเลือก "all" ให้ส่งทุก project ไป
        let projectsToSend = values.projects || [];
        if (projectsToSend.includes("all")) {
          const filteredProjects = projectsData.filter(
            (project) =>
              project.value !== "all" &&
              project.label !== "All" &&
              project.value !== "All" &&
              project.label?.toLowerCase() !== "all"
          );
          projectsToSend = filteredProjects.map((project) => project.value);
        }

        const payload: DeveloperNewsEditPayload = {
          title: values.title,
          description: values.description || "",
          url: values.url || "",
          imageUrl: values.imageUrl || "",
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
          projects: projectsToSend.map((id: string) => ({ projectId: id })),
        };

        updateMutation.mutate(
          { newsId: selectedRecord.id, payload },
          {
            onSuccess: () => {
              form.resetFields();
              onOk();
              onRefresh();
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
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf("day");
                  }}
                  onChange={(date) => {
                    const endDate = form.getFieldValue("endDate");
                    if (endDate && date && endDate < date) {
                      form.setFieldsValue({ endDate: null });
                    }
                  }}
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
                  disabledDate={(current) => {
                    const startDate = form.getFieldValue("startDate");

                    if (current && current < dayjs().startOf("day")) {
                      return true;
                    }

                    if (
                      startDate &&
                      current &&
                      current < dayjs(startDate).startOf("day")
                    ) {
                      return true;
                    }

                    return false;
                  }}
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
              options={[
                { label: "All", value: "all" },
                ...projectsData.filter(
                  (project) =>
                    project.value !== "all" &&
                    project.label !== "All" &&
                    project.value !== "All" &&
                    project.label?.toLowerCase() !== "all"
                ),
              ]}
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
                const currentValues = form.getFieldValue("projects") || [];

                if (value === "all") {
                  form.setFieldsValue({ projects: ["all"] });
                } else {
                  const newValues = currentValues.filter(
                    (v: string) => v !== "all"
                  );
                  if (!newValues.includes(value)) {
                    newValues.push(value);
                  }
                  form.setFieldsValue({ projects: newValues });
                }
              }}
              onChange={(values) => {
                if (values && values.includes("all")) {
                  if (values.length > 1) {
                    const lastValue = values[values.length - 1];
                    if (lastValue === "all") {
                      form.setFieldsValue({ projects: ["all"] });
                    } else {
                      form.setFieldsValue({
                        projects: values.filter((v: string) => v !== "all"),
                      });
                    }
                  }
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
      destroyOnHidden
      width="840px"
      maskClosable={!isSubmitting}
    />
  );
}
