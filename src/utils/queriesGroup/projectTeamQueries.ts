// src/utils/queries/projectTeamInvitations.ts
import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import {
  ProjectTeamInvitationsParams,
  ProjectTeamInvitationsResponse,
  OptionItem,
} from "../../stores/interfaces/projectTeam";
import {
  PTMSortOrder,
  PTMSortByField,
  ProjectTeamManagementListParams,
  ProjectTeamManagementListResponse,
} from "../../stores/interfaces/projectTeam";

// 1) LIST: /project-team-management/invitation/juristic/list
const getProjectTeamInvitations = async ({
  queryKey,
}: QueryFunctionContext<
  [string, boolean, number, number, string?]
>): Promise<ProjectTeamInvitationsResponse> => {
  const [_key, activate, curPage, perPage, search] = queryKey;

  const params = new URLSearchParams();
  params.append("curPage", curPage.toString());
  params.append("perPage", perPage.toString());
  params.append("activate", activate.toString());
  if (search) params.append("search", search);

  const url = `/project-team-management/invitation/juristic/list?${params.toString()}`;
  const res = await axios.get(url);
  return res.data.result;
};

// 2) PROJECT OPTIONS: /project-team-management/invitation/juristic/project
const getProjectTeamProject = async (): Promise<OptionItem[]> => {
  try {
    const url = `/project-team-management/invitation/juristic/project`;
    const res = await axios.get(url);
    return res.data.data;
  } catch (error: any) {
    console.error("Error fetching projects:", error);
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

// 3) ROLE OPTIONS: /project-team-management/invitation/juristic/role
const getProjectTeamRole = async (): Promise<OptionItem[]> => {
  try {
    const url = `/project-team-management/invitation/juristic/role`;
    const res = await axios.get(url);
    return res.data.data;
  } catch (error: any) {
    console.error("Error fetching roles:", error);
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

// 4) LIST : /project-team-management/list
const getProjectTeamManagementList = async ({
  queryKey,
}: QueryFunctionContext<
  [
    string,
    number, // curPage
    number, // perPage
    string | undefined, // search
    string | undefined, // startDate
    string | undefined, // endDate
    string | number | undefined, // projectId
    PTMSortOrder | undefined, // sort
    PTMSortByField | undefined // sortBy
  ]
>): Promise<ProjectTeamManagementListResponse> => {
  const [
    _key,
    curPage,
    perPage,
    search,
    startDate,
    endDate,
    projectId,
    sort,
    sortBy,
  ] = queryKey;

  const params = new URLSearchParams();
  params.append("curPage", String(curPage));
  params.append("perPage", String(perPage));
  if (search) params.append("search", search);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (projectId !== undefined && projectId !== null) {
    params.append("projectId", String(projectId));
  }
  if (sort) params.append("sort", sort);
  if (sortBy) params.append("sortBy", sortBy);

  const url = `/project-team-management/list?${params.toString()}`;
  const res = await axios.get(url);
  // console.log(res.data);

  // รองรับทั้ง result, data หรือ root
  return res.data?.result ?? res.data?.data ?? res.data;
};

// B) PROJECT OPTIONS (ใหม่): /project-team-management/project
const getProjectTeamManagementProject = async (): Promise<OptionItem[]> => {
  try {
    const url = `/project-team-management/project`;
    const res = await axios.get(url);
    return (res.data?.data ?? res.data?.result ?? res.data) as
      | OptionItem[]
      | [];
  } catch (error: any) {
    console.error("Error fetching PTM projects:", error);
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

export const useProjectTeamRoleQuery = () => {
  return useQuery({
    queryKey: ["projectTeamRole"],
    queryFn: getProjectTeamRole,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  });
};

export const useProjectTeamProjectQuery = () => {
  return useQuery({
    queryKey: ["projectTeamProject"],
    queryFn: getProjectTeamProject,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  });
};

export const useProjectTeamInvitationsListQuery = (
  params: ProjectTeamInvitationsParams
) => {
  const { activate, curPage, perPage, search } = params;

  return useQuery({
    queryKey: ["projectTeamInvitations", activate, curPage, perPage, search],
    queryFn: getProjectTeamInvitations,
    enabled: !!params,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  });
};

// /project-team-management/list
export const useProjectTeamManagementListQuery = (
  params: ProjectTeamManagementListParams
) => {
  return useQuery({
    queryKey: [
      "projectTeamManagementList",
      params.curPage,
      params.perPage,
      params.search,
      params.startDate,
      params.endDate,
      params.projectId,
      params.sort,
      params.sortBy,
    ],
    queryFn: getProjectTeamManagementList,
    enabled: !!params,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  });
};

// /project-team-management/project
export const useProjectTeamManagementProjectQuery = () => {
  return useQuery({
    queryKey: ["projectTeamManagementProject"],
    queryFn: getProjectTeamManagementProject,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  });
};
