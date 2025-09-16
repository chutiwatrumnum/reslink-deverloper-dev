// src/utils/mutationsGroup/licenseMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";

import { CreateInvoicePackageType } from "../../stores/interfaces/ProjectManage";

// Interface สำหรับ renew license payload
interface RenewLicensePayload {
  licenseId: string;
  packageType?: "Standard" | "Optional";
  features?: string[];
}

// Interface สำหรับ payment payload
interface MakePaymentPayload {
  licenseId: string;
  orderNo: string;
  paymentMethod?: string;
  proofOfPayment?: string; // base64 image หรือ file path
}

// Interface สำหรับ create new license payload
interface CreateLicensePayload {
  projectId: string;
  packageType: "Standard" | "Optional";
  features: string[];
  paymentMethod?: string;
}

// ===== Utilities =====
const extractApiError = (error: any) =>
  error?.response?.data?.message ||
  error?.response?.data?.data?.message ||
  (error?.response
    ? `API Error: ${error.response.status}`
    : error?.message || "Unknown error");

// Renew license - ใช้ POST /license/{licenseId}/renew
export const useRenewLicenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 2,
    scope: { id: "renewLicense" },
    mutationFn: async (payload: RenewLicensePayload) => {
      try {
        const endpoint = `/license/${payload.licenseId}/renew`;

        const apiPayload = {
          packageType: payload.packageType || "Standard",
          features: payload.features || [],
        };

        console.log("🔄 Renew License API Payload:", apiPayload);

        const response = await axios.post(endpoint, apiPayload);

        console.log("✅ Renew License Response:", response.data);

        // ตรวจสอบ response ตาม format ใหม่
        if (response.data?.statusCode && response.data.statusCode >= 400) {
          const errorMessage =
            response.data?.message ||
            response.data?.error ||
            "Renew license failed";
          throw new Error(errorMessage);
        } else if (response.status >= 400) {
          const errorMessage =
            response.data?.message ||
            response.data?.error ||
            "Renew license failed";
          throw new Error(errorMessage);
        }

        return response.data;
      } catch (error: any) {
        console.error("❌ Renew License Error:", error);

        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Renew license failed: ${error.response.status}`;
          throw new Error(errorMessage);
        }

        throw new Error(error.message || "Failed to renew license");
      }
    },
    onSuccess: (data, variables) => {
      message.success("License renewed successfully!");
      // Refresh license list
      queryClient.invalidateQueries({ queryKey: ["license"] });
      // Refresh specific license detail
      queryClient.invalidateQueries({
        queryKey: ["licenseDetail", variables.licenseId],
      });
    },
    onError: (error: any) => {
      console.error("❌ Renew License Mutation Error:", error);
      message.error(error.message || "Failed to renew license");
    },
  });
};

// Make payment - ใช้ POST /license/{licenseId}/payment
export const useMakePaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: { id: "makePayment" },
    mutationFn: async (payload: MakePaymentPayload) => {
      try {
        const endpoint = `/license/${payload.licenseId}/payment`;

        const apiPayload = {
          orderNo: payload.orderNo,
          paymentMethod: payload.paymentMethod || "bank_transfer",
          proofOfPayment: payload.proofOfPayment,
        };

        console.log("🔄 Make Payment API Payload:", apiPayload);

        const response = await axios.post(endpoint, apiPayload);

        console.log("✅ Make Payment Response:", response.data);

        // ตรวจสอบ response ตาม format ใหม่
        if (response.data?.statusCode && response.data.statusCode >= 400) {
          throw new Error(
            response.data?.message || response.data?.error || "Payment failed"
          );
        } else if (response.status >= 400) {
          throw new Error(
            response.data?.message || response.data?.error || "Payment failed"
          );
        }

        return response.data;
      } catch (error: any) {
        console.error("❌ Make Payment Error:", error);

        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Payment failed: ${error.response.status}`;
          throw new Error(errorMessage);
        }

        throw new Error(error.message || "Failed to process payment");
      }
    },
    onSuccess: (data, variables) => {
      message.success("Payment submitted successfully!");
      // Refresh license list
      queryClient.invalidateQueries({ queryKey: ["license"] });
      // Refresh specific license detail
      queryClient.invalidateQueries({
        queryKey: ["licenseDetail", variables.licenseId],
      });
    },
    onError: (error: any) => {
      console.error("❌ Make Payment Mutation Error:", error);
      message.error(error.message || "Failed to process payment");
    },
  });
};

