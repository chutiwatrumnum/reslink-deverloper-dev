import { createModel } from "@rematch/core";
import {
  DeveloperTeamType,
  DeveloperTeamState,
  DeveloperTeamListParams,
} from "../interfaces/DeveloperTeam";
import { RootModel } from "./index";
import axios from "axios";
import { message } from "antd";
import { encryptStorage } from "../../utils/encryptStorage";

const getDeveloperTeamListData = async (params: DeveloperTeamListParams) => {
  let url: string = `/dev-team-management/list?`;
  const queryParams = new URLSearchParams();
  queryParams.append("perPage", params.perPage.toString());
  queryParams.append("curPage", params.curPage.toString());
  queryParams.append("verifyByJuristic", "true");
  queryParams.append("isActive", "true");

  if (params.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params.search) {
    queryParams.append("search", params.search);
  }
  if (params.sort && params.sortBy) {
    queryParams.append("sortBy", params.sortBy);
    queryParams.append("sort", params.sort.slice(0, -3));
  }

  url = url + queryParams.toString();

  const token = await encryptStorage.getItem("access_token");
  if (token) {
    try {
      console.log("Fetching developer team data from:", url);
      const result = await axios.get(url);

      if (result.status < 400) {
        const allDataDeveloperTeam =
          result.data.result?.rows ||
          result.data.data?.rows ||
          result.data.rows ||
          [];

        return {
          total:
            result.data.result?.total ||
            result.data.data?.total ||
            result.data.total ||
            0,
          status: true,
          dataValue: allDataDeveloperTeam,
        };
      } else {
        message.error(result.data.message);
        console.warn("status code:", result.status);
        console.warn("data error:", result.data);
        return {
          total: 0,
          status: false,
          dataValue: [],
        };
      }
    } catch (err: any) {
      console.error("Developer team API error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to fetch developer team data";
      message.error(errorMessage);

      return {
        total: 0,
        status: false,
        dataValue: [],
      };
    }
  } else {
    console.log("====================================");
    console.log("token undefined.....");
    console.log("====================================");
    return {
      total: 0,
      status: false,
      dataValue: [],
    };
  }
};

const filterDataInit: DeveloperTeamListParams = {
  perPage: 10,
  curPage: 1,
};

export const developerTeam = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    qrCode: "",
    filterData: filterDataInit,
  } as DeveloperTeamState & { filterData: DeveloperTeamListParams },
  reducers: {
    updateLoadingState: (state, payload: boolean) => ({
      ...state,
      loading: payload,
    }),
    updateTableDataState: (state, payload: DeveloperTeamType[]) => ({
      ...state,
      tableData: payload,
    }),
    updateTotalState: (state, payload: number) => ({
      ...state,
      total: payload,
    }),
    updateQrCodeState: (state, payload: string) => ({
      ...state,
      qrCode: payload,
    }),
    updateFilterDataState: (state, payload: DeveloperTeamListParams) => ({
      ...state,
      filterData: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableData(payload: DeveloperTeamListParams) {
      dispatch.developerTeam.updateLoadingState(true);

      try {
        console.log("Getting developer team table data with params:", payload);
        const data = await getDeveloperTeamListData(payload);

        if (data?.status) {
          dispatch.developerTeam.updateTableDataState(data.dataValue);
          dispatch.developerTeam.updateTotalState(data.total);
          console.log("Developer team data loaded:", {
            count: data.dataValue.length,
            total: data.total,
          });
        } else {
          dispatch.developerTeam.updateTableDataState([]);
          dispatch.developerTeam.updateTotalState(0);
        }
      } catch (error) {
        console.error("Error in getTableData effect:", error);
        dispatch.developerTeam.updateTableDataState([]);
        dispatch.developerTeam.updateTotalState(0);
      } finally {
        dispatch.developerTeam.updateLoadingState(false);
      }
    },

    async refreshData() {
      const currentState = this.getState().developerTeam;
      await dispatch.developerTeam.getTableData(currentState.filterData);
    },
  }),
});
