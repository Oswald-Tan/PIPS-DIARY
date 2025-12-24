import {
  Badge,
  UserBadge,
  UserLevel,
  Achievement,
  PeriodLeaderboard,
  ExchangeRate,
} from "../models/gamification.js";
import Trade from "../models/trade.js";
import { Op } from "sequelize";
import User from "../models/user.js";
import currencyService from "../services/currencyService.js";

// Helper: Get current period (YYYY-MM)
const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// Helper: Calculate required XP for a level
const calculateRequiredXP = (level) => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

// Add experience to user
const addExperience = async (userId, xp) => {
  try {
    let userLevel = await UserLevel.findOne({ where: { userId } });

    if (!userLevel) {
      userLevel = await UserLevel.create({
        userId,
        level: 1,
        experience: 0,
        totalExperience: 0,
        dailyStreak: 0,
        totalTrades: 0,
        consecutiveWins: 0,
        maxConsecutiveWins: 0,
      });
    }

    const newTotalXP = userLevel.totalExperience + xp;
    let currentLevel = userLevel.level;
    let currentXP = userLevel.experience + xp;
    let levelUps = 0;

    // Check for level ups
    while (currentXP >= calculateRequiredXP(currentLevel)) {
      currentXP -= calculateRequiredXP(currentLevel);
      currentLevel++;
      levelUps++;
    }

    await userLevel.update({
      level: currentLevel,
      experience: currentXP,
      totalExperience: newTotalXP,
    });

    return { level: currentLevel, experience: currentXP, levelUps };
  } catch (error) {
    console.error("Error adding experience:", error);
    throw error;
  }
};

// Update daily streak
const updateDailyStreak = async (userId) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const userLevel = await UserLevel.findOne({ where: { userId } });

    if (!userLevel) return 0;

    if (userLevel.lastActiveDate) {
      const lastActive = new Date(userLevel.lastActiveDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        lastActive.toISOString().split("T")[0] ===
        yesterday.toISOString().split("T")[0]
      ) {
        // Consecutive day
        await userLevel.update({
          dailyStreak: userLevel.dailyStreak + 1,
          lastActiveDate: today,
        });
      } else if (lastActive.toISOString().split("T")[0] !== today) {
        // Streak broken
        await userLevel.update({
          dailyStreak: 1,
          lastActiveDate: today,
        });
      }
    } else {
      // First time
      await userLevel.update({
        dailyStreak: 1,
        lastActiveDate: today,
      });
    }

    return userLevel.dailyStreak;
  } catch (error) {
    console.error("Error updating daily streak:", error);
    throw error;
  }
};

