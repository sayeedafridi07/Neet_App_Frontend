// BASE URL
export const BASE_URL = "http://192.168.1.170:4000/api/v1";
// export const BASE_URL = "https://neet-app-backend-x7wi.onrender.com/api/v1";

// AUTH ENDPOINTS
export const authEndpoints = {
  SEND_OTP_API: BASE_URL + "/auth/send-otp",
  VERIFY_OTP_API: BASE_URL + "/auth/verify-otp",
  REGISTER_API: BASE_URL + "/auth/register",
  LOGOUT_API: BASE_URL + "/auth/logout",
};

// AUDIO ENDPOINTS
export const audioLectureEndpoints = {
  AUDIO_LECTURES_API: BASE_URL + "/audio-lectures",
};

export const keywordRevisionEndpoints = {
  KEYWORD_REVISIONS_API: BASE_URL + "/keyword-revisions/student",
};

// CLASS ENDPOINTS
export const classEndpoints = {
  CLASSES_API: BASE_URL + "/classes",
};

// QUIZ ENDPOINTS
export const quizEndpoints = {
  QUIZZES_API: BASE_URL + "/quizzes",
  GET_QUIZZES_API: BASE_URL + "/quizzes/student",
};

// SUBJECT ENDPOINTS
export const subjectEndpoints = {
  SUBJECTS_API: BASE_URL + "/subjects",
};

// QUIZ ATTEMPT ENDPOINTS (student)
export const quizAttemptEndpoints = {
  START_ATTEMPT_API: (quizId: string) =>
    `${BASE_URL}/quizzes/${encodeURIComponent(quizId)}/start`,
  SAVE_ANSWER_API: (attemptId: string) =>
    `${BASE_URL}/quizzes/attempts/${encodeURIComponent(attemptId)}/answers`,
  SUBMIT_ATTEMPT_API: (attemptId: string) =>
    `${BASE_URL}/quizzes/attempts/${encodeURIComponent(attemptId)}/submit`,
  RESULT_API: (attemptId: string) =>
    `${BASE_URL}/quizzes/attempts/${encodeURIComponent(attemptId)}/result`,
};

// SUBSCRIPTION ENDPOINTS
export const subscriptionEndpoints = {
  PLANS_API: BASE_URL + "/subscriptions/plans",
  MY_SUBSCRIPTION_API: BASE_URL + "/subscriptions/me",
  CREATE_ORDER_API: BASE_URL + "/subscriptions/checkout",
  VERIFY_PAYMENT_API: BASE_URL + "/subscriptions/verify-payment",
};

// USER ENDPOINTS
export const userEndpoints = {
  ME_API: BASE_URL + "/users/me",
};
