# Razorpay Integration & Configuration Guide

This guide details everything required to configure, test, and go live with **Razorpay** in your Digital Products Store.

---

## 1. Razorpay Account Setup

1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com) and sign up / log in.
2. In the top navigation or sidebar toggle, switch between **Test Mode** (for development) and **Live Mode** (for real customer transactions).

---

## 2. Generate API Keys

1. Navigate to: **Account & Settings** → **API Keys** (under *Website and app settings*).
2. Click **Generate Test Key** (or **Generate Live Key** when ready for production).
3. You will receive two values:
   - **Key ID**: Starts with `rzp_test_...` (or `rzp_live_...` in Live mode)
   - **Key Secret**: A 24-character alphanumeric secret string (only shown once upon generation!)
4. Add these into your `.env.local`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_secret_key
   ```

> [!CAUTION]
> Never commit `RAZORPAY_KEY_SECRET` or `.env.local` to git. `NEXT_PUBLIC_RAZORPAY_KEY_ID` is public and safe to be exposed to the browser.

---

## 3. Webhook Setup (Crucial for Guaranteed Fulfillment)

Webhooks protect against scenarios where a customer's phone switches apps to approve a UPI transaction, or network connection drops before the browser returns to the website.

### Configuring the Webhook in Razorpay Dashboard:
1. In the Razorpay Dashboard, go to **Account & Settings** → **Webhooks** → **Add New Webhook**.
2. **Webhook URL**:
   - Production: `https://your-custom-domain.com/api/webhooks/razorpay`
   - Local development (via ngrok/tunnel): `https://<your-ngrok-subdomain>.ngrok-free.app/api/webhooks/razorpay`
3. **Secret**: Enter a strong random secret (e.g. 32 random characters).
4. Save this secret in your `.env.local`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_chosen_webhook_secret
   ```
5. **Active Events**: Check the following required events:
   - `order.paid` (triggered as soon as an order is paid)
   - `payment.captured` (triggered when a payment is auto-captured)
   - `payment.failed` (triggered when a customer's transaction fails)
6. Click **Save**.

---

## 4. Testing Razorpay Payments in Test Mode

When `NEXT_PUBLIC_RAZORPAY_KEY_ID` starts with `rzp_test_`, the Razorpay Checkout modal runs in sandbox mode:

### A. Testing UPI (Instant & Fast)
- Choose **UPI** in the checkout popup.
- Enter the test UPI ID / VPA:
  - **Success scenario**: `success@razorpay`
  - **Failure scenario**: `failure@razorpay`
- Click **Pay**. Razorpay will immediately simulate an approved or declined UPI payment without needing a real banking app.

### B. Testing Debit / Credit Cards
Use any of the official Razorpay test card credentials:

| Card Type | Card Number | Expiry | CVV | OTP |
| :--- | :--- | :--- | :--- | :--- |
| **Visa (Domestic)** | `4111 1111 1111 1111` | Any future date (e.g. `12/28`) | `123` | `333333` |
| **Mastercard (Domestic)** | `5123 4567 8901 2345` | Any future date (e.g. `12/28`) | `123` | `333333` |
| **RuPay** | `6071 5200 0000 0001` | Any future date | `123` | `333333` |
| **Declined Card** | `4000 0000 0000 0002` | Any future date | `123` | N/A (Declined) |

### C. Testing NetBanking
- Select any bank (e.g. **HDFC Bank**, **ICICI Bank**, **SBI**).
- On the simulated bank page, select **Success** or **Failure** to test both flows.

---

## 5. Merchant Dashboard Visibility

Every order created through your store automatically passes:
- Product ID
- Customer Name
- Customer Email
- Customer Phone (if provided)

You can view these directly in your **Razorpay Dashboard** under:
- **Transactions** → **Payments**
- **Transactions** → **Orders**

---

## 6. Going Live Checklist

When ready to accept real payments:

- [ ] Complete business KYC and bank account verification in Razorpay Dashboard.
- [ ] Toggle from **Test Mode** to **Live Mode** in the dashboard header.
- [ ] Generate **Live API Keys** (`rzp_live_...`).
- [ ] Update your production hosting environment variables (Vercel, AWS, or Railway):
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...`
  - `RAZORPAY_KEY_SECRET=live_secret_...`
  - `RAZORPAY_WEBHOOK_SECRET=live_webhook_secret_...`
- [ ] Configure the live Webhook URL pointing to your production domain (`https://yourdomain.com/api/webhooks/razorpay`).
- [ ] Perform a live test transaction of ₹1 to verify end-to-end settlement to your bank account.
