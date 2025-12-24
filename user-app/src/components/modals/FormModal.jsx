import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  LogIn,
  LogOut,
  Shield,
  Target,
  Minus,
  DollarSign,
  Trophy,
  BookOpen,
  Globe,
  Smile,
  FileText,
  X,
  Save,
  Loader,
  Wallet,
  AlertCircle,
  FileTextIcon,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { formatCurrency } from "../../utils/currencyFormatter";

const FormModal = ({
  form,
  setForm,
  editing,
  saveForm,
  closeForm,
  isLoading,
  currentBalance = 0,
  currency = "USD",
  originalData = null,
}) => {
  const [profitDisplay, setProfitDisplay] = useState("");
  const [isOtherStrategy, setIsOtherStrategy] = useState(false);
  const [customStrategy, setCustomStrategy] = useState("");
  const [strategyValue, setStrategyValue] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [isOtherMarket, setIsOtherMarket] = useState(false);
  const [customMarket, setCustomMarket] = useState("");
  const [marketValue, setMarketValue] = useState("");

  // SEMUA FIELD WAJIB DIISI (kecuali screenshot)
  const requiredFields = [
    "date",
    "instrument",
    "type",
    "lot",
    "entry",
    "exit",
    "stop",
    "take",
    "pips",
    "profit",
    "result",
    "strategy",
    "market",
    "emotionBefore",
    "emotionAfter",
    "riskReward",
    "notes",
  ];

  // Initialize profit display
  useEffect(() => {
    if (form.profit) {
      const num = parseFloat(form.profit);
      if (!isNaN(num)) {
        setProfitDisplay(formatNumberForInput(num.toString()));
      } else {
        setProfitDisplay(form.profit);
      }
    } else {
      setProfitDisplay("");
    }
  }, [form.profit]);

  // Initialize strategy state
  useEffect(() => {
    if (form.strategy) {
      const predefinedStrategies = [
        "Trend Following",
        "Breakout",
        "Pullback",
        "Range",
        "Price Action",
        "Indicator",
        "Supply & Demand / SMC",
        "News",
        "Session Trading",
      ];

      if (predefinedStrategies.includes(form.strategy)) {
        setIsOtherStrategy(false);
        setCustomStrategy("");
        setStrategyValue(form.strategy);
      } else {
        setIsOtherStrategy(true);
        setCustomStrategy(form.strategy);
        setStrategyValue("Other");
      }
    } else {
      setIsOtherStrategy(false);
      setCustomStrategy("");
      setStrategyValue("");
    }
  }, [form.strategy, setForm]);

  // Initialize market state
  useEffect(() => {
    if (form.market) {
      const predefinedMarkets = [
        "Trending",
        "Ranging",
        "Volatile",
        "Low Vol",
        "Breakout",
        "Reversal",
      ];

      if (predefinedMarkets.includes(form.market)) {
        setIsOtherMarket(false);
        setCustomMarket("");
        setMarketValue(form.market);
      } else {
        setIsOtherMarket(true);
        setCustomMarket(form.market);
        setMarketValue("Other");
      }
    } else {
      setIsOtherMarket(false);
      setCustomMarket("");
      setMarketValue("");
    }
  }, [form.market, setForm]);

  // Validasi form sebelum submit
  const validateForm = () => {
    const errors = {};

    // Validasi field tidak boleh kosong
    requiredFields.forEach((field) => {
      if (!form[field] || form[field].toString().trim() === "") {
        errors[field] = "Field ini wajib diisi";
      }
    });

    // Validasi khusus untuk angka
    const numericValidations = {
      lot: { min: 0.01, message: "Lot harus lebih besar dari 0" },
      entry: { min: 0.00001, message: "Entry price harus lebih besar dari 0" },
      exit: { min: 0.00001, message: "Exit price harus lebih besar dari 0" },
      stop: { min: 0.00001, message: "Stop loss harus lebih besar dari 0" },
      take: { min: 0.00001, message: "Take profit harus lebih besar dari 0" },
      pips: { min: 0, message: "Pips tidak boleh negatif" },
      riskReward: { min: 0, message: "Risk/Reward tidak boleh negatif" },
    };

    Object.entries(numericValidations).forEach(([field, validation]) => {
      if (form[field]) {
        const num = parseFloat(form[field]);
        if (isNaN(num)) {
          errors[field] = "Harus berupa angka";
        } else if (num < validation.min) {
          errors[field] = validation.message;
        }
      }
    });

    // Validasi profit
    if (form.profit) {
      const profitNum = parseFloat(form.profit);
      if (isNaN(profitNum)) {
        errors.profit = "Profit harus berupa angka";
      }
    }

    // Validasi custom strategy
    if (form.strategy === "Other" && !customStrategy.trim()) {
      errors.strategy = "Custom strategy harus diisi";
    }

    // Validasi custom market
    if (form.market === "Other" && !customMarket.trim()) {
      errors.market = "Custom market condition harus diisi";
    }

    // Validasi konsistensi result dan profit
    if (form.result && form.profit) {
      const profitNum = parseFloat(form.profit) || 0;

      if (form.result.toLowerCase().includes("win") && profitNum <= 0) {
        errors.result = "Result 'Win' harus memiliki Profit positif";
      }

      if (form.result.toLowerCase().includes("lose") && profitNum >= 0) {
        errors.result = "Result 'Lose' harus memiliki Profit negatif";
      }

      if (form.result.toLowerCase().includes("break even") && profitNum !== 0) {
        errors.result = "Result 'Break Even' harus memiliki Profit = 0";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const cleanNumberInput = (value) => {
    if (value === "") return "";

    let cleaned = value.replace(/[^\d.,-]/g, "");
    cleaned = cleaned.replace(",", ".");

    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    return cleaned;
  };

  const formatNumberDisplay = (value) => {
    if (value === "" || value === "-") return value;

    const withoutThousands = value.replace(/\./g, "");
    const cleaned = withoutThousands.replace(",", ".");

    const numValue = parseFloat(cleaned);
    if (isNaN(numValue)) return value;

    const isDecimal = Math.floor(numValue) !== numValue;

    if (isDecimal) {
      return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numValue);
    } else {
      return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numValue);
    }
  };

  const formatNumberOnBlur = (key, value) => {
    // Tentukan field mana yang perlu diformat sebagai angka
    const numericFields = [
      "lot", "entry", "exit", "stop", "take", 
      "pips", "profit", "riskReward"
    ];

    // Jika bukan field angka, kembalikan nilai asli
    if (!numericFields.includes(key)) {
      return value;
    }

    if (value === "") return "";

    const cleaned = cleanNumberInput(value);
    if (cleaned === "" || cleaned === "-") return "";

    const numValue = parseFloat(cleaned);
    if (isNaN(numValue)) return "";

    let formatted = numValue;

    if (["entry", "exit", "stop", "take"].includes(key)) {
      formatted = parseFloat(numValue.toFixed(5));
    } else if (key === "lot") {
      formatted = parseFloat(numValue.toFixed(2));
    } else if (key === "pips") {
      formatted = Math.round(numValue);
    } else if (key === "riskReward") {
      formatted = parseFloat(numValue.toFixed(2));
    } else if (key === "profit") {
      const isDecimal = Math.floor(numValue) !== numValue;
      if (isDecimal) {
        formatted = parseFloat(numValue.toFixed(2));
      } else {
        formatted = numValue;
      }
    }

    return formatted.toString();
  };

  const handleNumberChange = (key, value) => {
    const cleaned = cleanNumberInput(value);

    setForm({ ...form, [key]: cleaned });

    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

    if (key === "profit") {
      const displayValue = formatNumberForInput(value);
      setProfitDisplay(displayValue);
    }
  };

  const formatNumberForInput = (value) => {
    if (value === "") return "";

    let cleaned = value.replace(/[^\d-]/g, "");

    const isNegative = cleaned.startsWith("-");
    if (isNegative) {
      cleaned = cleaned.substring(1);
    }

    cleaned = cleaned.replace(/^0+/, "") || "0";

    const parts = [];
    for (let i = cleaned.length; i > 0; i -= 3) {
      parts.push(cleaned.substring(Math.max(0, i - 3), i));
    }

    let formatted = parts.reverse().join(".");

    if (isNegative) {
      formatted = "-" + formatted;
    }

    return formatted;
  };

  const handleProfitInput = (value) => {
    const displayValue = formatNumberForInput(value);
    setProfitDisplay(displayValue);

    // Simpan nilai asli (tanpa format) ke dalam form
    const numericValue = displayValue.replace(/\./g, "");
    const cleaned = cleanNumberInput(numericValue);

    setForm((prev) => {
      const newForm = { ...prev, profit: cleaned };

      if (!prev.result || prev.result === "Pending") {
        const numValue = parseFloat(cleaned);
        if (!isNaN(numValue)) {
          if (numValue > 0) {
            newForm.result = "Win";
          } else if (numValue < 0) {
            newForm.result = "Lose";
          } else {
            newForm.result = "Break Even";
          }
        }
      }

      return newForm;
    });

    if (validationErrors.profit) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.profit;
        return newErrors;
      });
    }
  };

  const handleResultChange = (result) => {
    const currentProfit = parseFloat(form.profit) || 0;

    if (result.toLowerCase().includes("lose") && currentProfit > 0) {
      const newProfit = (-currentProfit).toString();
      setForm({
        ...form,
        result: result,
        profit: newProfit,
      });
      setProfitDisplay(formatNumberForInput(newProfit));
    } else if (result.toLowerCase().includes("win") && currentProfit < 0) {
      const newProfit = Math.abs(currentProfit).toString();
      setForm({
        ...form,
        result: result,
        profit: newProfit,
      });
      setProfitDisplay(formatNumberForInput(newProfit));
    } else if (result.toLowerCase().includes("break even")) {
      setForm({
        ...form,
        result: result,
        profit: "0",
      });
      setProfitDisplay("0");
    } else {
      setForm({ ...form, result: result });
    }

    // Clear validation error for result
    if (validationErrors.result) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.result;
        return newErrors;
      });
    }
  };

  const handleInputChange = (key, value) => {
    if (key === "profit") {
      handleProfitInput(value);
    } else if (key === "strategy") {
      setStrategyValue(value);

      if (value === "Other") {
        setIsOtherStrategy(true);
        if (customStrategy) {
          setForm((prev) => ({ ...prev, [key]: customStrategy }));
        } else {
          setForm((prev) => ({ ...prev, [key]: "" }));
        }
      } else {
        setIsOtherStrategy(false);
        setCustomStrategy("");
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else if (key === "market") {
      setMarketValue(value);

      if (value === "Other") {
        setIsOtherMarket(true);
        if (customMarket) {
          setForm((prev) => ({ ...prev, [key]: customMarket }));
        } else {
          setForm((prev) => ({ ...prev, [key]: "" }));
        }
      } else {
        setIsOtherMarket(false);
        setCustomMarket("");
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else if (
      ["lot", "entry", "exit", "stop", "take", "pips", "riskReward"].includes(
        key
      )
    ) {
      handleNumberChange(key, value);
    } else if (key === "result") {
      handleResultChange(value);
    } else {
      setForm({ ...form, [key]: value });

      if (validationErrors[key]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    }
  };

  const handleBlur = (key) => {
    const currentValue = key === "profit" ? form.profit : form[key];
    if (currentValue === undefined || currentValue === "") return;

    // Hanya format untuk field angka
    const formatted = formatNumberOnBlur(key, currentValue);
    
    if (formatted !== currentValue) {
      setForm((prev) => ({ ...prev, [key]: formatted }));

      if (key === "profit") {
        const num = parseFloat(formatted);
        if (!isNaN(num)) {
          const displayValue = formatNumberDisplay(formatted);
          setProfitDisplay(displayValue);
        }
      }
    }

    // Validasi field setelah blur
    if (requiredFields.includes(key)) {
      const valueToCheck = formatted || currentValue;
      if (!valueToCheck || valueToCheck.toString().trim() === "") {
        setValidationErrors((prev) => ({
          ...prev,
          [key]: "Field ini wajib diisi",
        }));
      }
    }
  };

  const calculateBalanceAfter = () => {
    const profit = parseFloat(form.profit) || 0;

    if (editing && originalData) {
      const originalProfit = parseFloat(originalData.profit) || 0;
      return currentBalance - originalProfit + profit;
    }

    return currentBalance + profit;
  };

  const getFieldIcon = (key) => {
    const icons = {
      date: Calendar,
      instrument: BarChart3,
      type: TrendingUp,
      lot: Package,
      entry: LogIn,
      exit: LogOut,
      stop: Shield,
      take: Target,
      pips: Minus,
      profit: DollarSign,
      result: Trophy,
      strategy: BookOpen,
      market: Globe,
      emotionBefore: Smile,
      emotionAfter: Smile,
      notes: FileText,
      riskReward: Target,
    };
    return icons[key] || FileText;
  };

  const getFieldLabel = (key) => {
    const labels = {
      date: "Tanggal Trading",
      instrument: "Instrumen",
      type: "Tipe Trading",
      lot: "Lot Size",
      entry: "Entry Price",
      exit: "Exit Price",
      stop: "Stop Loss",
      take: "Take Profit",
      pips: "Pips",
      profit: `Profit/Loss (${currency})`, // Ditambahkan currency di sini
      result: "Result",
      strategy: "Strategy",
      market: "Kondisi Market",
      emotionBefore: "Emosi Sebelum",
      emotionAfter: "Emosi Sesudah",
      notes: "Catatan Trading",
      riskReward: "Risk/Reward Ratio",
    };
    return labels[key] || key;
  };

  const getInputPlaceholder = (key) => {
    const placeholders = {
      date: "YYYY-MM-DD",
      instrument: "Contoh: XAUUSD, EURUSD",
      lot: "0.01",
      entry: "4018.15",
      exit: "4047.23",
      stop: "4000.00",
      take: "4050.00",
      pips: "10",
      profit: "15000",
      riskReward: "1.5",
      strategy: "Pilih strategy yang digunakan",
      market: "Pilih kondisi market",
      emotionBefore: "Contoh: Percaya diri, Nervous, Tenang",
      emotionAfter: "Contoh: Puas, Kecewa, Netral",
      notes: "Deskripsikan trading Anda secara detail...",
    };
    return placeholders[key] || `Masukkan ${getFieldLabel(key).toLowerCase()}`;
  };

  const getInputType = (key) => {
    if (["date"].includes(key)) return "date";
    if (
      [
        "lot",
        "entry",
        "exit",
        "stop",
        "take",
        "pips",
        "profit",
        "riskReward",
      ].includes(key)
    ) {
      return "text";
    }
    return "text";
  };

  const getInputMode = (key) => {
    if (
      [
        "lot",
        "entry",
        "exit",
        "stop",
        "take",
        "pips",
        "profit",
        "riskReward",
      ].includes(key)
    ) {
      return "decimal";
    }
    return "text";
  };

  const fields = [
    { key: "date", type: "date", required: true },
    { key: "instrument", type: "text", required: true },
    {
      key: "type",
      type: "select",
      options: ["Buy", "Sell"],
      icons: {
        Buy: TrendingUp,
        Sell: TrendingDown,
      },
      required: true,
    },
    { key: "lot", type: "number", required: true },
    { key: "entry", type: "number", required: true },
    { key: "exit", type: "number", required: true },
    { key: "stop", type: "number", required: true },
    { key: "take", type: "number", required: true },
    { key: "pips", type: "number", required: true },
    {
      key: "profit",
      type: "number",
      required: true,
    },
    {
      key: "result",
      type: "select",
      options: ["Win", "Lose", "Break Even"],
      customHandler: handleResultChange,
      required: true,
    },
    {
      key: "strategy",
      type: "select",
      options: [
        "Trend Following",
        "Breakout",
        "Pullback",
        "Range",
        "Price Action",
        "Indicator",
        "Supply & Demand / SMC",
        "News",
        "Session Trading",
        "Other",
      ],
      required: true,
    },
    {
      key: "market",
      type: "select",
      options: ["Trending", "Ranging", "Volatile", "Low Vol", "Breakout", "Reversal", "Other"],
      required: true,
    },
    { key: "emotionBefore", type: "text", required: true },
    { key: "emotionAfter", type: "text", required: true },
    { key: "notes", type: "textarea", required: true },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowValidation(true);

    if (!validateForm()) {
      const firstErrorField = Object.keys(validationErrors)[0];
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

    saveForm(e);
  };

  const hasEmptyRequiredFields = () => {
    return requiredFields.some(
      (field) => !form[field] || form[field].toString().trim() === ""
    );
  };

  const getEmptyFieldLabels = () => {
    return requiredFields
      .filter((field) => !form[field] || form[field].toString().trim() === "")
      .map((field) => {
        // Hapus currency dari label untuk field profit agar lebih rapi
        if (field === "profit") {
          return "Profit/Loss";
        }
        return getFieldLabel(field).replace(` (${currency})`, "");
      });
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={() => closeForm("cancel")}
    >
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-violet-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-violet-600" />
              {editing ? "Edit Trading Entry" : "New Trading Entry"}
            </h2>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => closeForm("cancel")}
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
                  <span className="text-red-500 font-bold">*</span> Semua field
                  wajib diisi
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Mohon lengkapi semua field sebelum menyimpan. Data trading
                  yang lengkap akan membantu analisis performa.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {fields.map((field) => {
                const FieldIcon = getFieldIcon(field.key);
                const isSelectWithIcons =
                  field.type === "select" && field.icons;
                const isNumberField = [
                  "lot",
                  "entry",
                  "exit",
                  "stop",
                  "take",
                  "pips",
                  "profit",
                  "riskReward",
                ].includes(field.key);
                const hasError = showValidation && validationErrors[field.key];

                return (
                  <Motion.div
                    key={field.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    data-field={field.key}
                    className={field.type === "textarea" ? "lg:col-span-3" : ""}
                  >
                    <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                      <FieldIcon className="w-4 h-4 text-violet-600" />
                      {getFieldLabel(field.key)}
                      <span className="text-red-500">*</span>
                    </label>

                    {field.type === "select" ? (
                      <div className="relative">
                        <select
                          value={
                            field.key === "strategy"
                              ? strategyValue
                              : field.key === "market"
                              ? marketValue
                              : form[field.key] || ""
                          }
                          onChange={(e) =>
                            field.customHandler
                              ? field.customHandler(e.target.value)
                              : handleInputChange(field.key, e.target.value)
                          }
                          onBlur={() => field.required && handleBlur(field.key)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 appearance-none ${
                            hasError
                              ? "border-red-500 bg-red-50"
                              : "border-slate-200 focus:border-violet-500"
                          }`}
                        >
                          <option value="">
                            Pilih {getFieldLabel(field.key).replace(` (${currency})`, '')}
                          </option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {isSelectWithIcons &&
                          form[field.key] &&
                          field.icons[form[field.key]] && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {React.createElement(
                                field.icons[form[field.key]],
                                {
                                  className: "w-4 h-4 text-violet-600",
                                  size: 16,
                                }
                              )}
                            </div>
                          )}
                      </div>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={form[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                        onBlur={() => handleBlur(field.key)}
                        rows={4}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 ${
                          hasError
                            ? "border-red-500 bg-red-50"
                            : "border-slate-200 focus:border-violet-500"
                        }`}
                        placeholder={getInputPlaceholder(field.key)}
                      />
                    ) : (
                      <input
                        type={getInputType(field.key)}
                        inputMode={getInputMode(field.key)}
                        value={
                          field.key === "profit"
                            ? profitDisplay
                            : form[field.key] || ""
                        }
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                        onBlur={() => isNumberField && handleBlur(field.key)}
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
                          {validationErrors[field.key]}
                        </span>
                      </div>
                    )}
                  </Motion.div>
                );
              })}

              {/* Custom Strategy Input */}
              {isOtherStrategy && (
                <div className="lg:col-span-3" data-field="strategy-custom">
                  <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-violet-600" />
                    Custom Strategy Detail
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customStrategy}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomStrategy(value);
                      setForm((prev) => ({ ...prev, strategy: value }));

                      // Clear validation error
                      if (validationErrors.strategy) {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.strategy;
                          return newErrors;
                        });
                      }
                    }}
                    onBlur={() => {
                      if (!customStrategy.trim()) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          strategy: "Custom strategy harus diisi",
                        }));
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 ${
                      validationErrors.strategy
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 focus:border-violet-500"
                    }`}
                    placeholder="Jelaskan strategy custom Anda secara detail..."
                  />
                  {validationErrors.strategy && (
                    <div className="mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-600">
                        {validationErrors.strategy}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Market Input */}
              {isOtherMarket && (
                <div className="lg:col-span-3" data-field="market-custom">
                  <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                    <Globe className="w-4 h-4 text-violet-600" />
                    Custom Market Condition Detail
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customMarket}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomMarket(value);
                      setForm((prev) => ({ ...prev, market: value }));

                      // Clear validation error
                      if (validationErrors.market) {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.market;
                          return newErrors;
                        });
                      }
                    }}
                    onBlur={() => {
                      if (!customMarket.trim()) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          market: "Custom market condition harus diisi",
                        }));
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 ${
                      validationErrors.market
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 focus:border-violet-500"
                    }`}
                    placeholder="Jelaskan kondisi market custom Anda secara detail..."
                  />
                  {validationErrors.market && (
                    <div className="mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-600">
                        {validationErrors.market}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Risk/Reward Field */}
              <div data-field="riskReward">
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <Target className="w-4 h-4 text-violet-600" />
                  Risk/Reward Ratio
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.riskReward || ""}
                  onChange={(e) =>
                    handleInputChange("riskReward", e.target.value)
                  }
                  onBlur={() => handleBlur("riskReward")}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 ${
                    validationErrors.riskReward
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 focus:border-violet-500"
                  }`}
                  placeholder="1.3"
                />
                {validationErrors.riskReward && (
                  <div className="mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {validationErrors.riskReward}
                    </span>
                  </div>
                )}
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

            {/* Balance Information */}
            <div className="mb-6 p-4 bg-linear-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-violet-600" />
                Informasi Balance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">
                      Balance Saat Ini:
                    </span>
                    <span className="font-bold text-violet-700">
                      {formatCurrency(currentBalance, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">
                      Profit/Loss:
                    </span>
                    <span
                      className={`font-bold ${
                        (parseFloat(form.profit) || 0) >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(parseFloat(form.profit) || 0, currency)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">
                      Balance Setelah Trade:
                    </span>
                    <span
                      className={`font-bold ${
                        calculateBalanceAfter() >= currentBalance
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(calculateBalanceAfter(), currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">Result:</span>
                    <span
                      className={`font-bold ${
                        form.result === "Win"
                          ? "text-emerald-600"
                          : form.result === "Lose"
                          ? "text-rose-600"
                          : "text-slate-600"
                      }`}
                    >
                      {form.result || "Pending"}
                    </span>
                  </div>
                </div>
              </div>
              {form.result && (
                <div className="mt-3 text-xs text-violet-600 font-medium bg-white/50 p-2 rounded-lg flex items-center gap-2">
                  {form.result === "Lose" ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <span>
                        Profit akan otomatis negatif untuk result Lose
                      </span>
                    </>
                  ) : form.result === "Win" ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Profit akan otomatis positif untuk result Win</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>Profit akan disesuaikan berdasarkan result</span>
                    </>
                  )}
                </div>
              )}

              {/* Informasi format number dan required fields */}
              <div className="mt-3 text-xs text-slate-600 bg-white/30 p-2 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FileTextIcon className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                  <p className="font-medium text-slate-700">
                    Informasi Pengisian Form:
                  </p>
                </div>
                <ul className="list-disc list-inside mt-1 space-y-1 pl-4">
                  <li className="flex items-start gap-1">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>
                      Semua field dengan tanda{" "}
                      <span className="text-red-500 font-bold">*</span> wajib
                      diisi
                    </span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>
                      Pastikan data yang diisi akurat dan sesuai dengan trading
                      sesungguhnya
                    </span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>Lot size: 2 angka desimal (contoh: 0.01, 1,50)</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>
                      Entry/Exit/Stop/Take: 5 angka desimal (contoh: 1.23456,
                      1,12345)
                    </span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>
                      Profit ({currency}): gunakan format angka (contoh: 15000 atau -5000)
                    </span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>
                      Kondisi Market: Pilih dari opsi yang tersedia atau pilih
                      "Other" untuk kondisi khusus
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => closeForm("cancel")}
                disabled={isLoading}
                className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || hasEmptyRequiredFields()}
                className={`px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2 ${
                  hasEmptyRequiredFields()
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-linear-to-r from-violet-600 to-purple-600 text-white"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editing ? "Update Entry" : "Save Entry"}
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

export default FormModal;