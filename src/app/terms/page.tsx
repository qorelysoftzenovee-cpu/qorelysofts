import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | QorelySofts Digital Store',
  description: 'Terms and conditions governing the purchase, licensing, and usage of digital products on QorelySofts.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Terms &amp; Conditions
      </h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: September 2026</p>

      <div className="mt-8 space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Agreement to Terms</h2>
          <p>
            By accessing or purchasing digital products from QorelySofts (&quot;the Site&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, please refrain from using the platform or purchasing our digital products.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Nature of Digital Products</h2>
          <p>
            All products offered on QorelySofts are intangible digital assets, including but not limited to software code, templates, design toolkits, educational PDFs, and development packages. Products are delivered electronically via direct downloadable links upon successful payment verification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. License &amp; Usage Rights</h2>
          <p>
            Upon purchasing a product, you are granted a non-exclusive, non-transferable, revocable license to download, use, and modify the digital asset for personal or commercial development projects, subject to the specific license terms accompanying each item. You may not resell, redistribute, sub-license, or republish the raw source assets as standalone products.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Payments &amp; Pricing</h2>
          <p>
            All transactions are processed securely through our authorized payment partner, <strong>Razorpay Software Private Limited</strong>. Prices are denominated in Indian Rupees (INR) and are subject to applicable taxes. You agree to provide valid, accurate, and complete payment details at checkout.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Delivery of Products</h2>
          <p>
            Upon confirmation of successful payment by Razorpay, a unique temporary download access token is generated. You will be redirected to the download page where you can immediately retrieve your purchased files. You are responsible for downloading and archiving your digital files securely.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
          <p>
            All trademarks, logos, code, documentation, and product designs featured on QorelySofts are the intellectual property of QorelySofts or its respective creators. Unauthorized copying or redistribution is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
          <p>
            In no event shall QorelySofts, its developers, or affiliates be liable for any indirect, incidental, or consequential damages arising out of the use or inability to use the digital products, even if advised of the possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Governing Law &amp; Contact</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of India. For any inquiries regarding these terms, please contact us at <a href="mailto:qorelysoftzenovee@gmail.com" className="text-brand-600 underline">qorelysoftzenovee@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
