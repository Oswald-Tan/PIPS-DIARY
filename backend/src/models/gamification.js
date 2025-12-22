import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";
import ExchangeRate from "./exchangeRate.js";

// Ubah MonthlyLeaderboard menjadi PeriodLeaderboard
const PeriodLeaderboard = db.define(
  "PeriodLeaderboard",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    periodType: {
      type: DataTypes.ENUM("daily", "weekly", "monthly"),
      allowNull: false,
    },
    periodValue: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Format: daily=YYYY-MM-DD, weekly=YYYY-WW, monthly=YYYY-MM",
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalProfitUSD: {
      type: DataTypes.DECIMAL(20, 4), // Presisi tinggi untuk konversi
      defaultValue: 0,
      comment: "Profit yang sudah dikonversi ke USD",
    },
    totalProfitOriginal: {
      type: DataTypes.DECIMAL(20, 4),
      defaultValue: 0,
      comment: "Profit dalam mata uang asli user",
    },
    originalCurrency: {
      type: DataTypes.ENUM("USD", "IDR", "CENT"),
      defaultValue: "USD",
    },
    totalTrades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    winRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    dailyActivity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    consistencyScore: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: "Skor konsistensi trading",
    },
    userLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    totalExperience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dailyStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalTradesUser: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "total_trades_user", // Menggunakan nama berbeda dari totalTrades yang sudah ada
    },
    profitStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    maxConsecutiveWins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastExchangeRate: {
      type: DataTypes.DECIMAL(20, 12),
      defaultValue: 1,
      comment: "Rate yang digunakan saat terakhir konversi",
    },
    exchangeRateUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Waktu terakhir update exchange rate",
    },
  },
  {
    timestamps: true,
    tableName: "period_leaderboards",
    indexes: [
      {
        fields: ["periodType", "periodValue", "rank"],
      },
      {
        fields: ["userId", "periodType", "periodValue"],
        unique: true,
      },
      {
        fields: ["periodValue"],
      },
    ],
  }
);

const Badge = db.define(
  "Badge",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "consistency",
        "profit",
        "milestone",
        "achievement",
        "special"
      ),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "#8b5cf6",
    },
    requirement: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    rarity: {
      type: DataTypes.ENUM("common", "rare", "epic", "legendary"),
      defaultValue: "common",
    },
    xpReward: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "badges",
  }
);

const UserBadge = db.define(
  "UserBadge",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    badgeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "badges",
        key: "id",
      },
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    achievedAt: {
      type: DataTypes.DATE,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    tableName: "user_badges",
    indexes: [
      {
        fields: ["userId", "badgeId"],
        unique: true,
      },
    ],
  }
);

const UserLevel = db.define(
  "UserLevel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalExperience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dailyStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastActiveDate: {
      type: DataTypes.DATEONLY,
    },
    profitStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastProfitDate: {
      type: DataTypes.DATEONLY,
    },
    totalTrades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    consecutiveWins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    maxConsecutiveWins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "user_levels",
  }
);

const Achievement = db.define(
  "Achievement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM(
        "first_trade",
        "first_profit",
        "weekly_consistency",
        "monthly_consistency",
        "profit_milestone",
        "trade_milestone"
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    achievedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    tableName: "achievements",
    indexes: [
      {
        fields: ["userId", "type"],
      },
    ],
  }
);

const MonthlyLeaderboard = db.define(
  "MonthlyLeaderboard",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    period: {
      type: DataTypes.STRING, // Format: 'YYYY-MM'
      allowNull: false,
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER, // Total poin bulan ini
      defaultValue: 0,
    },
    totalTrades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalProfit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    totalExperience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    winRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "monthly_leaderboards",
    indexes: [
      {
        fields: ["period", "rank"],
      },
      {
        fields: ["userId", "period"],
        unique: true,
      },
    ],
  }
);

const LeaderboardHistory = db.define(
  "LeaderboardHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    periodType: {
      type: DataTypes.ENUM("daily", "weekly", "monthly"),
      allowNull: false,
    },
    periodDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    score: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    totalTrades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalProfitUSD: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    totalProfitOriginal: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    originalCurrency: {
      type: DataTypes.STRING,
      defaultValue: "USD",
    },
    winRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    conversionRate: {
      type: DataTypes.DECIMAL(15, 8),
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
    tableName: "leaderboard_history",
    indexes: [
      {
        fields: ["periodType", "periodDate", "rank"],
      },
      {
        fields: ["userId", "periodType", "periodDate"],
        unique: true,
      },
    ],
  }
);

// Relationships
User.hasMany(PeriodLeaderboard, { foreignKey: "userId", onDelete: "CASCADE" });
PeriodLeaderboard.belongsTo(User, { foreignKey: "userId" });

User.hasMany(UserBadge, { foreignKey: "userId", onDelete: "CASCADE" });
UserBadge.belongsTo(User, { foreignKey: "userId" });
UserBadge.belongsTo(Badge, { foreignKey: "badgeId" });

