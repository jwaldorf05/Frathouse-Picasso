/**
 * Discount Codes Configuration
 * 
 * Add your discount codes here with their associated percentage discounts.
 * Each code should be uppercase for consistency.
 */

export interface DiscountCode {
  code: string;
  percentOff: number;
  description?: string;
  active: boolean;
}

export const discountCodes: DiscountCode[] = [
  {
    code: "TESTPRODUCT",
    percentOff: 100,
    description: "Test code for free orders (testing only)",
    active: true,
  },
  {
    code: "HOUSINGDAY",
    percentOff: 15,
    description: "Housing Day special - 15% off",
    active: true,
  },
  {
    code: "FDDE",
    percentOff: 20,
    description: "Welcome Eliotites - 20% off",
    active: true,
  },
  // Add more discount codes below:
  // {
  //   code: "SUMMER2024",
  //   percentOff: 20,
  //   description: "Summer sale - 20% off",
  //   active: true,
  // },
];

/**
 * Validate a discount code and return the discount percentage
 * @param code - The discount code to validate (case-insensitive)
 * @returns The discount percentage (0-100) or null if invalid
 */
export function validateDiscountCode(code: string): number | null {
  const normalizedCode = code.trim().toUpperCase();
  const discount = discountCodes.find(
    (d) => d.code === normalizedCode && d.active
  );
  return discount ? discount.percentOff : null;
}

/**
 * Apply discount to a price amount (in cents)
 * @param amountInCents - The original price in cents
 * @param discountPercent - The discount percentage (0-100)
 * @returns The discounted amount in cents
 */
export function applyDiscount(
  amountInCents: number,
  discountPercent: number
): number {
  if (discountPercent <= 0 || discountPercent > 100) {
    return amountInCents;
  }
  const discountAmount = Math.round(amountInCents * (discountPercent / 100));
  return Math.max(0, amountInCents - discountAmount);
}

/**
 * Get all active discount codes (for display purposes)
 */
export function getActiveDiscountCodes(): DiscountCode[] {
  return discountCodes.filter((d) => d.active);
}
