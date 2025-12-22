import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion as Motion, AnimatePresence } from "framer-motion";
import ReactCountryFlag from "react-country-flag";
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
} from "lucide-react";
import {
  getManualRates,
  createManualRate,
  updateManualRate,
  deactivateManualRate,
  bulkUpsertRates,
  getRateStatistics,
  validateConversion,
  clearError,
  setFilters,
  setPage,
  clearValidationResult,
} from "../../features/manualRateSlice";
import debounce from "lodash.debounce";

// ==================== SUB-COMPONENTS ====================

// Modal Component
const Modal = ({ title, children, onClose, size = "medium" }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <Motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto ${
        size === "large" ? "max-w-4xl" : "max-w-md"
      }`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </Motion.div>
  </div>
);

// Rate Form Component (hanya IDR ke USD)
const RateForm = ({
  formData,
  editingRate,
  isSubmitting,
  onSubmit,
  onChange,
}) => (
  <form onSubmit={onSubmit}>
    <div className="space-y-4">
      {/* Currency Pair - Fixed IDR to USD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Currency
          </label>
          <div className="relative">
            <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
              <ReactCountryFlag
                countryCode="ID"
                style={{
                  fontSize: "1.5em",
                  marginRight: "8px",
                }}
                svg
              />
              <span className="font-bold">IDR</span>
            </div>
            <input type="hidden" name="fromCurrency" value="IDR" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Currency
          </label>
          <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
            <ReactCountryFlag
              countryCode="US"
              style={{
                fontSize: "1.5em",
                marginRight: "8px",
              }}
              svg
            />
            <span className="font-bold">USD</span>
          </div>
          <input type="hidden" name="toCurrency" value="USD" />
        </div>
      </div>

      {/* Exchange Rate Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Exchange Rate *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">1 IDR =</span>
          </div>
          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={onChange}
            placeholder="0.000064"
            step="any" // UBAH DARI step="0.000001" MENJADI "any"
            min="0.000000000001"
            className="w-full pl-16 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500">USD</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Contoh: Nilai 0.000064 berarti 1 IDR = 0.000064 USD
        </p>
        <p className="text-xs text-gray-500">
          Atau 15,625 IDR ≈ 1 USD (untuk rate 0.000064)
        </p>
        <p className="text-xs text-blue-600 font-medium mt-1">
          💡 Format: 0.000060 (6 digit desimal) atau 0.00006000 (8 digit) -
          maksimal 12 digit
        </p>
      </div>

      {/* Effective Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Berlaku Dari
        </label>
        <input
          type="date"
          name="effectiveFrom"
          value={formData.effectiveFrom}
          onChange={onChange}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan (Opsional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={onChange}
          placeholder="Contoh: Rate dari Bank Indonesia, update mingguan..."
          rows="3"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("closeFormModal"))
          }
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
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
        </button>
      </div>
    </div>
  </form>
);

// Bulk Form Component (hanya IDR ke USD)
const BulkForm = ({
  bulkData,
  effectiveFrom,
  isSubmitting,
  onSubmit,
  onBulkDataChange,
  onEffectiveFromChange,
}) => (
  <div className="space-y-4">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-blue-800">Instruksi Format</h4>
          <p className="text-blue-700 text-sm mt-1">
            Masukkan satu rate per baris (hanya angka):
          </p>
          <code className="block bg-white p-2 rounded border border-blue-300 text-sm text-blue-800 mt-2 font-mono">
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Berlaku Dari Tanggal
      </label>
      <input
        type="date"
        value={effectiveFrom}
        onChange={(e) => onEffectiveFromChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Data Rate (Satu per Baris)
      </label>
      <textarea
        value={bulkData}
        onChange={onBulkDataChange}
        rows="12"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
        placeholder="0.000064&#10;0.000065&#10;0.000066"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-bold text-gray-700 mb-2">Template Cepat</h4>
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
            className="text-sm text-blue-600 hover:text-blue-800 text-left w-full text-start"
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
            className="text-sm text-blue-600 hover:text-blue-800 text-left w-full text-start"
          >
            📊 Rate Mingguan
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-bold text-gray-700 mb-2">Preview</h4>
        <div className="text-sm text-gray-600 space-y-1">
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
            <div className="text-gray-500">
              +{bulkData.split("\n").filter((line) => line.trim()).length - 3}{" "}
              lainnya
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="flex gap-3 pt-4">
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("closeBulkModal"))}
        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
      >
        Batal
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!bulkData.trim() || isSubmitting}
        className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {isSubmitting ? "Memproses..." : "Update Semua Rate"}
      </button>
    </div>
  </div>
);

// Statistics View Component
const StatisticsView = ({ statistics }) => (
  <div className="space-y-6">
    {/* Summary */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-700">Total Rates</div>
        <div className="text-2xl font-bold text-blue-800">
          {statistics.summary?.totalManualRates || 0}
        </div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="text-sm text-green-700">Active Rates</div>
        <div className="text-2xl font-bold text-green-800">
          {statistics.summary?.activeManualRates || 0}
        </div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="text-sm text-purple-700">Currency Pairs</div>
        <div className="text-2xl font-bold text-purple-800">
          {statistics.summary?.totalCurrencyPairs || 0}
        </div>
      </div>
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <div className="text-sm text-amber-700">Last Updated</div>
        <div className="text-sm font-bold text-amber-800">
          {statistics.summary?.lastUpdated
            ? new Date(statistics.summary.lastUpdated).toLocaleDateString()
            : "Never"}
        </div>
      </div>
    </div>

    {/* Source Distribution */}
    {statistics.sourceCounts && statistics.sourceCounts.length > 0 && (
      <div>
        <h4 className="font-bold text-gray-700 mb-3">Rate Sources</h4>
        <div className="space-y-2">
          {statistics.sourceCounts.map((source) => (
            <div
              key={source.source}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    source.source === "manual"
                      ? "bg-blue-500"
                      : source.source === "api"
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
                />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {source.source}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {source.count} total ({source.activeCount} active)
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Currency Pairs */}
    {statistics.currencyPairs && statistics.currencyPairs.length > 0 && (
      <div>
        <h4 className="font-bold text-gray-700 mb-3">Currency Pairs</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {statistics.currencyPairs.map((pair) => (
            <div
              key={`${pair.fromCurrency}_${pair.toCurrency}`}
              className="bg-gray-50 p-3 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800">
                    {pair.fromCurrency} → {pair.toCurrency}
                  </span>
                  <div className="text-xs text-gray-500">
                    {pair.totalRates} rate{pair.totalRates !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(pair.latestUpdate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Recent Updates */}
    {statistics.recentUpdates && statistics.recentUpdates.length > 0 && (
      <div>
        <h4 className="font-bold text-gray-700 mb-3">Recent Updates</h4>
        <div className="space-y-2">
          {statistics.recentUpdates.map((update) => (
            <div
              key={update.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    update.isActive ? "bg-green-500" : "bg-gray-500"
                  }`}
                ></div>
                <div>
                  <div className="font-medium text-gray-800">
                    {update.fromCurrency} → {update.toCurrency}
                  </div>
                  <div className="text-xs text-gray-500">
                    Rate: {parseFloat(update.rate).toFixed(8)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {new Date(update.lastUpdated).toLocaleDateString()}
                </div>
                {update.updater && (
                  <div className="text-xs text-gray-600">
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

// Table Rates View Component (menggunakan react-country-flag)
const TableRatesView = ({
  rates,
  selectedRates,
  onSelectRate,
  onSelectAll,
  onEdit,
  onDeactivate,
  formatCurrencyDisplay,
  formatDate,
  formatDateTime,
}) => {
  // Fungsi untuk mendapatkan country code berdasarkan currency code
  const getCountryCode = (currencyCode) => {
    const currencyToCountry = {
      IDR: "ID",
      USD: "US",
      EUR: "EU", // EU bukan country code standar, tapi untuk bendera EU
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
    <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-6 py-3">
                <input
                  type="checkbox"
                  checked={
                    selectedRates.length === rates.length && rates.length > 0
                  }
                  onChange={onSelectAll}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency Pair
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exchange Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effective Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rates.map((rate) => {
              const fromCountryCode = getCountryCode(rate.fromCurrency);
              const toCountryCode = getCountryCode(rate.toCurrency);

              return (
                <Motion.tr
                  key={rate.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRates.includes(rate.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRates.includes(rate.id)}
                      onChange={() => onSelectRate(rate.id)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <ReactCountryFlag
                              countryCode={fromCountryCode}
                              style={{
                                fontSize: "1.5em",
                                lineHeight: "1.5em",
                              }}
                              svg
                              title={rate.fromCurrency}
                            />
                            <span className="font-bold text-gray-800">
                              {rate.fromCurrency}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div className="flex items-center gap-1">
                            <ReactCountryFlag
                              countryCode={toCountryCode}
                              style={{
                                fontSize: "1.5em",
                                lineHeight: "1.5em",
                              }}
                              svg
                              title={rate.toCurrency}
                            />
                            <span className="font-bold text-gray-800">
                              {rate.toCurrency}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          IDR → USD
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="font-mono text-gray-800 font-bold">
                        {formatCurrencyDisplay(
                          rate.fromCurrency,
                          rate.toCurrency,
                          parseFloat(rate.rate)
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {rate.source === "manual"
                          ? "📝 Manual Rate"
                          : "🔄 API Rate"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-gray-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDate(rate.effectiveFrom)}
                      </div>
                      {rate.effectiveTo && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          Until: {formatDate(rate.effectiveTo)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rate.isActive
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {rate.isActive ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                            Active
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></div>
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {formatDateTime(rate.lastUpdated || rate.updatedAt)}
                      </div>
                      {rate.updater && (
                        <div className="text-xs text-gray-600 truncate max-w-[150px]">
                          By: {rate.updater.name || rate.updater.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(rate)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit rate"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeactivate(rate.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate rate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(rate.rate.toString())
                        }
                        className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Copy rate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
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

// ==================== MAIN COMPONENT ====================

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

  // Load rates on mount
  useEffect(() => {
    console.log("🔍 Initial load of rates");
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
  };

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        console.log("🔍 Debounced search for:", searchTerm);
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
      console.log("🔄 Filter changed:", filterName, value);
      dispatch(setFilters({ [filterName]: value }));
    },
    [dispatch]
  );

  // Handle pagination
  const handlePageChange = useCallback(
    (page) => {
      console.log("📄 Page changed to:", page);
      dispatch(setPage(page));
    },
    [dispatch]
  );

  // Submit form
  // Submit form - PERBAIKAN DI SINI
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 Submitting form:", formData);

    try {
      let result;
      if (editingRate) {
        console.log("🔄 Updating existing rate:", editingRate.id);
        result = await dispatch(
          updateManualRate({ id: editingRate.id, ...formData })
        );
      } else {
        console.log("➕ Creating new rate");
        result = await dispatch(createManualRate(formData));
      }

      // Cek apakah action berhasil
      if (
        updateManualRate.fulfilled.match(result) ||
        createManualRate.fulfilled.match(result)
      ) {
        console.log("✅ Operation successful");
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

        // Refresh rates after successful operation
        console.log("🔄 Refreshing rates list...");
        await dispatch(
          getManualRates({
            page: pagination.currentPage,
            limit: pagination.itemsPerPage,
            ...filters,
          })
        );

        // Juga refresh statistics
        await dispatch(getRateStatistics());

        // Tampilkan pesan sukses
        dispatch(clearError());
      } else if (
        updateManualRate.rejected.match(result) ||
        createManualRate.rejected.match(result)
      ) {
        // Error sudah dihandle di slice, tampilkan di UI
        console.error("❌ Operation failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      dispatch(clearError());
    }
  };

  // Handle bulk submit - Hanya IDR ke USD
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
      // Refresh rates after successful operation
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
    setFormData({
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      rate: rate.rate.toString(),
      effectiveFrom: new Date(rate.effectiveFrom).toISOString().split("T")[0],
      notes: rate.notes || "",
      updateLeaderboard: false,
    });
    setShowForm(true);
  };

  // Handle deactivate
  const handleDeactivate = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to deactivate this rate? This will affect leaderboard rankings."
      )
    ) {
      await dispatch(deactivateManualRate(id));
      // Refresh rates after successful operation
      dispatch(
        getManualRates({
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...filters,
        })
      );
    }
  };

  // Handle validation
  const handleValidate = async () => {
    const result = await dispatch(validateConversion(validationForm));
    if (validateConversion.fulfilled.match(result)) {
      // Result sudah disimpan di Redux store
    }
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

  // Handle bulk deactivate
  const handleBulkDeactivate = async () => {
    if (selectedRates.length === 0) return;

    if (window.confirm(`Deactivate ${selectedRates.length} selected rates?`)) {
      for (const id of selectedRates) {
        await dispatch(deactivateManualRate(id));
      }
      setSelectedRates([]);
      // Refresh rates after successful operation
      dispatch(
        getManualRates({
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...filters,
        })
      );
    }
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

  // Handle modal close events
  useEffect(() => {
    const handleCloseFormModal = () => {
      setShowForm(false);
      setEditingRate(null);
    };

    const handleCloseBulkModal = () => {
      setShowBulkForm(false);
    };

    window.addEventListener("closeFormModal", handleCloseFormModal);
    window.addEventListener("closeBulkModal", handleCloseBulkModal);

    return () => {
      window.removeEventListener("closeFormModal", handleCloseFormModal);
      window.removeEventListener("closeBulkModal", handleCloseBulkModal);
    };
  }, []);

  // Clear validation result when closing validation tool
  useEffect(() => {
    if (!showForm && !showBulkForm && !showStats) {
      dispatch(clearValidationResult());
    }
  }, [showForm, showBulkForm, showStats, dispatch]);

  // Effect untuk fetch rates ketika filters atau page berubah
  useEffect(() => {
    console.log("🔄 Fetching rates with updated filters/page", {
      page: pagination.currentPage,
      filters,
    });

    dispatch(
      getManualRates({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      })
    );
  }, [dispatch, filters, pagination.currentPage, pagination.itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-blue-600" />
              IDR → USD Exchange Rate Manager
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola rate IDR ke USD untuk perankingan leaderboard yang adil
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Rate Baru
            </button>

            <button
              onClick={() => setShowBulkForm(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Bulk Update
            </button>

            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Statistik
            </button>

            <button
              onClick={() => {
                console.log("🔄 Manual refresh triggered");
                dispatch(
                  getManualRates({
                    page: pagination.currentPage,
                    limit: pagination.itemsPerPage,
                    ...filters,
                  })
                );
              }}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Rates</p>
                <p className="text-2xl font-bold text-gray-800">
                  {displayStats.total}
                </p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rate Aktif</p>
                <p className="text-2xl font-bold text-gray-800">
                  {displayStats.active}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rate Tidak Aktif</p>
                <p className="text-2xl font-bold text-gray-800">
                  {displayStats.inactive}
                </p>
              </div>
              <EyeOff className="w-8 h-8 text-gray-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Terakhir Diupdate</p>
                <p className="text-sm font-bold text-gray-800 truncate">
                  {displayStats.latestUpdate
                    ? formatDate(displayStats.latestUpdate)
                    : "Never"}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </Motion.div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-red-800">Error</h4>
                  {/* Tampilkan error sebagai string */}
                  <p className="text-red-700 text-sm mt-1">
                    {typeof error === "string"
                      ? error
                      : error.message || "An error occurred"}
                  </p>
                  {/* Tampilkan saran jika ada */}
                  {error.suggestion && (
                    <p className="text-red-600 text-sm mt-2">
                      <span className="font-medium">Suggestion:</span>{" "}
                      {error.suggestion}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dispatch(clearError())}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-4 shadow border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan catatan..."
                defaultValue={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="true">Aktif Saja</option>
                <option value="false">Tidak Aktif</option>
                <option value="">Semua Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Info Mata Uang */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
              <ReactCountryFlag
                countryCode="ID"
                style={{
                  fontSize: "1.2em",
                }}
                svg
              />
              <span className="text-sm font-medium text-blue-700">
                IDR (Rupiah Indonesia)
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
              <ReactCountryFlag
                countryCode="US"
                style={{
                  fontSize: "1.2em",
                }}
                svg
              />
              <span className="text-sm font-medium text-green-700">
                USD (Dolar Amerika)
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Menampilkan {rates.length} dari {pagination.totalItems} rate
          </div>
        </div>
      </Motion.div>

      {/* Bulk Actions Bar */}
      {selectedRates.length > 0 && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-700 font-bold">
                    {selectedRates.length}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-blue-800">
                    {selectedRates.length} rate terpilih
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Lakukan aksi pada rate yang dipilih
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDeactivate}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Nonaktifkan Terpilih
                </button>
                <button
                  onClick={() => setSelectedRates([])}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  Hapus Pilihan
                </button>
              </div>
            </div>
          </div>
        </Motion.div>
      )}

      {/* Rates Display - Hanya Table View */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Memuat exchange rates...</p>
          <p className="text-gray-500 text-sm">
            Mengambil rate IDR → USD terbaru
          </p>
        </div>
      ) : rates.length === 0 ? (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Tidak Ada Rate Ditemukan
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {filters.search
              ? "Tidak ada rate yang cocok dengan pencarian Anda. Coba ubah kriteria pencarian."
              : "Mulai dengan menambahkan rate IDR → USD pertama Anda untuk perankingan leaderboard yang adil."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Tambah Rate Pertama
            </button>
            <button
              onClick={() => {
                dispatch(setFilters({ search: "" }));
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Hapus Filter
            </button>
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
          formatCurrencyDisplay={formatCurrencyDisplay}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Halaman {pagination.currentPage} dari {pagination.totalPages} •{" "}
                {pagination.totalItems} total rate
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Sebelumnya
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map(
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            pagination.currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  {pagination.totalPages > 5 &&
                    pagination.currentPage < pagination.totalPages - 2 && (
                      <>
                        <span className="px-2">...</span>
                        <button
                          onClick={() =>
                            handlePageChange(pagination.totalPages)
                          }
                          className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          {pagination.totalPages}
                        </button>
                      </>
                    )}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </Motion.div>
      )}

      {/* Validation Tool */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6"
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Konversi Validator (IDR → USD)
              </h3>
              <p className="text-blue-700 text-sm">
                Uji konversi mata uang dengan rate saat ini
              </p>
            </div>
            <button
              onClick={handleValidate}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Validasi
            </button>
          </div>

          {/* Validation Tool - Hanya IDR ke USD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah IDR
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  value={validationForm.amount}
                  onChange={handleValidationChange}
                  className="w-full pl-18 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: 15000000"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <ReactCountryFlag
                    countryCode="ID"
                    style={{
                      fontSize: "1em",
                    }}
                    svg
                  />
                  <span className="text-gray-500 text-sm">IDR</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mata Uang
              </label>
              <div className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <ReactCountryFlag
                    countryCode="ID"
                    style={{
                      fontSize: "1.2em",
                    }}
                    svg
                  />
                  <span className="font-medium">IDR</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <ReactCountryFlag
                    countryCode="US"
                    style={{
                      fontSize: "1.2em",
                    }}
                    svg
                  />
                  <span className="font-medium">USD</span>
                </div>
              </div>
            </div>
          </div>

          {validationResult && (
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white rounded-lg p-4 border border-blue-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-gray-800">Hasil Validasi</h4>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(
                      validationResult.rateEffectiveFrom
                    ).toLocaleDateString("id-ID")}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Jumlah:</span>
                      <span className="font-bold flex items-center gap-2">
                        {parseFloat(validationResult.amount).toLocaleString(
                          "id-ID"
                        )}
                        <ReactCountryFlag
                          countryCode="ID"
                          style={{
                            fontSize: "1em",
                          }}
                          svg
                        />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exchange Rate:</span>
                      <span className="font-bold">
                        1 IDR = {validationResult.rate.toFixed(8)} USD
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sumber:</span>
                      <span className="font-medium text-blue-600 capitalize">
                        {validationResult.rateSource === "manual"
                          ? "Manual"
                          : validationResult.rateSource}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">
                        Hasil Konversi
                      </div>
                      <div className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                        ${validationResult.convertedAmountFormatted}
                        <ReactCountryFlag
                          countryCode="US"
                          style={{
                            fontSize: "1.2em",
                          }}
                          svg
                        />
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        {validationResult.canConvert
                          ? "✓ Konversi berhasil"
                          : "✗ Konversi tidak tersedia"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Motion.div>
          )}
        </div>
      </Motion.div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <Modal
            title={editingRate ? "Edit Exchange Rate" : "Tambah Rate IDR → USD"}
            onClose={() => {
              setShowForm(false);
              setEditingRate(null);
            }}
          >
            <RateForm
              formData={formData}
              editingRate={editingRate}
              isSubmitting={isCreating || isUpdating}
              onSubmit={handleSubmit}
              onChange={handleFormChange}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Bulk Update Modal */}
      <AnimatePresence>
        {showBulkForm && (
          <Modal
            title="Bulk Update Rates IDR → USD"
            onClose={() => setShowBulkForm(false)}
            size="large"
          >
            <BulkForm
              bulkData={bulkData}
              effectiveFrom={bulkEffectiveFrom}
              isSubmitting={isBulkUpdating}
              onSubmit={handleBulkSubmit}
              onBulkDataChange={handleBulkChange}
              onEffectiveFromChange={setBulkEffectiveFrom}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Statistics Modal */}
      <AnimatePresence>
        {showStats && statistics && (
          <Modal
            title="Statistik Exchange Rate"
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