User.hasOne(UserLevel, { foreignKey: "userId", onDelete: "CASCADE" });
UserLevel.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Achievement, { foreignKey: "userId", onDelete: "CASCADE" });
Achievement.belongsTo(User, { foreignKey: "userId" });

User.hasMany(MonthlyLeaderboard, { foreignKey: "userId", onDelete: "CASCADE" });
MonthlyLeaderboard.belongsTo(User, { foreignKey: "userId" });

User.hasMany(LeaderboardHistory, { foreignKey: "userId", onDelete: "CASCADE" });
LeaderboardHistory.belongsTo(User, { foreignKey: "userId" });

// Initialize default badges
export const initializeDefaultBadges = async () => {
  const defaultBadges = [
    // Consistency Badges
    {
      name: "Early Bird",
      description: "Log trades for 3 consecutive days",
      type: "consistency",
      icon: "calendar",
      color: "#f59e0b",
      requirement: { type: "daily_streak", value: 3 },
      rarity: "common",
      xpReward: 50,
    },
    {
      name: "Dedicated Trader",
      description: "Log trades for 7 consecutive days",
      type: "consistency",
      icon: "trending-up",
      color: "#ef4444",
      requirement: { type: "daily_streak", value: 7 },
      rarity: "rare",
      xpReward: 100,
    },
    {
      name: "Trading Warrior",
      description: "Log trades for 30 consecutive days",
      type: "consistency",
      icon: "shield",
      color: "#8b5cf6",
      requirement: { type: "daily_streak", value: 30 },
      rarity: "epic",
      xpReward: 500,
    },
    {
      name: "Legendary Consistency",
      description: "Log trades for 90 consecutive days",
      type: "consistency",
      icon: "crown",
      color: "#f59e0b",
      requirement: { type: "daily_streak", value: 90 },
      rarity: "legendary",
      xpReward: 1000,
    },

    // Profit Streak Badges
    {
      name: "Profit Starter",
      description: "Make profit for 2 trades in a row",
      type: "profit",
      icon: "dollar-sign",
      color: "#10b981",
      requirement: { type: "profit_streak", value: 2 },
      rarity: "common",
      xpReward: 75,
    },
    {
      name: "Hot Streak",
      description: "Make profit for 5 trades in a row",
      type: "profit",
      icon: "flame",
      color: "#ef4444",
      requirement: { type: "profit_streak", value: 5 },
      rarity: "rare",
      xpReward: 200,
    },
    {
      name: "Profit King",
      description: "Make profit for 10 trades in a row",
      type: "profit",
      icon: "award",
      color: "#f59e0b",
      requirement: { type: "profit_streak", value: 10 },
      rarity: "epic",
      xpReward: 500,
    },
    {
      name: "Unstoppable",
      description: "Make profit for 20 trades in a row",
      type: "profit",
      icon: "zap",
      color: "#8b5cf6",
      requirement: { type: "profit_streak", value: 20 },
      rarity: "legendary",
      xpReward: 1000,
    },

    // Milestone Badges
    {
      name: "First Step",
      description: "Complete your first trade",
      type: "milestone",
      icon: "flag",
      color: "#6b7280",
      requirement: { type: "total_trades", value: 1 },
      rarity: "common",
      xpReward: 25,
    },
    {
      name: "Apprentice Trader",
      description: "Complete 10 trades",
      type: "milestone",
      icon: "user",
      color: "#10b981",
      requirement: { type: "total_trades", value: 10 },
      rarity: "common",
      xpReward: 100,
    },
    {
      name: "Seasoned Trader",
      description: "Complete 50 trades",
      type: "milestone",
      icon: "bar-chart",
      color: "#3b82f6",
      requirement: { type: "total_trades", value: 50 },
      rarity: "rare",
      xpReward: 250,
    },
    {
      name: "Master Trader",
      description: "Complete 100 trades",
      type: "milestone",
      icon: "star",
      color: "#8b5cf6",
      requirement: { type: "total_trades", value: 100 },
      rarity: "epic",
      xpReward: 500,
    },
    {
      name: "Trading Legend",
      description: "Complete 500 trades",
      type: "milestone",
      icon: "crown",
      color: "#f59e0b",
      requirement: { type: "total_trades", value: 500 },
      rarity: "legendary",
      xpReward: 2000,
    },

    // Achievement Badges
    {
      name: "Risk Manager",
      description: "Maintain positive risk-reward ratio for 10 trades",
      type: "achievement",
      icon: "shield",
      color: "#10b981",
      requirement: { type: "risk_reward_positive", value: 10 },
      rarity: "rare",
      xpReward: 150,
    },
    {
      name: "Disciplined Trader",
      description: "Use stop loss in 20 consecutive trades",
      type: "achievement",
      icon: "target",
      color: "#3b82f6",
      requirement: { type: "stop_loss_used", value: 20 },
      rarity: "epic",
      xpReward: 300,
    },
  ];

  try {
    for (const badgeData of defaultBadges) {
      await Badge.findOrCreate({
        where: { name: badgeData.name },
        defaults: badgeData,
      });
    }
    console.log("Default badges initialized");
  } catch (error) {
    console.error("Error initializing default badges:", error);
  }
};

