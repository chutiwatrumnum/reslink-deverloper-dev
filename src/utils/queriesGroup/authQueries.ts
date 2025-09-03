// src/utils/queriesGroup/authQueries.ts (อัปเดตให้ใช้ API ใหม่)
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { encryptStorage } from "../../utils/encryptStorage";

// Services - Developer Data
const getDeveloperData = async () => {
  const url = `/my-developer`;
  const res = await axios.get(url);

  // เก็บข้อมูล developer ใหม่
  if (res.data && res.data.data) {
    encryptStorage.setItem("myDeveloperId", res.data.data.myDeveloperId);
    encryptStorage.setItem("developerName", res.data.data.DeveloperName);
    encryptStorage.setItem("roleName", res.data.data.roleName);
  }

  return res.data.data;
};

// Query Hook
export const getDeveloperDataQuery = () => {
  return useQuery({
    queryKey: ["developerData"],
    queryFn: getDeveloperData,
    enabled: false, // ไม่ auto-fetch ให้เรียกแค่เมื่อต้องการ
  });
};