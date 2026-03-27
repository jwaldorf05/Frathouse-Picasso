# Discount System Testing & Diagnostics

This guide helps you test and diagnose issues with the Stripe native promotion code system.

## Quick Test Checklist

- [ ] Stripe promotion codes created in dashboard
- [ ] Database has `discount_amount` and `discount_code` columns
- [ ] Checkout session shows promotion code input
- [ ] Webhook receives expanded session data
- [ ] Orders table populated with discount data
- [ ] Admin dashboard displays discount info

---

## 1. Create Promotion Codes in Stripe

### Step 1: Create Coupons
1. Go to **Stripe Dashboard** → **Products** → **Coupons**
2. Click **Create coupon**
3. Create these coupons:
   - **TESTPRODUCT**: 100% off (for testing)
   - **HOUSINGDAY**: 15% off
   - **FDDE**: 20% off

### Step 2: Create Promotion Codes
1. Go to **Products** → **Promotion codes**
2. For each coupon, click **Create promotion code**
3. Set the code to match the coupon name
4. Make sure codes are **Active**

---

## 2. Test Checkout Flow

### Manual Test
1. Go to any product page
2. Click **Buy Now**
3. In Stripe checkout, click **Add promotion code**
4. Enter: `TESTPRODUCT`
5. Verify total shows **$0.00**
6. Complete checkout (no credit card required for 100% off)

### Expected Logs (Server)
```
[Checkout] Created session cs_xxx with native promotion codes enabled
[Checkout] Session amount: $105.00
```

---

## 3. Test Webhook Discount Capture

### Expected Webhook Logs
```
[Webhook] Processing checkout.session.completed: cs_xxx
[Webhook] Session total: $0.00
[Webhook] Discount applied: $105.00
[Order Sync] Discount breakdown found: { discountCount: 1, firstDiscountType: 'promotion_code' }
[Order Sync] Extracted promotion code: TESTPRODUCT
[Order Sync] ✅ Discount detected: TESTPRODUCT - $105.00 off
[Order Sync] Will save to database: { discount_amount: 10500, discount_code: "TESTPRODUCT" }
```

### Warning Signs
```
⚠️ [Order Sync] WARNING: Session cs_xxx has no total_details
⚠️ [Order Sync] Discount amount exists but no breakdown found
⚠️ [Order Sync] Promotion code reference is not expanded
```

**Fix:** Webhook must retrieve session with proper expansion:
```typescript
const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
  expand: ['total_details.breakdown']
});
```

---

## 4. Diagnostic API Endpoint

### Test Discount Extraction
```bash
curl -X POST http://localhost:3000/api/test-discount-sync \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "cs_test_..."}'
```

### Response Example
```json
{
  "success": true,
  "diagnostics": {
    "sessionId": "cs_test_...",
    "amountTotal": 0,
    "discountDetection": {
      "hasDiscount": true,
      "discountAmount": 10500,
      "discountAmountFormatted": "$105.00",
      "discountCode": "TESTPRODUCT"
    },
    "database": {
      "orderExists": true,
      "orderNumber": "FP-0011",
      "savedDiscountAmount": 10500,
      "savedDiscountCode": "TESTPRODUCT",
      "discountSyncedCorrectly": true
    },
    "checks": {
      "sessionCompleted": true,
      "hasLineItems": true,
      "hasTotalDetails": true,
      "hasDiscountBreakdown": true,
      "discountAmountMatches": true
    }
  },
  "message": "✅ Discount detected: TESTPRODUCT - $105.00"
}
```

---

## 5. Database Verification

### Check Order in Supabase
```sql
SELECT 
  order_number,
  customer_email,
  amount_total,
  discount_amount,
  discount_code,
  created_at
FROM orders
WHERE stripe_session_id = 'cs_test_...'
ORDER BY created_at DESC
LIMIT 1;
```

### Expected Result
```
order_number | customer_email      | amount_total | discount_amount | discount_code
FP-0011      | test@example.com    | 0            | 10500          | TESTPRODUCT
```

### Common Issues

**Issue:** `discount_amount` and `discount_code` are NULL
- **Cause:** Webhook didn't extract discount data
- **Fix:** Check webhook logs for warnings about `total_details`

**Issue:** Column doesn't exist error
- **Cause:** Database schema not updated
- **Fix:** Run the SQL migration script

---

## 6. Admin Dashboard Check

1. Go to `/admin/orders`
2. Find the test order (FP-0011)
3. Verify discount information displays:
   - Discount Code: TESTPRODUCT
   - Discount Amount: $105.00
   - Final Total: $0.00

---

## 7. Common Issues & Solutions

### Issue: No promotion code input in Stripe checkout
**Cause:** `allow_promotion_codes` not set
**Fix:** Check `src/app/api/create-checkout-session/route.ts`:
```typescript
allow_promotion_codes: true,
```

### Issue: 100% off code requires credit card
**Cause:** `payment_method_collection` not set
**Fix:** Check `src/app/api/create-checkout-session/route.ts`:
```typescript
payment_method_collection: 'if_required',
```

### Issue: Discount code not saved to database
**Cause:** Webhook not retrieving expanded session
**Fix:** Check `src/app/api/webhooks/route.ts`:
```typescript
const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
  expand: ['total_details.breakdown']
});
```

### Issue: Discount amount is 0 but code exists
**Cause:** Promotion code expired or inactive in Stripe
**Fix:** Check Stripe dashboard → Promotion codes → Verify code is active

---

## 8. Testing Workflow

### For Each New Promotion Code:
1. **Create in Stripe:** Dashboard → Promotion codes
2. **Test checkout:** Use code at checkout
3. **Check webhook logs:** Verify discount extraction
4. **Verify database:** Check `discount_amount` and `discount_code`
5. **Test admin view:** Confirm data displays correctly

### Automated Test Script
```bash
# 1. Create test order with TESTPRODUCT
# 2. Get session ID from Stripe dashboard
# 3. Run diagnostic
curl -X POST http://localhost:3000/api/test-discount-sync \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "cs_test_YOUR_SESSION_ID"}'

# 4. Check all validation passes
# Expected: discountSyncedCorrectly: true
```

---

## 9. Monitoring Production

### Key Metrics to Watch
- Orders with `discount_code IS NOT NULL`
- Average `discount_amount` per order
- Most used promotion codes

### Query for Discount Usage
```sql
SELECT 
  discount_code,
  COUNT(*) as usage_count,
  SUM(discount_amount) as total_discount_given,
  AVG(discount_amount) as avg_discount
FROM orders
WHERE discount_code IS NOT NULL
GROUP BY discount_code
ORDER BY usage_count DESC;
```

---

## 10. Rollback Plan

If discount system fails:

1. **Disable promotion codes:**
   ```typescript
   // In create-checkout-session/route.ts
   allow_promotion_codes: false,
   ```

2. **Orders still process normally** (discount fields are nullable)

3. **Fix and re-enable** when ready

---

## Support

- **Stripe Docs:** https://stripe.com/docs/billing/subscriptions/coupons
- **Test Endpoint:** `/api/test-discount-sync`
- **Logs Location:** Vercel dashboard → Functions → Logs
