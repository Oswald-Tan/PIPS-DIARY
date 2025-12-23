import React from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { deleteManualRate, resetManualRateState } from "../../features/manualRateSlice";
import { Trash2, AlertTriangle, Globe } from "lucide-react";

const DeleteRateModal = ({ rate, setShowModal }) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteManualRate(rate.id))
      .unwrap()
      .then(() => {
        setShowModal(false);
        dispatch(resetManualRateState());
      })
      .catch(error => {
        console.error("Delete failed:", error);
      });
  };

  const handleClose = () => {
    setShowModal(false);
    dispatch(resetManualRateState());
  };

  if (!rate) return null;

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
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-rose-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Trash2 className="w-7 h-7 text-rose-600" />
              Delete Exchange Rate
            </h2>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-violet-500 hover:text-violet-700 p-2 rounded-xl hover:bg-violet-100 transition-colors"
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
            {/* Warning Banner */}
            <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-rose-800 mb-1">
                    Are you sure you want to delete this exchange rate?
                  </p>
                  <p className="text-sm text-rose-700">
                    This action cannot be undone. All conversions using this rate will fall back to API or default rates.
                  </p>
                </div>
              </div>
            </div>

            {/* Rate Details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-violet-600" />
                  <span className="font-bold text-slate-800">Rate Details</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  rate.isActive
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}>
                  {rate.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Currency Pair:</span>
                  <span className="font-bold text-slate-800 text-lg">
                    1 {rate.fromCurrency} = {parseFloat(rate.rate).toFixed(6)} {rate.toCurrency}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Source:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {rate.source}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Last Updated:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(rate.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                
                {rate.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="text-slate-600 mb-1">Notes:</div>
                    <div className="text-sm text-slate-700 bg-white p-2 rounded-lg border">
                      {rate.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Impact Warning */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-sm text-amber-700">
                <p className="font-semibold mb-1">What happens after deletion:</p>
                <ul className="space-y-1 ml-1">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5"></div>
                    <span>Leaderboard will use API rates for {rate.fromCurrency}→{rate.toCurrency}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5"></div>
                    <span>Real-time conversions may change</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5"></div>
                    <span>Cannot be recovered once deleted</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-bold"
              >
                Cancel
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                className="px-6 py-3 bg-linear-to-r from-rose-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Rate
              </Motion.button>
            </div>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default DeleteRateModal;