export type PlanValidityType = "DURATION" | "FIXED_DATE";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  /** Price in paise (Razorpay's smallest unit). */
  price: number;
  /** Optional strike-through price in paise. */
  originalPrice: number | null;
  currency: string;
  /** DURATION → valid for `durationDays` from purchase; FIXED_DATE → valid until `expiresAt`. */
  validityType: PlanValidityType;
  durationDays: number | null;
  expiresAt: string | null;
  /** Discounted price is shown until this date. */
  offerValidTill: string | null;
  features: string[];
  order: number;
  isActive: boolean;
}

export interface SubscriptionPlansData {
  plans: SubscriptionPlan[];
}

export interface ActiveSubscription {
  id: string;
  planId: string;
  planName: string;
  status: "active" | "expired" | "cancelled";
  startsAt: string;
  expiresAt: string;
}

export interface MySubscriptionData {
  subscription: ActiveSubscription | null;
}

/** Returned by the backend after it creates a Razorpay order. */
export interface CreateOrderData {
  orderId: string;
  amount: number;
  currency: string;
  /** Public Razorpay key id (rzp_live_… / rzp_test_…). Never the secret. */
  keyId: string;
}

export interface RazorpaySuccessPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/** Body for POST /subscriptions/verify-payment (camelCase, per backend schema). */
export interface VerifyPaymentBody {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
