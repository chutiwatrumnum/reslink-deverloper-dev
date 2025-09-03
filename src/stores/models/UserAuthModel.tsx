import { createModel } from "@rematch/core";
import { message } from "antd";
import {
  UserType,
  LoginPayloadType,
  ResetPasswordPayloadType,
} from "../interfaces/User";
import { RootModel } from "./index";
import { encryptStorage } from "../../utils/encryptStorage";
import FailedModal from "../../components/common/FailedModal";
import { callSuccessModal } from "../../components/common/Modal";
import axios from "axios";

export const userAuth = createModel<RootModel>()({
  state: {
    userId: null,
    userFirstName: "",
    userLastName: "",
    isAuth: false,
    userToken: null,
  } as UserType,
  reducers: {
    updateUserIdState: (state, payload) => ({
      ...state,
      userId: payload,
    }),
    updateUserFirstNameState: (state, payload) => ({
      ...state,
      userFirstName: payload,
    }),
    updateUserLastNameState: (state, payload) => ({
      ...state,
      userLastName: payload,
    }),
    updateAuthState: (state, payload) => ({
      ...state,
      isAuth: payload,
    }),
  },
  effects: (dispatch) => ({
    async loginEffects(payload: LoginPayloadType) {
      try {
        const loginData = {
          username: payload.username,
          password: payload.password,
        };

        const userToken = await axios.post("/auth/developer/login", loginData);

        if (userToken.status >= 400) {
          FailedModal(userToken.data.message || "Login failed");
          return false;
        }

        // เก็บ tokens
        await encryptStorage.setItem(
          "access_token",
          userToken.data.access_token
        );
        if (userToken.data.refreshToken) {
          await encryptStorage.setItem(
            "refreshToken",
            userToken.data.refreshToken
          );
        } else if (userToken.data.refresh_token) {
          await encryptStorage.setItem(
            "refreshToken",
            userToken.data.refresh_token
          );
        }

        // ดึงข้อมูล developer
        try {
          const developerData = await axios.get("/my-developer");

          if (
            developerData.data &&
            developerData.data.data &&
            developerData.data.data.myDeveloperId
          ) {
            const devId = developerData.data.data.myDeveloperId;

            await encryptStorage.setItem("myDeveloperId", devId);
            await encryptStorage.setItem(
              "developerName",
              developerData.data.data.DeveloperName
            );
            await encryptStorage.setItem(
              "roleName",
              developerData.data.data.roleName
            );

            // ใช้ myDeveloperId เป็น projectId
            await encryptStorage.setItem("projectId", devId);
          } else {
            throw new Error("Developer data not found in response");
          }
        } catch (error) {
          // ถ้า API fail ให้ใช้ dummy data สำหรับ development
          await encryptStorage.setItem("myDeveloperId", "dev_fallback_id");
          await encryptStorage.setItem("developerName", "Developer");
          await encryptStorage.setItem("roleName", "Developer");
          await encryptStorage.setItem("projectId", "dev_fallback_id");
        }

        // ดึงข้อมูล profile (optional)
        try {
          const userData = await axios.get("/auth/profile");
          if (userData.data && userData.data.result) {
            await encryptStorage.setItem("userData", userData.data.result);
          } else if (userData.data) {
            await encryptStorage.setItem("userData", userData.data);
          }
        } catch {
          // Profile data ไม่จำเป็น ไม่ให้ fail
        }

        // อัปเดต auth state
        dispatch.userAuth.updateAuthState(true);
        callSuccessModal("Login successful!");
        return true;
      } catch (error: any) {
        let errorMessage = "Login failed. Please check your credentials.";
        if (error?.response?.status === 401) {
          errorMessage = "Invalid email or password.";
        } else if (error?.response?.status === 400) {
          errorMessage = error?.response?.data?.message || "Invalid request.";
        } else if (error?.response?.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error?.message) {
          errorMessage = error.message;
        }

        FailedModal(errorMessage);
        await dispatch.userAuth.onLogout();
        return false;
      }
    },

    async recoveryByEmail(payload: { email: string }) {
      try {
        const result = await axios.post("/users/forgot-password", payload);
        if (result.status >= 400) {
          FailedModal(result.data.message);
          return;
        }
        return true;
      } catch (error) {
        console.error("recoveryByEmail error", error);
      }
    },

    async resetPassword(payload: ResetPasswordPayloadType) {
      try {
        const result = await axios.put("/users/forgot-password", payload);
        if (result.status >= 400) {
          message.error(result.data.message);
          return false;
        }
        return true;
      } catch (error) {
        console.error("resetPassword error", error);
      }
    },

    async refreshTokenNew() {
      try {
        const refreshToken = await encryptStorage.getItem("refreshToken");
        if (!refreshToken || refreshToken === "undefined") {
          throw "refresh token not found";
        }

        const res = await axios.post("/auth/developer/refresh-token", {
          refreshToken: refreshToken,
        });

        if (res.status >= 400) {
          throw "refresh token expired";
        }

        if (!res.data.hasOwnProperty("access_token")) {
          throw "access_token not found in response";
        }

        // อัปเดต tokens
        await encryptStorage.setItem("access_token", res.data.access_token);
        if (res.data.refresh_token) {
          await encryptStorage.setItem("refreshToken", res.data.refresh_token);
        }

        dispatch.userAuth.updateAuthState(true);
        return true;
      } catch (error) {
        await dispatch.userAuth.onLogout();
        return false;
      }
    },

    async checkTokenValidity() {
      try {
        const access_token = await encryptStorage.getItem("access_token");
        let projectId = await encryptStorage.getItem("projectId");
        const myDeveloperId = await encryptStorage.getItem("myDeveloperId");

        if (!access_token) {
          return false;
        }

        // แก้ไข projectId ถ้าขาดหาย
        if (!projectId && myDeveloperId) {
          await encryptStorage.setItem("projectId", myDeveloperId);
          projectId = myDeveloperId;
        } else if (!projectId) {
          await encryptStorage.setItem("projectId", "restored_project_id");
          projectId = "restored_project_id";
        }

        // ถ้าเป็น mock token (development mode)
        if (access_token === "mock_access_token") {
          dispatch.userAuth.updateAuthState(true);
          return true;
        }

        // ตรวจสอบ token จริงโดยเรียก API
        try {
          await axios.get("/my-developer");
          dispatch.userAuth.updateAuthState(true);
          return true;
        } catch (apiError) {
          try {
            await axios.get("/auth/profile");
            dispatch.userAuth.updateAuthState(true);
            return true;
          } catch (profileError) {
            // ถ้า token หมดอายุ ลองใช้ refresh token
            const refreshResult = await dispatch.userAuth.refreshTokenNew();
            if (refreshResult) {
              dispatch.userAuth.updateAuthState(true);
              return true;
            } else {
              return false;
            }
          }
        }
      } catch (error) {
        return false;
      }
    },

    async onLogout() {
      try {
        // ลบทุกข้อมูลที่เกี่ยวข้อง
        await encryptStorage.removeItem("access_token");
        await encryptStorage.removeItem("refreshToken");
        await encryptStorage.removeItem("userData");
        await encryptStorage.removeItem("myDeveloperId");
        await encryptStorage.removeItem("developerName");
        await encryptStorage.removeItem("roleName");
        await encryptStorage.removeItem("projectId");

        // ลบ redirect URL ด้วย
        localStorage.removeItem("redirectAfterLogin");

        dispatch.userAuth.updateAuthState(false);
        return true;
      } catch (error) {
        // Force clear ทุกอย่างแม้จะ error
        await encryptStorage.removeItem("access_token");
        await encryptStorage.removeItem("refreshToken");
        await encryptStorage.removeItem("userData");
        await encryptStorage.removeItem("myDeveloperId");
        await encryptStorage.removeItem("developerName");
        await encryptStorage.removeItem("roleName");
        await encryptStorage.removeItem("projectId");
        localStorage.removeItem("redirectAfterLogin");

        dispatch.userAuth.updateAuthState(false);
        return false;
      }
    },
  }),
});
