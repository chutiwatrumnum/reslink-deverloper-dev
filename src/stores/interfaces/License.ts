// src/stores/interfaces/License.ts - Complete version without mock data

export type LicenseStatus =
  | "in_service"
  | "expiring_soon"
  | "expired"
  | "suspended"
  | "waiting_for_payment";

// API Response Interfaces
export interface PaymentStatus {
  id: number;
  nameCode: "pending" | "success" | "failed" | "cancelled";
  nameTh: string;
  nameEn: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface LicenseItem {
  id: string;
  project: Project;
  paymentStatus: PaymentStatus;
  orderNo: string;
  createdAt: string;
  // Display fields
  packageName?: "Standard" | "Optional";
  buyingDate?: string;
  status?: LicenseStatus;
}

export interface LicenseResponse {
  total: number;
  data: LicenseItem[];
}

export interface GetLicenseParams {
  perPage?: number;
  curPage: number;
  search?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}

export interface LicenseState {
  tableData: LicenseItem[];
  loading: boolean;
  total: number;
  filterData: GetLicenseParams;
}

// Project Detail API Interfaces
export interface ProjectDetail {
  id: string;
  name: string;
  image: string;
  logo: string;
  active: boolean;
  lat: number;
  long: number;
  contactNumber: string;
  email: string;
  province: string;
  district: string;
  subdistrict: string;
  road: string;
  subStreet: string;
  address: string;
  zipCode: string;
  type: {
    nameTh: string;
    nameEn: string;
  };
  statusProject: {
    id: number;
    nameTh: string;
    nameEn: string;
  };
}

export interface LicenseFeature {
  startDate: string;
  endDate: string;
  type: "standard" | "optional";
  feature: {
    name: string;
  };
}

export interface LicenseFeatures {
  standard?: {
    period: string;
    features: LicenseFeature[];
  };
  optional?: {
    period: string;
    features: LicenseFeature[];
  };
}

export interface ProjectLicense {
  licenseId: string;
  orderNo: string;
  optionalFeatureLength: number;
  features: LicenseFeatures;
}

export interface ProjectDetailResponse {
  project: ProjectDetail;
  licenses: ProjectLicense[];
}

export interface ProjectDetailApiResponse {
  statusCode: number;
  result: ProjectDetailResponse;
}

// UI Display Interfaces
export interface FeatureBundle {
  type: "Standard" | "Optional";
  periodText: string;
  features: string[];
}

export interface LicenseInfo {
  id: string;
  imageUrl?: string;
  projectName: string;
  location: string;
  orderNo: string;
  status: LicenseStatus;
  currentPackageText: string;
  bundles: FeatureBundle[];
}

export type ProjectOption = {
  id: string;
  name: string;
};

// Helper Functions
export const mapPaymentStatusToLicenseStatus = (paymentStatus: PaymentStatus): LicenseStatus => {
  switch (paymentStatus.nameCode) {
    case "success":
      return "in_service";
    case "pending":
      return "waiting_for_payment";
    case "failed":
    case "cancelled":
      return "expired";
    default:
      return "suspended";
  }
};

export const formatBuyingDate = (createdAt: string): string => {
  const date = new Date(createdAt);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const mapProjectDetailToLicenseInfo = (data: ProjectDetailResponse): LicenseInfo => {
  const project = data.project;
  const license = data.licenses[0]; // ใช้ license แรก

  // สร้าง address string
  const addressParts = [
    project.address,
    project.subStreet ? `ซอย ${project.subStreet}` : '',
    project.road ? `ถนน ${project.road}` : '',
    project.subdistrict ? `ตำบล ${project.subdistrict}` : '',
    project.district ? `อำเภอ ${project.district}` : '',
    project.province,
    project.zipCode
  ].filter(Boolean);

  const fullAddress = addressParts.join(' ');

  // นับจำนวน features
  const standardCount = license?.features?.standard?.features?.length || 0;
  const optionalCount = license?.features?.optional?.features?.length || 0;

  const currentPackageText = optionalCount > 0
    ? `Standard + ${optionalCount} optional feature${optionalCount > 1 ? 's' : ''}`
    : 'Standard package';

  // สร้าง bundles
  const bundles: FeatureBundle[] = [];

  if (license?.features?.standard) {
    bundles.push({
      type: "Standard",
      periodText: license.features.standard.period,
      features: license.features.standard.features.map(f => f.feature.name)
    });
  }

  if (license?.features?.optional && license.features.optional.features.length > 0) {
    bundles.push({
      type: "Optional",
      periodText: license.features.optional.period,
      features: license.features.optional.features.map(f => f.feature.name)
    });
  }

  // กำหนด status ตาม project status
  let status: LicenseStatus = "in_service";
  if (!project.active) {
    status = "suspended";
  } else if (project.statusProject.nameEn !== "Activated") {
    status = "expired";
  }

  return {
    id: project.id,
    imageUrl: project.image,
    projectName: project.name,
    location: fullAddress,
    orderNo: license?.orderNo || "N/A",
    status: status,
    currentPackageText: currentPackageText,
    bundles: bundles
  };
};