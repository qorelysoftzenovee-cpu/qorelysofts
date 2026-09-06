import { Resend } from 'resend';

interface OrderEmailParams {
  to: string;
  customerName: string;
  productTitle: string;
  priceInr: number;
  downloadToken: string;
  orderId: string;
}

/**
 * Sends a transactional order receipt & download link email to the customer.
 * Uses Resend if RESEND_API_KEY is configured in environment variables.
 * Fails safely and gracefully without interrupting the checkout response if email fails.
 */
export async function sendOrderConfirmationEmail({
  to,
  customerName,
  productTitle,
  priceInr,
  downloadToken,
  orderId,
}: OrderEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      `[Email Service] RESEND_API_KEY is not configured. Email to ${to} skipped for order ${orderId}.`
    );
    return { success: false, error: 'RESEND_API_KEY_NOT_CONFIGURED' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.qorelysofts.co.in';
  const downloadUrl = `${siteUrl}/success?token=${downloadToken}`;
  const senderEmail = process.env.RESEND_FROM_EMAIL || 'QorelySofts <onboarding@resend.dev>';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your QorelySofts Download Link</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f172a;padding:40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background-color:#1e293b;border:1px solid #334155;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">QorelySofts</h1>
              <p style="margin:6px 0 0 0;color:#e0e7ff;font-size:14px;">Digital Products & Developer Suites</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 30px;">
              <h2 style="margin:0 0 12px 0;font-size:20px;color:#ffffff;font-weight:600;">Payment Successful! 🎉</h2>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:24px;color:#94a3b8;">
                Hi <strong style="color:#f8fafc;">${customerName}</strong>, thank you for your purchase. Your digital asset package is ready for immediate download.
              </p>

              <!-- Order Summary Box -->
              <table role="presentation" width="100%" style="background-color:#0f172a;border:1px solid #334155;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #1e293b;">
                    <span style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Product</span>
                    <div style="font-size:16px;color:#ffffff;font-weight:600;margin-top:4px;">${productTitle}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #1e293b;">
                    <span style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Amount Paid</span>
                    <div style="font-size:16px;color:#10b981;font-weight:700;margin-top:4px;">₹${priceInr} INR</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Order Reference</span>
                    <div style="font-size:13px;color:#94a3b8;font-family:monospace;margin-top:4px;">${orderId}</div>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${downloadUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;box-shadow:0 4px 15px rgba(99,102,241,0.4);">
                  Download Your Product (.ZIP)
                </a>
              </div>

              <p style="margin:20px 0 0 0;font-size:13px;color:#64748b;text-align:center;line-height:20px;">
                If the button above does not work, copy and paste this link into your browser:<br>
                <a href="${downloadUrl}" style="color:#818cf8;word-break:break-all;">${downloadUrl}</a>
              </p>

              <hr style="border:none;border-top:1px solid #334155;margin:32px 0 24px 0;">

              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:20px;">
                Need help or have technical questions? Reach out to our support team directly at
                <a href="mailto:qorelysoftzenovee@gmail.com" style="color:#818cf8;text-decoration:none;">qorelysoftzenovee@gmail.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;padding:20px 30px;text-align:center;border-top:1px solid #1e293b;">
              <p style="margin:0;font-size:12px;color:#475569;">
                © ${new Date().getFullYear()} QorelySofts. All rights reserved.<br>
                <a href="${siteUrl}" style="color:#64748b;text-decoration:none;">www.qorelysofts.co.in</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to: [to],
      subject: `Your Download Link: ${productTitle} — QorelySofts`,
      html: htmlContent,
    });

    if (error) {
      console.error('[Email Service] Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Email Service] Confirmation email sent to ${to} (Message ID: ${data?.id})`);
    return { success: true };
  } catch (err: any) {
    console.error('[Email Service] Unexpected error sending email:', err);
    return { success: false, error: err?.message || 'UNKNOWN_ERROR' };
  }
}
