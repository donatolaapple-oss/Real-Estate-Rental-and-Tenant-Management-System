import express from "express";
import {
  getMapProperties,
  getPropertyById,
  postChatbotCompare,
  getTenantAnalytics,
} from "../controllers/stayscoutController.js";
import { authorizeTenantUser } from "../middleware/userAuthorization.js";

const router = express.Router();

router.get("/map", authorizeTenantUser, getMapProperties);
router.get("/property/:id", authorizeTenantUser, getPropertyById);
router.post("/chatbot/compare", authorizeTenantUser, postChatbotCompare);
router.get("/insights", authorizeTenantUser, getTenantAnalytics);

export default router;
