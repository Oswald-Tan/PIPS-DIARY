import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion as Motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { RegisterUser, reset, clearError } from "../../features/authSlice"; // Import clearError
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Globe,
} from "lucide-react";
import CountrySelect from "../../components/CountrySelect";

const RegisterPage = ({ onShowTradingJournal }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    country: "US",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    country: false,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isSuccess, isLoading, isError, message, error } = useSelector(
    (state) => state.auth
  );

  // Reset error state ketika komponen mount
  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Redirect effect setelah registrasi berhasil
  useEffect(() => {
    if (user || isSuccess) {
      navigate("/");

      if (onShowTradingJournal) {
        onShowTradingJournal();
      }
    }
  }, [user, isSuccess, dispatch, navigate, onShowTradingJournal]);

  // Auto-clear error setelah beberapa detik
  useEffect(() => {
    if (isError && error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 8000); // Clear setelah 8 detik

      return () => clearTimeout(timer);
    }
  }, [isError, error, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear backend error ketika user mulai mengedit field yang bermasalah
    if (isError) {
      // Cek jika error terkait dengan field yang sedang diubah
      const emailError = error?.toLowerCase().includes("email");
      const passwordError = error?.toLowerCase().includes("password");

      if (
        (emailError && name === "email") ||
        (passwordError && (name === "password" || name === "confirmPassword"))
      ) {
        dispatch(clearError());
      }
    }

    // Clear frontend validation error
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Reset submitted state
    if (hasSubmitted) {
      setHasSubmitted(false);
    }
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });

    // Clear error ketika user focus ke field
    if (isError) {
      dispatch(clearError());
    }
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const validateForm = () => {
    const errors = {};

    // Validasi nama
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Validasi email
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    // Validasi password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Validasi konfirmasi password
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Validasi terms
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = "You must agree to the terms and conditions";
    }

    // Add country validation
    if (!formData.country) {
      errors.country = "Please select your country";
    } else if (formData.country.length !== 3) {
      errors.country = "Invalid country code";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    // Clear previous errors
    dispatch(clearError());

    if (validateForm()) {
      dispatch(
        RegisterUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          country: formData.country,
        })
      );
    }
  };

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

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-purple-50 to-indigo-50 overflow-hidden relative">
      {/* Background Effects matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* violet gradient from bottom left */}
        <div className="absolute bottom-0 left-0 w-1/2 h-3/4 bg-linear-to-t from-violet-500/30 via-violet-300/20 to-transparent blur-3xl"></div>

        {/* purple gradient from bottom right */}
        <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-linear-to-t from-purple-500/30 via-purple-300/20 to-transparent blur-3xl"></div>

        {/* Center violet glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2/3 bg-linear-to-t from-violet-400/15 to-transparent blur-2xl"></div>

        {/* Grain/Noise Effect */}
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter'%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-violet-500 to-purple-500 rounded-2xl shadow-lg mb-4"
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </Motion.div>

              <h2 className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Start Your Journey
              </h2>
              <p className="text-slate-600 font-light">
                Create your professional trading journal
              </p>
            </div>

            {/* Error Message */}
            {isError && error && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-light flex items-center justify-between"
              >
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  <span>{error || message}</span>
                </div>
                <button
                  onClick={() => dispatch(clearError())}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ✕
                </button>
              </Motion.div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-6 text-sm font-light flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {message || "Registration successful! Redirecting..."}
              </Motion.div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className={`block transition-all duration-200 text-sm text-slate-700 mb-2 font-light`}
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus("name")}
                    onBlur={() => handleBlur("name")}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:outline-none transition-all duration-300 text-slate-900 placeholder-slate-400 font-light ${
                      formErrors.name
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-violet-500"
                    }`}
                    placeholder="John Trader"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-600 font-light">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className={`block transition-all duration-200 text-sm text-slate-700 mb-2 font-light`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus("email")}
                    onBlur={() => handleBlur("email")}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:outline-none transition-all duration-300 text-slate-900 placeholder-slate-400 font-light ${
                      formErrors.email
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-violet-500"
                    }`}
                    placeholder="trader@example.com"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600 font-light">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Country Field - Add this after Email field */}
              <div>
                <label
                  htmlFor="country"
                  className={`block transition-all duration-200 text-sm text-slate-700 mb-2 font-light`}
                >
                  Country / Region
                </label>
                <CountrySelect
                  value={formData.country}
                  onChange={(value) => {
                    handleChange({
                      target: { name: "country", value, type: "select" },
                    });
                  }}
                  error={formErrors.country}
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className={`block transition-all duration-200 text-sm text-slate-700 mb-2 font-light`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus("password")}
                    onBlur={() => handleBlur("password")}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:outline-none transition-all duration-300 text-slate-900 placeholder-slate-400 font-light pr-12 ${
                      formErrors.password
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-violet-500"
                    }`}
                    placeholder="Create a strong password"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
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

                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-600 font-light">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={`block transition-all duration-200 text-sm text-slate-700 mb-2 font-light`}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus("confirmPassword")}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:outline-none transition-all duration-300 text-slate-900 placeholder-slate-400 font-light pr-12 ${
                      formErrors.confirmPassword
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-violet-500"
                    }`}
                    placeholder="Confirm your password"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 font-light">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`w-4 h-4 mt-1 rounded ${
                    formErrors.agreeToTerms
                      ? "text-red-500 bg-red-100 border-red-300"
                      : "text-violet-600 bg-slate-100 border-slate-300"
                  }`}
                />
                <label
                  htmlFor="agreeToTerms"
                  className="ml-2 block text-sm text-slate-700 font-light"
                >
                  I agree to the{" "}
                  <Link to ="/terms"
                    className="font-medium bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hover:from-violet-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy"
                    className="font-medium bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hover:from-violet-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {formErrors.agreeToTerms && (
                <p className="text-xs text-red-600 -mt-2 font-light">
                  {formErrors.agreeToTerms}
                </p>
              )}

              {/* Security Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Secure Registration
                    </h4>
                    <p className="text-xs text-blue-700 font-light">
                      Your data is encrypted and protected. We never share your
                      trading information with third parties.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{
                  scale: isLoading ? 1 : 1.02,
                  y: isLoading ? 0 : -2,
                }}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <span>Create My Trading Journal</span>
                    <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Motion.button>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500 font-light">
                    Already have an account?
                  </span>
                </div>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-500 transition-colors duration-300"
              >
                Sign in to your account
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
