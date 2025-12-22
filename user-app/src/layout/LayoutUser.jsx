import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Outlet } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

// Components
import SidebarUser from "../components/SidebarUser";
import { useSidebar } from "../context/useSidebar";
import Header from "../components/Header";

// Features
import { getBalance } from "../features/balanceSlice";
import { getTarget, getTargetProgress } from "../features/targetSlice";
import { useSubscription } from "../hooks/useSubscription";

// Modals
import BalanceModal from "../components/modals/BalanceModal";
import TargetModal from "../components/modals/TargetModal";

// Custom hooks and utilities
import { useLayoutData } from "../hooks/useLayoutData";
import { initializeStorage } from "../utils/storageUtils";
import { getTrades } from "../features/tradeSlice";

const currentYear = new Date().getFullYear();

const LayoutUser = () => {
  // Initialize storage
  const { getEntries, getSubscription, saveEntries, saveSubscription } =
    initializeStorage();

  // State declarations
  const [entries, setEntries] = useState(getEntries);
  const [subscription, setSubscription] = useState(getSubscription);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // PERBAIKAN: Gunakan useRef untuk melacak apakah effect sudah dijalankan
  const effectRun = useRef(false);
  const subscriptionUpdatePending = useRef(false);

  // Custom hooks
  const { open } = useSidebar();
  const {
    user,
    target,
    targetProgress,
    targetLoading,
    initialBalance,
    currentBalance,
    balanceLoading,
    stats,
    subscriptionPlans,
  } = useLayoutData();

  const { subscription: reduxSubscription, isLoading: subscriptionLoading } =
    useSubscription(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get active tab from route
  const activeTab = useMemo(() => {
    if (location.pathname.includes("/trades")) return "trades";
    if (location.pathname.includes("/calculator")) return "calculator";
    if (location.pathname.includes("/analytics")) return "analytics";
    if (location.pathname.includes("/performance")) return "performance";
    if (location.pathname.includes("/targets")) return "targets";
    if (location.pathname.includes("/calculator")) return "calculator";
    if (location.pathname.includes("/calendar")) return "calendar";
    if (location.pathname.includes("/upgrade")) return "upgrade";
    if (location.pathname.includes("/education")) return "education";
    if (location.pathname.includes("/gamification")) return "gamification";
    if (location.pathname.includes("/leaderboard")) return "leaderboard";
    return "dashboard";
  }, [location.pathname]);

  // Load data dari backend
  useEffect(() => {
    const loadData = async () => {
      if (user && !dataLoaded) {
        try {
          await Promise.all([
            dispatch(getBalance()).unwrap(),
            dispatch(getTarget()).unwrap(),
            dispatch(getTrades()).unwrap(),
          ]);
          setDataLoaded(true);
        } catch (error) {
          console.error("Error loading data:", error);
          setDataLoaded(true);
        }
      }
    };

    loadData();
  }, [dispatch, user, dataLoaded]);

  // Load target progress hanya jika target enabled
  useEffect(() => {
    if (target?.enabled && dataLoaded) {
      dispatch(getTargetProgress());
    }
  }, [dispatch, target?.enabled, dataLoaded]);

  // PERBAIKAN: Update local storage dengan data dari Redux - dengan pendekatan yang aman
  useEffect(() => {
    // Skip jika effect sudah dijalankan atau ada update yang sedang pending
    if (effectRun.current || subscriptionUpdatePending.current) {
      return;
    }

    if (reduxSubscription && reduxSubscription.plan) {
      subscriptionUpdatePending.current = true;
      
      // Gunakan setTimeout untuk memindahkan setState ke event loop berikutnya
      const timer = setTimeout(() => {
        console.log("Updating local storage with Redux subscription:", reduxSubscription);
        setSubscription(reduxSubscription);
        saveSubscription(reduxSubscription);
        subscriptionUpdatePending.current = false;
        effectRun.current = true;
      }, 0);

      return () => {
        clearTimeout(timer);
        subscriptionUpdatePending.current = false;
      };
    }
  }, [reduxSubscription, saveSubscription]);

  // PERBAIKAN: Effect terpisah untuk entries dengan pendekatan yang aman
  useEffect(() => {
    const timer = setTimeout(() => {
      saveEntries(entries);
    }, 0);

    return () => clearTimeout(timer);
  }, [entries, saveEntries]);

  // PERBAIKAN: Prioritas data subscription yang benar
  // 1. Data dari Redux (paling terpercaya)
  // 2. Data dari local storage
  // 3. Default free
  const actualSubscription = useMemo(() => {
    if (reduxSubscription && reduxSubscription.plan) {
      return reduxSubscription;
    }
    if (subscription && subscription.plan) {
      return subscription;
    }
    return { plan: "free" };
  }, [reduxSubscription, subscription]);

  // PERBAIKAN: Current plan berdasarkan actual subscription
  const currentPlan = useMemo(() => {
    const planName = actualSubscription.plan || 'free';
    return subscriptionPlans[planName] || subscriptionPlans.free;
  }, [actualSubscription, subscriptionPlans]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  // Function handlers
  const upgradePlan = useCallback(
    (newPlan) => {
      const newSubscription = {
        plan: newPlan,
        expiresAt:
          newPlan === "lifetime" ? null : Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
      
      // PERBAIKAN: Gunakan setTimeout untuk setState
      setTimeout(() => {
        setSubscription(newSubscription);
      }, 0);
      
      navigate("/dashboard");
    },
    [navigate]
  );

  const handleShowUpgradeModal = useCallback(() => {
    navigate("/upgrade");
  }, [navigate]);

  const handleShowBalanceModal = useCallback(() => {
    setTimeout(() => {
      setShowBalanceModal(true);
    }, 0);
  }, []);

  const handleShowTargetModal = useCallback(() => {
    setTimeout(() => {
      setShowTargetModal(true);
    }, 0);
  }, []);

  const handleProfileSettings = useCallback(() => {
    navigate("/profile-settings");
  }, [navigate]);

  const handleShowLanding = useCallback(() => {
    navigate("/");
  }, [navigate]);

  useEffect(() => {
  // Pastikan data balance tersedia untuk outlet context
  if (currentBalance !== undefined && currentBalance !== null) {
    console.log("Balance available for context:", currentBalance);
  }
}, [currentBalance, initialBalance]);

  // PERBAIKAN: Props untuk children components - tanpa useMemo yang bermasalah
  const commonProps = {
    entries,
    setEntries,
    stats,
    initialBalance,
    currentBalance,
    target,
    targetProgress,
    subscription: actualSubscription,
    currentPlan,
    onShowBalanceModal: handleShowBalanceModal,
    onShowTargetModal: handleShowTargetModal,
    onShowUpgradeModal: handleShowUpgradeModal,
    upgradePlan,
  };

  // PERBAIKAN: Header props - tanpa useMemo yang bermasalah
  const headerProps = {
    activeTab,
    mobileMenuOpen,
    setMobileMenuOpen,
    showUserMenu,
    setShowUserMenu,
    stats,
    target,
    targetProgress,
    user,
    currentPlan,
    subscription: actualSubscription,
    onShowLanding: handleShowLanding,
    onShowBalanceModal: handleShowBalanceModal,
    onShowTargetModal: handleShowTargetModal,
    onShowUpgradeModal: handleShowUpgradeModal,
    onProfileSettings: handleProfileSettings,
  };

  // PERBAIKAN: Loading state yang lebih akurat
  const isLoading = (balanceLoading || targetLoading || subscriptionLoading) && !dataLoaded;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-violet-700 font-semibold">
            Loading application data...
          </p>
          <p className="text-violet-500 text-sm mt-2">
            Subscription: {subscriptionLoading ? 'Loading...' : actualSubscription.plan}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex relative min-h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 transition-all duration-500 ${
          open ? "w-[280px]" : "w-[68px]"
        }`}
      >
        <SidebarUser />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col overflow-y-auto transition-all duration-500 ${
          open ? "lg:ml-[280px]" : "lg:ml-[68px]" // Ubah md menjadi lg
        }`}
      >
        {/* Header dengan props lengkap */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4">
            <Header {...headerProps} />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50">
          <div className="p-5 min-h-[calc(100vh-116px)]">
            <AnimatePresence mode="wait">
              <Motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet context={commonProps} />
              </Motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer className="p-5 md:text-end text-center border-t border-gray-200 bg-white">
            <p className="text-sm text-gray-600">
              © {currentYear} Pips Diary - All rights reserved.
            </p>
          </footer>
        </main>

        {/* Modal Components */}
        <AnimatePresence>
          {showBalanceModal && (
            <BalanceModal setShowBalanceModal={setShowBalanceModal} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTargetModal && (
            <TargetModal setShowTargetModal={setShowTargetModal} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LayoutUser;