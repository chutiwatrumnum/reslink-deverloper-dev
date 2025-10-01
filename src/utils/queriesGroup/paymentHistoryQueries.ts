import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
// Types
import {
  PaymentHistoryParams,
  PaymentHistoryResponse,
  PaymentStatusType,
  ReceiptResponse
} from "../../stores/interfaces/PaymentHistory";

// Get payment history list - ใช้ GET /payment-history/dashboard
const getPaymentHistory = async ({
  queryKey,
}: QueryFunctionContext<
  [string, PaymentHistoryParams]
>): Promise<PaymentHistoryResponse> => {
  const [_key, params] = queryKey;
  try {
    const queryParams = new URLSearchParams();

    if (params.curPage) {
      queryParams.append("curPage", params.curPage.toString());
    }
    if (params.perPage) {
      queryParams.append("perPage", params.perPage.toString());
    }
    if (params.search) {
      queryParams.append("search", params.search);
    }
    if (params.paymentStatusIds && params.paymentStatusIds.length > 0) {
      queryParams.append("paymentStatusIds", params.paymentStatusIds.join(","));
    }
    if (params.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params.startDate) {
      queryParams.append("startDate", params.startDate);
    }
    if (params.endDate) {
      queryParams.append("endDate", params.endDate);
    }

    const url = `/payment-history/dashboard?${queryParams.toString()}`;
    // console.log("🔍 Payment history API Call: GET", url);

    const response = await axios.get(url);
    // console.log("📊 Payment history Raw API Response:", response.data);

    if (response.data.result) {
      return {
        data: response.data.result.data || [],
        total: response.data.result.total || 0,
      };
    } else {
      return { data: [], total: 0 };
    }
  } catch (error) {
    console.error("❌ Payment history API Error:", error);
    return { data: [], total: 0 };
  }
};

// 🪝 Query Hook: Get payment history list
export const getPaymentHistoryQuery = (params: PaymentHistoryParams) => {
  return useQuery({
    queryKey: ["paymentHistory", params],
    queryFn: getPaymentHistory,
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

// Get payment status - ใช้ GET /payment-history/dashboard/payment-status
const getPaymentStatus = async () => {
  try {
    const url = `/payment-history/dashboard/payment-status`;
    const res = await axios.get(url);
    // console.log("Data payment status: ", res);
    return res.data.result.data as PaymentStatusType[];
  } catch (error: any) {
    console.error("Error fetching type:", error);
    if (error?.response) {
      console.error("Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    }
    return [];
  }
};

// 🪝 Query Hook: Get payment status
export const getPaymentStatusQuery = () => {
  return useQuery({
    queryKey: ["paymentStatus"],
    queryFn: getPaymentStatus,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  });
};

// GET Receipt by license id
export const fetchReceiptByLicenseId = async (
  licenseId: string
): Promise<ReceiptResponse> => {
  if (!licenseId) throw new Error("License ID is required");
  const url = `/payment-history/dashboard/${licenseId}/receipt`;
  const res = await axios.get(url);
  console.log(res)
  if (res.data) {
    return res.data;
  }
  throw new Error("receipt not found");
};