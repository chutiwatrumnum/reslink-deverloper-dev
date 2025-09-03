// src/utils/mutationsGroup/developerNewsMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeveloperNewsAddNew, DeveloperNewsEditPayload } from "../../stores/interfaces/DeveloperNews";
import axios from "axios";
import { message } from "antd";

// Create developer news - ใช้ POST /news/developer/dashboard (ตามรูป API)
export const useCreateDeveloperNewsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 2,
        scope: { id: "createDeveloperNews" },
        mutationFn: async (payload: DeveloperNewsAddNew) => {
            try {
                // สร้าง datetime string ตาม format ที่ API ต้องการ
                const startDateTime = payload.startTime ?
                    `${payload.startDate}T${payload.startTime}:00.000Z` :
                    `${payload.startDate}T00:00:00.000Z`;

                const endDateTime = payload.endTime ?
                    `${payload.endDate}T${payload.endTime}:00.000Z` :
                    `${payload.endDate}T23:59:59.000Z`;

                // สร้าง payload ตาม format ที่ API ต้องการ
                const apiPayload = {
                    title: payload.title,
                    description: payload.description || "",
                    url: payload.url || "",
                    imageUrl: payload.imageUrl || "",
                    startDate: startDateTime,
                    endDate: endDateTime,
                    active: true,
                    isPublish: true,
                    projects: payload.projects || []
                };

                // ใช้ endpoint ที่ถูกต้องตาม API documentation
                const response = await axios.post(`/news/developer/dashboard`, apiPayload);

                // ตรวจสอบ response ตาม format ใหม่
                if (response.data?.statusCode && response.data.statusCode >= 400) {
                    const errorMessage = response.data?.message ||
                        response.data?.error ||
                        "Request failed";
                    throw new Error(errorMessage);
                } else if (response.status >= 400) {
                    const errorMessage = response.data?.message ||
                        response.data?.error ||
                        "Request failed";
                    throw new Error(errorMessage);
                }

                return response.data;
            } catch (error: any) {
                if (error.response) {
                    const errorMessage = error.response.data?.message ||
                        error.response.data?.error ||
                        `API Error: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw new Error(error.message || "Failed to create news");
            }
        },
        onSuccess: (data) => {
            message.success("News created successfully!");
            // Refresh news list
            queryClient.invalidateQueries({ queryKey: ["developerNews"] });
        },
        onError: (error: any) => {
            message.error(error.message || "Failed to create news");
        },
    });
};

// Update developer news - ใช้ PUT /news/developer/{id}/dashboard (ตามรูป API)
export const useUpdateDeveloperNewsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: { id: "updateDeveloperNews" },
        mutationFn: async ({ newsId, payload }: { newsId: string | number; payload: DeveloperNewsEditPayload }) => {
            try {
                // ใช้ endpoint ที่ถูกต้องตาม API documentation
                const endpoint = `/news/developer/${newsId}/dashboard`;

                // สร้าง datetime string ตาม format ที่ API ต้องการ
                const startDateTime = payload.startTime ?
                    `${payload.startDate}T${payload.startTime}:00.000Z` :
                    `${payload.startDate}T00:00:00.000Z`;

                const endDateTime = payload.endTime ?
                    `${payload.endDate}T${payload.endTime}:00.000Z` :
                    `${payload.endDate}T23:59:59.000Z`;

                // แก้ไข payload ให้ตรงกับที่ backend ต้องการ
                const apiPayload = {
                    id: typeof newsId === 'string' ? parseInt(newsId) : newsId, // เพิ่ม id field
                    title: payload.title,
                    description: payload.description || "",
                    url: payload.url || "",
                    imageUrl: payload.imageUrl || "",
                    startDate: startDateTime,
                    endDate: endDateTime,
                    active: true, // เพิ่ม active field
                    isPublish: true, // เพิ่ม isPublish field
                    projects: payload.projects || []
                };

                console.log("🔄 Update API Payload:", apiPayload);

                const response = await axios.put(endpoint, apiPayload);

                console.log("✅ Update Response:", response.data);

                // ตรวจสอบ response ตาม format ใหม่
                if (response.data?.statusCode && response.data.statusCode >= 400) {
                    throw new Error(response.data?.message || response.data?.error || "Update failed");
                } else if (response.status >= 400) {
                    throw new Error(response.data?.message || response.data?.error || "Update failed");
                }

                return response.data;
            } catch (error: any) {
                console.error("❌ Update Error:", error);

                if (error.response) {
                    const errorMessage = error.response.data?.message ||
                        error.response.data?.error ||
                        `Update failed: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw new Error(error.message || "Failed to update news");
            }
        },
        onSuccess: (data, { newsId }) => {
            message.success("News updated successfully!");
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ["developerNews"] });
            queryClient.invalidateQueries({ queryKey: ["developerNewsDetail", newsId] });
        },
        onError: (error: any) => {
            console.error("❌ Update Mutation Error:", error);
            message.error(error.message || "Failed to update news");
        },
    });
};

// Delete developer news - ใช้ DELETE /news/developer/{id}/dashboard (ตามรูป API)
export const useDeleteDeveloperNewsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: { id: "deleteDeveloperNews" },
        mutationFn: async (newsId: string | number) => {
            try {
                // ใช้ endpoint ที่ถูกต้องตาม API documentation
                const endpoint = `/news/developer/${newsId}/dashboard`;

                const response = await axios.delete(endpoint);

                // ตรวจสอบ response ตาม format ใหม่
                if (response.data?.statusCode && response.data.statusCode >= 400) {
                    throw new Error(response.data?.message || response.data?.error || "Delete failed");
                } else if (response.status >= 400) {
                    throw new Error(response.data?.message || response.data?.error || "Delete failed");
                }

                return response.data;
            } catch (error: any) {
                if (error.response) {
                    const errorMessage = error.response.data?.message ||
                        error.response.data?.error ||
                        `Delete failed: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw new Error(error.message || "Failed to delete news");
            }
        },
        onSuccess: (data, newsId) => {
            message.success("News deleted successfully!");
            // Refresh news list
            queryClient.invalidateQueries({ queryKey: ["developerNews"] });
        },
        onError: (error: any) => {
            message.error(error.message || "Failed to delete news");
        },
    });
};