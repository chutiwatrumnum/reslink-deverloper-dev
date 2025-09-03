// src/modules/developerNews/components/DeveloperNewsDetailModal.tsx
import { Modal, Row, Col, Image, Tag } from "antd";
import dayjs from "dayjs";
import type { DeveloperNewsType } from "../../../stores/interfaces/DeveloperNews";

interface DeveloperNewsDetailModalProps {
  visible: boolean;
  onClose: () => void;
  newsData: DeveloperNewsType | null;
}

const DeveloperNewsDetailModal = ({
  visible,
  onClose,
  newsData,
}: DeveloperNewsDetailModalProps) => {
  // Get status tag
  const getStatusTag = (record: DeveloperNewsType) => {
    const now = dayjs();
    const startDate = dayjs(record.startDate);
    const endDate = dayjs(record.endDate);

    if (!record.active || !record.isPublish) {
      return <Tag color="red">Inactive</Tag>;
    }

    if (now.isBefore(startDate)) {
      return <Tag color="blue">Scheduled</Tag>;
    }

    if (now.isAfter(endDate)) {
      return <Tag color="gray">Expired</Tag>;
    }

    return <Tag color="green">Activated</Tag>;
  };

  // Get creator name from API data
  const getCreatorName = (record: DeveloperNewsType) => {
    // ใช้ createBy จาก API ใหม่
    if (record.createBy) {
      const fullName = `${record.createBy.givenName || ""} ${
        record.createBy.familyName || ""
      }`.trim();
      return fullName || "-";
    }

    // Fallback ไปใช้ createdBy format เดิม
    if (typeof record.createdBy === "object" && record.createdBy) {
      const fullName = `${record.createdBy.givenName || ""} ${
        record.createdBy.familyName || ""
      }`.trim();
      return fullName || "-";
    }

    if (typeof record.createdBy === "string" && record.createdBy.trim()) {
      return record.createdBy.trim();
    }

    return "-";
  };

  // Get project names from API data
  const getProjectNames = (record: DeveloperNewsType) => {
    // ใช้ newsToProjects จาก API ใหม่
    if (record.newsToProjects && record.newsToProjects.length > 0) {
      const projectNames = record.newsToProjects
        .map((ntp) => ntp.project?.name || ntp.projectId)
        .filter((name) => name && name.trim()) // กรองชื่อที่ว่างออก
        .join(", ");
      return projectNames || "-";
    }

    // Fallback ไปใช้ projects format เดิม
    if (record.projects && record.projects.length > 0) {
      const projectNames = record.projects
        .map((p) => p.projectName || p.projectId)
        .filter((name) => name && name.trim()) // กรองชื่อที่ว่างออก
        .join(", ");
      return projectNames || "-";
    }

    return "-";
  };

  const handleClose = () => {
    onClose();
  };

  // No data state
  if (!newsData) {
    return (
      <Modal
        title="Information"
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={900}
        centered
        style={{ borderRadius: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
            color: "#666",
          }}>
          <p>No news data found</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Information"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={900}
      centered
      style={{ borderRadius: 12 }}>
      <div style={{ padding: "24px 0" }}>
        <Row gutter={32}>
          {/* Left Column - Image */}
          <Col span={10}>
            <div style={{ marginBottom: 16 }}>
              <h4
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: 12,
                }}>
                Image
              </h4>
              {newsData.imageUrl ? (
                <Image
                  src={newsData.imageUrl}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 300,
                    backgroundColor: "#f9fafb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    color: "#9ca3af",
                    fontSize: 14,
                  }}>
                  No Image Available
                </div>
              )}
            </div>
          </Col>

          {/* Right Column - Details */}
          <Col span={14}>
            {/* Title */}
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: 8,
                }}>
                Title
              </h4>
              <p
                style={{
                  fontSize: 14,
                  color: "#374151",
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                {newsData.title || "-"}
              </p>
            </div>

            {/* Target project */}
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: 8,
                }}>
                Target project
              </h4>
              <p
                style={{
                  fontSize: 14,
                  color: "#374151",
                  margin: 0,
                }}>
                {getProjectNames(newsData)}
              </p>
            </div>

            {/* Announcement body */}
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: 8,
                }}>
                Announcement body
              </h4>
              <div
                style={{
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}>
                {newsData.description || "-"}
              </div>
            </div>

            {/* URL */}
            {newsData.url && (
              <div style={{ marginBottom: 24 }}>
                <h4
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1f2937",
                    marginBottom: 8,
                  }}>
                  URL
                </h4>
                <a
                  href={newsData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 14,
                    color: "#3b82f6",
                    textDecoration: "none",
                  }}>
                  {newsData.url}
                </a>
              </div>
            )}

            {/* Bottom row with dates and status */}
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1f2937",
                      marginBottom: 4,
                    }}>
                    Created date
                  </h4>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#374151",
                      margin: 0,
                    }}>
                    {newsData.createdAt
                      ? dayjs(newsData.createdAt).format("DD/MM/YY")
                      : "-"}
                  </p>
                </div>
              </Col>

              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1f2937",
                      marginBottom: 4,
                    }}>
                    Created by
                  </h4>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#374151",
                      margin: 0,
                    }}>
                    {getCreatorName(newsData)}
                  </p>
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1f2937",
                      marginBottom: 4,
                    }}>
                    Start date/Time
                  </h4>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#374151",
                      margin: 0,
                    }}>
                    {newsData.startDate
                      ? dayjs(newsData.startDate).format("DD/MM/YY hh:mm A")
                      : "-"}
                  </p>
                </div>
              </Col>

              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1f2937",
                      marginBottom: 4,
                    }}>
                    End date/time
                  </h4>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#374151",
                      margin: 0,
                    }}>
                    {newsData.endDate
                      ? dayjs(newsData.endDate).format("DD/MM/YY hh:mm A")
                      : "-"}
                  </p>
                </div>
              </Col>
            </Row>

            {/* Status */}
            <div>
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: 8,
                }}>
                Status
              </h4>
              <div>{getStatusTag(newsData)}</div>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default DeveloperNewsDetailModal;
