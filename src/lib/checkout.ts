export function parsePriceToCents(price: string): number {
  const normalized = price.replace(/[^\d.]/g, "").trim();

  if (!normalized) {
    throw new Error(`Invalid product price format: ${price}`);
  }

  const amount = Number.parseFloat(normalized);

  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid product price format: ${price}`);
  }

  return Math.round(amount * 100);
}

export function resolveCheckoutOrigin(requestOrigin: string): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return requestOrigin;
}
