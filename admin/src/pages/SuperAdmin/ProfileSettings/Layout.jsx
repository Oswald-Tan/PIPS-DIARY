import React, { useState, useEffect, useCallback } from "react";
import { motion as Motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateProfile, getMe, changePassword } from "../../../features/authSlice";
import Swal from "sweetalert2";
import ReactCountryFlag from "react-country-flag";
import {
  ArrowLeft,
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  Lightbulb,
  Mail,
  Phone,
  Key,
  AlertTriangle,
  Settings,
  ShieldCheck,
  ArrowRight,
  Globe,
  Moon,
  Calendar,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { useRef } from "react";

// Helper function untuk memformat tanggal dan waktu
const formatDateTime = (dateString) => {
  if (!dateString) return "Tidak tersedia";

  try {
    const date = new Date(dateString);

    // Validasi apakah date valid
    if (isNaN(date.getTime())) return "Format tidak valid";

    // Format tanggal: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Format waktu: HH:MM (24 jam format)
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}, ${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Format tidak valid";
  }
};

// Helper untuk menghitung waktu sejak login terakhir
const getTimeSinceLastLogin = (dateString) => {
  if (!dateString) return "";

  try {
    const lastLogin = new Date(dateString);
    const now = new Date();
    const diffMs = now - lastLogin;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`;
    return `${Math.floor(diffDays / 365)} tahun yang lalu`;
  } catch (error) {
    console.error("Error calculating time since last login:", error);
    return "";
  }
};

// Helper function untuk menghitung kekuatan password
const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: "", color: "" };

  let strength = 0;
  if (password.length >= 6) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  const strengthMap = {
    1: { label: "Very Weak", color: "bg-red-500" },
    2: { label: "Weak", color: "bg-orange-500" },
    3: { label: "Fair", color: "bg-yellow-500" },
    4: { label: "Good", color: "bg-blue-500" },
    5: { label: "Strong", color: "bg-green-500" },
  };

  return strengthMap[strength] || { strength: 0, label: "", color: "" };
};

// Komponen Input dengan Icon
const InputWithIcon = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  iconColor = "text-violet-600",
}) => (
  <div>
    <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
      {label}
    </label>
    <div className="relative">
      <div
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${iconColor}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-violet-900"
        placeholder={placeholder}
      />
    </div>
  </div>
);

// Komponen Password Input dengan Toggle
const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  isVisible,
  onToggle,
  icon: Icon,
  iconColor = "text-violet-600",
  showStrengthIndicator = false,
}) => {
  const passwordStrength = getPasswordStrength(value);

  return (
    <div>
      <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
        {label}
      </label>
      <div className="relative">
        <div
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <input
          type={isVisible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full pl-10 pr-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-violet-900"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-violet-600 transition-colors duration-200 focus:outline-none p-1"
        >
          {isVisible ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showStrengthIndicator && value && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1 font-light">
            <span className="text-slate-600">Password strength:</span>
            <span
              className={`font-medium ${
                passwordStrength.label === "Strong"
                  ? "text-green-600"
                  : passwordStrength.label === "Good"
                  ? "text-blue-600"
                  : passwordStrength.label === "Fair"
                  ? "text-yellow-600"
                  : passwordStrength.label === "Weak"
                  ? "text-orange-600"
                  : "text-red-600"
              }`}
            >
              {passwordStrength.label}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
              style={{
                width: `${(passwordStrength.strength / 5) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Komponen Info Card untuk menampilkan informasi
const InfoCard = ({
  title,
  value,
  description,
  icon: Icon,
  color = "violet",
}) => {
  const colors = {
    violet: "bg-violet-50 border-violet-200 text-violet-800",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
  };

  const iconColors = {
    violet: "text-violet-600",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
  };

  return (
    <Motion.div
      whileHover={{ y: -2 }}
      className={`${colors[color]} p-4 rounded-xl border-2 flex items-start gap-3`}
    >
      <div className={`p-2 rounded-lg bg-white ${iconColors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-lg font-bold mt-1">{value}</div>
        {description && (
          <div className="text-xs mt-1 opacity-80">{description}</div>
        )}
      </div>
    </Motion.div>
  );
};

// Komponen Tab Button
const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <Motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-200 ${
      active
        ? "bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-md"
        : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200"
    }`}
  >
    <Icon className="w-5 h-5" />
    {children}
  </Motion.button>
);

// Komponen Setting Card
const SettingCard = ({ title, description, icon: Icon, children }) => (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
    <div className="flex items-start gap-4 mb-4">
      <div className="bg-violet-100 p-3 rounded-xl">
        <Icon className="w-6 h-6 text-violet-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-slate-600 text-sm mt-1">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [preferences, setPreferences] = useState({
    language: "id",
  });

  // State untuk dropdown bahasa
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef(null);

  // Data bahasa yang tersedia dengan informasi bendera
  const languages = [
    { code: "id", name: "Bahasa Indonesia", countryCode: "ID" },
    { code: "en", name: "English", countryCode: "US" },
  ];

  // Handle click outside untuk menutup dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user]);

  // Handle messages
  useEffect(() => {
    if (localMessage) {
      const timer = setTimeout(() => {
        setLocalMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [localMessage]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileForm.name.trim()) {
      setLocalMessage("Nama tidak boleh kosong");
      setMessageType("error");
      return;
    }

    if (!profileForm.email.trim()) {
      setLocalMessage("Email tidak boleh kosong");
      setMessageType("error");
      return;
    }

    try {
      const result = await dispatch(updateProfile(profileForm)).unwrap();

      if (result.message === "Tidak ada perubahan data") {
        Swal.fire({
          title: "Info!",
          text: result.message,
          icon: "info",
          confirmButtonColor: "#8b5cf6",
          background: "#fff",
          customClass: {
            popup: "rounded-3xl shadow-2xl",
            title: "text-xl font-bold text-slate-800",
            confirmButton: "rounded-xl font-semibold px-6 py-3",
          },
        });
      } else {
        setLocalMessage(result.message);
        setMessageType("success");
        dispatch(getMe());
      }
    } catch (error) {
      setLocalMessage(error || "Terjadi kesalahan saat update profile");
      setMessageType("error");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsPasswordLoading(true);

    if (!passwordForm.currentPassword) {
      setLocalMessage("Password saat ini harus diisi");
      setMessageType("error");
      setIsPasswordLoading(false);
      return;
    }

    if (!passwordForm.newPassword) {
      setLocalMessage("Password baru harus diisi");
      setMessageType("error");
      setIsPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setLocalMessage("Password baru minimal 6 karakter");
      setMessageType("error");
      setIsPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setLocalMessage("Konfirmasi password tidak cocok");
      setMessageType("error");
      setIsPasswordLoading(false);
      return;
    }

    try {
      await dispatch(
        changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        })
      ).unwrap();

      setLocalMessage("Password berhasil diubah");
      setMessageType("success");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setLocalMessage(error || "Terjadi kesalahan saat mengubah password");
      setMessageType("error");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Fungsi untuk mendapatkan informasi bahasa berdasarkan kode
  const getCurrentLanguage = () => {
    return (
      languages.find((lang) => lang.code === preferences.language) ||
      languages[0]
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackClick}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="bg-linear-to-r from-violet-600 to-purple-600 p-3 rounded-2xl shadow-sm">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Profile & Settings
              </h1>
              <p className="text-slate-600 text-lg mt-2 font-light">
                Kelola informasi profil dan preferensi akun Anda
              </p>
            </div>
          </div>

          {/* User Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <InfoCard
              title="Bergabung Sejak"
              value={
                user.created_at
                  ? formatDateTime(user.created_at).split(",")[0]
                  : "-"
              }
              description="Tanggal pendaftaran akun"
              icon={Calendar}
              color="violet"
            />
            <InfoCard
              title="Login Terakhir"
              value={
                user.last_login
                  ? formatDateTime(user.last_login)
                  : "Belum pernah"
              }
              description={
                user.last_login ? getTimeSinceLastLogin(user.last_login) : ""
              }
              icon={LogIn}
              color="emerald"
            />
            <InfoCard
              title="Status Akun"
              value={user.status === "active" ? "Aktif" : "Non-aktif"}
              description={
                user.status === "active"
                  ? "Akun dalam keadaan aktif"
                  : "Akun dinonaktifkan"
              }
              icon={ShieldCheck}
              color="blue"
            />
          </div>
        </Motion.div>

        {/* Message Display */}
        {localMessage && (
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl text-sm font-semibold mb-6 border-2 ${
              messageType === "success"
                ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                : "bg-rose-100 text-rose-700 border-rose-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {messageType === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              {localMessage}
            </div>
          </Motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 flex flex-col space-y-3"
          >
            <TabButton
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              icon={User}
            >
              Profil Saya
            </TabButton>
            <TabButton
              active={activeTab === "password"}
              onClick={() => setActiveTab("password")}
              icon={Lock}
            >
              Keamanan
            </TabButton>
            <TabButton
              active={activeTab === "preferences"}
              onClick={() => setActiveTab("preferences")}
              icon={Settings}
            >
              Preferensi
            </TabButton>
          </Motion.div>

          {/* Main Content */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <SettingCard
                  title="Informasi Profil"
                  description="Kelola informasi profil dan kontak Anda"
                  icon={User}
                >
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputWithIcon
                        label="Nama Lengkap"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        placeholder="Masukkan nama lengkap"
                        icon={User}
                      />
                      <InputWithIcon
                        label="Email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        placeholder="Masukkan email"
                        type="email"
                        icon={Mail}
                      />
                    </div>

                    <InputWithIcon
                      label="Nomor Telepon"
                      name="phone_number"
                      value={profileForm.phone_number}
                      onChange={handleProfileChange}
                      placeholder="Masukkan nomor telepon"
                      type="tel"
                      icon={Phone}
                    />

                    <div className="flex justify-end pt-4">
                      <Motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Simpan Perubahan
                          </>
                        )}
                      </Motion.button>
                    </div>
                  </form>
                </SettingCard>
              </Motion.div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <SettingCard
                  title="Keamanan Akun"
                  description="Perbarui password untuk menjaga keamanan akun Anda"
                  icon={Lock}
                >
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <PasswordInput
                        label="Password Saat Ini"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Masukkan password saat ini"
                        isVisible={passwordVisibility.currentPassword}
                        onToggle={() =>
                          togglePasswordVisibility("currentPassword")
                        }
                        icon={Key}
                      />

                      <PasswordInput
                        label="Password Baru"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Masukkan password baru"
                        isVisible={passwordVisibility.newPassword}
                        onToggle={() => togglePasswordVisibility("newPassword")}
                        icon={Lock}
                        showStrengthIndicator={true}
                      />

                      <PasswordInput
                        label="Konfirmasi Password Baru"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Konfirmasi password baru"
                        isVisible={passwordVisibility.confirmPassword}
                        onToggle={() =>
                          togglePasswordVisibility("confirmPassword")
                        }
                        icon={Lock}
                      />
                    </div>

                    <div className="bg-violet-50 rounded-xl p-4 border-2 border-violet-200">
                      <h4 className="font-bold text-violet-800 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Tips Password Aman
                      </h4>
                      <ul className="text-sm text-violet-700 space-y-1">
                        <li>• Gunakan minimal 8 karakter</li>
                        <li>
                          • Kombinasikan huruf besar, kecil, angka, dan simbol
                        </li>
                        <li>• Hindari informasi personal yang mudah ditebak</li>
                        <li>• Gunakan password yang berbeda dari akun lain</li>
                      </ul>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isPasswordLoading}
                        className="px-6 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isPasswordLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Mengubah Password...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Ubah Password
                          </>
                        )}
                      </Motion.button>
                    </div>
                  </form>
                </SettingCard>
              </Motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <SettingCard
                  title="Preferensi Aplikasi"
                  description="Sesuaikan pengalaman penggunaan aplikasi"
                  icon={Settings}
                >
                  <div className="space-y-6">
                    {/* Language Selector dengan Bendera */}
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Bahasa
                      </label>
                      <div className="relative" ref={languageDropdownRef}>
                        <button
                          type="button"
                          onClick={() =>
                            setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                          }
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-slate-900 flex items-center justify-between bg-white hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3">
                            <ReactCountryFlag
                              countryCode={getCurrentLanguage().countryCode}
                              svg
                              style={{
                                width: "1.5em",
                                height: "1.5em",
                              }}
                              title={getCurrentLanguage().name}
                            />
                            <span>{getCurrentLanguage().name}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              isLanguageDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isLanguageDropdownOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white border-2 border-slate-200 rounded-xl shadow-lg overflow-hidden">
                            {languages.map((language) => (
                              <button
                                key={language.code}
                                type="button"
                                onClick={() => {
                                  handlePreferenceChange(
                                    "language",
                                    language.code
                                  );
                                  setIsLanguageDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-violet-50 transition-colors ${
                                  preferences.language === language.code
                                    ? "bg-violet-50 text-violet-700 font-bold"
                                    : "text-slate-700"
                                }`}
                              >
                                <ReactCountryFlag
                                  countryCode={language.countryCode}
                                  svg
                                  style={{
                                    width: "1.5em",
                                    height: "1.5em",
                                  }}
                                  title={language.name}
                                />
                                <span>{language.name}</span>
                                {preferences.language === language.code && (
                                  <CheckCircle className="w-4 h-4 ml-auto text-violet-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Pilih bahasa yang ingin Anda gunakan di aplikasi
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex justify-end">
                        <Motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setLocalMessage("Preferensi berhasil disimpan");
                            setMessageType("success");
                          }}
                          className="px-6 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Simpan Preferensi
                        </Motion.button>
                      </div>
                    </div>
                  </div>
                </SettingCard>
              </Motion.div>
            )}
          </Motion.div>
        </div>

        {/* Footer Actions */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/80 backdrop-blur-md p-6 rounded-2xl border-2 border-slate-100 shadow-sm"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-600">
              <p className="font-semibold">Perlukan bantuan?</p>
              <p>Hubungi dukungan kami untuk pertanyaan terkait akun.</p>
            </div>
            <Motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                window.open("mailto:support@tradingjournal.com", "_blank")
              }
              className="px-6 py-3 border-2 border-violet-300 text-violet-700 rounded-xl hover:bg-violet-50 transition-colors font-bold flex items-center gap-2"
            >
              Hubungi Support
              <ArrowRight className="w-4 h-4" />
            </Motion.button>
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

export default ProfileSettings;
