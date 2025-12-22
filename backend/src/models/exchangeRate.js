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
          // Terima nilai dengan 1-12 digit desimal
          const decimalPlaces = value.toString().split(".")[1]?.length || 0;
          if (decimalPlaces > 12) {
            throw new Error("Rate cannot have more than 12 decimal places");
          }
        },
      },
      set(value) {
        // Simpan dengan presisi 12 digit
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
      beforeCreate: async (rate, options) => {
        rate.lastUpdated = new Date();
        
        // Validasi tambahan untuk mencegah duplicate
        const existing = await ExchangeRate.findOne({
          where: {
            fromCurrency: rate.fromCurrency,
            toCurrency: rate.toCurrency,
            effectiveFrom: rate.effectiveFrom,
          },
          transaction: options.transaction,
        });
        
        if (existing) {
          throw new Error(`Duplicate rate entry for ${rate.fromCurrency}-${rate.toCurrency} at ${rate.effectiveFrom}`);
        }
      },
      beforeUpdate: (rate) => {
        rate.lastUpdated = new Date();
      },
    },
  }
);

// Static methods for ExchangeRate model
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

// Relationships
ExchangeRate.belongsTo(User, {
  foreignKey: "updatedBy",
  as: "updater",
});

export default ExchangeRate;