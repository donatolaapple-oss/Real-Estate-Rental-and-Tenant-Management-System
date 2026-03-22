import express from "express";
import { postReview, getPropertySentiment } from "../controllers/sentimentController.js";
import { authorizeTenantUser } from "../middleware/userAuthorization.js";

const router = express.Router();

router.post("/review/:id", authorizeTenantUser, postReview);
router.get("/property/:id", authorizeTenantUser, getPropertySentiment);

export default router;
