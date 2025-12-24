-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 24, 2025 at 10:13 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db-pipsdiary`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `type` enum('first_trade','first_profit','weekly_consistency','monthly_consistency','profit_milestone','trade_milestone') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `achievedAt` datetime NOT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`id`, `userId`, `type`, `title`, `description`, `achievedAt`, `metadata`, `createdAt`, `updatedAt`) VALUES
(13, 16, 'first_trade', 'First Trade!', 'Completed your first trade in the journal', '2025-12-19 05:34:18', '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(14, 16, 'first_profit', 'First Profit!', 'Made your first profitable trade', '2025-12-19 05:34:18', '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(15, 17, 'first_trade', 'First Trade!', 'Completed your first trade in the journal', '2025-12-19 07:18:01', '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(16, 17, 'first_profit', 'First Profit!', 'Made your first profitable trade', '2025-12-19 07:18:01', '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(17, 18, 'first_trade', 'First Trade!', 'Completed your first trade in the journal', '2025-12-19 07:22:16', '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(18, 18, 'first_profit', 'First Profit!', 'Made your first profitable trade', '2025-12-19 07:22:16', '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(19, 19, 'first_trade', 'First Trade!', 'Completed your first trade in the journal', '2025-12-19 07:25:45', '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(20, 19, 'first_profit', 'First Profit!', 'Made your first profitable trade', '2025-12-19 07:25:45', '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45');

-- --------------------------------------------------------

--
-- Table structure for table `badges`
--

CREATE TABLE `badges` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` enum('consistency','profit','milestone','achievement','special') NOT NULL,
  `icon` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT '#8b5cf6',
  `requirement` json NOT NULL,
  `rarity` enum('common','rare','epic','legendary') DEFAULT 'common',
  `xpReward` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `badges`
--

