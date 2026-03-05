import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripeInstance(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    });
  }

  return stripeInstance;
}
