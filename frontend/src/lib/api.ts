// API Configuration
// Uses environment variable in production, falls back to localhost in development
import { supabase } from './supabase';

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3055';

/** Thrown for any non-2xx response. Carries the HTTP status and the server's message. */
export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

interface RequestOptions {
    /** Attach the caller's Supabase access token as a Bearer header. */
    auth?: boolean;
}

async function request<T>(path: string, body: unknown, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (options.auth) {
        // getSession() transparently refreshes an expiring token, so a user who
        // left the donate modal open for an hour still sends a valid bearer.
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new ApiError('You are not signed in', 401);
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    // Read as text first: error responses are not always JSON.
    const text = await response.text();
    let parsed: unknown = null;
    try {
        parsed = text ? JSON.parse(text) : null;
    } catch {
        /* leave parsed as null */
    }

    if (!response.ok) {
        const serverMessage =
            parsed && typeof parsed === 'object' && 'error' in parsed &&
                typeof (parsed as { error: unknown }).error === 'string'
                ? (parsed as { error: string }).error
                : null;
        throw new ApiError(serverMessage || text || `Request failed (${response.status})`, response.status);
    }

    return parsed as T;
}

export interface CreateOrderResponse {
    order_id: string;
    amount: number;
    currency: string;
    key_id: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    payment_id: string;
    donation_id: string;
    amount: number;
    already_recorded?: boolean;
}

// API endpoints
export const api = {
    /** Creates a Razorpay order server-side. The amount is validated and the
     *  donation row is created by the backend; the browser never writes it. */
    createOrder: (data: { amount: string | number }) =>
        request<CreateOrderResponse>('/api/payments/order', data, { auth: true }),

    /** Verifies the checkout signature server-side and marks the donation paid. */
    verifyPayment: (data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) => request<VerifyPaymentResponse>('/api/payments/verify', data, { auth: true }),

    sendReminder: (data: {
        name: string;
        email: string;
        phone: string | null;
        daysSinceLastDonation: number;
    }) => request<{ success: boolean }>('/api/send-reminder', data),

    testEmail: (data: { email: string; name: string }) =>
        request<{ success: boolean; url?: string; messageId?: string }>('/api/test-email', data),

    testSMS: (data: { phone: string; name: string }) =>
        request<{ success: boolean; mock?: boolean; message?: string }>('/api/test-sms', data),
};
