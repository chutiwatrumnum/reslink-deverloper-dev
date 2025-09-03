import axios from "axios";

import { paramsdata } from "./paramsAPI";
import { encryptStorage } from "../../../../utils/encryptStorage";
import { message } from "antd";
const getdataresidentlist = async (params: any) => {
  let url: string = `/users/list?`;
  const resultparams = await paramsdata(params);
  // console.log(resultparams);
  if (resultparams.status) {
    url = url + resultparams.paramsstr;
    // console.log("url:", url);
  }
  const token = await encryptStorage.getItem("access_token");
  if (token) {
    try {
      const result = await axios.get(url);

      if (result.status < 400) {
        const AllDataResident = result.data.result.rows;
        // console.log(AllDataResident);

        return {
          total: result.data.result.total,
          status: true,
          dataValue: AllDataResident,
        };
      } else {
        message.error(result.data.message);
        console.warn("status code:", result.status);
        console.warn("data error:", result.data);
      }
    } catch (err) {
      console.error("err:", err);
    }
  } else {
    console.log("====================================");
    console.log("token undefined.....");
    console.log("====================================");
  }
};

const deleteResidentId = async (id: string) => {
  try {
    const resultDelete = await axios.delete(`/users/delete/${id}`);
    console.log("resultDelete:", resultDelete);

    if (resultDelete.status === 200) {
      return {
        status: true,
      };
    } else {
      message.error(resultDelete.data.message);
      return {
        status: false,
      };
    }
  } catch (err) {
    console.error(err);
    return {
      status: false,
    };
  }
};



export {
  getdataresidentlist,
  deleteResidentId,
};
