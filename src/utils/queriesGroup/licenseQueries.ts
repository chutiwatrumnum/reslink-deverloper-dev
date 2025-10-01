// src/utils/queriesGroup/licenseQueries.ts - เพิ่ม project detail query

import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import {
  GetLicenseParams,
  LicenseResponse,
  LicenseItem,
  ProjectDetailApiResponse,
  ProjectDetailResponse,
  mapProjectDetailToLicenseInfo,
  LicenseInfo,
  mapPaymentStatusToLicenseStatus,
  formatBuyingDate,
} from "../../stores/interfaces/License";
import type { ProjectOption } from "../../stores/interfaces/License";

// Get license list - ใช้ GET /license/dashboard
const getLicenseList = async ({
  queryKey,
}: QueryFunctionContext<
  [string, GetLicenseParams]
>): Promise<LicenseResponse> => {
  const [_key, params] = queryKey;

  try {
    const queryParams = new URLSearchParams();

    // เพิ่ม query parameters ตาม API
    if (params.curPage) {
      queryParams.append("curPage", params.curPage.toString());
    }
    if (params.perPage) {
      queryParams.append("perPage", params.perPage.toString());
    }
    if (params.search) {
      queryParams.append("search", params.search);
    }
    if (params.paymentStatus) {
      queryParams.append("paymentStatus", params.paymentStatus);
    }
    if (params.startDate) {
      queryParams.append("startDate", params.startDate);
    }
    if (params.endDate) {
      queryParams.append("endDate", params.endDate);
    }

    const url = `/license/dashboard?${queryParams.toString()}`;
    // console.log("🔍 License API Call: GET", url);

    const response = await axios.get(url);
    // console.log("📊 License Raw API Response:", response.data);

    // ตรวจสอบ response structure { statusCode: 200, result: { total: number, data: [] } }
    let data: LicenseItem[] = [];
    let total: number = 0;

    if (
      response.data &&
      response.data.statusCode === 200 &&
      response.data.result
    ) {
      const result = response.data.result;

      if (result.data && Array.isArray(result.data)) {
        // Map ข้อมูลจาก API response ให้ตรงกับ interface และเพิ่ม display fields
        data = result.data.map((item: any) => {
          const licenseStatus = mapPaymentStatusToLicenseStatus(
            item.paymentStatus
          );
          const buyingDate = formatBuyingDate(item.createdAt);

          return {
            id: item.id,
            project: item.project,
            paymentStatus: item.paymentStatus,
            orderNo: item.orderNo,
            createdAt: item.createdAt,
            // เพิ่ม display fields สำหรับ UI
            packageName: item.package, // ตั้งค่า default หรือดึงจาก API ถ้ามี
            buyingDate: buyingDate,
            status: licenseStatus,
          };
        });

        total = result.total || 0;
        // console.log("✅ Found license data in API structure");
      } else {
        console.warn("⚠️ No data array found in result");
        data = [];
        total = 0;
      }
    } else {
      console.warn("⚠️ Unexpected response structure:", response.data);
      data = [];
      total = 0;
    }

    const finalResult: LicenseResponse = {
      data: data,
      total: total,
    };

    // console.log("✅ Final processed license data:", {
    //   dataCount: finalResult.data.length,
    //   total: finalResult.total,
    //   firstItem: finalResult.data[0] || null,
    // });

    return finalResult;
  } catch (error: any) {
    console.error("❌ License API Error:", error);

    if (error.response) {
      console.error("📛 Response Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
    }

    // Return empty response for error cases
    return {
      data: [],
      total: 0,
    };
  }
};

// Get project detail with licenses - ใช้ GET /license/{projectId}/dashboard
const getProjectDetail = async (projectId: string): Promise<LicenseInfo> => {
  try {
    const url = `/license/${projectId}/dashboard`;
    // console.log("🔍 Project Detail API Call: GET", url);

    const response = await axios.get<ProjectDetailApiResponse>(url);
    // console.log("📋 Project Detail Raw Response:", response.data);

    // ตรวจสอบ response structure
    if (response.data?.statusCode === 200 && response.data.result) {
      const projectData = response.data.result;
      // console.log("📋 Project Detail Result:", projectData);

      // แปลงข้อมูลให้อยู่ในรูป LicenseInfo
      const licenseInfo = mapProjectDetailToLicenseInfo(projectData);

      // console.log("📋 Mapped License Info:", licenseInfo);
      return licenseInfo;
    }

    throw new Error("Invalid response structure");
  } catch (error: any) {
    console.error("❌ Project Detail API Error:", error);

    if (error.response) {
      console.error("📛 Project Detail Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
    }

    throw error;
  }
};

// Get license detail by ID - ใช้ GET /license/{id}/dashboard (สำหรับ license detail เฉพาะ)
const getLicenseDetail = async (licenseId: string): Promise<LicenseItem> => {
  try {
    const url = `/license/${licenseId}/dashboard`;
    // console.log("🔍 License Detail API Call: GET", url);

    const response = await axios.get(url);
    // console.log("📋 License Detail Raw Response:", response.data);

    // Handle response structure similar to list API
    if (response.data?.statusCode === 200 && response.data.result) {
      const item = response.data.result;
      // console.log("📋 License Detail Result Item:", item);

      const licenseStatus = mapPaymentStatusToLicenseStatus(item.paymentStatus);
      const buyingDate = formatBuyingDate(item.createdAt);

      const mappedResult = {
        id: item.id,
        project: item.project,
        paymentStatus: item.paymentStatus,
        orderNo: item.orderNo,
        createdAt: item.createdAt,
        packageName: "Standard" as const,
        buyingDate: buyingDate,
        status: licenseStatus,
      };

      // console.log("📋 License Detail Mapped Result:", mappedResult);
      return mappedResult;
    }

    // console.log("📋 License Detail Fallback Response:", response.data);
    // Fallback for other response structures
    return response.data;
  } catch (error: any) {
    console.error("❌ License Detail API Error:", error);

    if (error.response) {
      console.error("📛 Detail Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
    }

    throw error;
  }
};

/** ---------- Mock fetcher สำหรับ ProjectOptions ----------
 * ภายหลังเปลี่ยนเป็น axios.get("/project/list") ได้ทันที
 * แล้ว return data.map(...) ให้อยู่ในรูป ProjectOption[]
 */
const getProjectOptions = async (): Promise<ProjectOption[]> => {
  try {
    const res = await axios.get("/license/selection-projects/dashboard");
    // console.log(res.data.result.data);

    const result: ProjectOption[] = res.data.result.data.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
      };
    });
    // console.log(result);

    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Get license features dashboard - ใช้ GET /license/features/dashboard
const getLicenseFeaturesDashboard = async () => {
  try {
    const url = `/license/features/dashboard`;

    const response = await axios.get(url);
    // console.log(response.data.result);

    return response.data.result.features;
  } catch (error: any) {
    console.error("❌ License Features Dashboard API Error:", error);

    if (error.response) {
      console.error("📛 License Features Error Response:", error);
    }

    throw error; // ให้ react-query handle error/retry ต่อ
  }
};

// Query Hooks
export const getLicenseQuery = (params: GetLicenseParams) => {
  return useQuery({
    queryKey: ["license", params],
    queryFn: getLicenseList,
    enabled: !!params,
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error: any) => {
      // ไม่ retry กรณี 401, 403, 404
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.response?.status === 404
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Project Detail Query - สำหรับ InfoModal
export const getProjectDetailQuery = (projectId: string, options = {}) => {
  return useQuery({
    queryKey: ["projectDetail", projectId],
    queryFn: () => getProjectDetail(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
    ...options, // spread options ที่ส่งมา
  });
};

export const getLicenseDetailQuery = (licenseId: string, options = {}) => {
  return useQuery({
    queryKey: ["licenseDetail", licenseId],
    queryFn: () => getLicenseDetail(licenseId),
    enabled: !!licenseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
    ...options, // spread options ที่ส่งมา (จะ override enabled ถ้ามี)
  });
};

export const useProjectOptionsQuery = () => {
  return useQuery<ProjectOption[], Error>({
    queryKey: ["projectOptions"],
    queryFn: getProjectOptions,
  });
};

// Query Hook: License Features Dashboard
export const getLicenseFeaturesDashboardQuery = (options = {}) => {
  return useQuery({
    queryKey: ["licenseFeaturesDashboard"],
    queryFn: getLicenseFeaturesDashboard,
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
    ...options, // อนุญาต override options จากผู้ใช้
  });
};
