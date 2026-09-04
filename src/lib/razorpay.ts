import Razorpay from 'razorpay';

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (_razorpay) return _razorpay;

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      'Missing Razorpay environment variables: NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set'
    );
  }

  _razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return _razorpay;
}
