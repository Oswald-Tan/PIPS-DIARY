import React, { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  addManualRate,
  updateManualRate,
  resetManualRateState,
} from "../../features/manualRateSlice";
import {
  Globe,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const AddEditRateModal = ({ rate, setShowModal }) => {
  const dispatch = useDispatch();

  const {
    isLoading,
    isSuccess,
    isError,
    message,
  } = useSelector((state) => state.manualRates);

  const [formData, setFormData] = useState({
    fromCurrency: "",
    toCurrency: "USD",
    rate: "",
    notes: "",
    isActive: true,
  });

  const [localMessage, setLocalMessage] = useState("");
  const [hasUserAction, setHasUserAction] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Pre-fill form jika editing
  useEffect(() => {
    if (rate) {
      setFormData({
        fromCurrency: rate.fromCurrency || "",
        toCurrency: rate.toCurrency || "USD",
        rate: rate.rate ? parseFloat(rate.rate).toString() : "",
        notes: rate.notes || "",
        isActive: rate.isActive !== undefined ? rate.isActive : true,
      });
    } else {
      // Default values for new rate
      setFormData({
        fromCurrency: "",
        toCurrency: "USD",
        rate: "",
        notes: "",
        isActive: true,
      });
    }
  }, [rate]);

  // Reset state saat modal dibuka
  useEffect(() => {
    dispatch(resetManualRateState());
    setHasUserAction(false);
    setLocalMessage("");
    setValidationErrors({});
  }, [dispatch]);

  // Handle response setelah action
  useEffect(() => {
    if (hasUserAction) {
      if (isSuccess) {
        setLocalMessage(
          rate
            ? "Rate updated successfully!"
            : "Rate added successfully!"
        );
        const timer = setTimeout(() => {
          setShowModal(false);
          dispatch(resetManualRateState());
        }, 2000);
        return () => clearTimeout(timer);
      }
      if (isError) {
        setLocalMessage(message);
      }
    }
  }, [isSuccess, isError, message, setShowModal, dispatch, hasUserAction, rate]);

  // Validasi form
  const validateForm = () => {
    const errors = {};

    if (!formData.fromCurrency || formData.fromCurrency.length !== 3) {
      errors.fromCurrency = "From currency must be a 3-letter ISO code";
    }

    if (!formData.toCurrency || formData.toCurrency.length !== 3) {
      errors.toCurrency = "To currency must be a 3-letter ISO code";
    }

    if (!formData.rate || isNaN(parseFloat(formData.rate))) {
      errors.rate = "Rate must be a valid number";
    } else if (parseFloat(formData.rate) <= 0) {
      errors.rate = "Rate must be greater than 0";
    } else if (parseFloat(formData.rate) > 1000000) {
      errors.rate = "Rate cannot exceed 1,000,000";
    }

    // Validasi khusus untuk IDR→USD (rate harus kecil)
    if (formData.fromCurrency === "IDR" && formData.toCurrency === "USD") {
      const rateValue = parseFloat(formData.rate);
      if (rateValue < 0.000001) {
        errors.rate = "Rate seems too low for IDR→USD";
      }
      if (rateValue > 0.01) {
        errors.rate = "Rate seems too high for IDR→USD";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      setLocalMessage("Please fix the errors in the form");
      return;
    }

    setHasUserAction(true);

    const rateData = {
      ...formData,
      rate: parseFloat(formData.rate),
    };

    if (rate) {
      // Update existing rate
      dispatch(updateManualRate({ id: rate.id, ...rateData }));
    } else {
      // Add new rate
      dispatch(addManualRate(rateData));
    }
  };

  const handleClose = () => {
    dispatch(resetManualRateState());
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      });
    }
  };

  const handleCurrencyChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, 3);
    setFormData({
      ...formData,
      fromCurrency: value,
    });
  };

  // Available currencies (common ones)
  const commonCurrencies = ["USD", "IDR", "EUR", "GBP", "JPY", "SGD", "AUD", "CAD", "CHF", "CNY"];

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-violet-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-7 h-7 text-violet-600" />
              {rate ? "Edit Exchange Rate" : "Add New Exchange Rate"}
            </h2>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-violet-500 hover:text-violet-700 p-2 rounded-xl hover:bg-violet-100 transition-colors"
              disabled={isLoading}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </Motion.button>
          </div>

          <div className="space-y-4">
            {/* Info Box */}
            {rate ? (
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="text-sm font-semibold text-blue-800 mb-1">
                  Editing Existing Rate
                </div>
                <div className="text-sm text-blue-700">
                  Original: 1 {rate.fromCurrency} = {parseFloat(rate.rate).toFixed(6)} {rate.toCurrency}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-violet-50 rounded-xl border-2 border-violet-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-violet-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-violet-800 mb-1">
                      Important Note
                    </p>
                    <p className="text-sm text-violet-700">
                      Manual rates will override API rates for this currency pair.
                      This affects leaderboard rankings and profit calculations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Currency Pair */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-violet-800 mb-2">
                  From Currency
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-600 w-4 h-4" />
                  <input
                    type="text"
                    name="fromCurrency"
                    value={formData.fromCurrency}
                    onChange={handleCurrencyChange}
                    placeholder="e.g., IDR"
                    className="w-full pl-10 pr-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-violet-900 uppercase"
                    maxLength="3"
                  />
                </div>
                {validationErrors.fromCurrency && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.fromCurrency}</p>
                )}
                <div className="mt-2 text-xs text-slate-600">
                  <p className="font-semibold">Common currencies:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {commonCurrencies.map(curr => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setFormData({...formData, fromCurrency: curr})}
                        className={`px-2 py-1 text-xs rounded-lg ${
                          formData.fromCurrency === curr
                            ? 'bg-violet-100 text-violet-700 border border-violet-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-violet-800 mb-2">
                  To Currency
                </label>
                <select
                  name="toCurrency"
                  value={formData.toCurrency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-violet-900"
                >
                  <option value="USD">USD (US Dollar)</option>
                  <option value="IDR">IDR (Indonesian Rupiah)</option>
                </select>
                {validationErrors.toCurrency && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.toCurrency}</p>
                )}
              </div>
            </div>

            {/* Exchange Rate */}
            <div>
              <label className="block text-sm font-bold text-violet-800 mb-2">
                Exchange Rate
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-600 w-4 h-4" />
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleInputChange}
                  placeholder="e.g., 0.000064"
                  step="0.000001"
                  className="w-full pl-10 pr-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-violet-900"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-violet-700 font-semibold">
                  1 {formData.fromCurrency || "XXX"}
                </div>
              </div>
              {validationErrors.rate && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.rate}</p>
              )}
              <div className="text-xs text-violet-600 mt-2">
                Enter the conversion rate: 1 {formData.fromCurrency || "XXX"} = {formData.rate || "?"} {formData.toCurrency}
                {formData.fromCurrency === "IDR" && formData.toCurrency === "USD" && (
                  <span className="text-amber-600 font-semibold ml-1">
                    • Typical range: 0.000064 - 0.000070
                  </span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-violet-800 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="e.g., Source: Bank Indonesia, effective Jan 2024"
                rows="3"
                className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-violet-900 resize-none"
              />
              <div className="text-xs text-violet-600 mt-2">
                Add context about this rate (source, effective period, etc.)
              </div>
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-bold text-violet-800 mb-3">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === true}
                    onChange={() => setFormData({...formData, isActive: true})}
                    className="text-violet-600 focus:ring-violet-500"
                  />
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">Active</span>
                    <span className="text-xs text-slate-600">(Used in calculations)</span>
                  </span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === false}
                    onChange={() => setFormData({...formData, isActive: false})}
                    className="text-violet-600 focus:ring-violet-500"
                  />
                  <span className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span className="font-semibold">Inactive</span>
                    <span className="text-xs text-slate-600">(Archived, not used)</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-sm font-semibold text-slate-700 mb-2">
                Preview:
              </div>
              <div className="text-xl font-bold text-slate-800">
                1 {formData.fromCurrency || "XXX"} = {formData.rate ? parseFloat(formData.rate).toFixed(6) : "0.000000"} {formData.toCurrency}
              </div>
              <div className="text-sm text-slate-600 mt-2">
                {formData.isActive ? (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                    Active rate • Will be used in calculations
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-600">
                    <XCircle className="w-4 h-4" />
                    Inactive rate • Will not affect calculations
                  </span>
                )}
              </div>
            </div>

            {/* Message Display */}
            {localMessage && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-sm font-semibold ${
                  isSuccess && hasUserAction
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : isError && hasUserAction
                    ? "bg-rose-100 text-rose-700 border border-rose-300"
                    : "bg-blue-100 text-blue-700 border border-blue-300"
                }`}
              >
                {localMessage}
              </Motion.div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-3 border-2 border-violet-300 rounded-xl text-violet-700 hover:bg-violet-50 transition-colors font-bold disabled:opacity-50"
              >
                Cancel
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {rate ? "Update Rate" : "Add Rate"}
                  </>
                )}
              </Motion.button>
            </div>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default AddEditRateModal;