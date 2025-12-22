import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Mail, 
  Key, 
  CheckCircle, 
  ArrowLeft, 
  AlertCircle,
  Send,
  Shield,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  requestResetOtp, 
  verifyResetOtp, 
  resetPassword,
  resetPasswordState,
  clearError 
} from '../../features/authSlice';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { isLoading, isError, error, isSuccess, message } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Reset Password, 4: Success
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer untuk resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Reset state ketika komponen unmount
  useEffect(() => {
    return () => {
      dispatch(resetPasswordState());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error ketika user mulai mengetik
    if (isError) {
      dispatch(clearError());
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const result = await dispatch(requestResetOtp(formData.email));
    if (requestResetOtp.fulfilled.match(result)) {
      setStep(2);
      setCountdown(60); // 60 detik countdown untuk resend
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const result = await dispatch(verifyResetOtp({
      email: formData.email,
      otp: formData.otp
    }));
    if (verifyResetOtp.fulfilled.match(result)) {
      setStep(3);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      dispatch(clearError());
      // Set custom error untuk password mismatch
      dispatch({
        type: 'auth/resetPassword/rejected',
        payload: 'Password dan konfirmasi password tidak cocok'
      });
      return;
    }

    const result = await dispatch(resetPassword({
      email: formData.email,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    }));
    
    if (resetPassword.fulfilled.match(result)) {
      setStep(4);
    }
  };

  const handleResendOtp = async () => {
    if (countdown === 0) {
      const result = await dispatch(requestResetOtp(formData.email));
      if (requestResetOtp.fulfilled.match(result)) {
        setCountdown(60);
      }
    }
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasLetter && hasNumber && hasSpecialChar;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-purple-50 to-indigo-50 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-1/2 h-3/4 bg-linear-to-t from-violet-500/30 via-violet-300/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-linear-to-t from-purple-500/30 via-purple-300/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2/3 bg-linear-to-t from-violet-400/15 to-transparent blur-2xl"></div>
        
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
                <Key className="w-6 h-6 text-white" />
              </Motion.div>
              
              <h2 className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {step === 1 && 'Reset Password'}
                {step === 2 && 'Verify OTP'}
                {step === 3 && 'New Password'}
                {step === 4 && 'Success!'}
              </h2>
              <p className="text-slate-600 font-light">
                {step === 1 && 'Enter your email to receive OTP'}
                {step === 2 && 'Enter the OTP sent to your email'}
                {step === 3 && 'Create your new password'}
                {step === 4 && 'Your password has been reset successfully'}
              </p>
            </div>

            {/* Error Message */}
            {isError && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-2xl border border-red-200 mb-6"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </Motion.div>
            )}

            {/* Success Message */}
            {isSuccess && step !== 4 && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-green-500 bg-green-50 p-3 rounded-2xl border border-green-200 mb-6"
              >
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{message}</span>
              </Motion.div>
            )}

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm text-slate-700 mb-2 font-light">
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all duration-300 text-slate-900 placeholder-slate-400 font-light"
                      placeholder="trader@example.com"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <Motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? 'Sending OTP...' : 'Send OTP'}</span>
                  <Send className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Motion.button>
              </form>
            )}

            {/* Step 2: Verify OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-2">
                    OTP Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength="6"
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all duration-300 text-slate-900 placeholder-slate-400 font-light text-center text-lg tracking-widest"
                    placeholder="123456"
                  />
                  <p className="mt-2 text-sm text-slate-600 font-light">
                    Enter the 6-digit code sent to {formData.email}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Motion.button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-slate-100 text-slate-700 font-medium py-4 rounded-2xl border border-slate-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                  </Motion.button>
                  
                  <Motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading || formData.otp.length !== 6}
                    className="flex-1 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Motion.button>
                </div>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all duration-300 text-slate-900 placeholder-slate-400 font-light pr-12"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.newPassword && !validatePassword(formData.newPassword) && (
                    <p className="mt-2 text-sm text-amber-600">
                      Password must contain at least 8 characters with letters, numbers, and special characters
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all duration-300 text-slate-900 placeholder-slate-400 font-light pr-12"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <Motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading || !validatePassword(formData.newPassword) || formData.newPassword !== formData.confirmPassword}
                  className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Motion.button>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center space-y-6"
              >
                <Motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full border border-emerald-200"
                >
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </Motion.div>

                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Password Reset Successful!
                  </h3>
                  <p className="text-slate-600 font-light">
                    Your password has been reset successfully. You can now login with your new password.
                  </p>
                </div>

                <Link to="/">
                  <Motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Back to Login
                  </Motion.button>
                </Link>
              </Motion.div>
            )}

            {/* Navigation Links */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex flex-col space-y-3 text-center">
                {step !== 4 && (
                  <Link 
                    to="/" 
                    className="inline-flex items-center justify-center text-sm font-medium text-violet-600 hover:text-violet-500 transition-colors duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Link>
                )}
                <p className="text-xs text-slate-500 font-light">
                  Need help?{' '}
                  <a href="mailto:support@pipsdiary.com" className="font-medium bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hover:from-violet-700 hover:to-purple-700 transition-all duration-300">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>

            {/* Security Note */}
            {(step === 1 || step === 2) && (
              <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">Security Notice</h4>
                    <p className="text-xs text-amber-700 font-light">
                      For your security, the OTP will expire in 10 minutes. Make sure to check your spam folder if you don't see the email.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;