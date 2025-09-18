import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  TimePicker,
  Select,
  Spin,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import FormModal from "../../../components/common/FormModal";
import { callConfirmModal } from "../../../components/common/Modal";
import SmallButton from "../../../components/common/SmallButton";
import UploadImageGroup from "../../../components/group/UploadImageGroup";

import type { DeveloperNewsAddNew } from "../../../stores/interfaces/DeveloperNews";
import "../styles/developerNews.css";

const { TextArea } = Input;

type Props = {
  isCreateModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  onRefresh: () => void;
  projectsData?: Array<{ label: string; value: string }>;
  projectsLoading?: boolean;
  createMutation?: any;
};

export default function DeveloperNewsCreateModal({
  isCreateModalOpen,
  onOk,
  onCancel,
  onRefresh,
  projectsData = [],
  projectsLoading = false,
  createMutation,
}: Props) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => setOpen(isCreateModalOpen), [isCreateModalOpen]);
  useEffect(() => {
    if (isCreateModalOpen) form.setFieldsValue({ type: "developer_news" });
  }, [isCreateModalOpen, form]);

  const isSubmitting = !!createMutation?.isPending;

  const handleImageChange = (url: string) => setImageUrl(url);

  const onFinish = (values: any) => {
    callConfirmModal({
      title: "Create news?",
      message: "Are you sure you want to create this news?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: () => {
        if (!createMutation) return;

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

        const payload: DeveloperNewsAddNew = {
          title: values.title,
          description: values.description || "",
          url: values.url || "",
          imageUrl,
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

        createMutation.mutate(payload, {
          onSuccess: () => {
            form.resetFields();
            setImageUrl("");
            onOk();
            onRefresh();
          },
        });
      },
    });
  };

  const handleClose = () => {
    form.resetFields();
    setImageUrl("");
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
            name="image"
            className="developerNews-image-item">
            <UploadImageGroup
              onChange={handleImageChange}
              image={imageUrl}
              disabled={isSubmitting}
              height={220}
              ratio="*File size <1MB, 16:9 Ratio, *JPGs"
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
              <Form.Item label="Start time" name="startTime"
                rules={[{ required: true, message: "Please select time!" }]}>
                <TimePicker
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Select time"
                  format="HH:mm"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="End time" name="endTime"
                rules={[{ required: true, message: "Please select time!" }]}>
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
                projectsLoading ? (
                  <div style={{ textAlign: "center", padding: "8px" }}>
                    <Spin size="small" /> Loading...
                  </div>
                ) : (
                  "No projects found"
                )
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
          message={isSubmitting ? "Saving..." : "Save"}
          form={form}
          disabled={isSubmitting}
        />
      </div>
    </Form>
  );

  return (
    <FormModal
      isOpen={open}
      title="Add developer news"
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
