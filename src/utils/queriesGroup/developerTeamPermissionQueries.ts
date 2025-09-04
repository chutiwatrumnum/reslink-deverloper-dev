// src/utils/queriesGroup/developerTeamPermissionQueries.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface PermissionItem {
    id: number;
    nameCode: string;
    allowAdd: boolean;
    allowView: boolean;
    allowDelete: boolean;
    allowEdit: boolean;
    lock?: boolean;
}

export interface RolePermissions {
    roleManageCode: string;
    permissions: PermissionItem[];
}

export interface PermissionDashboardResponse {
    statusCode: number;
    result: {
        total: number;
        data: RolePermissions[];
    };
}

// Service function to get permissions dashboard
const getDeveloperTeamPermissions = async (): Promise<PermissionDashboardResponse> => {
    try {
        const url = `/dev-team-management/permission/dashboard`;
        console.log("Fetching developer team permissions from:", url);

        const response = await axios.get<PermissionDashboardResponse>(url);

        console.log("Developer Team Permissions API Response:", response.data);

        return response.data;
    } catch (error: any) {
        console.error("Error fetching developer team permissions:", error);

        if (error.response) {
            console.error("Error Response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        }

        throw error;
    }
};

// Query hook
export const getDeveloperTeamPermissionsQuery = () => {
    return useQuery({
        queryKey: ["developerTeamPermissions"],
        queryFn: getDeveloperTeamPermissions,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        onError: (error) => {
            console.error("getDeveloperTeamPermissionsQuery error:", error);
        },
        onSuccess: (data) => {
            console.log("getDeveloperTeamPermissionsQuery success:", data);
        }
    });
};