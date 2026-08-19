/// <reference types="vite/client" />

/** Payload passed to the Razorpay Checkout `handler` on a successful payment. */
interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/** Payload passed to the `payment.failed` event. */
interface RazorpayFailureResponse {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
    step?: string;
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void): void;
}

interface Window {
  /** Loaded from the checkout.js script tag in index.html. */
  Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
}
