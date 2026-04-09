import { kv } from '@vercel/kv';
import { NextRequest } from 'next/server';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Rate limiter using Vercel KV
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and remaining attempts
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Get current count and timestamp
    const data = await kv.get<{ count: number; resetTime: number }>(key);

    if (!data) {
      // First request in window
      const resetTime = now + config.windowMs;
      await kv.set(key, { count: 1, resetTime }, { px: config.windowMs });
      return {
        success: true,
        remaining: config.maxAttempts - 1,
        resetTime,
      };
    }

    // Check if window has expired
    if (now >= data.resetTime) {
      // Window expired, reset counter
      const resetTime = now + config.windowMs;
      await kv.set(key, { count: 1, resetTime }, { px: config.windowMs });
      return {
        success: true,
        remaining: config.maxAttempts - 1,
        resetTime,
      };
    }

    // Within window, check if limit exceeded
    if (data.count >= config.maxAttempts) {
      return {
        success: false,
        remaining: 0,
        resetTime: data.resetTime,
      };
    }

    // Increment counter
    const newCount = data.count + 1;
    await kv.set(key, { count: newCount, resetTime: data.resetTime }, { px: data.resetTime - now });
    
    return {
      success: true,
      remaining: config.maxAttempts - newCount,
      resetTime: data.resetTime,
    };
  } catch (error) {
    // If KV is unavailable, fail open (allow request) to prevent service disruption
    console.error('Rate limit error:', error);
    return {
      success: true,
      remaining: config.maxAttempts,
      resetTime: now + config.windowMs,
    };
  }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (Vercel sets these)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Format time remaining for error messages
 */
export function formatTimeRemaining(resetTime: number): string {
  const now = Date.now();
  const diff = resetTime - now;
  
  if (diff <= 0) return 'now';
  
  const minutes = Math.ceil(diff / 60000);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  ADMIN_LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'rl:admin-login',
  },
  CUSTOM_REQUEST: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'rl:custom-request',
  },
  CHECKOUT: {
    maxAttempts: 20,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'rl:checkout',
  },
  CART: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'rl:cart',
  },
  PRODUCTS: {
    maxAttempts: 200,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'rl:products',
  },
} as const;
