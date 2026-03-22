import express from "express";
const router = express.Router();
import {
  login,
  register,
  refreshLandlord,
  refreshAdmin,
  refreshTenant,
  logout,
  forgotPassword,
  resetPassword,
  verifyAccount,
  resendVerificationEmail,
} from "../controllers/authController.js";
import upload from "../middleware/multerImageMiddleware.js";
import { apiLimiter } from "../middleware/rateLimiter.js";

/** @route GET /api/auth/landlord/refresh */
router.get("/landlord/refresh", refreshLandlord);
/** @route GET /api/auth/owner/refresh — alias */
router.get("/owner/refresh", refreshLandlord);

/** @route GET /api/auth/admin/refresh */
router.get("/admin/refresh", refreshAdmin);

/**
 * @description generate new access token for tenant user
 * @route POST /api/auth/tenant/refresh
 */
router.get("/tenant/refresh", refreshTenant);

/**
 * @description login user
 * @route POST /api/auth/login
 */
router.post("/login", apiLimiter, login);

/**
 * @description register new user
 * @route POST /api/auth/register
 */
router.post(
  "/register",
  apiLimiter,
  upload.single("profileImage"),
  register
);

/**
 * @description Verify Email
 * @route POST /api/auth/verify-account
 */
router.post("/verify-account", verifyAccount);

/**
 * @description Resend Verification Email
 * @route PATCH /api/auth/resend-verification-email
 */
router.patch("/resend-verification-email", resendVerificationEmail);

/**
 * @description Forgot Password - send email
 * @route POST /api/auth/forgot-password
 */
router.post("/forgot-password", forgotPassword);

/**
 * @description Reset Password
 * @route PATCH /api/auth/reset-password
 */
router.patch("/reset-password", resetPassword);

/**
 * @description logout user
 * @route POST /api/auth/logout
 */
router.post("/logout", logout);

export default router;
