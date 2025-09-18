// src/utils/queriesGroup/developerNewsQueries.ts - Clean Version
import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import {
    GetDeveloperNewsParams,
    DeveloperNewsResponse,
    ProjectSelectOption,
    DeveloperNewsType,
} from "../../stores/interfaces/DeveloperNews";

// Get developer news list
const getDeveloperNewsList = async ({
    queryKey,
}: QueryFunctionContext<[string, GetDeveloperNewsParams]>): Promise<DeveloperNewsResponse> => {
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
        if (params.startMonth) {
            queryParams.append("startDate", params.startMonth);
        }
        if (params.endMonth) {
            queryParams.append("endDate", params.endMonth);
        }

        const url = `/news/developer/list/dashboard?${queryParams.toString()}`;
        const response = await axios.get(url);

        // Process response structure
        let rows: DeveloperNewsType[] = [];
        let total: number = 0;

        if (response.data && response.data.statusCode === 200 && response.data.result) {
            const result = response.data.result;

            if (result.data && Array.isArray(result.data)) {
                rows = result.data.map((item: any) => {
                    const projects = item.newsToProjects?.map((ntp: any) => ({
                        projectId: ntp.projectId,
                        projectName: ntp.project?.name || ntp.projectId,
                    })) || [];

                    const createdBy = item.createBy ? {
                        givenName: item.createBy.givenName,
                        familyName: item.createBy.familyName,
                        sub: item.createBy.sub,
                    } : undefined;

                    return {
                        id: item.id,
                        key: item.id?.toString(),
                        title: item.title,
                        description: item.description,
                        url: item.url,
                        imageUrl: item.imageUrl,
                        startDate: item.startDate,
                        endDate: item.endDate,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        active: item.active,
                        isPublish: item.isPublish,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        projects: projects,
                        createdBy: createdBy,
                        createBy: item.createBy,
                        newsToProjects: item.newsToProjects,
                    };
                });

                total = result.total || 0;
            } else {
                rows = [];
                total = 0;
            }
        } else {
            rows = [];
            total = 0;
        }

        const finalResult: DeveloperNewsResponse = {
            rows: rows,
            total: total
        };

        return finalResult;

    } catch (error: any) {
        // Return empty response for error cases
        return {
            rows: [],
            total: 0
        };
    }
};

// Get developer news detail by ID
const getDeveloperNewsDetail = async (newsId: string | number): Promise<DeveloperNewsType> => {
    try {
        const url = `/news/developer/${newsId}/dashboard`;
        const response = await axios.get(url);

        // Handle response structure similar to list API
        if (response.data?.statusCode === 200 && response.data.result) {
            const item = response.data.result;

            const projects = item.newsToProjects?.map((ntp: any) => ({
                projectId: ntp.projectId,
                projectName: ntp.project?.name || ntp.projectId,
            })) || [];

            const createdBy = item.createBy ? {
                givenName: item.createBy.givenName,
                familyName: item.createBy.familyName,
                sub: item.createBy.sub,
            } : undefined;

            const mappedResult = {
                id: item.id,
                key: item.id?.toString(),
                title: item.title,
                description: item.description,
                url: item.url,
                imageUrl: item.imageUrl,
                startDate: item.startDate,
                endDate: item.endDate,
                startTime: item.startTime,
                endTime: item.endTime,
                active: item.active,
                isPublish: item.isPublish,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                projects: projects,
                createdBy: createdBy,
                createBy: item.createBy,
                newsToProjects: item.newsToProjects,
            };

            return mappedResult;
        }

        // Fallback for other response structures
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

// Get projects list for selection
const getDeveloperNewsProjects = async (): Promise<ProjectSelectOption[]> => {
    try {
        const url = `/news/developer/dashboard/projects`;
        const response = await axios.get(url);

        let projectsData: any[] = [];

        // Check response structure
        if (response.data?.statusCode === 200 && response.data.result) {
            if (Array.isArray(response.data.result.data)) {
                projectsData = response.data.result.data;
            } else if (Array.isArray(response.data.result)) {
                projectsData = response.data.result;
            }
        } else if (response.data?.result?.data && Array.isArray(response.data.result.data)) {
            projectsData = response.data.result.data;
        } else if (response.data?.result && Array.isArray(response.data.result)) {
            projectsData = response.data.result;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
            projectsData = response.data.data;
        } else if (Array.isArray(response.data)) {
            projectsData = response.data;
        }

        // Format projects data for Select component
        const formattedProjects: ProjectSelectOption[] = projectsData.map((project: any) => {
            const projectId = project.projectId || project.id || project._id;
            const projectName = project.projectName || project.name || project.title;

            return {
                projectId: projectId,
                projectName: projectName,
                label: projectName || `Project ${projectId}`,
                value: projectId,
            };
        });

        return formattedProjects;

    } catch (error: any) {
        return [];
    }
};

// Query Hooks
export const getDeveloperNewsQuery = (params: GetDeveloperNewsParams) => {
    return useQuery({
        queryKey: ["developerNews", params],
        queryFn: getDeveloperNewsList,
        enabled: !!params,
        keepPreviousData: true,
        staleTime: 30 * 1000,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 ||
                error?.response?.status === 403 ||
                error?.response?.status === 404) {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

export const getDeveloperNewsDetailQuery = (newsId: string | number, options = {}) => {
    return useQuery({
        queryKey: ["developerNewsDetail", newsId],
        queryFn: () => getDeveloperNewsDetail(newsId),
        enabled: !!newsId,
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 404) return false;
            return failureCount < 2;
        },
        ...options
    });
};

export const getDeveloperNewsProjectsQuery = () => {
    return useQuery({
        queryKey: ["developerNewsProjects"],
        queryFn: getDeveloperNewsProjects,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });
};