import { NextRequest, NextResponse } from 'next/server';
import { validateDiscountCode } from '@/lib/discountCodes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      console.warn('[Validate Discount] Missing or invalid code parameter');
      return NextResponse.json(
        { error: 'Discount code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();
    console.log(`[Validate Discount] Validating code: "${normalizedCode}"`);
    
    const discountPercent = validateDiscountCode(normalizedCode);

    if (discountPercent === null) {
      console.log(`[Validate Discount] Code "${normalizedCode}" is invalid or inactive`);
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired discount code' },
        { status: 200 }
      );
    }

    console.log(`[Validate Discount] Code "${normalizedCode}" validated successfully: ${discountPercent}% off`);
    
    return NextResponse.json({
      valid: true,
      code: normalizedCode,
      discountPercent,
      message: `${discountPercent}% discount applied!`,
    });
  } catch (error: any) {
    console.error('[Validate Discount] Validation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
