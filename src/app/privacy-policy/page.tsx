import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | QorelySofts Digital Store',
  description: 'Learn how QorelySofts collects, uses, and safeguards customer personal and transaction data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: September 2026</p>

      <div className="mt-8 space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
          <p>
            When you purchase a digital product on QorelySofts, we collect only the necessary information required to process your transaction and deliver your digital assets:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
            <li><strong>Customer Name:</strong> To address customer communications and invoice generation.</li>
            <li><strong>Email Address:</strong> To deliver access links, payment receipts, and download instructions.</li>
            <li><strong>Phone Number (optional):</strong> To facilitate UPI and SMS OTP verification via Razorpay.</li>
            <li><strong>Transaction Metadata:</strong> Razorpay Order IDs, payment identifiers, and timestamp.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Payment Security &amp; Financial Information</h2>
          <p>
            We take your payment security seriously. <strong>QorelySofts does not collect, process, or store sensitive financial details</strong> such as credit/debit card numbers, CVVs, net banking credentials, or UPI PINs on our servers. All financial transactions are handled directly by <strong>Razorpay</strong>, which is PCI-DSS Level 1 compliant and governed by the Reserve Bank of India (RBI).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
          <p>We use the collected information exclusively to:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
            <li>Generate unique, cryptographically signed download URLs for your purchased digital products.</li>
            <li>Verify transaction legitimacy and prevent fraudulent orders.</li>
            <li>Provide customer support and resolve technical or download issues.</li>
            <li>Maintain statutory financial and accounting records.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Service Providers</h2>
          <p>We partner with trusted infrastructure and payment providers:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
            <li><strong>Razorpay:</strong> Payment processing and merchant settlements.</li>
            <li><strong>Supabase:</strong> Encrypted cloud database and secure private asset storage.</li>
          </ul>
          <p className="mt-2">
            We will never sell, lease, or rent your personal information to third-party advertisers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention &amp; Security</h2>
          <p>
            We implement administrative and technical security measures, including SSL/TLS encryption in transit and database-level Row Level Security (RLS) policies to protect customer records.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to request data deletion, please email us at <a href="mailto:qorelysoftzenovee@gmail.com" className="text-brand-600 underline">qorelysoftzenovee@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
