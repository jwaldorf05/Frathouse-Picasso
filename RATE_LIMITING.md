# Rate Limiting Implementation

This document describes the rate limiting implementation for the Frathouse Picasso website.

## Overview

Rate limiting has been implemented using **Vercel KV** (Redis) to protect API endpoints from abuse, brute force attacks, and excessive usage.

## Setup Instructions

### 1. Create Vercel KV Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to the **Storage** tab
4. Click **Create Database** → Select **KV**
5. Follow the prompts (free tier available)
6. Vercel will automatically add environment variables to your project

### 2. Pull Environment Variables Locally

Run this command in your project directory:

```bash
vercel env pull .env.local
```

This will download the KV connection variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 3. Deploy

Push your changes and deploy:

```bash
git add .
git commit -m "Add rate limiting"
git push
```

Vercel will automatically use the KV environment variables.

## Rate Limits by Endpoint

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/admin/login` | 5 attempts | 15 minutes | Prevent brute force attacks on admin panel |
| `/api/custom-request` | 10 requests | 1 hour | Prevent spam form submissions |
| `/api/create-checkout-session` | 20 attempts | 15 minutes | Prevent payment abuse |
| `/api/cart` (POST) | 100 requests | 1 minute | Prevent cart manipulation |
| `/api/products` | 200 requests | 1 minute | Prevent scraping |
| `/api/collections` | 200 requests | 1 minute | Prevent scraping |

## How It Works

### Rate Limit Logic

1. Each request is identified by the client's IP address
2. The system tracks request counts in Vercel KV with a sliding window
3. If the limit is exceeded, a `429 Too Many Requests` response is returned
4. The response includes:
   - Error message with time remaining
   - `retryAfter` timestamp

### Example Error Response

```json
{
  "error": "Too many login attempts. Please try again in 12 minutes.",
  "retryAfter": 1735849200000
}
```

### Fail-Open Design

If Vercel KV is unavailable (rare), the rate limiter **fails open** (allows requests) to prevent service disruption. Errors are logged for monitoring.

## Testing Rate Limits

### Test Admin Login Rate Limit

```bash
# Make 6 rapid login attempts
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

Expected: First 5 return `401 Unauthorized`, 6th returns `429 Too Many Requests`

### Test Form Submission Rate Limit

```bash
# Make 11 rapid form submissions
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/custom-request \
    -F "name=Test" \
    -F "email=test@example.com" \
    -F "signAddress=123 Main St" \
    -w "\nStatus: %{http_code}\n\n"
done
```

Expected: First 10 succeed, 11th returns `429 Too Many Requests`

## Monitoring

### Check Rate Limit Status

You can check the current rate limit status for an IP:

```typescript
import { kv } from '@vercel/kv';

// Check admin login attempts for an IP
const data = await kv.get('rl:admin-login:192.168.1.1');
console.log(data); // { count: 3, resetTime: 1735849200000 }
```

### Clear Rate Limit for Testing

```typescript
import { kv } from '@vercel/kv';

// Clear rate limit for an IP
await kv.del('rl:admin-login:192.168.1.1');
```

## Security Considerations

### IP-Based Identification

- Uses `x-forwarded-for` and `x-real-ip` headers (set by Vercel)
- Fallback to "unknown" if headers are missing
- **Note**: Sophisticated attackers can use VPNs/proxies to bypass IP-based limits

### Future Enhancements

Consider implementing:
1. **Account-based rate limiting** (in addition to IP) for logged-in users
2. **CAPTCHA** after multiple failed login attempts
3. **Email verification** for form submissions
4. **Honeypot fields** to catch bots

## Files Modified

- `src/lib/rateLimit.ts` - Core rate limiting logic
- `src/app/api/admin/login/route.ts` - Admin login protection
- `src/app/api/custom-request/route.ts` - Form submission protection
- `src/app/api/create-checkout-session/route.ts` - Checkout protection
- `src/app/api/cart/route.ts` - Cart operation protection
- `src/app/api/products/route.ts` - Product query protection
- `src/app/api/collections/route.ts` - Collection query protection

## Troubleshooting

### Rate Limiting Not Working

1. **Check KV is connected**: Verify environment variables are set
   ```bash
   echo $KV_REST_API_URL
   ```

2. **Check Vercel logs**: Look for rate limit errors
   ```bash
   vercel logs
   ```

3. **Verify IP detection**: Check that `x-forwarded-for` header is present
   ```typescript
   console.log(request.headers.get('x-forwarded-for'));
   ```

### False Positives

If legitimate users are being rate limited:
1. Increase the limits in `src/lib/rateLimit.ts`
2. Consider implementing user authentication to track by user ID instead of IP
3. Add a whitelist for trusted IPs

## Cost

**Vercel KV Free Tier:**
- 30,000 commands per month
- 256 MB storage
- Should be sufficient for most small-to-medium sites

**Estimate**: ~2 KV operations per rate-limited request = ~15,000 requests/month covered by free tier.

## Support

For issues or questions:
- Check [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- Review [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
