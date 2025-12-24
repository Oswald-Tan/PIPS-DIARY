import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowLeft,
  Rocket,
  Crown,
  Target,
  Check,
  Star,
  Zap,
  HelpCircle,
  Mail,
} from "lucide-react";

// Import useSubscription hook
import { useSubscription } from "../../hooks/useSubscription";
import { getSubscription } from "../../features/subscriptionSlice";
import React from "react";

// Subscription plans configuration
const subscriptionPlans = {
  free: {
    name: "Free",
    maxEntries: 30,
    features: [
      "Maksimal 30 Entri Trading",
      "Dashboard Dasar dengan Statistik Sederhana",
      "Grafik Equity Curve Dasar",
      "Export Data CSV",
      "Analytics Dasar",
    ],
    price: 0,
  },
  pro: {
    name: "Pro",
    maxEntries: Infinity,
    features: [
      "Unlimited Trading Entries",
      "Advanced Analytics dengan Berbagai Chart",
      "Performance Metrics Detail",
      "Analisis Instrument & Strategy",
      "Win/Loss Distribution Charts",
      "Time of Day Analysis",
      "Trade Type Performance",
      "Unlimited Calendar Events",
      "Priority Support",
      "Update Fitur Gratis Selamanya",
      "Data Export Lengkap",
      "Backup Otomatis",
    ],
    price: 69000,
  },
  lifetime: {
    name: "Lifetime",
    maxEntries: Infinity,
    features: [
      "Semua Fitur Pro",
      "Akses Seumur Hidup",
      "Update Gratis Selamanya",
      "Priority Support Seumur Hidup",
      "Early Access to New Features",
    ],
    price: 799000,
  },
};

