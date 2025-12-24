import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import SequelizeStore from "connect-session-sequelize";
import http from "http";
import db from "./config/database.js";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs";
import cron from "node-cron";
import helmet from "helmet";
import compression from "compression";

// Mendapatkan direktori saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Import routes
import Auth from "./routes/authRoute.js";
import Balance from "./routes/balanceRoute.js";
import Trade from "./routes/tradeRoute.js";
import Target from "./routes/targetRoute.js";
import Subscription from "./routes/subscriptionRoute.js";
import Gamification from "./routes/gamificationRoute.js";
import CalenderEvent from "./routes/calendarRoutes.js";
import Transaction from "./routes/transactionRoutes.js";
import ManualRate from "./routes/manualRateRoute.js";
import User from "./routes/usersRoute.js";
import AdminDashboard from "./routes/adminDashboardRoute.js";

// Import controllers
import {
  checkAndSendExpirationReminders,
  checkAndDowngradeExpiredSubscriptions,
} from "./controllers/subscriptionController.js";

const app = express();
const httpServer = http.createServer(app);

const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({ db: db });

// ==================== DATABASE INITIALIZATION ====================
const initializeDatabase = async () => {
  try {
    await db.authenticate();
    console.log("✅ Database connected");

    if (process.env.NODE_ENV === "development") {
      console.log("🛠️  Running in DEVELOPMENT mode");

      // Inisialisasi default badges
      const { initializeDefaultBadges } = await import(
        "./models/gamification.js"
      );
      await initializeDefaultBadges();
      console.log("✅ Default badges initialized");
    } else {
      console.log("🚀 Running in PRODUCTION mode");

      // Cek exchange rates
      try {
        const { ExchangeRate } = await import("./models/gamification.js");
        const count = await ExchangeRate.count();
        console.log(`📊 Found ${count} exchange rates in database`);
      } catch (error) {
        console.warn(
          "⚠️  Could not check exchange rates table:",
          error.message
        );
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Database error:", error.message);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    throw error;
  }
};

// ==================== STARTUP FUNCTIONS ====================
const onServerStart = async () => {
  try {
    await initializeDatabase();

    // Pre-fetch essential rates jika diperlukan
    if (process.env.PREFETCH_EXCHANGE_RATES === "true") {
      console.log("🔄 Pre-fetching essential exchange rates...");
      const currencyService = await import(
        "./services/currencyService.js"
      ).then((m) => m.default);
      const essentialCurrencies = ["IDR", "EUR", "GBP"];

      for (const currency of essentialCurrencies) {
        try {
          await currencyService.getRateToUSD(currency);
          console.log(`✅ Pre-fetched ${currency} rate`);
        } catch (error) {
          console.warn(`⚠️  Failed to pre-fetch ${currency}:`, error.message);
        }
      }
    }

    console.log("🚀 Server startup completed successfully");
  } catch (error) {
    console.error("❌ Server startup failed:", error);
  }
};

// ==================== EXCHANGE RATE CRON JOB ====================
const setupExchangeRateCronJob = () => {
  console.log("⏰ Setting up exchange rate cron job (hourly)...");

  cron.schedule("0 * * * *", async () => {
    console.log("🔄 Running scheduled exchange rate update...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const currencyService = await import(
        "./services/currencyService.js"
      ).then((m) => m.default);
      const currencies = ["IDR"];

      let successCount = 0;
      for (const currency of currencies) {
        try {
          await currencyService.getRateToUSD(currency);
          successCount++;
          console.log(`✅ Updated ${currency} rate`);
        } catch (error) {
          console.error(`❌ Failed to update ${currency}:`, error.message);
        }
      }

      console.log(
        `📊 Exchange rate update: ${successCount}/${currencies.length} successful`
      );
    } catch (error) {
      console.error("❌ Exchange rate cron job failed:", error);
    }
  });
};

const setupManualRateValidationCron = () => {
  console.log(
    "⏰ Setting up manual rate validation cron job (daily at 08:00)..."
  );

  cron.schedule("0 8 * * *", async () => {
    console.log("🔍 Running manual rate validation check...");

    try {
      const { ExchangeRate } = await import("./models/exchangeRate.js");

      // Cek apakah ada active manual rate untuk IDR→USD
      const activeRate = await ExchangeRate.findOne({
        where: {
          fromCurrency: "IDR",
          toCurrency: "USD",
          isActive: true,
          source: "manual",
        },
      });

      if (!activeRate) {
        console.warn("⚠️  WARNING: No active manual rate found for IDR→USD!");
        // Bisa tambahkan notifikasi ke admin di sini
      } else {
        console.log(
          `✅ Active manual rate found: 1 IDR = ${activeRate.rate} USD`
        );

        // Cek apakah rate terlalu tua (lebih dari 30 hari)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (activeRate.effectiveFrom < thirtyDaysAgo) {
          console.warn(
            `⚠️  WARNING: Active rate is ${Math.floor(
              (new Date() - activeRate.effectiveFrom) / (1000 * 60 * 60 * 24)
            )} days old`
          );
        }
      }
    } catch (error) {
      console.error("❌ Manual rate validation error:", error);
    }
  });
};

