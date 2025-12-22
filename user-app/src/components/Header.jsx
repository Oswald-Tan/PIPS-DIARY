import { motion as Motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { HiMenuAlt2 } from "react-icons/hi";
import { formatBalance } from "../utils/currencyFormatter";
import GradientLogo from "../assets/gradient_logo.png";
import { LogOut, reset } from "../features/authSlice";
import Swal from "sweetalert2";
import { useSubscription } from "../hooks/useSubscription";
import { useSidebar } from "../context/useSidebar";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Icon untuk plan
import { Crown, Rocket, Target, Star, Zap } from "lucide-react";

const Header = ({
  stats,
  target,
  targetProgress,
  user,
  onShowBalanceModal,
  onShowTargetModal,
  onShowUpgradeModal,
  onProfileSettings,
  subscription: propsSubscription,
  currentPlan: propsCurrentPlan,
  showUserMenu,
  setShowUserMenu,
}) => {
  const { currency } = useSelector((state) => state.balance);
  const dispatch = useDispatch();
  const { toggleSidebar } = useSidebar();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Gunakan useSubscription hook
  const { subscription: reduxSubscription, isLoading: subscriptionLoading } =
    useSubscription(true);

  // Gabungkan subscription dari props dan Redux store
  const actualSubscription = reduxSubscription || {
    plan: "free",
    isActive: true,
  };

  // Tentukan currentPlan berdasarkan subscription
  const currentPlan = propsCurrentPlan || {
    name: actualSubscription.plan
      ? actualSubscription.plan.charAt(0).toUpperCase() +
        actualSubscription.plan.slice(1)
      : "Free",
  };

  // Plan badges configuration
  const planBadges = {
    free: {
      text: "Free",
      color: "bg-gray-100 text-gray-800",
      icon: Target,
      iconColor: "text-gray-600",
    },
    pro: {
      text: "Pro",
      color: "bg-violet-100 text-violet-800",
      icon: Rocket,
      iconColor: "text-violet-600",
    },
    lifetime: {
      text: "Lifetime",
      color: "bg-amber-100 text-amber-800",
      icon: Crown,
      iconColor: "text-amber-600",
    },
  };

  const planBadge = planBadges[actualSubscription.plan] || planBadges.free;
  const PlanIcon = planBadge.icon;

  // Get button text untuk dropdown menu berdasarkan plan
  const getDropdownButtonText = () => {
    if (actualSubscription.plan === "free") {
      return "Upgrade Plan";
    } else if (actualSubscription.plan === "pro") {
      return "Change Plan";
    } else {
      return "View Plan Details";
    }
  };

  // Get button icon untuk dropdown menu
  const getDropdownButtonIcon = () => {
    if (actualSubscription.plan === "free") {
      return <Zap className="w-4 h-4" />;
    } else if (actualSubscription.plan === "pro") {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      );
    } else {
      return <Star className="w-4 h-4" />;
    }
  };

  // Handle click outside untuk menutup dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowUserMenu]);

  const handleLogout = async () => {
    Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#f97316",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(LogOut());
        dispatch(reset());
        navigate("/");
      }
    });
  };

  // FIX: Safe check untuk targetProgress
  const safeTargetProgress = targetProgress || {
    progress: 0,
    daysLeft: 0,
    neededDaily: 0,
    achieved: 0,
    daysPassed: 0,
    onTrack: false
  };

  // FIX: Format progress dengan safe check
  const displayProgress = () => {
    if (!targetProgress || targetProgress.progress === undefined || targetProgress.progress === null) {
      return "0.0";
    }
    return targetProgress.progress.toFixed(1);
  };

  // Tampilkan loading jika subscription masih loading
  if (subscriptionLoading && !propsSubscription) {
    return (
      <div className="sticky top-0 z-50">
        <header className="bg-white">
          <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold bg-linear-to-r from-violet-600 to-purple-700 bg-clip-text text-transparent flex items-center gap-2">
                  <img src={GradientLogo} alt="Logo" className="w-10" />
                  Pips Diary
                </div>
              </div>
              <div className="animate-pulse bg-violet-200 h-8 w-24 rounded-xl"></div>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50">
      {/* TOP HEADER - Toggle Sidebar, Balance, Target Progress, Upgrade, Profile */}
      <header className="bg-white">
        <div className="">
          <div className="flex justify-between items-center h-16">
            {/* Toggle Sidebar */}
            <button
              className="cursor-pointer text-violet-900"
              onClick={toggleSidebar}
              aria-label="Toggle Sidebar"
            >
              <HiMenuAlt2 size={26} />
            </button>

            {/* Desktop Quick Stats & Actions */}
            <div className="flex items-center space-x-6">
              {/* Balance Display */}
              <Motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={onShowBalanceModal}
                className="cursor-pointer text-right"
              >
                <div className="text-xs text-violet-700 font-bold">Balance</div>
                <div className="font-bold text-violet-900 md:text-lg text-md">
                  {formatBalance(stats.currentBalance, currency)}
                </div>
              </Motion.div>

              {/* Upgrade/Change Plan Button - HANYA tampil untuk Free plan di header */}
              {actualSubscription.plan === "free" && (
                <Motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onShowUpgradeModal}
                  className="hidden md:block cursor-pointer px-5 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-bold border-2 bg-linear-to-r from-violet-500 to-purple-500 text-white border-violet-400/50"
                >
                  Upgrade
                </Motion.button>
              )}

              {/* User Profile Dropdown */}
              <div className="relative user-menu-container" ref={dropdownRef}>
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-violet-500 to-purple-500 text-white hover:shadow-lg transition-all duration-200 border-2 border-violet-400/50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Motion.button>

                {/* User Menu Popup */}
                <AnimatePresence>
                  {showUserMenu && (
                    <Motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-violet-200 overflow-hidden z-50"
                    >
                      {/* User Info Header */}
                      <div className="p-4 border-b border-violet-200 bg-linear-to-r from-violet-50 to-purple-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-violet-900 truncate">
                              {user?.name || "User"}
                            </p>
                            <p className="text-xs text-violet-700 truncate">
                              {user?.email || "user@example.com"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2 space-y-1">
                        {/* Profile Menu */}
                        <Motion.button
                          whileHover={{
                            x: 5,
                            backgroundColor: "rgba(128, 0, 128, 0.1)",
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm text-violet-900 hover:text-violet-700 transition-all duration-200 flex items-center space-x-3"
                          onClick={() => {
                            onProfileSettings();
                            setShowUserMenu(false);
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>Profile Settings</span>
                        </Motion.button>

                        {/* Balance Info in Menu */}
                        <div className="px-4 py-3 rounded-xl bg-linear-to-r from-violet-50 to-purple-100 border border-violet-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-violet-800">
                              Current Balance
                            </span>
                            <span className="text-xs font-bold text-violet-900 bg-violet-200 px-2 py-1 rounded-full">
                              {formatBalance(
                                stats.currentBalance,
                                currency
                              )}
                            </span>
                          </div>
                          <div className="text-xs text-violet-600">
                            Initial:{" "}
                            {formatBalance(
                              stats.initialBalance,
                              currency
                            )}
                          </div>
                        </div>

                        {/* Plan Info Detail */}
                        <div className="px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full ${planBadge.color} flex items-center justify-center`}
                              >
                                <PlanIcon
                                  className={`w-3 h-3 ${planBadge.iconColor}`}
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-700">
                                {currentPlan.name} Plan
                              </span>
                            </div>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full ${planBadge.color}`}
                            >
                              {actualSubscription.isActive
                                ? "AKTIF"
                                : "NON-AKTIF"}
                            </span>
                          </div>

                          {actualSubscription.plan === "pro" &&
                          actualSubscription.expiresAt ? (
                            <div className="text-xs text-gray-600">
                              Expires:{" "}
                              {new Date(
                                actualSubscription.expiresAt
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          ) : actualSubscription.plan === "lifetime" ? (
                            <div className="text-xs text-amber-600 font-semibold">
                              ⭐ Lifetime Access
                            </div>
                          ) : (
                            <div className="text-xs text-gray-600">
                              Upgrade untuk fitur premium
                            </div>
                          )}
                        </div>

                        {/* Upgrade/Change/View Plan Button in Menu - TAMPIL untuk SEMUA plan */}
                        <Motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-4 py-3 rounded-xl bg-linear-to-r from-violet-500 to-purple-500 text-white text-sm font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                          onClick={() => {
                            onShowUpgradeModal();
                            setShowUserMenu(false);
                          }}
                        >
                          {getDropdownButtonIcon()}
                          <span>{getDropdownButtonText()}</span>
                        </Motion.button>

                        {/* Update Balance Button */}
                        <Motion.button
                          whileHover={{
                            x: 5,
                            backgroundColor: "rgba(34, 197, 94, 0.1)",
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm text-emerald-600 hover:text-emerald-700 transition-all duration-200 flex items-center space-x-3"
                          onClick={() => {
                            onShowBalanceModal();
                            setShowUserMenu(false);
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Update Balance</span>
                        </Motion.button>

                        {/* Update Target Button */}
                        {target?.enabled && (
                          <Motion.button
                            whileHover={{
                              x: 5,
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm text-blue-600 hover:text-blue-700 transition-all duration-200 flex items-center space-x-3"
                            onClick={() => {
                              onShowTargetModal();
                              setShowUserMenu(false);
                            }}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            <span>Update Target</span>
                          </Motion.button>
                        )}

                        {/* Transaction History Button */}
                        <Motion.button
                          whileHover={{
                            x: 5,
                            backgroundColor: "rgba(128, 0, 128, 0.1)",
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm text-violet-900 hover:text-violet-700 transition-all duration-200 flex items-center space-x-3"
                          onClick={() => {
                            navigate("/transactions");
                            setShowUserMenu(false);
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span>Transaction History</span>
                        </Motion.button>

                        {/* Subscription Details Button */}
                        <Motion.button
                          whileHover={{
                            x: 5,
                            backgroundColor: "rgba(34, 197, 94, 0.1)",
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm text-emerald-600 hover:text-emerald-700 transition-all duration-200 flex items-center space-x-3"
                          onClick={() => {
                            navigate("/subscription/details");
                            setShowUserMenu(false);
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Subscription Details</span>
                        </Motion.button>

                        {/* Divider */}
                        <div className="border-t border-violet-200 my-2"></div>

                        {/* Logout Button */}
                        <Motion.button
                          whileHover={{
                            x: 5,
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-600 hover:text-red-700 transition-all duration-200 flex items-center space-x-3"
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span>Logout</span>
                        </Motion.button>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;