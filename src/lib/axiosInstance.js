import axios from "axios";
import AppConfig from "./app-config";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: AppConfig.api_baseurl,
  timeout: 10000, // Set a timeout limit for requests
  headers: AppConfig.headers,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    toast.error("Request failed. Please try again.");
    // return Promise.reject(error);
  }
);



axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.responseMessage || data?.data?.message || data;
      const requestData = error.config?.data;
      console.log('error.response', error.response)
      console.log('requestData', requestData)

      switch (status) {
        case 401:
          localStorage.clear();
          toast.error("Your session has expired.");
          window.location.href = "/";
          break;

        case 402:
          toast.error(message || "You don't have permission.");
          // toast.error(message || "You don't have permission.");
          break;

        case 403:
          // toast.error(message || "Forbidden access. You don't have permission.");
          toast.error(message || "Forbidden access. You don't have permission.");
          break;

        case 404:
          if (message) {
            toast.error(message || "Resource not found.");
            // toast.error(message || "Resource not found.");
          }
          break;
        case 409:
          if (message) {
            toast.error(message || "Name already exists");
          }
          break;
        case 412:
          if (message) {
            toast.error(message || "Item updated by another user, please reload.");
          }
          break;

        case 500:
          toast.error(message || "Internal server error. Please try again later.");
          // toast.error(message || "Internal server error. Please try again later.");
          break;

        default:
          // 👇 Corrected default case handling
          try {
            const parsedData = typeof requestData === "string" ? JSON.parse(requestData) : requestData;

            if (message == 'Unknown error code: none') {
              toast.error(`This Eway bill number is not valid`);
            } else if (parsedData?.lr_freight?.length === 0) {
              // Do not show error toast when lr_freight is empty
            } else {
              if (message) {
                toast.error(message); // Show common toast for meaningful errors
              }
            }
          } catch (e) {
            // Fallback in case parsing fails or config is malformed
            if (message) {
              toast.error(message);
            }
          }
      }

      return Promise.reject(error); // 🔥 Required to allow catch blocks to run
    } else if (error.request) {
      toast.error("No response from the server. Please check your connection.");
      return Promise.reject(error);
    } else {
      toast.error("Request failed. Please try again.");
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;

