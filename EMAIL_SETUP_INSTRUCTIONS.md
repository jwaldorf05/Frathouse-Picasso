# Email Delivery Issue - Diagnosis & Fix

## Problem Identified

Your emails from custom forms, procurement, and orders are not being delivered because:

1. **Missing `RESEND_OWNER_EMAIL` variable**: The code falls back to using `RESEND_FROM_EMAIL` (`orders@frathousepicasso.com`) as the recipient
2. **Same FROM and TO address**: Resend (and most email providers) reject or filter emails where FROM = TO
3. **Result**: Emails are being sent but never delivered to your inbox

## Current Configuration

```
RESEND_FROM_EMAIL="orders@frathousepicasso.com"
RESEND_OWNER_EMAIL=<not set> → falls back to orders@frathousepicasso.com
```

This means emails are sent:
- FROM: orders@frathousepicasso.com
- TO: orders@frathousepicasso.com ❌ (Same address - gets rejected!)

## The Fix

### Step 1: Add to `.env.local` (for local development)

Add this line to your `.env.local` file:

```bash
RESEND_OWNER_EMAIL=jonathanwaldorf05@gmail.com
```

### Step 2: Add to Vercel (for production)

Run this command to add the environment variable to Vercel:

```bash
vercel env add RESEND_OWNER_EMAIL
```

When prompted:
- Value: `jonathanwaldorf05@gmail.com`
- Environments: Select Production, Preview, and Development

OR manually add it in Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add new variable:
   - Name: `RESEND_OWNER_EMAIL`
   - Value: `jonathanwaldorf05@gmail.com`
   - Environments: Production, Preview, Development

### Step 3: Redeploy

After adding the environment variable to Vercel:

```bash
git push
```

Or trigger a redeploy in the Vercel dashboard.

## How It Will Work After Fix

### Custom/Procurement Forms
- FROM: `orders@frathousepicasso.com`
- TO: `jonathanwaldorf05@gmail.com` ✅
- Reply-To: Customer's email

### Order Notifications
- FROM: `orders@frathousepicasso.com`
- TO: `jonathanwaldorf05@gmail.com` ✅
- Contains order details

### Customer Confirmations
- FROM: `orders@frathousepicasso.com`
- TO: Customer's email ✅

## Alternative: Use Both Domain Emails

If you want to receive emails at both `orders@` and `info@` addresses:

### Option A: Forward emails
Set up email forwarding in your domain provider:
- `orders@frathousepicasso.com` → `jonathanwaldorf05@gmail.com`
- `info@frathousepicasso.com` → `jonathanwaldorf05@gmail.com`

### Option B: Use an array of recipients
I can update the code to send to multiple addresses:

```typescript
RESEND_OWNER_EMAIL=jonathanwaldorf05@gmail.com,orders@frathousepicasso.com
```

## Verify Resend Domain Setup

While you're at it, verify your domain is properly configured in Resend:

1. Go to https://resend.com/domains
2. Check that `frathousepicasso.com` is verified (green checkmark)
3. Verify DNS records are set up correctly:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)

If the domain isn't verified, emails from `orders@frathousepicasso.com` won't be delivered at all.

## Testing After Fix

### Test Custom Form
```bash
curl -X POST http://localhost:3000/api/custom-request \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "description=Test message"
```

Check `jonathanwaldorf05@gmail.com` for the email.

### Test Order Email (requires order creation)
Place a test order through Stripe and verify you receive:
1. Order confirmation to customer
2. Order notification to `jonathanwaldorf05@gmail.com`

## Troubleshooting

### Still not receiving emails?

1. **Check spam folder** in Gmail
2. **Check Resend logs**: https://resend.com/emails
   - Look for failed deliveries
   - Check error messages
3. **Verify API key**: Make sure `RESEND_API_KEY` is correct
4. **Check rate limits**: Resend free tier has limits

### Resend Dashboard
- Login: https://resend.com/login
- View sent emails, delivery status, and errors
- Check domain verification status

## Summary

**Immediate action needed:**
1. Add `RESEND_OWNER_EMAIL=jonathanwaldorf05@gmail.com` to `.env.local`
2. Add same variable to Vercel environment variables
3. Redeploy

This will fix the issue where emails were being sent FROM and TO the same address, which causes delivery failures.
