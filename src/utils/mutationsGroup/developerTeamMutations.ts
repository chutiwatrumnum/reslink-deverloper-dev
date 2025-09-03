import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeveloperTeamAddNew, DeveloperTeamEditPayload } from "../../stores/interfaces/DeveloperTeam";
import axios from "axios";
import { message } from "antd";

// Create developer team invitation
export const postCreateDeveloperTeamMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 2,
        scope: { id: "createDeveloperTeam" },
        mutationFn: async (payload: DeveloperTeamAddNew) => {
            try {
                const apiPayload = {
                    roleId: Number(payload.roleId), // แปลงเป็น number
                    firstName: payload.firstName,
                    middleName: payload.middleName || "",
                    lastName: payload.lastName,
                    contact: payload.contact,
                    email: payload.email,
                    ...(payload.image && { image: payload.image })
                };

                console.log("Creating developer team invitation:", apiPayload);

                // ใช้ API endpoint จริง
                const response = await axios.post(`/dev-team-management/invitation/developer/create`, apiPayload);

                if (response.status >= 400) {
                    const errorMessage = response.data?.message || response.data?.data?.message || "Request failed";
                    throw new Error(errorMessage);
                }

                return response;
            } catch (error: any) {
                console.error("Create developer team error:", error);

                if (error.response) {
                    const errorMessage = error.response.data?.message ||
                        error.response.data?.data?.message ||
                        `API Error: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw error;
            }
        },
        onSuccess: (data) => {
            console.log("Create success:", data);
            message.success("Invitation created successfully!");

            // Refresh invitation lists
            queryClient.invalidateQueries({ queryKey: ["developerTeamInvitations"] });

            // ถ้ามี QR Code ใน response
            if (data.data?.qrCode || data.data?.data?.qrCode) {
                console.log("QR Code received:", data.data?.qrCode || data.data?.data?.qrCode);
            }
        },
        onError: (error: any) => {
            console.error("Create developer team mutation error:", error);
            message.error(error.message || "Failed to create invitation");
        },
    });
};

// Edit developer team invitation - ใช้ PUT /dev-team-management/invitation/developer/update/{id}
export const useEditDeveloperTeamInvitationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: { id: "editDeveloperTeamInvitation" },
        mutationFn: async ({ invitationId, payload }: { invitationId: string; payload: DeveloperTeamEditPayload }) => {
            try {
                // ใช้ API endpoint สำหรับ update invitation ตาม documentation
                const endpoint = `/dev-team-management/invitation/developer/update/${invitationId}`;

                // Request body format ตาม API spec
                const apiPayload = {
                    roleId: Number(payload.roleId), // number ตาม spec
                    firstName: payload.givenName, // ใช้ firstName แทน givenName
                    middleName: payload.middleName || "",
                    lastName: payload.familyName, // ใช้ lastName แทน familyName
                    contact: payload.contact,
                };

                console.log("Edit invitation request to:", endpoint, "with payload:", apiPayload);

                const response = await axios.put(endpoint, apiPayload);

                if (response.status >= 400) {
                    throw new Error(response.data?.message || "Update failed");
                }

                return response.data;
            } catch (error: any) {
                console.error("Edit invitation error:", error);

                if (error.response) {
                    const errorMessage = error.response.data?.message || `Update failed: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw error;
            }
        },
        onSuccess: (data, { invitationId }) => {
            console.log("Edit invitation success:", data);
            message.success("Invitation updated successfully!");

            // Invalidate invitation queries
            queryClient.invalidateQueries({ queryKey: ["developerTeamInvitations"] });
        },
        onError: (error: any) => {
            console.error("Edit invitation mutation error:", error);
            message.error(error.message || "Failed to update invitation");
        },
    });
};

// Edit developer team member - ใช้ PUT /dev-team-management/{userId}
export const useEditDeveloperTeamMemberMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: { id: "editDeveloperTeamMember" },
        mutationFn: async ({ userId, payload }: { userId: string; payload: DeveloperTeamEditPayload }) => {
            try {
                // ใช้ API endpoint สำหรับ update team member
                const endpoint = `/dev-team-management/${userId}`;

                const apiPayload = {
                    givenName: payload.givenName,
                    familyName: payload.familyName,
                    middleName: payload.middleName || "",
                    contact: payload.contact,
                    roleId: Number(payload.roleId), // แปลงเป็น number
                };

                console.log("Edit member request to:", endpoint, "with payload:", apiPayload);

                const response = await axios.put(endpoint, apiPayload);

                if (response.status >= 400) {
                    throw new Error(response.data?.message || "Update failed");
                }

                return response.data;
            } catch (error: any) {
                console.error("Edit member error:", error);

                if (error.response) {
                    const errorMessage = error.response.data?.message || `Update failed: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw error;
            }
        },
        onSuccess: (data, { userId }) => {
            console.log("Edit member success:", data);
            message.success("Member information updated successfully!");

            // Invalidate member queries
            queryClient.invalidateQueries({ queryKey: ["developerTeamList"] });
            queryClient.invalidateQueries({ queryKey: ["developerTeamProfile", userId] });
        },
        onError: (error: any) => {
            console.error("Edit member mutation error:", error);
            message.error(error.message || "Failed to update member information");
        },
    });
};

// Delete developer team invitation - ใช้ DELETE /dev-team-management/invitation/developer/delete/{id}
export const useDeleteDeveloperTeamInvitationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: { id: "deleteDeveloperTeamInvitation" },
        mutationFn: async (invitationId: string) => {
            try {
                console.log("Deleting invitation with ID:", invitationId);

                // ใช้ API endpoint สำหรับ delete invitation
                const endpoint = `/dev-team-management/invitation/developer/delete/${invitationId}`;

                console.log("Delete invitation request to:", endpoint);

                const response = await axios.delete(endpoint);

                if (response.status !== 200) {
                    throw new Error(response.data?.message || "Delete failed");
                }

                return response.data;
            } catch (error: any) {
                console.error("Delete invitation error:", error);

                if (error.response) {
                    const errorMessage = error.response.data?.message || `Delete failed: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw error;
            }
        },
        onSuccess: (data, invitationId) => {
            console.log("Delete invitation success:", data);
            message.success("Invitation deleted successfully!");

            // Invalidate invitation queries
            queryClient.invalidateQueries({ queryKey: ["developerTeamInvitations"] });
        },
        onError: (error: any) => {
            console.error("Delete invitation mutation error:", error);
            message.error(error.message || "Failed to delete invitation");
        },
    });
};

