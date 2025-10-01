export interface PaymentHistoryType {
  id: string;
  paymentAt: string;
  amount: string;
  createdAt: string;
  license: {
    id: string;
    orderNo: string;
  };
  project: {
    id: string;
    name: string;
  };
  paymentStatus: {
    id: number;
    nameCode: string;
    nameTh: string;
    nameEn: string;
  };
  paymentMethod: {
    id: number;
    nameCode: string;
    nameTh: string;
    nameEn: string;
  };
}
export interface PaymentHistoryParams {
  perPage: number;
  curPage: number;
  search?: string;
  paymentStatusIds?: number[];
  startDate?: string;
  endDate?: string;
  sortBy?: string;
}
export interface PaymentHistoryResponse {
  total: number;
  data: PaymentHistoryType[];
}

export interface PaymentHistoryState {
  tableData: PaymentHistoryType[];
  loading: boolean;
  total: number;
  qrCode: string;
}

export interface FeatureItem {
  id: string;
  code: string;
  name: string;
  type: "standard" | "optional";
  price: number; // 0 สำหรับ standard / มีค่าถ้า optional
  sorted: number;
  active: boolean;
  isDefault: boolean;
}
export interface GroupedFeatures {
  standard: FeatureItem[];
  optional: FeatureItem[];
}

export interface PaymentStatusType {
  id: number;
  nameCode: string;
  nameTh: string;
  nameEn: string;
}

export interface PreviewFeatureResponse {
  standardBasePrice: number;
  vatPercent: number;
  totalVat: number;
  totalPriceWithVat: number;
  features: {
    standard: FeatureItem[];
    optional: FeatureItem[];
  };
}

export interface ReceiptResponse {
  logo: Logo;
  address: Address;
  tableOrder: TableOrder;
  tableFeatures: TableFeatures;
  footerData: FooterData;
}

export interface Logo {
  receiptLogo: string;
}

export interface Address {
  customerAddress: string;
  lifeStyleAddress: string;
}

export interface TableOrder {
  paymentAt: string;
  orderNo: string;
  paymentMethod: PaymentMethod;
  status: Status;
}

export interface PaymentMethod {
  id?: number;
  nameCode?: string;
  nameTh?: string;
  nameEn?: string;
}

export interface Status {
  id?: number;
  nameCode?: string;
  nameTh?: string;
  nameEn?: string;
}

export interface TableFeatures {
  standardBasePrice: string | number;
  totalVat: string | number;
  totalPrice: string | number;
  vatPercent: string | number;
  totalPriceWithVat: string | number;
  groupedData: GroupedData;
}

export interface GroupedData {
  standard: FeatureItem[];
  optional: FeatureItem[];
}

export interface FeatureItem {
  projectId: string;
  price: number;
  type: "standard" | "optional";
  isUserSelect: boolean;
  feature: Feature;
}

export interface Feature {
  id: string;
  name: string;
}
export interface FooterData {
  supportEmail: string;
}

export interface ReceiptDataType {
  logo: Logo;
  address: Address;
  tableOrder: {
    createdAt: string;
    orderNo: string;
    paymentMethod: string;
    status: string;
  };
  tableFeatures: {
    standardBasePrice: number;
    vatPercent: number;
    totalVat: number;
    totalPrice: number;
    totalPriceWithVat: number;
    groupedData: { standard: FeatureItem[]; optional: FeatureItem[] };
  };
  footerData: FooterData;
}