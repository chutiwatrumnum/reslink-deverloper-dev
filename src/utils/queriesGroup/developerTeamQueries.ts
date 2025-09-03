import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import {
    GetDeveloperTeamInvitationsType,
    DeveloperTeamInvitationsResponse,
    DeveloperTeamListParams,
} from "../../stores/interfaces/DeveloperTeam";
const getDeveloperTeamInvitations = async ({
    queryKey,
}: QueryFunctionContext<
    [string, boolean, number, string?]
>): Promise<DeveloperTeamInvitationsResponse> => {
    const [_key, activate, curPage, search] = queryKey;
    const params = new URLSearchParams();
    params.append("curPage", curPage.toString());
    params.append("perPage", "10"); // default page size
    params.append("activate", activate.toString());

    if (search) {
        params.append("search", search);
    }
    const url = `/dev-team-management/invitation/developer/list?${params.toString()}`;

    console.log("API URL:", url);

    const res = await axios.get(url);
    console.log("API Response:", res.data);
    if (res.data?.result) {
        return res.data.result;
    } else if (res.data?.data) {
        return res.data.data;
    } else {
        return res.data;
    }
};
const getDeveloperTeamRole = async () => {
    try {
        const url = `/dev-team-management/invitation/developer/role`;
        const res = await axios.get(url);

        console.log("Developer Role API Response:", res.data);

        let roleData = [];
        if (res.data?.data) {
            roleData = res.data.data;
        } else if (res.data?.result) {
            roleData = res.data.result;
        } else if (Array.isArray(res.data)) {
            roleData = res.data;
        } else {
            console.warn("Unexpected role data structure:", res.data);
            return [];
        }

        const formattedRoles = roleData.map((role: any) => ({
            id: role.id || role.roleId,
            name: role.name || role.roleName || role.roleCode || role.title,
            value: role.id || role.roleId,
            label: role.name || role.roleName || role.roleCode || role.title,
        }));

        console.log("Formatted Roles:", formattedRoles);
        return formattedRoles;
    } catch (error: any) {
        console.error("Error fetching developer team roles:", error);
        if (error.response) {
            console.error("Error Response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        }

        return [];
    }
};

// Get developer team list (verified members) - ใช้ GET /dev-team-management/list
const getDeveloperTeamList = async ({
    queryKey,
}: QueryFunctionContext<[string, DeveloperTeamListParams]>) => {
    const [_key, params] = queryKey;

    const queryParams = new URLSearchParams();
    queryParams.append("perPage", params.perPage?.toString() || "10");
    queryParams.append("curPage", params.curPage?.toString() || "1");
    queryParams.append("verifyByJuristic", "true");
    queryParams.append("isActive", "true");

    if (params.search) {
        queryParams.append("search", params.search);
    }
    if (params.startDate) {
        queryParams.append("startDate", params.startDate);
    }
    if (params.endDate) {
        queryParams.append("endDate", params.endDate);
    }
    if (params.sort && params.sortBy) {
        queryParams.append("sortBy", params.sortBy);
        queryParams.append("sort", params.sort);
    }
    const url = `/dev-team-management/list?${queryParams.toString()}`;

    console.log("Fetching developer team list from:", url);

    const res = await axios.get(url);

    console.log("Developer Team List API Response:", res.data);

    if (res.data?.result) {
        return res.data.result;
    } else if (res.data?.data) {
        return res.data.data;
    } else {
        return res.data;
    }
};
export const getDeveloperTeamRoleQuery = () => {
    return useQuery({
        queryKey: ["developerTeamRole"],
        queryFn: getDeveloperTeamRole,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        onError: (error) => {
            console.error("getDeveloperTeamRoleQuery error:", error);
        },
        onSuccess: (data) => {
            console.log("getDeveloperTeamRoleQuery success:", data);
        }
    });
};

export const getDeveloperTeamInvitationsQuery = (payload: {
    activate: boolean;
    curPage: number;
    search?: string;
}) => {
    const { activate, curPage, search } = payload;
    return useQuery({
        queryKey: ["developerTeamInvitations", activate, curPage, search],
        queryFn: getDeveloperTeamInvitations,
        keepPreviousData: true,
        staleTime: 30 * 1000, // 30 seconds
        onError: (error) => {
            console.error("getDeveloperTeamInvitationsQuery error:", error);
        },
        onSuccess: (data) => {
            console.log("getDeveloperTeamInvitationsQuery success:", data);
        }
    });
};

export const getDeveloperTeamListQuery = (params: DeveloperTeamListParams) => {
    return useQuery({
        queryKey: ["developerTeamList", params],
        queryFn: getDeveloperTeamList,
        enabled: !!params,
        keepPreviousData: true,
        staleTime: 30 * 1000,
        onError: (error) => {
            console.error("getDeveloperTeamListQuery error:", error);
        },
        onSuccess: (data) => {
            console.log("getDeveloperTeamListQuery success:", data);
        }
    });
};