// Delete developer team member - ใช้ DELETE /dev-team-management/{userId}
export const useDeleteDeveloperTeamMemberMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: { id: "deleteDeveloperTeamMember" },
        mutationFn: async (userId: string) => {
            try {
                console.log("Deleting member with ID:", userId);

                // ใช้ API endpoint สำหรับ delete team member
                const endpoint = `/dev-team-management/${userId}`;

                console.log("Delete member request to:", endpoint);

                const response = await axios.delete(endpoint);

                if (response.status !== 200) {
                    throw new Error(response.data?.message || "Delete failed");
                }

                return response.data;
            } catch (error: any) {
                console.error("Delete member error:", error);

                if (error.response) {
                    const errorMessage = error.response.data?.message || `Delete failed: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw error;
            }
        },
        onSuccess: (data, userId) => {
            console.log("Delete member success:", data);
            message.success("Member deleted successfully!");

            // Invalidate member queries
            queryClient.invalidateQueries({ queryKey: ["developerTeamList"] });
        },
        onError: (error: any) => {
            console.error("Delete member mutation error:", error);
            message.error(error.message || "Failed to delete member");
        },
    });
};

// Resend developer team invitation - ใช้ POST /dev-team-management/invitation/developer/resend/{id}
export const useResendDeveloperTeamInvitationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: { id: "resendDeveloperTeamInvitation" },
        mutationFn: async (invitationId: string) => {
            try {
                console.log("Resending developer team invitation for ID:", invitationId);

                // ใช้ API endpoint สำหรับ resend invitation
                const response = await axios.post(`/dev-team-management/invitation/developer/resend/${invitationId}`);

                if (response.status >= 400) {
                    throw new Error(response.data?.message || "Resend failed");
                }

                return response.data;
            } catch (error: any) {
                console.error("Resend developer team invitation error:", error);

                if (error.response) {
                    const errorMessage = error.response.data?.message || `Resend failed: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw error;
            }
        },
        onSuccess: () => {
            message.success("Invitation resent successfully!");
            queryClient.invalidateQueries({ queryKey: ["developerTeamInvitations"] });
        },
        onError: (error: any) => {
            console.error("Resend mutation error:", error);
            message.error(error.message || "Failed to resend invitation");
        },
    });
};

// รวม mutation สำหรับ backward compatibility
export const useEditDeveloperTeamMutation = () => {
    const editInvitationMutation = useEditDeveloperTeamInvitationMutation();
    const editMemberMutation = useEditDeveloperTeamMemberMutation();

    return useMutation({
        retry: 1,
        scope: { id: "editDeveloperTeam" },
        mutationFn: async ({ userId, payload, isListEdit = false }: { userId: string; payload: DeveloperTeamEditPayload; isListEdit?: boolean }) => {
            if (isListEdit) {
                // สำหรับ verified members
                return editMemberMutation.mutateAsync({ userId, payload });
            } else {
                // สำหรับ invitations
                return editInvitationMutation.mutateAsync({ invitationId: userId, payload });
            }
        },
        onSuccess: (data, variables) => {
            // Success handling จะทำใน individual mutations
        },
        onError: (error: any) => {
            // Error handling จะทำใน individual mutations
        },
        get isPending() {
            return editInvitationMutation.isPending || editMemberMutation.isPending;
        },
        get variables() {
            return editInvitationMutation.variables || editMemberMutation.variables;
        }
    });
};

export const useDeleteDeveloperTeamMutation = () => {
    const deleteInvitationMutation = useDeleteDeveloperTeamInvitationMutation();
    const deleteMemberMutation = useDeleteDeveloperTeamMemberMutation();

    return useMutation({
        retry: 1,
        scope: { id: "deleteDeveloperTeam" },
        mutationFn: async ({ userId, isListDelete = false }: { userId: string; isListDelete?: boolean }) => {
            if (isListDelete) {
                // สำหรับ verified members
                return deleteMemberMutation.mutateAsync(userId);
            } else {
                // สำหรับ invitations
                return deleteInvitationMutation.mutateAsync(userId);
            }
        },
        onSuccess: (data, variables) => {
            // Success handling จะทำใน individual mutations
        },
        onError: (error: any) => {
            // Error handling จะทำใน individual mutations
        },
        get isPending() {
            return deleteInvitationMutation.isPending || deleteMemberMutation.isPending;
        },
        get variables() {
            return deleteInvitationMutation.variables || deleteMemberMutation.variables;
        }
    });
};