// Update profit streak
const updateProfitStreak = async (userId, tradeProfit) => {
  try {
    const userLevel = await UserLevel.findOne({ where: { userId } });
    if (!userLevel) return 0;

    const today = new Date().toISOString().split("T")[0];

    if (tradeProfit > 0) {
      if (userLevel.lastProfitDate === today) {
        // Already updated today
        return userLevel.profitStreak;
      }

      if (userLevel.lastProfitDate) {
        const lastProfit = new Date(userLevel.lastProfitDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (
          lastProfit.toISOString().split("T")[0] ===
          yesterday.toISOString().split("T")[0]
        ) {
          // Consecutive profit day
          await userLevel.update({
            profitStreak: userLevel.profitStreak + 1,
            lastProfitDate: today,
          });
        } else if (lastProfit.toISOString().split("T")[0] !== today) {
          // New streak
          await userLevel.update({
            profitStreak: 1,
            lastProfitDate: today,
          });
        }
      } else {
        // First profit
        await userLevel.update({
          profitStreak: 1,
          lastProfitDate: today,
        });
      }
    } else {
      // Loss - reset streak
      if (userLevel.lastProfitDate !== today) {
        await userLevel.update({
          profitStreak: 0,
          lastProfitDate: today,
        });
      }
    }

    return userLevel.profitStreak;
  } catch (error) {
    console.error("Error updating profit streak:", error);
    throw error;
  }
};

// Update consecutive wins
const updateConsecutiveWins = async (userId, tradeResult) => {
  try {
    const userLevel = await UserLevel.findOne({ where: { userId } });
    if (!userLevel) return { consecutiveWins: 0, maxConsecutiveWins: 0 };

    let newConsecutiveWins = userLevel.consecutiveWins;

    if (tradeResult.toLowerCase().includes("win")) {
      newConsecutiveWins += 1;
    } else {
      newConsecutiveWins = 0;
    }

    const maxConsecutiveWins = Math.max(
      userLevel.maxConsecutiveWins,
      newConsecutiveWins
    );

    await userLevel.update({
      consecutiveWins: newConsecutiveWins,
      maxConsecutiveWins: maxConsecutiveWins,
    });

    return { consecutiveWins: newConsecutiveWins, maxConsecutiveWins };
  } catch (error) {
    console.error("Error updating consecutive wins:", error);
    throw error;
  }
};

// Check and award badges - FIXED VERSION
const checkAndAwardBadges = async (userId) => {
  try {
    const userLevel = await UserLevel.findOne({ where: { userId } });
    if (!userLevel) {
      console.log(`UserLevel not found for userId: ${userId}`);
      return [];
    }

    const badges = await Badge.findAll();
    if (!badges || badges.length === 0) {
      console.log("No badges found in database");
      return [];
    }

    const awardedBadges = [];

    for (const badge of badges) {
      try {
        const userBadge = await UserBadge.findOne({
          where: { userId, badgeId: badge.id },
        });

        // Skip if already achieved
        if (userBadge && userBadge.achievedAt) {
          continue;
        }

        let progress = 0;
        let achieved = false;

        // Parse requirement
        const requirement = badge.requirement;
        if (!requirement || !requirement.type) {
          console.warn(
            `Badge ${badge.id} has invalid requirement:`,
            requirement
          );
          continue;
        }

        // Calculate progress based on requirement type
        switch (requirement.type) {
          case "daily_streak":
            progress = userLevel.dailyStreak || 0;
            achieved = progress >= (requirement.value || 0);
            break;

          case "profit_streak":
            progress = userLevel.profitStreak || 0;
            achieved = progress >= (requirement.value || 0);
            break;

          case "total_trades":
            progress = userLevel.totalTrades || 0;
            achieved = progress >= (requirement.value || 0);
            break;

          // Add more requirement types as needed
          default:
            console.warn(
              `Unknown requirement type: ${requirement.type} for badge ${badge.id}`
            );
            continue;
        }

        // Create or update user badge record
        if (userBadge) {
          await userBadge.update({
            progress,
            ...(achieved && !userBadge.achievedAt
              ? { achievedAt: new Date() }
              : {}),
          });
        } else {
          await UserBadge.create({
            userId,
            badgeId: badge.id,
            progress,
            ...(achieved ? { achievedAt: new Date() } : {}),
          });
        }

        // If achieved now, award XP and add to list
        if (achieved && (!userBadge || !userBadge.achievedAt)) {
          // Award XP
          if (badge.xpReward && badge.xpReward > 0) {
            await addExperience(userId, badge.xpReward);
          }

          awardedBadges.push({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            type: "badge",
            xp: badge.xpReward,
            icon: badge.icon,
            color: badge.color,
            rarity: badge.rarity,
          });

          console.log(`Badge awarded: ${badge.name} to user ${userId}`);
        }
      } catch (badgeError) {
        console.error(`Error processing badge ${badge.id}:`, badgeError);
      }
    }

    return awardedBadges;
  } catch (error) {
    console.error("Error in checkAndAwardBadges:", error);
    return [];
  }
};

// Check for special achievements
const checkSpecialAchievements = async (userId, tradeData) => {
  try {
    const achievements = [];
    const today = new Date();

    // Check for first trade
    const totalTrades = await Trade.count({ where: { userId } });
    if (totalTrades === 1) {
      const existingAchievement = await Achievement.findOne({
        where: { userId, type: "first_trade" },
      });

      if (!existingAchievement) {
        const achievement = await Achievement.create({
          userId,
          type: "first_trade",
          title: "First Trade!",
          description: "Completed your first trade in the journal",
          achievedAt: today,
        });
        achievements.push(achievement);
        await addExperience(userId, 50);
      }
    }

    // Check for first profit
    if (tradeData.profit > 0) {
      const profitableTrades = await Trade.count({
        where: { userId, profit: { [Op.gt]: 0 } },
      });

      if (profitableTrades === 1) {
        const existingAchievement = await Achievement.findOne({
          where: { userId, type: "first_profit" },
        });

        if (!existingAchievement) {
          const achievement = await Achievement.create({
            userId,
            type: "first_profit",
            title: "First Profit!",
            description: "Made your first profitable trade",
            achievedAt: today,
          });
          achievements.push(achievement);
          await addExperience(userId, 75);
        }
      }
    }

    return achievements;
  } catch (error) {
    console.error("Error checking special achievements:", error);
    return [];
  }
};

// Calculate monthly score
const calculateMonthlyScore = (userStats) => {
  let score = 0;

  // Based on total profit (40% weight)
  score += Math.min(userStats.totalProfit / 10000, 100) * 40;

  // Based on win rate (30% weight)
  score += userStats.winRate * 30;

  // Based on number of trades (20% weight)
  score += Math.min(userStats.totalTrades / 50, 100) * 20;

  // Based on consistency (10% weight)
  score += Math.min(userStats.dailyActivity / 30, 100) * 10;

  return Math.round(score);
};

// Update monthly leaderboard
const updateMonthlyLeaderboard = async (userId, tradeData = null) => {
  try {
    const period = getCurrentPeriod();
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    // Get user's monthly trades
    const monthlyTrades = await Trade.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    // Calculate monthly stats
    const totalTrades = monthlyTrades.length;
    const totalProfit = monthlyTrades.reduce(
      (sum, trade) => sum + (parseFloat(trade.profit) || 0),
      0
    );
    const winTrades = monthlyTrades.filter((trade) =>
      trade.result?.toLowerCase().includes("win")
    ).length;
    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;

    // Calculate daily activity (unique days with trades)
    const tradingDays = new Set(monthlyTrades.map((trade) => trade.date)).size;

    // Calculate score
    const score = calculateMonthlyScore({
      totalTrades,
      totalProfit,
      winRate,
      dailyActivity: tradingDays,
    });

    // Update or create monthly leaderboard entry
    await MonthlyLeaderboard.upsert({
      userId,
      period,
      score,
      totalTrades,
      totalProfit,
      winRate,
    });

    // Recalculate ranks for current period
    await recalculateMonthlyRanks(period);

    return { period, score, rank: null };
  } catch (error) {
    console.error("Error updating monthly leaderboard:", error);
    throw error;
  }
};

// Recalculate monthly ranks
const recalculateMonthlyRanks = async (period) => {
  try {
    // Get all entries for period, sorted by score
    const entries = await MonthlyLeaderboard.findAll({
      where: { period },
      order: [["score", "DESC"]],
      include: [{ model: User }],
    });

    // Update ranks
    for (let i = 0; i < entries.length; i++) {
      await entries[i].update({ rank: i + 1 });
    }

    return entries;
  } catch (error) {
    console.error("Error recalculating monthly ranks:", error);
    throw error;
  }
};

// Main function to process trade for gamification
export const processTradeForGamification = async (userId, tradeData) => {
  try {
    // Initialize user level if not exists
    let userLevel = await UserLevel.findOne({ where: { userId } });
    if (!userLevel) {
      userLevel = await UserLevel.create({
        userId,
        level: 1,
        experience: 0,
        totalExperience: 0,
        dailyStreak: 0,
        totalTrades: 0,
        consecutiveWins: 0,
        maxConsecutiveWins: 0,
      });
    }

    // Update trade count
    await userLevel.increment("totalTrades");

    // Update streaks and stats
    await updateDailyStreak(userId);
    await updateProfitStreak(userId, tradeData.profit);
    await updateConsecutiveWins(userId, tradeData.result);

    // Award base XP for completing trade
    await addExperience(userId, 10);

    // Bonus XP for profitable trade
    if (tradeData.profit > 0) {
      await addExperience(
        userId,
        Math.min(50, Math.floor(tradeData.profit / 10))
      );
    }

    // Check for special achievements
    const newAchievements = await checkSpecialAchievements(userId, tradeData);

    // Check and award badges - FIXED: Now returns awarded badges
    const newBadges = await checkAndAwardBadges(userId);

    // Update monthly leaderboard
    const monthlyUpdate = await updateMonthlyLeaderboard(userId, tradeData);

    // Get updated user level
    const updatedUserLevel = await UserLevel.findOne({ where: { userId } });

    return {
      newAchievements,
      newBadges, // This will contain badges that were just awarded
      userLevel: updatedUserLevel,
      monthlyUpdate,
    };
  } catch (error) {
    console.error("Error processing trade for gamification:", error);
    throw error;
  }
};

// Get user gamification profile
export const getUserGamificationProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const userLevel = await UserLevel.findOne({ where: { userId } });
    const userBadges = await UserBadge.findAll({
      where: { userId },
      include: [{ model: Badge }],
      order: [["achievedAt", "DESC"]],
    });

    const recentAchievements = await Achievement.findAll({
      where: { userId },
      order: [["achievedAt", "DESC"]],
      limit: 10,
    });

    const nextLevelXP = userLevel ? calculateRequiredXP(userLevel.level) : 100;

    res.json({
      success: true,
      data: {
        level: userLevel || {
          level: 1,
          experience: 0,
          totalExperience: 0,
          dailyStreak: 0,
          totalTrades: 0,
          consecutiveWins: 0,
          maxConsecutiveWins: 0,
          profitStreak: 0,
        },
        badges: userBadges,
        recentAchievements,
        nextLevelXP,
        levelProgress: userLevel
          ? (userLevel.experience / nextLevelXP) * 100
          : 0,
      },
    });
  } catch (error) {
    console.error("Get gamification profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// controllers/gamification.js - getAllBadges - VERSI DIPERBAIKI
export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.findAll({
      order: [
        ["type", "ASC"],
        ["requirement", "ASC"],
      ],
    });

    const userId = req.userId;
    const userBadges = await UserBadge.findAll({
      where: { userId },
      include: [{ model: Badge }],
    });

    const badgesWithProgress = badges.map((badge) => {
      const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);
      
      // **FIXED: Pastikan requirementValue selalu berupa number**
      let requirementValue = 0;
      
      // Handle requirement parsing dengan robust
      try {
        // Jika requirement adalah string JSON
        if (typeof badge.requirement === 'string') {
          const parsed = JSON.parse(badge.requirement);
          requirementValue = Number(parsed.value) || 0;
        } 
        // Jika requirement sudah berupa object (hasil parsing Sequelize)
        else if (badge.requirement && typeof badge.requirement === 'object') {
          requirementValue = Number(badge.requirement.value) || 0;
        }
      } catch (error) {
        console.error(`Error parsing requirement for badge ${badge.id}:`, error);
        // Fallback: extract number from string
        const reqString = String(badge.requirement || '');
        const match = reqString.match(/"value":\s*(\d+)/);
        requirementValue = match ? Number(match[1]) : 0;
      }

      const result = {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        type: badge.type,
        icon: badge.icon,
        color: badge.color,
        rarity: badge.rarity,
        xpReward: badge.xpReward,
        progress: userBadge?.progress || 0,
        requirementValue: requirementValue, // **INI HARUS NUMBER**
        achieved: !!userBadge?.achievedAt,
        achievedAt: userBadge?.achievedAt,
      };

      return result;
    });

    res.json({
      success: true,
      data: badgesWithProgress,
    });
  } catch (error) {
    console.error("Get all badges error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// Get leaderboard dengan filter periode
export const getLeaderboard = async (req, res) => {
  try {
    const {
      periodType = "monthly",
      periodValue,
      limit = 20,
      page = 1,
      includeCurrentUser = true,
    } = req.query;

    const userId = req.userId;

    // Jika periodValue tidak diberikan, gunakan current period
    let targetPeriod = periodValue;
    if (!targetPeriod) {
      const now = new Date();
      targetPeriod = getPeriodValue(now, periodType);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const totalCount = await PeriodLeaderboard.count({
      where: {
        periodType,
        periodValue: targetPeriod,
      },
    });

    // Get leaderboard entries
    const entries = await PeriodLeaderboard.findAll({
      where: {
        periodType,
        periodValue: targetPeriod,
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "currency"],
        },
      ],
      order: [
        ["score", "DESC"],
        ["totalProfitUSD", "DESC"],
      ],
      limit: parseInt(limit),
      offset: offset,
    });

    // Dapatkan semua userId untuk query UserLevel
    const userIds = entries.map((entry) => entry.userId);

    // Query UserLevel secara terpisah
    const userLevels = await UserLevel.findAll({
      where: {
        userId: userIds,
      },
      raw: true,
    });

    // Buat map untuk akses cepat
    const userLevelMap = {};
    userLevels.forEach((ul) => {
      userLevelMap[ul.userId] = ul;
    });

    // **REAL-TIME CONVERSION: Konversi setiap entry dengan rate terbaru**
    const formattedEntries = await Promise.all(
      entries.map(async (entry) => {
        const user = entry.User;
        const userLevel = userLevelMap[entry.userId];

        // Data dasar dari database
        const baseData = {
          rank: entry.rank,
          userId: entry.userId,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            currency: user.currency,
          },
          totalProfitOriginal: parseFloat(entry.totalProfitOriginal),
          originalCurrency: entry.originalCurrency,
          totalTrades: entry.totalTrades,
          winRate: parseFloat(entry.winRate),
          dailyActivity: entry.dailyActivity,
          consistencyScore: parseFloat(entry.consistencyScore),
          isCurrentUser: entry.userId === parseInt(userId),
        };

        // **KONVERSI REAL-TIME**
        let realTimeProfitUSD = parseFloat(entry.totalProfitUSD); // Default: cached value
        let exchangeRateUsed = entry.lastExchangeRate || 1;
        let conversionMethod = "cached";
        let rateTimestamp = entry.exchangeRateUpdatedAt;

        try {
          // Hanya lakukan konversi jika currency bukan USD
          if (entry.originalCurrency !== "USD") {
            const currentRate = await currencyService.getRateToUSD(
              entry.originalCurrency
            );

            // Hitung profit dengan rate terbaru
            realTimeProfitUSD = await currencyService.convertToUSD(
              entry.totalProfitOriginal,
              entry.originalCurrency
            );

            exchangeRateUsed = currentRate;
            conversionMethod = "real-time";
            rateTimestamp = new Date();

            // **OPTIONAL: Update cached value di background** (non-blocking)
            // Hanya update jika perbedaan signifikan (> 0.5%)
            const cachedProfit = parseFloat(entry.totalProfitUSD);
            const difference = Math.abs(
              (realTimeProfitUSD - cachedProfit) / cachedProfit
            );

            if (difference > 0.005) {
              // 0.5%
              // Update di background, tidak perlu menunggu
              PeriodLeaderboard.update(
                {
                  totalProfitUSD: realTimeProfitUSD,
                  lastExchangeRate: currentRate,
                  exchangeRateUpdatedAt: new Date(),
                },
                {
                  where: { id: entry.id },
                  silent: true, // Tidak trigger hooks
                }
              ).catch((err) =>
                console.warn(
                  `Background update failed for entry ${entry.id}:`,
                  err.message
                )
              );
            }
          }
        } catch (error) {
          console.warn(
            `Real-time conversion failed for user ${entry.userId}:`,
            error.message
          );
          // Fallback ke cached value
          conversionMethod = "cached (fallback)";
        }

        // Data XP dan Streak
        const level = entry.userLevel || (userLevel ? userLevel.level : 1);
        const totalExperience =
          entry.totalExperience || (userLevel ? userLevel.totalExperience : 0);
        const dailyStreak =
          entry.dailyStreak || (userLevel ? userLevel.dailyStreak : 0);
        const totalTradesCount =
          entry.totalTradesUser || (userLevel ? userLevel.totalTrades : 0);
        const profitStreak =
          entry.profitStreak || (userLevel ? userLevel.profitStreak : 0);
        const maxConsecutiveWins =
          entry.maxConsecutiveWins ||
          (userLevel ? userLevel.maxConsecutiveWins : 0);

        return {
          ...baseData,
          score: entry.score,
          totalProfitUSD: realTimeProfitUSD,
          totalTradesUser: totalTradesCount,
          level: level,
          totalExperience: totalExperience,
          dailyStreak: dailyStreak,
          profitStreak: profitStreak,
          maxConsecutiveWins: maxConsecutiveWins,

          // **METADATA KONVERSI** (untuk debugging/transparansi)
          conversionInfo: {
            method: conversionMethod,
            rateUsed: exchangeRateUsed,
            rateUpdatedAt: rateTimestamp,
            currency: entry.originalCurrency,
          },
        };
      })
    );

    // **REORDER BERDASARKAN PROFIT REAL-TIME** (Opsional, tapi penting untuk kompetisi fair)
    // Sort by real-time profit USD
    formattedEntries.sort((a, b) => b.totalProfitUSD - a.totalProfitUSD);

    // Update rank berdasarkan real-time profit
    formattedEntries.forEach((entry, index) => {
      entry.realTimeRank = index + 1;
    });

    // Get user's rank dengan konversi real-time juga
    let userRealTimeRank = null;
    let userEntry = null;

    if (includeCurrentUser !== "false") {
      const userEntryRecord = await PeriodLeaderboard.findOne({
        where: {
          periodType,
          periodValue: targetPeriod,
          userId,
        },
        include: [{ model: User, attributes: ["currency"] }],
      });

      if (userEntryRecord) {
        // Hitung real-time profit untuk current user
        let userRealTimeProfitUSD = parseFloat(userEntryRecord.totalProfitUSD);
        let userConversionMethod = "cached";

        if (userEntryRecord.originalCurrency !== "USD") {
          try {
            userRealTimeProfitUSD = await currencyService.convertToUSD(
              userEntryRecord.totalProfitOriginal,
              userEntryRecord.originalCurrency
            );
            userConversionMethod = "real-time";
          } catch (error) {
            console.warn(
              `Real-time conversion for current user failed:`,
              error.message
            );
          }
        }

        // Cari rank berdasarkan real-time profit
        userRealTimeRank =
          formattedEntries.findIndex(
            (entry) => entry.userId === parseInt(userId)
          ) + 1;

        userEntry = {
          rank: userRealTimeRank, // Gunakan real-time rank
          score: userEntryRecord.score,
          totalProfitUSD: userRealTimeProfitUSD,
          totalProfitOriginal: parseFloat(userEntryRecord.totalProfitOriginal),
          originalCurrency: userEntryRecord.originalCurrency,
          totalTrades: userEntryRecord.totalTrades,
          winRate: parseFloat(userEntryRecord.winRate),
          conversionMethod: userConversionMethod,
        };
      }
    }

    // Get available periods
    const availablePeriods = await PeriodLeaderboard.findAll({
      attributes: ["periodValue"],
      where: { periodType },
      group: ["periodValue"],
      order: [["periodValue", "DESC"]],
      limit: 12,
    });

    // Get exchange rate info untuk disclaimer
    const exchangeRates = await ExchangeRate.findAll({
      where: {
        toCurrency: "USD",
        isActive: true,
      },
      order: [["effectiveFrom", "DESC"]],
    });

    // Get latest rates untuk semua mata uang yang ada di leaderboard
    const uniqueCurrencies = [
      ...new Set(formattedEntries.map((entry) => entry.originalCurrency)),
    ];
    const latestRates = {};

    for (const currency of uniqueCurrencies) {
      if (currency !== "USD") {
        try {
          const rate = await currencyService.getRateToUSD(currency);
          latestRates[currency] = {
            rate: rate,
            timestamp: new Date().toISOString(),
            source: "currency-api",
          };
        } catch (error) {
          // Fallback ke rate dari database
          const dbRate = await ExchangeRate.findOne({
            where: {
              fromCurrency: currency,
              toCurrency: "USD",
              isActive: true,
            },
            order: [["effectiveFrom", "DESC"]],
          });

          if (dbRate) {
            latestRates[currency] = {
              rate: parseFloat(dbRate.rate),
              timestamp: dbRate.updatedAt,
              source: dbRate.source,
            };
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        leaders: formattedEntries,
        userRank: userRealTimeRank,
        userEntry: userEntry,
        periodType,
        periodValue: targetPeriod,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
        availablePeriods: availablePeriods.map((p) => p.periodValue),

        // **ENHANCED DISCLAIMER DENGAN REAL-TIME INFO**
        disclaimer: {
          title: "Real-time Currency Conversion",
          message:
            "All profits are converted to USD using the latest exchange rates. Rankings update instantly with rate changes.",
          conversionMethod: "real-time",
          note: "Cached values may be updated in the background for performance",
          timestamp: new Date().toISOString(),
        },

        // **DETAILED RATE INFORMATION**
        exchangeRates: {
          current: latestRates,
          historical: exchangeRates.map((rate) => ({
            from: rate.fromCurrency,
            to: rate.toCurrency,
            rate: parseFloat(rate.rate),
            updatedAt: rate.updatedAt,
            source: rate.source,
          })),
        },

        // **PERFORMANCE METRICS** (opsional, untuk debugging)
        performance: {
          conversionMethod: "real-time",
          cacheHitRate: `${(
            (formattedEntries.filter((e) =>
              e.conversionInfo.method.includes("cached")
            ).length /
              formattedEntries.length) *
            100
          ).toFixed(1)}%`,
          currenciesConverted:
            uniqueCurrencies.length -
            (uniqueCurrencies.includes("USD") ? 1 : 0),
        },
      },
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

export const updateLeaderboardCachedRates = async (options = {}) => {
  try {
    const { force = false, silent = false } = options;

    if (!silent) {
      console.log(
        `🔄 Updating cached rates in leaderboard${
          force ? " (force mode)" : ""
        }...`
      );
    }

    // Ambil semua entry leaderboard aktif
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const whereClause = {
      updatedAt: {
        [Op.gte]: thirtyDaysAgo,
      },
      originalCurrency: {
        [Op.ne]: "USD", // Hanya yang bukan USD
      },
    };

    // Jika force, abaikan timestamp terakhir
    if (!force) {
      whereClause[Op.or] = [
        { exchangeRateUpdatedAt: null },
        { exchangeRateUpdatedAt: { [Op.lt]: new Date(Date.now() - 3600000) } }, // > 1 jam lalu
      ];
    }

    const entriesToUpdate = await PeriodLeaderboard.findAll({
      where: whereClause,
      limit: 1000,
    });

    if (!silent) {
      console.log(`📊 Found ${entriesToUpdate.length} entries to update`);
    }

    let updatedCount = 0;
    let failedCount = 0;

    // Group by currency untuk optimasi API calls
    const currencyGroups = {};
    entriesToUpdate.forEach((entry) => {
      if (!currencyGroups[entry.originalCurrency]) {
        currencyGroups[entry.originalCurrency] = [];
      }
      currencyGroups[entry.originalCurrency].push(entry);
    });

    // Update per currency group
    for (const [currency, entries] of Object.entries(currencyGroups)) {
      try {
        // Dapatkan rate terbaru sekali untuk semua entries dengan currency yang sama
        const currentRate = await currencyService.getRateToUSD(currency);

        for (const entry of entries) {
          try {
            // Konversi profit dengan rate terbaru
            const realTimeProfitUSD =
              parseFloat(entry.totalProfitOriginal) * currentRate;

            // Update entry
            await entry.update({
              totalProfitUSD: realTimeProfitUSD,
              lastExchangeRate: currentRate,
              exchangeRateUpdatedAt: new Date(),
            });

            updatedCount++;
          } catch (entryError) {
            console.warn(
              `Failed to update entry ${entry.id}:`,
              entryError.message
            );
            failedCount++;
          }
        }

        // Small delay antara currency groups
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (currencyError) {
        console.warn(
          `Failed to update currency ${currency}:`,
          currencyError.message
        );
        failedCount += entries.length;
      }
    }

    if (!silent) {
      console.log(
        `✅ Updated ${updatedCount} cached rates, ${failedCount} failed`
      );
    }

    return {
      updatedCount,
      failedCount,
      totalProcessed: entriesToUpdate.length,
      timestamp: new Date().toISOString(),
      mode: force ? "force" : "standard",
    };
  } catch (error) {
    console.error("❌ Error updating cached rates:", error);
    throw error;
  }
};

// Get leaderboard history (multiple periods)
export const getLeaderboardHistory = async (req, res) => {
  try {
    const { periodType = "monthly", limit = 6 } = req.query;
    const userId = req.userId;

    // Get available periods
    const periods = await PeriodLeaderboard.findAll({
      attributes: ["periodValue"],
      where: { periodType },
      group: ["periodValue"],
      order: [["periodValue", "DESC"]],
      limit: parseInt(limit),
    });

    // Get user's history for each period
    const history = await Promise.all(
      periods.map(async (period) => {
        const entry = await PeriodLeaderboard.findOne({
          where: {
            userId,
            periodType,
            periodValue: period.periodValue,
          },
          include: [{ model: User, attributes: ["currency"] }],
        });

        if (entry) {
          return {
            period: entry.periodValue,
            periodType: entry.periodType,
            rank: entry.rank,
            score: entry.score,
            totalProfitUSD: parseFloat(entry.totalProfitUSD),
            totalProfitOriginal: parseFloat(entry.totalProfitOriginal),
            originalCurrency: entry.originalCurrency,
            totalTrades: entry.totalTrades,
            winRate: parseFloat(entry.winRate),
            dailyActivity: entry.dailyActivity,
          };
        }
        return null;
      })
    );

    res.json({
      success: true,
      data: history.filter(Boolean),
    });
  } catch (error) {
    console.error("Get leaderboard history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get available periods untuk dropdown
export const getAvailablePeriods = async (req, res) => {
  try {
    const { periodType = "monthly" } = req.query;

    const periods = await PeriodLeaderboard.findAll({
      attributes: ["periodValue"],
      where: { periodType },
      group: ["periodValue"],
      order: [["periodValue", "DESC"]],
    });

    res.json({
      success: true,
      data: periods.map((p) => ({
        value: p.periodValue,
        label: formatPeriodLabel(p.periodValue, periodType),
      })),
    });
  } catch (error) {
    console.error("Get available periods error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Helper function untuk format period label
const formatPeriodLabel = (periodValue, periodType) => {
  try {
    if (periodType === "daily") {
      const [year, month, day] = periodValue.split("-");
      return `${day}/${month}/${year}`;
    } else if (periodType === "weekly") {
      const [year, week] = periodValue.split("-W");
      return `Week ${week}, ${year}`;
    } else {
      const [year, month] = periodValue.split("-");
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  } catch (error) {
    return periodValue;
  }
};

// Helper function untuk get period value
const getPeriodValue = (date, periodType) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const week = getWeekNumber(d);

  switch (periodType) {
    case "daily":
      return `${year}-${month}-${day}`;
    case "weekly":
      return `${year}-W${week}`;
    case "monthly":
      return `${year}-${month}`;
    default:
      return `${year}-${month}`;
  }
};

const getWeekNumber = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

// Reset monthly leaderboard (cron job)
export const resetMonthlyLeaderboard = async () => {
  try {
    const currentPeriod = getCurrentPeriod();

    // Archive current leaderboard (optional)
    console.log(`Archiving leaderboard for period: ${currentPeriod}`);

    // Leaderboard baru akan dibuat otomatis saat user trading di bulan baru
    return { success: true, message: `Leaderboard ready for new period` };
  } catch (error) {
    console.error("Error resetting monthly leaderboard:", error);
    throw error;
  }
};

// Update gamification when trades are deleted
export const handleTradesDeletion = async (
  userId,
  deletedTradesCount,
  deletedProfit
) => {
  try {
    const userLevel = await UserLevel.findOne({ where: { userId } });

    if (userLevel) {
      // Reduce total trades
      const newTotalTrades = Math.max(
        0,
        userLevel.totalTrades - deletedTradesCount
      );

      // Reduce total experience (optional)
      const experiencePenalty = Math.floor(deletedProfit / 100); // 1 XP per 100 profit lost
      const newTotalExperience = Math.max(
        0,
        userLevel.totalExperience - experiencePenalty
      );

      // Recalculate level based on new total experience
      let currentLevel = 1;
      let currentXP = newTotalExperience;

      while (currentXP >= calculateRequiredXP(currentLevel)) {
        currentXP -= calculateRequiredXP(currentLevel);
        currentLevel++;
      }

      await userLevel.update({
        level: currentLevel,
        experience: currentXP,
        totalExperience: newTotalExperience,
        totalTrades: newTotalTrades,
      });

      // Update monthly leaderboard
      await updateMonthlyLeaderboard(userId);

      return {
        success: true,
        newLevel: currentLevel,
        experienceLost: experiencePenalty,
      };
    }

    return { success: false, message: "User level not found" };
  } catch (error) {
    console.error("Error handling trades deletion:", error);
    throw error;
  }
};
