import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";
import { Op } from "sequelize";

const ExchangeRate = db.define(
  "ExchangeRate",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fromCurrency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        len: [2, 10],
        isUppercase: true,
      },
      set(value) {
        this.setDataValue("fromCurrency", value.toUpperCase());
      },
    },
    toCurrency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        len: [2, 10],
        isUppercase: true,
      },
      set(value) {
        this.setDataValue("toCurrency", value.toUpperCase());
      },
    },
    rate: {
      type: DataTypes.DECIMAL(20, 12),
      allowNull: false,
      validate: {
        min: 0.000000000001,
        max: 1000000,
        isValidRate(value) {
          const rateValue = parseFloat(value);
          if (isNaN(rateValue) || rateValue <= 0) {
            throw new Error("Rate must be a positive number");
          }
          const decimalPlaces = value.toString().split(".")[1]?.length || 0;
          if (decimalPlaces > 12) {
            throw new Error("Rate cannot have more than 12 decimal places");
          }
        },
      },
      set(value) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          this.setDataValue("rate", numValue);
        }
      },
    },
    effectiveFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    effectiveTo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    source: {
      type: DataTypes.ENUM("api", "manual", "system", "fallback"),
      defaultValue: "manual",
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    tableName: "exchange_rates",
    indexes: [
      {
        unique: true,
        fields: ["fromCurrency", "toCurrency", "effectiveFrom"],
        name: "unique_currency_pair_effective",
      },
      {
        fields: ["fromCurrency", "toCurrency", "isActive"],
        name: "idx_active_currency_pair",
      },
      {
        fields: ["source"],
        name: "idx_source",
      },
      {
        fields: ["effectiveFrom", "effectiveTo"],
        name: "idx_effective_date_range",
      },
      {
        fields: ["lastUpdated"],
        name: "idx_last_updated",
      },
    ],
    hooks: {
      // HAPUS beforeCreate hook karena sudah ditangani di controller
      beforeUpdate: (rate) => {
        rate.lastUpdated = new Date();
      },
    },
  }
);

// Static methods
ExchangeRate.getActiveRate = async function (fromCurrency, toCurrency = "USD") {
  return await this.findOne({
    where: {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      isActive: true,
    },
    order: [["effectiveFrom", "DESC"]],
  });
};

ExchangeRate.getRateHistory = async function (
  fromCurrency,
  toCurrency = "USD",
  limit = 50
) {
  return await this.findAll({
    where: {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
    },
    order: [["effectiveFrom", "DESC"]],
    limit: limit,
  });
};

ExchangeRate.deactivateOldRates = async function (
  fromCurrency,
  toCurrency = "USD",
  effectiveFrom
) {
  return await this.update(
    {
      isActive: false,
      effectiveTo: effectiveFrom || new Date(),
    },
    {
      where: {
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        isActive: true,
        effectiveTo: null,
      },
    }
  );
};

ExchangeRate.bulkCreateRates = async function (ratesArray, transaction = null) {
  const options = {};
  if (transaction) options.transaction = transaction;

  return await this.bulkCreate(ratesArray, {
    ...options,
    validate: true,
    individualHooks: true,
  });
};

// Helper function untuk mendapatkan effectiveFrom yang unik
ExchangeRate.getUniqueEffectiveFrom = async function (
  fromCurrency,
  toCurrency,
  proposedDate,
  transaction,
  excludeId = null
) {
  let currentDate = new Date(proposedDate);
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const whereClause = {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      effectiveFrom: currentDate,
    };

    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existing = await this.findOne({
      where: whereClause,
      transaction,
    });

    if (!existing) {
      return currentDate;
    }

    // Tambah 1 milidetik
    currentDate = new Date(currentDate.getTime() + 1);
    attempts++;
  }

  throw new Error(`Cannot find unique effectiveFrom after ${maxAttempts} attempts`);
};

// Relationships
ExchangeRate.belongsTo(User, {
  foreignKey: "updatedBy",
  as: "updater",
});

export default ExchangeRate;