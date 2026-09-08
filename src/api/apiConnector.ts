import type { AxiosRequestConfig, Method } from "axios";
import axios from "axios";

import { useAuthStore } from "@/store/authStore";

const ENABLE_API_LOGS = true;

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message: string;
  success: boolean;
}

interface ApiConnectorConfig {
  method: Method;
  url: string;
  bodyData?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  requiresAuth?: boolean;
}

export const apiConnector = async ({
  method,
  url,
  bodyData,
  headers = {},
  params = {},
  requiresAuth = true,
}: ApiConnectorConfig) => {
  const token = useAuthStore.getState().token;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (requiresAuth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (ENABLE_API_LOGS) {
    console.log("====================================");
    console.log("API CALL:", {
      method,
      url,
      bodyData,
      headers: requestHeaders,
      params,
    });
    console.log("====================================");
  }

  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      data: bodyData,
      headers: requestHeaders,
      params,
    };

    const response = await axiosInstance(config);

    if (ENABLE_API_LOGS) {
      console.log("====================================");
      console.log("API RESPONSE:", response.data);
      console.log("====================================");
    }

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (ENABLE_API_LOGS) {
        console.log("====================================");
        console.log("API ERROR:", error.response?.data ?? error);
        console.log("====================================");
      }

      throw error.response || error;
    }

    throw error;
  }
};
