import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | QorelySofts Digital Store',
  description: 'Electronic delivery terms and download policies for digital products purchased on QorelySofts.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Shipping &amp; Delivery Policy
      </h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: September 2026</p>

      <div className="mt-8 space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 100% Digital Delivery</h2>
          <p>
            QorelySofts deals exclusively in intangible digital goods, including software assets, codebases, templates, and digital toolkits. <strong>No physical items or packages are shipped or dispatched through postal or courier services.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Delivery Timeline &amp; Method</h2>
          <p>
            Delivery is completely automated, instantaneous, and electronic:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
            <li><strong>Immediate Browser Access:</strong> Upon successful completion of your payment via Razorpay, you will be redirected immediately to the order confirmation page (<code>/success?token=...</code>) containing your secure download link.</li>
            <li><strong>Signed Download URL:</strong> For security, download links are cryptographically signed and remain active for 30 minutes.</li>
            <li><strong>Delivery Cost:</strong> There are absolutely no shipping fees or delivery charges. All deliveries are 100% free of charge worldwide.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Delivery Confirmation</h2>
          <p>
            The generation of the success page with a valid, accessible download token constitutes completed delivery of the digital goods.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Issues With Delivery</h2>
          <p>
            If you experienced an unexpected network disruption, closed your window before the download initiated, or did not receive access to your purchased files:
          </p>
          <ol className="mt-2 list-decimal pl-5 space-y-1 text-sm">
            <li>Check that your bank or UPI transaction was successfully debited and approved by Razorpay.</li>
            <li>Email our support desk at <a href="mailto:qorelysoftzenovee@gmail.com" className="text-brand-600 underline">qorelysoftzenovee@gmail.com</a> with your transaction reference or order ID.</li>
            <li>We will manually verify your payment and re-issue a fresh download link within <strong>12 to 24 hours</strong>.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
