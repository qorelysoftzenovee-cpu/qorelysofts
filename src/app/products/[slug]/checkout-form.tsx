'use client';

import { useState } from 'react';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import type { RazorpayOptions, RazorpayPaymentResponse } from '@/types';

interface Props {
  productId: string;
  price: number;
  productTitle: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm({ productId, price, productTitle }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Load Razorpay checkout script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load payment gateway. Please check your internet connection.');
      }

      // 2. Create order on server
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          customerName: name,
          customerEmail: email,
          customerPhone: phone || undefined,
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // 3. Open Razorpay checkout modal
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Digital Store',
        description: productTitle,
        order_id: orderData.orderId,
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            // 4. Verify payment on server
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            // 5. Redirect to success page with download token
            window.location.href = `/success?token=${verifyData.token}`;
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment verification failed');
          }
        },
        prefill: {
          name,
          email,
          contact: phone || undefined,
        },
        theme: {
          color: '#3b6cff',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address (file link sent here) *
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span className="text-gray-400 font-normal">(optional, for UPI / OTP)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 9876543210"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting to Razorpay...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Pay ₹{price.toLocaleString('en-IN')}
          </>
        )}
      </button>

      {/* Trust & Payment Methods Banner */}
      <div className="pt-2 border-t border-gray-100 flex flex-col items-center gap-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-1 font-medium text-gray-600">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
          Secured by Razorpay Payment Gateway
        </div>
        <div className="text-gray-400">
          Supports UPI (GPay, PhonePe, Paytm), Cards & NetBanking
        </div>
      </div>
    </form>
  );
}
