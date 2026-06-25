import { API, axiosInstance } from "../../lib";

export const uploadFiles = (data = {}) => {
  return axiosInstance
    .post(API.UPLOAD_ITEM_IMAGE, data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      if (err) {
        return err?.response?.data
      }
    });
};

export const getThumbnilImage = (id) => {
  return axiosInstance
    .get(API.GET_THUMBNIL + `/${id}`)
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      if (err) {
        return err?.response?.data
      }
    });
};