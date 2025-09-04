import React from "react";
import { Modal, Collapse, Image, Spin, Alert } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import StatusPill from "../StatusPill";
import { getProjectDetailQuery } from "../../../../utils/queriesGroup/licenseQueries";
import type { LicenseInfo } from "../../../../stores/interfaces/License";

interface Props {
  isInfoModalOpen: boolean;
  onCancel: VoidFunction;
  projectId?: string;
}

const InfoModal: React.FC<Props> = ({
  isInfoModalOpen,
  onCancel,
  projectId,
}) => {
  // เรียก API เพื่อดึงข้อมูล project detail
  const {
    data: licenseInfo,
    isLoading,
    error,
    refetch,
  } = getProjectDetailQuery(projectId || "", {
    enabled: !!projectId && isInfoModalOpen, // เรียก API เมื่อมี projectId และ modal เปิด
  });

  // ฟังก์ชัน render feature list
  const renderFeatureGrid = (features: string[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {features.map((f, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <CheckCircleFilled className="text-green-500 text-lg" />
          <span className="text-gray-700">{f}</span>
        </div>
      ))}
    </div>
  );

  // แสดง loading state
  if (isLoading) {
    return (
      <Modal
        open={isInfoModalOpen}
        onCancel={onCancel}
        footer={null}
        title={
          <span className="text-lg font-semibold text-gray-800">
            Information
          </span>
        }
        width={920}
        style={{ paddingTop: 12, paddingBottom: 16 }}
        destroyOnClose>
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
          <span className="ml-3">Loading project information...</span>
        </div>
      </Modal>
    );
  }

  // แสดง error state
  if (error) {
    return (
      <Modal
        open={isInfoModalOpen}
        onCancel={onCancel}
        footer={null}
        title={
          <span className="text-lg font-semibold text-gray-800">
            Information
          </span>
        }
        width={920}
        style={{ paddingTop: 12, paddingBottom: 16 }}
        destroyOnClose>
        <Alert
          message="Error Loading Project Information"
          description={
            error instanceof Error
              ? error.message
              : "Failed to load project details. Please try again."
          }
          type="error"
          showIcon
          action={
            <button
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={() => refetch()}>
              Retry
            </button>
          }
        />
      </Modal>
    );
  }

  // แสดง empty state
  if (!licenseInfo) {
    return (
      <Modal
        open={isInfoModalOpen}
        onCancel={onCancel}
        footer={null}
        title={
          <span className="text-lg font-semibold text-gray-800">
            Information
          </span>
        }
        width={920}
        style={{ paddingTop: 12, paddingBottom: 16 }}
        destroyOnClose>
        <Alert
          message="No Project Information Found"
          description="Project information is not available."
          type="warning"
          showIcon
        />
      </Modal>
    );
  }

  // สร้าง collapse items จากข้อมูลจริง
  const collapseItems = licenseInfo.bundles.map((bundle, index) => ({
    key: `${bundle.type}-${index}`,
    label: (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-800">{bundle.type}</span>
        <span className="text-sm text-gray-500">
          (License period: {bundle.periodText})
        </span>
      </div>
    ),
    children: <div className="pt-2">{renderFeatureGrid(bundle.features)}</div>,
  }));

  return (
    <Modal
      open={isInfoModalOpen}
      onCancel={onCancel}
      onOk={onCancel}
      title={
        <span className="text-lg font-semibold text-gray-800">Information</span>
      }
      width={920}
      style={{ paddingTop: 12, paddingBottom: 16 }}
      destroyOnClose>
      {/* Project Overview */}
      <h5 className="text-base font-semibold mb-3 text-gray-800">
        Project overview
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Image */}
        <div>
          {licenseInfo.imageUrl ? (
            <Image
              src={licenseInfo.imageUrl}
              className="rounded-xl w-full h-44 object-cover"
              preview={true}
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K"
            />
          ) : (
            <div className="h-44 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
        </div>

        {/* Right: Project details */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Project name:</span>
            <span className="font-semibold text-gray-800">
              {licenseInfo.projectName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Location:</span>
            <span className="font-semibold text-gray-800 text-right max-w-xs">
              {licenseInfo.location}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Order no:</span>
            <span className="font-semibold text-gray-800">
              {licenseInfo.orderNo}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Status:</span>
            <StatusPill status={licenseInfo.status} />
          </div>
        </div>
      </div>

      <div className="border-t my-4" />

      {/* Current Package */}
      <h5 className="text-base font-semibold mb-3 text-gray-800">
        Current package:{" "}
        <span className="font-normal">{licenseInfo.currentPackageText}</span>
      </h5>

      {/* Features - แสดงจากข้อมูลจริง */}
      {licenseInfo.bundles && licenseInfo.bundles.length > 0 ? (
        <Collapse
          items={collapseItems}
          defaultActiveKey={collapseItems.map((item) => item.key)}
        />
      ) : (
        <Alert
          message="No Feature Information Available"
          description="Feature details are not available for this project."
          type="info"
          showIcon
        />
      )}
    </Modal>
  );
};

export default InfoModal;
