import express from "express";
const router = express.Router();
import {
  getAllProperties,
  getSingleProperty,
  savePropertyToggle,
  getAllSavedProperties,
  chatbotPropertySearch,
} from "../controllers/tenantPropertyControllers.js";

/**
 * @description Get all properties
 * @route GET /api/tenant/real-estate
 */
router.get("/", getAllProperties);

/**
 * @description Get all saved properties (must be before /:slug)
 * @route GET /api/tenant/real-estate/saved/all
 */
router.get("/saved/all", getAllSavedProperties);

/**
 * @description Chatbot property search (must be before /:slug)
 * @route GET /api/tenant/real-estate/chatbot/search
 */
router.get("/chatbot/search", chatbotPropertySearch);

/**
 * @description Toggle save property for tenant user
 * @route PATCH /api/tenant/real-estate/save/:id
 */
router.patch("/save/:id", savePropertyToggle);

/**
 * @description Get single property
 * @route GET /api/tenant/real-estate/:slug
 */
router.get("/:slug", getSingleProperty);

export default router;
