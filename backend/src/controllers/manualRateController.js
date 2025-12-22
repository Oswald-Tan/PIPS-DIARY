import { Op } from "sequelize";
import db from "../config/database.js";
import ExchangeRate from "../models/exchangeRate.js";
import User from "../models/user.js";
import { PeriodLeaderboard } from "../models/gamification.js";
import currencyService from "../services/currencyService.js";
import {
  validateCurrencyCode,
  validateRateValue,
} from "../utils/validation.js";

// ==================== HELPER FUNCTIONS ====================

const handleError = (res, error, message = "Server error") => {
  console.error(`[ManualRateController] ${message}:`, error);

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    const field = error.errors[0]?.path || "effectiveFrom";
    return res.status(409).json({
      success: false,
      message: "Duplicate rate entry detected. Please use a different effective date.",
      field: field,
      suggestion: "Try using a slightly different date/time (e.g., add 1 second)"
    });
  }

  res.status(500).json({
    success: false,
    message: `${message}: ${error.message}`,
  });
};

const updateLeaderboardWithNewRate = async (
  fromCurrency,
  toCurrency,
  newRate
) => {
  if (toCurrency !== "USD") return { updated: 0, skipped: true };

  try {
    console.log(
      `🔄 Updating leaderboard for new ${fromCurrency} rate: ${newRate}`
    );

    const entriesToUpdate = await PeriodLeaderboard.findAll({
      where: {
        originalCurrency: fromCurrency.toUpperCase(),
      },
      limit: 5000,
    });

    let updatedCount = 0;
    const batchSize = 100;

    for (let i = 0; i < entriesToUpdate.length; i += batchSize) {
      const batch = entriesToUpdate.slice(i, i + batchSize);
      const updatePromises = batch.map(async (entry) => {
        try {
          const newProfitUSD = parseFloat(entry.totalProfitOriginal) * newRate;

          await entry.update({
            totalProfitUSD: newProfitUSD,
            lastExchangeRate: newRate,
            exchangeRateUpdatedAt: new Date(),
          });

          updatedCount++;
          return { id: entry.id, success: true };
        } catch (error) {
          console.warn(`Failed to update entry ${entry.id}:`, error.message);
          return { id: entry.id, success: false, error: error.message };
        }
      });

      await Promise.all(updatePromises);
      console.log(
        `✅ Batch ${i / batchSize + 1} completed: ${updatedCount} total updated`
      );
    }

    console.log(
      `🎯 Leaderboard update complete: ${updatedCount} entries updated`
    );
    return { updated: updatedCount, skipped: false };
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return { updated: 0, skipped: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan effectiveFrom yang unik
const getUniqueEffectiveFrom = async (
  fromCurrency, 
  toCurrency, 
  proposedDate, 
  transaction,
  excludeId = null
) => {
  let currentDate = new Date(proposedDate);
  let attempts = 0;
  const maxAttempts = 10; // Naikkan dari 5 menjadi 10

  while (attempts < maxAttempts) {
    // Cek apakah sudah ada rate dengan effectiveFrom ini
    const existing = await ExchangeRate.findOne({
      where: {
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        effectiveFrom: currentDate,
        ...(excludeId && { id: { [Op.ne]: excludeId } })
      },
      transaction
    });

    if (!existing) {
      return currentDate;
    }

    // Tambah 1 milidetik untuk memastikan unik
    currentDate = new Date(currentDate.getTime() + 1);
    attempts++;
  }

  throw new Error(`Cannot find unique effectiveFrom after ${maxAttempts} attempts`);
};

// ==================== CONTROLLER FUNCTIONS ====================

// GET: Get all manual rates with pagination and filtering
export const getManualRates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      isActive = true,
      sortBy = "effectiveFrom",
      sortOrder = "DESC",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause - HANYA IDR→USD
    let whereClause = {
      source: "manual",
      fromCurrency: "IDR",
      toCurrency: "USD",
    };

    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    if (search) {
      whereClause[Op.or] = [{ notes: { [Op.like]: `%${search}%` } }];
    }

    // Get total count
    const totalCount = await ExchangeRate.count({ where: whereClause });

    // Get paginated data
    const rates = await ExchangeRate.findAll({
      where: whereClause,
      order: [
        ["effectiveFrom", "DESC"],
        ["id", "DESC"],
      ],
      limit: parseInt(limit),
      offset: offset,
      include: [
        {
          model: User,
          as: "updater",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
    });

    // Format response
    const formattedRates = rates.map((rate) => ({
      id: rate.id,
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      rate: parseFloat(rate.rate),
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo,
      isActive: rate.isActive,
      source: rate.source,
      lastUpdated: rate.lastUpdated,
      notes: rate.notes,
      updatedBy: rate.updatedBy,
      updater: rate.updater,
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt,
      display: `1 IDR = ${parseFloat(rate.rate).toFixed(8)} USD`,
    }));

    res.json({
      success: true,
      data: formattedRates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to get manual rates");
  }
};

// GET: Get single manual rate by ID
export const getManualRateById = async (req, res) => {
  try {
    const { id } = req.params;

    const rate = await ExchangeRate.findOne({
      where: {
        id,
        source: "manual",
      },
      include: [
        {
          model: User,
          as: "updater",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
    });

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Manual rate not found",
      });
    }

    // Get rate history for this currency pair
    const history = await ExchangeRate.getRateHistory(
      rate.fromCurrency,
      rate.toCurrency,
      10
    );

    res.json({
      success: true,
      data: {
        ...rate.toJSON(),
        rate: parseFloat(rate.rate),
        history: history.map((h) => ({
          id: h.id,
          rate: parseFloat(h.rate),
          effectiveFrom: h.effectiveFrom,
          effectiveTo: h.effectiveTo,
          isActive: h.isActive,
          source: h.source,
          lastUpdated: h.lastUpdated,
        })),
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to get manual rate");
  }
};

// GET: Get active rate for specific currency
export const getActiveRateForCurrency = async (req, res) => {
  try {
    const { fromCurrency, toCurrency = "USD" } = req.query;

    if (!fromCurrency) {
      return res.status(400).json({
        success: false,
        message: "fromCurrency parameter is required",
      });
    }

    // Validate currency code
    const currencyError = validateCurrencyCode(fromCurrency);
    if (currencyError) {
      return res.status(400).json({
        success: false,
        message: currencyError,
      });
    }

    const rate = await ExchangeRate.getActiveRate(fromCurrency, toCurrency);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: `No active rate found for ${fromCurrency} to ${toCurrency}`,
        hasRate: false,
      });
    }

    res.json({
      success: true,
      data: {
        fromCurrency: rate.fromCurrency,
        toCurrency: rate.toCurrency,
        rate: parseFloat(rate.rate),
        effectiveFrom: rate.effectiveFrom,
        source: rate.source,
        isActive: rate.isActive,
        lastUpdated: rate.lastUpdated,
        notes: rate.notes,
      },
      hasRate: true,
    });
  } catch (error) {
    handleError(res, error, "Failed to get active rate");
  }
};

// POST: Create new manual rate - DIPERBAIKI
export const createManualRate = async (req, res) => {
  let transaction;
  try {
    transaction = await db.transaction();
    const userId = req.userId;
    const {
      fromCurrency = "IDR",
      toCurrency = "USD",
      rate,
      effectiveFrom,
      notes = "",
      updateLeaderboard = true,
    } = req.body;

    // VALIDASI: Hanya IDR→USD yang diperbolehkan
    if (fromCurrency.toUpperCase() !== "IDR" || toCurrency.toUpperCase() !== "USD") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Hanya konversi IDR ke USD yang diperbolehkan",
      });
    }

    // Validate required fields
    if (!rate) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Rate is required",
      });
    }

    // Validate rate
    const rateError = validateRateValue(rate);
    if (rateError) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: rateError,
      });
    }

    const rateValue = parseFloat(rate);
    const proposedDate = effectiveFrom ? new Date(effectiveFrom) : new Date();
    
    // DAPATKAN EFFECTIVEFROM YANG UNIK
    const uniqueEffectiveFrom = await getUniqueEffectiveFrom(
      fromCurrency,
      toCurrency,
      proposedDate,
      transaction
    );

    console.log(`📅 [Controller] Create with unique effectiveFrom:`, uniqueEffectiveFrom);

    // Check if we're creating a duplicate active rate
    const existingActive = await ExchangeRate.findOne({
      where: {
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        isActive: true,
        source: "manual",
      },
      transaction,
    });

    if (existingActive) {
      const existingRate = parseFloat(existingActive.rate);
      const difference = Math.abs((rateValue - existingRate) / existingRate);

      // If difference is less than 0.1%, just update the existing rate
      if (difference < 0.001) {
        await existingActive.update(
          {
            rate: rateValue,
            lastUpdated: new Date(),
            notes: notes || existingActive.notes,
            updatedBy: userId,
          },
          { transaction }
        );

        await transaction.commit();

        // Clear cache
        currencyService.clearManualRateCache(fromCurrency, toCurrency);

        return res.json({
          success: true,
          message: "Rate updated (minor change)",
          data: {
            id: existingActive.id,
            fromCurrency: existingActive.fromCurrency,
            toCurrency: existingActive.toCurrency,
            rate: rateValue,
            effectiveFrom: existingActive.effectiveFrom,
            isActive: existingActive.isActive,
            source: existingActive.source,
            notes: notes || existingActive.notes,
          },
          updated: true,
        });
      }

      // Deactivate old rate
      await existingActive.update(
        {
          isActive: false,
          effectiveTo: uniqueEffectiveFrom,
          lastUpdated: new Date(),
        },
        { transaction }
      );
    }

    // Create new rate dengan effectiveFrom yang unik
    const newRate = await ExchangeRate.create(
      {
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        rate: rateValue,
        effectiveFrom: uniqueEffectiveFrom,
        effectiveTo: null,
        isActive: true,
        source: "manual",
        notes: notes,
        updatedBy: userId,
        metadata: {
          createdBy: userId,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          originalProposedDate: effectiveFrom,
          finalEffectiveFrom: uniqueEffectiveFrom,
        },
      },
      { transaction }
    );

    await transaction.commit();

    // Clear cache
    currencyService.clearManualRateCache(fromCurrency, toCurrency);

    // Update leaderboard in background if requested
    let leaderboardUpdate = null;
    if (updateLeaderboard && toCurrency.toUpperCase() === "USD") {
      leaderboardUpdate = await updateLeaderboardWithNewRate(
        fromCurrency,
        toCurrency,
        rateValue
      );
    }

    res.status(201).json({
      success: true,
      message: "Manual rate created successfully",
      data: {
        id: newRate.id,
        fromCurrency: newRate.fromCurrency,
        toCurrency: newRate.toCurrency,
        rate: parseFloat(newRate.rate),
        effectiveFrom: newRate.effectiveFrom,
        isActive: newRate.isActive,
        source: newRate.source,
        notes: newRate.notes,
      },
      leaderboardUpdate: leaderboardUpdate || {
        skipped: true,
        message: "Leaderboard update skipped",
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    
    // Tangani error duplicate khusus
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: "Cannot create rate: Duplicate entry detected",
        field: "effectiveFrom",
        suggestion: "Please use a different effective date/time"
      });
    }
    
    handleError(res, error, "Failed to create manual rate");
  }
};

