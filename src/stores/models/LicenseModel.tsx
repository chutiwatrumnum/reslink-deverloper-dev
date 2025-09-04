// src/stores/models/LicenseModel.tsx
import { createModel } from "@rematch/core";
import {
  LicenseItem,
  LicenseState,
  GetLicenseParams,
  LicenseResponse,
  mapPaymentStatusToLicenseStatus,
  formatBuyingDate,
} from "../interfaces/License";
import { RootModel } from "./index";
import axios from "axios";
import { message } from "antd";
import { encryptStorage } from "../../utils/encryptStorage";

const getLicenseData = async (params: GetLicenseParams) => {
  let url: string = `/license/dashboard?`;
  const queryParams = new URLSearchParams();

  queryParams.append("perPage", params.perPage?.toString() || "10");
  queryParams.append("curPage", params.curPage.toString());

  if (params.search) {
    queryParams.append("search", params.search);
  }
  if (params.paymentStatus) {
    queryParams.append("paymentStatus", params.paymentStatus);
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
      const result = await axios.get(url);

      if (result.status < 400) {
        let allDataLicense: LicenseItem[] = [];
        let total: number = 0;

        // Handle API response structure { statusCode: 200, result: { total: number, data: [] } }
        if (result.data?.statusCode === 200 && result.data.result) {
          const apiResult = result.data.result;

          if (apiResult.data && Array.isArray(apiResult.data)) {
            // Map ข้อมูลจาก API response ให้ตรงกับ interface และเพิ่ม display fields
            allDataLicense = apiResult.data.map((item: any) => {
              const licenseStatus = mapPaymentStatusToLicenseStatus(
                item.paymentStatus
              );
              const buyingDate = formatBuyingDate(item.createdAt);

              return {
                id: item.id,
                project: item.project,
                paymentStatus: item.paymentStatus,
                orderNo: item.orderNo,
                createdAt: item.createdAt,
                // เพิ่ม display fields สำหรับ UI
                packageName: "Standard", // ตั้งค่า default หรือดึงจาก API ถ้ามี
                buyingDate: buyingDate,
                status: licenseStatus,
              };
            });

            total = apiResult.total || 0;
          } else {
            allDataLicense = [];
            total = 0;
          }
        }
        // Fallback สำหรับ response structure อื่นๆ
        else if (
          result.data?.result?.data &&
          Array.isArray(result.data.result.data)
        ) {
          allDataLicense = result.data.result.data;
          total = result.data.result.total || 0;
        } else if (result.data?.data && Array.isArray(result.data.data)) {
          allDataLicense = result.data.data;
          total = result.data.total || 0;
        } else {
          allDataLicense = [];
          total = 0;
        }

        return {
          total: total,
          status: true,
          dataValue: allDataLicense,
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
        err.response?.data?.message || "Failed to fetch license data";
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

const filterDataInit: GetLicenseParams = {
  perPage: 10,
  curPage: 1,
};

export const license = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    filterData: filterDataInit,
  } as LicenseState,
  reducers: {
    updateLoadingState: (state, payload: boolean) => ({
      ...state,
      loading: payload,
    }),
    updateTableDataState: (state, payload: LicenseItem[]) => ({
      ...state,
      tableData: payload,
    }),
    updateTotalState: (state, payload: number) => ({
      ...state,
      total: payload,
    }),
    updateFilterDataState: (state, payload: GetLicenseParams) => ({
      ...state,
      filterData: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableData(payload: GetLicenseParams) {
      dispatch.license.updateLoadingState(true);

      try {
        const data = await getLicenseData(payload);

        if (data?.status) {
          dispatch.license.updateTableDataState(data.dataValue);
          dispatch.license.updateTotalState(data.total);
        } else {
          dispatch.license.updateTableDataState([]);
          dispatch.license.updateTotalState(0);
        }
      } catch (error) {
        dispatch.license.updateTableDataState([]);
        dispatch.license.updateTotalState(0);
      } finally {
        dispatch.license.updateLoadingState(false);
      }
    },

    async refreshData() {
      const currentState = this.getState().license;
      await dispatch.license.getTableData(currentState.filterData);
    },
  }),
});