INSERT INTO `badges` (`id`, `name`, `description`, `type`, `icon`, `color`, `requirement`, `rarity`, `xpReward`, `createdAt`, `updatedAt`) VALUES
(16, 'Early Bird', 'Log trades for 3 consecutive days', 'consistency', 'calendar', '#f59e0b', '{\"type\": \"daily_streak\", \"value\": 3}', 'common', 50, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(17, 'Dedicated Trader', 'Log trades for 7 consecutive days', 'consistency', 'trending-up', '#ef4444', '{\"type\": \"daily_streak\", \"value\": 7}', 'rare', 100, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(18, 'Trading Warrior', 'Log trades for 30 consecutive days', 'consistency', 'shield', '#8b5cf6', '{\"type\": \"daily_streak\", \"value\": 30}', 'epic', 500, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(19, 'Legendary Consistency', 'Log trades for 90 consecutive days', 'consistency', 'crown', '#f59e0b', '{\"type\": \"daily_streak\", \"value\": 90}', 'legendary', 1000, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(20, 'Profit Starter', 'Make profit for 2 trades in a row', 'profit', 'dollar-sign', '#10b981', '{\"type\": \"profit_streak\", \"value\": 2}', 'common', 75, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(21, 'Hot Streak', 'Make profit for 5 trades in a row', 'profit', 'flame', '#ef4444', '{\"type\": \"profit_streak\", \"value\": 5}', 'rare', 200, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(22, 'Profit King', 'Make profit for 10 trades in a row', 'profit', 'award', '#f59e0b', '{\"type\": \"profit_streak\", \"value\": 10}', 'epic', 500, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(23, 'Unstoppable', 'Make profit for 20 trades in a row', 'profit', 'zap', '#8b5cf6', '{\"type\": \"profit_streak\", \"value\": 20}', 'legendary', 1000, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(24, 'First Step', 'Complete your first trade', 'milestone', 'flag', '#6b7280', '{\"type\": \"total_trades\", \"value\": 1}', 'common', 25, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(25, 'Apprentice Trader', 'Complete 10 trades', 'milestone', 'user', '#10b981', '{\"type\": \"total_trades\", \"value\": 10}', 'common', 100, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(26, 'Seasoned Trader', 'Complete 50 trades', 'milestone', 'bar-chart', '#3b82f6', '{\"type\": \"total_trades\", \"value\": 50}', 'rare', 250, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(27, 'Master Trader', 'Complete 100 trades', 'milestone', 'star', '#8b5cf6', '{\"type\": \"total_trades\", \"value\": 100}', 'epic', 500, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(28, 'Trading Legend', 'Complete 500 trades', 'milestone', 'crown', '#f59e0b', '{\"type\": \"total_trades\", \"value\": 500}', 'legendary', 2000, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(29, 'Risk Manager', 'Maintain positive risk-reward ratio for 10 trades', 'achievement', 'shield', '#10b981', '{\"type\": \"risk_reward_positive\", \"value\": 10}', 'rare', 150, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(30, 'Disciplined Trader', 'Use stop loss in 20 consecutive trades', 'achievement', 'target', '#3b82f6', '{\"type\": \"stop_loss_used\", \"value\": 20}', 'epic', 300, '2025-12-17 19:31:06', '2025-12-17 19:31:06');

-- --------------------------------------------------------

--
-- Table structure for table `calendar_events`
--

CREATE TABLE `calendar_events` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `date` date NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('market_news','economic_event','trade_idea','reminder','trade_review','journal_entry') DEFAULT 'journal_entry',
  `description` text,
  `time` varchar(5) DEFAULT NULL COMMENT 'Format HH:mm (e.g., 14:30)',
  `impact` enum('high','medium','low','none') DEFAULT 'none',
  `instrument` varchar(255) DEFAULT NULL,
  `strategy` varchar(255) DEFAULT NULL,
  `sentiment` enum('bullish','bearish','neutral') DEFAULT 'neutral',
  `color` varchar(20) DEFAULT '#8b5cf6',
  `isCompleted` tinyint(1) DEFAULT '0',
  `relatedTradeId` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exchange_rates`
--

CREATE TABLE `exchange_rates` (
  `id` int NOT NULL,
  `fromCurrency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toCurrency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate` decimal(20,12) NOT NULL,
  `effectiveFrom` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `effectiveTo` datetime DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `source` enum('api','manual','system','fallback') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `lastUpdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `updatedBy` int DEFAULT NULL,
  `metadata` json NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exchange_rates`
--

INSERT INTO `exchange_rates` (`id`, `fromCurrency`, `toCurrency`, `rate`, `effectiveFrom`, `effectiveTo`, `isActive`, `source`, `lastUpdated`, `notes`, `updatedBy`, `metadata`, `createdAt`, `updatedAt`) VALUES
(10, 'IDR', 'USD', '0.000060000000', '2025-12-24 00:00:00', NULL, 1, 'manual', '2025-12-24 02:00:47', '', 21, '{\"createdBy\": 21, \"ipAddress\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36\", \"finalEffectiveFrom\": \"2025-12-24T00:00:00.000Z\", \"originalProposedDate\": \"2025-12-24\"}', '2025-12-24 02:00:47', '2025-12-24 02:00:47');

-- --------------------------------------------------------

--
-- Table structure for table `monthly_leaderboards`
--

CREATE TABLE `monthly_leaderboards` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `period` varchar(255) NOT NULL,
  `rank` int DEFAULT NULL,
  `score` int DEFAULT '0',
  `totalTrades` int DEFAULT '0',
  `totalProfit` decimal(15,2) DEFAULT '0.00',
  `totalExperience` int DEFAULT '0',
  `winRate` decimal(5,2) DEFAULT '0.00',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `monthly_leaderboards`
--

INSERT INTO `monthly_leaderboards` (`id`, `userId`, `period`, `rank`, `score`, `totalTrades`, `totalProfit`, `totalExperience`, `winRate`, `createdAt`, `updatedAt`) VALUES
(65, 16, '2025-12', 1, 0, 0, '0.00', 0, '0.00', '2025-12-19 02:46:38', '2025-12-19 03:53:41');

-- --------------------------------------------------------

--
-- Table structure for table `period_leaderboards`
--

CREATE TABLE `period_leaderboards` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `periodType` enum('daily','weekly','monthly') NOT NULL,
  `periodValue` varchar(20) NOT NULL COMMENT 'daily=YYYY-MM-DD, weekly=YYYY-WW, monthly=YYYY-MM',
  `rank` int DEFAULT NULL,
  `score` int NOT NULL DEFAULT '0',
  `totalProfitUSD` decimal(20,4) NOT NULL DEFAULT '0.0000' COMMENT 'Profit yang sudah dikonversi ke USD',
  `totalProfitOriginal` decimal(20,4) NOT NULL DEFAULT '0.0000' COMMENT 'Profit dalam mata uang asli user',
  `originalCurrency` enum('USD','IDR','CENT') NOT NULL DEFAULT 'USD',
  `totalTrades` int NOT NULL DEFAULT '0',
  `winRate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `dailyActivity` int NOT NULL DEFAULT '0',
  `consistencyScore` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'Skor konsistensi trading',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `userLevel` int DEFAULT '1',
  `totalExperience` int DEFAULT '0',
  `dailyStreak` int DEFAULT '0',
  `total_trades_user` int DEFAULT '0',
  `profitStreak` int DEFAULT '0',
  `maxConsecutiveWins` int DEFAULT '0',
  `lastExchangeRate` decimal(20,12) NOT NULL DEFAULT '1.000000000000' COMMENT 'Rate yang digunakan saat terakhir konversi',
  `exchangeRateUpdatedAt` datetime DEFAULT NULL COMMENT 'Waktu terakhir update exchange rate'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `period_leaderboards`
--

INSERT INTO `period_leaderboards` (`id`, `userId`, `periodType`, `periodValue`, `rank`, `score`, `totalProfitUSD`, `totalProfitOriginal`, `originalCurrency`, `totalTrades`, `winRate`, `dailyActivity`, `consistencyScore`, `createdAt`, `updatedAt`, `userLevel`, `totalExperience`, `dailyStreak`, `total_trades_user`, `profitStreak`, `maxConsecutiveWins`, `lastExchangeRate`, `exchangeRateUpdatedAt`) VALUES
(13, 16, 'daily', '2025-12-19', 4, 0, '0.0000', '0.0000', 'IDR', 0, '0.00', 0, '0.00', '2025-12-19 05:34:18', '2025-12-24 09:00:00', 3, 390, 1, 4, 1, 4, '0.000060000000', '2025-12-24 09:00:00'),
(14, 16, 'weekly', '2025-W51', 4, 0, '0.0000', '0.0000', 'IDR', 0, '0.00', 0, '0.00', '2025-12-19 05:34:18', '2025-12-24 09:00:00', 3, 390, 1, 4, 1, 4, '0.000060000000', '2025-12-24 09:00:00'),
(22, 17, 'daily', '2025-12-19', 2, 3204, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '0.00', '2025-12-19 07:18:01', '2025-12-22 12:59:18', 2, 210, 1, 1, 1, 1, '1.000000000000', NULL),
(23, 17, 'weekly', '2025-W51', 2, 3214, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '14.29', '2025-12-19 07:18:01', '2025-12-22 12:59:18', 2, 210, 1, 1, 1, 1, '1.000000000000', NULL),
(24, 17, 'monthly', '2025-12', 3, 3077, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '3.33', '2025-12-19 07:18:01', '2025-12-24 03:07:43', 2, 210, 1, 1, 1, 1, '1.000000000000', NULL),
(28, 18, 'daily', '2025-12-19', 1, 3204, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '0.00', '2025-12-19 07:22:16', '2025-12-22 12:59:18', 2, 161, 1, 1, 1, 1, '1.000000000000', NULL),
(29, 18, 'weekly', '2025-W51', 1, 3214, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '14.29', '2025-12-19 07:22:16', '2025-12-22 12:59:18', 2, 161, 1, 1, 1, 1, '1.000000000000', NULL),
(30, 18, 'monthly', '2025-12', 2, 3077, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '3.33', '2025-12-19 07:22:16', '2025-12-24 03:07:43', 2, 161, 1, 1, 1, 1, '1.000000000000', NULL),
(31, 19, 'daily', '2025-12-19', 3, 3202, '5.0000', '5.0000', 'USD', 1, '100.00', 1, '0.00', '2025-12-19 07:25:45', '2025-12-22 12:59:18', 2, 160, 1, 1, 1, 1, '1.000000000000', NULL),
(32, 19, 'weekly', '2025-W51', 3, 3212, '5.0000', '5.0000', 'USD', 1, '100.00', 1, '14.29', '2025-12-19 07:25:45', '2025-12-22 12:59:18', 2, 160, 1, 1, 1, 1, '1.000000000000', NULL),
(33, 19, 'monthly', '2025-12', 4, 3075, '5.0000', '5.0000', 'USD', 1, '100.00', 1, '3.33', '2025-12-19 07:25:45', '2025-12-24 03:07:43', 2, 160, 1, 1, 1, 1, '1.000000000000', NULL),
(61, 16, 'daily', '2025-12-23', 1, 3201, '2.0400', '34000.0000', 'IDR', 1, '100.00', 1, '0.00', '2025-12-23 02:29:09', '2025-12-24 09:00:00', 3, 510, 1, 5, 1, 6, '0.000060000000', '2025-12-24 09:00:00'),
(62, 16, 'weekly', '2025-W52', 1, 3420, '3.2400', '54000.0000', 'IDR', 2, '100.00', 2, '28.57', '2025-12-23 02:29:09', '2025-12-24 09:00:00', 3, 645, 2, 6, 2, 7, '0.000060000000', '2025-12-24 09:00:00'),
(63, 16, 'monthly', '2025-12', 1, 3148, '3.2400', '54000.0000', 'IDR', 2, '100.00', 2, '6.67', '2025-12-23 02:29:09', '2025-12-24 09:00:00', 3, 645, 2, 6, 2, 7, '0.000060000000', '2025-12-24 09:00:00'),
(64, 16, 'daily', '2025-12-24', 1, 3200, '1.2000', '20000.0000', 'IDR', 1, '100.00', 1, '0.00', '2025-12-24 03:07:43', '2025-12-24 09:00:00', 3, 645, 2, 6, 2, 7, '0.000060000000', '2025-12-24 09:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `role_name` enum('super_admin','admin','premium_user','user','viewer') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`) VALUES
(3, 'super_admin'),
(2, 'admin'),
(4, 'premium_user'),
(1, 'user'),
(5, 'viewer');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `sid` varchar(36) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `data` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`sid`, `expires`, `data`, `createdAt`, `updatedAt`) VALUES
('_H8BDd8zQv19XH0NYNqYBwCzDgSR62YO', '2025-12-25 06:11:37', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:11:37.853Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:11:37', '2025-12-24 06:11:37'),
('_Vdqc8BuZMy16ReWb3RppHtfqyBKWoHZ', '2025-12-25 04:36:41', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:36:41.890Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:36:41', '2025-12-24 04:36:41'),
('-Eiu63JLqJ6E-BZfn2OYmJ69cNFaDl-y', '2025-12-25 05:38:39', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:38:39.244Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:38:39', '2025-12-24 05:38:39'),
('-GTP62CrlE6Wq3xNjFGKtw-ZPQLtfKu2', '2025-12-25 03:37:40', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:37:40.801Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:37:40', '2025-12-24 03:37:40'),
('-lg81dWWTkOtOivBK1aZzY-PFQ2RM1Tc', '2025-12-25 06:44:18', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:44:18.394Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:44:18', '2025-12-24 06:44:18'),
('-thprvcX3ECdOnP0_mXEs9hVBRNm2E8P', '2025-12-25 00:21:13', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T00:21:13.678Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 00:21:13', '2025-12-24 00:21:13'),
('0Dc2ROrObtkoRvlU0dxSH3jkGPRD_MhO', '2025-12-25 07:02:20', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:02:20.079Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:02:20', '2025-12-24 07:02:20'),
('0IEVOtyL-FRDeJTA1GLjWu-95GD1Myd3', '2025-12-25 04:29:58', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:29:58.384Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:29:58', '2025-12-24 04:29:58'),
('0n-t16ttvhj4SwRQzQ90f8O6vvX9XMGT', '2025-12-25 06:11:37', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:11:37.823Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:11:37', '2025-12-24 06:11:37'),
('1k0s3Hgcda-N8hlM3MQyI7axpowo5m1h', '2025-12-25 07:39:33', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:39:33.226Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:39:33', '2025-12-24 07:39:33'),
('1Tr-7MI2vUR1vJpsjhT9S4pa6XLwwnuO', '2025-12-25 05:29:26', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:29:26.807Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:29:26', '2025-12-24 05:29:26'),
('22yF-V6V1v1V1MA_7sydEY-Lmmqk1dr_', '2025-12-25 09:50:16', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:56:16.454Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":16,\"role\":\"user\"}', '2025-12-21 06:47:31', '2025-12-24 09:50:16'),
('2BJSuVNIltn-BhBxd1DYTZp_u2Yq1Zhu', '2025-12-25 06:54:57', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:56:21.279Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":16,\"role\":\"user\"}', '2025-12-23 05:25:30', '2025-12-24 06:54:57'),
('2gVPwGKlCXrtE3YY3wiqiRE6y5l1HZGx', '2025-12-25 03:34:06', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-24T05:43:33.614Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":21,\"role\":\"super_admin\"}', '2025-12-22 04:14:29', '2025-12-24 03:34:06'),
('2pjaxjQ615hQcdcU6qMLYSgL18igM6GT', '2025-12-25 01:58:02', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T01:58:02.442Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 01:58:02', '2025-12-24 01:58:02'),
('2YDwJgH7j_dLFsu5qzX-rtI_kEaT12Z-', '2025-12-25 06:08:28', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:08:28.114Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:08:28', '2025-12-24 06:08:28'),
('39oHq5U5fAWzdb9oJmCVKZfiGE_UwWHR', '2025-12-25 04:29:58', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:29:58.390Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:29:58', '2025-12-24 04:29:58'),
('3WFrnWeJkKAus5qLhDsZBN-M6fpfy3DN', '2025-12-25 06:26:50', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:50.815Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:50', '2025-12-24 06:26:50'),
('4A4Kr7hLBg8izJTfDP62d2uXK2i99zg6', '2025-12-25 02:00:47', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:00:47.121Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 02:00:47', '2025-12-24 02:00:47'),
('4RFsd1HChqUasIlt_qHoQVQ2nbJC8E0W', '2025-12-25 04:42:23', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:42:23.773Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:42:23', '2025-12-24 04:42:23'),
('516_FC62wGM4ZYRBO3jWOQem0QpfoUr8', '2025-12-25 03:36:57', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:36:57.871Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:36:57', '2025-12-24 03:36:57'),
('5tCGIV90uVBp7pWe9NzdrtV0G2wif_RU', '2025-12-25 07:39:33', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:39:33.253Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:39:33', '2025-12-24 07:39:33'),
('768SCjdS9aYAuKtN8fbbtOia20S7VnG5', '2025-12-25 04:30:13', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:30:13.200Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:30:13', '2025-12-24 04:30:13'),
('7gdqvSGro4r-1x4zBGz0AoUg_H_biHB0', '2025-12-25 06:44:12', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:44:12.110Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:44:12', '2025-12-24 06:44:12'),
('7Ta4GhpzgJADUT9_qvgXplogzRb97dzN', '2025-12-25 03:36:45', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:36:45.148Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:36:45', '2025-12-24 03:36:45'),
('7tr3K9yu1sGnbXU6R0Q-19hDjzNA4q9K', '2025-12-25 06:56:09', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:56:09.131Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:56:09', '2025-12-24 06:56:09'),
('9l7bhrKZmi49uhZz02X2oQanSP_fREnT', '2025-12-25 06:51:11', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:51:11.072Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:51:11', '2025-12-24 06:51:11'),
('a0c7DrNPbuYdd9Ws8mXZYcHLIcUTqUy4', '2025-12-25 05:38:31', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:38:31.140Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:38:31', '2025-12-24 05:38:31'),
('A7vZ0n9aG-w9bFXnLbuwogBmwVMi6s7J', '2025-12-25 03:36:16', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:36:16.748Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:36:16', '2025-12-24 03:36:16'),
('aO4NYIdzyGxomLpH4LY5ySeMfBoIGHjL', '2025-12-25 06:56:09', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:56:09.114Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:56:09', '2025-12-24 06:56:09'),
('ATBrYsKbrJXmtMgYtg3r57pCplgoi8sE', '2025-12-25 01:59:00', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T01:59:00.972Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 01:59:00', '2025-12-24 01:59:00'),
('aU_1UrPz54j-OWxUw0Jtrk46W9YPXDmP', '2025-12-25 06:26:50', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:50.818Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:50', '2025-12-24 06:26:50'),
('avSsK0v2GQODFT8-a4rKGTCLFgdFG2gT', '2025-12-25 03:31:43', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:31:43.877Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:31:44', '2025-12-24 03:31:44'),
('bA5s-lpNdU_GjZBmbVAZx7kN3Nb1mXYT', '2025-12-25 06:44:06', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:44:06.474Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:44:06', '2025-12-24 06:44:06'),
('BeIvWVB_nsMBAXcACTY0Aokn36APmrp1', '2025-12-25 03:46:07', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:46:07.738Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:46:07', '2025-12-24 03:46:07'),
('bHL4IDjsKxw59jZMUcH4_WPafr-Eo6CN', '2025-12-25 04:37:01', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:37:01.946Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:37:01', '2025-12-24 04:37:01'),
('BhvkOmup8d0Pp6KC6zNRzBQ0F0lRKQNj', '2025-12-25 03:36:57', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:36:57.698Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:36:57', '2025-12-24 03:36:57'),
('BpEtcuHbs-S29MEAkDt_IxobtX3scAq3', '2025-12-24 10:09:48', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-24T10:09:48.919Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-23 10:09:48', '2025-12-23 10:09:48'),
('BsHyH4sM_1sUjEWllh92yuQJ8YqBMs3Q', '2025-12-25 05:33:35', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:33:35.982Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:33:35', '2025-12-24 05:33:35'),
('bYUE5qoSWP_OSmcoTbbPkdMoKdv3qH0o', '2025-12-25 07:02:39', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:02:39.492Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:02:39', '2025-12-24 07:02:39'),
('C4nEIsdb8AHnHDk7uJGU_5QyXUuB0uoG', '2025-12-25 05:32:59', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:32:59.429Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:32:59', '2025-12-24 05:32:59'),
('C82SpE0VN2synLaAO0QJ_0Kf8d94h0MM', '2025-12-25 07:39:33', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:39:33.299Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:39:33', '2025-12-24 07:39:33'),
('Cb54uVnmJWJNC5mQBrGhcOimI58GSHp3', '2025-12-25 06:28:41', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:28:41.084Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:28:41', '2025-12-24 06:28:41'),
('cbZTBkJ6Hfsfprzua51aTrLsvL0D7PFD', '2025-12-25 04:52:08', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:52:08.520Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:52:08', '2025-12-24 04:52:08'),
('CwLwlr31Q5spiogVf7bs-NhBp3A09gn9', '2025-12-25 05:38:47', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:38:47.852Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:38:47', '2025-12-24 05:38:47'),
('CxLnUuSVRi7RYf3YQilSJYXrg5r9yze_', '2025-12-25 03:28:32', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:28:32.636Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:28:32', '2025-12-24 03:28:32'),
('d058-fx5FLe_uVQB7j_oDvjDBNw-3bls', '2025-12-25 06:26:25', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:25.510Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:25', '2025-12-24 06:26:25'),
('DGYHeVT_PVyshj0toLuNZMbX6tOad2Ji', '2025-12-25 03:31:55', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:31:55.884Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:31:55', '2025-12-24 03:31:55'),
('DLi2r_ZqLN6IhIyYt2MXB_I41qe3FSWV', '2025-12-25 02:56:21', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:56:21.450Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 02:56:21', '2025-12-24 02:56:21'),
('DMwcZNw1H_tuliK16jFwDLCwv9KnMmVZ', '2025-12-25 03:37:19', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:37:19.985Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:37:19', '2025-12-24 03:37:19'),
('DPuXlGDr7-2EeeXO-3WmT71G9bUs4tyw', '2025-12-25 06:11:37', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:11:37.818Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:11:37', '2025-12-24 06:11:37'),
('e7cVBblCrFO8sr25DW8n00ht6kPZLh3S', '2025-12-25 07:01:25', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:01:25.193Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:01:25', '2025-12-24 07:01:25'),
('eIFGJvHjCJ4rN3Bwyo5c3vrXTvffZIg5', '2025-12-25 06:28:41', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:28:41.114Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:28:41', '2025-12-24 06:28:41'),
('f6CBGrT7E69zfKy646VHVZ9IjYh7tHat', '2025-12-25 06:26:25', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:25.529Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:25', '2025-12-24 06:26:25'),
('fpbOWp4sfOQsDnJnfK99l630UsMaFHkK', '2025-12-25 03:46:07', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:46:07.711Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:46:07', '2025-12-24 03:46:07'),
('FU80guxgH-zUUisDeNQOM847jvYUoFyZ', '2025-12-25 05:29:26', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:29:26.849Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:29:26', '2025-12-24 05:29:26'),
('fUL3Ad7IzgdUSjhinzkT0j7-GC3hPrNo', '2025-12-25 06:51:06', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:51:06.797Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:51:06', '2025-12-24 06:51:06'),
('fvsgFZzwsWk9xKT-sVdkiJZffbOGOcYG', '2025-12-25 07:00:38', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:00:38.929Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:00:38', '2025-12-24 07:00:38'),
('FY9_xsKzz_Jq1mCtM_E7RCkyWDlLInQL', '2025-12-25 06:26:50', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:50.804Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:50', '2025-12-24 06:26:50'),
('Fzwg4zfi12VeoUdqQ2waQu3JhuXty7de', '2025-12-25 07:00:38', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:00:38.895Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:00:38', '2025-12-24 07:00:38'),
('G7ipVNrAOipNJY10Xn7bdfFL8OtrajSF', '2025-12-25 05:38:39', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:38:39.250Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:38:39', '2025-12-24 05:38:39'),
('g8qROdHcjszN-ybPpYyNCNd_cEXa0htP', '2025-12-25 08:34:44', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T08:34:44.875Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 08:34:44', '2025-12-24 08:34:44'),
('GiJpEFRMjfv5S4JfJJZPzkA5CGYkXjz0', '2025-12-25 02:00:21', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:00:21.532Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 02:00:21', '2025-12-24 02:00:21'),
('GO-cb9rVD_vArIx-Wctqx32T1OqyBPeE', '2025-12-25 01:58:29', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T01:58:29.875Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 01:58:29', '2025-12-24 01:58:29'),
('gtB7oHXn0xL_bKbahLuLIbN7jJNmBbkv', '2025-12-25 08:34:45', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T08:34:45.505Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 08:34:45', '2025-12-24 08:34:45'),
('h4wVXfrWLRuCJVPryWCPYIgw5eBeUju9', '2025-12-25 09:16:25', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T09:16:25.991Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 09:16:26', '2025-12-24 09:16:26'),
('HB4ybK_hLVGMs8aqRZfU7WJZC_1dIc7B', '2025-12-25 07:00:38', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:00:38.908Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:00:38', '2025-12-24 07:00:38'),
('hEhRvAKGPvKRbXv_wyhyEObVOFPGBVfa', '2025-12-25 04:29:58', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:29:58.413Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:29:58', '2025-12-24 04:29:58'),
('HiPDrkHDTxvRN06_n-oLmFeO-Y601yL9', '2025-12-25 07:01:25', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:01:25.187Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:01:25', '2025-12-24 07:01:25'),
('HrdVrQHXiVMctt_ik09wXQQ6Z6n1K51S', '2025-12-25 06:56:09', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:56:09.089Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:56:09', '2025-12-24 06:56:09'),
('HufC3RbP09ypRX7urrovXCmycXFxMTnM', '2025-12-25 04:42:23', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:42:23.806Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:42:23', '2025-12-24 04:42:23'),
('HV6wgnGtv9L6g8FXJTSHlf9FCpAcIy48', '2025-12-25 04:30:18', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:30:18.534Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:30:18', '2025-12-24 04:30:18'),
('i-Il6zupKxQyErnigb2xSGwE8u-vj99h', '2025-12-25 04:42:23', '{\"cookie\":{\"originalMaxAge\":86399999,\"expires\":\"2025-12-25T04:42:23.804Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:42:23', '2025-12-24 04:42:23'),
('ib910H8glp9FpT0hGnHs2GVxjKzLMAca', '2025-12-25 09:16:26', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T09:16:26.005Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 09:16:26', '2025-12-24 09:16:26'),
('iD2FKwhlu-4idf0jriQOz9j3ct_nT1J-', '2025-12-25 06:28:51', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:28:51.144Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:28:51', '2025-12-24 06:28:51'),
('IH1SM5i3xFdYt91Lw0wh97hNOu1HAauA', '2025-12-25 04:42:29', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:42:29.124Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:42:29', '2025-12-24 04:42:29'),
('iRCkgq-p-BTR5sqhHo8BbW9wb3rWfGw9', '2025-12-25 06:26:25', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:25.530Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:25', '2025-12-24 06:26:25'),
('IV6xRhyc0flQaaC4hdiU9eIs8GnYD6yS', '2025-12-25 02:00:36', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:00:36.258Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 02:00:36', '2025-12-24 02:00:36'),
('IVW49CU-OKBFHF3FqzW-_0BwUjp0Tzsk', '2025-12-25 05:33:16', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:33:16.600Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:33:16', '2025-12-24 05:33:16'),
('jar9Xl3O6xqeICl2wa93GjQ6Je6yQRhM', '2025-12-25 07:01:57', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:01:57.394Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:01:57', '2025-12-24 07:01:57'),
('jBuxOie1ZuRnQRs0uvd_UlW500M4e6Mh', '2025-12-25 04:36:41', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:36:41.876Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:36:41', '2025-12-24 04:36:41'),
('JFbkoIHzxDdA_1m-hkWJL5bzN9jqnGSn', '2025-12-25 08:34:45', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T08:34:45.582Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 08:34:45', '2025-12-24 08:34:45'),
('JKTTwE-9hTSd5A9WV8pX8QDzLCYqPFMF', '2025-12-25 06:51:06', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:51:06.778Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:51:06', '2025-12-24 06:51:06'),
('jr9MwDBOughOnZ0bulzWP6zHEsJ_pcmD', '2025-12-25 06:28:41', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:28:41.087Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:28:41', '2025-12-24 06:28:41'),
('jwPltT9BUyzZ6gApqBn3o3uLWyTqwprD', '2025-12-25 05:38:22', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:38:22.424Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:38:22', '2025-12-24 05:38:22'),
('jxML95Jdyo20CbpY_OcsuT6SWos3IOY-', '2025-12-25 06:44:06', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:44:06.505Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:44:06', '2025-12-24 06:44:06'),
('k0xN7vqviExfQ1NQnAtUYsFevSfIaAB4', '2025-12-25 06:26:14', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:14.206Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:14', '2025-12-24 06:26:14'),
('K23LLMCJ80c0OhDtV8k-L5Br2H4U5_Ux', '2025-12-25 09:15:18', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T09:15:18.415Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 09:15:18', '2025-12-24 09:15:18'),
('K3J2YkIWnZ8lS8tUZkRP9i_OI7_V0osH', '2025-12-25 06:44:06', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:44:06.481Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:44:06', '2025-12-24 06:44:06'),
('KcPUQBhQtjMbJmBC-7Mb_x4EYqcMSAkg', '2025-12-25 04:37:05', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:37:05.726Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:37:05', '2025-12-24 04:37:05'),
('kGQBO68Hh-7AST3oC0T8ReWhd_2g-5H9', '2025-12-25 07:39:31', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:39:31.039Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:39:31', '2025-12-24 07:39:31'),
('KIvK7ypWGerodNRs_m3fT7cAiduqIJ6w', '2025-12-25 06:51:06', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:51:06.784Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:51:06', '2025-12-24 06:51:06'),
('KMXhoCL_gzLlPITQVHG4DccgJz-Kqt7d', '2025-12-25 09:15:18', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T09:15:18.386Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 09:15:18', '2025-12-24 09:15:18'),
('Kn9_etgilzCgTOxHTgljoQZmLn_p2Di9', '2025-12-25 07:39:33', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:39:33.236Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:39:33', '2025-12-24 07:39:33'),
('kZ3G816qaBQ0f9EwWjxuAl8aEfJic8VO', '2025-12-25 04:52:16', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:52:16.420Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:52:16', '2025-12-24 04:52:16'),
('L1pddoXa0P5QANDyxr3mim5adSxNgRJQ', '2025-12-25 04:36:41', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:36:41.900Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:36:41', '2025-12-24 04:36:41'),
('L7j-iU330B1qwuoFm6vUsz8kPTlSCbb3', '2025-12-25 05:38:31', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:38:31.149Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:38:31', '2025-12-24 05:38:31'),
('LtV6vQhghn2m1gkOTi8cW3LQlh02deup', '2025-12-25 05:26:14', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:26:14.463Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:26:14', '2025-12-24 05:26:14'),
('LTXeARSXRgbgnQmMyl5sJ4s1C8y0ZOsk', '2025-12-25 03:37:19', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:37:19.984Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:37:19', '2025-12-24 03:37:19'),
('LXMLEuzRJfV_idFyZH0HJTTfD3_9JO3J', '2025-12-25 07:00:38', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:00:38.920Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:00:38', '2025-12-24 07:00:38'),
('m4EXugzoIc3On8wDemoiB2wa7Y58NMFc', '2025-12-25 09:16:26', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T09:16:26.001Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 09:16:26', '2025-12-24 09:16:26'),
('M4FLssBUaVWXDIjrVq3LU8bIbml0_Fmk', '2025-12-25 06:26:14', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:14.184Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:14', '2025-12-24 06:26:14'),
('MbIzHBFTaR30fDrZuLp_pzk6Egn4FGb_', '2025-12-25 05:26:14', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:26:14.492Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:26:14', '2025-12-24 05:26:14'),
('mdV0FJ4XNOCXSk8d5r_Lp_HD_PP1S6H2', '2025-12-25 09:16:47', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T09:16:47.683Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 09:16:47', '2025-12-24 09:16:47'),
('Mei7qVtgcowg2hIVGG3koRGljNJqzBk_', '2025-12-25 03:28:32', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:28:32.664Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:28:32', '2025-12-24 03:28:32'),
('mj5g7wrxYPBMWRM2PyKcZwF715i_8y7U', '2025-12-25 01:59:04', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T01:59:04.754Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 01:59:04', '2025-12-24 01:59:04'),
('moexozUfXdEW8TFiZn_URPx9eICzA3Bh', '2025-12-25 06:08:28', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:08:28.115Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:08:28', '2025-12-24 06:08:28'),
('mq8DAWE1MgG1SdVsA6LPaeO4qIvM7mXx', '2025-12-25 01:58:35', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T01:58:35.520Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 01:58:35', '2025-12-24 01:58:35'),
('N-3lAd51DU087jF3YhZsLr7Pjj2DlS8x', '2025-12-25 05:32:59', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:32:59.415Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:32:59', '2025-12-24 05:32:59'),
('n-jWVJFKcGNCjjjGxlKkzCUJUuGWQ1s3', '2025-12-25 05:32:59', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:32:59.373Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:32:59', '2025-12-24 05:32:59'),
('n9AMNwf5KRimuDZ5rOvbt7YUVHc_Lh-m', '2025-12-25 07:02:39', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:02:39.484Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:02:39', '2025-12-24 07:02:39'),
('nBjRlxjG_6zWVy_qMBH49tIuvhwCOTb-', '2025-12-25 06:56:20', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:56:20.890Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:56:20', '2025-12-24 06:56:20'),
('nu54_gOd9b5Ac_nz09suVZj4xv4o1DGI', '2025-12-25 06:26:57', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:57.609Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:57', '2025-12-24 06:26:57'),
('nXi3m-dRza80qI_pUvHAVI8FzcWI0Oez', '2025-12-25 06:51:06', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:51:06.803Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:51:06', '2025-12-24 06:51:06'),
('O18U-QHG-FqS9SNI7TqcUsivN3u3kS3M', '2025-12-25 03:31:26', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:31:26.912Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:31:26', '2025-12-24 03:31:26'),
('ObMYG1-bb82kt7C9IhtVTRaANWtbrCur', '2025-12-25 03:36:16', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:36:16.925Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:36:16', '2025-12-24 03:36:16'),
('og5D1VhcERmXllhR6CkxVSmGx5I-Cb7D', '2025-12-25 04:37:01', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:37:01.955Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:37:01', '2025-12-24 04:37:01'),
('OM5p7F9DQp71lS--tYpXl6tPTdzNRKVT', '2025-12-25 06:56:09', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:56:09.117Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:56:09', '2025-12-24 06:56:09'),
('OmWQoZiRd7SYvoMoIWKH-i8j2bKA2nmT', '2025-12-25 04:29:58', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:29:58.407Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:29:58', '2025-12-24 04:29:58'),
('oyhuOprIfWDhr8mUdm8KIlft3ZW1CxED', '2025-12-25 03:36:57', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:36:57.844Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:36:57', '2025-12-24 03:36:57'),
('oyVOSasZJdLEf8wWg5yFdSPrVo0JrhGL', '2025-12-25 09:16:47', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T09:16:47.724Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 09:16:47', '2025-12-24 09:16:47'),
('pDfA2A91ZqbQG_HA6g10GJoymtgNtFzb', '2025-12-25 05:26:14', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:26:14.508Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:26:14', '2025-12-24 05:26:14'),
('pdp01PhpUN3ZSDwgR80TGm5Ji4EvqLzc', '2025-12-25 04:42:23', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:42:23.779Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:42:23', '2025-12-24 04:42:23'),
('PEVvgpS9BXtToC4D35lKwyFPmc5Ezc5Q', '2025-12-25 03:36:16', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:36:16.932Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:36:16', '2025-12-24 03:36:16'),
('PnNtZaUgmJZHJ7mM6_KlFKd_EPmYVHJc', '2025-12-25 05:38:31', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:38:31.120Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:38:31', '2025-12-24 05:38:31'),
('PpMku4x3ZJ1EZPDB16YbPbtlU54EB6SG', '2025-12-25 07:02:20', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:02:20.056Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:02:20', '2025-12-24 07:02:20'),
('PsnaoFGnKAU6G0n-OxUPwESPfRpkmZhQ', '2025-12-25 02:57:03', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:57:03.756Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 02:57:03', '2025-12-24 02:57:03'),
('pUgbkJXxl6mEPgeQWykgoLTDLOj0158S', '2025-12-25 09:15:23', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T09:15:23.948Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 09:15:23', '2025-12-24 09:15:23'),
('PYkpwr8RQbBfhXCuhSCwBJJRPzNOp8Fd', '2025-12-25 02:00:04', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:00:04.160Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 02:00:04', '2025-12-24 02:00:04'),
('PzZOy_rgjRcsqYe8vLfXdKjVSgXHZmMT', '2025-12-25 06:26:25', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:25.507Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:25', '2025-12-24 06:26:25'),
('q5HTAwqIMEBq8Qege2wWnEMMbn-QHKIN', '2025-12-25 03:36:57', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:36:57.869Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:36:57', '2025-12-24 03:36:57'),
('QEbcdf_rKMNPYaxPoYxNg1lWh9tWn2Of', '2025-12-25 08:34:45', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T08:34:45.597Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 08:34:45', '2025-12-24 08:34:45'),
('Qyj0S1t2-m1FtZgC8jlMn6kciWEdUVL_', '2025-12-25 05:32:59', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:32:59.449Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:32:59', '2025-12-24 05:32:59'),
('r070L9ySiyu5cM3cJTL097Z0h84TfAOn', '2025-12-25 05:29:26', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:29:26.848Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:29:26', '2025-12-24 05:29:26'),
('R36b0UShQgDggpClGHZz8dxBOGxyXP18', '2025-12-25 04:52:08', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:52:08.504Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:52:08', '2025-12-24 04:52:08'),
('R8GPKT-p3BB71dV4VoMtYC4ysvJ7WGqw', '2025-12-25 06:08:28', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:08:28.090Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:08:28', '2025-12-24 06:08:28'),
('RFZC6gE2GqO9Dz4TL-a9QrTuok5OmUbs', '2025-12-25 07:40:10', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:40:10.383Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:40:10', '2025-12-24 07:40:10'),
('rKumgvtk5bfcUp-MWZ3q4sxzeyudaKJX', '2025-12-24 10:09:45', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-24T10:09:45.815Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-23 10:09:45', '2025-12-23 10:09:45'),
('RLcztMagU2m7NUllMG-iztkSv09A1GMW', '2025-12-25 06:26:14', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:14.216Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:14', '2025-12-24 06:26:14'),
('rRYv44DMZa3P81UxuWpdwdHwU3aQsana', '2025-12-25 05:38:47', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:38:47.857Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:38:47', '2025-12-24 05:38:47'),
('sG7ofS4W8wcsv9KpxAdS1fmJZFSjzwvy', '2025-12-25 07:40:06', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:40:06.388Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:40:06', '2025-12-24 07:40:06'),
('shw9QcQU_hWSQBhZr8Ka60CkGYltxKna', '2025-12-25 03:36:57', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:36:57.837Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:36:57', '2025-12-24 03:36:57'),
('SnwiV9fGMs3xMF71kJH6AIh-DSfqEmmz', '2025-12-25 01:47:25', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T01:47:25.928Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 01:47:25', '2025-12-24 01:47:25'),
('t-2BpjomM2YwSs0LWjVwfQpowuq_4D0e', '2025-12-25 06:44:12', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:44:12.122Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:44:12', '2025-12-24 06:44:12'),
('TcB5JphhI1zi2OvyYRlnE_meUq3x1ELU', '2025-12-25 06:44:12', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:44:12.106Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:44:12', '2025-12-24 06:44:12'),
('tdzEf4MC55VTOgSvXjP7HLm00ZuLNroi', '2025-12-25 03:37:19', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:37:19.968Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:37:19', '2025-12-24 03:37:19'),
('tgx4UNECt_ORXoge_-GAcyLVNQcfkyDt', '2025-12-25 01:59:23', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T01:59:23.041Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 01:59:23', '2025-12-24 01:59:23'),
('tKm2r64hAHkdnNyUl1iEX6AVjHCE-zoH', '2025-12-25 09:16:47', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T09:16:47.721Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 09:16:47', '2025-12-24 09:16:47'),
('tpWNaU0d4vYeggtY2icaKH0y_nIPwzoE', '2025-12-25 05:29:26', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:29:26.787Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:29:26', '2025-12-24 05:29:26'),
('Twl-fnql8r4lR9v8AW9xMw-vk_L1sYsW', '2025-12-25 03:39:01', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:39:01.749Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:39:01', '2025-12-24 03:39:01'),
('tx0OI66BMtoTP0aQ1j9BmA6iBEB7uKma', '2025-12-25 03:36:51', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:36:51.384Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:36:51', '2025-12-24 03:36:51'),
('TX0yaqjd2nQREWwfjtgp6qmjRIMo1vvC', '2025-12-25 02:00:13', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:00:13.685Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 02:00:13', '2025-12-24 02:00:13'),
('U0WyAWUpssGIM8O1bbG6wV4BRtTBS9pR', '2025-12-25 06:44:06', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:44:06.502Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:44:06', '2025-12-24 06:44:06'),
('U6LgAYp-QBTdBJmpv2yrJ8d5CEygvla9', '2025-12-25 04:36:41', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:36:41.897Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:36:41', '2025-12-24 04:36:41'),
('UcIL4PFHUOWEb-7kJvtTvnyhnUy2fTUf', '2025-12-25 03:37:40', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:37:40.795Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:37:40', '2025-12-24 03:37:40'),
('ule1MMro8ATS2nHTS_Wn78y_SmrxzW1r', '2025-12-25 04:52:08', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:52:08.519Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:52:08', '2025-12-24 04:52:08'),
('urB6DRtdFjVAD4nZwxspt9wz3oPr588h', '2025-12-25 03:31:43', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:31:43.883Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:31:44', '2025-12-24 03:31:44'),
('UsBA_HuiOgOi0bmxyg27H7-YOTc92I1e', '2025-12-25 04:52:08', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:52:08.489Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:52:08', '2025-12-24 04:52:08'),
('UTwZOXQ1cHJA2oxfQ2EICufYFicAL3HF', '2025-12-25 06:44:12', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:44:12.124Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:44:12', '2025-12-24 06:44:12'),
('UyPATER6XMHvbqleqaZ1C6B4hW-P2cll', '2025-12-25 07:00:44', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:00:44.628Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:00:44', '2025-12-24 07:00:44'),
('UYXR9sPC6S0uwt3nRiF2uAfEJWijRpNq', '2025-12-25 09:16:25', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T09:16:25.918Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 09:16:25', '2025-12-24 09:16:25'),
('v45z0DguezW8lOFAokNJ-RFAUqS7W8XV', '2025-12-25 02:00:28', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:00:28.853Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 02:00:28', '2025-12-24 02:00:28'),
('VAE0Ke0-7LmnN2_pLxu0dyvXgwYUzGps', '2025-12-25 02:56:21', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:56:21.460Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 02:56:21', '2025-12-24 02:56:21'),
('VAi8ChNaBINE0KHh8RwIQoPHVF-g9Ufj', '2025-12-25 08:34:45', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T08:34:45.591Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 08:34:45', '2025-12-24 08:34:45'),
('vDa4hfwMeW1J_2U5rPzHS1Fw-1g2k5Dx', '2025-12-25 06:26:14', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:14.190Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:14', '2025-12-24 06:26:14'),
('vgKFLzsfknFg9arhRh_sKvSy1xmaYCPB', '2025-12-25 06:56:16', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:56:16.360Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:56:16', '2025-12-24 06:56:16'),
('VH7y_hVQpJYEYfgL1h4ZM6D2R1mKIZdo', '2025-12-25 06:28:41', '{\"cookie\":{\"originalMaxAge\":86399999,\"expires\":\"2025-12-25T06:28:41.111Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:28:41', '2025-12-24 06:28:41'),
('vnUco8eVH2PPGelD9Ibh7Tt-oZns8MtA', '2025-12-25 02:57:03', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:57:03.769Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 02:57:03', '2025-12-24 02:57:03'),
('vQ6KctnU-Help_MLikXZrEVg05A3X5eP', '2025-12-25 03:38:50', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:38:50.894Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:38:50', '2025-12-24 03:38:50'),
('VYUScSCFx1cxPooOPc-FP_46IGwlckqy', '2025-12-25 05:38:31', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:38:31.152Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:38:31', '2025-12-24 05:38:31'),
('vZOvn-f34BjyXmXhReqVXdpkaVNGtZmr', '2025-12-25 05:33:12', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:33:12.136Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:33:12', '2025-12-24 05:33:12'),
('W8q0aU_7t6QQ-ali68yw5d4dphN_V0xx', '2025-12-25 06:08:32', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:08:32.879Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:08:32', '2025-12-24 06:08:32'),
('WbfRcc3HfZwRlLO4Ctd6fDAHxc5pn69D', '2025-12-25 03:37:40', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:37:40.694Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:37:40', '2025-12-24 03:37:40'),
('WBlUO_qZZfhBHq_U715l__wZu2uZz6b-', '2025-12-25 05:26:14', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:26:14.480Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:26:14', '2025-12-24 05:26:14'),
('wCkkcWoUBFH3e-JK3HNceAMeY1riN5JD', '2025-12-25 04:30:13', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T04:30:13.209Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 04:30:13', '2025-12-24 04:30:13'),
('Wemz-LSmdMH49x2vHc3H3O78LlH41vYd', '2025-12-25 02:56:20', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T02:56:20.903Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 02:56:21', '2025-12-24 02:56:21'),
('wNsHMrj4-iuDMlIiAhz5lNKThX4lZEHI', '2025-12-25 06:11:37', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:11:37.852Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:11:37', '2025-12-24 06:11:37'),
('WPO7wy5SKK1VBeinM_3p7ZbBkd9P_Mub', '2025-12-25 06:26:50', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:26:50.808Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:26:50', '2025-12-24 06:26:50'),
('WQ70zLUQXThM9W4YQXRXH9GSZ9YP170I', '2025-12-25 07:40:06', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:40:06.380Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:40:06', '2025-12-24 07:40:06'),
('WRpEb9YtvPtQ1VNDEkoyLxWz_gtiIeW1', '2025-12-25 05:33:12', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T05:33:12.144Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 05:33:12', '2025-12-24 05:33:12'),
('WXRAPqB8mnVhA-Vn6wXIFbDOTqfukQ8K', '2025-12-25 07:01:25', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:01:25.167Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:01:25', '2025-12-24 07:01:25'),
('XJFWdSsNSXEcmcfPdY-_8mT9u1DxxtKa', '2025-12-25 06:08:28', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:08:28.106Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:08:28', '2025-12-24 06:08:28'),
('Xkn--2__W_M4_xC43ZlTHYX50y6nPu8a', '2025-12-25 09:16:47', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T09:16:47.702Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 09:16:47', '2025-12-24 09:16:47'),
('XNpb0GpCoNdXDnOZ59wJJofvOJBJY2Qm', '2025-12-25 09:46:35', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:21:26.759Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":16,\"role\":\"user\"}', '2025-12-24 07:21:26', '2025-12-24 09:46:35'),
('XTz2MTaQENSeRE0UvL6YaT_3NpyH5JEO', '2025-12-25 03:07:42', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:07:42.815Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:07:42', '2025-12-24 03:07:42'),
('Xx7Lj4oPxhxRlfvcWeiLMTsf5-d8HULX', '2025-12-25 07:01:25', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:01:25.169Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:01:25', '2025-12-24 07:01:25'),
('yAYXMZveXy3-nvvbWuBSo8EPnN0CC-fy', '2025-12-25 07:02:18', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T07:02:18.678Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 07:02:19', '2025-12-24 07:02:19'),
('YVYY_uc6iy8lOua6oYuk6bDDz2n682oK', '2025-12-25 06:56:20', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:56:20.898Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:56:20', '2025-12-24 06:56:20'),
('ZEBaCB4bfL51dpDKmTmiqu0lpZz44g2H', '2025-12-25 03:37:19', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T03:37:19.973Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 03:37:19', '2025-12-24 03:37:19');
INSERT INTO `sessions` (`sid`, `expires`, `data`, `createdAt`, `updatedAt`) VALUES
('zSka4SlgI5yBlIwRgzyIe6D9uzFimi3S', '2025-12-25 06:11:43', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-25T06:11:43.050Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-24 06:11:43', '2025-12-24 06:11:43');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint UNSIGNED NOT NULL,
  `userId` int NOT NULL,
  `plan` enum('free','pro','lifetime') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'free',
  `expiresAt` datetime DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `paymentMethod` varchar(255) DEFAULT NULL,
  `transactionId` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `userId`, `plan`, `expiresAt`, `isActive`, `paymentMethod`, `transactionId`, `created_at`, `updated_at`) VALUES
(120, 16, 'free', NULL, 1, NULL, NULL, '2025-12-17 19:28:22', '2025-12-24 09:16:11'),
(124, 17, 'free', NULL, 1, NULL, NULL, '2025-12-19 07:12:34', '2025-12-19 07:12:34'),
(125, 18, 'free', NULL, 1, NULL, NULL, '2025-12-19 07:20:33', '2025-12-19 07:20:33'),
(126, 19, 'free', NULL, 1, NULL, NULL, '2025-12-19 07:23:59', '2025-12-19 07:23:59');

-- --------------------------------------------------------

--
-- Table structure for table `targets`
--

CREATE TABLE `targets` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `enabled` tinyint(1) DEFAULT '0',
  `targetBalance` decimal(15,2) DEFAULT '0.00',
  `targetDate` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `startDate` date DEFAULT NULL,
  `useDailyTarget` tinyint(1) NOT NULL DEFAULT '0',
  `dailyTargetPercentage` decimal(5,2) NOT NULL DEFAULT '0.00',
  `dailyTargetAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `targets`
--

INSERT INTO `targets` (`id`, `userId`, `enabled`, `targetBalance`, `targetDate`, `description`, `startDate`, `useDailyTarget`, `dailyTargetPercentage`, `dailyTargetAmount`, `created_at`, `updated_at`) VALUES
(16, 16, 0, '0.00', NULL, '', '2025-12-18', 0, '0.00', '0.00', '2025-12-17 19:28:22', '2025-12-18 08:29:46'),
(17, 17, 0, '0.00', NULL, NULL, '2025-12-19', 0, '0.00', '0.00', '2025-12-19 07:12:34', '2025-12-19 07:12:34'),
(18, 18, 0, '0.00', NULL, NULL, '2025-12-19', 0, '0.00', '0.00', '2025-12-19 07:20:33', '2025-12-19 07:20:33'),
(19, 19, 0, '0.00', NULL, NULL, '2025-12-19', 0, '0.00', '0.00', '2025-12-19 07:23:59', '2025-12-19 07:23:59');

-- --------------------------------------------------------

--
-- Table structure for table `trades`
--

CREATE TABLE `trades` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `date` date NOT NULL,
  `instrument` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('Buy','Sell') COLLATE utf8mb4_unicode_ci NOT NULL,
  `lot` decimal(10,2) NOT NULL,
  `entry` decimal(15,5) NOT NULL,
  `stop` decimal(15,5) DEFAULT NULL,
  `take` decimal(15,5) DEFAULT NULL,
  `exit` decimal(15,5) DEFAULT NULL,
  `pips` int DEFAULT '0',
  `profit` decimal(15,2) DEFAULT '0.00',
  `balanceAfter` decimal(15,2) NOT NULL,
  `result` enum('Win','Lose','Break Even','Pending') COLLATE utf8mb4_unicode_ci NOT NULL,
  `riskReward` decimal(5,2) DEFAULT '0.00',
  `strategy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `market` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emotionBefore` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emotionAfter` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `screenshot` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trades`
--

INSERT INTO `trades` (`id`, `userId`, `date`, `instrument`, `type`, `lot`, `entry`, `stop`, `take`, `exit`, `pips`, `profit`, `balanceAfter`, `result`, `riskReward`, `strategy`, `market`, `emotionBefore`, `emotionAfter`, `screenshot`, `notes`, `created_at`, `updated_at`) VALUES
(92, 17, '2025-12-19', 'XAUUSD', 'Buy', '0.01', '4000.00000', '3070.00000', '4060.00000', '4060.00000', 60, '10.00', '110.00', 'Win', '1.50', 'Pullback', 'Trending', 'Tenang', 'Puas', '', 'Mantap', '2025-12-19 07:18:01', '2025-12-19 07:18:25'),
(93, 18, '2025-12-19', 'XAUUSD', 'Buy', '0.01', '4000.00000', '3050.00000', '4060.00000', '4060.00000', 50, '10.00', '130.00', 'Win', '1.50', 'Breakout', 'sdfd', 'sdf', 'sdfs', '', 'sdf', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(94, 19, '2025-12-19', 'XAUUSD', 'Buy', '0.01', '4000.00000', '3090.00000', '4020.00000', '4020.00000', 20, '5.00', '305.00', 'Win', '1.20', 'Session Trading', 'ghfhgf', 'fghfgh', 'fhf', '', 'fghfg', '2025-12-19 07:25:44', '2025-12-19 07:25:44'),
(97, 16, '2025-12-23', 'XAUUSD', 'Buy', '0.01', '4018.00000', '4000.00000', '4047.00000', '4047.00000', 10, '34000.00', '134000.00', 'Win', '1.50', 'Trend Following', 'Breakout', 'Tenang', 'Puas', '', 'Keren', '2025-12-23 02:29:09', '2025-12-23 02:29:09'),
(98, 16, '2025-12-24', 'XAUUSD', 'Buy', '0.01', '4000.00000', '3090.00000', '4050.00000', '4050.00000', 50, '20000.00', '154000.00', 'Win', '1.30', 'Trend Following', 'Trending', 'Tenang', 'Puas', '', 'Keren kali ini', '2025-12-24 03:07:42', '2025-12-24 03:07:42');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(110) NOT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `total` int NOT NULL,
  `status` enum('PENDING_PAYMENT','PAID','CANCELED') NOT NULL DEFAULT 'PENDING_PAYMENT',
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `snap_token` text,
  `snap_redirect_url` text,
  `payment_method` varchar(50) DEFAULT NULL,
  `plan` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `midtrans_transaction_id` varchar(100) DEFAULT NULL,
  `transaction_time` datetime DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `initialBalance` decimal(15,2) DEFAULT '0.00',
  `currentBalance` decimal(15,2) DEFAULT '0.00',
  `currency` enum('USD','IDR','CENT') COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `role_id` int DEFAULT NULL,
  `country` char(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','suspended','inactive','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `last_login` datetime DEFAULT NULL COMMENT 'Timestamp login terakhir',
  `resetOtp` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetOtpExpires` datetime DEFAULT NULL,
  `emailVerificationToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailVerificationExpires` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone_number`, `password`, `initialBalance`, `currentBalance`, `currency`, `role_id`, `country`, `status`, `last_login`, `resetOtp`, `resetOtpExpires`, `emailVerificationToken`, `emailVerificationExpires`, `created_at`, `updated_at`) VALUES
(16, 'Oswald Tan', 'oswaldpongayow@gmail.com', '0821549026917', '$2b$10$6qV7fkogeLLSORiYNn7cJO/SwDTijsGvTBLXfUHagYAIa7rSuboNe', '100000.00', '154000.00', 'IDR', 1, NULL, 'active', '2025-12-24 09:17:38', NULL, NULL, 'd08588b7760cdb0cb41a78a6134619feac6817ea01d7f9d2201dbf2945c8fc39', '2025-12-18 19:32:50', '2025-12-17 19:28:22', '2025-12-24 09:17:38'),
(17, 'Oswald Work', 'oswaldtanwork@gmail.com', NULL, '$2b$10$EqIaqOv0Evpfti5IGBXXauLHLrs/Y3SZf424it8f7xBfPevw74THO', '100.00', '110.00', 'USD', 1, NULL, 'active', '2025-12-19 07:16:52', NULL, NULL, NULL, NULL, '2025-12-19 07:12:33', '2025-12-19 07:18:25'),
(18, 'Tanlee 44', 'oswaldtanlee444@gmail.com', NULL, '$2b$10$tUnSp9oes0K0q3GVhv1nQeGT0YLGjTnC2aC51arEsCAZyxFXrK0r6', '120.00', '130.00', 'USD', 1, NULL, 'active', '2025-12-19 07:21:17', NULL, NULL, NULL, NULL, '2025-12-19 07:20:33', '2025-12-19 07:22:16'),
(19, 'Indah', 'ptdtb.dev@gmail.com', NULL, '$2b$10$Z.wVYic6JzlcEw5ygTIVCuBD.Tv8h/OI5PvqB1ka574Iu3SiMbPV6', '300.00', '305.00', 'USD', 1, NULL, 'active', '2025-12-19 07:25:00', NULL, NULL, NULL, NULL, '2025-12-19 07:23:59', '2025-12-19 07:25:44'),
(20, 'Admin', 'admin@gmail.com', '085173246048', '$2a$12$Jb98eE2cZ/nz0pg/9uUhP.F/z3xJdH6EFBGbIx5Ku4KQrFl149m5u', '0.00', '0.00', 'USD', 2, NULL, 'active', '2025-12-23 04:39:20', NULL, NULL, NULL, NULL, '2025-12-22 03:49:41', '2025-12-23 04:39:20'),
(21, 'Super Admin', 'superadmin@gmail.com', '085173246049', '$2a$12$9FbalhkhVOh.gTO20iWJWeIj9TtkCXKyLWY7VqlqFPmX1T.rcUKIy', '0.00', '0.00', 'USD', 3, NULL, 'active', '2025-12-24 03:32:28', NULL, NULL, NULL, NULL, '2025-12-23 05:21:34', '2025-12-24 03:32:28');

-- --------------------------------------------------------

--
-- Table structure for table `user_badges`
--

CREATE TABLE `user_badges` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `badgeId` int NOT NULL,
  `progress` int DEFAULT '0',
  `achievedAt` datetime DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_badges`
--

INSERT INTO `user_badges` (`id`, `userId`, `badgeId`, `progress`, `achievedAt`, `metadata`, `createdAt`, `updatedAt`) VALUES
(46, 16, 16, 2, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(47, 16, 17, 2, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(48, 16, 18, 2, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(49, 16, 19, 2, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(50, 16, 20, 2, '2025-12-24 03:07:43', '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(51, 16, 21, 2, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(52, 16, 22, 2, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(53, 16, 23, 2, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(54, 16, 24, 1, '2025-12-19 05:34:18', '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(55, 16, 25, 6, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(56, 16, 26, 6, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(57, 16, 27, 6, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(58, 16, 28, 6, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(59, 16, 29, 2, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(60, 16, 30, 2, NULL, '{}', '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(61, 17, 16, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(62, 17, 17, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(63, 17, 18, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(64, 17, 19, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(65, 17, 20, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(66, 17, 21, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(67, 17, 22, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(68, 17, 23, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(69, 17, 24, 1, '2025-12-19 07:18:01', '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(70, 17, 25, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(71, 17, 26, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(72, 17, 27, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(73, 17, 28, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(74, 17, 29, 0, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(75, 17, 30, 0, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(76, 18, 16, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(77, 18, 17, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(78, 18, 18, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(79, 18, 19, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(80, 18, 20, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(81, 18, 21, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(82, 18, 22, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(83, 18, 23, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(84, 18, 24, 1, '2025-12-19 07:22:16', '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(85, 18, 25, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(86, 18, 26, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(87, 18, 27, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(88, 18, 28, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(89, 18, 29, 0, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(90, 18, 30, 0, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(91, 19, 16, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(92, 19, 17, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(93, 19, 18, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(94, 19, 19, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(95, 19, 20, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(96, 19, 21, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(97, 19, 22, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(98, 19, 23, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(99, 19, 24, 1, '2025-12-19 07:25:45', '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(100, 19, 25, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(101, 19, 26, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(102, 19, 27, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(103, 19, 28, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(104, 19, 29, 0, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(105, 19, 30, 0, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45');

-- --------------------------------------------------------

--
-- Table structure for table `user_levels`
--

CREATE TABLE `user_levels` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `level` int DEFAULT '1',
  `experience` int DEFAULT '0',
  `totalExperience` int DEFAULT '0',
  `dailyStreak` int DEFAULT '0',
  `lastActiveDate` date DEFAULT NULL,
  `profitStreak` int DEFAULT '0',
  `lastProfitDate` date DEFAULT NULL,
  `totalTrades` int DEFAULT '0',
  `consecutiveWins` int DEFAULT '0',
  `maxConsecutiveWins` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_levels`
--

INSERT INTO `user_levels` (`id`, `userId`, `level`, `experience`, `totalExperience`, `dailyStreak`, `lastActiveDate`, `profitStreak`, `lastProfitDate`, `totalTrades`, `consecutiveWins`, `maxConsecutiveWins`, `createdAt`, `updatedAt`) VALUES
(8, 16, 3, 263, 645, 2, '2025-12-24', 2, '2025-12-24', 6, 7, 7, '2025-12-19 05:34:18', '2025-12-24 03:07:43'),
(9, 17, 2, 110, 210, 1, '2025-12-19', 1, '2025-12-19', 1, 1, 1, '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(10, 18, 2, 61, 161, 1, '2025-12-19', 1, '2025-12-19', 1, 1, 1, '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(11, 19, 2, 60, 160, 1, '2025-12-19', 1, '2025-12-19', 1, 1, 1, '2025-12-19 07:25:44', '2025-12-19 07:25:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_type` (`userId`,`type`),
  ADD KEY `achievements_user_id_type` (`userId`,`type`);

--
-- Indexes for table `badges`
--
ALTER TABLE `badges`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_calendar_user_date` (`userId`,`date`),
  ADD KEY `idx_calendar_user_type` (`userId`,`type`);

--
-- Indexes for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_currency_pair_effective` (`fromCurrency`,`toCurrency`,`effectiveFrom`),
  ADD KEY `idx_active_currency_pair` (`fromCurrency`,`toCurrency`,`isActive`),
  ADD KEY `idx_source` (`source`),
  ADD KEY `idx_effective_date_range` (`effectiveFrom`,`effectiveTo`),
  ADD KEY `idx_last_updated` (`lastUpdated`),
  ADD KEY `fk_exchange_rates_updated_by` (`updatedBy`);

--
-- Indexes for table `monthly_leaderboards`
--
ALTER TABLE `monthly_leaderboards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_period` (`userId`,`period`),
  ADD UNIQUE KEY `monthly_leaderboards_user_id_period` (`userId`,`period`),
  ADD KEY `idx_period_rank` (`period`,`rank`),
  ADD KEY `monthly_leaderboards_period_rank` (`period`,`rank`);

--
-- Indexes for table `period_leaderboards`
--
ALTER TABLE `period_leaderboards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_period` (`userId`,`periodType`,`periodValue`),
  ADD KEY `idx_period_rank` (`periodType`,`periodValue`,`rank`),
  ADD KEY `idx_period_value` (`periodValue`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_roles_role_name` (`role_name`),
  ADD UNIQUE KEY `roles_role_name` (`role_name`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`sid`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `userId` (`userId`),
  ADD KEY `fk_subscriptions_transaction` (`transactionId`);

--
-- Indexes for table `targets`
--
ALTER TABLE `targets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Indexes for table `trades`
--
ALTER TABLE `trades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_date` (`userId`,`date`),
  ADD KEY `idx_user_instrument` (`userId`,`instrument`),
  ADD KEY `trades_user_id_date` (`userId`,`date`),
  ADD KEY `trades_user_id_instrument` (`userId`,`instrument`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `fk_transactions_user` (`user_id`),
  ADD KEY `idx_transactions_status` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`),
  ADD UNIQUE KEY `email_54` (`email`),
  ADD UNIQUE KEY `email_55` (`email`),
  ADD UNIQUE KEY `email_56` (`email`),
  ADD UNIQUE KEY `email_57` (`email`),
  ADD UNIQUE KEY `email_58` (`email`),
  ADD UNIQUE KEY `email_59` (`email`),
  ADD UNIQUE KEY `email_60` (`email`),
  ADD UNIQUE KEY `email_61` (`email`),
  ADD UNIQUE KEY `email_62` (`email`),
  ADD KEY `fk_users_role` (`role_id`);

--
-- Indexes for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_badge` (`userId`,`badgeId`),
  ADD UNIQUE KEY `user_badges_user_id_badge_id` (`userId`,`badgeId`),
  ADD KEY `badgeId` (`badgeId`);

--
-- Indexes for table `user_levels`
--
ALTER TABLE `user_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `badges`
--
ALTER TABLE `badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `calendar_events`
--
ALTER TABLE `calendar_events`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `monthly_leaderboards`
--
ALTER TABLE `monthly_leaderboards`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `period_leaderboards`
--
ALTER TABLE `period_leaderboards`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=163;

--
-- AUTO_INCREMENT for table `targets`
--
ALTER TABLE `targets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `trades`
--
ALTER TABLE `trades`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `user_levels`
--
ALTER TABLE `user_levels`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD CONSTRAINT `fk_calendar_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD CONSTRAINT `fk_exchange_rates_updated_by` FOREIGN KEY (`updatedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `monthly_leaderboards`
--
ALTER TABLE `monthly_leaderboards`
  ADD CONSTRAINT `monthly_leaderboards_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `period_leaderboards`
--
ALTER TABLE `period_leaderboards`
  ADD CONSTRAINT `fk_period_leaderboards_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_subscriptions_transaction` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `targets`
--
ALTER TABLE `targets`
  ADD CONSTRAINT `targets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trades`
--
ALTER TABLE `trades`
  ADD CONSTRAINT `trades_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_107` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_badges_ibfk_108` FOREIGN KEY (`badgeId`) REFERENCES `badges` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `user_levels`
--
ALTER TABLE `user_levels`
  ADD CONSTRAINT `user_levels_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
