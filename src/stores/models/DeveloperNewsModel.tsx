// src/stores/models/DeveloperNewsModel.tsx
import { createModel } from "@rematch/core";
import {
  DeveloperNewsType,
  DeveloperNewsState,
  GetDeveloperNewsParams,
} from "../interfaces/DeveloperNews";
import { RootModel } from "./index";
import axios from "axios";
import { message } from "antd";
import { encryptStorage } from "../../utils/encryptStorage";

const getDeveloperNewsData = async (params: GetDeveloperNewsParams) => {
  let url: string = `/news/developer/list/dashboard?`;
  const queryParams = new URLSearchParams();
  queryParams.append("perPage", params.perPage?.toString() || "10");
  queryParams.append("curPage", params.curPage.toString());

  if (params.search) {
    queryParams.append("search", params.search);
  }
  if (params.startMonth) {
    queryParams.append("startDate", params.startMonth);
  }
  if (params.endMonth) {
    queryParams.append("endDate", params.endMonth);
  }

  url = url + queryParams.toString();

  const token = await encryptStorage.getItem("access_token");
  if (token) {
    try {
      const result = await axios.get(url);

      if (result.status < 400) {
        // Handle new API response structure { statusCode: 200, result: { total: number, data: [] } }
        let allDataDeveloperNews: any[] = [];
        let total: number = 0;

        if (result.data?.statusCode === 200 && result.data.result) {
          const apiResult = result.data.result;

          if (apiResult.data && Array.isArray(apiResult.data)) {
            // Map ข้อมูลจาก API response ใหม่ให้ตรงกับ interface
            allDataDeveloperNews = apiResult.data.map((item: any) => {
              // แปลง newsToProjects เป็น projects format เดิม
              const projects =
                item.newsToProjects?.map((ntp: any) => ({
                  projectId: ntp.projectId,
                  projectName: ntp.project?.name || ntp.projectId,
                })) || [];

              // แปลง createBy เป็น createdBy format เดิม
              const createdBy = item.createBy
                ? {
                    givenName: item.createBy.givenName,
                    familyName: item.createBy.familyName,
                    sub: item.createBy.sub,
                  }
                : undefined;

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

            total = apiResult.total || 0;
          } else {
            allDataDeveloperNews = [];
            total = 0;
          }
        }
        // Fallback สำหรับ response structure เดิม
        else if (
          result.data?.result?.data &&
          Array.isArray(result.data.result.data)
        ) {
          allDataDeveloperNews = result.data.result.data;
          total = result.data.result.total || 0;
        } else if (
          result.data?.result?.rows &&
          Array.isArray(result.data.result.rows)
        ) {
          allDataDeveloperNews = result.data.result.rows;
          total = result.data.result.total || 0;
        } else if (
          result.data?.data?.rows &&
          Array.isArray(result.data.data.rows)
        ) {
          allDataDeveloperNews = result.data.data.rows;
          total = result.data.data.total || 0;
        } else if (result.data?.rows && Array.isArray(result.data.rows)) {
          allDataDeveloperNews = result.data.rows;
          total = result.data.total || 0;
        } else {
          allDataDeveloperNews = [];
          total = 0;
        }

        return {
          total: total,
          status: true,
          dataValue: allDataDeveloperNews,
        };
      } else {
        message.error(result.data.message || "API request failed");
        return {
          total: 0,
          status: false,
          dataValue: [],
        };
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch developer news data";
      message.error(errorMessage);

      return {
        total: 0,
        status: false,
        dataValue: [],
      };
    }
  } else {
    message.error("Authentication required. Please login again.");
    return {
      total: 0,
      status: false,
      dataValue: [],
    };
  }
};

const filterDataInit: GetDeveloperNewsParams = {
  perPage: 10,
  curPage: 1,
};

export const developerNews = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    filterData: filterDataInit,
  } as DeveloperNewsState & { filterData: GetDeveloperNewsParams },
  reducers: {
    updateLoadingState: (state, payload: boolean) => ({
      ...state,
      loading: payload,
    }),
    updateTableDataState: (state, payload: DeveloperNewsType[]) => ({
      ...state,
      tableData: payload,
    }),
    updateTotalState: (state, payload: number) => ({
      ...state,
      total: payload,
    }),
    updateFilterDataState: (state, payload: GetDeveloperNewsParams) => ({
      ...state,
      filterData: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableData(payload: GetDeveloperNewsParams) {
      dispatch.developerNews.updateLoadingState(true);

      try {
        const data = await getDeveloperNewsData(payload);

        if (data?.status) {
          dispatch.developerNews.updateTableDataState(data.dataValue);
          dispatch.developerNews.updateTotalState(data.total);
        } else {
          dispatch.developerNews.updateTableDataState([]);
          dispatch.developerNews.updateTotalState(0);
        }
      } catch (error) {
        dispatch.developerNews.updateTableDataState([]);
        dispatch.developerNews.updateTotalState(0);
      } finally {
        dispatch.developerNews.updateLoadingState(false);
      }
    },

    async refreshData() {
      const currentState = this.getState().developerNews;
      await dispatch.developerNews.getTableData(currentState.filterData);
    },
  }),
});
