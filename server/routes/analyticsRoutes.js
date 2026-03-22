import express from "express";
const router = express.Router();
import {
  analyzeSentiment,
  compareProperties,
  getHeatmapData
} from "../controllers/analyticsController.js";

/**
 * @description Analyze sentiment for reviews
 * @route POST /api/sentiment/analyze
 */
router.post("/analyze", analyzeSentiment);

/**
 * @description Compare properties with ranking
 * @route POST /api/chatbot/compare
 */
router.post("/compare", compareProperties);

/**
 * @description Get heatmap data for sentiment visualization
 * @route GET /api/analytics/heatmap
 */
router.get("/heatmap", getHeatmapData);

export default router;
