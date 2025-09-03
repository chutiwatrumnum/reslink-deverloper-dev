import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import {
  ProjectFromDataType,
  ProjectResponse,
  PreviewFeatureById,
  ProjectManagementParams
} from "../../stores/interfaces/ProjectManage";

// Get all projects
const getProject = async ({
  queryKey,
}: QueryFunctionContext<[string, boolean, number, number, string?]>) => {
  const [_key, activated, curPage, perPage, search] = queryKey;

  const params = new URLSearchParams();
  params.append("curPage", curPage.toString());
  params.append("perPage", perPage.toString());
  params.append("activated", activated.toString());
  if (search) params.append("search", search);

  const url = `/project/developer/dashboard?${params.toString()}`;
  const res = await axios.get(url);

  if (res.data?.result) {
    return {
      rows: res.data.result.data || [],
      total: res.data.result.total || 0,
    };
  } else {
    return { rows: [], total: 0 };
  }
};

export const useProjectManagementQuery = (
  params: ProjectManagementParams
) => {
  const { activated, curPage, perPage, search } = params;

  return useQuery({
    queryKey: ["projectManagement", activated, curPage, perPage, search],
    queryFn: getProject,
    enabled: !!params,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  });
};

// Get project by id
const getProjectById = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<ProjectFromDataType> => {
  const [_key, id] = queryKey;

  if (!id) throw new Error("Project ID is required");

  const url = `/project/${id}/developer/dashboard`;
  const res = await axios.get(url);

  if (res.data.result.data) {
    return res.data.result.data;
  } else {
    throw new Error("Project by id not found");
  }
};

export const useProjectByIdQuery = (id?: string) => {
  return useQuery<ProjectFromDataType, Error>({
    queryKey: ["projectById", id],
    queryFn: getProjectById,
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

// Get project type
const getProjectType = async () => {
  try {
    const url = `/project/type/developer/dashboard`;
    const res = await axios.get(url);
    // console.log("DATA PROJECT TYPE: ", res)
    return res.data.result.data;
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

export const useProjectTypeQuery = () => {
  return useQuery({
    queryKey: ["projectType"],
    queryFn: getProjectType,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  });
};

// Get Project status
const getProjectStatus = async () => {
  try {
    const url = `/project/developer/master-data/project-status/dashboard`;
    const res = await axios.get(url);
    console.log("DATA PROJECT STATUS: ", res)
    return res.data.result.data;
  } catch (error: any) {
    console.error("Error fetching status:", error);
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

export const useProjectStatusQuery = () => {
  return useQuery({
    queryKey: ["projectStatus"],
    queryFn: getProjectStatus,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  });
};

// Get All Features
const getFeatures = async () => {
  try {
    const url = `/license/features/dashboard`;
    const res = await axios.get(url);
    // console.log("DATA Feature: ", res)
    return res.data.result.features;
  } catch (error: any) {
    console.error("Error fetching feature:", error);
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

export const useFeaturesQuery = () => {
  return useQuery({
    queryKey: ["projectFeatures"],
    queryFn: getFeatures,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 3000)
  })
}

// Get features base price
const getFeaturesBasePrice = async () => {
  try {
    const url = `/license/features/dashboard`;
    const res = await axios.get(url);
    // console.log("DATA Feature based price: ", res)
    return res.data.result.basePrice;
  } catch (error: any) {
    console.error("Error fetching feature base price:", error);
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

export const useFeaturesBasePriceQuery = () => {
  return useQuery({
    queryKey: ["projectFeaturesBasePrice"],
    queryFn: getFeaturesBasePrice,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 3000)
  })
}

// Get feature by project id
const getFeaturesByProjectId = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>) => {
  const [_key, projectId] = queryKey;

  if (!projectId) throw new Error("Project ID is required");

  const url = `/license/features/${projectId}/dashboard`;
  const res = await axios.get(url);

  if (res.data.result.data) {
    return res.data.result.data;
  } else {
    throw new Error("Project not found");
  }
};

export const useFeaturesByProjectIdQuery = (projectId?: string) => {
  return useQuery({
    queryKey: ["featureByProjectId", projectId],
    queryFn: getFeaturesByProjectId,
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
};

const getPreviewFeatureById = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<PreviewFeatureById> => {
  const [_key, licenseId] = queryKey;

  if (!licenseId) throw new Error("License ID is required");

  const url = `/license/preview/${licenseId}/dashboard`;
  const res = await axios.get(url);

  // Type assertion to tell TypeScript this has the correct structure
  if (res.data.result) {
    return res.data.result as PreviewFeatureById;
  } else {
    throw new Error("Preview data not found");
  }
};

// Updated query hook with new type
export const usePreviewFeatureByIdQuery = (id?: string) => {
  return useQuery<PreviewFeatureById, Error>({
    queryKey: ["previewFeatureById", id],
    queryFn: getPreviewFeatureById,
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};


// Get Feature and Project 
const getFeaturesAndProjectById = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<ProjectResponse> => {
  const [_key, projectId] = queryKey;

  if (!projectId) throw new Error("Project ID is required");

  const url = `/license/preview/${projectId}/dashboard`;
  const res = await axios.get(url);

  if (res.data.result) {
    return res.data.result;
  } else {
    throw new Error("Project by id not found");
  }
};

export const useFeaturesAndProjectByIdQuery = (id?: string) => {
  return useQuery<ProjectResponse, Error>({
    queryKey: ["featureAndProjectAllById", id],
    queryFn: getFeaturesAndProjectById,
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};



