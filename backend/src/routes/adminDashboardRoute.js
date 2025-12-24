import express from "express";
import { getDashboardStats, getSystemMetrics } from "../controllers/adminController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

// Dashboard stats routes
router.get("/stats", verifyUser, adminOnly, getDashboardStats);
router.get("/metrics", verifyUser, adminOnly, getSystemMetrics);

export default router;