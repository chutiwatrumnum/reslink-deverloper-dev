// src/modules/developerNews/components/DeveloperNewsDetailModal.tsx
import { Modal, Row, Col, Image, Tag, Space } from "antd";
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
  // Get status tag with time validation
  const getStatusTag = (record: DeveloperNewsType) => {
    const now = dayjs();
    const startDateTime = record.startTime
      ? dayjs(`${record.startDate} ${record.startTime}`, "YYYY-MM-DD HH:mm")
      : dayjs(record.startDate);

    const endDateTime = record.endTime
      ? dayjs(`${record.endDate} ${record.endTime}`, "YYYY-MM-DD HH:mm")
      : dayjs(record.endDate).endOf("day"); // ถ้าไม่มี endTime ให้เป็น 23:59:59

    if (!record.active || !record.isPublish) {
      return <Tag color="red">Inactive</Tag>;
    }

    if (now.isBefore(startDateTime)) {
      return <Tag color="blue">Scheduled</Tag>;
    }

    if (now.isAfter(endDateTime)) {
      return <Tag color="gray">Expired</Tag>;
    }

    return <Tag color="green">Activated</Tag>;
  };

  // Get creator name from API data
  const getCreatorName = (record: DeveloperNewsType) => {
    if (record.createBy) {
      const fullName = `${record.createBy.givenName || ""} ${
        record.createBy.familyName || ""
      }`.trim();
      return fullName || "-";
    }

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

  // Get project tags (แทนที่จะเป็น text ยาวๆ)
  const getProjectTags = (record: DeveloperNewsType) => {
    let projects: Array<{ id: string; name: string }> = [];

    // ใช้ newsToProjects จาก API ใหม่
    if (record.newsToProjects && record.newsToProjects.length > 0) {
      projects = record.newsToProjects
        .map((ntp) => ({
          id: ntp.projectId,
          name: ntp.project?.name || ntp.projectId,
        }))
        .filter((p) => p.name && p.name.trim());
    }
    // Fallback ไปใช้ projects format เดิม
    else if (record.projects && record.projects.length > 0) {
      projects = record.projects
        .map((p) => ({
          id: p.projectId,
          name: p.projectName || p.projectId,
        }))
        .filter((p) => p.name && p.name.trim());
    }

    if (projects.length === 0) {
      return <Tag color="default">No projects</Tag>;
    }

    return (
      <Space wrap size="small">
        {projects.map((project, index) => (
          <Tag
            key={`${project.id}-${index}`}
            color="blue"
            style={{
              marginBottom: 4,
              borderRadius: 4,
              fontSize: 12,
            }}>
            {project.name}
          </Tag>
        ))}
      </Space>
    );
  };

const IS_BACKEND_UTC_RAW = true;
// true = backend เก็บเป็น UTC ตรง ๆ (ไม่แปลงให้)
// false = backend รับ local แล้วแปลงเป็น UTC ให้เอง

const TZ = 7;

// ส่งค่าไป backend
const toBackend = (date: string, time: string) => {
  const d = dayjs(`${date} ${time}`, "YYYY-MM-DD HH:mm");
  return IS_BACKEND_UTC_RAW
    ? d.subtract(TZ, "hour").toISOString()
    : d.toISOString();
};

// แสดงผลใน UI จากค่า UTC/ISO ที่อ่านมา
const fromBackend = (isoOrDateStr?: string) => {
  if (!isoOrDateStr) return "-";
  const d = dayjs(isoOrDateStr);
  const local = d.add(TZ, "hour"); // แปลง UTC -> Local
  return local.format("DD/MM/YY HH:mm");
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

            {/* Target project - ปรับปรุงเป็น Tags */}
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: 8,
                }}>
                Target Projects
              </h4>
              <div style={{ minHeight: 32 }}>{getProjectTags(newsData)}</div>
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
                  minHeight: 40,
                  padding: 12,
                  backgroundColor: "#f9fafb",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                }}>
                {newsData.description || "No description provided"}
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
                    wordBreak: "break-all",
                  }}>
                  {newsData.url}
                </a>
              </div>
            )}

            {/* Bottom row with dates and status */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div>
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
                <div>
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

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1f2937",
                      marginBottom: 4,
                    }}>
                    Start date
                  </h4>
                  <p>
                    {newsData.startDate
                      ? dayjs(
                          `${newsData.startDate} ${
                            newsData.startTime || "00:00"
                          }`,
                          "YYYY-MM-DD HH:mm"
                        )
                          .add(0, "hour") // ถ้าอ่านมาจาก UTC
                          .format("DD/MM/YY HH:mm")
                      : "-"}
                  </p>
                </div>
              </Col>

              <Col span={12}>
                <div>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1f2937",
                      marginBottom: 4,
                    }}>
                    End date
                  </h4>
                  <p>
                    {newsData.endDate
                      ? dayjs(
                          `${newsData.endDate} ${
                            newsData.endTime || "00:00"
                          }`,
                          "YYYY-MM-DD HH:mm"
                        )
                          .add(0, "hour") // ถ้าอ่านมาจาก UTC
                          .format("DD/MM/YY HH:mm")
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
