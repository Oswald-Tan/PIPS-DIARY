import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUser,
  clearSearchMessage,
  getUsersStats,
  setRoleFilterInPagination,
  clearMessage,
} from "../../../features/userSlice.js";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import {
  Search,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Shield,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  Key,
  AlertCircle,
  Crown,
  Eye,
} from "lucide-react";
import UserFormModal from "../../../components/modals/UserFormModal";

const Layout = () => {
  const dispatch = useDispatch();

  const {
    users = [],
    pagination,
    stats = {},
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isSuccess,
    isError,
    message,
    searchMessage,
    lastAction,
  } = useSelector((state) => state.users);

  // State untuk modal
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [localMessage, setLocalMessage] = useState("");

  // State untuk pagination dan filter
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("user");
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    roleName: "user",
  });

  const effectRun = useRef(false);
  const isInitialMount = useRef(true);

  // Available roles (tanpa super_admin)
  const roles = ["user", "premium_user", "admin", "viewer"];

  // Pastikan users adalah array
  const usersArray = Array.isArray(users) ? users : [];

  // Objek untuk memetakan role ke icon
  const roleIcons = {
    user: User,
    admin: Shield,
    premium_user: Crown,
    viewer: Eye,
  };

  // Function untuk mendapatkan icon berdasarkan role
  const getRoleIcon = (role) => {
    return roleIcons[role] || User;
  };

  // Reset ke halaman 0 saat search atau filter berubah
  useEffect(() => {
    setCurrentPage(0);
    dispatch(clearSearchMessage());
    // Clear local message saat search/filter berubah
    setLocalMessage("");
  }, [searchQuery, roleFilter, dispatch]);

  // Load users berdasarkan filter role
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      role: roleFilter,
    };

    dispatch(getUsers(params));
    dispatch(setRoleFilterInPagination(roleFilter));
  }, [dispatch, currentPage, itemsPerPage, searchQuery, roleFilter]);

  // Load stats saat pertama kali render dan saat filter berubah
  useEffect(() => {
    dispatch(getUsersStats());
  }, [dispatch]);

  // Handle messages hanya untuk CRUD operations
  useEffect(() => {
    // Skip untuk initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Hanya tampilkan message untuk create, update, delete
    const crudActions = ["create", "update", "delete"];
    
    if (crudActions.includes(lastAction) && message) {
      setLocalMessage(message);

      const timer = setTimeout(() => {
        setLocalMessage("");
        dispatch(clearMessage()); // Clear message di Redux state
      }, 3000);

      return () => clearTimeout(timer);
    }

    // Untuk get actions, clear local message
    if (lastAction === "get") {
      setLocalMessage("");
    }
  }, [lastAction, message, dispatch]);

  // Clear local message saat komponen unmount
  useEffect(() => {
    return () => {
      setLocalMessage("");
      dispatch(clearMessage());
    };
  }, [dispatch]);

  const resetForm = useCallback(() => {
    setForm({
      name: "",
      email: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
      roleName: "user",
    });
  }, []);

  const openAdd = () => {
    resetForm();
    setEditing(null);
    setSelectedUser(null);
    setShowForm(true);
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      password: "",
      confirmPassword: "",
      roleName: user.role || "user",
    });
    setEditing(user.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setSelectedUser(null);
    setTimeout(() => {
      dispatch(resetUser());
    }, 100);
  };

  const saveForm = async (formData) => {
    try {
      if (editing) {
        const result = await dispatch(
          updateUser({
            userId: editing,
            userData: formData,
          })
        ).unwrap();

        if (result.success) {
          Swal.fire({
            title: "Berhasil!",
            text: result.message,
            icon: "success",
            confirmButtonColor: "#8b5cf6",
          });
          closeForm();
        }
      } else {
        const result = await dispatch(createUser(formData)).unwrap();

        if (result.success) {
          Swal.fire({
            title: "Berhasil!",
            text: result.message,
            icon: "success",
            confirmButtonColor: "#8b5cf6",
          });
          closeForm();
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);

      // Handle backend validation errors
      if (error.errors) {
        Swal.fire({
          title: "Validasi Gagal!",
          html: Object.values(error.errors)
            .map((err) => `<div class="text-left mb-1">• ${err}</div>`)
            .join(""),
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: error.message || "Terjadi kesalahan",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  const removeUser = async (id, name) => {
    const result = await Swal.fire({
      title: "Hapus User?",
      html: `Apakah Anda yakin ingin menghapus <strong>${name}</strong>?<br/>Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8b5cf6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#fff",
      color: "#1f2937",
      customClass: {
        popup: "rounded-3xl shadow-2xl",
        title: "text-xl font-bold text-violet-900",
        confirmButton: "rounded-xl font-semibold px-6 py-3",
        cancelButton: "rounded-xl font-semibold px-6 py-3",
      },
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteUser(id)).unwrap();

        Swal.fire({
          title: "Terhapus!",
          text: "User berhasil dihapus.",
          icon: "success",
          confirmButtonColor: "#8b5cf6",
          background: "#fff",
          color: "#1f2937",
          customClass: {
            popup: "rounded-3xl shadow-2xl",
            title: "text-xl font-bold text-violet-900",
            confirmButton: "rounded-xl font-semibold px-6 py-3",
          },
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          title: "Error!",
          text: "Gagal menghapus user.",
          icon: "error",
          confirmButtonColor: "#ef4444",
          background: "#fff",
          color: "#1f2937",
          customClass: {
            popup: "rounded-3xl shadow-2xl",
            title: "text-xl font-bold text-rose-900",
            confirmButton: "rounded-xl font-semibold px-6 py-3",
          },
        });
      }
    }
  };

  const formatRole = (role) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "super_admin":
        return "text-purple-600 bg-purple-100";
      case "admin":
        return "text-violet-600 bg-violet-100";
      case "premium_user":
        return "text-emerald-600 bg-emerald-100";
      case "viewer":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-slate-600 bg-slate-100";
    }
  };

  // Pagination dari backend
  const pageCount = pagination?.totalPages || 0;
  const totalItems = pagination?.totalItems || 0;
  
  // Hitung start dan end item
  let startItem = 0;
  let endItem = 0;
  
  if (pagination && pagination.totalItems > 0) {
    startItem = (pagination.currentPage * pagination.itemsPerPage) + 1;
    endItem = Math.min(
      (pagination.currentPage + 1) * pagination.itemsPerPage,
      pagination.totalItems
    );
  }

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    setLocalMessage(""); // Clear message saat ganti halaman
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0);
    setLocalMessage(""); // Clear message saat ubah items per page
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("user");
    setCurrentPage(0);
    dispatch(clearSearchMessage());
    setLocalMessage(""); // Clear message saat clear filters
  };

  // Render icon berdasarkan roleFilter
  const renderRoleIcon = () => {
    const IconComponent = getRoleIcon(roleFilter);
    return <IconComponent className="w-5 h-5 text-violet-600" />;
  };

  return (
    <>
      <div className="space-y-6 min-h-screen">
        {/* Header Section */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-8 h-8 text-violet-600" />
              Manajemen User
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-1 font-light">
              Kelola user sistem berdasarkan role mereka
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-violet-500" />
              </div>
              <input
                type="text"
                placeholder="Cari user berdasarkan nama, email, telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white/80 backdrop-blur-sm shadow-sm font-light"
              />
            </div>
            <Motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-slate-200 bg-white/80 backdrop-blur-sm rounded-2xl text-slate-700 hover:bg-slate-50 transition-all font-medium flex items-center justify-center space-x-2 shadow-sm"
            >
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </Motion.button>
            <Motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={openAdd}
              disabled={isCreating}
              className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Membuat...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>User Baru</span>
                </>
              )}
            </Motion.button>
          </div>
        </Motion.div>

        {/* Message Display - Hanya untuk create/update/delete */}
        {localMessage && (
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl text-sm font-medium ${
              isSuccess && !isError
                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                : "bg-rose-100 text-rose-700 border border-rose-300"
            }`}
          >
            {localMessage}
          </Motion.div>
        )}

        {/* Search Message Display - Untuk pesan pencarian */}
        {searchMessage && (
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl text-sm font-medium bg-amber-100 text-amber-700 border border-amber-300 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            {searchMessage}
          </Motion.div>
        )}

        {/* Filter Section */}
        {showFilters && (
          <Motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 p-6 shadow-sm overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Shield className="inline w-4 h-4 mr-2 text-violet-600" />
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {formatRole(role)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Per Page */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Item per halaman
                </label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
              >
                Hapus semua filter
              </button>
            </div>
          </Motion.div>
        )}

        {/* Stats Cards - Menampilkan semua role kecuali super_admin */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {/* Total Semua User */}
          <div 
            onClick={() => {
              setRoleFilter("user");
              setCurrentPage(0);
              setLocalMessage(""); // Clear message saat klik stats
            }}
            className={`bg-linear-to-br from-violet-100 via-violet-50 to-purple-50 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border ${
              roleFilter === "user" 
                ? "border-violet-400 border-2" 
                : "border-violet-200/70 hover:border-violet-300/80"
            } cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-violet-800 font-medium uppercase tracking-wider">
                Total User
              </div>
              <Users className="w-5 h-5 text-violet-700" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-violet-900">
              {stats.total || 0}
            </div>
            <div className="text-xs text-violet-600 mt-1">
              Klik untuk lihat
            </div>
          </div>

          {/* Admin Users */}
          <div 
            onClick={() => {
              setRoleFilter("admin");
              setCurrentPage(0);
              setLocalMessage("");
            }}
            className={`bg-linear-to-br from-slate-100 via-slate-50 to-slate-50 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border ${
              roleFilter === "admin" 
                ? "border-slate-400 border-2" 
                : "border-slate-200/70 hover:border-slate-300/80"
            } cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-800 font-medium uppercase tracking-wider">
                Admin
              </div>
              <Shield className="w-5 h-5 text-slate-700" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-slate-900">
              {stats.admin || 0}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Klik untuk lihat
            </div>
          </div>

          {/* Premium Users */}
          <div 
            onClick={() => {
              setRoleFilter("premium_user");
              setCurrentPage(0);
              setLocalMessage("");
            }}
            className={`bg-linear-to-br from-emerald-100 via-emerald-50 to-emerald-50 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border ${
              roleFilter === "premium_user" 
                ? "border-emerald-400 border-2" 
                : "border-emerald-200/70 hover:border-emerald-300/80"
            } cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-emerald-800 font-medium uppercase tracking-wider">
                Premium User
              </div>
              <Crown className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-emerald-900">
              {stats.premium_user || 0}
            </div>
            <div className="text-xs text-emerald-600 mt-1">
              Klik untuk lihat
            </div>
          </div>

          {/* Viewer Users */}
          <div 
            onClick={() => {
              setRoleFilter("viewer");
              setCurrentPage(0);
              setLocalMessage("");
            }}
            className={`bg-linear-to-br from-blue-100 via-blue-50 to-blue-50 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border ${
              roleFilter === "viewer" 
                ? "border-blue-400 border-2" 
                : "border-blue-200/70 hover:border-blue-300/80"
            } cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-blue-800 font-medium uppercase tracking-wider">
                Viewer
              </div>
              <Eye className="w-5 h-5 text-blue-700" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-blue-900">
              {stats.viewer || 0}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Klik untuk lihat
            </div>
          </div>
        </Motion.div>

        {/* Current Filter Info */}
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-violet-50 to-purple-50 p-4 rounded-2xl border border-violet-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl">
                {renderRoleIcon()}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  {formatRole(roleFilter)} ({totalItems} user)
                </h3>
                <p className="text-sm text-slate-600">
                  {searchQuery 
                    ? `Menampilkan hasil pencarian "${searchQuery}" dalam role ${formatRole(roleFilter)}`
                    : `Menampilkan semua user dengan role ${formatRole(roleFilter)}`
                  }
                </p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Halaman {currentPage + 1} dari {pageCount || 1}
            </div>
          </div>
        </Motion.div>

        {/* Users Table */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-linear-to-r from-slate-50 to-violet-50">
                  {["No", "Nama", "Email", "Telepon", "Role", "Aksi"].map(
                    (header) => (
                      <th
                        key={header}
                        className="text-left p-4 text-sm font-bold text-slate-800 whitespace-nowrap"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-2 text-slate-600">Memuat user...</p>
                    </td>
                  </tr>
                ) : usersArray.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center">
                      <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                      <div className="text-slate-600 text-lg mb-4 font-medium">
                        {searchQuery 
                          ? `Tidak ada user ${formatRole(roleFilter)} yang cocok dengan pencarian "${searchQuery}"`
                          : `Tidak ada user dengan role "${formatRole(roleFilter)}"`
                        }
                      </div>
                      {!searchQuery && (
                        <Motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={openAdd}
                          className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-sm font-medium flex items-center gap-2 mx-auto"
                        >
                          <UserPlus className="w-5 h-5" />
                          Tambahkan User {formatRole(roleFilter)} Pertama
                        </Motion.button>
                      )}
                    </td>
                  </tr>
                ) : (
                  usersArray.map((user, index) => (
                    <Motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-100 hover:bg-linear-to-r hover:from-slate-50 hover:to-violet-50 transition-all duration-200"
                    >
                      <td className="p-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                        {startItem + index}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
                            <User className="w-4 h-4 text-violet-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {user.phone_number || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEdit(user)}
                            className="text-violet-600 hover:text-violet-800 text-sm font-medium hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Motion.button>
                          <Motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeUser(user.id, user.name)}
                            disabled={isDeleting}
                            className="text-rose-600 hover:text-rose-800 text-sm font-medium hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Hapus
                          </Motion.button>
                        </div>
                      </td>
                    </Motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Motion.div>

        {/* Pagination */}
        {pageCount > 1 && (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-center gap-4"
          >
            <div className="text-sm text-slate-600">
              {usersArray.length > 0 
                ? `Menampilkan ${startItem} sampai ${endItem} dari ${totalItems} user ${formatRole(roleFilter)}`
                : `Tidak ada data untuk ditampilkan`
              }
            </div>

            <ReactPaginate
              breakLabel="..."
              nextLabel={<ChevronRight className="w-4 h-4" />}
              onPageChange={handlePageClick}
              pageRangeDisplayed={3}
              marginPagesDisplayed={2}
              pageCount={pageCount}
              previousLabel={<ChevronLeft className="w-4 h-4" />}
              renderOnZeroPageCount={null}
              forcePage={currentPage}
              containerClassName="flex items-center space-x-1"
              pageClassName="inline-flex"
              pageLinkClassName="px-3 py-2 rounded-lg border border-slate-200 hover:bg-violet-50 hover:border-violet-300 transition-all text-sm font-medium text-slate-700 min-w-[40px] text-center"
              previousClassName="inline-flex"
              previousLinkClassName="px-3 py-2 rounded-lg border border-slate-200 hover:bg-violet-50 hover:border-violet-300 transition-all text-sm font-medium text-slate-700 flex items-center"
              nextClassName="inline-flex"
              nextLinkClassName="px-3 py-2 rounded-lg border border-slate-200 hover:bg-violet-50 hover:border-violet-300 transition-all text-sm font-medium text-slate-700 flex items-center"
              breakClassName="inline-flex"
              breakLinkClassName="px-3 py-2 text-slate-500 min-w-[40px] text-center"
              activeClassName="active"
              activeLinkClassName="bg-violet-600 text-white border-violet-600 hover:bg-violet-700 hover:border-violet-700"
              disabledClassName="opacity-40 cursor-not-allowed"
              disabledLinkClassName="hover:bg-transparent hover:border-slate-200"
            />
          </Motion.div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <UserFormModal
            form={form}
            setForm={setForm}
            editing={editing}
            saveForm={saveForm}
            closeForm={closeForm}
            isLoading={isUpdating || isCreating}
            roles={roles}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Layout;