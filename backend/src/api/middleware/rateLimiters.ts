//Rate limiting enligt SECURITY.md, skyddar mot brute force och överbelastning.

import rateLimit from "express-rate-limit";

// Login: max 5 misslyckade försök per IP per 15 minuter
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, please try again later" },
});

// Alla skrivande anrop (POST/PUT/DELETE): max 100 per IP per minut
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  skip: (req) => req.method === "GET" || req.method === "OPTIONS",
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please slow down" },
});
