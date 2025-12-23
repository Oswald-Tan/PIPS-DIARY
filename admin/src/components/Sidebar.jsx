import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSidebar } from "../context/useSidebar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, reset } from "../features/authSlice";
import Swal from "sweetalert2";
import BlackLogo from "../assets/black_logo.png";

// Import Lucide React icons yang sesuai
import {
  LayoutDashboard,
  User,
  LogOut as LogOutIcon,
  ChevronUp,
  ChevronDown,
  DollarSign
} from "lucide-react";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { open, toggleSidebar } = useSidebar();

  // State declarations
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [activeMenu, setActiveMenu] = useState("");
  const [activeSubMenuItem, setActiveSubMenuItem] = useState("");

  // Menus dengan icon yang sesuai
  const menus = useMemo(
    () => [
      {
        name: "Dashboard",
        link: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "User",
        link: "/users",
        icon: User,
      },
      {
        name: "Manual Rate",
        link: "/manual-rate",
        icon: DollarSign,
      },
    ],
    []
  );

  // Fungsi logout
  const logout = useCallback(async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#8b5cf6",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      dispatch(LogOut());
      dispatch(reset());
      navigate("/");
    }
  }, [dispatch, navigate]);

  // Reset submenu ketika sidebar ditutup
  useEffect(() => {
    if (!open) {
      const timeoutId = setTimeout(() => {
        setActiveSubMenu("");
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  // Deteksi path aktif
  useEffect(() => {
    const currentPath = location.pathname;
    let mounted = true;

    const findActiveMenu = () => {
      if (!mounted) return;

      for (const menu of menus) {
        // Skip menu yang memiliki action (seperti logout)
        if (menu.action) continue;

        if (menu.hasSubMenu && menu.subMenu) {
          const foundSub = menu.subMenu.find((sub) => sub.link === currentPath);
          if (foundSub) {
            setActiveMenu(menu.name);
            if (open) {
              setTimeout(() => {
                if (mounted) setActiveSubMenu(menu.name);
              }, 0);
            }
            setActiveSubMenuItem(foundSub.name);
            return;
          }
        } else if (menu.link === currentPath) {
          setActiveMenu(menu.name);
          return;
        }
      }
    };

    findActiveMenu();

    return () => {
      mounted = false;
    };
  }, [location.pathname, menus, open]);

  // Handler functions
  const handleSubMenuClick = useCallback(
    (menuName) => {
      if (!open) {
        toggleSidebar();
        setTimeout(() => {
          setActiveSubMenu(menuName);
        }, 300);
      } else {
        setActiveSubMenu(activeSubMenu === menuName ? "" : menuName);
      }
    },
    [open, toggleSidebar, activeSubMenu]
  );

  const handleMenuClick = useCallback(
    (menu) => {
      // Jika menu memiliki aksi khusus
      if (menu.action === "logout") {
        logout();
        setActiveSubMenu("");
        setActiveSubMenuItem("");
        return;
      }

      // Jika menu memiliki submenu
      if (menu.hasSubMenu) {
        handleSubMenuClick(menu.name);
        setActiveMenu(menu.name);
      }
      // Jika menu biasa tanpa submenu
      else if (menu.link) {
        setActiveMenu(menu.name);
        setActiveSubMenu("");
        setActiveSubMenuItem("");
        navigate(menu.link);
      }
    },
    [logout, handleSubMenuClick, navigate]
  );

  const handleSubMenuItemClick = useCallback(
    (menuName, subItemName, link) => {
      setActiveMenu(menuName);
      setActiveSubMenuItem(subItemName);
      navigate(link);

      // Jika sidebar dalam keadaan tertutup (mobile/tablet), tutup setelah memilih submenu
      if (window.innerWidth < 1024) {
        toggleSidebar();
      }
    },
    [navigate, toggleSidebar]
  );

  // Render menu items
  const renderMenuItems = useCallback(() => {
    return menus.map((menu, i) => {
      const isMenuActive = activeMenu === menu.name;
      const IconComponent = menu.icon;

      if (menu.hasSubMenu) {
        return (
          <div key={i} className="">
            <button
              onClick={() => handleMenuClick(menu)}
              className={`group flex items-center justify-between w-full text-sm gap-3.5 font-medium px-2 py-3 rounded-xl text-left ${
                isMenuActive ? "bg-violet-50 text-violet-600 border border-violet-200" : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <div>
                  <IconComponent size={20} />
                </div>
                <h2
                  style={{
                    transitionDelay: `${i + 3}00ms`,
                  }}
                  className={`whitespace-pre duration-500 ml-3 ${
                    !open && "opacity-0 translate-x-28 overflow-hidden"
                  }`}
                >
                  {menu.name}
                </h2>
              </div>
              <div className={`${!open ? "hidden" : "block"}`}>
                {activeSubMenu === menu.name ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                activeSubMenu === menu.name ? "max-h-40" : "max-h-0"
              }`}
            >
              <div className="pl-8 py-1 space-y-1">
                {menu.subMenu?.map((sub, j) => {
                  const isSubItemActive = activeSubMenuItem === sub.name;
                  return (
                    <button
                      key={j}
                      onClick={() =>
                        handleSubMenuItemClick(menu.name, sub.name, sub.link)
                      }
                      className={`flex items-center w-full text-sm gap-3.5 font-medium px-2 py-2 rounded-lg transition-colors duration-200 ${
                        isSubItemActive
                          ? "text-violet-600 bg-violet-50"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <div className={`w-1 h-1 rounded-full ${
                        isSubItemActive ? "bg-violet-600" : "bg-gray-400"
                      }`}></div>
                      <h2
                        style={{
                          transitionDelay: `${j + 3}00ms`,
                        }}
                        className={`whitespace-pre duration-500 ${
                          !open && "opacity-0 translate-x-28 overflow-hidden"
                        }`}
                      >
                        {sub.name}
                      </h2>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      return (
        <button
          key={i}
          onClick={() => handleMenuClick(menu)}
          className={`group flex items-center text-sm gap-3.5 font-medium px-2 py-3 rounded-xl w-full text-left ${
            isMenuActive ? "bg-violet-50 text-violet-600 border border-violet-200" : "hover:bg-gray-50 text-gray-700"
          }`}
        >
          <div>
            <IconComponent size={20} />
          </div>
          <h2
            style={{
              transitionDelay: `${i + 3}00ms`,
            }}
            className={`whitespace-pre duration-500 ${
              !open && "opacity-0 translate-x-28 overflow-hidden"
            }`}
          >
            {menu.name}
          </h2>
        </button>
      );
    });
  }, [
    menus,
    activeMenu,
    activeSubMenu,
    activeSubMenuItem,
    open,
    handleMenuClick,
    handleSubMenuItemClick,
  ]);

  return (
    <>
      {open && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden" // Ubah md:hidden menjadi lg:hidden
        />
      )}

      <section className="flex gap-6 relative">
        <div
          className={`bg-white border-r border-gray-200 min-h-screen ${
            open
              ? "w-[280px]"
              : "lg:w-[68px] lg:translate-x-0 -translate-x-[280px]" // Ubah md menjadi lg
          } fixed top-0 left-0 z-20 duration-500 text-gray-800 px-4 overflow-y-auto flex flex-col`}
          style={{ height: "100vh" }}
        >
          <div>
            <div className="py-4 px-2 flex relative">
              <h2
                className={`whitespace-pre duration-1000 text-xl font-semibold text-gray-800 ${
                  !open && "-translate-x-[280px] opacity-0"
                }`}
              >
                Pips Diary
              </h2>
               <img
                src={BlackLogo}
                alt="Logo"
                className={`absolute left-1.5 w-7 overflow-hidden duration-300 transition-opacity ${
                  open ? "opacity-0 delay-0" : "opacity-100 delay-500"
                }`}
              />
            </div>

            <div className="mt-2 flex flex-col gap-1 relative">
              {renderMenuItems()}
            </div>
          </div>

          {/* Bagian bawah untuk menampilkan info user */}
          <div className="mt-auto pb-4">
            <div className={`${!open ? "hidden" : "block"} mt-6`}>
              <div className="flex items-center gap-3 px-2 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="border border-gray-300 rounded-full p-2 shrink-0 bg-white">
                  <User size={20} className="text-gray-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-gray-800">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Sidebar;