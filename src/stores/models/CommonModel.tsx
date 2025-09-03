import { createModel } from "@rematch/core";
import { CommonType } from "../interfaces/Common";
import { RootModel } from "./index";

export const common = createModel<RootModel>()({
  state: {
    masterData: undefined,
    accessibility: undefined,
    unitOptions: [],
    unitFilter: undefined,
  } as CommonType,
  reducers: {
    updateMasterData: (state, payload) => ({
      ...state,
      masterData: payload,
    }),
    updateAccessibility: (state, payload) => ({
      ...state,
      accessibility: payload,
    }),
    updateUnitOptions: (state, payload) => ({
      ...state,
      unitOptions: payload,
    }),
  },
  effects: (dispatch) => ({
    async getMasterData() {
      try {
        const axios = (await import("axios")).default;
        const data = await axios.get("/master");
        if (data.status >= 400) {
          console.error(data.data.message);
          return;
        }
        dispatch.common.updateMasterData(data.data.result);
      } catch (error) {
        console.error("getMasterData error:", error);
      }
    },

    async fetchUnitOptions() {
      try {
        const axios = (await import("axios")).default;
        const response = await axios.get<{ data: { unitNo: string; id: number }[] }>("/events/dashboard/unit");

        const formattedUnitOptions = response.data.data.map(({ unitNo, id }) => ({
          label: unitNo,
          value: id,
        }));

        dispatch.common.updateUnitOptions(formattedUnitOptions);
      } catch (error) {
        console.warn("Failed to fetch unit options, using mock data:", error);
        // Use mock data when API fails
        const mockUnitOptions = [
          { label: "Unit 101", value: 1 },
          { label: "Unit 102", value: 2 },
          { label: "Unit 201", value: 3 },
          { label: "Unit 202", value: 4 },
          { label: "Unit 301", value: 5 },
        ];
        dispatch.common.updateUnitOptions(mockUnitOptions);
      }
    },
  }),
}); 