const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Gunakan useSubscription hook untuk mendapatkan data terbaru
  const { subscription: latestSubscription, isLoading: subscriptionLoading } =
    useSubscription();

  // Tetap gunakan Redux untuk backward compatibility
  const { subscription: reduxSubscription } = useSelector(
    (state) => state.auth
  );
  const { subscription: subscriptionFromSlice } = useSelector(
    (state) => state.subscription
  );

  // Gabungkan data dari ketiga sumber (prioritaskan data terbaru)
  const subscription =
    latestSubscription || subscriptionFromSlice || reduxSubscription;

  // Tentukan current plan
  const currentPlan = subscriptionPlans[subscription?.plan || "free"];

  const handleUpgrade = (plan) => {
    navigate("/checkout", {
      state: { plan },
    });
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  // Refresh subscription data saat komponen mount
  React.useEffect(() => {
    dispatch(getSubscription());
  }, [dispatch]);

  // Cek jika subscription loading
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-violet-700 font-semibold">
            Loading subscription data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <button
            onClick={handleBack}
            className="mb-6 w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </button>

          <Motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl md:text-6xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-4"
          >
            {subscription?.plan === "lifetime"
              ? "You Have Lifetime Access!"
              : "Upgrade Your Trading Journey"}
          </Motion.h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
            {subscription?.plan === "lifetime"
              ? "You already have the best plan! Enjoy unlimited access forever."
              : "Take your trading analysis to the next level with advanced features and unlimited access"}
          </p>

          {/* Current Plan Badge - dengan styling berbeda per plan */}
          <Motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mt-6"
          >
            <div
              className={`inline-flex items-center px-6 py-3 rounded-full font-bold text-lg shadow-sm ${
                subscription?.plan === "free"
                  ? "bg-white border-2 border-slate-200 text-slate-800"
                  : subscription?.plan === "pro"
                  ? "bg-linear-to-r from-violet-500 to-purple-500 text-white"
                  : "bg-linear-to-r from-amber-500 to-yellow-500 text-white"
              }`}
            >
              <span className="mr-2">Current Plan:</span>
              <span className="flex items-center gap-2">
                {subscription?.plan === "free" ? (
                  <Target className="w-5 h-5" />
                ) : subscription?.plan === "pro" ? (
                  <Rocket className="w-5 h-5" />
                ) : (
                  <Crown className="w-5 h-5" />
                )}
                {currentPlan.name}
              </span>
            </div>

            {/* Info tambahan untuk pro dan lifetime */}
            {subscription?.plan === "pro" && subscription?.expiresAt && (
              <p className="text-sm text-slate-500 mt-2">
                Expires on:{" "}
                {new Date(subscription.expiresAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}

            {subscription?.plan === "lifetime" && (
              <p className="text-sm text-emerald-600 mt-2 font-semibold">
                ✓ Unlimited access forever
              </p>
            )}
          </Motion.div>
        </Motion.div>

        {/* Plans Comparison */}
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
        >
          {/* Free Plan */}
          <Motion.div
            whileHover={
              subscription?.plan !== "free" ? { y: -10, scale: 1.02 } : {}
            }
            className={`relative rounded-3xl p-8 shadow-sm border-2 transition-all duration-300 h-full flex flex-col ${
              subscription?.plan === "free"
                ? "bg-linear-to-br from-slate-100 to-slate-50 border-slate-300 shadow-lg"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="text-center mb-8 flex-1">
              <div
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-inner ${
                  subscription?.plan === "free"
                    ? "bg-slate-200"
                    : "bg-slate-100"
                }`}
              >
                <Target
                  className={`w-8 h-8 ${
                    subscription?.plan === "free"
                      ? "text-slate-800"
                      : "text-slate-600"
                  }`}
                />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3">Free</h3>
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-5xl font-bold text-slate-800">Free</span>
              </div>

              <ul className="space-y-4 text-left">
                {subscriptionPlans.free.features.map((feature, index) => (
                  <Motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-start text-base font-medium"
                  >
                    <Check className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </Motion.li>
                ))}
              </ul>
            </div>

            <Motion.button
              whileHover={subscription?.plan !== "free" ? { scale: 1.05 } : {}}
              whileTap={subscription?.plan !== "free" ? { scale: 0.95 } : {}}
              onClick={() => handleUpgrade("free")}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-sm ${
                subscription?.plan === "free"
                  ? "bg-slate-300 text-slate-700 cursor-not-allowed"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
              disabled={subscription?.plan === "free"}
            >
              {subscription?.plan === "free"
                ? "Current Plan"
                : "Downgrade to Free"}
            </Motion.button>
          </Motion.div>

          {/* Pro Plan - Highlighted */}
          <Motion.div
            whileHover={
              subscription?.plan !== "pro" ? { y: -10, scale: 1.02 } : {}
            }
            className={`relative rounded-3xl p-8 shadow-sm border-2 transition-all duration-300 transform h-full flex flex-col ${
              subscription?.plan === "pro"
                ? "bg-linear-to-br from-violet-100 to-purple-100 border-violet-500 shadow-lg"
                : "bg-linear-to-br from-violet-50 to-purple-50 border-violet-400"
            }`}
          >
            {subscription?.plan !== "pro" && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-linear-to-r from-violet-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8 flex-1">
              <div
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-inner ${
                  subscription?.plan === "pro"
                    ? "bg-violet-200"
                    : "bg-violet-100"
                }`}
              >
                <Rocket
                  className={`w-8 h-8 ${
                    subscription?.plan === "pro"
                      ? "text-violet-800"
                      : "text-violet-600"
                  }`}
                />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3">Pro</h3>
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-5xl font-bold text-slate-800">
                  Rp 69k
                </span>
                <span className="text-slate-600 ml-2 text-xl font-semibold">
                  /month
                </span>
              </div>

              <ul className="space-y-4 text-left">
                {subscriptionPlans.pro.features.map((feature, index) => (
                  <Motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-start text-base font-medium"
                  >
                    <Check className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </Motion.li>
                ))}
              </ul>
            </div>

            <Motion.button
              whileHover={
                subscription?.plan !== "pro" ? { scale: 1.05, y: -2 } : {}
              }
              whileTap={subscription?.plan !== "pro" ? { scale: 0.95 } : {}}
              onClick={() => handleUpgrade("pro")}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-sm ${
                subscription?.plan === "pro"
                  ? "bg-violet-300 text-violet-700 cursor-not-allowed"
                  : "bg-linear-to-r from-violet-600 to-purple-600 text-white hover:shadow-md hover:from-violet-700 hover:to-purple-700"
              }`}
              disabled={subscription?.plan === "pro"}
            >
              {subscription?.plan === "pro"
                ? "Current Plan"
                : subscription?.plan === "lifetime"
                ? "Downgrade to Pro"
                : "Upgrade to Pro"}
            </Motion.button>
          </Motion.div>

          {/* Lifetime Plan */}
          <Motion.div
            whileHover={
              subscription?.plan !== "lifetime" ? { y: -10, scale: 1.02 } : {}
            }
            className={`relative rounded-3xl p-8 shadow-sm border-2 transition-all duration-300 h-full flex flex-col ${
              subscription?.plan === "lifetime"
                ? "bg-linear-to-br from-amber-100 to-yellow-100 border-amber-500 shadow-lg"
                : "bg-linear-to-br from-slate-50 to-slate-100 border-amber-400"
            }`}
          >
            {subscription?.plan !== "lifetime" && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-linear-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Best Value
                </span>
              </div>
            )}

            <div className="text-center mb-8 flex-1">
              <div
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-inner ${
                  subscription?.plan === "lifetime"
                    ? "bg-amber-200"
                    : "bg-amber-100"
                }`}
              >
                <Crown
                  className={`w-8 h-8 ${
                    subscription?.plan === "lifetime"
                      ? "text-amber-800"
                      : "text-amber-600"
                  }`}
                />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3">
                Lifetime
              </h3>
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-5xl font-bold text-slate-800">
                  Rp 799k
                </span>
              </div>

              <ul className="space-y-4 text-left">
                {subscriptionPlans.lifetime.features.map((feature, index) => (
                  <Motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-start text-base font-medium"
                  >
                    <Check className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                    <span
                      className={`${
                        subscription?.plan === "lifetime"
                          ? "font-bold text-slate-800"
                          : "text-slate-700 font-semibold"
                      }`}
                    >
                      {feature}
                    </span>
                  </Motion.li>
                ))}
              </ul>
            </div>

            <Motion.button
              whileHover={
                subscription?.plan !== "lifetime" ? { scale: 1.05, y: -2 } : {}
              }
              whileTap={
                subscription?.plan !== "lifetime" ? { scale: 0.95 } : {}
              }
              onClick={() => handleUpgrade("lifetime")}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-sm ${
                subscription?.plan === "lifetime"
                  ? "bg-amber-300 text-amber-700 cursor-not-allowed"
                  : "bg-linear-to-r from-amber-500 to-yellow-500 text-white hover:shadow-md hover:from-amber-600 hover:to-yellow-600"
              }`}
              disabled={subscription?.plan === "lifetime"}
            >
              {subscription?.plan === "lifetime"
                ? "🎉 You Own This Plan!"
                : "Get Lifetime"}
            </Motion.button>
          </Motion.div>
        </Motion.div>

        {/* FAQ Section */}
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-8 flex items-center justify-center gap-3">
            <HelpCircle className="w-8 h-8 text-violet-600" />
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "Apakah bisa upgrade kapan saja?",
                answer:
                  "Ya, Anda bisa upgrade dari plan Free ke Pro atau Lifetime kapan saja. Downgrade dari Pro ke Free akan berlaku pada akhir periode billing.",
              },
              {
                question: "Apakah data trading saya aman?",
                answer:
                  "Sangat aman! Semua data trading Anda disimpan secara encrypted dan tidak akan pernah kami share ke pihak manapun.",
              },
              {
                question: "Bagaimana cara pembayaran?",
                answer:
                  "Kami menerima berbagai metode pembayaran: transfer bank, e-wallet (Gopay, OVO, Dana), dan kartu kredit.",
              },
              {
                question: "Apakah bisa trial plan Pro?",
                answer:
                  "Saat ini kami belum menyediakan trial plan Pro. Namun Anda bisa berlangganan kapan saja dan langsung mendapatkan akses penuh ke semua fitur premium tanpa batasan.",
              },
            ].map((faq, index) => (
              <Motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <h3 className="font-bold text-slate-800 text-lg mb-2">
                  {faq.question}
                </h3>
                <p className="text-slate-700">{faq.answer}</p>
              </Motion.div>
            ))}
          </div>
        </Motion.div>

        {/* Final CTA - Sesuaikan dengan plan user */}
        {subscription?.plan !== "lifetime" ? (
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-linear-to-r from-violet-600 to-purple-600 rounded-3xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Trading Journey?
              </h2>
              <p className="text-violet-100 text-lg mb-6 max-w-2xl mx-auto font-light">
                Join thousands of traders who have upgraded their analysis and
                achieved better results with our advanced tools.
              </p>
              <Motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  handleUpgrade(
                    subscription?.plan === "free" ? "pro" : "lifetime"
                  )
                }
                className="bg-white text-violet-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 mx-auto"
              >
                <Rocket className="w-5 h-5" />
                {subscription?.plan === "free"
                  ? "Upgrade to Pro"
                  : "Upgrade to Lifetime"}
              </Motion.button>
            </div>
          </Motion.div>
        ) : (
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-linear-to-r from-emerald-600 to-green-600 rounded-3xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-white mb-4">
                🎉 You're All Set!
              </h2>
              <p className="text-emerald-100 text-lg mb-6 max-w-2xl mx-auto font-light">
                You have lifetime access to all premium features. Enjoy
                unlimited trading analysis forever!
              </p>
              <Motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/dashboard")}
                className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 mx-auto"
              >
                <Zap className="w-5 h-5" />
                Go to Dashboard
              </Motion.button>
            </div>
          </Motion.div>
        )}

        {/* Footer Note */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8 text-slate-600"
        >
          <p className="flex md:flex-row flex-col items-center justify-center gap-x-2">
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Need help deciding?
            </span>
            <span className="font-semibold">Contact our support team</span>
          </p>
        </Motion.div>
      </div>
    </div>
  );
};

export default Layout;
