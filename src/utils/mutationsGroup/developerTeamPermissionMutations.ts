// src/utils/mutationsGroup/developerTeamPermissionMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";

export interface UpdatePermissionPayload {
    id: number;
    allowAdd: boolean;
    allowView: boolean;
    allowDelete: boolean;
    allowEdit: boolean;
}

// Update developer team permissions
export const useUpdateDeveloperTeamPermissionsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: { id: "updateDeveloperTeamPermissions" },
        mutationFn: async (payload: UpdatePermissionPayload[]) => {
            try {
                console.log("Updating developer team permissions:", payload);

                const url = `/dev-team-management/permission/dashboard`;
                const response = await axios.put(url, payload);

                if (response.status >= 400) {
                    const errorMessage = response.data?.message || "Update failed";
                    throw new Error(errorMessage);
                }

                console.log("Permission update response:", response.data);
                return response.data;
            } catch (error: any) {
                console.error("Update developer team permissions error:", error);

                if (error.response) {
                    const errorMessage = error.response.data?.message ||
                        `Update failed: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw error;
            }
        },
        onSuccess: (data) => {
            console.log("Update permissions success:", data);
            message.success("Permissions updated successfully!");

            // Invalidate and refetch permissions data
            queryClient.invalidateQueries({ queryKey: ["developerTeamPermissions"] });
        },
        onError: (error: any) => {
            console.error("Update permissions mutation error:", error);
            message.error(error.message || "Failed to update permissions");
        },
    });
};