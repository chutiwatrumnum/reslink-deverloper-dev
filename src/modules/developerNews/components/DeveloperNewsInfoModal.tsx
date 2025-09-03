// src/modules/developerNews/components/DeveloperNewsInfoModal.tsx
import { Modal, Row, Col, Image, Tag } from "antd";
import dayjs from "dayjs";
import type { DeveloperNewsType } from "../../../stores/interfaces/DeveloperNews";

interface DeveloperNewsInfoModalProps {
  visible: boolean;
  onClose: () => void;
  newsData: DeveloperNewsType | null;
}

const DeveloperNewsInfoModal = ({
  visible,
  onClose,
  newsData,
}: DeveloperNewsInfoModalProps) => {
  if (!newsData) return null;

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

    return <Tag color="green">Published</Tag>;
  };

  return (
    <Modal
      title="Information"
      open={visible}
      onCancel={onClose}
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
                {newsData.title}
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
                {newsData.projects && newsData.projects.length > 0
                  ? newsData.projects
                      .map((p) => p.projectName || p.projectId)
                      .join(", ")
                  : "-"}
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
                    {typeof newsData.createdBy === "object"
                      ? `${newsData.createdBy?.givenName || ""} ${
                          newsData.createdBy?.familyName || ""
                        }`.trim()
                      : newsData.createdBy || "-"}
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

export default DeveloperNewsInfoModal;
