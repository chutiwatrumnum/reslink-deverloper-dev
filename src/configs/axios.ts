import axios from "axios";
import { encryptStorage } from "../utils/encryptStorage";
import { API_URL } from "./configs";

// console.log(API_URL, 'API_URL')
axios.defaults.baseURL = API_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";

axios.interceptors.request.use(
  async (request) => {
    const access_token = await encryptStorage.getItem("access_token");
    const myDeveloperId = await encryptStorage.getItem("myDeveloperId");

    // อัปเดต Authorization header
    if (access_token !== undefined && access_token !== null) {
      request.headers.Authorization = `Bearer ${access_token}`;
    }

    // อัปเดต x-api-key header ด้วย developer ID
    if (myDeveloperId !== undefined && myDeveloperId !== null) {
      request.headers["x-api-key"] = myDeveloperId;
      // console.log("🔑 Using developer ID as API key:", myDeveloperId);
    }

    return request;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log errors
    if (error.response?.status === 401) {
      console.warn("🔐 Unauthorized (401):", error.config?.url);
    } else if (error.response?.status === 403) {
      console.warn("🚫 Forbidden (403):", error.config?.url);
    } else if (error.response?.status === 404) {
      console.warn("🔍 Not Found (404):", error.config?.url);
    } else if (error.response?.status >= 500) {
      console.error("🚨 Server error:", error.response?.status, error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default axios;