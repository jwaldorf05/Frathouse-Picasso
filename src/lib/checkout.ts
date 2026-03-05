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
    console.log('✓ Using NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    console.log('⚠ Using VERCEL_URL:', url);
    return url;
  }

  console.log('⚠ Falling back to request origin:', requestOrigin);
  return requestOrigin;
}
