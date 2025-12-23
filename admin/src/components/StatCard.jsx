import React from "react";
import { motion as Motion } from "framer-motion";

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

export default StatCard;
