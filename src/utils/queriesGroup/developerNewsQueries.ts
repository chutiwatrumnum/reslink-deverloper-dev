// src/utils/queriesGroup/developerNewsQueries.ts
import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import {
    GetDeveloperNewsParams,
    DeveloperNewsResponse,
    ProjectSelectOption,
    DeveloperNewsType,
} from "../../stores/interfaces/DeveloperNews";

// Get developer news list - ใช้ GET /news/developer/list/dashboard (ตาม API ใหม่)
const getDeveloperNewsList = async ({
    queryKey,
}: QueryFunctionContext<[string, GetDeveloperNewsParams]>): Promise<DeveloperNewsResponse> => {
    const [_key, params] = queryKey;

    try {
        const queryParams = new URLSearchParams();

        // เพิ่ม query parameters ตาม API
        if (params.curPage) {
            queryParams.append("curPage", params.curPage.toString());
        }
        if (params.perPage) {
            queryParams.append("perPage", params.perPage.toString());
        }
        if (params.search) {
            queryParams.append("search", params.search);
        }
        // แก้ไข startMonth และ endMonth ให้ใช้ startDate และ endDate แทน
        if (params.startMonth) {
            queryParams.append("startDate", params.startMonth);
        }
        if (params.endMonth) {
            queryParams.append("endDate", params.endMonth);
        }

        const url = `/news/developer/list/dashboard?${queryParams.toString()}`;
        console.log("🔍 API Call: GET", url);

        const response = await axios.get(url);
        console.log("📊 Raw API Response:", response.data);

        // ตรวจสอบ response structure ใหม่ { statusCode: 200, result: { total: number, data: [] } }
        let rows: DeveloperNewsType[] = [];
        let total: number = 0;

        if (response.data && response.data.statusCode === 200 && response.data.result) {
            const result = response.data.result;

            if (result.data && Array.isArray(result.data)) {
                // Map ข้อมูลจาก API response ใหม่ให้ตรงกับ interface
                rows = result.data.map((item: any) => {
                    // แปลง newsToProjects เป็น projects format เดิม
                    const projects = item.newsToProjects?.map((ntp: any) => ({
                        projectId: ntp.projectId,
                        projectName: ntp.project?.name || ntp.projectId,
                    })) || [];

                    // แปลง createBy เป็น createdBy format เดิม
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
                        active: item.active,
                        isPublish: item.isPublish,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        projects: projects,
                        createdBy: createdBy,
                        // Keep original fields for backward compatibility
                        createBy: item.createBy,
                        newsToProjects: item.newsToProjects,
                    };
                });

                total = result.total || 0;
                console.log("✅ Found data in new API structure");
            } else {
                console.warn("⚠️ No data array found in result");
                rows = [];
                total = 0;
            }
        } else {
            console.warn("⚠️ Unexpected response structure:", response.data);
            rows = [];
            total = 0;
        }

        const finalResult: DeveloperNewsResponse = {
            rows: rows,
            total: total
        };

        console.log("✅ Final processed data:", {
            rowsCount: finalResult.rows.length,
            total: finalResult.total,
            firstItem: finalResult.rows[0] || null
        });

        return finalResult;

    } catch (error: any) {
        console.error("❌ API Error:", error);

        if (error.response) {
            console.error("📛 Response Error:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url
            });
        }

        // Return empty response for error cases
        return {
            rows: [],
            total: 0
        };
    }
};

// Get developer news detail by ID - ใช้ GET /news/developer/{id}/dashboard
const getDeveloperNewsDetail = async (newsId: string | number): Promise<DeveloperNewsType> => {
    try {
        const url = `/news/developer/${newsId}/dashboard`;
        console.log("🔍 Detail API Call: GET", url);

        const response = await axios.get(url);
        console.log("📋 Detail Raw Response:", response.data);

        // Handle response structure similar to list API
        if (response.data?.statusCode === 200 && response.data.result) {
            const item = response.data.result;
            console.log("📋 Detail Result Item:", item);

            // Map ข้อมูลให้ตรงกับ interface
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
                active: item.active,
                isPublish: item.isPublish,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                projects: projects,
                createdBy: createdBy,
                // Keep original fields
                createBy: item.createBy,
                newsToProjects: item.newsToProjects,
            };

            console.log("📋 Detail Mapped Result:", mappedResult);
            return mappedResult;
        }

        console.log("📋 Detail Fallback Response:", response.data);
        // Fallback for other response structures
        return response.data;
    } catch (error: any) {
        console.error("❌ News Detail API Error:", error);

        if (error.response) {
            console.error("📛 Detail Error Response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url
            });
        }

        throw error;
    }
};

// Get projects list for selection - ใช้ GET /news/developer/dashboard/projects
const getDeveloperNewsProjects = async (): Promise<ProjectSelectOption[]> => {
    try {
        const url = `/news/developer/dashboard/projects`;
        console.log("🔍 API Call: GET", url);

        const response = await axios.get(url);
        console.log("📋 Projects Response:", response.data);

        let projectsData: any[] = [];

        // ตรวจสอบ response structure
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

        // Format projects data สำหรับ Select component
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

        console.log("✅ Formatted Projects from API:", {
            count: formattedProjects.length,
            projects: formattedProjects
        });

        return formattedProjects;

    } catch (error: any) {
        console.error("❌ Projects API Error:", error);
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
        staleTime: 30 * 1000, // 30 seconds
        retry: (failureCount, error: any) => {
            // ไม่ retry กรณี 401, 403, 404
            if (error?.response?.status === 401 ||
                error?.response?.status === 403 ||
                error?.response?.status === 404) {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        onError: (error) => {
            console.error("❌ getDeveloperNewsQuery error:", error);
        },
        onSuccess: (data) => {
            console.log("✅ getDeveloperNewsQuery success:", {
                rowsCount: data?.rows?.length || 0,
                total: data?.total || 0
            });
        }
    });
};

// แก้ไข getDeveloperNewsDetailQuery ให้รับ options parameter ถูกต้อง
export const getDeveloperNewsDetailQuery = (newsId: string | number, options = {}) => {
    return useQuery({
        queryKey: ["developerNewsDetail", newsId],
        queryFn: () => getDeveloperNewsDetail(newsId),
        enabled: !!newsId, // Default enabled เมื่อมี newsId
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 404) return false;
            return failureCount < 2;
        },
        onError: (error) => {
            console.error("❌ getDeveloperNewsDetailQuery error:", error);
        },
        onSuccess: (data) => {
            console.log("✅ getDeveloperNewsDetailQuery success:", data);
        },
        ...options // spread options ที่ส่งมา (จะ override enabled ถ้ามี)
    });
};

export const getDeveloperNewsProjectsQuery = () => {
    return useQuery({
        queryKey: ["developerNewsProjects"],
        queryFn: getDeveloperNewsProjects,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        onError: (error) => {
            console.error("❌ getDeveloperNewsProjectsQuery error:", error);
        },
        onSuccess: (data) => {
            console.log("✅ getDeveloperNewsProjectsQuery success:", {
                projectsCount: data?.length || 0,
                sampleProject: data?.[0] || null
            });
        }
    });
};