import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux"; // Tambahkan import ini

// Components
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/useSidebar";
import Header from "../components/Header";

const currentYear = new Date().getFullYear();

const LayoutSuperAdmin = () => {
  // State declarations
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Custom hooks
  const { open } = useSidebar()

  // Redux state
  const { user } = useSelector((state) => state.auth); // Ambil user dari Redux store

  const navigate = useNavigate();
  const location = useLocation();

  // Get active tab from route
  const activeTab = useMemo(() => {
    if (location.pathname.includes("/users")) return "users";
    if (location.pathname.includes("/transactions")) return "transactions";
    if (location.pathname.includes("/manual-rate")) return "manual-rate";
    return "dashboard";
  }, [location.pathname]);


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

  const handleProfileSettings = useCallback(() => {
    navigate("/profile-settings");
  }, [navigate]);

  const handleShowLanding = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // PERBAIKAN: Header props - tanpa useMemo yang bermasalah
  const headerProps = {
    activeTab,
    mobileMenuOpen,
    setMobileMenuOpen,
    showUserMenu,
    setShowUserMenu,
    onShowLanding: handleShowLanding,
    onProfileSettings: handleProfileSettings,
    user, // Tambahkan user ke props
  };

  return (
    <div className="flex relative min-h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 transition-all duration-500 ${
          open ? "w-[280px]" : "w-[68px]"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col overflow-y-auto transition-all duration-500 ${
          open ? "lg:ml-[280px]" : "lg:ml-[68px]"
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
                <Outlet />
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
      </div>
    </div>
  );
};

export default LayoutSuperAdmin;