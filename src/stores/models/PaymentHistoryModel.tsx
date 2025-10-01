import { createModel } from "@rematch/core";
import { RootModel } from "./index";
import axios from "axios";
import { encryptStorage } from "../../utils/encryptStorage";
// Types
import {
  PaymentHistoryParams,
  PaymentHistoryType,
  PaymentHistoryState,
} from "../interfaces/PaymentHistory";
import { message } from "antd";

const getPaymentHistoryData = async (params: PaymentHistoryParams) => {
  let url: string = `/payment-history/dashboard?`;
  const queryParams = new URLSearchParams();
  queryParams.append("perPage", params.perPage.toString() || "10");
  queryParams.append("curPage", params.curPage.toString());

  if (params.search) {
    queryParams.append("search", params.search);
  }
  if (params.paymentStatusIds && params.paymentStatusIds.length > 0) {
    queryParams.append("paymentStatusIds", params.paymentStatusIds.join(","));
  }
  if (params.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params.endDate) {
    queryParams.append("endDate", params.endDate);
  }

  url = url + queryParams.toString();
  const token = await encryptStorage.getItem("access_token");
  if (token) {
    try {
      console.log("Fetching payment history data from:", url);
      const result = await axios.get(url);

      if (result.status < 400) {
        const allDataPaymentHistory =
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
          dataValue: allDataPaymentHistory,
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
      console.error("Payment History API error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to fetch payment history data";
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

const filterDataInit: PaymentHistoryParams = {
  perPage: 10,
  curPage: 1,
};

export const paymentHistory = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    qrCode: "",
    filterData: filterDataInit,
  } as PaymentHistoryState & { filterData: PaymentHistoryParams },
  reducers: {
    updateLoadingState: (state, payload: boolean) => ({
      ...state,
      loading: payload,
    }),
    updateTableDataState: (state, payload: PaymentHistoryType[]) => ({
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
    updateFilterDataState: (state, payload: PaymentHistoryParams) => ({
      ...state,
      filterData: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableData(payload: PaymentHistoryParams) {
      dispatch.paymentHistory.updateLoadingState(true);

      try {
        console.log("Getting payment history table data with params:", payload);
        const data = await getPaymentHistoryData(payload);

        if (data?.status) {
          dispatch.paymentHistory.updateTableDataState(data.dataValue);
          dispatch.paymentHistory.updateTotalState(data.total);
          console.log("Project management data loaded:", {
            count: data.dataValue.length,
            total: data.total,
          });
        } else {
          dispatch.paymentHistory.updateTableDataState([]);
          dispatch.paymentHistory.updateTotalState(0);
        }
      } catch (error) {
        console.error("Error in getTableData effect:", error);
        dispatch.paymentHistory.updateTableDataState([]);
        dispatch.paymentHistory.updateTotalState(0);
      } finally {
        dispatch.paymentHistory.updateLoadingState(false);
      }
    },

    async refreshData() {
      const currentState = this.getState().paymentHistory;
      await dispatch.paymentHistory.getTableData(currentState.filterData);
    },
  }),
});
