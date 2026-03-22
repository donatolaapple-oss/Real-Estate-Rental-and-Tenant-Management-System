import rateLimiter from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";

// rate limiter for login and register routes (relaxed in development)
export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: isProd ? 20 : 100,
  message:
    "Request Limit reached for this IP Address. Please wait for 60 seconds and try again",
});
