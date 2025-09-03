import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";
import {
  ProjectTeamEditPayload,
  ProjectJuristicInvitationCreatePayload,
  ProjectJuristicInvitationUpdatePayload,
} from "../../stores/interfaces/projectTeam";

// ===== Utilities =====
const extractApiError = (error: any) =>
  error?.response?.data?.message ||
  error?.response?.data?.data?.message ||
  (error?.response
    ? `API Error: ${error.response.status}`
    : error?.message || "Unknown error");

// 1) PUT /project-team-management/{userId}
export const useEditProjectTeamMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: { id: "editProjectTeamMember" },
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: ProjectTeamEditPayload;
    }) => {
      try {
        const endpoint = `/project-team-management/${userId}`;
        const apiPayload = {
          givenName: payload.givenName,
          familyName: payload.familyName,
          middleName: payload.middleName || "",
          contact: payload.contact,
          roleId: payload.roleId,
        };

        const response = await axios.put(endpoint, apiPayload);
        if (response.status >= 400)
          throw new Error(response.data?.message || "Update failed");
        return response.data;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (data, { userId }) => {
      console.log("Edit member success:", data);
      message.success("Member information updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["projectTeamList"] });
      queryClient.invalidateQueries({
        queryKey: ["projectTeamProfile", userId],
      });
    },
    onError: (error: any) => {
      console.error("Edit project team member error:", error);
      message.error(error.message || "Failed to update member information");
    },
  });
};

// 2) DELETE /project-team-management/{userId}
export const useDeleteProjectTeamMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: { id: "deleteProjectTeamMember" },
    mutationFn: async ({ userId }: { userId: string }) => {
      try {
        const endpoint = `/project-team-management/${userId}`;
        const response = await axios.delete(endpoint);
        if (response.status >= 400)
          throw new Error(response.data?.message || "Delete failed");
        return response.data;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (data) => {
      console.log("Delete member success:", data);
      message.success("Member deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["projectTeamList"] });
    },
    onError: (error: any) => {
      console.error("Delete project team member error:", error);
      message.error(error.message || "Failed to delete member");
    },
  });
};

// 3) POST /project-team-management/invitation/juristic/create
export const postCreateProjectJuristicInvitationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 2,
    scope: { id: "createProjectJuristicInvitation" },
    mutationFn: async (payload: ProjectJuristicInvitationCreatePayload) => {
      try {
        const endpoint = `/project-team-management/invitation/juristic/create`;
        const apiPayload = {
          projectId: payload.projectId,
          roleId: Number(payload.roleId),
          firstName: payload.firstName,
          middleName: payload.middleName || "",
          lastName: payload.lastName,
          contact: payload.contact,
          email: payload.email, //  string | boolean
        };

        const response = await axios.post(endpoint, apiPayload);
        if (response.status >= 400) {
          const msg =
            response.data?.message ||
            response.data?.data?.message ||
            "Request failed";
          throw new Error(msg);
        }
        return response;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (res) => {
      console.log("Create invitation success:", res);
      message.success("Invitation created successfully!");
      // refresh list
      queryClient.invalidateQueries({ queryKey: ["projectTeamInvitations"] });
    },
    onError: (error: any) => {
      console.error("Create project juristic invitation error:", error);
      message.error(error.message || "Failed to create invitation");
    },
  });
};

// 4) DELETE /project-team-management/invitation/juristic/delete/{id} (ลบคำเชิญ juristic)
export const useDeleteProjectJuristicInvitationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: { id: "deleteProjectJuristicInvitation" },
    mutationFn: async ({ id }: { id: string }) => {
      try {
        const endpoint = `/project-team-management/invitation/juristic/delete/${id}`;
        const response = await axios.delete(endpoint);
        if (response.status >= 400)
          throw new Error(response.data?.message || "Delete failed");
        return response.data;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (data) => {
      console.log("Delete invitation success:", data);
      message.success("Invitation deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["projectTeamInvitations"] });
    },
    onError: (error: any) => {
      console.error("Delete invitation error:", error);
      message.error(error.message || "Failed to delete invitation");
    },
  });
};

// 5) POST /project-team-management/invitation/juristic/resend/{id}
export const useResendProjectJuristicInvitationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: { id: "resendProjectJuristicInvitation" },
    mutationFn: async ({ id }: { id: string }) => {
      try {
        const endpoint = `/project-team-management/invitation/juristic/resend/${id}`;
        const response = await axios.post(endpoint, {});
        if (response.status >= 400)
          throw new Error(response.data?.message || "Resend failed");
        return response.data;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (data) => {
      console.log("Resend invitation success:", data);
      message.success("Invitation resent successfully!");
      queryClient.invalidateQueries({ queryKey: ["projectTeamInvitations"] });
    },
    onError: (error: any) => {
      console.error("Resend invitation error:", error);
      message.error(error.message || "Failed to resend invitation");
    },
  });
};

// 6) PUT /project-team-management/invitation/juristic/update/{id}
export const useEditProjectJuristicInvitationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: { id: "editProjectJuristicInvitation" },
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ProjectJuristicInvitationUpdatePayload;
    }) => {
      try {
        const endpoint = `/project-team-management/invitation/juristic/update/${id}`;
        const apiPayload = {
          projectId: payload.projectId,
          roleId: Number(payload.roleId),
          firstName: payload.firstName,
          middleName: payload.middleName || "",
          lastName: payload.lastName,
          contact: payload.contact,
        };

        const response = await axios.put(endpoint, apiPayload);
        if (response.status >= 400)
          throw new Error(response.data?.message || "Update failed");
        return response.data;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (data) => {
      console.log("Edit invitation success:", data);
      message.success("Invitation updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["projectTeamInvitations"] });
    },
    onError: (error: any) => {
      console.error("Edit invitation error:", error);
      message.error(error.message || "Failed to update invitation");
    },
  });
};
