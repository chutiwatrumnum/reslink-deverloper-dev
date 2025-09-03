import { createModel } from "@rematch/core";
import {
  ProjectManageType,
  conditionPage,
  ProjectManagementParams,
  ProjectManagementState,
} from "../interfaces/ProjectManage";
import { RootModel } from "./index";
import axios from "axios";
import { message } from "antd";
import { encryptStorage } from "../../utils/encryptStorage";

const getProjectData = async (params: conditionPage) => {
  let url: string = `/project/developer/dashboard?`;

  const queryParams = new URLSearchParams();
  queryParams.append("perPage", params.perPage.toString());
  queryParams.append("curPage", params.curPage.toString());
  queryParams.append("isActivated", "true");

  if (params.search) {
    queryParams.append("search", params.search);
  }
  if (params.sort && params.sortBy) {
    queryParams.append("sortBy", params.sortBy);
    queryParams.append("sort", params.sort.slice(0, -3)); // remove 'end' from 'ascend'/'descend'
  }

  url = url + queryParams.toString();
  const token = await encryptStorage.getItem("access_token");
  if (token) {
    try {
      console.log("Fetching project management data from:", url);
      const result = await axios.get(url);

      if (result.status < 400) {
        const allDataProjectManagement =
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
          dataValue: allDataProjectManagement,
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
      console.error("Project management API error:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to fetch project management data";
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

const filterDataInit: ProjectManagementParams = {
  perPage: 10,
  curPage: 1,
};

export const projectManagement = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    qrCode: "",
    filterData: filterDataInit,
  } as ProjectManagementState & { filterData: ProjectManagementParams },
  reducers: {
    updateLoadingState: (state, payload: boolean) => ({
      ...state,
      loading: payload,
    }),
    updateTableDataState: (state, payload: ProjectManageType[]) => ({
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
    updateFilterDataState: (state, payload: ProjectManagementParams) => ({
      ...state,
      filterData: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableData(payload: ProjectManagementParams) {
      dispatch.projectManagement.updateLoadingState(true);

      try {
        console.log(
          "Getting project management table data with params:",
          payload
        );
        const data = await getProjectData(payload);

        if (data?.status) {
          dispatch.projectManagement.updateTableDataState(data.dataValue);
          dispatch.projectManagement.updateTotalState(data.total);
          console.log("Project management data loaded:", {
            count: data.dataValue.length,
            total: data.total,
          });
        } else {
          dispatch.projectManagement.updateTableDataState([]);
          dispatch.projectManagement.updateTotalState(0);
        }
      } catch (error) {
        console.error("Error in getTableData effect:", error);
        dispatch.projectManagement.updateTableDataState([]);
        dispatch.projectManagement.updateTotalState(0);
      } finally {
        dispatch.projectManagement.updateLoadingState(false);
      }
    },

    async refreshData() {
      const currentState = this.getState().projectManagement;
      await dispatch.projectManagement.getTableData(currentState.filterData);
    },
  }),
});
