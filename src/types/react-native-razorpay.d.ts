declare module "react-native-razorpay" {
  import type { RazorpaySuccessPayload } from "@/types";

  export interface RazorpayOptions {
    key: string;
    order_id: string;
    amount: number;
    currency: string;
    name?: string;
    description?: string;
    image?: string;
    prefill?: { name?: string; email?: string; contact?: string };
    theme?: { color?: string };
    [key: string]: unknown;
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpaySuccessPayload>;
  };
  export default RazorpayCheckout;
}
