import redis from "@/lib/redis";
import { NextResponse } from "next/server";

// rate limit presets — reuse these across the project
export const RateLimits = {
  // auth endpoints
  LOGIN: { limit: 5, window: 60 * 15 }, // 5 per 15 min
  REGISTER: { limit: 5, window: 60 * 60 }, // 5 per hour
  RESEND_EMAIL: { limit: 3, window: 60 * 60 }, // 3 per hour
  REFRESH_TOKEN: { limit: 10, window: 60 }, // 10 per minute
  FORGOT_PASSWORD: { limit: 3, window: 60 * 60 }, // 3 per hour

  // general API
  API_GENERAL: { limit: 100, window: 60 }, // 100 per minute
  API_WRITE: { limit: 30, window: 60 }, // 30 per minute for POST/PUT/DELETE
};

// get IP from request — handles proxies
export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") || // cloudflare
    "unknown"
  );
}

interface RateLimitOptions {
  key: string;
  limit: number;
  window: number;
}

// core rate limit function
async function rateLimit({ key, limit, window }: RateLimitOptions): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
  total: number;
}> {
  try {
    const redisKey = `rate_limit:${key}`;
    const count = await redis.incr(redisKey);

    // set expiry only on first request
    if (count === 1) {
      await redis.expire(redisKey, window);
    }

    const ttl = await redis.ttl(redisKey);

    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      reset: ttl,
      total: limit,
    };
  } catch {
    // if Redis is down, allow request — never block users due to Redis failure
    return { success: true, remaining: 1, reset: 0, total: limit };
  }
}

//  main function to use in routes
// returns NextResponse error if limited, null if allowed
export async function checkRateLimit(
  key: string,
  limit: number,
  window: number,
): Promise<NextResponse | null> {
  const result = await rateLimit({ key, limit, window });

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many requests. Please try again in ${result.reset} seconds.`,
        retryAfter: result.reset,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(result.total),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
          "Retry-After": String(result.reset),
        },
      },
    );
  }

  return null;
}

//  shorthand helpers — use these directly in routes
export const rateLimitByIp = (
  req: Request,
  preset: { limit: number; window: number },
  prefix: string,
) => checkRateLimit(`${prefix}:${getIp(req)}`, preset.limit, preset.window);

export const rateLimitByEmail = (
  email: string,
  preset: { limit: number; window: number },
  prefix: string,
) => checkRateLimit(`${prefix}:${email}`, preset.limit, preset.window);

export const rateLimitByUserId = (
  userId: string,
  preset: { limit: number; window: number },
  prefix: string,
) => checkRateLimit(`${prefix}:${userId}`, preset.limit, preset.window);
