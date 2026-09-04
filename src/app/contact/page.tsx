import type { Metadata } from 'next';
import { Mail, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | QorelySofts Digital Store',
  description: 'Get in touch with QorelySofts support for order inquiries, digital download assistance, or questions.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Contact Support
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Have questions about a product or need help with your order? We are here to assist you.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Support</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Mail className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">Email Address</div>
                  <a
                    href="mailto:qorelysoftzenovee@gmail.com"
                    className="text-brand-600 hover:underline"
                  >
                    qorelysoftzenovee@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Clock className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">Operating Hours & Response Time</div>
                  <div>Monday to Saturday: 9:00 AM – 7:00 PM IST</div>
                  <div className="text-xs text-gray-500 mt-0.5">Average response time: 24 to 48 hours</div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">Operating Location</div>
                  <div>India</div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">Order Verification Support</div>
                  <div>Please include your Razorpay Order ID or payment reference when contacting us about a purchase.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Message Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
          <form
            action="mailto:qorelysoftzenovee@gmail.com"
            method="GET"
            className="space-y-4 text-sm"
          >
            <div>
              <label htmlFor="name" className="block font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Full Name"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block font-medium text-gray-700 mb-1">
                Subject / Order ID
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                placeholder="e.g. Order #ord_123 inquiry"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label htmlFor="body" className="block font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="body"
                name="body"
                rows={4}
                required
                placeholder="How can we help you?"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Compose Email
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
