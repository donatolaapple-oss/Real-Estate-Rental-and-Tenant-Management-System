import express from "express";
import {
  listAllUsers,
  setUserActive,
  listPendingListings,
  setListingStatus,
  getSystemSettings,
  patchSystemSettings,
  getDashboardAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/analytics/dashboard", getDashboardAnalytics);
router.get("/users", listAllUsers);
router.patch("/users/:role/:id/active", setUserActive);
router.get("/listings/pending", listPendingListings);
router.patch("/listings/:id/status", setListingStatus);
router.get("/settings", getSystemSettings);
router.patch("/settings", patchSystemSettings);

export default router;
