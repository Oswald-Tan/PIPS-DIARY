import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye,
  History,
  X,
  FileText,
  User,
  Mail,
  Phone,
  Package,
  CreditCard as CardIcon,
  Calendar as CalendarIcon,
  CheckCircle as CheckIcon,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../../config";
import Swal from "sweetalert2";

const Layout = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  // State untuk modal invoice
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    fetchTransactions();

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions/user`);
      if (response.data.success) {
        setTransactions(response.data.data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "paid") return t.status === "PAID";
    if (filter === "pending") return t.status === "PENDING_PAYMENT";
    if (filter === "failed")
      return ["CANCELED", "EXPIRED", "DENIED"].includes(t.status);
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "PENDING_PAYMENT":
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100 text-emerald-800";
      case "PENDING_PAYMENT":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  // Fungsi untuk download invoice
  const downloadInvoice = async (orderId) => {
    try {
      Swal.fire({
        title: "Menyiapkan Invoice...",
        text: "Sedang menghasilkan PDF invoice",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.get(
        `${API_URL}/transactions/invoice-pdf/${orderId}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Invoice Downloaded",
        text: "Invoice berhasil diunduh",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Download invoice error:", error);

      let errorMessage = "Gagal mengunduh invoice";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Session expired. Silakan login kembali.";
        } else if (error.response.status === 404) {
          errorMessage = "Invoice tidak ditemukan.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Tidak ada respons dari server.";
      }

      Swal.fire({
        icon: "error",
        title: "Gagal Download",
        text: errorMessage,
      });
    }
  };

  // Fungsi untuk preview invoice dengan modal custom
  const previewInvoice = async (orderId) => {
    try {
      setSelectedOrderId(orderId);
      setInvoiceLoading(true);
      setShowInvoiceModal(true);

      const response = await axios.get(
        `${API_URL}/transactions/invoice/${orderId}`
      );

      const data = response.data;
      if (!data.success) {
        throw new Error(data.message || "Gagal memuat invoice");
      }

      setInvoiceData(data.data);
    } catch (error) {
      console.error("Preview invoice error:", error);

      let errorMessage = "Gagal memuat data invoice";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Session expired. Silakan login kembali.";
        } else if (error.response.status === 404) {
          errorMessage = "Invoice tidak ditemukan.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Tidak ada respons dari server.";
      }

      Swal.fire({
        icon: "error",
        title: "Gagal Memuat",
        text: errorMessage,
      });

      setShowInvoiceModal(false);
      setInvoiceData(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setInvoiceData(null);
    setSelectedOrderId(null);
  };

  // Komponen Modal Invoice Preview
  const InvoiceModal = ({ show, onClose, invoiceData, loading, orderId }) => {
    if (!show) return null;

    const handleDownload = () => {
      downloadInvoice(orderId);
      onClose();
    };

    return (
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <Motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border-2 border-violet-200 max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Modal */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <FileText className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Preview Invoice
                  </h2>
                  <p className="text-sm text-slate-600">
                    Invoice #{invoiceData?.invoiceNumber || orderId}
                  </p>
                </div>
              </div>
              <Motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </Motion.button>
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600">Memuat data invoice...</p>
                </div>
              </div>
            ) : invoiceData ? (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="bg-linear-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">Pips Diary</h3>
                      <p className="text-violet-100">Invoice Pembayaran</p>
                    </div>

                    {/* Invoice section */}
                    <div className="ml-auto text-right">
                      <div className="font-bold font-mono">
                        {invoiceData.invoiceNumber}
                      </div>
                      <div className="text-sm text-violet-100">
                        {new Date(invoiceData.date).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* From & To Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-violet-100 rounded-lg">
                        <User className="w-4 h-4 text-violet-600" />
                      </div>
                      <h4 className="font-semibold text-slate-800">Dari:</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800">Pips Diary</p>
                      <p className="text-sm text-slate-600">
                        Manado, Indonesia
                      </p>
                      <p className="text-sm text-slate-600">
                        support@pipsdiary.com
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <Mail className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold text-slate-800">Kepada:</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800">
                        {invoiceData.customer.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {invoiceData.customer.email}
                      </p>
                      {invoiceData.customer.phone && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Phone className="w-3 h-3" />
                          {invoiceData.customer.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-blue-800 text-lg">
                      Detail Langganan
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-blue-600 mb-1">Plan</p>
                      <p className="font-bold text-blue-900">
                        {invoiceData.plan.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 mb-1">
                        Berlaku Hingga
                      </p>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-blue-500" />
                        <p className="font-semibold text-blue-900">
                          {invoiceData.isLifetimePlan
                            ? "Seumur Hidup"
                            : invoiceData.isFreePlan
                            ? "Selamanya"
                            : invoiceData.expiresAtDate
                            ? new Date(
                                invoiceData.expiresAtDate
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "Tidak tersedia"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <CheckIcon className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-emerald-700">
                          {invoiceData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Items Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-800 px-4 py-3">
                    <h4 className="font-semibold text-white">
                      Detail Pembelian
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">
                            Deskripsi
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">
                            Harga
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">
                            Qty
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.items.map((item, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-slate-50"
                            }
                          >
                            <td className="py-3 px-4 text-slate-800">
                              {item.description}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-800">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-800">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-linear-to-r from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
                  <h4 className="font-bold text-emerald-800 mb-4 text-lg">
                    Ringkasan Pembayaran
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Subtotal:</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(invoiceData.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Pajak (0%):</span>
                      <span className="text-slate-800">
                        {formatCurrency(invoiceData.tax)}
                      </span>
                    </div>
                    <div className="border-t border-emerald-300 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-emerald-900">
                          Total Pembayaran:
                        </span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(invoiceData.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-800 mb-2">
                        Informasi Pembayaran
                      </h4>
                      <ul className="space-y-2 text-sm text-amber-700">
                        <li className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-amber-500 rounded-full mt-2"></div>
                          <span>
                            Invoice ini sah secara hukum sebagai bukti
                            pembayaran
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-amber-500 rounded-full mt-2"></div>
                          <span>
                            Simpan invoice ini untuk keperluan administrasi
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-amber-500 rounded-full mt-2"></div>
                          <span>
                            Hubungi support@pipsdiary.com jika ada pertanyaan
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Gagal Memuat Invoice
                </h3>
                <p className="text-slate-600">
                  Tidak dapat memuat data invoice. Silakan coba lagi.
                </p>
              </div>
            )}
          </div>

          {/* Footer Modal */}
          <div className="p-6 border-t border-slate-200 bg-white">
            <div className="flex flex-col sm:flex-row gap-3">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-bold flex-1 sm:flex-none"
              >
                Tutup Preview
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                disabled={!invoiceData}
                className="px-6 py-3 bg-linear-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold flex items-center justify-center gap-2 flex-1"
              >
                <Download className="w-5 h-5" />
                Download PDF Invoice
              </Motion.button>
            </div>
          </div>
        </Motion.div>
      </Motion.div>
    );
  };

  return (
    <div className="min-h-screen p-4 pt-0">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Dashboard
        </button>
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-violet-600" />
              Transaction History
            </h1>

            <p className="text-sm sm:text-sm md:text-base text-slate-600 mt-1 font-light">
              Riwayat semua transaksi pembelian plan Anda
            </p>
          </div>
        </Motion.div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "Semua" },
            { key: "paid", label: "Berhasil" },
            { key: "pending", label: "Pending" },
            { key: "failed", label: "Gagal" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === item.key
                  ? "bg-violet-600 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
              <p className="mt-2 text-slate-600">Memuat riwayat transaksi...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                Tidak ada transaksi
              </h3>
              <p className="text-slate-600 mb-4">
                {filter === "all"
                  ? "Anda belum memiliki transaksi."
                  : `Tidak ada transaksi dengan status ${filter}.`}
              </p>
              <button
                onClick={() => navigate("/upgrade")}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
              >
                Upgrade Sekarang
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredTransactions.map((transaction) => (
                <Motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 md:p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        {getStatusIcon(transaction.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {transaction.status === "PAID"
                            ? "Berhasil"
                            : transaction.status === "PENDING_PAYMENT"
                            ? "Menunggu Pembayaran"
                            : "Dibatalkan"}
                        </span>
                      </div>

                      <h3 className="font-medium text-slate-800 mb-1 text-sm md:text-base">
                        {transaction.plan
                          ? `${transaction.plan.toUpperCase()} Plan`
                          : "Plan Subscription"}
                      </h3>

                      <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{formatDate(transaction.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 md:w-4 md:h-4" />
                          <span>
                            {transaction.payment_method || "Transfer Bank"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Order ID:</span>
                          <span className="font-mono text-xs md:text-sm">
                            {transaction.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch md:items-end gap-2 mt-2 md:mt-0">
                      <div className="text-lg md:text-xl font-bold text-slate-800">
                        {formatCurrency(transaction.total)}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/checkout-success?order_id=${transaction.id}`
                            )
                          }
                          className="px-3 py-1.5 text-xs md:text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex-1 md:flex-none"
                        >
                          Lihat Detail
                        </button>

                        {transaction.status === "PAID" && (
                          <div className="flex gap-2 flex-1 md:flex-none">
                            <button
                              onClick={() => previewInvoice(transaction.id)}
                              className="px-3 py-1.5 text-xs md:text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 flex-1 justify-center"
                              title="Preview Invoice"
                            >
                              <Eye className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="hidden md:inline">Preview</span>
                              <span className="md:hidden">Lihat</span>
                            </button>
                            <button
                              onClick={() => downloadInvoice(transaction.id)}
                              className="px-3 py-1.5 text-xs md:text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1 flex-1 justify-center"
                              title="Download Invoice"
                            >
                              <Download className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="hidden md:inline">PDF</span>
                              <span className="md:hidden">Unduh</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {transactions.length > 0 && !loading && (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6"
          >
            <h3 className="font-medium text-slate-800 mb-4 text-base md:text-lg">
              Ringkasan Transaksi
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="text-center p-3 md:p-4 bg-slate-50 rounded-xl">
                <div className="text-xl md:text-2xl font-bold text-slate-800">
                  {transactions.length}
                </div>
                <div className="text-xs md:text-sm text-slate-600">
                  Total Transaksi
                </div>
              </div>
              <div className="text-center p-3 md:p-4 bg-slate-50 rounded-xl">
                <div className="text-xl md:text-2xl font-bold text-emerald-600">
                  {transactions.filter((t) => t.status === "PAID").length}
                </div>
                <div className="text-xs md:text-sm text-slate-600">
                  Berhasil
                </div>
              </div>
              <div className="text-center p-3 md:p-4 bg-slate-50 rounded-xl">
                <div className="text-xl md:text-2xl font-bold text-amber-600">
                  {
                    transactions.filter((t) => t.status === "PENDING_PAYMENT")
                      .length
                  }
                </div>
                <div className="text-xs md:text-sm text-slate-600">Pending</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-slate-50 rounded-xl">
                <div className="text-xl md:text-2xl font-bold text-slate-800">
                  {formatCurrency(
                    transactions
                      .filter((t) => t.status === "PAID")
                      .reduce((sum, t) => sum + parseInt(t.total), 0)
                  )}
                </div>
                <div className="text-xs md:text-sm text-slate-600">
                  Total Pengeluaran
                </div>
              </div>
            </div>
          </Motion.div>
        )}

        {/* Invoice Preview Modal */}
        <InvoiceModal
          show={showInvoiceModal}
          onClose={closeInvoiceModal}
          invoiceData={invoiceData}
          loading={invoiceLoading}
          orderId={selectedOrderId}
        />
      </div>
    </div>
  );
};

export default Layout;
