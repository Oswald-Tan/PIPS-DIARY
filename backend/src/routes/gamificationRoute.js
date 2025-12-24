import express from "express";
import {
  getUserGamificationProfile,
  getAllBadges,
  getLeaderboard,
  getLeaderboardHistory,
  getAvailablePeriods,
  resetMonthlyLeaderboard,
  updateLeaderboardCachedRates,
} from "../controllers/gamificationController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";
import currencyService from "../services/currencyService.js";
import { Badge } from "../models/gamification.js";

const router = express.Router();

// Public route untuk health check (tanpa auth)
router.get("/health", async (req, res) => {
  try {
    const health = await currencyService.healthCheck();
    res.json({
      success: true,
      message: "Gamification service is running",
      timestamp: new Date().toISOString(),
      currencyService: health,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Service health check failed",
      error: error.message,
    });
  }
});

// routes/gamification.js
router.get('/badges/debug', async (req, res) => {
  try {
    const badges = await Badge.findAll();
    
    const debugInfo = badges.map(badge => ({
      id: badge.id,
      name: badge.name,
      requirementRaw: badge.requirement,
      requirementType: typeof badge.requirement,
      isJSONValid: (() => {
        try {
          JSON.parse(badge.requirement);
          return true;
        } catch {
          return false;
        }
      })(),
      extractedValue: (() => {
        // Coba extract value
        if (typeof badge.requirement === 'string') {
          try {
            const parsed = JSON.parse(badge.requirement);
            return parsed.value;
          } catch {
            return 'parse error';
          }
        } else if (badge.requirement && typeof badge.requirement === 'object') {
          return badge.requirement.value;
        }
        return 'unknown';
      })()
    }));
    
    res.json({
      success: true,
      data: debugInfo,
      database: process.env.DB_NAME,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routes yang memerlukan auth
router.get("/profile", verifyUser, getUserGamificationProfile);
router.get("/badges", verifyUser, getAllBadges);
router.get("/leaderboard", verifyUser, getLeaderboard);
router.get("/leaderboard/history", verifyUser, getLeaderboardHistory);
router.get("/leaderboard/periods", verifyUser, getAvailablePeriods);

// Admin route for manual reset
router.post("/leaderboard/reset", verifyUser, resetMonthlyLeaderboard);

// **PERBAIKAN: Route untuk refresh rates dengan middleware adminOnly**
router.post("/leaderboard/refresh-rates", verifyUser, adminOnly, async (req, res) => {
  try {
    console.log(`🔄 Manual cache refresh triggered by admin user ${req.userId} (${req.role})`);
    
    // Trigger update cached rates
    const result = await updateLeaderboardCachedRates();
    
    // Clear currency cache juga
    currencyService.clearCache();
    
    res.json({
      success: true,
      message: "Leaderboard rates refreshed successfully",
      data: result,
      adminInfo: {
        userId: req.userId,
        role: req.role,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Refresh rates error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// **NEW: Route untuk melihat cache status (admin only)**
router.get("/leaderboard/cache-status", verifyUser, adminOnly, async (req, res) => {
  try {
    // Import models yang diperlukan
    const { ExchangeRate } = await import("../models/gamification.js");
    
    // Get exchange rate status
    const exchangeRates = await ExchangeRate.findAll({
      where: {
        isActive: true,
      },
      order: [
        ['fromCurrency', 'ASC'],
        ['effectiveFrom', 'DESC']
      ],
    });
    
    // Get cache stats dari currency service
    const cacheStats = currencyService.getCacheStats();
    
    // Get leaderboard cache stats
    const leaderboardStats = await getLeaderboardCacheStats();
    
    // Get currency service health
    const currencyHealth = await currencyService.healthCheck();
    
    res.json({
      success: true,
      data: {
        exchangeRates: exchangeRates.map(rate => ({
          id: rate.id,
          fromCurrency: rate.fromCurrency,
          toCurrency: rate.toCurrency,
          rate: parseFloat(rate.rate),
          isActive: rate.isActive,
          source: rate.source,
          effectiveFrom: rate.effectiveFrom,
          lastUpdated: rate.lastUpdated,
        })),
        cache: {
          currencyService: cacheStats,
          leaderboard: leaderboardStats,
        },
        serviceHealth: currencyHealth,
        summary: {
          totalActiveRates: exchangeRates.filter(r => r.isActive).length,
          uniqueCurrencies: [...new Set(exchangeRates.map(r => r.fromCurrency))].length,
          cacheKeys: cacheStats.keys,
          leaderboardEntries: leaderboardStats?.totalEntries || 0,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Cache status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// **NEW: Route untuk clear cache (admin only)**
router.post("/leaderboard/clear-cache", verifyUser, adminOnly, async (req, res) => {
  try {
    // Clear semua cache
    currencyService.clearCache();
    
    // Optional: Clear cache lain jika ada
    
    res.json({
      success: true,
      message: "All caches cleared successfully",
      clearedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Clear cache error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// **NEW: Route untuk test konversi manual (admin only)**
router.post("/test-conversion", verifyUser, adminOnly, async (req, res) => {
  try {
    const { amount = 32000, currency = "IDR" } = req.body;
    
    const testResult = await currencyService.testConversion(amount, currency);
    
    res.json({
      success: true,
      message: "Conversion test completed",
      test: testResult,
    });
  } catch (error) {
    console.error("Test conversion error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// **Helper function untuk leaderboard cache stats**
const getLeaderboardCacheStats = async () => {
  try {
    const db = (await import("../config/database.js")).default;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [results] = await db.query(`
      SELECT 
        COUNT(*) as total_entries,
        original_currency,
        COUNT(CASE WHEN last_exchange_rate IS NULL THEN 1 END) as missing_rate,
        COUNT(CASE WHEN last_exchange_rate IS NOT NULL THEN 1 END) as has_rate,
        MIN(exchange_rate_updated_at) as oldest_rate_update,
        MAX(exchange_rate_updated_at) as latest_rate_update,
        AVG(last_exchange_rate) as avg_rate
      FROM period_leaderboards
      WHERE updated_at >= ?
      GROUP BY original_currency
    `, {
      replacements: [thirtyDaysAgo],
    });
    
    return results;
  } catch (error) {
    console.error("Error getting leaderboard cache stats:", error);
    return null;
  }
};

export default router;