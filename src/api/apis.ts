// BASE URL
export const BASE_URL = "http://192.168.1.170:4000/api/v1";
// export const BASE_URL = "http://192.168.1.170:3000";
// export const BASE_URL = "http://10.212.194.191:3000";

// AUTH ENDPOINTS
export const authEndpoints = {
  SEND_OTP_API: BASE_URL + "/auth/send-otp",
  VERIFY_OTP_API: BASE_URL + "/auth/verify-otp",
  REGISTER_API: BASE_URL + "/auth/register",
  LOGOUT_API: BASE_URL + "/auth/logout",
};
