import { Op } from "sequelize";
import db from "../config/database.js";
import User from "../models/user.js";
import Trade from "../models/trade.js";
import Subscription from "../models/subscription.js";
import Transaction from "../models/transaction.js";
import { PeriodLeaderboard } from "../models/gamification.js";
import ExchangeRate from "../models/exchangeRate.js";
import Role from "../models/role.js";

// Get comprehensive dashboard stats for super admin
export const getDashboardStats = async (req, res) => {
  try {
    // Verify super admin access
    if (req.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can access dashboard stats",
      });
    }

    // Get time ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const last3Months = new Date(today);
    last3Months.setMonth(last3Months.getMonth() - 3);

    // ==================== USER STATISTICS ====================
    // Total users by role
    const usersByRole = await User.findAll({
      attributes: [
        [db.col("userRole.role_name"), "role"],
        [db.fn("COUNT", db.col("User.id")), "count"],
        [
          db.fn(
            "SUM",
            db.cast(db.where(db.col("User.status"), "active"), "integer")
          ),
          "active",
        ],
      ],
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: [],
          required: true,
        },
      ],
      group: ["userRole.role_name"],
      order: [[db.fn("COUNT", db.col("User.id")), "DESC"]],
      raw: true,
    });

    // Format hasil query ke formattedUsersByRole
    const formattedUsersByRole = usersByRole.map((item) => ({
      role: item.role,
      total: parseInt(item.count),
      active: parseInt(item.active) || 0,
      inactive: parseInt(item.count) - (parseInt(item.active) || 0),
    }));

    // User growth over time
    const userGrowth = await User.findAll({
      attributes: [
        [db.fn("DATE", db.col("created_at")), "date"],
        [db.fn("COUNT", db.col("id")), "count"],
      ],
      where: {
        created_at: {
          [Op.gte]: last3Months,
        },
      },
      group: [db.fn("DATE", db.col("created_at"))],
      order: [[db.fn("DATE", db.col("created_at")), "ASC"]],
      raw: true,
    });

    // User status distribution
    const usersByStatus = await User.findAll({
      attributes: ["status", [db.fn("COUNT", db.col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    // User by country
    const usersByCountry = await User.findAll({
      attributes: ["country", [db.fn("COUNT", db.col("id")), "count"]],
      where: {
        country: {
          [Op.not]: null,
        },
      },
      group: ["country"],
      order: [[db.fn("COUNT", db.col("id")), "DESC"]],
      limit: 10,
      raw: true,
    });

    // Daily active users (users who logged in today)
    const dailyActiveUsers = await User.count({
      where: {
        last_login: {
          [Op.gte]: today,
        },
      },
    });

    // ==================== TRADING STATISTICS ====================
    // Total trades
    const totalTrades = await Trade.count();

    // Trades by result
    const tradesByResult = await Trade.findAll({
      attributes: [
        "result",
        [db.fn("COUNT", db.col("id")), "count"],
        [db.fn("SUM", db.col("profit")), "totalProfit"],
      ],
      group: ["result"],
      raw: true,
    });

    // Top instruments traded
    const topInstruments = await Trade.findAll({
      attributes: [
        "instrument",
        [db.fn("COUNT", db.col("id")), "tradeCount"],
        [db.fn("AVG", db.col("profit")), "avgProfit"],
        [db.fn("SUM", db.col("profit")), "totalProfit"],
      ],
      group: ["instrument"],
      order: [[db.fn("COUNT", db.col("id")), "DESC"]],
      limit: 10,
      raw: true,
    });

    // Trading volume over time
    const tradingVolume = await Trade.findAll({
      attributes: [
        [db.fn("DATE", db.col("date")), "date"],
        [db.fn("COUNT", db.col("id")), "tradeCount"],
        [db.fn("SUM", db.col("profit")), "totalProfit"],
      ],
      where: {
        date: {
          [Op.gte]: lastMonth,
        },
      },
      group: [db.fn("DATE", db.col("date"))],
      order: [[db.fn("DATE", db.col("date")), "ASC"]],
      raw: true,
    });

    // ==================== SUBSCRIPTION & REVENUE STATISTICS ====================
    // Subscription stats
    const subscriptionStats = await Subscription.findAll({
      attributes: [
        "plan",
        [db.fn("COUNT", db.col("id")), "count"],
        [
          db.fn("SUM", db.cast(db.where(db.col("isActive"), true), "integer")),
          "active",
        ],
      ],
      group: ["plan"],
      raw: true,
    });

    // Revenue from transactions
    const revenueStats = await Transaction.findAll({
      attributes: [
        [db.fn("DATE", db.col("created_at")), "date"],
        [db.fn("SUM", db.col("total")), "revenue"],
        [db.fn("COUNT", db.col("id")), "transactionCount"],
      ],
      where: {
        status: "PAID",
        created_at: {
          [Op.gte]: last3Months,
        },
      },
      group: [db.fn("DATE", db.col("created_at"))],
      order: [[db.fn("DATE", db.col("created_at")), "ASC"]],
      raw: true,
    });

    // Transaction status distribution
    const transactionStatus = await Transaction.findAll({
      attributes: [
        "status",
        [db.fn("COUNT", db.col("id")), "count"],
        [db.fn("SUM", db.col("total")), "totalAmount"],
      ],
      group: ["status"],
      raw: true,
    });

    // ==================== GAMIFICATION STATISTICS ====================
    // Leaderboard participation
    const leaderboardStats = await PeriodLeaderboard.findAll({
      attributes: [
        "periodType",
        [db.fn("COUNT", db.col("id")), "entryCount"],
        [db.fn("COUNT", db.fn("DISTINCT", db.col("userId"))), "uniqueUsers"],
      ],
      group: ["periodType"],
      raw: true,
    });

    // Top performing users by total profit - FIXED VERSION
    const topPerformers = await PeriodLeaderboard.findAll({
      where: {
        periodType: "monthly", // <-- TAMBAHKAN INI
      },
      attributes: [
        "userId",
        [db.fn("SUM", db.col("totalProfitUSD")), "totalProfitUSD"],
        [db.fn("SUM", db.col("totalTrades")), "totalTrades"],
        [db.fn("AVG", db.col("winRate")), "avgWinRate"],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "currency"],
        },
      ],
      group: ["userId"],
      order: [[db.fn("SUM", db.col("totalProfitUSD")), "DESC"]],
      limit: 10,
      raw: false,
    });

    const formattedTopPerformers = topPerformers.map((item) => ({
      userId: item.userId,
      name: item.User?.name || `User ${item.userId}`,
      email: item.User?.email,
      currency: item.User?.currency,
      totalProfitUSD: parseFloat(item.get("totalProfitUSD")) || 0,
      totalTrades: parseInt(item.get("totalTrades")) || 0,
      avgWinRate: parseFloat(item.get("avgWinRate")) || 0,
    }));

    // ==================== EXCHANGE RATE STATISTICS ====================
    const exchangeRateStats = await ExchangeRate.findAll({
      attributes: [
        "source",
        [db.fn("COUNT", db.col("id")), "count"],
        [
          db.fn("SUM", db.cast(db.where(db.col("isActive"), true), "integer")),
          "active",
        ],
      ],
      group: ["source"],
      raw: true,
    });

    // Latest exchange rates
    const latestRates = await ExchangeRate.findAll({
      where: {
        isActive: true,
      },
      order: [["effectiveFrom", "DESC"]],
      limit: 10,
      raw: true,
    });

    // ==================== SYSTEM HEALTH METRICS ====================
    // User registration trend
    const registrationTrend = await User.findAll({
      attributes: [
        [db.fn("DATE_FORMAT", db.col("created_at"), "%Y-%m"), "month"],
        [db.fn("COUNT", db.col("id")), "newUsers"],
      ],
      where: {
        created_at: {
          [Op.gte]: last3Months,
        },
      },
      group: [db.fn("DATE_FORMAT", db.col("created_at"), "%Y-%m")],
      order: [["month", "ASC"]],
      raw: true,
    });

    // Platform engagement (users with trades)
    const engagedUsers = await User.count({
      include: [
        {
          model: Trade,
          required: true,
        },
      ],
    });

    // ==================== SUMMARY STATS ====================
    const summary = {
      totalUsers: await User.count(),
      totalActiveUsers: await User.count({ where: { status: "active" } }),
      totalTrades,
      totalRevenue: revenueStats.reduce(
        (sum, item) => sum + (parseFloat(item.revenue) || 0),
        0
      ),
      avgTradeProfit:
        tradesByResult.reduce((sum, item) => {
          const profit = parseFloat(item.totalProfit) || 0;
          const count = parseInt(item.count) || 1;
          return sum + profit / count;
        }, 0) / (tradesByResult.length || 1),
      platformEngagement: ((engagedUsers / (await User.count())) * 100).toFixed(
        1
      ),
    };

    res.json({
      success: true,
      data: {
        summary,
        users: {
          byRole: formattedUsersByRole,
          byStatus: usersByStatus,
          byCountry: usersByCountry,
          growth: userGrowth,
          dailyActive: dailyActiveUsers,
        },
        trading: {
          byResult: tradesByResult,
          topInstruments,
          volume: tradingVolume,
          totalTrades,
        },
        subscription: {
          plans: subscriptionStats,
          revenue: revenueStats,
          transactionStatus,
        },
        gamification: {
          leaderboard: leaderboardStats,
          topPerformers: formattedTopPerformers,
        },
        exchangeRates: {
          stats: exchangeRateStats,
          latest: latestRates.map((rate) => ({
            ...rate,
            rate: parseFloat(rate.rate),
          })),
        },
        trends: {
          registration: registrationTrend,
          revenue: revenueStats,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Get real-time system metrics
export const getSystemMetrics = async (req, res) => {
  try {
    if (req.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can access system metrics",
      });
    }

    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Real-time metrics
    const metrics = {
      realTime: {
        newUsersLastHour: await User.count({
          where: {
            created_at: {
              [Op.gte]: lastHour,
            },
          },
        }),
        newTradesLastHour: await Trade.count({
          where: {
            created_at: {
              [Op.gte]: lastHour,
            },
          },
        }),
        activeSessions: await User.count({
          where: {
            last_login: {
              [Op.gte]: lastHour,
            },
          },
        }),
        pendingTransactions: await Transaction.count({
          where: {
            status: "PENDING_PAYMENT",
          },
        }),
      },
      systemHealth: {
        database: "healthy", // You can add actual DB health checks
        api: "operational",
        cache: "active",
        exchangeRateService: "running",
      },
    };

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("System metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};
