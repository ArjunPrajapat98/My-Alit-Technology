import { API, axiosInstance } from "../../lib";

export const getInvoiceList = ({ from, to, invoiceID } = {}) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (invoiceID) params.invoiceID = invoiceID;
    return axiosInstance
        .get(`${API.INVOICE_GET_LIST}`, { params })
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};

export const getInvoiceMetrics = ({ from, to }) => {
    return axiosInstance
        .get(`${API.INVOICE_GET_METRICS}`, { params: { fromDate: from, toDate: to } })
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};


export const getInvoiceTrend12m = () => {
    return axiosInstance
        .get(`${API.INVOICE_GET_TREND_12M}`)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};


export const getInvoiceTopItems = ({ from, to, topN = 5 }) => {
    return axiosInstance
        .get(`${API.INVOICE_TOP_ITEMS}`, { params: { from, to, topN } })
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};


export const saveInvoice = (data = {}) => {
    return axiosInstance
        .post(`${API.INVOICE_INSERT_UPDATE}`, data)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};

export const getSingleInvoiceDetails = (id) => {
    return axiosInstance
        .get(`${API.INVOICE_DELETE}/${id}`)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};

export const deleteInvoice = (id) => {
    return axiosInstance
        .delete(`${API.INVOICE_DELETE}/${id}`)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
};
