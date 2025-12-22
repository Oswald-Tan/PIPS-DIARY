import React, { useEffect, useState, useMemo } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  getLeaderboard,
  getAvailablePeriods,
} from "../../features/gamificationSlice";
import {
  Trophy,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  Calendar,
  Filter,
  Globe,
  Info,
  Clock,
  AlertCircle,
  Sparkles,
  Crown,
  Award,
  Star,
  Zap,
  X,
  ChevronDown,
} from "lucide-react";

const Layout = () => {
  const dispatch = useDispatch();
  const {
    leaderboard,
    isLoadingLeaderboard,
    availablePeriods,
    isLoadingPeriods,
  } = useSelector((state) => state.gamification);

  const [periodType, setPeriodType] = useState("monthly");
  const [periodValue, setPeriodValue] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showFunNotice, setShowFunNotice] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Konstanta untuk membatasi tampilan
  const MAX_TOTAL_DISPLAY = 10;

  // Helper untuk mendapatkan data leaderboard yang konsisten
  const leaderboardData = useMemo(() => {
    if (!leaderboard) return null;

    let data = null;

    if (leaderboard.success !== undefined) {
      data = leaderboard.data;
    } else if (leaderboard.data !== undefined) {
      data = leaderboard.data;
    } else {
      data = leaderboard;
    }

    // Jika ada data, buat salinan baru dan batasi jumlah leader yang ditampilkan
    if (data?.leaders && Array.isArray(data.leaders)) {
      return {
        ...data,
        leaders: data.leaders.slice(0, MAX_TOTAL_DISPLAY),
        originalTotalCount: data.totalCount || 0,
        displayedCount: Math.min(data.leaders.length, MAX_TOTAL_DISPLAY),
      };
    }

    return data;
  }, [leaderboard, MAX_TOTAL_DISPLAY]);

  // Debug log untuk melihat struktur data
  useEffect(() => {
    console.log("Leaderboard Structure:", {
      rawLeaderboard: leaderboard,
      processedData: leaderboardData,
      hasLeaders: !!leaderboardData?.leaders,
      leadersCount: leaderboardData?.leaders?.length || 0,
      totalCount: leaderboardData?.totalCount || 0,
    });
  }, [leaderboard, leaderboardData]);

  // Load available periods
  useEffect(() => {
    setIsInitialLoad(true);
    dispatch(getAvailablePeriods({ periodType })).then((action) => {
      setIsInitialLoad(false);
      if (action.payload?.data) {
        const periods = action.payload.data;
        if (Array.isArray(periods) && periods.length > 0 && !periodValue) {
          setPeriodValue(periods[0].value || periods[0]);
        }
      } else if (
        Array.isArray(action.payload) &&
        action.payload.length > 0 &&
        !periodValue
      ) {
        setPeriodValue(action.payload[0].value || action.payload[0]);
      }
    });
  }, [dispatch, periodType]);

  // Load leaderboard ketika periodValue berubah
  useEffect(() => {
    if (periodValue) {
      dispatch(
        getLeaderboard({
          periodType,
          periodValue,
          limit: 50,
          page: 1,
        })
      );
    }
  }, [dispatch, periodType, periodValue]);

  const handlePeriodTypeChange = (type) => {
    setPeriodType(type);
    setPeriodValue("");
  };

  // Helper untuk mendapatkan warna gradient berdasarkan rank
  const getRankColor = (rank) => {
    if (rank === 1) return "from-amber-400 via-yellow-400 to-orange-500";
    if (rank === 2) return "from-slate-500 via-gray-500 to-zinc-700";
    if (rank === 3) return "from-orange-500 via-amber-500 to-rose-600";
    return "from-slate-500 to-slate-700";
  };

  // Helper untuk mendapatkan warna text berdasarkan rank
  const getRankTextColor = (rank) => {
    if (rank === 1) return "text-amber-50";
    if (rank === 2) return "text-gray-100";
    if (rank === 3) return "text-orange-50";
    return "text-white";
  };

  // Helper untuk mendapatkan warna text badge rank
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return "bg-yellow-500 text-white";
    if (rank === 2) return "bg-gray-500 text-white";
    if (rank === 3) return "bg-orange-500 text-white";
    return "bg-slate-500 text-white";
  };

  // Helper untuk mendapatkan ikon berdasarkan rank
  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  // Format currency
  const formatCurrency = (amount, currency = "USD") => {
    try {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return formatter.format(amount || 0);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return `$${(amount || 0).toFixed(2)}`;
    }
  };

  // Format original currency
  const formatOriginalCurrency = (amount, currency) => {
    if (!amount) return "N/A";

    try {
      if (currency === "IDR") {
        return `Rp ${amount.toLocaleString("id-ID")}`;
      } else if (currency === "CENT") {
        return `¢${amount.toLocaleString("en-US")}`;
      } else if (currency === "USD") {
        return `$${amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`;
      } else {
        return `${amount.toLocaleString()} ${currency}`;
      }
    } catch (error) {
      console.error("Error formatting original currency:", error);
      return `${amount} ${currency}`;
    }
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <>
      {[...Array(7)].map((_, index) => (
        <div key={index} className="p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
            <div className="w-20 h-6 bg-slate-200 rounded"></div>
          </div>
        </div>
      ))}
    </>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center p-8">
      <Trophy className="w-16 h-16 mx-auto text-slate-400 mb-4" />
      <h4 className="text-lg font-bold text-slate-700 mb-2">
        No Leaderboard Data
      </h4>
      <p className="text-slate-600 max-w-md mx-auto mb-6">
        Start trading to appear on the leaderboard! Your trades will
        automatically be ranked against other traders.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="bg-violet-50 text-violet-700 px-4 py-2 rounded-lg">
          <Sparkles className="w-4 h-4 inline mr-2" />
          <span className="text-sm">Trade more to climb the ranks</span>
        </div>
        <div className="text-xs text-slate-500">Data updates in real-time</div>
      </div>
    </div>
  );

  // Render top 3 performers
  const renderTop3 = () => {
    if (!leaderboardData?.leaders || leaderboardData.leaders.length === 0) {
      return null;
    }

    // Ambil hanya 3 teratas
    const top3 = leaderboardData.leaders.slice(0, 3);

    return (
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-slate-200 relative z-30"
      >
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6 text-center">
          Top 3 {periodType.charAt(0).toUpperCase() + periodType.slice(1)}{" "}
          Performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6">
          {top3.map((leader, index) => {
            const rank = index + 1;
            const gradientClass = getRankColor(rank);
            const textColorClass = getRankTextColor(rank);
            const badgeClass = getRankBadgeColor(rank);
            const rankIcon = getRankIcon(rank);

            return (
              <Motion.div
                key={leader.userId || leader.user?.id || index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`relative ${
                  index === 1
                    ? "md:order-first"
                    : index === 0
                    ? "md:order-2"
                    : "md:order-3"
                }`}
              >
                <div
                  className={`bg-linear-to-br ${gradientClass} rounded-2xl p-4 sm:p-6 ${textColorClass} text-center relative shadow-lg`}
                >
                  {/* Rank Badge */}
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <div
                      className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-lg font-bold">{rankIcon}</span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="mt-8 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      {rank === 1 ? (
                        <Crown className="w-8 h-8 text-yellow-200" />
                      ) : rank === 2 ? (
                        <Award className="w-8 h-8 text-gray-200" />
                      ) : (
                        <Star className="w-8 h-8 text-orange-200" />
                      )}
                    </div>
                    <h4 className="font-bold text-lg truncate px-2 mb-1">
                      {leader.user?.name || `Trader ${leader.userId}`}
                    </h4>

                    {/* XP and Level Info */}
                    <div className={`${textColorClass}/90 text-sm mb-2`}>
                      Lv {leader.level || 1} •{" "}
                      {leader.totalExperience?.toLocaleString() || 0} XP
                    </div>

                    {/* Stats Row */}
                    <div className="flex justify-center gap-2 text-xs">
                      <span className="bg-white/30 px-2 py-1 rounded-full">
                        Streak: {leader.dailyStreak || 0}d
                      </span>
                      <span className="bg-white/30 px-2 py-1 rounded-full">
                        Trades: {leader.totalTradesUser?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>

                  {/* Rank Number */}
                  <div className="absolute top-3 right-3">
                    <div
                      className={`w-8 h-8 ${badgeClass} rounded-full flex items-center justify-center`}
                    >
                      <span className="text-xs font-bold">#{rank}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <div className="text-xs">USD Profit</div>
                      <div className="text-xl font-bold">
                        {formatCurrency(leader.totalProfitUSD || 0)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <div className="text-xs">Win Rate</div>
                        <div className="font-bold">
                          {(leader.winRate || 0).toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-white/20 p-2 rounded-lg">
                        <div className="text-xs">Score</div>
                        <div className="font-bold">{leader.score || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Motion.div>
            );
          })}
        </div>
      </Motion.div>
    );
  };

  // Render leaderboard list
  const renderLeaderboardList = () => {
    if (!leaderboardData?.leaders || leaderboardData.leaders.length === 0) {
      return renderEmptyState();
    }

    const showTop3Separately = leaderboardData.leaders.length > 3;
    const listLeaders = showTop3Separately
      ? leaderboardData.leaders.slice(3, MAX_TOTAL_DISPLAY)
      : [];

    if (listLeaders.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h4 className="text-lg font-bold text-slate-700 mb-2">
            Only Top {Math.min(3, leaderboardData.leaders.length)} Traders
          </h4>
          <p className="text-slate-600 max-w-md mx-auto">
            Only the top {Math.min(3, leaderboardData.leaders.length)} traders
            are on the leaderboard for this period.
            {(leaderboardData.originalTotalCount ||
              leaderboardData.totalCount ||
              0) > MAX_TOTAL_DISPLAY && (
              <span className="block mt-2 text-sm text-slate-500">
                Showing top {MAX_TOTAL_DISPLAY} of{" "}
                {leaderboardData.originalTotalCount ||
                  leaderboardData.totalCount ||
                  0}{" "}
                total traders
              </span>
            )}
          </p>
        </div>
      );
    }

    const originalTotalCount =
      leaderboardData.originalTotalCount || leaderboardData.totalCount || 0;

    return (
      <>
        {listLeaders.map((leader, index) => {
          const rank = index + 4;

          return (
            <div
              key={leader.userId || leader.user?.id || index}
              className={`p-4 transition-all hover:bg-slate-50 ${
                leader.isCurrentUser
                  ? "bg-violet-50 border-l-4 border-violet-500"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="font-bold text-slate-700">#{rank}</span>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 truncate">
                        {leader.user?.name || `Trader ${leader.userId}`}
                      </h4>
                      {leader.isCurrentUser && (
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full whitespace-nowrap shrink-0">
                          You
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        Level {leader.level || 1}
                      </span>
                      {leader.dailyStreak > 0 && (
                        <span className="text-xs text-orange-600">
                          • {leader.dailyStreak}d streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-slate-800 mb-1">
                    {formatCurrency(leader.totalProfitUSD || 0)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {(leader.winRate || 0).toFixed(1)}% win rate
                  </div>
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-500">
                {leader.totalTrades || 0} trades this period
              </div>
            </div>
          );
        })}

        {/* Indikator jika ada lebih banyak trader */}
        {originalTotalCount > MAX_TOTAL_DISPLAY && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="bg-white px-4 py-2 rounded-full border border-slate-300 shadow-sm">
                <span className="text-sm text-slate-700 font-medium">
                  Showing top {MAX_TOTAL_DISPLAY} of {originalTotalCount}{" "}
                  traders
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Only top {MAX_TOTAL_DISPLAY} traders are displayed</span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Render user rank footer
  const renderUserRank = () => {
    if (!leaderboardData?.userRank && !leaderboardData?.userEntry) {
      return null;
    }

    const userRank = leaderboardData.userRank;
    let userGradient = "";
    if (userRank === 1) userGradient = "from-yellow-500 to-orange-600";
    else if (userRank === 2) userGradient = "from-gray-500 to-gray-700";
    else if (userRank === 3) userGradient = "from-orange-500 to-orange-700";
    else userGradient = "from-violet-600 to-purple-600";

    const isInTop10 = userRank <= MAX_TOTAL_DISPLAY;
    const originalTotalCount =
      leaderboardData.originalTotalCount || leaderboardData.totalCount || 0;

    return (
      <div className={`p-4 sm:p-6 bg-linear-to-r ${userGradient}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <h4 className="font-bold text-lg">Your Position</h4>
            <p className="text-white/90">
              You are ranked #{leaderboardData.userRank} this {periodType}
              {!isInTop10 && (
                <span className="block text-white/80 text-sm mt-1">
                  (Not in top {MAX_TOTAL_DISPLAY})
                </span>
              )}
            </p>
            <p className="text-white/80 text-sm mt-1">
              Your profit in USD:{" "}
              {formatCurrency(
                leaderboardData.userEntry?.totalProfitUSD ||
                  leaderboardData.userEntry?.profitUSD ||
                  0
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              #{leaderboardData.userRank}
            </div>
            <div className="text-white/90 text-sm">
              out of {originalTotalCount}
            </div>
            {!isInTop10 && (
              <div className="text-xs text-white/70 mt-1">
                Keep trading to reach top {MAX_TOTAL_DISPLAY}!
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render disclaimer
  const renderDisclaimer = () => {
    if (!showDisclaimer) return null;

    const exchangeRates = leaderboardData?.disclaimer?.exchangeRates || [];

    return (
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-2xl p-4 relative z-30"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-blue-800">
                  {leaderboardData?.disclaimer?.title ||
                    "Currency Conversion Notice"}
                </h4>
                <p className="text-blue-700 text-sm mt-1">
                  {leaderboardData?.disclaimer?.message ||
                    "All profits are converted to USD for fair comparison. Rankings are for community engagement only and not financial advice."}
                </p>
                {exchangeRates.length > 0 && (
                  <div className="text-xs text-blue-600 mt-2">
                    <strong>Exchange Rates:</strong>
                    {exchangeRates.map((rate, idx) => (
                      <span key={idx} className="ml-2">
                        1 {rate.from} = {rate.rate.toFixed(6)} {rate.to}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Motion.div>
    );
  };

  // Render fun notice
  const renderFunNotice = () => {
    if (!showFunNotice) return null;

    return (
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-2xl p-4 relative z-30"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-amber-800">
                  For Fun & Community
                </h4>
                <p className="text-amber-700 text-sm mt-1">
                  Leaderboard rankings are based on actual user performance.
                  Displayed results are for community and entertainment purposes
                  only and should not be considered financial advice or a
                  guarantee of future outcomes.
                </p>
              </div>
              <button
                onClick={() => setShowFunNotice(false)}
                className="text-amber-600 hover:text-amber-800 text-sm flex items-center gap-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Motion.div>
    );
  };

  // Render period selector dengan dropdown yang fixed untuk mobile
  const renderPeriodSelector = () => {
    const periodOptions = [
      { id: "daily", label: "Daily", icon: <Calendar className="w-4 h-4" /> },
      { id: "weekly", label: "Weekly", icon: <Calendar className="w-4 h-4" /> },
      {
        id: "monthly",
        label: "Monthly",
        icon: <Calendar className="w-4 h-4" />,
      },
    ];

    const hasAvailablePeriods = availablePeriods && availablePeriods.length > 0;
    const isLoading = isLoadingPeriods || isInitialLoad;

    const handlePeriodSelect = (value) => {
      setPeriodValue(value);
      setIsDropdownOpen(false);
    };

    const getDisplayLabel = () => {
      if (!periodValue) {
        if (isLoading) return "Loading...";
        if (!hasAvailablePeriods) return "No periods";
        return "Select period";
      }

      const selectedPeriod = availablePeriods.find(
        (p) => (p.value || p) === periodValue
      );
      return selectedPeriod?.label || selectedPeriod || periodValue;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isDropdownOpen && !event.target.closest('.period-selector-container')) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, [isDropdownOpen]);

    return (
      <div className="period-selector-container bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-slate-200 relative z-35">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Period Type Selector */}
          <div className="w-full lg:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {periodOptions.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handlePeriodTypeChange(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full lg:w-auto ${
                    periodType === type.id
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {type.icon}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Period Value Selector - DROPDOWN IMPROVED */}
          <div className="w-full lg:w-auto">
            <div className="relative" style={{ isolation: "isolate" }}>
              {/* Custom dropdown trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                disabled={isLoading || !hasAvailablePeriods}
                className={`w-full lg:w-48 flex items-center justify-between bg-white border rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all ${
                  isLoading
                    ? "border-slate-300 bg-slate-50 cursor-not-allowed text-slate-400"
                    : !hasAvailablePeriods
                    ? "border-amber-300 bg-amber-50 cursor-not-allowed text-amber-700"
                    : "border-slate-300 hover:border-violet-400 cursor-pointer"
                }`}
              >
                <span className="truncate">{getDisplayLabel()}</span>
                <div className="ml-2 flex items-center">
                  {isLoading ? (
                    <Clock className="w-4 h-4 text-slate-400 animate-spin" />
                  ) : !hasAvailablePeriods ? (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                  )}
                </div>
              </button>

              {/* Custom dropdown menu - FIXED for mobile, ABSOLUTE for desktop */}
              {isDropdownOpen && hasAvailablePeriods && !isLoading && (
                <>
                  {/* Dropdown menu */}
                  <div 
                    className="fixed lg:absolute left-4 right-4 lg:left-auto lg:right-auto lg:w-48 mt-1 bg-white border border-slate-300 rounded-xl shadow-lg z-9999 max-h-[60vh] overflow-hidden"
                    style={{ 
                      top: 'calc(100% + 8px)',
                      transform: 'translateZ(0)',
                      willChange: 'transform, opacity'
                    }}
                  >
                    <div className="py-1 max-h-[60vh] overflow-y-auto">
                      {availablePeriods.map((period, index) => {
                        const periodValueOption = period.value || period;
                        const periodLabel = period.label || period;

                        return (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePeriodSelect(periodValueOption);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                              periodValue === periodValueOption
                                ? "bg-violet-50 text-violet-700 font-medium"
                                : "text-slate-700"
                            }`}
                          >
                            {periodLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render leaderboard status indicator
  const renderStatusIndicator = () => {
    const hasLeaders =
      leaderboardData?.leaders && leaderboardData.leaders.length > 0;
    const originalTotalCount =
      leaderboardData?.originalTotalCount || leaderboardData?.totalCount || 0;

    const displayedCount = Math.min(
      leaderboardData?.leaders?.length || 0,
      MAX_TOTAL_DISPLAY
    );

    if (isLoadingLeaderboard) {
      return (
        <div className="flex items-center justify-center gap-2 text-slate-500 py-4">
          <div className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading leaderboard data...</span>
        </div>
      );
    }

    if (!hasLeaders && periodValue) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h4 className="font-bold text-amber-700 mb-1">No Data Available</h4>
          <p className="text-amber-600 text-sm">
            There are no traders on the leaderboard for the selected period. Be
            the first to start trading!
          </p>
        </div>
      );
    }

    if (hasLeaders) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
              {periodType.charAt(0).toUpperCase() + periodType.slice(1)}{" "}
              Leaderboard
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              Showing top {displayedCount} of {originalTotalCount} traders
              {originalTotalCount > MAX_TOTAL_DISPLAY && (
                <span className="text-amber-600 ml-2">
                  (Top {MAX_TOTAL_DISPLAY} only)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Globe className="w-4 h-4" />
            <span>All profits shown in USD</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-30"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600" />
                Trading Leaderboard
              </h1>
              <p className="text-sm sm:text-sm md:text-base text-slate-600 mt-1 font-light">
                Compete fairly with normalized USD conversion • Showing top{" "}
                {MAX_TOTAL_DISPLAY} traders only
              </p>
            </div>
          </div>
        </Motion.div>

        {/* Fun Notice */}
        {renderFunNotice()}

        {/* Disclaimer */}
        {renderDisclaimer()}

        {/* Period Selector */}
        {renderPeriodSelector()}

        {/* Leaderboard Content */}
        <div className="space-y-6">
          {/* Top 3 */}
          {leaderboardData?.leaders &&
            leaderboardData.leaders.length > 0 &&
            renderTop3()}

          {/* Full Leaderboard List */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 overflow-hidden relative z-30">
            {/* Header dengan status indicator */}
            <div className="p-4 sm:p-6 border-b border-slate-200">
              {renderStatusIndicator()}

              {/* Tambahkan badge top 10 */}
              {leaderboardData?.leaders &&
                leaderboardData.leaders.length > 0 && (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full">
                        TOP {MAX_TOTAL_DISPLAY}
                      </div>
                      <span className="text-xs text-slate-500">
                        Only top {MAX_TOTAL_DISPLAY} traders are displayed
                      </span>
                    </div>
                    {(leaderboardData.originalTotalCount ||
                      leaderboardData.totalCount ||
                      0) > MAX_TOTAL_DISPLAY && (
                      <span className="text-xs text-slate-400">
                        +
                        {(leaderboardData.originalTotalCount ||
                          leaderboardData.totalCount ||
                          0) - MAX_TOTAL_DISPLAY}{" "}
                        more traders
                      </span>
                    )}
                  </div>
                )}
            </div>

            {/* Content */}
            <div className="divide-y divide-slate-200 min-h-[400px]">
              {isLoadingLeaderboard
                ? renderSkeleton()
                : renderLeaderboardList()}
            </div>

            {/* User Rank Footer */}
            {renderUserRank()}
          </div>
        </div>

        {/* Empty state untuk seluruh halaman */}
        {!isLoadingLeaderboard &&
          !isLoadingPeriods &&
          availablePeriods.length === 0 && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-linear-to-br from-slate-50 to-violet-50 rounded-3xl p-8 text-center border border-slate-200"
            >
              <div className="max-w-md mx-auto">
                <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-3">
                  Welcome to the Leaderboard!
                </h3>
                <p className="text-slate-600 mb-6">
                  The leaderboard is currently empty. Start trading and become
                  the first to appear on the rankings. Your journey to the top
                  begins with your first trade!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <Sparkles className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-700 text-sm">
                      Real-time Updates
                    </h4>
                    <p className="text-xs text-slate-500">
                      Rankings update instantly
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <Globe className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-700 text-sm">
                      Fair Comparison
                    </h4>
                    <p className="text-xs text-slate-500">All profits in USD</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <TrendingUp className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-700 text-sm">
                      Top {MAX_TOTAL_DISPLAY} Only
                    </h4>
                    <p className="text-xs text-slate-500">
                      Compete for top {MAX_TOTAL_DISPLAY} spots
                    </p>
                  </div>
                </div>
              </div>
            </Motion.div>
          )}
      </div>
    </div>
  );
};

export default Layout;