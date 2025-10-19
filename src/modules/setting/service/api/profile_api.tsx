// src/modules/setting/service/api/profile_api.tsx

import axios from "axios";
import { message } from "antd";
import {
  ProfileDetail,
  editProfileDetail,
} from "../../../../stores/interfaces/Profile";

const getDataProfile = async () => {
  let url: string = `/users/developer/profile`;
  try {
    const result = await axios.get(url);
    if (result.status === 200) {
      const profile = result.data.result;
      const profileDetail: ProfileDetail = {
        userId: profile.userId,
        lastName: profile.lastName,
        firstName: profile.firstName,
        middleName: profile.middleName || null,
        nickName: profile.nickName,
        email: profile.email,
        imageProfile: profile.imageProfile,
        contact: profile.contact,
        allowNotifications: profile.allowNotifications,
        callAllowNotification: profile.callAllowNotification,
        roleName: profile.roleName,
        roleCode: profile.roleCode,
        developerName: profile.developerName,
      };
      return {
        status: true,
        data: profileDetail,
      };
    } else {
      console.warn("status code:", result.status);
      console.warn("data error:", result.data);
    }
  } catch (err) {
    console.error("err:", err);
  }
};

// อัปเดตฟังก์ชันนี้ให้รองรับทั้งรูปภาพและข้อมูลอื่นๆ
const EditDataProfile = async (data: editProfileDetail) => {
  try {
    const result = await axios.put(`/users/developer/image-profile`, data);
    if (result.status === 200) {
      return true;
    } else {
      message.error(result.data.message);
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
};

// ฟังก์ชันใหม่สำหรับอัปเดตข้อมูล profile ทั้งหมดผ่าน API endpoint ใหม่
export interface UpdateProfilePayload {
  givenName: string;
  middleName?: string | null;
  familyName: string;
  contact?: string;
}

const updateProfile = async (data: UpdateProfilePayload) => {
  try {
    const result = await axios.put(`/users/developer/profile`, data);
    if (result.status === 200) {
      return {
        status: true,
        data: result.data,
      };
    } else {
      message.error(result.data.message || "Failed to update profile");
      return {
        status: false,
        error: result.data.message,
      };
    }
  } catch (err: any) {
    console.error("Error updating profile:", err);
    message.error(err.response?.data?.message || "Failed to update profile");
    return {
      status: false,
      error: err.response?.data?.message || "Unknown error",
    };
  }
};

// ฟังก์ชันเดิมสำหรับอัปเดตชื่อ (deprecated - ใช้ updateProfile แทน)
const updateUserNames = async (
  userId: string,
  data: {
    givenName: string;
    middleName?: string;
    familyName: string;
  }
) => {
  try {
    const result = await axios.put(`/users/${userId}`, data);
    if (result.status === 200) {
      return {
        status: true,
        data: result.data,
      };
    } else {
      message.error(result.data.message || "Failed to update profile");
      return {
        status: false,
        error: result.data.message,
      };
    }
  } catch (err: any) {
    console.error("Error updating user names:", err);
    message.error(err.response?.data?.message || "Failed to update profile");
    return {
      status: false,
      error: err.response?.data?.message || "Unknown error",
    };
  }
};

// ฟังก์ชันสำหรับเปลี่ยนรหัสผ่าน
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordResponse {
  status: boolean;
  data?: any;
  error?: string;
}

export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  try {
    const result = await axios.put("/auth/developer/change-password", {
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
      confirmNewPassword: payload.confirmNewPassword,
    });

    if (result.status === 200) {
      return {
        status: true,
        data: result.data,
      };
    } else {
      return {
        status: false,
        error: result.data?.message || "Failed to change password",
      };
    }
  } catch (error: any) {
    if (error.response) {
      const errorMessage =
        error.response.data?.message || "Failed to change password";

      if (error.response.status === 400) {
        return {
          status: false,
          error: errorMessage || "Invalid password format",
        };
      } else if (error.response.status === 401) {
        return {
          status: false,
          error: "Current password is incorrect",
        };
      } else if (error.response.status === 403) {
        return {
          status: false,
          error: "You don't have permission to change password",
        };
      }

      return {
        status: false,
        error: errorMessage,
      };
    } else if (error.request) {
      return {
        status: false,
        error: "Network error. Please check your connection.",
      };
    } else {
      return {
        status: false,
        error: "An unexpected error occurred",
      };
    }
  }
};

export { getDataProfile, EditDataProfile, updateUserNames, updateProfile };
