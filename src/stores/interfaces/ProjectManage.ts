export interface conditionPage {
  perPage: number;
  curPage: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  sortBy?: string;
  unitId?: string;
}

export interface CountryDataTypes {
  id: number;
  name: string;
  iso3?: string;
  iso2?: string;
  numeric_code?: string;
  phonecode?: string;
  capital?: string;
  currency?: string;
  currency_name?: string;
  currency_symbol?: string;
  tld?: string;
  native?: string;
  region?: string;
  region_id?: number;
  subregion?: string;
  subregion_id?: number;
  nationality?: string;
  timezones: {
    zoneName: string ;
    gmtOffset?: number;
    gmtOffsetName?: string;
    abbreviation?: string;
    tzName?: string;
  }[];
  translations?: {
    br?: string;
    ko?: string;
    ptBR?: string;
    pt?: string;
    nl?: string;
    hr?: string;
    fa?: string;
    de?: string;
    es?: string;
    fr?: string;
    ja?: string;
    it?: string;
    zhCN?: string;
    tr?: string;
    ru?: string;
    uk?: string;
    pl?: string;
  };
  latitude?: string;
  longitude?: string;
  emoji?: string;
  emojiU?: string;
}

export interface ProvinceDataTypes {
  id: number;
  name: string;
  country_id: number | string;
  country_code?: string;
  country_name?: string;
  iso2?: string;
  iso3166_2?: string;
  fips_code?: string;
  type?: string;
  level?: null | string;
  parent_id?: null | string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
}

export interface DistrictDataTypes {
  id: number;
  name: string;
  state_id: number;
  state_code?: string;
  state_name?: string;
  country_id?: number;
  country_code?: string;
  country_name?: string;
  latitude?: string;
  longitude?: string;
  timezone?: null | string;
  wikiDataId?: string;
}

