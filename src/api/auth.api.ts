import type {
  ApiResponse,
  AuthUser,
  RegisterBody,
  SendOtpBody,
  VerifyOtpBody,
  VerifyOtpData,
} from "@/types";
import { apiConnector } from "./apiConnector";
import { authEndpoints } from "./apis";

const { SEND_OTP_API, VERIFY_OTP_API, REGISTER_API, LOGOUT_API } =
  authEndpoints;

// Send OTP
export const sendOtp = async (
  body: SendOtpBody,
): Promise<ApiResponse<null>> => {
  const { data } = await apiConnector({
    method: "POST",
    url: SEND_OTP_API,
    bodyData: body,
    requiresAuth: false,
  });

  return data;
};

// Verify OTP
export const verifyOtp = async (
  body: VerifyOtpBody,
): Promise<ApiResponse<VerifyOtpData>> => {
  const { data } = await apiConnector({
    method: "POST",
    url: VERIFY_OTP_API,
    bodyData: body,
    requiresAuth: false,
  });

  return data;
};

// Register
export const register = async (
  body: RegisterBody,
): Promise<ApiResponse<AuthUser>> => {
  const { data } = await apiConnector({
    method: "POST",
    url: REGISTER_API,
    bodyData: body,
    requiresAuth: true,
  });

  return data;
};

// Logout
export const logout = async (): Promise<ApiResponse<null>> => {
  const { data } = await apiConnector({
    method: "POST",
    url: LOGOUT_API,
    requiresAuth: true,
  });

  return data;
};