// models/gamification.js - VERSI DIPERBAIKI
export const initializeExchangeRates = async () => {
  const defaultRates = [
    {
      fromCurrency: "USD",
      toCurrency: "USD",
      rate: 1.0,
      effectiveFrom: new Date(),
      isActive: true,
      source: "system"
    },
    {
      fromCurrency: "CENT", 
      toCurrency: "USD",
      rate: 0.01,
      effectiveFrom: new Date(),
      isActive: true,
      source: "system",
      note: "100 CENT = 1 USD"
    }
    // TIDAK ADA IDR DI DEFAULT RATES!
    // IDR rate harus dari API atau manual update
  ];

  try {
    console.log("🔄 Initializing SYSTEM exchange rates (USD, CENT only)...");
    
    for (const rateData of defaultRates) {
      // Cek apakah sudah ada rate aktif untuk pair ini
      const existingActive = await ExchangeRate.findOne({
        where: {
          fromCurrency: rateData.fromCurrency,
          toCurrency: rateData.toCurrency,
          isActive: true
        }
      });
      
      // Hanya buat jika belum ada yang aktif
      if (!existingActive) {
        await ExchangeRate.create({
          fromCurrency: rateData.fromCurrency,
          toCurrency: rateData.toCurrency,
          rate: rateData.rate,
          effectiveFrom: new Date(),
          isActive: true,
          source: rateData.source || "system"
        });
        
        console.log(`✅ Created SYSTEM rate: 1 ${rateData.fromCurrency} = ${rateData.rate} ${rateData.toCurrency}`);
      } else {
        console.log(`⏭️  Skipping ${rateData.fromCurrency}->${rateData.toCurrency}, active rate already exists`);
      }
    }
    
    console.log("✅ Exchange rates initialization completed");
    
    // Cek status rates
    await this.checkExchangeRateStatus();
    
  } catch (error) {
    console.error("❌ Error initializing exchange rates:", error);
  }
};

// Fungsi untuk cek status exchange rates
export const checkExchangeRateStatus = async () => {
  try {
    const rates = await ExchangeRate.findAll({
      order: [['fromCurrency', 'ASC'], ['toCurrency', 'ASC'], ['effectiveFrom', 'DESC']]
    });
    
    const summary = {};
    rates.forEach(rate => {
      const key = `${rate.fromCurrency}_${rate.toCurrency}`;
      if (!summary[key]) summary[key] = [];
      summary[key].push({
        id: rate.id,
        rate: rate.rate,
        isActive: rate.isActive,
        effectiveFrom: rate.effectiveFrom,
        source: rate.source
      });
    });
    
    console.log("📊 Exchange Rate Status Summary:");
    Object.keys(summary).forEach(key => {
      const activeRates = summary[key].filter(r => r.isActive);
      console.log(`  ${key}: ${activeRates.length} active, ${summary[key].length} total records`);
      
      if (activeRates.length > 1) {
        console.warn(`  ⚠️  WARNING: Multiple active rates for ${key}`);
      } else if (activeRates.length === 0) {
        console.warn(`  ⚠️  WARNING: No active rate for ${key}`);
      }
    });
    
    return summary;
  } catch (error) {
    console.error("Error checking exchange rate status:", error);
    return null;
  }
};

// ==================== UPDATE EXCHANGE RATE FROM API ====================
const updateExchangeRateFromAPI = async (
  fromCurrency,
  toCurrency,
  rate
) => {
  const transaction = await db.transaction();

  try {
    console.log(
      `🔄 Updating exchange rate: 1 ${fromCurrency} = ${rate} ${toCurrency}`
    );

    // 1. Nonaktifkan rate lama untuk pair ini
    await ExchangeRate.update(
      {
        isActive: false,
        effectiveTo: new Date(),
        lastUpdated: new Date(),
      },
      {
        where: {
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
          isActive: true,
        },
        transaction,
      }
    );

    // 2. Buat rate baru
    const newRate = await ExchangeRate.create(
      {
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        rate: rate,
        effectiveFrom: new Date(),
        effectiveTo: null,
        isActive: true,
        source: "api",
        lastUpdated: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    console.log(
      `✅ Exchange rate updated: 1 ${newRate.fromCurrency} = ${newRate.rate} ${newRate.toCurrency}`
    );

    return newRate;
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error updating exchange rate from API:", error);
    throw error;
  }
};

// ==================== GET LATEST EXCHANGE RATE ====================
const getLatestExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    const rate = await ExchangeRate.findOne({
      where: {
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        isActive: true,
      },
      order: [["effectiveFrom", "DESC"]],
    });

    return rate;
  } catch (error) {
    console.error("Error getting latest exchange rate:", error);
    return null;
  }
};

export {
  Badge,
  UserBadge,
  UserLevel,
  Achievement,
  MonthlyLeaderboard,
  LeaderboardHistory,
  PeriodLeaderboard,
  ExchangeRate,
  updateExchangeRateFromAPI,
  getLatestExchangeRate,
};
