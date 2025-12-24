import React, { useState, useEffect, useRef } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Check,
  Shield,
  Lock,
  Clock,
  Zap,
  Gift,
  Star,
  BadgeCheck,
  ShieldCheck,
  Mail,
  Smartphone,
  BarChart3,
  Rocket,
  Crown,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import TermsModal from "../../components/modals/TermsModal";
import axios from "axios";
import { API_URL, MIDTRANS_CLIENT_KEY } from "../../config";
import Swal from "sweetalert2";
import {
  downgradeToFree,
  reset as resetSubscription,
} from "../../features/subscriptionSlice";

// Komponen Modal Downgrade Confirmation
const DowngradeConfirmationModal = ({
  showModal,
  setShowModal,
  onConfirm,
  isLoading = false,
  selectedPlan = "free",
}) => {
  const navigate = useNavigate();

  // Ambil subscription dari state subscriptionSlice, bukan dari auth
  const { subscription: reduxSubscription } = useSelector(
    (state) => state.subscription
  );

  // Juga ambil dari auth untuk fallback
  const { user } = useSelector((state) => state.auth);

  // Data plan untuk perbandingan
  const plans = {
    free: {
      name: "Free",
      features: [
        "Maksimal 30 Entri Trading",
        "Dashboard Dasar",
        "Grafik Equity Curve Dasar",
        "Export Data CSV",
        "Analytics Dasar",
      ],
      icon: BarChart3,
      color: "slate",
    },
    pro: {
      name: "Pro",
      features: [
        "Unlimited Trading Entries",
        "Advanced Analytics",
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
      icon: Rocket,
      color: "violet",
    },
    lifetime: {
      name: "Lifetime",
      features: [
        "Semua Fitur Pro",
        "Akses Seumur Hidup",
        "Update Gratis Selamanya",
        "Priority Support Seumur Hidup",
        "Fitur Premium Mendatang",
        "VIP Status",
      ],
      icon: Crown,
      color: "amber",
    },
  };

  // Tentukan plan current user - prioritaskan dari subscriptionSlice, kemudian dari auth
  const currentPlan =
    reduxSubscription?.plan || user?.subscription?.plan || "free";
  const currentPlanData = plans[currentPlan] || plans.free;
  const CurrentPlanIcon = currentPlanData.icon;

  console.log("🔄 Debug subscription data:", {
    reduxSubscription,
    authSubscription: user?.subscription,
    currentPlan,
    selectedPlan,
  });

  // Fitur yang akan hilang (fitur di current plan yang tidak ada di free plan)
  const getFeaturesToLose = () => {
    const freeFeatures = plans.free.features;
    const currentFeatures = currentPlanData.features;

    // Kembalikan fitur yang ada di current plan tapi tidak ada di free plan
    return currentFeatures.filter((feature) => !freeFeatures.includes(feature));
  };

  const featuresToLose = getFeaturesToLose();
  const featuresToKeep = plans.free.features;

  const handleConfirm = () => {
    onConfirm();
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  // Jika user sudah menggunakan free plan, tampilkan pesan berbeda
  if (currentPlan === "free" && selectedPlan === "free") {
    return (
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={handleCancel}
      >
        <Motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 md:p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Anda Sudah Menggunakan Free Plan
              </h2>
              <p className="text-slate-600 mb-6">
                Anda tidak dapat melakukan downgrade karena sudah menggunakan
                plan gratis.
              </p>
              <div className="flex flex-col gap-3">
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="w-full px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                >
                  Tutup
                </Motion.button>
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowModal(false);
                    navigate("/upgrade");
                  }}
                  className="w-full px-6 py-3 border-2 border-violet-600 text-violet-600 rounded-xl font-medium hover:bg-violet-50 transition-colors"
                >
                  Lihat Plan Lainnya
                </Motion.button>
              </div>
            </div>
          </div>
        </Motion.div>
      </Motion.div>
    );
  }

  // Tampilkan modal downgrade normal jika user belum free
  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleCancel}
    >
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-slate-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-red-100 to-rose-100 flex items-center justify-center shadow-sm">
                <BarChart3 className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Downgrade ke Free Plan
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Konfirmasi perubahan dari {currentPlanData.name} Plan ke Free
                  Plan
                </p>
              </div>
            </div>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCancel}
              className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </Motion.button>
          </div>

          {/* Current Plan Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-slate-100 to-slate-200 rounded-full border border-slate-300">
              <div
                className={`w-2 h-2 rounded-full ${
                  currentPlan === "pro"
                    ? "bg-violet-500"
                    : currentPlan === "lifetime"
                    ? "bg-amber-500"
                    : "bg-slate-500"
                }`}
              ></div>
              <span className="text-sm font-semibold text-slate-700">
                Current Plan:{" "}
                <span
                  className={`${
                    currentPlan === "pro"
                      ? "text-violet-700"
                      : currentPlan === "lifetime"
                      ? "text-amber-700"
                      : "text-slate-700"
                  } capitalize`}
                >
                  {currentPlan}
                </span>
              </span>
              <CurrentPlanIcon
                className={`w-4 h-4 ${
                  currentPlan === "pro"
                    ? "text-violet-600"
                    : currentPlan === "lifetime"
                    ? "text-amber-600"
                    : "text-slate-600"
                }`}
              />
            </div>
          </div>

          {/* Warning Message */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                <span className="text-amber-600 font-bold">!</span>
              </div>
              <div>
                <p className="text-amber-800 font-medium">Perhatian!</p>
                <p className="text-sm text-amber-700 mt-1">
                  Anda akan menurunkan plan dari{" "}
                  <span className="font-bold">{currentPlanData.name}</span> ke{" "}
                  <span className="font-bold">Free</span>. Beberapa fitur
                  premium akan tidak tersedia lagi.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Perbandingan Fitur
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Features to Lose */}
              <div className="border border-red-200 rounded-xl p-4 bg-linear-to-br from-red-50/50 to-rose-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <h4 className="font-bold text-red-700">Yang akan hilang:</h4>
                </div>
                <ul className="space-y-2">
                  {featuresToLose.length > 0 ? (
                    featuresToLose.map((feature, index) => (
                      <Motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5 shrink-0">
                            <X className="w-3 h-3 text-red-500" />
                          </div>
                          <span className="text-sm text-slate-700">
                            {feature}
                          </span>
                        </li>
                      </Motion.div>
                    ))
                  ) : (
                    <li className="text-sm text-slate-600 italic">
                      Tidak ada fitur yang hilang
                    </li>
                  )}
                </ul>
              </div>

              {/* Features to Keep */}
              <div className="border border-emerald-200 rounded-xl p-4 bg-linear-to-br from-emerald-50/50 to-green-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-emerald-700">
                    Yang tetap ada:
                  </h4>
                </div>
                <ul className="space-y-2">
                  {featuresToKeep.map((feature, index) => (
                    <Motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <li className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5 shrink-0">
                          <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                        <span className="text-sm text-slate-700">
                          {feature}
                        </span>
                      </li>
                    </Motion.div>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="mb-6 space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-700">
                <span className="font-bold">Sisa Entri Trading:</span> Jika Anda
                memiliki lebih dari 30 entri, Anda tetap dapat melihat semuanya
                tetapi tidak dapat menambahkan baru hingga di bawah batas.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-bold">Data Anda Aman:</span> Semua data
                trading yang sudah Anda input akan tetap tersimpan dengan aman.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-6 border-t border-slate-200">
            <Motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full px-6 py-4 bg-linear-to-r from-rose-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses Downgrade...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Ya, Saya Setuju Downgrade
                </>
              )}
            </Motion.button>

            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
            >
              Batal, Tetap di {currentPlanData.name} Plan
            </Motion.button>
          </div>

          {/* Upgrade Option */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Ingin tetap menggunakan fitur premium?{" "}
              <button
                type="button"
                className="text-violet-600 hover:text-violet-700 font-medium hover:underline"
                onClick={() => {
                  setShowModal(false);
                  navigate("/upgrade");
                }}
              >
                Lihat plan lainnya
              </button>
            </p>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // State dari Redux
  const { user } = useSelector((state) => state.auth);
  const { subscription: reduxSubscription, isLoading: subscriptionLoading } =
    useSelector((state) => state.subscription);

  const subscription = reduxSubscription;

  // Local state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [localSubscriptionSuccess, setLocalSubscriptionSuccess] =
    useState(false);
  const [localSubscriptionError, setLocalSubscriptionError] = useState(false);
  const [localSubscriptionMessage, setLocalSubscriptionMessage] = useState("");

  // State untuk Snap Embed
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedToken, setEmbedToken] = useState(null);
  const [embedOrderId, setEmbedOrderId] = useState("");
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const snapEmbedInstance = useRef(null);
  const embedContainerRef = useRef(null);

  // State tambahan untuk continue payment
  const [isContinuingPayment, setIsContinuingPayment] = useState(false);
  const [pendingTransactionData, setPendingTransactionData] = useState(null);

  // State untuk modal downgrade
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

  // Ambil data plan dari state navigasi
  const selectedPlan = location.state?.plan || "pro";
  const continueOrderId = location.state?.orderId;
  const isContinuePayment = location.state?.continuePayment;

  // Reset subscription state saat komponen unmount
  useEffect(() => {
    return () => {
      dispatch(resetSubscription());
      setLocalSubscriptionSuccess(false);
      setLocalSubscriptionError(false);
      setLocalSubscriptionMessage("");

      // Cleanup Snap Embed instance
      if (snapEmbedInstance.current) {
        const embedContainer = document.getElementById("snap-embed-container");
        if (embedContainer) {
          embedContainer.innerHTML = "";
        }
        snapEmbedInstance.current = null;
      }
    };
  }, [dispatch]);

  // Handle local subscription success/error (untuk paid plans)
  useEffect(() => {
    if (localSubscriptionSuccess && selectedPlan !== "free") {
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: localSubscriptionMessage || "Plan berhasil diupdate",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate("/dashboard");
      });
    }

    if (localSubscriptionError && selectedPlan !== "free") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: localSubscriptionMessage || "Gagal mengupdate plan",
        confirmButtonText: "Coba Lagi",
      });
      setIsDowngrading(false);
    }
  }, [
    localSubscriptionSuccess,
    localSubscriptionError,
    localSubscriptionMessage,
    navigate,
    selectedPlan,
  ]);

  // Data plan
  const plans = {
    free: {
      name: "Free",
      description: "Plan Dasar untuk Mulai Trading",
      price: 0,
      period: "selamanya",
      features: [
        "Maksimal 30 Entri Trading",
        "Dashboard Dasar",
        "Grafik Equity Curve Dasar",
        "Export Data CSV",
        "Analytics Dasar",
      ],
      icon: BarChart3,
      color: "slate",
      popular: false,
      bgHeaderClass: "bg-slate-600",
      bgFromClass: "from-slate-600",
      bgToClass: "to-slate-700",
      bgLightClass: "bg-slate-100",
      textColorClass: "text-slate-600",
    },
    pro: {
      name: "Pro",
      description: "Untuk Trader Serius",
      price: 69000,
      period: "per bulan",
      features: [
        "Unlimited Trading Entries",
        "Advanced Analytics",
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
      icon: Rocket,
      color: "violet",
      popular: true,
      bgHeaderClass: "bg-violet-600",
      bgFromClass: "from-violet-600",
      bgToClass: "to-violet-700",
      bgLightClass: "bg-violet-100",
      textColorClass: "text-violet-600",
    },
    lifetime: {
      name: "Lifetime",
      description: "Investasi Seumur Hidup",
      price: 799000,
      period: "sekali bayar",
      features: [
        "Semua Fitur Pro",
        "Akses Seumur Hidup",
        "Update Gratis Selamanya",
        "Priority Support Seumur Hidup",
        "Fitur Premium Mendatang",
        "VIP Status",
      ],
      icon: Crown,
      color: "amber",
      popular: false,
      bgHeaderClass: "bg-amber-600",
      bgFromClass: "from-amber-600",
      bgToClass: "to-amber-700",
      bgLightClass: "bg-amber-100",
      textColorClass: "text-amber-600",
    },
  };

  const plan = plans[selectedPlan];
  const PlanIcon = plan.icon;

  // State untuk form
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Load Midtrans script
  useEffect(() => {
    const loadMidtransScript = () => {
      if (window.snap) {
        setIsScriptLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);

      script.onload = () => {
        console.log("Midtrans Snap script loaded successfully");
        setIsScriptLoaded(true);
      };

      script.onerror = () => {
        console.error("Failed to load Midtrans Snap script");
        setIsScriptLoaded(false);
      };

      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };

    loadMidtransScript();
  }, []);

  // Cleanup old transactions
  useEffect(() => {
    const cleanupOldTransactions = () => {
      try {
        const savedTransaction = JSON.parse(
          localStorage.getItem("lastTransaction") || "{}"
        );
        if (savedTransaction.orderId && savedTransaction.status === "ERROR") {
          localStorage.removeItem("lastTransaction");
        }
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };

    cleanupOldTransactions();
  }, []);

  // Fungsi untuk melanjutkan pembayaran yang tertunda
  const continuePendingPayment = async (orderId) => {
    setIsContinuingPayment(true);
    try {
      console.log(`🔄 Melanjutkan pembayaran untuk: ${orderId}`);

      // Cek di localStorage terlebih dahulu
      const savedTransaction = JSON.parse(
        localStorage.getItem("lastTransaction") || "{}"
      );

      let token = null;
      let storedPlan = selectedPlan;

      if (savedTransaction.orderId === orderId && savedTransaction.token) {
        token = savedTransaction.token;
        storedPlan = savedTransaction.plan || selectedPlan;
      }

      // Jika tidak ada di localStorage, ambil dari API
      if (!token) {
        const response = await axios.get(
          `${API_URL}/transactions/status/${orderId}`
        );

        if (response.data.success) {
          const transaction = response.data.data;

          // Cek status transaksi
          if (transaction.status === "PENDING_PAYMENT") {
            token = transaction.snap_token;
            storedPlan = transaction.plan;
          } else if (transaction.status === "PAID") {
            // Jika sudah dibayar, redirect ke success
            navigate(`/checkout-success?order_id=${orderId}`, {
              state: {
                orderId: orderId,
                status: "PAID",
                plan: transaction.plan,
              },
            });
            return;
          } else {
            // Status lainnya (canceled, expired, etc)
            Swal.fire({
              icon: "info",
              title: "Status Transaksi Berubah",
              text: `Transaksi ini sudah ${transaction.status.toLowerCase()}. Silakan buat transaksi baru.`,
            });
            navigate("/upgrade");
            return;
          }
        }
      }

      if (token) {
        // Set data untuk embed
        setEmbedToken(token);
        setEmbedOrderId(orderId);

        // Tampilkan embed
        setTimeout(() => {
          setShowEmbed(true);
          setIsContinuingPayment(false);
        }, 500);

        // Hapus state navigasi
        navigate(location.pathname, { replace: true, state: {} });
      } else {
        throw new Error("Token pembayaran tidak tersedia");
      }
    } catch (error) {
      console.error("❌ Gagal melanjutkan pembayaran:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Melanjutkan Pembayaran",
        text:
          error.response?.data?.message ||
          error.message ||
          "Silakan coba membuat transaksi baru",
      });
      setIsContinuingPayment(false);
      navigate("/upgrade");
    }
  };

  // Handle continue payment saat komponen dimuat
  useEffect(() => {
    if (isContinuePayment && continueOrderId) {
      console.log("🔄 Continue payment detected:", continueOrderId);
      continuePendingPayment(continueOrderId);
    }
  }, [isContinuePayment, continueOrderId]);

  // Hitung total
  const calculateTotal = () => {
    let total = plan.price;
    if (discount > 0) {
      total -= discount;
    }
    return total < 0 ? 0 : total;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle back button
  const handleBack = () => {
    if (showEmbed) {
      Swal.fire({
        title: "Batalkan Pembayaran?",
        html: `
        <div class="text-left">
          <p>Apakah Anda yakin ingin membatalkan pembayaran ini?</p>
          <ul class="text-sm text-slate-600 mt-2 space-y-1">
            <li>• Transaksi akan <strong>dibatalkan</strong> dan tidak dapat dilanjutkan</li>
            <li>• Order ID: <code class="bg-slate-100 px-1 rounded">${embedOrderId}</code></li>
            <li>• Untuk melanjutkan, Anda perlu membuat transaksi baru</li>
          </ul>
          <p class="mt-3 text-sm text-amber-600">Pembatalan tidak dapat dibatalkan ulang.</p>
        </div>
      `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Batalkan",
        cancelButtonText: "Lanjutkan Bayar",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#7c3aed",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // Panggil API untuk membatalkan transaksi
            const cancelResponse = await axios.post(
              `${API_URL}/transactions/${embedOrderId}/cancel`
            );

            if (cancelResponse.data.success) {
              // Hapus dari localStorage
              localStorage.removeItem("lastTransaction");
              localStorage.removeItem("pendingPayment");

              // Cleanup Snap Embed
              setShowEmbed(false);
              setEmbedLoaded(false);
              setEmbedToken(null);
              setEmbedOrderId("");

              const embedContainer = document.getElementById(
                "snap-embed-container"
              );
              if (embedContainer) {
                embedContainer.innerHTML = "";
              }
              snapEmbedInstance.current = null;

              // Navigasi ke halaman transaksi dengan status canceled
              navigate(`/checkout-success?order_id=${embedOrderId}`, {
                state: {
                  orderId: embedOrderId,
                  status: "CANCELED",
                  plan: selectedPlan,
                  note: "Pembayaran telah dibatalkan oleh pengguna",
                },
              });
            } else {
              throw new Error(cancelResponse.data.message);
            }
          } catch (error) {
            console.error("❌ Gagal membatalkan transaksi:", error);
            Swal.fire({
              icon: "error",
              title: "Gagal Membatalkan",
              text:
                error.response?.data?.message ||
                "Gagal membatalkan transaksi. Silakan coba lagi.",
            });
          }
        }
        // Jika cancel (Lanjutkan Bayar), tidak melakukan apa-apa, biarkan user tetap di embed
      });
    } else {
      navigate("/upgrade");
    }
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle coupon apply
  const handleApplyCoupon = () => {
    if (couponCode.trim() === "") return;

    const validCoupons = {
      TRADER10: 0.1,
      PRO20: 0.2,
      LAUNCH: 0.25,
    };

    if (validCoupons[couponCode.toUpperCase()]) {
      const discountPercentage = validCoupons[couponCode.toUpperCase()];
      const discountAmount = plan.price * discountPercentage;
      setDiscount(discountAmount);
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Kode kupon tidak valid! Silakan coba lagi.",
      });
      setCouponCode("");
    }
  };

  // Handle downgrade confirmation
  const handleConfirmDowngrade = async () => {
    setIsDowngrading(true);
    try {
      const result = await dispatch(downgradeToFree()).unwrap();

      if (result.success) {
        // Tampilkan sukses dengan modal atau redirect
        Swal.fire({
          icon: "success",
          title: "Downgrade Berhasil!",
          text: "Anda sekarang menggunakan Free Plan",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/dashboard");
        });

        // Trigger subscription update untuk komponen lain
        window.dispatchEvent(new Event("subscriptionUpdated"));

        // Reset local state
        setLocalSubscriptionSuccess(false);
        setLocalSubscriptionError(false);
      }
    } catch (error) {
      console.error("Downgrade error:", error);
      Swal.fire({
        icon: "error",
        title: "Downgrade Gagal",
        text: error.message || "Terjadi kesalahan saat downgrade",
        confirmButtonText: "OK",
      });
      setIsDowngrading(false);
    }
  };

  // Handle free plan activation dengan modal custom
  const handleFreePlan = async () => {
    // Tampilkan modal downgrade
    setShowDowngradeModal(true);
  };

  // Setup Snap Embed
  const setupSnapEmbed = () => {
    if (!embedToken || !window.snap) {
      console.error("Snap embed setup failed: Missing token or Snap instance");
      return;
    }

    console.log("🎯 Setting up Snap Embed...");
    setEmbedLoaded(false);

    try {
      const embedContainer = document.getElementById("snap-embed-container");
      if (embedContainer) {
        embedContainer.innerHTML = "";
      }
    } catch (error) {
      console.warn("Error cleaning embed container:", error);
    }

    setTimeout(() => {
      try {
        window.snap.embed(embedToken, {
          embedId: "snap-embed-container",
          onSuccess: function (result) {
            console.log("✅ Payment success (Embed):", result);
            handlePaymentComplete("success", result);
          },
          onPending: function (result) {
            console.log("⏳ Payment pending (Embed):", result);
            handlePaymentComplete("pending", result);
          },
          onError: function (result) {
            console.log("❌ Payment error (Embed):", result);
            handlePaymentComplete("error", result);
          },
          onClose: function () {
            console.log("🔴 Embed closed by user");
            // Tidak melakukan apapun, biarkan user tutup sendiri
          },
        });

        snapEmbedInstance.current = true;

        setTimeout(() => {
          setEmbedLoaded(true);
        }, 1000);
      } catch (error) {
        console.error("Error setting up Snap embed:", error);
        setEmbedLoaded(true);

        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Pembayaran",
          text: "Silakan refresh halaman dan coba lagi.",
          confirmButtonText: "OK",
        }).then(() => {
          setShowEmbed(false);
        });
      }
    }, 100);
  };

  // Handle payment completion
  const handlePaymentComplete = (status, result = null) => {
    setShowEmbed(false);
    setEmbedLoaded(false);

    switch (status) {
      case "success":
        navigate(`/checkout-success?order_id=${embedOrderId}`, {
          state: {
            orderId: embedOrderId,
            status: "PAID",
            paymentMethod: result?.payment_type,
            plan: selectedPlan,
          },
        });
        break;
      case "pending":
        navigate(`/checkout-success?order_id=${embedOrderId}`, {
          state: {
            orderId: embedOrderId,
            status: "PENDING",
            plan: selectedPlan,
            note: "Pembayaran sedang diproses. Status akan update otomatis.",
          },
        });
        break;
      case "error":
        navigate(`/checkout-success?order_id=${embedOrderId}`, {
          state: {
            orderId: embedOrderId,
            status: "ERROR",
            message: result?.status_message,
            plan: selectedPlan,
          },
        });
        break;
    }
  };

  // Setup Snap Embed saat token atau showEmbed berubah
  useEffect(() => {
    if (showEmbed && embedToken && window.snap && !snapEmbedInstance.current) {
      setupSnapEmbed();
    }
  }, [showEmbed, embedToken]);

  // Fungsi utama untuk memulai pembayaran
  const handleStartPayment = async () => {
    setIsProcessingPayment(true);

    try {
      console.log("📝 Creating payment session...");

      // 1. Buat payment session di backend
      const createResponse = await axios.post(
        `${API_URL}/transactions/create`,
        {
          plan: selectedPlan,
          paymentMethod: "qris", // atau ambil dari pilihan user
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payment session response:", createResponse.data);

      if (!createResponse.data.success) {
        throw new Error(
          createResponse.data.message || "Gagal membuat sesi pembayaran"
        );
      }

      const { token, orderId } = createResponse.data.data;
      console.log(`✅ Payment session created: ${orderId}`);

      // 2. Simpan ke localStorage untuk bisa continue nanti
      localStorage.setItem(
        "pendingPayment",
        JSON.stringify({
          orderId: orderId,
          plan: selectedPlan,
          token: token,
          timestamp: new Date().toISOString(),
        })
      );

      // 3. Set token dan orderId untuk Snap Embed
      setEmbedToken(token);
      setEmbedOrderId(orderId);

      // 4. Tampilkan embed fullscreen
      setIsProcessingPayment(false);
      setShowEmbed(true);
    } catch (error) {
      console.error("❌ Payment error:", error);

      let errorMsg = error.message;
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      // Handle duplicate error dengan lebih baik
      if (error.response?.data?.error?.includes("Duplicate entry")) {
        errorMsg =
          "Sesi pembayaran sebelumnya masih aktif. Silakan coba lagi dalam 30 detik.";

        // Coba dapatkan order ID dari error response
        const match = error.response.data.error.match(
          /order_id: (ORDER-\d+-\d+)/
        );
        if (match) {
          const existingOrderId = match[1];
          errorMsg += ` Order ID: ${existingOrderId}`;

          // Tawarkan untuk melanjutkan pembayaran yang ada
          Swal.fire({
            icon: "warning",
            title: "Sesi Pembayaran Aktif Ditemukan",
            html: `
              <div class="text-left">
                <p>Anda sudah memiliki sesi pembayaran yang aktif:</p>
                <p class="font-mono bg-slate-100 p-2 rounded mt-2">${existingOrderId}</p>
                <p class="text-sm text-slate-600 mt-2">Apakah Anda ingin melanjutkan pembayaran ini?</p>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Ya, Lanjutkan",
            cancelButtonText: "Buat Baru",
            confirmButtonColor: "#7c3aed",
          }).then((result) => {
            if (result.isConfirmed) {
              // Lanjutkan pembayaran yang ada
              navigate("/checkout", {
                state: {
                  plan: selectedPlan,
                  orderId: existingOrderId,
                  continuePayment: true,
                },
              });
            } else {
              // Refresh halaman untuk mencoba lagi
              setTimeout(() => window.location.reload(), 1000);
            }
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: errorMsg,
        });
      }

      setIsProcessingPayment(false);
    }
  };

  // Fungsi untuk melanjutkan pembayaran yang tertunda
  const handleContinuePendingPayment = async (orderId) => {
    setIsContinuingPayment(true);
    try {
      console.log(`🔄 Continuing payment for: ${orderId}`);

      // Cek dulu apakah transaksi masih valid
      const statusResponse = await axios.get(
        `${API_URL}/transactions/status/${orderId}`
      );

      if (statusResponse.data.success) {
        const transaction = statusResponse.data.data;

        if (transaction.status === "PAID") {
          // Sudah dibayar, redirect ke success
          navigate(`/checkout-success?order_id=${orderId}`, {
            state: {
              orderId: orderId,
              status: "PAID",
              plan: transaction.plan,
            },
          });
          return;
        } else if (transaction.status === "PENDING_PAYMENT") {
          // Masih pending, dapatkan token dan lanjutkan
          const token = transaction.snap_token;
          if (token) {
            setEmbedToken(token);
            setEmbedOrderId(orderId);
            setTimeout(() => {
              setShowEmbed(true);
              setIsContinuingPayment(false);
            }, 500);
          } else {
            throw new Error("Token pembayaran tidak tersedia");
          }
        } else {
          // Status lainnya
          Swal.fire({
            icon: "info",
            title: "Status Transaksi",
            text: `Transaksi ini sudah ${transaction.status.toLowerCase()}.`,
            confirmButtonText: "OK",
          });
          navigate("/upgrade");
        }
      }
    } catch (error) {
      console.error("❌ Gagal melanjutkan pembayaran:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Melanjutkan",
        text: "Silakan buat transaksi baru.",
      });
      setIsContinuingPayment(false);
      navigate("/upgrade");
    }
  };

  // Handle continue payment saat komponen dimuat
  useEffect(() => {
    if (isContinuePayment && continueOrderId) {
      console.log("🔄 Continue payment detected:", continueOrderId);
      handleContinuePendingPayment(continueOrderId);
    }
  }, [isContinuePayment, continueOrderId]);

  // Handle paid checkout dengan Snap Embed
  const handlePaidCheckout = async () => {
    setIsProcessingPayment(true);

    try {
      // 2. Create transaction langsung dengan Midtrans
      console.log("📝 Creating transaction...");
      const createResponse = await axios.post(
        `${API_URL}/transactions/create`,
        {
          plan: selectedPlan,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Transaction response:", createResponse.data);

      if (!createResponse.data.success) {
        throw new Error(
          createResponse.data.message || "Gagal membuat transaksi"
        );
      }

      const { token, orderId, invoiceNumber } = createResponse.data.data;
      console.log(
        `✅ Transaction created: ${orderId}, Invoice: ${invoiceNumber}`
      );

      // Simpan ke localStorage untuk bisa continue nanti
      localStorage.setItem(
        "lastTransaction",
        JSON.stringify({
          orderId: orderId,
          plan: selectedPlan,
          token: token,
          invoiceNumber: invoiceNumber,
          timestamp: new Date().toISOString(),
          status: "PENDING",
        })
      );

      // 3. Set token dan orderId untuk Snap Embed
      setEmbedToken(token);
      setEmbedOrderId(orderId);

      // 4. Tampilkan embed fullscreen
      setIsProcessingPayment(false);
      setShowEmbed(true);
    } catch (error) {
      console.error("❌ Payment error:", error);

      let errorMsg = error.message;
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      // Tampilkan error yang lebih spesifik
      if (error.response?.data?.error?.includes("Duplicate entry")) {
        errorMsg =
          "Terjadi kesalahan sistem. Silakan coba lagi dalam beberapa detik.";

        Swal.fire({
          icon: "error",
          title: "Oops...",
          html: `
          <div class="text-left">
            <p>${errorMsg}</p>
            <p class="text-sm text-slate-600 mt-2">
              <strong>Solusi:</strong> Silakan refresh halaman dan coba lagi.
            </p>
          </div>
        `,
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: errorMsg,
        });
      }

      setIsProcessingPayment(false);
    }
  };

  // Handle checkout
  const handleCheckout = async (e) => {
    e.preventDefault();

    // Validate form for paid plans
    if (plan.price > 0 && (!formData.name || !formData.email)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Harap isi semua data yang diperlukan!",
      });
      return;
    }

    // Check if script is loaded for paid plans
    if (plan.price > 0 && !isScriptLoaded) {
      Swal.fire({
        icon: "error",
        title: "Sistem Pembayaran Sedang Dimuat",
        text: "Harap tunggu beberapa detik dan coba lagi.",
      });
      return;
    }

    // Handle free plan
    if (plan.price === 0) {
      handleFreePlan();
      return;
    }

    // Handle paid plan
    handleStartPayment();
  };

  // Tentukan status loading
  const isLoading =
    subscriptionLoading ||
    isDowngrading ||
    isProcessingPayment ||
    isContinuingPayment;

  return (
    <div className="min-h-screen py-8 px-4 bg-slate-50 relative">
      {/* Loading Overlay untuk semua proses */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
            <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {isContinuingPayment
                ? "Melanjutkan Pembayaran..."
                : isProcessingPayment
                ? "Mempersiapkan Pembayaran..."
                : isDowngrading || subscriptionLoading
                ? "Memproses Downgrade ke Free"
                : "Memproses..."}
            </h3>
            <p className="text-slate-600 mb-4">
              {isContinuingPayment
                ? "Sedang memuat data transaksi untuk melanjutkan pembayaran..."
                : isProcessingPayment
                ? "Harap tunggu, sedang menyiapkan halaman pembayaran..."
                : "Sedang mengupdate subscription Anda. Jangan tutup halaman ini."}
            </p>
          </div>
        </div>
      )}

      {/* Snap Embed Fullscreen */}
      {showEmbed && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header Embed */}
          <div className="bg-linear-to-r from-violet-700 to-violet-800 text-white p-4 md:p-6 shadow-lg shrink-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="p-2 bg-white/20 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">
                    Pembayaran {plan.name} Plan
                  </h2>
                  <p className="text-sm opacity-90">
                    Selesaikan pembayaran untuk aktivasi plan
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm opacity-90">Total Pembayaran</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(calculateTotal())}
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Area - konten di-center dan dibatasi */}
          <div className="flex-1 flex justify-center items-start overflow-auto md:p-4 p-0">
            <div className="w-full max-w-7xl h-full min-h-0">
              <div
                id="snap-embed-container"
                ref={embedContainerRef}
                className="w-full h-full min-h-[500px] rounded-lg overflow-hidden shadow-lg"
              >
                {/* Snap JS akan merender pembayaran di sini */}
              </div>

              {/* Loading Overlay */}
              {!embedLoaded && (
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center">
                  <Loader2 className="w-16 h-16 animate-spin text-violet-600 mb-4" />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Memuat Halaman Pembayaran
                  </h3>
                  <p className="text-slate-600">Harap tunggu sebentar...</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-800 text-white p-4 border-t border-slate-700 shrink-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm">Pembayaran Aman</span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">
                    Order ID:{" "}
                    <span className="font-mono font-bold">{embedOrderId}</span>
                  </span>
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - hanya tampil ketika tidak ada embed */}
      {!showEmbed && (
        <>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={handleBack}
                className="mb-6 w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali
              </button>

              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                  Checkout
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Lengkapi data Anda untuk melanjutkan pembayaran
                </p>

                {/* Info current plan */}
                {user?.subscription?.plan && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                    <span className="text-sm text-slate-600">
                      Current Plan:
                    </span>
                    <span className="font-medium text-slate-800 capitalize">
                      {user.subscription.plan}
                    </span>
                  </div>
                )}

                {/* Info continue payment jika ada */}
                {isContinuePayment && continueOrderId && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-800">
                      Melanjutkan Pembayaran: {continueOrderId}
                    </span>
                  </div>
                )}
              </Motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Plan Details & Customer Info */}
              <Motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2"
              >
                {/* Plan Summary */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl ${plan.bgLightClass} flex items-center justify-center`}
                      >
                        <PlanIcon
                          className={`w-8 h-8 ${plan.textColorClass}`}
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                          {plan.name} Plan
                        </h2>
                        <p className="text-slate-600">{plan.description}</p>
                      </div>
                    </div>
                    {plan.popular && (
                      <span className="hidden md:flex bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-semibold items-center gap-2">
                        <Star className="w-4 h-4" />
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-800 mb-4 text-lg">
                      Fitur yang akan Anda dapatkan:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <BadgeCheck className="w-6 h-6 text-violet-600" />
                    Data Pembeli
                  </h2>

                  <form onSubmit={handleCheckout}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">
                          Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-medium text-slate-800"
                          placeholder="Masukkan nama lengkap"
                          required={plan.price > 0}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-medium text-slate-800"
                          placeholder="email@anda.com"
                          required={plan.price > 0}
                          disabled={!!user?.email}
                        />
                        {user?.email && (
                          <p className="text-sm text-slate-500 mt-1">
                            Email diambil dari akun Anda
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">
                          Kode Kupon (Opsional)
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-medium text-slate-800"
                            placeholder="Masukkan kode kupon"
                            disabled={plan.price === 0}
                          />
                          <Motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={plan.price === 0}
                            className="w-full sm:w-auto px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Terapkan
                          </Motion.button>
                        </div>
                        {couponCode && !discount && (
                          <p className="text-rose-600 text-sm mt-2">
                            Kode kupon tidak valid atau telah kadaluarsa
                          </p>
                        )}
                        {plan.price === 0 && (
                          <p className="text-slate-500 text-sm mt-2">
                            Kupon tidak berlaku untuk plan gratis
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Security Info */}
                    <div className="flex items-center gap-3 text-sm text-slate-600 mb-8">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>
                        Data Anda aman dan terenkripsi dengan SSL 256-bit
                      </span>
                    </div>

                    {/* Payment Info */}
                    {plan.price > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                        <p className="text-blue-700 text-sm">
                          <span className="font-bold">Info Pembayaran:</span>{" "}
                          Setelah mengisi data, halaman pembayaran Midtrans akan
                          muncul fullscreen.
                        </p>
                      </div>
                    )}
                  </form>
                </div>
              </Motion.div>

              {/* Right Column - Order Summary */}
              <Motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="sticky top-8">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className={`p-6 text-white ${plan.bgHeaderClass}`}>
                      <h3 className="text-xl font-bold mb-2">
                        Ringkasan Pesanan
                      </h3>
                      <p className="text-sm opacity-90">
                        Detail pembayaran Anda
                      </p>
                    </div>

                    {/* Order Details */}
                    <div className="p-6">
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                          <div>
                            <p className="font-bold text-slate-800">
                              {plan.name} Plan
                            </p>
                            <p className="text-sm text-slate-600">
                              Akses {plan.period}
                            </p>
                          </div>
                          <p className="font-bold text-slate-800">
                            {plan.price === 0
                              ? "Gratis"
                              : formatCurrency(plan.price)}
                          </p>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between items-center text-emerald-600">
                            <p className="font-medium">Diskon Kupon</p>
                            <p className="font-bold">
                              -{formatCurrency(discount)}
                            </p>
                          </div>
                        )}

                        {/* Total */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                          <p className="text-lg font-bold text-slate-800">
                            Total Pembayaran
                          </p>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-800">
                              {plan.price === 0
                                ? "Gratis"
                                : formatCurrency(calculateTotal())}
                            </p>
                            {plan.price > 0 &&
                              plan.period.includes("bulan") && (
                                <p className="text-sm text-slate-600">
                                  {formatCurrency(calculateTotal() / 30)} per
                                  hari
                                </p>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Guarantee Badges */}
                      {plan.price > 0 && (
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                            <Shield className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">
                              30-Day Money Back Guarantee
                            </span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <Lock className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                              Pembayaran Aman & Terenkripsi
                            </span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                            <Zap className="w-5 h-5 text-amber-600" />
                            <span className="text-sm font-medium text-amber-700">
                              Akses Instan Setelah Pembayaran
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Checkout Button */}
                      <Motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCheckout}
                        disabled={
                          isLoading || (plan.price > 0 && !isScriptLoaded)
                        }
                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-sm transition-all ${
                          plan.price === 0
                            ? "bg-slate-800 text-white hover:bg-slate-900"
                            : `bg-linear-to-r ${plan.bgFromClass} ${plan.bgToClass} text-white hover:shadow-md`
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {isContinuingPayment
                              ? "Melanjutkan Pembayaran..."
                              : isProcessingPayment
                              ? "Mempersiapkan Pembayaran..."
                              : "Memproses..."}
                          </div>
                        ) : plan.price === 0 ? (
                          "Downgrade ke Plan Gratis"
                        ) : !isScriptLoaded ? (
                          "Memuat Sistem Pembayaran..."
                        ) : isContinuePayment ? (
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            Lanjutkan Pembayaran
                          </div>
                        ) : (
                          "Lanjutkan ke Pembayaran"
                        )}
                      </Motion.button>

                      {/* Payment Note */}
                      <div className="text-center text-sm text-slate-500 mt-4">
                        <p>
                          Dengan melanjutkan, Anda menyetujui{" "}
                          <button
                            type="button"
                            className="text-violet-600 hover:underline font-medium"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowTermsModal(true);
                            }}
                          >
                            Syarat & Ketentuan
                          </button>
                        </p>

                        {plan.price === 0 && (
                          <p className="text-amber-600 text-xs mt-2">
                            ⚠️ Downgrade akan mengurangi fitur yang tersedia
                          </p>
                        )}

                        {isContinuePayment && (
                          <p className="text-blue-600 text-xs mt-2">
                            🔄 Melanjutkan pembayaran yang tertunda
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Support Info */}
                  <div className="mt-6 p-6 bg-white rounded-3xl shadow-sm border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-violet-600" />
                      Butuh Bantuan?
                    </h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Tim support kami siap membantu 24/7 untuk proses
                      pembayaran dan aktivasi.
                    </p>
                    <div className="space-y-2">
                      <a
                        href="mailto:support@pipsdiary.com"
                        className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
                      >
                        <Mail className="w-4 h-4" />
                        support@pipsdiary.com
                      </a>
                      <a
                        href="https://wa.me/6285173246048"
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <Smartphone className="w-4 h-4" />
                        +62 851 7324 6048
                      </a>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  {plan.price > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-center gap-6">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 bg-slate-100 rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-slate-700" />
                          </div>
                          <p className="text-xs text-slate-600">
                            Secure Payment
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 bg-slate-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-slate-700" />
                          </div>
                          <p className="text-xs text-slate-600">
                            Instant Access
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 bg-slate-100 rounded-full flex items-center justify-center">
                            <Gift className="w-6 h-6 text-slate-700" />
                          </div>
                          <p className="text-xs text-slate-600">
                            30-Day Guarantee
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Motion.div>
            </div>
          </div>
        </>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <TermsModal
          showTermsModal={showTermsModal}
          setShowTermsModal={setShowTermsModal}
        />
      )}

      {/* Downgrade Confirmation Modal */}
      <DowngradeConfirmationModal
        showModal={showDowngradeModal}
        setShowModal={setShowDowngradeModal}
        onConfirm={handleConfirmDowngrade}
        isLoading={isDowngrading}
        selectedPlan={selectedPlan}
      />
    </div>
  );
};

export default Layout;
