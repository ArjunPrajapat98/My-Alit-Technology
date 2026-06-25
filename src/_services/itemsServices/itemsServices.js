import { API, axiosInstance } from "../../lib";

export const getItemsList = (data = {}) => {
    return axiosInstance
        .get(`${API.ITEM_GET_LIST}`, data)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};

export const createNewItem = (data = {}) => {
    return axiosInstance
        .post(`${API.INITIAL_ITEM}`, data)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};

export const getItemById = (data = {}) => {
    return axiosInstance
        .get(`${API.FETCH_ITEM_LIST}`, data)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};

export const saveItem = (data = {}) => {
    return axiosInstance
        .put(`${API.ITEM_INSERT_UPDATE}`, data)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};

export const deleteItem = (itemId) => {
    return axiosInstance
        .delete(`${API.INITIAL_ITEM}/${itemId}`)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};

export const getItemLookupList = (data = {}) => {
    return axiosInstance
        .get(`${API.ITEM_GET_LOOKUP_LIST}`, data)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};