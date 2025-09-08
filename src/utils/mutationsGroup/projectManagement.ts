import { useMutation, useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import { message } from "antd";
import {
  CreateInvoicePackageType,
  ProjectManagementCreatePayload,
  ProjectManagementUpdatePayload,
  PaymentUpdate
} from "../../stores/interfaces/ProjectManage";

// ===== Utilities =====
const extractApiError = (error: any) =>
  error?.response?.data?.message ||
  error?.response?.data?.data?.message ||
  (error?.response
    ? `API Error: ${error.response.status}`
    : error?.message || "Unknown error");

// <=== POST: CREATE NEW PROJECT FORM ===>
export const postCreateProjectManagementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 2,
    scope: {
      id: "createProjectManagement",
    },
    mutationFn: async (payload: ProjectManagementCreatePayload) => {
      try {
        const endpoint = `/project/developer/dashboard`;
        const apiPayload = {
          projectTypeId: payload.projectTypeId,
          name: payload.name,
          image: payload.image,
          logo: payload.logo,
          lat: payload.lat,
          long: payload.long,
          contactNumber: payload.contactNumber,
          email: payload.email,
          country: payload.country,
          province: payload.province,
          district: payload.district,
          subdistrict: payload.subdistrict,
          road: payload.road,
          subStreet: payload.subStreet || "",
          address: payload.address,
          zipCode: payload.zipCode,
          timeZone: payload.timeZone
        };
        console.log("API Payload create project:", apiPayload);

        const response = await axios.post(endpoint, apiPayload);

        if (response.status >= 400) {
          const errorMessage =
            response.data?.message ||
            response.data?.data?.message ||
            "Request failed";
          throw new Error(errorMessage);
        }
        return response;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (data) => {
      console.log("Create project management mutation success:", data);
      message.success("Project created successfully!");
      // Invalidate and refetch project list
      queryClient.invalidateQueries({ queryKey: ["projectManagement"] });
    },
    onError: (error: any) => {
      console.error("Create project management mutation error:", error);
      message.error(error.message || "Failed to create project management");
    },
  });
};

//  <=== PUT: EDIT PROJECT ===>
export const useEditProjectManagementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: { id: "editProjectManagement" },
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ProjectManagementUpdatePayload;
    }) => {
      try {
        const endpoint = `/project/${id}/developer/dashboard`;
        const apiPayload = {
          projectTypeId: payload.projectTypeId,
          name: payload.name,
          image: payload.image,
          logo: payload.logo,
          lat: payload.lat,
          long: payload.long,
          contactNumber: payload.contactNumber,
          country: payload.country,
          province: payload.province,
          district: payload.district,
          subdistrict: payload.subdistrict,
          road: payload.road,
          subStreet: payload.subStreet || "",
          address: payload.address,
          zipCode: payload.zipCode,
          timeZone: payload.timeZone
        };
        console.log("API Payload update project:", apiPayload);
        const response = await axios.put(endpoint, apiPayload);
        if (response.status >= 400)
          throw new Error(response.data?.message || "Update failed");
        return response.data;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (data) => {
      console.log("Edit Project Success: ", data);
      message.success("Project edit successfully!");
      queryClient.invalidateQueries({ queryKey: ["projectManagement"] });
    },
    onError: (error: any) => {
      console.error("Edit project error:", error);
      message.error(error.message || "Failed to update project information");
    },
  });
};

// <=== DELETE: DELETE PROJECT ===>
export const useDeleteProjectManagementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: { id: "deleteProjectManagement" },
    mutationFn: async ({ id }: { id: string }) => {
      try {
        const endpoint = `/project/${id}/developer/dashboard`;
        const response = await axios.delete(endpoint);
        if (response.status >= 400)
          throw new Error(response.data?.message || "Delete failed");
        return response.data;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (data) => {
      console.log("Delete Project Success: ", data);
      message.success("Project deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["projectManagement"] });
    },
    onError: (error: any) => {
      console.error("Delete project error:", error);
      message.error(error.message || "Failed to delete project");
    },
  });
};

// <=== POST: CREATE PACKAGE INVOICE ===>
export const postCreatePackageInvoiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 2,
    scope: { id: "createPackageInvoice" },
    mutationFn: async (payload: CreateInvoicePackageType) => {
      try {
        const endpoint = `/license/invoice/dashboard`;
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
          features: payload.features
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

// PUT: Payment Upload
export const useEditProjectManagementPaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: { id: "editProjectManagementPayment" },
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: PaymentUpdate;
    }) => {
      try {
        const endpoint = `/license/proof-payment/${id}/dashboard`;
        const apiPayload = {
          id: payload.id,
          file: payload.file,
        };
        console.log("API Payload update project payment:", apiPayload);
        const response = await axios.put(endpoint, apiPayload);
        if (response.status >= 400)
          throw new Error(response.data?.message || "Update failed");
        return response.data;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (data) => {
      console.log("Upload payment: ", data);
      message.success("Your payment slip has been submitted!");
      queryClient.invalidateQueries({ queryKey: ["projectManagementPayment"] });
    },
    onError: (error: any) => {
      console.error("Edit project error:", error);
      message.error(error.message || "Failed to update project payment");
    },
  });
};


