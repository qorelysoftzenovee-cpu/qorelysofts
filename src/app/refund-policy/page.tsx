import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | QorelySofts Digital Store',
  description: 'Detailed policy outlining refunds, replacements, and cancellations for digital product purchases on QorelySofts.',
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Refund &amp; Cancellation Policy
      </h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: September 2026</p>

      <div className="mt-8 space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Nature of Digital Goods</h2>
          <p>
            Due to the immediate, non-returnable nature of downloadable digital products (software, templates, documentation, digital kits), purchases are generally deemed final once the secure download link has been generated and accessed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Eligibility for Refund or Replacement</h2>
          <p>
            We stand by the quality of our digital offerings. We will gladly issue a <strong>full refund or product replacement</strong> under the following circumstances within <strong>7 days</strong> of purchase:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
            <li><strong>Corrupted or Defective Files:</strong> The downloaded archive or file is damaged, unreadable, or missing critical files, and our technical support team cannot resolve the issue within 48 hours.</li>
            <li><strong>Product Misrepresentation:</strong> The purchased asset materially differs from the description, specifications, or preview provided on the product page.</li>
            <li><strong>Duplicate Charges:</strong> You were charged multiple times for the same product due to a gateway or network glitch.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Non-Refundable Scenarios</h2>
          <p>Refunds will not be granted under the following conditions:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
            <li>Change of mind after the product has been downloaded.</li>
            <li>Lack of required software, skills, or hardware explicitly listed in the product prerequisites.</li>
            <li>Requests submitted after 7 days from the initial transaction date.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cancellation Policy</h2>
          <p>
            Because digital delivery is instant and automated upon payment verification, an order cannot be cancelled once payment is processed and download tokens are generated. If you placed an accidental order and have <em>not</em> downloaded the file, contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. How to Request a Refund</h2>
          <p>To initiate a refund request:</p>
          <ol className="mt-2 list-decimal pl-5 space-y-1 text-sm">
            <li>Send an email to <a href="mailto:qorelysoftzenovee@gmail.com" className="text-brand-600 underline">qorelysoftzenovee@gmail.com</a>.</li>
            <li>Include your <strong>Razorpay Order ID</strong> or payment reference number.</li>
            <li>Describe the technical issue, defect, or reason for the request with screenshots if applicable.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Refund Processing &amp; Timelines</h2>
          <p>
            Once your request is inspected and approved, the refund will be initiated via Razorpay. The refunded amount will be credited back to the customer&apos;s original payment method (Bank Account, UPI, or Card) within <strong>5 to 7 working days</strong>, adhering to standard banking processing periods.
          </p>
        </section>
      </div>
    </div>
  );
}