// export interface ProvinceDataThType {
//   id?: number;
//   name_en: string;
//   name_th?: string;
//   geography_id?: number;
//   created_at?: string;
//   updated_at?: string;
//   deleted_at?: null;
// }
// export interface DistrictDataType {
//   id?: number;
//   name_th?: string;
//   name_en: string;
//   province_id?: number;
//   created_at?: string;
//   updated_at?: string;
//   deleted_at?: null;
// }
export interface SubDistrictDataType {
  id: number;
  zip_code: number;
  name_th: string;
  name_en: string;
  amphure_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

export type ProjectManagementCreatePayload = {
  name: string;
  image: string;
  logo: string;
  active?: boolean;
  lat: string | number;
  long: string | number;
  projectTypeId: string | number;
  contactNumber: string;
  email: string;
  country: string;
  timeZone: string;
  province: string;
  district: string;
  subdistrict: string;
  road?: string;
  subStreet?: string;
  address: string;
  zipCode: string | number;
};

export type ProjectManagementUpdatePayload = {
  name: string;
  image: string;
  logo: string;
  active?: boolean;
  lat: string | number;
  long: string | number;
  projectTypeId?: string | number;
  vmsUrl?: string;
  vmsUsername?: string;
  vmsPassword?: string;
  contactNumber: string;
  email: string;
  country: string;
  timeZone: string;
  province: string;
  district: string;
  subdistrict: string;
  address: string;
  zipCode: string | number;
  road?: string;
  subStreet?: string;
};
export interface ProjectFromDataType {
  projectTypeId?: number;
  id?: string;
  name?: string;
  image?: string;
  logo?: string;
  active?: boolean | string;
  lat?: string | number;
  long?: string | number;
  vmsUrl?: string;
  vmsUsername?: string;
  vmsPassword?: string;
  contactNumber?: string;
  email?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  road?: string;
  subStreet?: string;
  address?: string;
  zipCode?: string | number;
  type?: {
    id?: string | number;
    nameTh?: string;
    nameEn?: string;
  };
  status?: {
    nameTh?: string;
    nameEn?: string;
  };
}
export interface ProjectManagementParams {
  activated: boolean;
  perPage: number;
  curPage: number;
  search?: string;
}

export interface ProjectManageType {
  projectTypeId?: string;
  key?: string;
  id?: string;
  name?: string;
  image?: string;
  logo?: string;
  active?: boolean | string;
  lat?: string | number;
  long?: string | number;
  vmsUrl?: string;
  vmsUsername?: string;
  vmsPassword?: string;
  contactNumber?: string;
  email?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  road?: string;
  subStreet?: string;
  address?: string;
  zipCode?: string | number;
  type?: {
    nameTh?: string;
    nameEn?: string;
  };
  status?: {
    nameTh?: string;
    nameEn?: string;
    nameCode?: string;
  };
  createdBy?: {
    familyName?: string;
    givenName?: string;
    role?: {
      name?: string;
    };
  };
}

export interface ProjectManagementState {
  tableData: ProjectManageType[];
  loading: boolean;
  total: number;
  qrCode: string;
}

export interface ProjectManagementResponse {
  rows?: ProjectManageType[];
  total?: number;
  [k: string]: any;
}

export interface ProjectType {
  id?: number;
  nameTh?: string;
  nameEn?: string;
}

export interface RadioItem {
  id?: string | number;
  label?: string;
  value?: string | number;
  [k: string]: any;
}

// Feature
export interface FeaturesDataType {
  id?: string;
  code?: string;
  name?: string;
  type?: string;
  price?: string | number;
  sorted?: number;
  active?: boolean;
  isDefault?: boolean;
}

interface Feature {
  id: string;
  code: string;
  name: string;
  type: string;
  price: string;
}
// Type for invoice
export type FeatureKind = "standard" | "optional";

export interface FeatureItem {
  id: string;
  code: string;
  name: string;
  type: FeatureKind;
  price: number; // 0 สำหรับ standard / มีค่าถ้า optional
  sorted: number;
  active: boolean;
  isDefault: boolean;
}

export interface CreateInvoicePackageType {
  projectId?: string;
  standardBasePrice: number;
  optionalBasePrice: number;
  totalStandard: number;
  totalOptional: number;
  totalPrice: number;
  totalVat: number;
  vatPercent: number;
  totalPriceWithVat: number;
  features: Feature[];
}

export interface StepStatusType {
  id?: number;
  nameCode?: string;
  nameTh?: string;
  nameEn?: string;
}

export type StepStatus = "completed" | "active" | "pending";
export interface GroupedFeatures {
  standard: FeatureItem[];
  optional: FeatureItem[];
}

export interface InvoiceData {
  logo: { invoiceLogo?: string };
  address: {
    customerAddress: string;
    lifeStyleAddress: string;
  };
  tableOrder: {
    createdAt: string; // ISO
    orderNo: string;
  };
  tableFeatures: {
    totalPrice: number; // subtotal (ยังไม่รวม VAT)
    totalPriceWithVat: number; // รวม VAT แล้ว
    totalVat: number;
    vatPercent: number; // เช่น 7
    standardBasePrice: number; // ราคาแพ็กเกจพื้นฐาน/ปี
    groupedData: GroupedFeatures; // แยก standard / optional
  };
  footerData?: {
    supportEmail?: string;
  };
}

export interface PaymentUpdate {
  id: string;
  file: string | null;
}
interface BankInfo {
  bankName: string;
  accountNo: string;
  accountName: string;
  bankLogo: string;
}

interface FeatureInfo {
  price: number;
  type: string;
  isUserSelect: boolean;
  feature: {
    name: string;
  };
}
export interface PreviewFeatureById {
  bank: BankInfo;
  features: {
    standard: FeatureItem[];
    optional: FeatureItem[];
  };
  vatPercent: number;
  totalVat: number;
  totalPriceWithVat: number;
  standardBasePrice: number;
  optionalBasePrice: number;
}

// use in getFeatureAndProjectQuery
export interface ProjectResponse {
  project?: Project;
  licenses?: License[];
}

export interface Project {
  id?: string;
  name?: string;
  image?: string;
  logo?: string;
  active?: boolean;
  lat?: number;
  long?: number;
  contactNumber?: string;
  email?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  road?: string;
  subStreet?: string;
  address?: string;
  zipCode: number;
  type?: {
    nameTh?: string;
    nameEn?: string;
  };
  statusProject?: {
    id?: number;
    nameTh?: string;
    nameEn?: string;
  };
}

export interface License {
  licenseId: string;
  orderNo: string;
  optionalFeatureLength: number;
  features: {
    standard: FeatureSet | null;
    optional: FeatureSet | null;
  };
}

export interface FeatureSet {
  period: string;
  features: FeatureItem[];
}

export interface FeatureItem {
  startDate: string;
  endDate: string;
  type: "standard" | "optional";
  feature: {
    name: string;
  };
}
