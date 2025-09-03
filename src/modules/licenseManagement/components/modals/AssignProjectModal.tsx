import { useMemo, useState } from "react";
import { Modal, Select, Typography, Form, Button, Space } from "antd";
import { useProjectOptionsQuery } from "../../../../utils/queriesGroup/licenseQueries";
import type { ProjectOption } from "../../../../stores/interfaces/License";

type Props = {
  open: boolean;
  onCancel: () => void;
  onContinue: (projectId: string) => void;
};

const AssignProjectModal = ({ open, onCancel, onContinue }: Props) => {
  const { Title } = Typography;
  const [form] = Form.useForm();

  const { data: options = [], isLoading } = useProjectOptionsQuery();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const selectOptions = useMemo(
    () =>
      options.map((p: ProjectOption) => ({
        label: p.name,
        value: p.id,
      })),
    [options]
  );

  const handleContinue = () => {
    if (!selectedId) return;
    onContinue(selectedId);
    setSelectedId(undefined);
    form.resetFields();
  };

  const handleClose = () => {
    setSelectedId(undefined);
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      title={null}
      footer={null}
      onCancel={handleClose}
      maskClosable={false}
      centered
    >
      <div style={{ marginBottom: 8 }}>
        <Title level={4} style={{ margin: 0 }}>
          Select a project to assign a license
        </Title>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item label="Assigned project" required>
          <Select
            showSearch
            placeholder="Choose a project"
            loading={isLoading}
            options={selectOptions}
            value={selectedId}
            onChange={(v) => setSelectedId(v)}
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            size="large"
          />
        </Form.Item>

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            size="large"
            disabled={!selectedId}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};

export default AssignProjectModal;