// Create new license - ใช้ POST /license/dashboard
export const useCreateLicenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 2,
    scope: { id: "createLicense" },
    mutationFn: async (payload: CreateLicensePayload) => {
      try {
        const endpoint = `/license/dashboard`;

        const apiPayload = {
          projectId: payload.projectId,
          packageType: payload.packageType,
          features: payload.features,
          paymentMethod: payload.paymentMethod || "bank_transfer",
        };

        console.log("🔄 Create License API Payload:", apiPayload);

        const response = await axios.post(endpoint, apiPayload);

        console.log("✅ Create License Response:", response.data);

        // ตรวจสอบ response ตาม format ใหม่
        if (response.data?.statusCode && response.data.statusCode >= 400) {
          const errorMessage =
            response.data?.message ||
            response.data?.error ||
            "Create license failed";
          throw new Error(errorMessage);
        } else if (response.status >= 400) {
          const errorMessage =
            response.data?.message ||
            response.data?.error ||
            "Create license failed";
          throw new Error(errorMessage);
        }

        return response.data;
      } catch (error: any) {
        console.error("❌ Create License Error:", error);

        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Create license failed: ${error.response.status}`;
          throw new Error(errorMessage);
        }

        throw new Error(error.message || "Failed to create license");
      }
    },
    onSuccess: (data) => {
      message.success("License created successfully!");
      // Refresh license list
      queryClient.invalidateQueries({ queryKey: ["license"] });
    },
    onError: (error: any) => {
      console.error("❌ Create License Mutation Error:", error);
      message.error(error.message || "Failed to create license");
    },
  });
};

// Delete license - ใช้ DELETE /license/{licenseId}/dashboard
export const useDeleteLicenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: { id: "deleteLicense" },
    mutationFn: async (licenseId: string) => {
      try {
        const endpoint = `/license/${licenseId}/dashboard`;

        const response = await axios.delete(endpoint);

        console.log("✅ Delete License Response:", response.data);

        // ตรวจสอบ response ตาม format ใหม่
        if (response.data?.statusCode && response.data.statusCode >= 400) {
          throw new Error(
            response.data?.message || response.data?.error || "Delete failed"
          );
        } else if (response.status >= 400) {
          throw new Error(
            response.data?.message || response.data?.error || "Delete failed"
          );
        }

        return response.data;
      } catch (error: any) {
        console.error("❌ Delete License Error:", error);

        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Delete failed: ${error.response.status}`;
          throw new Error(errorMessage);
        }

        throw new Error(error.message || "Failed to delete license");
      }
    },
    onSuccess: (data, licenseId) => {
      message.success("License deleted successfully!");
      // Refresh license list
      queryClient.invalidateQueries({ queryKey: ["license"] });
      // Remove specific license detail from cache
      queryClient.removeQueries({ queryKey: ["licenseDetail", licenseId] });
    },
    onError: (error: any) => {
      console.error("❌ Delete License Mutation Error:", error);
      message.error(error.message || "Failed to delete license");
    },
  });
};

export const postCreatePackageInvoiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 2,
    scope: { id: "createPackageInvoice" },
    mutationFn: async (payload: CreateInvoicePackageType) => {
      try {
        const endpoint = `/license/buy/dashboard`;
        const apiPayload = {
          projectId: payload.projectId,
          standardBasePrice: payload.standardBasePrice,
          optionalBasePrice: payload.optionalBasePrice,
          totalStandard: payload.totalStandard,
          totalOptional: payload.totalOptional,
          totalPrice: payload.totalPrice,
          totalVat: payload.totalVat,
          vatPercent: payload.vatPercent,
          totalPriceWithVat: payload.totalPriceWithVat,
          features: payload.features,
        };
        console.log("API Payload license:", apiPayload);
        const response = axios.post(endpoint, apiPayload);
        return response;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (data) => {
      console.log("Create package invoice mutation success:", data);
      message.success("Project created successfully!");
      // Invalidate and refetch project list
      queryClient.invalidateQueries({ queryKey: ["projectManagementLicense"] });
    },
    onError: (error: any) => {
      console.error("Create package invoice mutation error:", error);
      message.error(error.message || "Failed to create package invoice");
    },
  });
};
