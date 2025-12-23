import React, { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Key,
  Eye,
  EyeOff,
  X,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  UserCheck,
  KeyRound,
  PhoneCall,
  MailCheck,
} from "lucide-react";

const UserFormModal = ({
  form,
  setForm,
  editing,
  saveForm, // **PERBAIKAN: saveForm sudah menerima formData sebagai parameter**
  closeForm,
  isLoading,
  roles = ["user", "premium_user", "admin", "super_admin", "viewer"],
}) => {
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // Reset errors saat form berubah
  useEffect(() => {
    setErrors({});
  }, [form]);

  useEffect(() => {
    if (editing) {
      setChangePassword(false);
    }
  }, [editing]);

  // Semua field wajib diisi untuk create
  const requiredFields =
    editing && !changePassword
      ? ["name", "email", "phone_number", "roleName"]
      : [
          "name",
          "email",
          "phone_number",
          "password",
          "confirmPassword",
          "roleName",
        ];

  const validateForm = () => {
    const newErrors = {};

    // Validasi field wajib
    requiredFields.forEach((field) => {
      if (!form[field] || form[field].toString().trim() === "") {
        newErrors[field] = `${getFieldLabel(field)} wajib diisi`;
      }
    });

    // Validasi email format
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Validasi nomor telepon format
    if (
      form.phone_number &&
      !/^(?:\+62|0)[0-9]{8,12}$/.test(form.phone_number)
    ) {
      newErrors.phone_number =
        "Format nomor HP tidak valid (08xxx atau +62xxx)";
    }

    // Validasi password (untuk create atau saat edit dengan change password)
    if ((!editing || changePassword) && form.password) {
      if (form.password.length < 6) {
        newErrors.password = "Password minimal 6 karakter";
      }

      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Password tidak cocok";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // **PERBAIKAN: Handle submit tanpa parameter event**
  // Di dalam handleSubmit, pastikan untuk memanggil e.preventDefault()
  const handleSubmit = (e) => {
    e.preventDefault(); // Pastikan ini ada
    setShowValidation(true);

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(
          `[data-field="${firstErrorField}"]`
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    // Panggil saveForm dengan data form
    saveForm(form);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error saat user mulai mengetik
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (name) => {
    if (requiredFields.includes(name)) {
      const value = form[name];
      if (!value || value.toString().trim() === "") {
        setErrors((prev) => ({
          ...prev,
          [name]: `${getFieldLabel(name)} wajib diisi`,
        }));
      }
    }
  };

  const getFieldIcon = (key) => {
    const icons = {
      name: User,
      email: Mail,
      phone_number: Phone,
      password: Lock,
      confirmPassword: Key,
      roleName: Shield,
    };
    return icons[key] || User;
  };

  const getFieldLabel = (key) => {
    const labels = {
      name: "Nama Lengkap",
      email: "Email",
      phone_number: "Nomor Telepon",
      password: "Password",
      confirmPassword: "Konfirmasi Password",
      roleName: "Role",
    };
    return labels[key] || key;
  };

  const getInputPlaceholder = (key) => {
    const placeholders = {
      name: "Masukkan nama lengkap",
      email: "user@example.com",
      phone_number: "081234567890 atau +6281234567890",
      password: "Minimal 6 karakter",
      confirmPassword: "Ketik ulang password",
      roleName: "Pilih role",
    };
    return placeholders[key] || `Masukkan ${getFieldLabel(key)}`;
  };

  const formatRoleName = (role) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const hasEmptyRequiredFields = () => {
    return requiredFields.some(
      (field) => !form[field] || form[field].toString().trim() === ""
    );
  };

  const getEmptyFieldLabels = () => {
    return requiredFields
      .filter((field) => !form[field] || form[field].toString().trim() === "")
      .map((field) => getFieldLabel(field));
  };

  const fields = [
    { key: "name", type: "text", required: true },
    { key: "email", type: "email", required: true },
    { key: "phone_number", type: "tel", required: true },
    {
      key: "roleName",
      type: "select",
      required: true,
      options: roles.map((role) => ({
        value: role,
        label: formatRoleName(role),
      })),
    },
  ];

  if (!editing) {
    fields.push(
      { key: "password", type: "password", required: true },
      { key: "confirmPassword", type: "password", required: true }
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={() => closeForm()}
    >
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-violet-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {editing ? (
                <>
                  <UserCheck className="w-7 h-7 text-violet-600" />
                  Edit User
                </>
              ) : (
                <>
                  <UserPlus className="w-7 h-7 text-violet-600" />
                  User Baru
                </>
              )}
            </h2>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeForm}
              type="button"
              className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </Motion.button>
          </div>

          {/* Info Required Fields */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  <span className="text-red-500 font-bold">*</span> Field wajib
                  diisi
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Mohon lengkapi semua field yang diperlukan sebelum menyimpan.
                </p>
              </div>
            </div>
          </div>

          {/* Change Password Checkbox untuk Edit */}
          {editing && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                    className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                  />
                  <span className="text-sm font-medium text-amber-800">
                    Ubah Password
                  </span>
                </label>
              </div>
              {changePassword && (
                <p className="text-xs text-amber-700 mt-2 ml-6">
                  Password baru akan menggantikan password lama. Pastikan
                  password minimal 6 karakter.
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {fields.map((field) => {
                const FieldIcon = getFieldIcon(field.key);
                const hasError = showValidation && errors[field.key];
                const isPasswordField =
                  field.key === "password" || field.key === "confirmPassword";

                return (
                  <Motion.div
                    key={field.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    data-field={field.key}
                    className={field.type === "textarea" ? "md:col-span-2" : ""}
                  >
                    <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                      <FieldIcon className="w-4 h-4 text-violet-600" />
                      {getFieldLabel(field.key)}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {field.type === "select" ? (
                      <div className="relative">
                        <select
                          name={field.key}
                          value={form[field.key] || ""}
                          onChange={handleChange}
                          onBlur={() => handleBlur(field.key)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 appearance-none ${
                            hasError
                              ? "border-red-500 bg-red-50"
                              : "border-slate-200 focus:border-violet-500"
                          }`}
                        >
                          <option value="">
                            {getInputPlaceholder(field.key)}
                          </option>
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <Shield className="w-4 h-4 text-violet-600" />
                        </div>
                      </div>
                    ) : isPasswordField ? (
                      <div className="relative">
                        <input
                          type={
                            field.key === "password"
                              ? showPassword
                                ? "text"
                                : "password"
                              : showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          name={field.key}
                          value={form[field.key] || ""}
                          onChange={handleChange}
                          onBlur={() => handleBlur(field.key)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 pr-10 ${
                            hasError
                              ? "border-red-500 bg-red-50"
                              : "border-slate-200 focus:border-violet-500"
                          }`}
                          placeholder={getInputPlaceholder(field.key)}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            field.key === "password"
                              ? setShowPassword(!showPassword)
                              : setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-violet-600"
                        >
                          {field.key === "password" ? (
                            showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )
                          ) : showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        name={field.key}
                        value={form[field.key] || ""}
                        onChange={handleChange}
                        onBlur={() => handleBlur(field.key)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 ${
                          hasError
                            ? "border-red-500 bg-red-50"
                            : "border-slate-200 focus:border-violet-500"
                        }`}
                        placeholder={getInputPlaceholder(field.key)}
                      />
                    )}

                    {hasError && (
                      <div className="mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600">
                          {errors[field.key]}
                        </span>
                      </div>
                    )}
                  </Motion.div>
                );
              })}

              {/* Tambahkan password fields untuk edit mode jika changePassword true */}
              {editing && changePassword && (
                <>
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    data-field="password"
                    className="md:col-span-2"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                          <Lock className="w-4 h-4 text-violet-600" />
                          Password Baru
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={form.password || ""}
                            onChange={handleChange}
                            onBlur={() => handleBlur("password")}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 pr-10 ${
                              errors.password
                                ? "border-red-500 bg-red-50"
                                : "border-slate-200 focus:border-violet-500"
                            }`}
                            placeholder="Minimal 6 karakter"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-violet-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <div className="mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-red-600">
                              {errors.password}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                          <Key className="w-4 h-4 text-violet-600" />
                          Konfirmasi Password Baru
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={form.confirmPassword || ""}
                            onChange={handleChange}
                            onBlur={() => handleBlur("confirmPassword")}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 pr-10 ${
                              errors.confirmPassword
                                ? "border-red-500 bg-red-50"
                                : "border-slate-200 focus:border-violet-500"
                            }`}
                            placeholder="Ketik ulang password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-violet-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <div className="mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-red-600">
                              {errors.confirmPassword}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Motion.div>
                </>
              )}
            </div>

            {/* Role Information */}
            <div className="mb-6 p-4 bg-linear-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-600" />
                Informasi Role
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">User:</span>
                    <span className="font-medium text-slate-800">
                      Akses dasar untuk trading journal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">
                      Premium User:
                    </span>
                    <span className="font-medium text-slate-800">
                      Akses unlimited entries
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">Admin:</span>
                    <span className="font-medium text-slate-800">
                      Kelola user & sistem
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">
                      Super Admin:
                    </span>
                    <span className="font-medium text-slate-800">
                      Akses penuh sistem
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">Viewer:</span>
                    <span className="font-medium text-slate-800">
                      Hanya bisa melihat data
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">
                      Current Role:
                    </span>
                    <span
                      className={`font-bold ${
                        form.roleName === "admin" ||
                        form.roleName === "super_admin"
                          ? "text-violet-700"
                          : form.roleName === "premium_user"
                          ? "text-emerald-600"
                          : "text-slate-600"
                      }`}
                    >
                      {form.roleName
                        ? formatRoleName(form.roleName)
                        : "Belum dipilih"}
                    </span>
                  </div>
                </div>
              </div>

              {form.roleName && (
                <div className="mt-3 text-xs text-violet-600 font-medium bg-white/50 p-2 rounded-lg flex items-center gap-2">
                  {form.roleName === "admin" ||
                  form.roleName === "super_admin" ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <span>
                        Role Admin dan Super Admin memiliki akses penuh untuk
                        mengelola sistem
                      </span>
                    </>
                  ) : form.roleName === "premium_user" ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>
                        Premium User memiliki akses unlimited trading entries
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>
                        User reguler memiliki batasan sesuai plan yang dipilih
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Informasi format input */}
              <div className="mt-3 text-xs text-slate-600 bg-white/30 p-2 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MailCheck className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                  <p className="font-medium text-slate-700">
                    Informasi Pengisian Form:
                  </p>
                </div>
                <ul className="list-disc list-inside mt-1 space-y-1 pl-4">
                  <li className="flex items-start gap-1">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>
                      Field dengan tanda{" "}
                      <span className="text-red-500 font-bold">*</span> wajib
                      diisi
                    </span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>
                      Pastikan email valid dan belum terdaftar sebelumnya
                    </span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>
                      Nomor telepon: gunakan format Indonesia (08xxx atau
                      +62xxx)
                    </span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>Password minimal 6 karakter</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>Pilih role sesuai dengan kebutuhan akses user</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Validation Warning */}
            {showValidation && hasEmptyRequiredFields() && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Harap lengkapi semua field yang wajib diisi
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Field berikut masih kosong:{" "}
                      {getEmptyFieldLabels().join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={closeForm}
                disabled={isLoading}
                className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Batal
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={
                  isLoading || (showValidation && hasEmptyRequiredFields())
                }
                className={`px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2 ${
                  showValidation && hasEmptyRequiredFields()
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-linear-to-r from-violet-600 to-purple-600 text-white"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editing ? "Update User" : "Simpan User"}
                  </>
                )}
              </Motion.button>
            </div>
          </form>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default UserFormModal;
