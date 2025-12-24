import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getAllBadges } from "../features/gamificationSlice";
import {
  Crown,
  Calendar,
  TrendingUp,
  Target,
  User,
  BarChart3,
  Star,
  Shield,
  Zap,
  Award,
  Flag,
  Flame,
  Lock,
  CheckCircle,
} from "lucide-react";

const BadgeCollection = () => {
  const dispatch = useDispatch();
  const { badges, isLoading } = useSelector((state) => state.gamification);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    dispatch(getAllBadges());
  }, [dispatch]);

  // DEBUG: Log data badges saat berubah
  useEffect(() => {
    if (badges.length > 0) {
      console.log("=== BADGES DATA DEBUG ===");
      console.log("Total badges:", badges.length);
      
      // Log semua badges untuk debugging
      badges.forEach(badge => {
        console.log(`Badge ${badge.id} - ${badge.name}:`, {
          progress: badge.progress,
          requirementValue: badge.requirementValue,
          typeOfValue: typeof badge.requirementValue,
          achieved: badge.achieved,
          requirement: badge.requirement,
        });
      });

      // Cek badge dengan ID 30 (Disciplined Trader)
      const badge30 = badges.find(b => b.id === 30);
      if (badge30) {
        console.log("=== DETAIL BADGE 30 ===");
        console.log("Full object:", badge30);
        console.log("Should show progress:", !badge30.achieved && badge30.progress > 0);
      }
    }
  }, [badges]);

  const getBadgeIcon = (iconName, color) => {
    const iconProps = { className: "w-6 h-6", color };

    switch (iconName) {
      case "crown":
        return <Crown {...iconProps} />;
      case "calendar":
        return <Calendar {...iconProps} />;
      case "trending-up":
        return <TrendingUp {...iconProps} />;
      case "target":
        return <Target {...iconProps} />;
      case "user":
        return <User {...iconProps} />;
      case "bar-chart3":
        return <BarChart3 {...iconProps} />;
      case "star":
        return <Star {...iconProps} />;
      case "shield":
        return <Shield {...iconProps} />;
      case "zap":
        return <Zap {...iconProps} />;
      case "award":
        return <Award {...iconProps} />;
      case "flag":
        return <Flag {...iconProps} />;
      case "flame":
        return <Flame {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "border-slate-300 bg-slate-50";
      case "rare":
        return "border-blue-300 bg-blue-50";
      case "epic":
        return "border-purple-300 bg-purple-50";
      case "legendary":
        return "border-yellow-300 bg-yellow-50";
      default:
        return "border-slate-300 bg-slate-50";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "consistency":
        return "text-orange-600 bg-orange-100";
      case "profit":
        return "text-green-600 bg-green-100";
      case "milestone":
        return "text-blue-600 bg-blue-100";
      case "achievement":
        return "text-purple-600 bg-purple-100";
      case "special":
        return "text-pink-600 bg-pink-100";
      default:
        return "text-slate-600 bg-slate-100";
    }
  };

  // **FIXED FUNCTION: Ambil requirement value dengan cara yang robust**
  const getRequirementValue = (badge) => {
    // Priority 1: Langsung dari requirementValue jika valid
    if (badge.requirementValue !== undefined && badge.requirementValue !== null) {
      const num = Number(badge.requirementValue);
      if (!isNaN(num)) {
        return num;
      }
    }
    
    // Priority 2: Jika requirementValue adalah string JSON (backward compatibility)
    if (typeof badge.requirementValue === 'string') {
      // Coba parse sebagai JSON
      if (badge.requirementValue.includes('{')) {
        try {
          const parsed = JSON.parse(badge.requirementValue);
          const val = Number(parsed.value);
          if (!isNaN(val)) return val;
        } catch (error) {
          console.warn(`Failed to parse requirementValue JSON for badge ${badge.id}:`, error);
        }
      }
      // Coba parse sebagai angka biasa
      const num = Number(badge.requirementValue);
      if (!isNaN(num)) return num;
    }
    
    // Priority 3: Dari requirement object
    if (badge.requirement && typeof badge.requirement === 'object') {
      const val = Number(badge.requirement.value);
      if (!isNaN(val)) return val;
    }
    
    // Priority 4: Dari requirement string
    if (typeof badge.requirement === 'string') {
      try {
        const parsed = JSON.parse(badge.requirement);
        const val = Number(parsed.value);
        if (!isNaN(val)) return val;
      } catch (error) {
        console.warn(`Failed to parse requirement JSON for badge ${badge.id}:`, error);
        // Coba extract dengan regex
        const match = badge.requirement.match(/"value":\s*(\d+)/);
        if (match) {
          return Number(match[1]);
        }
      }
    }
    
    // Priority 5: Fallback dari nama badge
    const name = badge.name || '';
    const numberMatch = name.match(/\d+/);
    if (numberMatch) {
      return parseInt(numberMatch[0], 10);
    }
    
    return 0; // Fallback default
  };

  // **FIXED: Filter badges dengan benar**
  const filteredBadges = badges.filter((badge) => {
    if (activeFilter === "all") return true;
    return badge.type === activeFilter;
  });

  const achievedBadges = badges.filter((badge) => badge.achieved);

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-7 h-7 text-violet-600" />
              Badge Collection
            </h3>
            <p className="text-slate-600 mt-1 font-light">
              {achievedBadges.length} of {badges.length} badges unlocked
            </p>
          </div>

          <div className="hidden lg:block text-right">
            <div className="text-sm text-slate-600 mb-1">
              {Math.round((achievedBadges.length / badges.length) * 100)}%
              Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm font-medium text-slate-700 lg:hidden">
              {Math.round((achievedBadges.length / badges.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <Motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(achievedBadges.length / badges.length) * 100}%`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-3 rounded-full bg-linear-to-r from-violet-600 to-purple-600"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "consistency", "profit", "milestone", "achievement"].map(
          (filter) => (
            <Motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                activeFilter === filter
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {filter === "all" ? "All Badges" : filter}
            </Motion.button>
          )
        )}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          // **FIXED: Hitung requirement value sekali untuk konsistensi**
          const requirementValue = getRequirementValue(badge);
          const progress = badge.progress || 0;
          const isAchieved = badge.achieved || false;
          const shouldShowProgress = progress > 0 && progress < requirementValue;
          
          // Debug log untuk badge tertentu
          if (badge.id === 30) {
            console.log(`Rendering Badge ${badge.id}:`, {
              progress,
              requirementValue,
              isAchieved,
              shouldShowProgress,
              rawValue: badge.requirementValue,
              rawType: typeof badge.requirementValue
            });
          }

          return (
            <Motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`relative rounded-2xl p-4 border-2 transition-all duration-300 ${
                isAchieved
                  ? getRarityColor(badge.rarity)
                  : "border-slate-200 bg-slate-100 opacity-60"
              }`}
            >
              {/* Badge Icon */}
              <div className="flex justify-center mb-3">
                <div
                  className={`p-3 rounded-2xl ${
                    isAchieved ? "bg-white" : "bg-slate-200"
                  }`}
                >
                  {getBadgeIcon(
                    badge.icon,
                    isAchieved ? badge.color : "#9ca3af"
                  )}
                </div>
              </div>

              {/* Badge Info */}
              <div className="text-center">
                <h4
                  className={`font-bold text-sm mb-1 ${
                    isAchieved ? "text-slate-800" : "text-slate-500"
                  }`}
                >
                  {badge.name}
                </h4>
                <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                  {badge.description}
                </p>

                {/* **FIXED: Progress Section - Tampilkan untuk semua yang memiliki progress */}
                {shouldShowProgress && (
                  <div className="mb-2">
                    <div className="w-full bg-slate-300 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-violet-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (progress / requirementValue) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {progress}/{requirementValue}
                    </div>
                  </div>
                )}

                {/* Tampilkan juga jika sudah achieved tapi ingin show progress */}
                {isAchieved && progress > 0 && !shouldShowProgress && (
                  <div className="mb-2">
                    <div className="text-xs text-green-600 font-medium">
                      ✓ Achieved ({progress}/{requirementValue})
                    </div>
                  </div>
                )}

                {/* Type Tag */}
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(
                    badge.type
                  )}`}
                >
                  {badge.type}
                </span>

                {/* Rarity Tag */}
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${
                      isAchieved
                        ? badge.rarity === "common"
                          ? "text-slate-700 bg-slate-200 border-slate-300"
                          : badge.rarity === "rare"
                          ? "text-blue-700 bg-blue-200 border-blue-300"
                          : badge.rarity === "epic"
                          ? "text-purple-700 bg-purple-200 border-purple-300"
                          : "text-yellow-700 bg-yellow-200 border-yellow-300"
                        : "text-slate-500 bg-slate-100 border-slate-200"
                    }`}
                  >
                    {badge.rarity}
                  </span>
                </div>

                {/* Achievement Status */}
                {isAchieved ? (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ) : (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>
            </Motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h4 className="text-lg font-bold text-slate-700 mb-2">
            No badges found
          </h4>
          <p className="text-slate-600">Try selecting a different filter</p>
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;