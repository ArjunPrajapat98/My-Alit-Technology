import { API, axiosInstance } from "../../lib";

export const createSignup = (data = {}) => {
    return axiosInstance
        .post(`${API.SIGN_UP}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};

export const createLogin = (data = {}) => {
    return axiosInstance
        .post(`${API.LOGIN}`, data)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};