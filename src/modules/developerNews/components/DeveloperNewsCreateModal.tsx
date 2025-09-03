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
          projects:
            values.projects?.map((id: string) => ({ projectId: id })) || [],
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
      {/* GRID 2 คอลัมน์ */}
      <Row gutter={24} className="developerNews-grid">
        {/* LEFT COLUMN */}
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
        {/* RIGHT COLUMN */}
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
                projectsLoading ? (
                  <div style={{ textAlign: "center", padding: "8px" }}>
                    <Spin size="small" /> Loading...
                  </div>
                ) : (
                  "No projects found"
                )
              }
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
      destroyOnClose
      width="840px"
      maskClosable={!isSubmitting}
    />
  );
}