const setupCleanupCronJob = () => {
  console.log("🧹 Setting up cleanup cron job (daily at 03:00)...");

  cron.schedule("0 3 * * *", async () => {
    console.log("🧹 Running transaction cleanup...");
    try {
      const { cleanupOldPendingTransactions } = await import(
        "./controllers/transactionController.js"
      );
      await cleanupOldPendingTransactions();
      console.log("✅ Cleanup completed");
    } catch (error) {
      console.error("❌ Cleanup cron job failed:", error);
    }
  });
};

// ==================== SERVER CONFIGURATION ====================
// store.sync(); // Hapus komentar jika perlu table sessions

// Session middleware
app.set("trust proxy", 1);

const sessionMiddleware = session({
  secret: process.env.SESS_SECRET || "dev-secret-change-this",
  resave: false,
  saveUninitialized: process.env.NODE_ENV === "development",
  store: store,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
});

// proudction
// const sessionMiddleware = session({
//   name: "pipsdiary.sid", // optional tapi disarankan
//   secret: process.env.SESS_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   store: store,
//   cookie: {
//     secure: true,                 // WAJIB HTTPS
//     httpOnly: true,
//     sameSite: "none",              // WAJIB beda subdomain
//     domain: ".pipsdiary.com",      // berlaku untuk semua subdomain
//     maxAge: Number(process.env.SESSION_EXPIRY) || 86400000,
//   },
// });

app.use(sessionMiddleware);

// Security middleware untuk production
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
  app.use(compression());
}

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

// app.js - Versi simple untuk development & production
app.use(
  cors({
    origin: function (origin, callback) {
      // === IZINKAN SEMUA ORIGIN DI DEVELOPMENT ===
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 Development: Allowing origin ${origin || 'No Origin'}`);
        return callback(null, true);
      }
      
      // === DI PRODUCTION: HANYA ORIGIN YANG DIAKUI ===
      const allowedOrigins = [
        'https://app.pipsdiary.com',
        'https://pipsdiary.com',
        'https://www.pipsdiary.com',
        'https://admin.pipsdiary.com',
        'https://api.pipsdiary.com'
      ];
      
      // Izinkan request tanpa origin (Midtrans, dll)
      if (!origin) {
        console.log("🌐 Allowing request without origin (Midtrans)");
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ Allowing production origin: ${origin}`);
        return callback(null, true);
      }
      
      console.warn(`❌ CORS blocked: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["set-cookie"]
  })
);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.url} ${
        res.statusCode
      } ${duration}ms`
    );
  });
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res, path) => {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      try {
        const fileBuffer = fs.readFileSync(path);
        const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");
        res.setHeader("ETag", hash);
      } catch (error) {
        console.error("Error generating ETag:", error);
      }
    },
  })
);

// ==================== ROUTES ====================
app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({
      status: "healthy",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/api/v1/hello-world", (req, res) => {
  res
    .status(200)
    .json({ message: "Hello, World!", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/v1/auth", Auth);
app.use("/api/v1/balance", Balance);
app.use("/api/v1/trades", Trade);
app.use("/api/v1/target", Target);
app.use("/api/v1/subscription", Subscription);
app.use("/api/v1/gamification", Gamification);
app.use("/api/v1/calendar", CalenderEvent);
app.use("/api/v1/transactions", Transaction);
app.use("/api/v1/manual-rates", ManualRate);
app.use("/api/v1/user", User);
app.use("/api/v1/admin-dashboard", AdminDashboard);

// ==================== CRON JOBS ====================
const setupCronJobs = () => {
  console.log("⏰ Setting up cron jobs...");

  if (process.env.DISABLE_API_RATES !== "true") {
    setupExchangeRateCronJob();
  } else {
    console.log("⏰ API exchange rate cron job disabled (using manual rates)");
  }

  // Validasi manual rates
  setupManualRateValidationCron();

  // Leaderboard Cache Update (setiap 30 menit)
  cron.schedule("*/30 * * * *", async () => {
    console.log("🔄 Running leaderboard cache update...");
    try {
      const { updateLeaderboardCachedRates } = await import(
        "./controllers/gamificationController.js"
      );
      const result = await updateLeaderboardCachedRates();
      console.log(
        `✅ Leaderboard cache updated: ${result.updatedCount || 0} entries`
      );
    } catch (error) {
      console.error("❌ Error in leaderboard cache cron job:", error);
    }
  });

  // Subscription expiration reminders (09:00 daily)
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Running subscription expiration reminder check...");
    try {
      const result = await checkAndSendExpirationReminders();
      console.log("✅ Subscription reminder check completed");
    } catch (error) {
      console.error("❌ Error in subscription reminder cron job:", error);
    }
  });

  // Expired subscription downgrade (00:01 daily)
  cron.schedule("1 0 * * *", async () => {
    console.log("⏰ Running expired subscription check and downgrade...");
    try {
      const result = await checkAndDowngradeExpiredSubscriptions();
      console.log("✅ Expired subscription check completed");
    } catch (error) {
      console.error("❌ Error in expired subscription cron job:", error);
    }
  });

  // Cleanup old pending transactions
  setupCleanupCronJob();

  console.log("✅ All cron jobs scheduled");
};

// ==================== ERROR HANDLERS ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors,
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry",
      field: err.errors?.[0]?.path,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ==================== SERVER STARTUP ====================
const startServer = async () => {
  try {
    await onServerStart();
    setupCronJobs();

    const PORT = process.env.PORT;
    httpServer.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      httpServer.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
      });

      setTimeout(() => {
        console.error(
          "⚠️  Could not close connections in time, forcing shutdown"
        );
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("💥 Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
