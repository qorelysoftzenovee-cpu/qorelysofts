export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price_inr: number;
  thumbnail_url: string | null;
  file_path: string;
  is_published: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  status: 'pending' | 'paid' | 'failed';
  download_token: string;
  created_at: string;
}

export interface OrderWithProduct extends Order {
  products: Product;
}

export interface CreateOrderRequest {
  productId: string;
  customerName: string;
  customerEmail: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  token: string;
}

// Razorpay client-side types
export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      close: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}
