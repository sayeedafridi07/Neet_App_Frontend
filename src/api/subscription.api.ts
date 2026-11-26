import type {
  ApiResponse,
  CreateOrderData,
  MySubscriptionData,
  SubscriptionPlansData,
  VerifyPaymentBody,
} from "@/types";
import { apiConnector } from "./apiConnector";
import { subscriptionEndpoints } from "./apis";

const { PLANS_API, MY_SUBSCRIPTION_API, CREATE_ORDER_API, VERIFY_PAYMENT_API } =
  subscriptionEndpoints;

export const getSubscriptionPlans = async (): Promise<
  ApiResponse<SubscriptionPlansData>
> => {
  const { data } = await apiConnector({ method: "GET", url: PLANS_API });
  return data;
};

export const getMySubscription = async (): Promise<
  ApiResponse<MySubscriptionData>
> => {
  const { data } = await apiConnector({ method: "GET", url: MY_SUBSCRIPTION_API });
  return data;
};

/** Backend creates the Razorpay order (amount is decided server-side). */
export const createSubscriptionOrder = async (
  planId: string,
): Promise<ApiResponse<CreateOrderData>> => {
  const { data } = await apiConnector({
    method: "POST",
    url: CREATE_ORDER_API,
    bodyData: { planId },
  });
  return data;
};

/** Backend verifies the HMAC signature and activates the subscription. */
export const verifySubscriptionPayment = async (
  body: VerifyPaymentBody,
): Promise<ApiResponse<MySubscriptionData>> => {
  const { data } = await apiConnector({
    method: "POST",
    url: VERIFY_PAYMENT_API,
    bodyData: body,
  });
  return data;
};
