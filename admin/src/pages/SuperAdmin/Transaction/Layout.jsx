// src/pages/Transaction/index.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion as Motion } from "framer-motion";
import axios from "axios";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import { API_URL } from "../../../config";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const Layout = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  // Available filters from API
  const [availableFilters, setAvailableFilters] = useState({
    statuses: [],
    plans: [],
    payment_methods: []
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' };
      case 'PENDING_PAYMENT':
        return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' };
      case 'CANCELED':
        return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' };
      case 'EXPIRED':
        return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
      case 'DENIED':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    }
  };

  // Get plan color
  const getPlanColor = (plan) => {
    switch (plan) {
      case 'pro':
        return { bg: 'bg-violet-100', text: 'text-violet-700' };
      case 'lifetime':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700' };
    }
  };

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        plan: planFilter !== 'all' ? planFilter : undefined,
        payment_method: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      };

      const response = await axios.get(`${API_URL}/transactions`, {
        params
      });

      if (response.data.success) {
        setTransactions(response.data.data);
        setPagination(response.data.pagination);
        setStats(response.data.statistics);
        setAvailableFilters(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Gagal memuat data transaksi',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchQuery, statusFilter, planFilter, paymentMethodFilter, dateRange]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions/statistics`);

      if (response.data.success) {
        setStats(prev => ({ ...prev, summary: response.data.data.summary }));
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
  }, [fetchTransactions, fetchStatistics]);

  // Handle page change
  const handlePageClick = (event) => {
    setPagination(prev => ({
      ...prev,
      currentPage: event.selected + 1
    }));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: parseInt(e.target.value),
      currentPage: 1
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchTransactions();
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPlanFilter("all");
    setPaymentMethodFilter("all");
    setDateRange({ startDate: "", endDate: "" });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchTransactions();
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvHeaders = [
      'Invoice Number',
      'Customer Name',
      'Customer Email',
      'Plan',
      'Amount',
      'Status',
      'Payment Method',
      'Transaction Date',
      'User ID'
    ];

    const csvData = transactions.map(transaction => [
      transaction.invoice_number || '-',
      transaction.customer_name,
      transaction.customer_email,
      transaction.plan,
      transaction.total,
      transaction.status,
      transaction.payment_method || '-',
      formatDate(transaction.created_at),
      transaction.user_id
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // View transaction details
  const viewDetails = (transaction) => {
    Swal.fire({
      title: 'Transaction Details',
      html: `
        <div class="text-left space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div class="font-medium text-slate-600">Invoice Number:</div>
            <div>${transaction.invoice_number || '-'}</div>
            
            <div class="font-medium text-slate-600">Customer:</div>
            <div>${transaction.customer_name}</div>
            
            <div class="font-medium text-slate-600">Email:</div>
            <div>${transaction.customer_email}</div>
            
            <div class="font-medium text-slate-600">Plan:</div>
            <div class="${getPlanColor(transaction.plan).text} font-medium">${transaction.plan.toUpperCase()}</div>
            
            <div class="font-medium text-slate-600">Amount:</div>
            <div class="font-bold">${formatCurrency(transaction.total)}</div>
            
            <div class="font-medium text-slate-600">Status:</div>
            <div>
              <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status).bg} ${getStatusColor(transaction.status).text}">
                ${transaction.status.replace('_', ' ')}
              </span>
            </div>
            
            <div class="font-medium text-slate-600">Payment Method:</div>
            <div>${transaction.payment_method || 'N/A'}</div>
            
            <div class="font-medium text-slate-600">Transaction Date:</div>
            <div>${formatDate(transaction.created_at)}</div>
            
            <div class="font-medium text-slate-600">Transaction ID:</div>
            <div class="text-sm">${transaction.id}</div>
          </div>
          
          ${transaction.metadata && Object.keys(transaction.metadata).length > 0 ? `
            <div class="mt-4">
              <div class="font-medium text-slate-600 mb-2">Additional Data:</div>
              <pre class="bg-slate-50 p-3 rounded-lg text-xs overflow-auto max-h-40">${JSON.stringify(transaction.metadata, null, 2)}</pre>
            </div>
          ` : ''}
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '600px',
      customClass: {
        popup: 'rounded-3xl shadow-2xl',
        title: 'text-xl font-bold text-violet-900 mb-4'
      }
    });
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header Section */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-violet-600" />
            Manajemen Transaksi
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1 font-light">
            Kelola dan pantau semua transaksi sistem
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-violet-500" />
            </div>
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white/80 backdrop-blur-sm shadow-sm font-light"
            />
          </div>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 border border-slate-200 bg-white/80 backdrop-blur-sm rounded-2xl text-slate-700 hover:bg-slate-50 transition-all font-medium flex items-center justify-center space-x-2 shadow-sm"
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </Motion.button>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowStatistics(!showStatistics)}
            className="px-4 py-3 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-2xl transition-all font-medium flex items-center justify-center space-x-2 shadow-sm"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Statistik</span>
          </Motion.button>
        </div>
      </Motion.div>

      {/* Statistics Section */}
      {showStatistics && stats.summary && (
        <Motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 p-6 shadow-sm overflow-hidden"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ringkasan Transaksi
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-linear-to-br from-violet-50 to-purple-50 p-4 rounded-2xl border border-violet-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-violet-800 font-medium">Total Transaksi</div>
                <DollarSign className="w-5 h-5 text-violet-700" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-violet-900">
                {stats.summary.total_transactions || 0}
              </div>
            </div>
            <div className="bg-linear-to-br from-emerald-50 to-green-50 p-4 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-emerald-800 font-medium">Revenue Berhasil</div>
                <CheckCircle className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-emerald-900">
                {formatCurrency(stats.summary.paid_revenue || 0)}
              </div>
              <div className="text-xs text-emerald-600 mt-1">
                {stats.summary.paid_count || 0} transaksi berhasil
              </div>
            </div>
            <div className="bg-linear-to-br from-amber-50 to-yellow-50 p-4 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-amber-800 font-medium">Menunggu</div>
                <Clock className="w-5 h-5 text-amber-700" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-amber-900">
                {stats.summary.pending_count || 0}
              </div>
              <div className="text-xs text-amber-600 mt-1">
                Menunggu pembayaran
              </div>
            </div>
            <div className="bg-linear-to-br from-slate-50 to-gray-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-800 font-medium">Conversion Rate</div>
                <TrendingUp className="w-5 h-5 text-slate-700" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-slate-900">
                {stats.summary.conversion_rate || 0}%
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Rasio keberhasilan
              </div>
            </div>
          </div>
        </Motion.div>
      )}

      {/* Filter Section */}
      {showFilters && (
        <Motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 p-6 shadow-sm overflow-hidden"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">Filter Lanjutan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
              >
                <option value="all">Semua Status</option>
                {availableFilters.statuses?.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Plan
              </label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
              >
                <option value="all">Semua Plan</option>
                {availableFilters.plans?.map(plan => (
                  <option key={plan} value={plan}>
                    {plan.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
              >
                <option value="all">Semua Metode</option>
                {availableFilters.payment_methods?.map(method => (
                  <option key={method} value={method}>
                    {method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Items Per Page */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Item per Halaman
              </label>
              <select
                value={pagination.itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Rentang Tanggal
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
                  placeholder="Dari"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
                  placeholder="Sampai"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-xl transition-all"
            >
              Hapus Filter
            </button>
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={applyFilters}
              className="px-6 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all font-medium"
            >
              Terapkan Filter
            </Motion.button>
          </div>
        </Motion.div>
      )}

      {/* Current Filter Info */}
      <Motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-violet-50 to-purple-50 p-4 rounded-2xl border border-violet-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl">
              <DollarSign className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">
                {pagination.totalItems} Transaksi Ditemukan
              </h3>
              <p className="text-sm text-slate-600">
                {statusFilter !== 'all' && `Status: ${statusFilter.replace('_', ' ')} • `}
                {planFilter !== 'all' && `Plan: ${planFilter.toUpperCase()} • `}
                {paymentMethodFilter !== 'all' && `Payment: ${paymentMethodFilter} • `}
                {searchQuery && `Pencarian: "${searchQuery}"`}
                {!statusFilter && !planFilter && !paymentMethodFilter && !searchQuery && 'Menampilkan semua transaksi'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl transition-all text-sm font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Motion.button>
          </div>
        </div>
      </Motion.div>

      {/* Transactions Table */}
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
                {["No", "Invoice", "Customer", "Plan", "Amount", "Status", "Payment", "Date", "Aksi"].map(
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
                  <td colSpan="9" className="p-8 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-2 text-slate-600">Memuat transaksi...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center">
                    <DollarSign className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <div className="text-slate-600 text-lg mb-4 font-medium">
                      Tidak ada transaksi ditemukan
                    </div>
                    <p className="text-slate-500">
                      Coba ubah filter atau kata kunci pencarian
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <Motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-linear-to-r hover:from-slate-50 hover:to-violet-50 transition-all duration-200 whitespace-nowrap"
                  >
                    <td className="p-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900 text-sm">
                        {transaction.invoice_number || '-'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {transaction.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-slate-900">
                          {transaction.customer_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {transaction.customer_email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(transaction.plan).bg} ${getPlanColor(transaction.plan).text}`}>
                        {transaction.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        {formatCurrency(transaction.total)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status).bg} ${getStatusColor(transaction.status).text}`}>
                          {transaction.status.replace('_', ' ')}
                        </span>
                        {transaction.transaction_time && (
                          <span className="text-xs text-slate-500">
                            {formatDate(transaction.transaction_time)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {transaction.payment_method ? 
                            transaction.payment_method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-700">
                        {formatDate(transaction.created_at)}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => viewDetails(transaction)}
                          className="text-violet-600 hover:text-violet-800 text-sm font-medium hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Detail
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
      {pagination.totalPages > 1 && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="text-sm text-slate-600">
            {transactions.length > 0 
              ? `Menampilkan ${(pagination.currentPage - 1) * pagination.itemsPerPage + 1} sampai ${Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} dari ${pagination.totalItems} transaksi`
              : `Tidak ada data untuk ditampilkan`
            }
          </div>

          <ReactPaginate
            breakLabel="..."
            nextLabel={<ChevronRight className="w-4 h-4" />}
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={pagination.totalPages}
            previousLabel={<ChevronLeft className="w-4 h-4" />}
            renderOnZeroPageCount={null}
            forcePage={pagination.currentPage - 1}
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
  );
};

export default Layout;