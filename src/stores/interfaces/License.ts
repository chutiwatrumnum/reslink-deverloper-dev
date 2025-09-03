export type LicenseStatus =
  | "in_service"
  | "expiring_soon"
  | "expired"
  | "suspended"
  | "waiting_for_payment";

export interface LicenseItem {
  id: string;
  projectName: string;
  packageName: "Standard" | "Optional";
  orderNo: string;
  buyingDate: string; // DD/MM/YYYY
  status: LicenseStatus;
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

export interface FeatureBundle {
  type: "Standard" | "Optional";
  periodText: string; // "01/01/2025 - 01/01/2026"
  features: string[];
}

export type ProjectOption = {
  id: string;
  name: string;
};
