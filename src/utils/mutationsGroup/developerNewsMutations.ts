// src/utils/mutationsGroup/developerNewsMutations.ts - Clean Version
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeveloperNewsAddNew, DeveloperNewsEditPayload } from "../../stores/interfaces/DeveloperNews";
import axios from "axios";
import { message } from "antd";

// Create developer news
export const useCreateDeveloperNewsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 2,
        scope: { id: "createDeveloperNews" },
        mutationFn: async (payload: DeveloperNewsAddNew) => {
            try {
                const apiPayload = {
                    title: payload.title,
                    description: payload.description || "",
                    url: payload.url || "",
                    imageUrl: payload.imageUrl || "",
                    startDate: payload.startDate,
                    endDate: payload.endDate,
                    startTime: payload.startTime || null,
                    endTime: payload.endTime || null,
                    active: true,
                    isPublish: true,
                    projects: payload.projects || []
                };

                const response = await axios.post(`/news/developer/dashboard`, apiPayload);

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
            queryClient.invalidateQueries({ queryKey: ["developerNews"] });
        },
        onError: (error: any) => {
            message.error(error.message || "Failed to create news");
        },
    });
};

// Update developer news
export const useUpdateDeveloperNewsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: { id: "updateDeveloperNews" },
        mutationFn: async ({ newsId, payload }: { newsId: string | number; payload: DeveloperNewsEditPayload }) => {
            try {
                const endpoint = `/news/developer/${newsId}/dashboard`;
                const apiPayload = {
                    id: typeof newsId === 'string' ? parseInt(newsId) : newsId,
                    title: payload.title,
                    description: payload.description || "",
                    url: payload.url || "",
                    imageUrl: payload.imageUrl || "",
                    startDate: payload.startDate,
                    endDate: payload.endDate,
                    startTime: payload.startTime || null,
                    endTime: payload.endTime || null,
                    active: true,
                    isPublish: true,
                    projects: payload.projects || []
                };

                const response = await axios.put(endpoint, apiPayload);

                if (response.data?.statusCode && response.data.statusCode >= 400) {
                    throw new Error(response.data?.message || response.data?.error || "Update failed");
                } else if (response.status >= 400) {
                    throw new Error(response.data?.message || response.data?.error || "Update failed");
                }

                return response.data;
            } catch (error: any) {
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
            queryClient.invalidateQueries({ queryKey: ["developerNews"] });
            queryClient.invalidateQueries({ queryKey: ["developerNewsDetail", newsId] });
        },
        onError: (error: any) => {
            message.error(error.message || "Failed to update news");
        },
    });
};

// Delete developer news
export const useDeleteDeveloperNewsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: { id: "deleteDeveloperNews" },
        mutationFn: async (newsId: string | number) => {
            try {
                const endpoint = `/news/developer/${newsId}/dashboard`;
                const response = await axios.delete(endpoint);

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
            queryClient.invalidateQueries({ queryKey: ["developerNews"] });
        },
        onError: (error: any) => {
            message.error(error.message || "Failed to delete news");
        },
    });
};