import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion as Motion } from "framer-motion";
import {
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  BarChart3,
  CreditCard,
  Shield,
  Globe,
  RefreshCw,
  TrendingDown,
  AlertCircle,
  Rocket,
  Activity,
  Calendar as CalendarIcon,
  LineChart,
  Settings,
  FileText,
} from "lucide-react";
import { API_URL } from "../../../config";

const Layout = () => {
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("today");

  const fetchDashboardData = async () => {
    try {
      const [statsRes, metricsRes] = await Promise.all([
        axios.get(`${API_URL}/admin-dashboard/stats`),
        axios.get(`${API_URL}/admin-dashboard/metrics`),
      ]);

      if (statsRes.data.success) {
        setStats({
          ...statsRes.data.data,
          timestamp: statsRes.data.timestamp,
        });
      }
      if (metricsRes.data.success) setMetrics(metricsRes.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  // StatCard Component
  const StatCard = ({ title, value, icon, color, subtitle, trend }) => {
    const getColorClass = (color) => {
      const colors = {
        violet:
          "from-violet-50 to-violet-100 border-violet-200 text-violet-800",
        emerald:
          "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800",
        rose: "from-rose-50 to-rose-100 border-rose-200 text-rose-800",
        amber: "from-amber-50 to-amber-100 border-amber-200 text-amber-800",
        blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-800",
        slate: "from-slate-50 to-slate-100 border-slate-200 text-slate-800",
      };
      return colors[color] || colors.violet;
    };

    return (
      <div
        variants={itemVariants}
        className={`bg-linear-to-br ${getColorClass(
          color
        )} backdrop-blur-sm p-6 rounded-3xl shadow-sm border hover:shadow-md transition-all duration-300`}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-slate-700">{title}</span>
          <div
            className={`p-2 rounded-full ${
              color === "violet"
                ? "bg-violet-100"
                : color === "emerald"
                ? "bg-emerald-100"
                : "bg-slate-100"
            }`}
          >
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">{value}</h3>
            {subtitle && (
              <p className="text-sm text-slate-600 font-light">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm ${
                trend > 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span className="font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800">
            Loading dashboard...
          </h3>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            Failed to load dashboard
          </h3>
          <p className="text-slate-600 mb-6">
            Unable to fetch dashboard data. Please try again.
          </p>
          <button
            onClick={handleRefresh}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-linear-to-br from-slate-50 to-white space-y-6"
    >
      {/* Header */}
      <Motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-8 h-8 text-violet-600" />
            Super Admin Dashboard
            {refreshing && (
              <span className="text-sm font-normal text-amber-600 flex items-center gap-1">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Refreshing...
              </span>
            )}
          </h1>
          <p className="text-sm sm:text-sm md:text-base text-slate-600 mt-1 font-light">
            Complete platform overview and system analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-slate-200">
            {["today", "week", "month", "year"].map((period) => (
              <button
                key={period}
                onClick={() => setActiveFilter(period)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === period
                    ? "bg-violet-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          <Motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-300"
          >
            <RefreshCw
              className={`w-5 h-5 text-slate-700 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </Motion.button>
        </div>
      </Motion.div>

      {/* Real-time System Health */}
      {metrics && (
        <Motion.div variants={itemVariants}>
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 backdrop-blur-sm p-5 rounded-3xl shadow-sm border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                System Health Monitor
              </h2>
              <span className="text-xs text-slate-500">Real-time</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    New Users
                  </span>
                  <div
                    className={`p-1 rounded-full ${
                      metrics.realTime.newUsersLastHour > 0
                        ? "bg-emerald-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <Users
                      className={`w-4 h-4 ${
                        metrics.realTime.newUsersLastHour > 0
                          ? "text-emerald-600"
                          : "text-slate-600"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-slate-800">
                    {metrics.realTime.newUsersLastHour}
                  </span>
                  <span className="text-xs text-slate-500">Last hour</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Active Sessions
                  </span>
                  <div
                    className={`p-1 rounded-full ${
                      metrics.realTime.activeSessions > 0
                        ? "bg-emerald-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <UserCheck
                      className={`w-4 h-4 ${
                        metrics.realTime.activeSessions > 0
                          ? "text-emerald-600"
                          : "text-slate-600"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-slate-800">
                    {metrics.realTime.activeSessions}
                  </span>
                  <span className="text-xs text-slate-500">
                    Currently online
                  </span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    New Trades
                  </span>
                  <div
                    className={`p-1 rounded-full ${
                      metrics.realTime.newTradesLastHour > 0
                        ? "bg-emerald-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <TrendingUp
                      className={`w-4 h-4 ${
                        metrics.realTime.newTradesLastHour > 0
                          ? "text-emerald-600"
                          : "text-slate-600"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-slate-800">
                    {metrics.realTime.newTradesLastHour}
                  </span>
                  <span className="text-xs text-slate-500">Last hour</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Pending TX
                  </span>
                  <div
                    className={`p-1 rounded-full ${
                      metrics.realTime.pendingTransactions > 0
                        ? "bg-amber-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <CreditCard
                      className={`w-4 h-4 ${
                        metrics.realTime.pendingTransactions > 0
                          ? "text-amber-600"
                          : "text-slate-600"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-slate-800">
                    {metrics.realTime.pendingTransactions}
                  </span>
                  <span className="text-xs text-slate-500">
                    Awaiting payment
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Motion.div>
      )}

      {/* Summary Stats */}
      <Motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.summary.totalUsers?.toLocaleString() || "0"}
            subtitle={`${stats.summary.totalActiveUsers || 0} active`}
            icon={<Users className="w-5 h-5 text-violet-600" />}
            color="violet"
            trend={12.5}
          />

          <StatCard
            title="Total Trades"
            value={stats.summary.totalTrades?.toLocaleString() || "0"}
            subtitle={`Avg profit: $${
              stats.summary.avgTradeProfit?.toFixed(2) || "0.00"
            }`}
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            color="emerald"
            trend={8.3}
          />

          <StatCard
            title="Total Revenue"
            value={`$${stats.summary.totalRevenue?.toLocaleString() || "0"}`}
            subtitle="From paid transactions"
            icon={<DollarSign className="w-5 h-5 text-rose-600" />}
            color="rose"
            trend={15.7}
          />

          <StatCard
            title="Engagement"
            value={`${stats.summary.platformEngagement || "0"}%`}
            subtitle="Users with trades"
            icon={<BarChart3 className="w-5 h-5 text-amber-600" />}
            color="amber"
            trend={3.2}
          />
        </div>
      </Motion.div>

      {/* Main Content Grid */}
      <Motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Users by Role */}
        <Motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-600" />
                Users by Role
              </h2>
              <span className="text-xs text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
                {stats.users.byRole?.length || 0} roles
              </span>
            </div>

            <div className="space-y-4">
              {stats.users.byRole?.map((role) => {
                const percentage =
                  (role.total / stats.summary.totalUsers) * 100;
                return (
                  <Motion.div
                    key={role.role}
                    whileHover={{ x: 5 }}
                    className="bg-linear-to-r from-slate-50 to-white p-4 rounded-2xl border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            role.role === "super_admin"
                              ? "bg-rose-100"
                              : role.role === "admin"
                              ? "bg-violet-100"
                              : role.role === "premium_user"
                              ? "bg-emerald-100"
                              : "bg-slate-100"
                          }`}
                        >
                          {role.role === "super_admin" ? (
                            <Shield className="w-4 h-4 text-rose-600" />
                          ) : role.role === "admin" ? (
                            <Settings className="w-4 h-4 text-violet-600" />
                          ) : role.role === "premium_user" ? (
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Users className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 capitalize">
                            {role.role.replace("_", " ")}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-medium">
                              {role.active} active
                            </span>
                            <span className="text-xs">•</span>
                            <span>{role.inactive} inactive</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-800">
                          {role.total}
                        </div>
                        <div className="text-sm text-slate-500">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <Motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          role.role === "super_admin"
                            ? "bg-rose-500"
                            : role.role === "admin"
                            ? "bg-violet-500"
                            : role.role === "premium_user"
                            ? "bg-emerald-500"
                            : "bg-slate-500"
                        }`}
                      />
                    </div>
                  </Motion.div>
                );
              })}
            </div>
          </div>
        </Motion.div>

        {/* Subscription Plans */}
        <Motion.div variants={itemVariants}>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-slate-200 h-full">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-violet-600" />
              Subscription Plans
            </h2>

            <div className="space-y-4">
              {stats.subscription.plans?.map((plan) => {
                const activePercentage =
                  plan.count > 0 ? (plan.active / plan.count) * 100 : 0;
                return (
                  <Motion.div
                    key={plan.plan}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-2xl border ${
                      plan.plan === "pro"
                        ? "bg-linear-to-r from-emerald-50 to-white border-emerald-200"
                        : plan.plan === "lifetime"
                        ? "bg-linear-to-r from-amber-50 to-white border-amber-200"
                        : "bg-linear-to-r from-slate-50 to-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            plan.plan === "pro"
                              ? "bg-emerald-100"
                              : plan.plan === "lifetime"
                              ? "bg-amber-100"
                              : "bg-slate-100"
                          }`}
                        >
                          <CreditCard
                            className={`w-5 h-5 ${
                              plan.plan === "pro"
                                ? "text-emerald-600"
                                : plan.plan === "lifetime"
                                ? "text-amber-600"
                                : "text-slate-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 capitalize">
                            {plan.plan}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {plan.active} active
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-800">
                          {plan.count}
                        </div>
                        <div className="text-sm text-slate-500">Total</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            plan.plan === "pro"
                              ? "bg-emerald-500"
                              : plan.plan === "lifetime"
                              ? "bg-amber-500"
                              : "bg-slate-500"
                          }`}
                        />
                        <span className="text-slate-700">Active Rate</span>
                      </div>
                      <span className="font-bold text-slate-800">
                        {activePercentage.toFixed(0)}%
                      </span>
                    </div>
                  </Motion.div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Revenue</span>
                <span className="text-lg font-bold text-emerald-600">
                  ${stats.summary.totalRevenue?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
          </div>
        </Motion.div>
      </Motion.div>

      {/* Second Row */}
      <Motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Top Performers */}
        <Motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Top Performing Traders
              </h2>
              <span className="text-xs text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
                Top 10
              </span>
            </div>

            <div className="space-y-3">
              {stats.gamification.topPerformers
                ?.slice(0, 5)
                .map((user, index) => (
                  <Motion.div
                    key={user.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="
          flex flex-col gap-4
          sm:flex-row sm:items-center sm:justify-between
          p-4 bg-linear-to-r from-slate-50 to-white
          rounded-2xl border border-slate-200
          hover:shadow-sm transition-all
        "
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                          index === 0
                            ? "bg-amber-100 text-amber-600"
                            : index === 1
                            ? "bg-slate-100 text-slate-600"
                            : index === 2
                            ? "bg-rose-100 text-rose-600"
                            : "bg-violet-100 text-violet-600"
                        }`}
                      >
                        {index < 3 ? (
                          <span className="font-bold text-base sm:text-lg">
                            #{index + 1}
                          </span>
                        ) : (
                          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 truncate">
                          {user.name}
                        </h4>
                        <p className="text-sm text-slate-600 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex justify-between items-center sm:block sm:text-right">
                      <div
                        className={`text-base sm:text-lg font-bold ${
                          user.totalProfitUSD >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        ${user.totalProfitUSD?.toFixed(2) || "0.00"}
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 sm:justify-end">
                        <span>{user.totalTrades} trades</span>
                        <span className="hidden sm:inline text-xs">•</span>
                        <span>{user.avgWinRate?.toFixed(1) || "0"}% win</span>
                      </div>
                    </div>
                  </Motion.div>
                ))}
            </div>

            {stats.gamification.topPerformers?.length > 5 && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 pt-6 border-t border-slate-200"
              >
                <div className="flex items-center justify-center">
                  <span className="text-sm text-slate-500">
                    +{stats.gamification.topPerformers.length - 5} more traders
                  </span>
                </div>
              </Motion.div>
            )}
          </div>
        </Motion.div>

        {/* Quick Stats */}
        <Motion.div variants={itemVariants}>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-slate-200 h-full">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-violet-600" />
              Platform Stats
            </h2>

            <div className="space-y-4">
              {/* Countries */}
              <div className="bg-linear-to-r from-violet-50 to-white p-4 rounded-2xl border border-violet-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-violet-600" />
                    <span className="font-medium text-slate-800">
                      Top Countries
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {stats.users.byCountry
                      ?.slice(0, 3)
                      .map((c) => c.country)
                      .join(", ")}
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {stats.users.byCountry?.length || 0}
                </div>
              </div>

              {/* Trading Instruments */}
              <div className="bg-linear-to-r from-emerald-50 to-white p-4 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-slate-800">
                      Top Instruments
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {stats.trading.topInstruments
                      ?.slice(0, 2)
                      .map((i) => i.instrument)
                      .join(", ")}
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {stats.trading.topInstruments?.length || 0}
                </div>
              </div>

              {/* Exchange Rates */}
              <div className="bg-linear-to-r from-blue-50 to-white p-4 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-800">
                      Exchange Rates
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {stats.exchangeRates.latest
                      ?.slice(0, 2)
                      .map((r) => r.fromCurrency)
                      .join(", ")}
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {stats.exchangeRates.stats?.reduce(
                    (sum, s) => sum + (s.active || 0),
                    0
                  ) || 0}{" "}
                  active
                </div>
              </div>

              {/* Transactions */}
              <div className="bg-linear-to-r from-rose-50 to-white p-4 rounded-2xl border border-rose-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span className="font-medium text-slate-800">
                      Transactions
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">Last month</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {stats.subscription.transactionStatus?.reduce(
                    (sum, t) => sum + (t.count || 0),
                    0
                  ) || 0}
                </div>
              </div>
            </div>
          </div>
        </Motion.div>
      </Motion.div>

      {/* System Info Banner */}
      <Motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        className="bg-linear-to-r from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-6 shadow-md border-2 border-violet-300"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Rocket className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">System Overview</h3>
              <p className="text-violet-100/90 font-light">
                Monitoring {stats.summary.totalUsers || 0} users,{" "}
                {stats.summary.totalTrades || 0} trades, and $
                {stats.summary.totalRevenue || 0} in revenue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold">
                {new Date().getFullYear()}
              </div>
              <div className="text-sm text-violet-100/80">Version 2.0</div>
            </div>
            <div className="h-12 w-px bg-white/30"></div>
            <div>
              <div className="text-sm text-violet-100/80">Last updated</div>
              <div className="font-medium">
                {stats.timestamp
                  ? new Date(stats.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </Motion.div>

      {/* Footer */}
      <Motion.div
        variants={itemVariants}
        className="pt-6 border-t border-slate-200"
      >
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <span>Super Admin Dashboard v2.0</span>
          </div>
          <div className="mt-2 md:mt-0">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              System Status:{" "}
              <span className="text-emerald-600 font-medium">Operational</span>
            </span>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default Layout;