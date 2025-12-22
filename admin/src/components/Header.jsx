import { motion as Motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { HiMenuAlt2 } from "react-icons/hi";
import GradientLogo from "../assets/gradient_logo.png";
import { LogOut, reset } from "../features/authSlice";
import Swal from "sweetalert2";
import { useSidebar } from "../context/useSidebar";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Header = ({
  user,
  onProfileSettings,
  showUserMenu,
  setShowUserMenu,
}) => {
  const dispatch = useDispatch();
  const { toggleSidebar } = useSidebar();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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