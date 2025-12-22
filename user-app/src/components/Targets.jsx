import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { getTargetProgress } from "../features/targetSlice";
import { formatCurrency, formatBalance } from "../utils/currencyFormatter";
import TargetProgressBanner from "../components/TargetProgressBanner";
import UpgradeRequiredModal from "../components/modals/UpgradeRequiredModal";
import {
  Target,
  TrendingUp,
  BarChart3,
  Trophy,
  Wallet,
  DollarSign,
  TrendingDown,
  Award,
  Zap,
  Plus,
  Edit,
} from "lucide-react";

const StatCard = ({ label, value, color, bg, border, icon }) => (
  <Motion.div
    whileHover={{ scale: 1.03, y: -2 }}
    className={`p-5 rounded-2xl border-2 ${border} ${bg} shadow-sm hover:shadow-sm transition-all duration-300`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-slate-700 font-medium">{label}</div>
      <div className={`${color}`}>{icon}</div>
    </div>
    <div className={`text-xl md:text-2xl font-bold ${color}`}>{value}</div>
  </Motion.div>
);

const MilestoneCard = ({ milestone, currentBalance, currency }) => (
  <Motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className={`p-5 rounded-2xl border-2 shadow-sm ${
      milestone.achieved
        ? "border-emerald-200 bg-linear-to-br from-emerald-100 to-green-100"
        : "border-slate-200 bg-white/80 backdrop-blur-sm"
    }`}
  >
    <div className="flex justify-between items-center mb-3">
      <span
        className={`font-bold text-sm ${
          milestone.achieved ? "text-emerald-800" : "text-slate-800"
        }`}
      >
        {milestone.label}
      </span>
      {milestone.achieved && (
        <Motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1"
        >
          <Award className="w-3 h-3" />
          ACHIEVED
        </Motion.span>
      )}
    </div>
    <div className="text-sm text-slate-700 font-medium mb-3">
      Target: {formatBalance(milestone.target, currency)}
    </div>
    <div className="mt-2 w-full bg-slate-200 rounded-full h-3 border border-slate-300">
      <Motion.div
        initial={{ width: 0 }}
        animate={{
          width: `${Math.min(100, (currentBalance / milestone.target) * 100)}%`,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${
          milestone.achieved
            ? "bg-emerald-500 shadow-sm"
            : "bg-violet-500 shadow-sm"
        }`}
      ></Motion.div>
    </div>
    <div
      className={`text-xs font-bold mt-2 ${
        milestone.achieved ? "text-emerald-600" : "text-violet-600"
      }`}
    >
      {Math.round((currentBalance / milestone.target) * 100)}% Complete
    </div>
  </Motion.div>
);

const Targets = ({ onShowTargetModal = () => {} }) => {
  const dispatch = useDispatch();
  const { target, targetProgress, isLoading } = useSelector(
    (state) => state.target
  );
  const { initialBalance, currentBalance, currency } = useSelector(
    (state) => state.balance
  );
  const stats = useSelector((state) => state.trades.stats) || {};

  const [showUpgradeRequiredModal, setShowUpgradeRequiredModal] =
    useState(false);

  // Tambahkan subscription dari Redux store
  const { subscription } = useSelector((state) => state.subscription);

  const canAccessTargets = () => {
    return subscription && subscription.plan !== 'free';
  };

  // Cek apakah user memiliki plan yang memungkinkan untuk set target
  const canSetTarget = () => {
    // Plan yang diizinkan: pro, lifetime, atau jika tidak ada subscription (default ke free)
    const allowedPlans = ["pro", "lifetime"];
    return subscription && allowedPlans.includes(subscription.plan);
  };

  const handleSetTarget = () => {
    console.log("handleSetTarget called - current balance:", currentBalance);

    // Cek apakah user memiliki plan yang memungkinkan untuk set target
    if (!canSetTarget()) {
      console.log("User needs to upgrade to set target");

      // Tampilkan modal upgrade
      setShowUpgradeRequiredModal(true);
      return;
    }

    // Jika plan sudah premium, tampilkan modal target
    onShowTargetModal();
  };

  useEffect(() => {
    console.log("Targets useEffect triggered", {
      enabled: target.enabled,
      isLoading,
      hasTargetProgress: !!targetProgress,
    });

    if (target.enabled && !isLoading && !targetProgress) {
      console.log("Dispatching getTargetProgress");
      dispatch(getTargetProgress());
    }
  }, [dispatch, target.enabled, isLoading, targetProgress]);

  const targetData = useMemo(() => {
    if (!target || !target.enabled) return [];

    if (target.useDailyTarget) {
      return [
        { period: "Start", balance: initialBalance, target: initialBalance },
        {
          period: "Current",
          balance: currentBalance,
          target: initialBalance + (target.dailyTargetAmount || 0),
        },
        {
          period: "Daily Target",
          balance: initialBalance + (target.dailyTargetAmount || 0),
          target: initialBalance + (target.dailyTargetAmount || 0),
        },
      ];
    } else {
      return [
        {
          period: "Start",
          balance: initialBalance,
          target: target.targetBalance,
        },
        {
          period: "Current",
          balance: currentBalance,
          target: target.targetBalance,
        },
        {
          period: "Target",
          balance: target.targetBalance,
          target: target.targetBalance,
        },
      ];
    }
  }, [initialBalance, currentBalance, target]);

  const milestones = useMemo(
    () => [
      {
        label: "10% Profit",
        target: Math.round(initialBalance * 1.1 * 100) / 100,
        achieved: currentBalance >= initialBalance * 1.1,
      },
      {
        label: "25% Profit",
        target: Math.round(initialBalance * 1.25 * 100) / 100,
        achieved: currentBalance >= initialBalance * 1.25,
      },
      {
        label: "50% Profit",
        target: Math.round(initialBalance * 1.5 * 100) / 100,
        achieved: currentBalance >= initialBalance * 1.5,
      },
      {
        label: "100% Profit (2x)",
        target: Math.round(initialBalance * 2 * 100) / 100,
        achieved: currentBalance >= initialBalance * 2,
      },
      {
        label: "200% Profit (3x)",
        target: Math.round(initialBalance * 3 * 100) / 100,
        achieved: currentBalance >= initialBalance * 3,
      },
    ],
    [initialBalance, currentBalance]
  );

  const renderTooltipContent = (value, name) => {
    if (name === "balance" || name === "target") {
      return [
        formatCurrency(value, currency),
        name === "balance" ? "Balance" : "Target",
      ];
    }
    return [value, name];
  };

  const performanceMetrics = [
    {
      label: "Current Balance",
      value: formatBalance(currentBalance, currency),
      color: "text-violet-700",
      bg: "bg-linear-to-br from-violet-50 via-violet-100 to-purple-50",
      border: "border border-violet-200/70",
      icon: <Wallet className="w-6 h-6" />,
    },
    {
      label: "Net Profit",
      value: formatBalance(stats.netProfit || 0, currency),
      color: (stats.netProfit || 0) >= 0 ? "text-emerald-600" : "text-rose-600",
      bg:
        (stats.netProfit || 0) >= 0
          ? "bg-linear-to-br from-violet-50 via-emerald-50 to-violet-100"
          : "bg-linear-to-br from-violet-50 via-rose-50 to-violet-100",
      border:
        (stats.netProfit || 0) >= 0
          ? "border border-emerald-200/70"
          : "border border-rose-200/70",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      label: "Win Rate",
      value: `${stats.winRate || 0}%`,
      color: "text-violet-600",
      bg: "bg-linear-to-br from-violet-50 via-purple-50 to-violet-100",
      border: "border border-violet-200/70",
      icon: <Target className="w-6 h-6" />,
    },
    {
      label: "Total Trades",
      value: stats.totalTrades || 0,
      color: "text-violet-700",
      bg: "bg-linear-to-br from-violet-50 via-amber-50 to-violet-100",
      border: "border border-amber-200/70",
      icon: <BarChart3 className="w-6 h-6" />,
    },
  ];

  if (isLoading && !targetProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col space-y-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-500"></div>
        <p className="text-slate-700 font-medium">Loading target progress...</p>
      </div>
    );
  }

  return (
    <>
      {/* Modal Upgrade */}
      {showUpgradeRequiredModal && (
        <UpgradeRequiredModal
          setShowUpgradeModal={setShowUpgradeRequiredModal}
          featureKey="targets"
          featureName="Trading Targets"
          customDescription="Set custom trading targets and track your progress with visual charts. This premium feature helps you stay motivated and achieve your financial goals."
        />
      )}

      {!target.enabled ? (
        <div className="space-y-6 min-h-screen">
          {/* Header */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
          >
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-8 h-8 text-violet-600" />
                Trading Targets
              </h1>
              <p className="text-sm sm:text-sm md:text-base text-slate-600 mt-1 font-light">
                Set and track your trading goals
              </p>
            </div>
          </Motion.div>

          {/* Empty State */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm p-12 text-center border border-slate-100"
          >
            <div className="max-w-md mx-auto">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mb-4"
              >
                {canSetTarget() ? (
                  <Target className="w-16 h-16 mx-auto text-violet-600" />
                ) : (
                  <div className="relative">
                    <Target className="w-16 h-16 mx-auto text-slate-400" />
                  </div>
                )}
              </Motion.div>

              {canSetTarget() ? (
                <>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    No Target Set
                  </h3>
                  <p className="text-slate-600 mb-6 font-light">
                    Set a trading target to track your progress and stay
                    motivated towards your financial goals. You can set targets
                    even without any trades.
                  </p>
                  <Motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSetTarget}
                    className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-sm font-medium flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Set Your First Target
                  </Motion.button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Premium Feature
                  </h3>
                  <div className="text-slate-600 mb-6 font-light space-y-3">
                    <p>
                      Setting trading targets is available in our premium plans.
                    </p>
                  </div>
                  <Motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSetTarget}
                    className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-sm font-medium flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Upgrade to Set Target
                  </Motion.button>
                </>
              )}
            </div>
          </Motion.div>

          {/* Quick Stats */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {performanceMetrics.map((metric) => (
              <StatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                color={metric.color}
                bg={metric.bg}
                border={metric.border}
                icon={metric.icon}
              />
            ))}
          </Motion.div>
        </div>
      ) : (
        <div className="space-y-6 min-h-screen">
          {/* Header */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-8 h-8 text-violet-600" />
                Trading Targets
              </h1>
              <p className="text-slate-600 mt-1 font-light">
                Track your progress towards your trading goals
              </p>
            </div>

            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSetTarget}
              className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-sm font-medium flex items-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Edit Target
            </Motion.button>
          </Motion.div>

          {/* Main Target Progress */}
          {target?.enabled &&
          targetProgress &&
          targetProgress.progress !== undefined ? (
            <TargetProgressBanner
              target={target}
              targetProgress={targetProgress}
              currency={currency}
              initialBalance={initialBalance}
              size="large"
            />
          ) : target?.enabled ? (
            <div className="p-6 rounded-3xl shadow-sm border bg-slate-100">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600"></div>
                <span className="text-sm text-slate-700">
                  Loading target progress...
                </span>
              </div>
            </div>
          ) : null}

          {/* Progress Chart and Stats */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Progress Chart */}
            {target.enabled && targetData.length > 0 && (
              <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                  Target Progress
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={targetData}
                      margin={{ left: 0, right: 20, top: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="period"
                        stroke="#475569"
                        tick={{ fontSize: 12, fontWeight: 600 }}
                      />
                      <YAxis
                        stroke="#475569"
                        width={70}
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) =>
                          formatBalance(value, currency)
                        }
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        labelFormatter={(label) => `Period: ${label}`}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "2px solid #8b5cf6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          backgroundColor: "#fafafa",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#8b5cf6"
                        strokeWidth={4}
                        dot={{
                          r: 8,
                          stroke: "#7c3aed",
                          strokeWidth: 2,
                          fill: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#ec4899"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-600" />
                  Performance
                </h3>
                <div className="space-y-3">
                  <Motion.div
                    whileHover={{ x: 5 }}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <span className="text-slate-700 font-medium">
                      Current Status
                    </span>
                    <span
                      className={`font-bold px-3 py-1 rounded-full text-sm ${
                        targetProgress?.onTrack
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {targetProgress?.onTrack ? "✓ On Track" : "⚠ Behind"}
                    </span>
                  </Motion.div>
                  <Motion.div
                    whileHover={{ x: 5 }}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <span className="text-slate-700 font-medium">
                      Required Daily
                    </span>
                    <span className="font-bold text-violet-600">
                      {formatBalance(
                        Math.round(targetProgress?.neededDaily || 0),
                        currency
                      )}
                    </span>
                  </Motion.div>
                  <Motion.div
                    whileHover={{ x: 5 }}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <span className="text-slate-700 font-medium">
                      Daily Average
                    </span>
                    <span className="font-bold text-violet-600">
                      {formatBalance(
                        Math.round(
                          (targetProgress?.achieved || 0) /
                            Math.max(1, targetProgress?.daysPassed || 1)
                        ),
                        currency
                      )}
                    </span>
                  </Motion.div>
                  {!target.useDailyTarget && (
                    <Motion.div
                      whileHover={{ x: 5 }}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <span className="text-slate-700 font-medium">
                        Target Date
                      </span>
                      <span className="font-bold text-slate-800">
                        {target.targetDate}
                      </span>
                    </Motion.div>
                  )}
                </div>
              </div>
            </div>
          </Motion.div>

          {/* Milestones */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b-2 border-slate-200 bg-linear-to-r from-slate-50 to-violet-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-violet-600" />
                Progress Milestones
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {milestones.map((milestone, index) => (
                  <MilestoneCard
                    key={index}
                    milestone={milestone}
                    currentBalance={currentBalance}
                    currency={currency}
                  />
                ))}
              </div>
            </div>
          </Motion.div>

          {/* Additional Stats */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              label="Initial Balance"
              value={formatBalance(initialBalance, currency)}
              color="text-slate-800"
              bg="bg-linear-to-br from-slate-100 to-slate-50"
              border="border-slate-200"
              icon={<Wallet className="w-6 h-6" />}
            />
            <StatCard
              label="Current Balance"
              value={formatBalance(currentBalance, currency)}
              color="text-violet-700"
              bg="bg-linear-to-br from-violet-100 to-purple-100"
              border="border-violet-200"
              icon={<DollarSign className="w-6 h-6" />}
            />
            <StatCard
              label="Profit/Loss"
              value={formatBalance(stats.netProfit || 0, currency)}
              color={
                (stats.netProfit || 0) >= 0
                  ? "text-emerald-700"
                  : "text-rose-700"
              }
              bg={
                (stats.netProfit || 0) >= 0
                  ? "bg-linear-to-br from-emerald-100 to-green-100"
                  : "bg-linear-to-br from-rose-100 to-red-100"
              }
              border={
                (stats.netProfit || 0) >= 0
                  ? "border-emerald-200"
                  : "border-rose-200"
              }
              icon={
                (stats.netProfit || 0) >= 0 ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )
              }
            />
            <StatCard
              label="ROI"
              value={`${stats.roi || 0}%`}
              color={
                Number(stats.roi || 0) >= 0
                  ? "text-emerald-700"
                  : "text-rose-700"
              }
              bg={
                Number(stats.roi || 0) >= 0
                  ? "bg-linear-to-br from-emerald-100 to-green-100"
                  : "bg-linear-to-br from-rose-100 to-red-100"
              }
              border={
                Number(stats.roi || 0) >= 0
                  ? "border-emerald-200"
                  : "border-rose-200"
              }
              icon={<Zap className="w-6 h-6" />}
            />
          </Motion.div>
        </div>
      )}
    </>
  );
};

export default Targets;
