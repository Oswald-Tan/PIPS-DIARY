import React from "react";
import { Check, Star } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "Rp 0",
      description: "Perfect for getting started with basic trade tracking",
      features: [
        "Maksimal 30 Entri Trading",
        "Dashboard Dasar",
        "Grafik Equity Curve Dasar",
        "Export Data CSV",
        "Analytics Dasar",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "Rp 69k",
      period: "/month",
      description: "Advanced features for serious traders",
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
        "Update Fitur Gratis",
        "Data Export Lengkap",
        "Backup Otomatis",
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Lifetime",
      price: "Rp 799k",
      description: "One-time payment for lifetime access",
      features: [
        "Semua Fitur Pro",
        "Akses Seumur Hidup",
        "Update Gratis Selamanya",
        "Priority Support Seumur Hidup",
        "Early Access to New Features",
      ],
      cta: "Get Lifetime",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-medium text-slate-900 mb-4">
            Simple, Transparent <br /> Pricing
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
            Choose the plan that works best for you. All plans include core features to 
            help you master your trading journey.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 md:gap-8 gap-10 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.popular
                  ? "border-violet-500 bg-slate-50 shadow-lg scale-105"
                  : "border-slate-200 bg-white shadow-sm hover:shadow-md"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-violet-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star size={14} fill="white" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-slate-500 text-lg">{plan.period}</span>
                  )}
                </div>
                <p className="text-slate-600 font-light">{plan.description}</p>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    <span className="text-slate-700 text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-3 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer ${
                  plan.popular
                    ? "bg-violet-600 text-white hover:bg-violet-700 shadow-lg"
                    : "bg-black text-white hover:bg-gray-800 shadow-md"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}