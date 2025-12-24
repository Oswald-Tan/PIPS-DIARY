// models/transaction.js
import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";
import Subscription from "./subscription.js";

const Transaction = db.define(
  "Transaction",
  {
    id: {
      type: DataTypes.STRING(110),
      primaryKey: true,
    },
    invoice_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "PENDING_PAYMENT",
        "PAID",
        "CANCELED",
        "EXPIRED",
        "DENIED"
      ),
      allowNull: false,
      defaultValue: "PENDING_PAYMENT",
    },
    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    customer_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    snap_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    snap_redirect_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    plan: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    // Tambahkan field baru untuk menyimpan data dari Midtrans
    midtrans_transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    transaction_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Tambahkan metadata tambahan
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "transactions",
    timestamps: false,
  }
);

Transaction.belongsTo(User, { foreignKey: "user_id", as: "User" });
Transaction.hasOne(Subscription, {
  foreignKey: "transactionId",
  ourceKey: "id",
  as: "Subscription",
});

export default Transaction;