// PUT: Update manual rate - DIPERBAIKI DENGAN RETRY MECHANISM
export const updateManualRate = async (req, res) => {
  let transaction;
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    transaction = await db.transaction();
    
    try {
      const { id } = req.params;
      const userId = req.userId;
      const {
        rate,
        effectiveFrom,
        isActive,
        notes,
        updateLeaderboard = false,
      } = req.body;

      console.log(`🔄 [Controller] Update rate ID ${id} (attempt ${retryCount + 1}):`, req.body);

      // Find existing rate
      const existingRate = await ExchangeRate.findOne({
        where: {
          id,
          source: "manual",
        },
        transaction,
      });

      if (!existingRate) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Manual rate not found",
        });
      }

      // ===== JIKA UPDATE RATE VALUE =====
      if (rate !== undefined) {
        // Validate rate
        const rateError = validateRateValue(rate);
        if (rateError) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: rateError,
          });
        }

        const rateValue = parseFloat(rate);
        let proposedDate = effectiveFrom ? new Date(effectiveFrom) : new Date();
        
        // Untuk retry, tambahkan sedikit waktu
        if (retryCount > 0) {
          proposedDate = new Date(proposedDate.getTime() + retryCount * 100); // tambah 100ms per retry
        }
        
        // DAPATKAN EFFECTIVEFROM YANG UNIK
        const uniqueEffectiveFrom = await getUniqueEffectiveFrom(
          existingRate.fromCurrency,
          existingRate.toCurrency,
          proposedDate,
          transaction,
          existingRate.id
        );

        // Pastikan tidak lebih dari 12 digit desimal
        const rateStr = rate.toString();
        const decimalPlaces = rateStr.includes(".")
          ? rateStr.split(".")[1].length
          : 0;
        if (decimalPlaces > 12) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Rate cannot have more than 12 decimal places (you entered ${decimalPlaces})`,
          });
        }

        const existingRateValue = parseFloat(existingRate.rate);
        const difference = Math.abs((rateValue - existingRateValue) / existingRateValue);
        
        // Minor update (perubahan < 0.1%)
        if (difference < 0.001) {
          await existingRate.update(
            {
              rate: rateValue,
              notes: notes || existingRate.notes,
              lastUpdated: new Date(),
              updatedBy: userId,
            },
            { transaction }
          );

          await transaction.commit();

          // Clear cache
          currencyService.clearManualRateCache(
            existingRate.fromCurrency,
            existingRate.toCurrency
          );

          // Get updated rate with details
          const updatedRate = await ExchangeRate.findByPk(id, {
            include: [
              {
                model: User,
                as: "updater",
                attributes: ["id", "name", "email"],
                required: false,
              },
            ],
          });

          return res.json({
            success: true,
            message: "Rate updated (minor change)",
            data: {
              id: updatedRate.id,
              fromCurrency: updatedRate.fromCurrency,
              toCurrency: updatedRate.toCurrency,
              rate: parseFloat(updatedRate.rate),
              effectiveFrom: updatedRate.effectiveFrom,
              effectiveTo: updatedRate.effectiveTo,
              isActive: updatedRate.isActive,
              source: updatedRate.source,
              notes: updatedRate.notes,
              updatedBy: userId,
              updater: updatedRate.updater,
              lastUpdated: updatedRate.lastUpdated,
              createdAt: updatedRate.createdAt,
              updatedAt: updatedRate.updatedAt,
              display: `1 ${updatedRate.fromCurrency} = ${parseFloat(
                updatedRate.rate
              ).toFixed(8)} ${updatedRate.toCurrency}`,
            },
            minorUpdate: true,
            changePercentage: (difference * 100).toFixed(4),
          });
        }

        // Major update (perubahan ≥ 0.1%)
        // 1. Deactivate old rate
        await existingRate.update(
          {
            isActive: false,
            effectiveTo: uniqueEffectiveFrom,
            lastUpdated: new Date(),
          },
          { transaction }
        );

        // 2. Create new rate dengan effectiveFrom yang unik
        const newRate = await ExchangeRate.create(
          {
            fromCurrency: existingRate.fromCurrency,
            toCurrency: existingRate.toCurrency,
            rate: rateValue,
            effectiveFrom: uniqueEffectiveFrom,
            effectiveTo: null,
            isActive: true,
            source: "manual",
            notes: notes || existingRate.notes,
            updatedBy: userId,
            metadata: {
              ...existingRate.metadata,
              previousRateId: existingRate.id,
              updatedBy: userId,
              updatedAt: new Date(),
            },
          },
          { transaction }
        );

        // 3. Get the new rate with updater info
        const updatedRateWithDetails = await ExchangeRate.findByPk(newRate.id, {
          include: [
            {
              model: User,
              as: "updater",
              attributes: ["id", "name", "email"],
              required: false,
            },
          ],
          transaction,
        });

        await transaction.commit();

        // 4. Clear cache
        currencyService.clearManualRateCache(
          existingRate.fromCurrency,
          existingRate.toCurrency
        );

        // 5. Update leaderboard in background if requested
        let leaderboardUpdate = null;
        if (updateLeaderboard && existingRate.toCurrency === "USD") {
          leaderboardUpdate = await updateLeaderboardWithNewRate(
            existingRate.fromCurrency,
            existingRate.toCurrency,
            rateValue
          );
        }

        return res.json({
          success: true,
          message: "Rate updated (new version created)",
          data: {
            oldRateId: existingRate.id,
            newRateId: newRate.id,
            updatedRate: {
              id: newRate.id,
              fromCurrency: newRate.fromCurrency,
              toCurrency: newRate.toCurrency,
              rate: parseFloat(newRate.rate),
              effectiveFrom: newRate.effectiveFrom,
              effectiveTo: newRate.effectiveTo,
              isActive: newRate.isActive,
              source: newRate.source,
              notes: newRate.notes,
              updatedBy: userId,
              updater: updatedRateWithDetails.updater,
              lastUpdated: newRate.lastUpdated,
              createdAt: newRate.createdAt,
              updatedAt: newRate.updatedAt,
              display: `1 ${newRate.fromCurrency} = ${parseFloat(
                newRate.rate
              ).toFixed(8)} ${newRate.toCurrency}`,
            },
            changePercentage: (difference * 100).toFixed(4),
          },
          leaderboardUpdate,
        });
      } 
      
      // ===== JIKA HANYA UPDATE METADATA =====
      else {
        const updateData = {};
        
        if (isActive !== undefined) updateData.isActive = isActive;
        if (notes !== undefined) updateData.notes = notes;
        
        if (effectiveFrom !== undefined) {
          const newDate = new Date(effectiveFrom);
          const oldDate = new Date(existingRate.effectiveFrom);
          
          // Cek apakah tanggal berubah
          if (newDate.getTime() !== oldDate.getTime()) {
            // Untuk retry, tambahkan sedikit waktu
            if (retryCount > 0) {
              newDate.setMilliseconds(newDate.getMilliseconds() + retryCount * 100);
            }
            
            // Dapatkan tanggal yang unik
            const uniqueDate = await getUniqueEffectiveFrom(
              existingRate.fromCurrency,
              existingRate.toCurrency,
              newDate,
              transaction,
              existingRate.id
            );
            
            updateData.effectiveFrom = uniqueDate;
          }
        }

        updateData.updatedBy = userId;
        updateData.lastUpdated = new Date();

        // Update rate
        await existingRate.update(updateData, { transaction });
        
        // Get updated rate
        const updatedRate = await ExchangeRate.findByPk(id, {
          include: [
            {
              model: User,
              as: "updater",
              attributes: ["id", "name", "email"],
              required: false,
            },
          ],
          transaction,
        });

        await transaction.commit();

        // Clear cache jika status aktif berubah
        if (isActive !== undefined) {
          currencyService.clearManualRateCache(
            existingRate.fromCurrency,
            existingRate.toCurrency
          );
        }

        return res.json({
          success: true,
          message: "Rate metadata updated successfully",
          data: {
            id: updatedRate.id,
            fromCurrency: updatedRate.fromCurrency,
            toCurrency: updatedRate.toCurrency,
            rate: parseFloat(updatedRate.rate),
            effectiveFrom: updatedRate.effectiveFrom,
            effectiveTo: updatedRate.effectiveTo,
            isActive: updatedRate.isActive,
            source: updatedRate.source,
            notes: updatedRate.notes,
            updatedBy: updatedRate.updatedBy,
            updater: updatedRate.updater,
            lastUpdated: updatedRate.lastUpdated,
            createdAt: updatedRate.createdAt,
            updatedAt: updatedRate.updatedAt,
            display: `1 ${updatedRate.fromCurrency} = ${parseFloat(
              updatedRate.rate
            ).toFixed(8)} ${updatedRate.toCurrency}`,
          },
        });
      }
    } catch (error) {
      await transaction.rollback();
      
      // Jika error duplicate, coba retry
      if (error.name === 'SequelizeUniqueConstraintError' && retryCount < maxRetries - 1) {
        retryCount++;
        console.log(`🔄 Retry ${retryCount} for rate ${id} due to duplicate`);
        continue;
      }
      
      // Tangani error duplicate khusus
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          message: "Duplicate rate entry detected. Please use a different effective date.",
          field: "effectiveFrom",
          suggestion: "Try using a slightly different date/time"
        });
      }
      
      handleError(res, error, "Failed to update manual rate");
      return;
    }
  }
};

// DELETE: Deactivate manual rate
export const deactivateManualRate = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log(`🗑️ [Controller] Deactivating rate ID: ${id}`);

    const rate = await ExchangeRate.findOne({
      where: {
        id,
        source: "manual",
      },
      transaction,
    });

    if (!rate) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Manual rate not found",
      });
    }

    // Deactivate the rate
    await rate.update(
      {
        isActive: false,
        effectiveTo: new Date(),
        lastUpdated: new Date(),
        updatedBy: userId,
        metadata: {
          ...rate.metadata,
          deactivatedBy: userId,
          deactivatedAt: new Date(),
        },
      },
      { transaction }
    );

    await transaction.commit();

    // Clear cache
    currencyService.clearManualRateCache(rate.fromCurrency, rate.toCurrency);

    console.log(`✅ [Controller] Rate ${id} deactivated successfully`);

    res.json({
      success: true,
      message: "Rate deactivated successfully",
      data: {
        id: rate.id,
        fromCurrency: rate.fromCurrency,
        toCurrency: rate.toCurrency,
        rate: parseFloat(rate.rate),
        deactivatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`❌ [Controller] Error deactivating rate:`, error);
    await transaction.rollback();
    handleError(res, error, "Failed to deactivate manual rate");
  }
};

// POST: Bulk create/update rates
export const bulkUpsertRates = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const userId = req.userId;
    const { rates, effectiveFrom, updateLeaderboard = true } = req.body;

    if (!Array.isArray(rates) || rates.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Rates array is required and cannot be empty",
      });
    }

    // VALIDASI: Hanya IDR→USD
    const invalidRates = rates.filter(
      (rate) => rate.fromCurrency !== "IDR" || rate.toCurrency !== "USD"
    );

    if (invalidRates.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Hanya rate IDR ke USD yang diperbolehkan",
        invalidRates: invalidRates.map(
          (r) => `${r.fromCurrency}_${r.toCurrency}`
        ),
      });
    }

    const effectiveDate = effectiveFrom ? new Date(effectiveFrom) : new Date();
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
      details: [],
    };

    // Process each rate
    for (const rateData of rates) {
      try {
        const { fromCurrency, toCurrency = "USD", rate, notes = "" } = rateData;

        // Validate
        const fromCurrencyError = validateCurrencyCode(fromCurrency);
        const toCurrencyError = validateCurrencyCode(toCurrency);
        const rateError = validateRateValue(rate);

        if (fromCurrencyError || toCurrencyError || rateError) {
          results.failed++;
          results.errors.push({
            currency: `${fromCurrency}_${toCurrency}`,
            error: fromCurrencyError || toCurrencyError || rateError,
          });
          continue;
        }

        const rateValue = parseFloat(rate);
        const fromCurrencyUpper = fromCurrency.toUpperCase();
        const toCurrencyUpper = toCurrency.toUpperCase();

        // Find existing active rate
        const existingActive = await ExchangeRate.findOne({
          where: {
            fromCurrency: fromCurrencyUpper,
            toCurrency: toCurrencyUpper,
            isActive: true,
            source: "manual",
          },
          transaction,
        });

        if (existingActive) {
          const existingRate = parseFloat(existingActive.rate);
          const difference = Math.abs(
            (rateValue - existingRate) / existingRate
          );

          // If difference is significant, create new version
          if (difference >= 0.001) {
            // Deactivate old
            await existingActive.update(
              {
                isActive: false,
                effectiveTo: effectiveDate,
                lastUpdated: new Date(),
              },
              { transaction }
            );

            // Create new
            await ExchangeRate.create(
              {
                fromCurrency: fromCurrencyUpper,
                toCurrency: toCurrencyUpper,
                rate: rateValue,
                effectiveFrom: effectiveDate,
                effectiveTo: null,
                isActive: true,
                source: "manual",
                notes: notes,
                updatedBy: userId,
                metadata: {
                  createdBy: userId,
                  bulkOperation: true,
                  previousRateId: existingActive.id,
                },
              },
              { transaction }
            );

            results.updated++;
            results.details.push({
              currency: `${fromCurrencyUpper}_${toCurrencyUpper}`,
              action: "updated",
              oldRate: existingRate,
              newRate: rateValue,
              change:
                (((rateValue - existingRate) / existingRate) * 100).toFixed(4) +
                "%",
            });
          } else {
            // Minor update, just update existing
            await existingActive.update(
              {
                rate: rateValue,
                notes: notes,
                lastUpdated: new Date(),
                updatedBy: userId,
              },
              { transaction }
            );

            results.updated++;
            results.details.push({
              currency: `${fromCurrencyUpper}_${toCurrencyUpper}`,
              action: "minor_update",
              rate: rateValue,
            });
          }
        } else {
          // Create new rate
          await ExchangeRate.create(
            {
              fromCurrency: fromCurrencyUpper,
              toCurrency: toCurrencyUpper,
              rate: rateValue,
              effectiveFrom: effectiveDate,
              effectiveTo: null,
              isActive: true,
              source: "manual",
              notes: notes,
              updatedBy: userId,
              metadata: {
                createdBy: userId,
                bulkOperation: true,
              },
            },
            { transaction }
          );

          results.created++;
          results.details.push({
            currency: `${fromCurrencyUpper}_${toCurrencyUpper}`,
            action: "created",
            rate: rateValue,
          });
        }

        // Clear cache
        currencyService.clearManualRateCache(
          fromCurrencyUpper,
          toCurrencyUpper
        );
      } catch (rateError) {
        results.failed++;
        results.errors.push({
          currency: `${rateData.fromCurrency}_${rateData.toCurrency}`,
          error: rateError.message,
        });
      }
    }

    await transaction.commit();

    // Update leaderboards for USD conversions in background
    const usdRates = rates.filter((r) => r.toCurrency === "USD");
    let leaderboardUpdates = [];

    if (updateLeaderboard && usdRates.length > 0) {
      for (const usdRate of usdRates) {
        try {
          const update = await updateLeaderboardWithNewRate(
            usdRate.fromCurrency,
            "USD",
            parseFloat(usdRate.rate)
          );
          leaderboardUpdates.push({
            currency: usdRate.fromCurrency,
            ...update,
          });
        } catch (updateError) {
          leaderboardUpdates.push({
            currency: usdRate.fromCurrency,
            error: updateError.message,
          });
        }
      }
    }

    res.json({
      success: true,
      message: `Bulk operation completed: ${results.created} created, ${results.updated} updated, ${results.failed} failed`,
      results: results,
      leaderboardUpdates:
        leaderboardUpdates.length > 0 ? leaderboardUpdates : undefined,
    });
  } catch (error) {
    await transaction.rollback();
    handleError(res, error, "Failed to process bulk rates");
  }
};

// GET: Get rate statistics
export const getRateStatistics = async (req, res) => {
  try {
    // Get counts by source
    const sourceCounts = await ExchangeRate.findAll({
      attributes: [
        "source",
        [db.fn("COUNT", db.col("id")), "count"],
        [
          db.fn("SUM", db.cast(db.where(db.col("isActive"), true), "integer")),
          "activeCount",
        ],
      ],
      group: ["source"],
    });

    // Get currency pair counts
    const currencyPairs = await ExchangeRate.findAll({
      attributes: [
        "fromCurrency",
        "toCurrency",
        [db.fn("COUNT", db.col("id")), "totalRates"],
        [db.fn("MAX", db.col("effectiveFrom")), "latestUpdate"],
      ],
      where: { source: "manual" },
      group: ["fromCurrency", "toCurrency"],
      order: [["latestUpdate", "DESC"]],
      limit: 20,
    });

    // Get recent updates
    const recentUpdates = await ExchangeRate.findAll({
      where: { source: "manual" },
      order: [["lastUpdated", "DESC"]],
      limit: 10,
      include: [
        {
          model: User,
          as: "updater",
          attributes: ["name", "email"],
          required: false,
        },
      ],
    });

    // Get active rates count
    const activeRatesCount = await ExchangeRate.count({
      where: {
        source: "manual",
        isActive: true,
      },
    });

    res.json({
      success: true,
      data: {
        sourceCounts: sourceCounts.map((sc) => ({
          source: sc.source,
          count: sc.get("count"),
          activeCount: sc.get("activeCount"),
        })),
        currencyPairs: currencyPairs.map((cp) => ({
          fromCurrency: cp.fromCurrency,
          toCurrency: cp.toCurrency,
          totalRates: cp.get("totalRates"),
          latestUpdate: cp.get("latestUpdate"),
        })),
        recentUpdates: recentUpdates.map((ru) => ({
          id: ru.id,
          fromCurrency: ru.fromCurrency,
          toCurrency: ru.toCurrency,
          rate: parseFloat(ru.rate),
          isActive: ru.isActive,
          lastUpdated: ru.lastUpdated,
          updater: ru.updater,
        })),
        summary: {
          totalManualRates: await ExchangeRate.count({
            where: { source: "manual" },
          }),
          activeManualRates: activeRatesCount,
          totalCurrencyPairs: currencyPairs.length,
          lastUpdated: recentUpdates[0]?.lastUpdated || null,
        },
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to get rate statistics");
  }
};

// GET: Validate currency conversion
export const validateConversion = async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency = "USD" } = req.query;

    // VALIDASI: Hanya IDR→USD
    if (fromCurrency !== "IDR" || toCurrency !== "USD") {
      return res.status(400).json({
        success: false,
        message: "Hanya validasi konversi IDR ke USD yang diperbolehkan",
      });
    }

    if (!amount || !fromCurrency) {
      return res.status(400).json({
        success: false,
        message: "amount and fromCurrency are required",
      });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      return res.status(400).json({
        success: false,
        message: "amount must be a valid number",
      });
    }

    // Get active rate
    const rate = await ExchangeRate.getActiveRate(fromCurrency, toCurrency);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: `No active rate found for ${fromCurrency} to ${toCurrency}`,
        canConvert: false,
      });
    }

    const rateValue = parseFloat(rate.rate);
    const convertedAmount = amountNum * rateValue;

    res.json({
      success: true,
      data: {
        amount: amountNum,
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        rate: rateValue,
        convertedAmount: convertedAmount,
        convertedAmountFormatted: convertedAmount.toFixed(4),
        rateSource: rate.source,
        rateEffectiveFrom: rate.effectiveFrom,
        canConvert: true,
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to validate conversion");
  }
};