import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripeInstance(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    const isDev = process.env.NODE_ENV === 'development';
    const envFile = isDev ? '.env.local' : 'production environment (Vercel/hosting dashboard)';
    console.error('❌ STRIPE CONFIGURATION ERROR:');
    console.error(`Missing STRIPE_SECRET_KEY in ${envFile}`);
    console.error('Add the following to your environment:');
    console.error('STRIPE_SECRET_KEY=sk_test_... (for development)');
    console.error('STRIPE_SECRET_KEY=sk_live_... (for production)');
    throw new Error(`Missing STRIPE_SECRET_KEY environment variable. Check ${envFile}`);
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    });
  }

  return stripeInstance;
}
