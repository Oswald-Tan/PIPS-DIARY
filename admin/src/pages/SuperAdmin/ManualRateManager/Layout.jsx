import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion as Motion, AnimatePresence } from "framer-motion";
import ReactCountryFlag from "react-country-flag";
import Swal from "sweetalert2";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Check,
  X,
  Upload,
  DollarSign,
  Globe,
  AlertCircle,
  Save,
  ChevronDown,
  BarChart3,
  Calendar,
  Clock,
  Copy,
  EyeOff,
  Zap,
  Shield,
  Database,
  ArrowRight,
  TrendingUp,
  Target,
  Wallet,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import {
  getManualRates,
  createManualRate,
  updateManualRate,
  deactivateManualRate,
  deleteManualRatePermanently,
  bulkUpsertRates,
  getRateStatistics,
  validateConversion,
  clearError,
  setFilters,
  setPage,
  clearValidationResult,
} from "../../../features/manualRateSlice";
import debounce from "lodash.debounce";
import ReactPaginate from "react-paginate";

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ label, value, color, trend, bg, border, icon }) => (
  <Motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className={`p-5 rounded-3xl ${bg} ${border} shadow-sm hover:shadow-md transition-all duration-300`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
        {label}
      </div>
      {icon && <div className="text-xl md:text-2xl">{icon}</div>}
    </div>
    <div className={`text-xl md:text-2xl font-bold ${color} mb-1`}>{value}</div>
    {trend && <div className="text-xs font-medium opacity-70">{trend}</div>}
  </Motion.div>
);

// ==================== MODAL COMPONENT (Like BalanceModal) ====================
const Modal = ({
  title,
  children,
  onClose,
  size = "medium",
  isLoading = false,
}) => (
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
      className={`bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-violet-200 max-h-[90vh] overflow-y-auto ${
        size === "large" ? "max-w-4xl" : ""
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-violet-600" />
            {title}
          </h2>
          <Motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-violet-500 hover:text-violet-700 p-2 rounded-xl hover:bg-violet-100 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </Motion.button>
        </div>
        {children}
      </div>
    </Motion.div>
  </Motion.div>
);

// ==================== RATE FORM COMPONENT ====================
const RateForm = ({
  formData,
  editingRate,
  isSubmitting,
  onSubmit,
  onChange,
  onClose, // Added onClose prop
}) => {
  const defaultDate = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Currency Pair - Fixed IDR to USD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-violet-800 mb-2">
            From Currency
          </label>
          <div className="relative">
            <div className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl bg-violet-50 flex items-center">
              <ReactCountryFlag
                countryCode="ID"
                style={{
                  fontSize: "1.5em",
                  marginRight: "8px",
                }}
                svg
              />
              <span className="font-bold text-violet-900">IDR</span>
            </div>
            <input type="hidden" name="fromCurrency" value="IDR" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-violet-800 mb-2">
            To Currency
          </label>
          <div className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl bg-violet-50 flex items-center">
            <ReactCountryFlag
              countryCode="US"
              style={{
                fontSize: "1.5em",
                marginRight: "8px",
              }}
              svg
            />
            <span className="font-bold text-violet-900">USD</span>
          </div>
          <input type="hidden" name="toCurrency" value="USD" />
        </div>
      </div>

      {/* Exchange Rate Input */}
      <div>
        <label className="block text-sm font-bold text-violet-800 mb-2">
          Exchange Rate *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-violet-700 font-medium">1 IDR =</span>
          </div>
          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={onChange}
            placeholder="0.000064"
            step="any"
            min="0.000000000001"
            className="w-full pl-20 pr-12 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 font-semibold text-violet-900"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-violet-700 font-medium">USD</span>
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-2">
          Contoh: Nilai 0.000064 berarti 1 IDR = 0.000064 USD
        </p>
        <p className="text-xs text-slate-600">
          Atau 15,625 IDR ≈ 1 USD (untuk rate 0.000064)
        </p>
      </div>

      {/* Effective Date */}
      <div>
        <label className="block text-sm font-bold text-violet-800 mb-2">
          Berlaku Dari *
        </label>
        <input
          type="date"
          name="effectiveFrom"
          value={formData.effectiveFrom || defaultDate}
          onChange={onChange}
          className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 font-semibold"
          required
        />
        <p className="text-xs text-slate-600 mt-2">
          Tanggal ketika rate ini mulai berlaku
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-bold text-violet-800 mb-2">
          Catatan (Opsional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={onChange}
          placeholder="Contoh: Rate dari Bank Indonesia, update mingguan..."
          rows="3"
          className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 font-light"
        />
      </div>

      {/* Update Leaderboard Checkbox */}
      {!editingRate && (
        <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-200">
          <input
            type="checkbox"
            name="updateLeaderboard"
            checked={formData.updateLeaderboard}
            onChange={onChange}
            id="updateLeaderboard"
            className="h-5 w-5 text-violet-600 rounded focus:ring-violet-500 border-2 border-violet-300"
          />
          <label
            htmlFor="updateLeaderboard"
            className="text-sm text-violet-800 font-medium"
          >
            Update leaderboard dengan rate baru
          </label>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <Motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="flex-1 px-6 py-3 border-2 border-violet-300 rounded-xl text-violet-700 hover:bg-violet-50 transition-colors font-bold"
        >
          Batal
        </Motion.button>
        <Motion.button
          type="submit"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-linear-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {editingRate ? "Menyimpan..." : "Membuat..."}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {editingRate ? "Update Rate" : "Buat Rate"}
            </>
          )}
        </Motion.button>
      </div>
    </form>
  );
};

// ==================== BULK FORM COMPONENT ====================
const BulkForm = ({
  bulkData,
  effectiveFrom,
  isSubmitting,
  onSubmit,
  onBulkDataChange,
  onEffectiveFromChange,
  onClose,
}) => (
  <div className="space-y-4">
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-bold text-blue-800">Instruksi Format</h4>
          <p className="text-blue-700 text-sm mt-1">
            Masukkan satu rate per baris (hanya angka):
          </p>
          <code className="block bg-white p-2 rounded-xl border border-blue-300 text-sm text-blue-800 mt-2 font-mono">
            RATE
          </code>
          <p className="text-blue-700 text-sm mt-2">
            Contoh: <code className="font-mono">0.000064</code> (1 IDR =
            0.000064 USD)
          </p>
          <p className="text-blue-700 text-sm mt-1">
            Otomatis akan diproses sebagai IDR → USD
          </p>
        </div>
      </div>
    </div>

    <div>
      <label className="block text-sm font-bold text-violet-800 mb-2">
        Berlaku Dari Tanggal
      </label>
      <input
        type="date"
        value={effectiveFrom}
        onChange={(e) => onEffectiveFromChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 font-semibold"
      />
    </div>

    <div>
      <label className="block text-sm font-bold text-violet-800 mb-2">
        Data Rate (Satu per Baris)
      </label>
      <textarea
        value={bulkData}
        onChange={onBulkDataChange}
        rows="4"
        className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 font-mono text-sm font-light"
        placeholder="0.000064&#10;0.000065&#10;0.000066"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="font-bold text-slate-700 mb-2">Template Cepat</h4>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() =>
              onBulkDataChange({
                target: {
                  value: `0.000064\n0.000065\n0.000066\n0.000067\n0.000068`,
                },
              })
            }
            className="text-sm text-violet-600 hover:text-violet-800 text-left w-full font-medium"
          >
            📈 Rate Harian (5 hari terakhir)
          </button>
          <button
            type="button"
            onClick={() =>
              onBulkDataChange({
                target: {
                  value: `0.000062\n0.000063\n0.000064\n0.000065\n0.000066`,
                },
              })
            }
            className="text-sm text-violet-600 hover:text-violet-800 text-left w-full font-medium"
          >
            📊 Rate Mingguan
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="font-bold text-slate-700 mb-2">Preview</h4>
        <div className="text-sm text-slate-600 space-y-1">
          {bulkData
            .split("\n")
            .filter((line) => line.trim())
            .slice(0, 3)
            .map((rate, index) => (
              <div key={index} className="truncate">
                1 IDR = {rate} USD
              </div>
            ))}
          {bulkData.split("\n").filter((line) => line.trim()).length > 3 && (
            <div className="text-slate-500">
              +{bulkData.split("\n").filter((line) => line.trim()).length - 3}{" "}
              lainnya
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="flex gap-3 pt-4">
      <Motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClose}
        className="flex-1 px-6 py-3 border-2 border-violet-300 rounded-xl text-violet-700 hover:bg-violet-50 transition-colors font-bold"
      >
        Batal
      </Motion.button>
      <Motion.button
        type="button"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSubmit}
        disabled={!bulkData.trim() || isSubmitting}
        className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {isSubmitting ? "Memproses..." : "Update Rate"}
      </Motion.button>
    </div>
  </div>
);

// ==================== STATISTICS VIEW ====================
const StatisticsView = ({ statistics }) => (
  <div className="space-y-6">
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Total Rates
          </div>
          <Database className="w-5 h-5 text-violet-600" />
        </div>
        <div className="text-xl md:text-2xl font-bold text-slate-800">
          {statistics.summary?.totalManualRates || 0}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Active Rates
          </div>
          <Check className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="text-xl md:text-2xl font-bold text-slate-800">
          {statistics.summary?.activeManualRates || 0}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Currency Pairs
          </div>
          <Globe className="w-5 h-5 text-blue-600" />
        </div>
        <div className="text-xl md:text-2xl font-bold text-slate-800">
          {statistics.summary?.totalCurrencyPairs || 0}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Last Updated
          </div>
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div className="text-sm font-bold text-slate-800">
          {statistics.summary?.lastUpdated
            ? new Date(statistics.summary.lastUpdated).toLocaleDateString()
            : "Never"}
        </div>
      </div>
    </div>

    {/* Source Distribution */}
    {statistics.sourceCounts && statistics.sourceCounts.length > 0 && (
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100">
        <h4 className="font-bold text-slate-800 mb-4">Rate Sources</h4>
        <div className="space-y-3">
          {statistics.sourceCounts.map((source) => (
            <div
              key={source.source}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    source.source === "manual"
                      ? "bg-violet-500"
                      : source.source === "api"
                      ? "bg-emerald-500"
                      : "bg-slate-500"
                  }`}
                />
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {source.source}
                </span>
              </div>
              <div className="text-sm text-slate-600 font-medium">
                {source.count} total ({source.activeCount} active)
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Recent Updates */}
    {statistics.recentUpdates && statistics.recentUpdates.length > 0 && (
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100">
        <h4 className="font-bold text-slate-800 mb-4">Recent Updates</h4>
        <div className="space-y-3">
          {statistics.recentUpdates.map((update) => (
            <div
              key={update.id}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    update.isActive ? "bg-emerald-500" : "bg-slate-500"
                  }`}
                ></div>
                <div>
                  <div className="font-bold text-slate-800">
                    {update.fromCurrency} → {update.toCurrency}
                  </div>
                  <div className="text-xs text-slate-600 font-light">
                    Rate: {parseFloat(update.rate).toFixed(8)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">
                  {new Date(update.lastUpdated).toLocaleDateString()}
                </div>
                {update.updater && (
                  <div className="text-xs text-slate-600 font-light">
                    {update.updater.name || update.updater.email}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// ==================== TABLE RATES VIEW (Updated UI like Trades) ====================
const TableRatesView = ({
  rates,
  selectedRates,
  onSelectRate,
  onSelectAll,
  onEdit,
  onDeactivate,
  onDeletePermanent,
  formatCurrencyDisplay,
  formatDate,
  formatDateTime,
}) => {
  const getCountryCode = (currencyCode) => {
    const currencyToCountry = {
      IDR: "ID",
      USD: "US",
      EUR: "EU",
      GBP: "GB",
      JPY: "JP",
      SGD: "SG",
      AUD: "AU",
      CAD: "CA",
      CHF: "CH",
      CNY: "CN",
      INR: "IN",
    };
    return currencyToCountry[currencyCode] || currencyCode;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-200 bg-linear-to-r from-slate-50 to-violet-50">
              <th className="text-left p-4 text-sm font-bold text-slate-800 whitespace-nowrap w-12">
                <input
                  type="checkbox"
                  checked={
                    selectedRates.length === rates.length && rates.length > 0
                  }
                  onChange={onSelectAll}
                  className="h-4 w-4 text-violet-600 rounded focus:ring-violet-500 border-slate-300"
                />
              </th>
              <th className="text-left p-4 text-sm font-bold text-slate-800 whitespace-nowrap">
                Currency Pair
              </th>
              <th className="text-left p-4 text-sm font-bold text-slate-800 whitespace-nowrap">
                Exchange Rate
              </th>
              <th className="text-left p-4 text-sm font-bold text-slate-800 whitespace-nowrap">
                Effective Date
              </th>
              <th className="text-left p-4 text-sm font-bold text-slate-800 whitespace-nowrap">
                Status
              </th>
              <th className="text-left p-4 text-sm font-bold text-slate-800 whitespace-nowrap">
                Last Updated
              </th>
              <th className="text-left p-4 text-sm font-bold text-slate-800 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate, index) => {
              const fromCountryCode = getCountryCode(rate.fromCurrency);
              const toCountryCode = getCountryCode(rate.toCurrency);

              return (
                <Motion.tr
                  key={rate.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b border-slate-100 hover:bg-linear-to-r hover:from-slate-50 hover:to-violet-50 transition-all duration-200 ${
                    selectedRates.includes(rate.id) ? "bg-violet-50" : ""
                  }`}
                >
                  <td className="p-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRates.includes(rate.id)}
                      onChange={() => onSelectRate(rate.id)}
                      className="h-4 w-4 text-violet-600 rounded focus:ring-violet-500 border-slate-300"
                    />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <ReactCountryFlag
                            countryCode={fromCountryCode}
                            style={{ fontSize: "1.2em" }}
                            svg
                            title={rate.fromCurrency}
                          />
                          <span className="font-bold text-violet-700">
                            {rate.fromCurrency}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <div className="flex items-center gap-1">
                          <ReactCountryFlag
                            countryCode={toCountryCode}
                            style={{ fontSize: "1.2em" }}
                            svg
                            title={rate.toCurrency}
                          />
                          <span className="font-bold text-violet-700">
                            {rate.toCurrency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="font-mono text-slate-800 font-bold">
                        {formatCurrencyDisplay(
                          rate.fromCurrency,
                          rate.toCurrency,
                          parseFloat(rate.rate)
                        )}
                      </div>
                      <div className="text-xs text-slate-600 font-light">
                        {rate.source === "manual" ? "Manual" : "API"}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-slate-800 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(rate.effectiveFrom)}
                      </div>
                      {rate.effectiveTo && (
                        <div className="text-xs text-slate-600 font-light flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Until: {formatDate(rate.effectiveTo)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          rate.isActive
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {rate.isActive ? (
                          <>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></div>
                            Active
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-slate-500 rounded-full mr-1.5"></div>
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm text-slate-700 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDateTime(rate.lastUpdated || rate.updatedAt)}
                      </div>
                      {rate.updater && (
                        <div className="text-xs text-slate-600 font-light truncate max-w-37.5">
                          By: {rate.updater.name || rate.updater.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit(rate)}
                        className="text-violet-600 hover:text-violet-800 text-sm font-medium hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Motion.button>

                      <Motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDeactivate(rate.id)}
                        className="text-rose-600 hover:text-rose-800 text-sm font-medium hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Deactivate
                      </Motion.button>

                      {/* TAMBAHKAN TOMBOL DELETE PERMANENT */}
                      <Motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDeletePermanent(rate.id)}
                        className="text-red-800 hover:text-white hover:bg-red-800 text-sm font-medium px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1 border border-red-800"
                        title="Permanent Delete (Cannot be undone)"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Delete Permanent
                      </Motion.button>

                      <Motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          navigator.clipboard.writeText(rate.rate.toString())
                        }
                        className="text-slate-600 hover:text-slate-800 text-sm font-medium hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </Motion.button>
                    </div>
                  </td>
                </Motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==================== MAIN LAYOUT COMPONENT ====================
const Layout = () => {
  const dispatch = useDispatch();
  const {
    rates,
    isLoading,
    isCreating,
    isUpdating,
    isBulkUpdating,
    error,
    pagination,
    filters,
    statistics,
    validationResult,
  } = useSelector((state) => state.manualRates);

  // State
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [selectedRates, setSelectedRates] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    fromCurrency: "IDR",
    toCurrency: "USD",
    rate: "",
    effectiveFrom: new Date().toISOString().split("T")[0],
    notes: "",
    updateLeaderboard: true,
  });

  // Bulk form state
  const [bulkData, setBulkData] = useState(`0.000064
0.000065
0.000066`);
  const [bulkEffectiveFrom, setBulkEffectiveFrom] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Validation form state
  const [validationForm, setValidationForm] = useState({
    amount: "15000000",
    fromCurrency: "IDR",
    toCurrency: "USD",
  });

  // ==================== USE EFFECT FIXES ====================

  // Load rates on mount
  useEffect(() => {
    dispatch(
      getManualRates({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      })
    );
  }, [dispatch, filters, pagination.currentPage, pagination.itemsPerPage]);

  // Load statistics on mount
  useEffect(() => {
    dispatch(getRateStatistics());
  }, [dispatch]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // FIX 1: Auto-clear validation result after 5 seconds
  useEffect(() => {
    if (validationResult) {
      const timer = setTimeout(() => {
        dispatch(clearValidationResult());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [validationResult, dispatch]);

  // Clear validation when amount changes
  useEffect(() => {
    if (validationForm.amount && validationResult) {
      dispatch(clearValidationResult());
    }
  }, [dispatch, validationForm.amount, validationResult]);

  // ==================== HANDLERS FIXES ====================

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle bulk form changes
  const handleBulkChange = (e) => {
    setBulkData(e.target.value);
  };

  // Handle validation form changes
  const handleValidationChange = (e) => {
    const { name, value } = e.target;
    setValidationForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation result when user types
    if (validationResult && name === "amount") {
      dispatch(clearValidationResult());
    }
  };

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        dispatch(setFilters({ search: searchTerm }));
      }, 500),
    [dispatch]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    debouncedSearch(searchTerm);
  };

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterName, value) => {
      dispatch(setFilters({ [filterName]: value }));
    },
    [dispatch]
  );

  // Handle pagination
  const handlePageChange = useCallback(
    (page) => {
      dispatch(setPage(page));
    },
    [dispatch]
  );

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const rateValue = parseFloat(formData.rate);
    if (isNaN(rateValue) || rateValue <= 0) {
      return;
    }

    try {
      let result;
      const dataToSend = {
        ...formData,
        rate: rateValue,
        effectiveFrom: formData.effectiveFrom,
        _timestamp: Date.now(),
      };

      if (editingRate) {
        result = await dispatch(
          updateManualRate({ id: editingRate.id, ...dataToSend })
        );
      } else {
        result = await dispatch(createManualRate(dataToSend));
      }

      if (result?.meta?.requestStatus === "fulfilled") {
        setShowForm(false);
        setEditingRate(null);
        setFormData({
          fromCurrency: "IDR",
          toCurrency: "USD",
          rate: "",
          effectiveFrom: new Date().toISOString().split("T")[0],
          notes: "",
          updateLeaderboard: true,
        });

        await dispatch(
          getManualRates({
            page: pagination.currentPage,
            limit: pagination.itemsPerPage,
            ...filters,
          })
        );
        await dispatch(getRateStatistics());
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  // Handle bulk submit
  const handleBulkSubmit = async () => {
    const ratesArray = bulkData
      .split("\n")
      .filter((line) => line.trim())
      .map((rate) => ({
        fromCurrency: "IDR",
        toCurrency: "USD",
        rate: parseFloat(rate.trim()),
        notes: `Import bulk pada ${new Date().toLocaleDateString("id-ID")}`,
      }));

    await dispatch(
      bulkUpsertRates({
        rates: ratesArray,
        effectiveFrom: bulkEffectiveFrom,
        updateLeaderboard: true,
      })
    );

    if (!error) {
      setShowBulkForm(false);
      dispatch(
        getManualRates({
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...filters,
        })
      );
    }
  };

  // Handle edit
  const handleEdit = (rate) => {
    setEditingRate(rate);
    const effectiveFromDate = new Date(rate.effectiveFrom);
    const formattedDate = effectiveFromDate.toISOString().split("T")[0];

    setFormData({
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      rate: rate.rate.toString(),
      effectiveFrom: formattedDate,
      notes: rate.notes || "",
      updateLeaderboard: false,
    });
    setShowForm(true);
  };

  // FIX: Perbaiki handleDeactivate untuk refresh data setelah sukses
  const handleDeactivate = async (id) => {
    const result = await Swal.fire({
      title: "Deactivate Exchange Rate?",
      text: "Are you sure you want to deactivate this rate? This will affect leaderboard rankings.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, deactivate it!",
      cancelButtonText: "Cancel",
      background: "#ffffff",
      color: "#1f2937",
      backdrop: "rgba(0,0,0,0.6)",
      allowOutsideClick: false,
    });

    if (result.isConfirmed) {
      try {
        // Jalankan dispatch dan TUNGGU hasilnya
        const resultAction = await dispatch(deactivateManualRate(id));

        // Cek jika sukses
        if (resultAction?.meta?.requestStatus === "fulfilled") {
          // PERBAIKAN: Refresh data setelah sukses delete
          await dispatch(
            getManualRates({
              page: pagination.currentPage,
              limit: pagination.itemsPerPage,
              ...filters,
            })
          );

          Swal.fire({
            title: "Deactivated!",
            text: "The exchange rate has been deactivated.",
            icon: "success",
            confirmButtonColor: "#7c3aed",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          // Jika gagal
          Swal.fire({
            title: "Failed!",
            text:
              resultAction?.payload?.message || "Failed to deactivate rate.",
            icon: "error",
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({
          title: "Error!",
          text: "An unexpected error occurred.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // FIX: Handler untuk delete permanent
  const handleDeletePermanent = async (id) => {
    const { value: confirmText } = await Swal.fire({
      title: "Permanent Delete?",
      html: `
      <p>This action <strong>cannot be undone</strong> and will permanently delete the exchange rate.</p>
      <p>Please type <strong>DELETE</strong> to confirm.</p>
    `,
      input: "text",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete permanently!",
      cancelButtonText: "Cancel",
      background: "#ffffff",
      color: "#1f2937",
      backdrop: "rgba(0,0,0,0.6)",
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value !== "DELETE") {
          return "You must type DELETE to confirm";
        }
      },
    });

    if (confirmText) {
      try {
        // Jalankan dispatch dan TUNGGU hasilnya
        const resultAction = await dispatch(deleteManualRatePermanently(id));

        // Cek jika sukses
        if (resultAction?.meta?.requestStatus === "fulfilled") {
          // PERBAIKAN: Refresh data setelah sukses delete
          await dispatch(
            getManualRates({
              page: pagination.currentPage,
              limit: pagination.itemsPerPage,
              ...filters,
            })
          );

          Swal.fire({
            title: "Permanently Deleted!",
            text: "The exchange rate has been permanently deleted.",
            icon: "success",
            confirmButtonColor: "#7c3aed",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          // Jika gagal
          Swal.fire({
            title: "Failed!",
            text:
              resultAction?.payload?.message ||
              "Failed to delete rate permanently.",
            icon: "error",
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (error) {
        console.error("Permanent delete error:", error);
        Swal.fire({
          title: "Error!",
          text: "An unexpected error occurred.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // FIX: Bulk delete permanent
  const handleBulkDeletePermanent = async () => {
    if (selectedRates.length === 0) return;

    const { value: confirmText } = await Swal.fire({
      title: `Permanent Delete ${selectedRates.length} Rates?`,
      html: `
      <p>This action <strong>cannot be undone</strong> and will permanently delete ${selectedRates.length} exchange rates.</p>
      <p>Please type <strong>PERMANENT DELETE</strong> to confirm.</p>
    `,
      input: "text",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, delete ${selectedRates.length} rates permanently!`,
      cancelButtonText: "Cancel",
      background: "#ffffff",
      color: "#1f2937",
      backdrop: "rgba(0,0,0,0.6)",
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value !== "PERMANENT DELETE") {
          return "You must type PERMANENT DELETE to confirm";
        }
      },
    });

    if (confirmText) {
      try {
        let successCount = 0;
        let failCount = 0;

        // Eksekusi satu per satu
        for (const id of selectedRates) {
          const resultAction = await dispatch(deleteManualRatePermanently(id));
          if (resultAction?.meta?.requestStatus === "fulfilled") {
            successCount++;
          } else {
            failCount++;
          }
        }

        // Refresh data setelah semua selesai
        await dispatch(
          getManualRates({
            page: pagination.currentPage,
            limit: pagination.itemsPerPage,
            ...filters,
          })
        );

        // Reset selection
        setSelectedRates([]);

        // Tampilkan hasil
        Swal.fire({
          title: successCount > 0 ? "Success!" : "Partial Success",
          html: `
          <div>
            <p><strong>Permanent Deletion Summary:</strong></p>
            <p>✅ Success: ${successCount} rates</p>
            ${failCount > 0 ? `<p>❌ Failed: ${failCount} rates</p>` : ""}
          </div>
        `,
          icon: successCount > 0 ? "success" : "warning",
          confirmButtonColor: "#7c3aed",
        });
      } catch (error) {
        console.error("Bulk permanent delete error:", error);
        Swal.fire({
          title: "Error!",
          text: "An unexpected error occurred during bulk permanent deletion.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // Handle validation
  const handleValidate = async () => {
    await dispatch(validateConversion(validationForm));
  };

  // Handle rate selection
  const handleSelectRate = (id) => {
    setSelectedRates((prev) =>
      prev.includes(id) ? prev.filter((rateId) => rateId !== id) : [...prev, id]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRates.length === rates.length) {
      setSelectedRates([]);
    } else {
      setSelectedRates(rates.map((rate) => rate.id));
    }
  };

  // FIX: Perbaiki handleBulkDeactivate
  const handleBulkDeactivate = async () => {
    if (selectedRates.length === 0) return;

    const result = await Swal.fire({
      title: `Deactivate ${selectedRates.length} Selected Rates?`,
      text: "This action will affect leaderboard rankings for all selected rates.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, deactivate ${selectedRates.length} rates!`,
      cancelButtonText: "Cancel",
      background: "#ffffff",
      color: "#1f2937",
      backdrop: "rgba(0,0,0,0.6)",
      allowOutsideClick: false,
    });

    if (result.isConfirmed) {
      try {
        let successCount = 0;
        let failCount = 0;

        // Eksekusi satu per satu dan tunggu hasilnya
        for (const id of selectedRates) {
          const resultAction = await dispatch(deactivateManualRate(id));
          if (resultAction?.meta?.requestStatus === "fulfilled") {
            successCount++;
          } else {
            failCount++;
          }
        }

        // Refresh data setelah semua selesai
        await dispatch(
          getManualRates({
            page: pagination.currentPage,
            limit: pagination.itemsPerPage,
            ...filters,
          })
        );

        // Reset selection
        setSelectedRates([]);

        // Tampilkan hasil
        Swal.fire({
          title: successCount > 0 ? "Success!" : "Partial Success",
          html: `
          <div>
            <p><strong>Deactivation Summary:</strong></p>
            <p>✅ Success: ${successCount} rates</p>
            ${failCount > 0 ? `<p>❌ Failed: ${failCount} rates</p>` : ""}
          </div>
        `,
          icon: successCount > 0 ? "success" : "warning",
          confirmButtonColor: "#7c3aed",
        });
      } catch (error) {
        console.error("Bulk delete error:", error);
        Swal.fire({
          title: "Error!",
          text: "An unexpected error occurred during bulk deactivation.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // FIX 1: Manual clear validation result
  const handleClearValidation = () => {
    dispatch(clearValidationResult());
  };

  // Format currency display
  const formatCurrencyDisplay = useCallback(
    (fromCurrency, toCurrency, rate) => {
      if (toCurrency === "USD") {
        if (rate < 0.001) {
          return `1 ${fromCurrency} = $${rate.toFixed(8)}`;
        } else if (rate < 0.1) {
          return `1 ${fromCurrency} = $${rate.toFixed(6)}`;
        } else {
          return `1 ${fromCurrency} = $${rate.toFixed(4)}`;
        }
      }
      return `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;
    },
    []
  );

  // Format date
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Format datetime
  const formatDateTime = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Calculate stats from rates using useMemo
  const displayStats = useMemo(() => {
    const activeRates = rates.filter((r) => r.isActive);
    const inactiveRates = rates.filter((r) => !r.isActive);
    const latestRate =
      activeRates.length > 0
        ? activeRates.reduce((latest, current) =>
            new Date(current.effectiveFrom) > new Date(latest.effectiveFrom)
              ? current
              : latest
          )
        : null;

    return {
      total: rates.length,
      active: activeRates.length,
      inactive: inactiveRates.length,
      latestUpdate: latestRate?.effectiveFrom || null,
    };
  }, [rates]);

  // Handle page click for ReactPaginate
  const handlePageClick = (event) => {
    handlePageChange(event.selected);
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-violet-600" />
            IDR → USD Exchange Rate Manager
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1 font-light">
            Manage IDR to USD rates for fair leaderboard rankings
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Rate</span>
          </Motion.button>

          <Motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBulkForm(true)}
            className="bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-2xl transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
          >
            <Upload className="w-5 h-5" />
            <span>Bulk Update</span>
          </Motion.button>

          <Motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowStats(!showStats)}
            className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Statistics</span>
          </Motion.button>
        </div>
      </Motion.div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-100 border-2 border-rose-200 rounded-3xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-rose-800">Error</h4>
                <p className="text-rose-700 text-sm mt-1">
                  {typeof error === "string"
                    ? error
                    : error.message || "An error occurred"}
                </p>
              </div>
              <button
                onClick={() => dispatch(clearError())}
                className="text-rose-600 hover:text-rose-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="Total Rates"
          value={displayStats.total}
          color="text-violet-800"
          bg="bg-linear-to-br from-violet-50 to-violet-100"
          border="border border-violet-200/70"
          icon={<Database className="w-5 h-5 text-violet-600" />}
        />

        <StatCard
          label="Active Rates"
          value={displayStats.active}
          color="text-emerald-600"
          bg="bg-linear-to-br from-emerald-50 to-emerald-100"
          border="border border-emerald-200/70"
          icon={<Check className="w-5 h-5 text-emerald-600" />}
        />

        <StatCard
          label="Inactive Rates"
          value={displayStats.inactive}
          color="text-slate-800"
          bg="bg-linear-to-br from-slate-50 to-slate-100"
          border="border border-slate-200/70"
          icon={<EyeOff className="w-5 h-5 text-slate-600" />}
        />

        <StatCard
          label="Last Updated"
          value={
            displayStats.latestUpdate
              ? formatDate(displayStats.latestUpdate)
              : "Never"
          }
          color="text-amber-600"
          bg="bg-linear-to-br from-amber-50 to-amber-100"
          border="border border-amber-200/70"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
        />
      </Motion.div>

      {/* Search and Filters */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-violet-500 z-10" />
              <input
                type="text"
                placeholder="Search by notes..."
                defaultValue={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white/80 backdrop-blur-sm shadow-sm font-light"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-violet-500" />
              {/* FIX 2: Filter All Status dengan value="" */}
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light appearance-none"
              >
                <option value="">All Status</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                dispatch(
                  getManualRates({
                    page: pagination.currentPage,
                    limit: pagination.itemsPerPage,
                    ...filters,
                  })
                );
              }}
              disabled={isLoading}
              className="p-3 border border-slate-200 bg-white/80 backdrop-blur-sm rounded-2xl text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </Motion.button>
          </div>
        </div>

        {/* Currency Info */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-violet-100 px-4 py-2 rounded-xl">
              <ReactCountryFlag
                countryCode="ID"
                style={{ fontSize: "1.2em" }}
                svg
              />
              <span className="text-sm font-bold text-violet-700">
                IDR
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-xl">
              <ReactCountryFlag
                countryCode="US"
                style={{ fontSize: "1.2em" }}
                svg
              />
              <span className="text-sm font-bold text-emerald-700">
                USD
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-600 font-light">
            Showing {rates.length} of {pagination.totalItems} rates
          </div>
        </div>
      </Motion.div>

      {/* Bulk Actions Bar */}
      {selectedRates.length > 0 && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-violet-50 border-2 border-violet-200 rounded-3xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <span className="text-violet-700 font-bold">
                  {selectedRates.length}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-violet-800">
                  {selectedRates.length} rates selected
                </h4>
                <p className="text-violet-700 text-sm font-light">
                  Perform actions on selected rates
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkDeactivate}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Deactivate Selected
              </Motion.button>

              {/* TAMBAHKAN TOMBOL BULK DELETE PERMANENT */}
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkDeletePermanent}
                className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                Delete Permanent
              </Motion.button>

              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRates([])}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Clear Selection
              </Motion.button>
            </div>
          </div>
        </Motion.div>
      )}

      {/* Rates Display */}
      {isLoading ? (
        <div className="bg-white/80 backdrop-blur-md p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          <p className="mt-4 text-slate-700 font-medium">
            Loading exchange rates...
          </p>
          <p className="text-slate-600 text-sm font-light mt-1">
            Fetching latest IDR → USD rates
          </p>
        </div>
      ) : rates.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
          <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            No Rates Found
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto font-light">
            {filters.search
              ? "No rates match your search. Try different criteria."
              : "Start by adding your first IDR → USD rate for fair leaderboard rankings."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-sm font-medium"
            >
              Add First Rate
            </Motion.button>
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(setFilters({ search: "" }))}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-all shadow-sm font-medium"
            >
              Clear Filters
            </Motion.button>
          </div>
        </div>
      ) : (
        <TableRatesView
          rates={rates}
          selectedRates={selectedRates}
          onSelectRate={handleSelectRate}
          onSelectAll={handleSelectAll}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onDeletePermanent={handleDeletePermanent}
          formatCurrencyDisplay={formatCurrencyDisplay}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="text-sm text-slate-600 font-light">
            Showing {pagination.currentPage * pagination.itemsPerPage + 1} to{" "}
            {Math.min(
              (pagination.currentPage + 1) * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} rates
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
            forcePage={pagination.currentPage}
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

      {/* Validation Tool */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-linear-to-r from-violet-50 via-purple-50 to-violet-50 rounded-3xl p-6 shadow-sm border-2 border-violet-200"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-slate-800 gap-5 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-violet-100 p-3 rounded-xl">
              <Zap className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1.5">
                Currency Converter (IDR → USD)
              </h3>
              <p className="text-slate-600 font-light text-sm">
                Test currency conversion with current rates
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleValidate}
              disabled={isLoading}
              className="w-full md:w-auto bg-linear-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 px-5 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Validate</span>
            </Motion.button>
          </div>
        </div>

        {/* Validation Tool */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-violet-800 mb-2">
              IDR Amount
            </label>
            <div className="relative">
              <input
                type="number"
                name="amount"
                value={validationForm.amount}
                onChange={handleValidationChange}
                className="w-full pl-18 pr-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 font-semibold text-violet-900"
                placeholder="Example: 15000000"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <ReactCountryFlag
                  countryCode="ID"
                  style={{ fontSize: "1em" }}
                  svg
                />
                <span className="text-violet-700 text-sm font-medium">IDR</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-violet-800 mb-2">
              Currency
            </label>
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-2 border-violet-200 rounded-xl bg-violet-50">
              <div className="flex items-center gap-2">
                <ReactCountryFlag
                  countryCode="ID"
                  style={{ fontSize: "1.2em" }}
                  svg
                />
                <span className="font-bold text-violet-900">IDR</span>
              </div>
              <ArrowRight className="w-4 h-4 text-violet-400" />
              <div className="flex items-center gap-2">
                <ReactCountryFlag
                  countryCode="US"
                  style={{ fontSize: "1.2em" }}
                  svg
                />
                <span className="font-bold text-violet-900">USD</span>
              </div>
            </div>
          </div>
        </div>

        {validationResult && (
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 border-2 border-emerald-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-slate-800">Validation Result</h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-slate-600 font-light">
                  {new Date(
                    validationResult.rateEffectiveFrom
                  ).toLocaleDateString("en-US")}
                </div>
                {/* FIX 1: Tombol Clear Manual */}
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearValidation}
                  className="text-slate-500 hover:text-slate-800 text-sm font-medium hover:bg-slate-100 px-2 py-1 rounded-lg transition-all flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </Motion.button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Amount:</span>
                  <span className="font-bold flex items-center gap-2">
                    {parseFloat(validationResult.amount).toLocaleString(
                      "en-US"
                    )}
                    <ReactCountryFlag
                      countryCode="ID"
                      style={{ fontSize: "1em" }}
                      svg
                    />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">
                    Exchange Rate:
                  </span>
                  <span className="font-bold">
                    1 IDR = {validationResult.rate.toFixed(8)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Source:</span>
                  <span className="font-medium text-violet-600 capitalize">
                    {validationResult.rateSource === "manual"
                      ? "Manual"
                      : validationResult.rateSource}
                  </span>
                </div>
              </div>
              <div className="bg-linear-to-br from-emerald-50 to-green-50 rounded-xl p-5 border-2 border-emerald-200">
                <div className="text-center">
                  <div className="text-sm text-slate-600 mb-2 font-light">
                    Conversion Result
                  </div>
                  <div className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
                    ${validationResult.convertedAmountFormatted}
                    <ReactCountryFlag
                      countryCode="US"
                      style={{ fontSize: "1.2em" }}
                      svg
                    />
                  </div>
                  <div
                    className={`text-sm mt-2 ${
                      validationResult.canConvert
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {validationResult.canConvert
                      ? "✓ Conversion successful"
                      : "✗ Conversion unavailable"}
                  </div>
                </div>
              </div>
            </div>
          </Motion.div>
        )}
      </Motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <Modal
            title={editingRate ? "Edit Exchange Rate" : "Add IDR → USD Rate"}
            onClose={() => {
              setShowForm(false);
              setEditingRate(null);
            }}
            isLoading={isCreating || isUpdating}
          >
            <RateForm
              formData={formData}
              editingRate={editingRate}
              isSubmitting={isCreating || isUpdating}
              onSubmit={handleSubmit}
              onChange={handleFormChange}
              onClose={() => {
                setShowForm(false);
                setEditingRate(null);
              }}
            />
          </Modal>
        )}

        {showBulkForm && (
          <Modal
            title="Bulk Update Rates IDR → USD"
            onClose={() => setShowBulkForm(false)}
            size="large"
            isLoading={isBulkUpdating}
          >
            <BulkForm
              bulkData={bulkData}
              effectiveFrom={bulkEffectiveFrom}
              isSubmitting={isBulkUpdating}
              onSubmit={handleBulkSubmit}
              onBulkDataChange={handleBulkChange}
              onEffectiveFromChange={setBulkEffectiveFrom}
              onClose={() => setShowBulkForm(false)}
            />
          </Modal>
        )}

        {showStats && statistics && (
          <Modal
            title="Exchange Rate Statistics"
            onClose={() => setShowStats(false)}
            size="large"
          >
            <StatisticsView statistics={statistics} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
