import { Modal, Collapse, Image } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import StatusPill from "../StatusPill";
import type { LicenseInfo } from "../../../../stores/interfaces/License";

/** ---------- Mock data ---------- */
const MOCK_INFOS: Record<string, LicenseInfo> = {
  "1": {
    id: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop",
    projectName: "AiTAN",
    location: "Sirinthorn rd.",
    orderNo: "A7683405123489XK",
    status: "in_service",
    currentPackageText: "Standard + 4 optional feature",
    bundles: [
      {
        type: "Standard",
        periodText: "01/01/2025 - 01/01/2026",
        features: [
          "Contact list",
          "Document form",
          "Events",
          "Fixing report",
          "Home automation",
          "Parcel alert",
          "Live chat",
          "Maintenance guide",
          "My pets",
          "News and announcement",
          "Notifications",
          "Services",
          "SOS",
          "Warranty tracking",
          "Weather forecast",
          "Left home with Guard",
        ],
      },
      {
        type: "Optional",
        periodText: "05/02/2025 - 05/02/2026",
        features: ["Bill and payment"],
      },
      {
        type: "Optional",
        periodText: "07/02/2025 - 07/02/2026",
        features: ["Facility booking"],
      },
      {
        type: "Optional",
        periodText: "10/04/2025 - 10/04/2026",
        features: ["E-stamp"],
      },
    ],
  },
};

const FALLBACK_INFO: LicenseInfo = MOCK_INFOS["1"];

interface Props {
  isInfoModalOpen: boolean;
  onCancel: VoidFunction;
  id?: string;
}

const InfoModal = ({ isInfoModalOpen, onCancel, id }: Props) => {
  const data = (id && MOCK_INFOS[id]) || FALLBACK_INFO;

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

  const collapseItems =
    data?.bundles.map((b, i) => ({
      key: `${b.type}-${i}`,
      label: (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">{b.type}</span>
          <span className="text-sm text-gray-500">
            (License period: {b.periodText})
          </span>
        </div>
      ),
      children: <div className="pt-2">{renderFeatureGrid(b.features)}</div>,
    })) ?? [];

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
      destroyOnClose
    >
      {/* Project Overview */}
      <h5 className="text-base font-semibold mb-3 text-gray-800">
        Project overview
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Image */}
        <div>
          {data.imageUrl ? (
            <Image
              src={data.imageUrl}
              className="rounded-xl w-full h-44 object-cover"
              preview={false}
            />
          ) : (
            <div className="h-44 bg-gray-100 rounded-xl"></div>
          )}
        </div>

        {/* Right: Project details */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Project name:</span>
            <span className="font-semibold text-gray-800">
              {data.projectName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Location:</span>
            <span className="font-semibold text-gray-800">{data.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Order no:</span>
            <span className="font-semibold text-gray-800">{data.orderNo}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Status:</span>
            <StatusPill status={data.status} />
          </div>
        </div>
      </div>

      <div className="border-t my-4" />

      {/* Current Package */}
      <h5 className="text-base font-semibold mb-3 text-gray-800">
        Current package:
        <span className="font-normal">{data.currentPackageText}</span>
      </h5>

      {/* Collapse: Standard + Optional */}
      <Collapse items={collapseItems} />
    </Modal>
  );
};

export default InfoModal;
