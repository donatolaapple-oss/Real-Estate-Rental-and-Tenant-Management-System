import express from "express";
import {
  getHeatmapPoints,
  getLandlordHeatmapReport,
  getLandlordDashboardAnalytics,
} from "../controllers/analyticsController.js";
import { getTenantAnalytics } from "../controllers/stayscoutController.js";
import { authorizeTenantUser, authorizeLandlord } from "../middleware/userAuthorization.js";

const router = express.Router();

router.get("/heatmap", authorizeTenantUser, getHeatmapPoints);
router.get("/tenant/summary", authorizeTenantUser, getTenantAnalytics);
router.get("/landlord/heatmap", authorizeLandlord, getLandlordHeatmapReport);
router.get("/landlord/dashboard", authorizeLandlord, getLandlordDashboardAnalytics);

export default router;
