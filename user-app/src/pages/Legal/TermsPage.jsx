import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Shield, TrendingUp, Target, BarChart, Users, Globe, CreditCard, Calendar, Infinity, Zap } from "lucide-react";

const TermsPage = () => {
  const [expandedSections, setExpandedSections] = useState({
    acceptance: true,
    service: false,
    accounts: false,
    subscription: false,
    billing: false,
    content: false,
    prohibited: false,
    termination: false,
    liability: false,
    changes: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Data subscription plans sesuai dengan aplikasi Anda
  const subscriptionPlans = {
    free: {
      name: "Free",
      maxEntries: 30,
      price: 0,
      period: "Gratis",
      currency: "IDR",
      features: [
        "Maksimal 30 Entri Trading",
        "Dashboard Dasar dengan Statistik Sederhana",
        "Grafik Equity Curve Dasar",
        "Export Data CSV",
        "Analytics Dasar",
        "Leaderboard Dasar"
      ],
      limitations: [
        "Tidak bisa menggunakan Trading Targets",
        "Tidak ada Advanced Analytics",
        "History trading terbatas",
        "Standard support only"
      ]
    },
    pro: {
      name: "Pro",
      maxEntries: Infinity,
      price: 69000,
      period: "Bulanan",
      currency: "IDR",
      features: [
        "Unlimited Trading Entries",
        "Advanced Analytics dengan Berbagai Chart",
        "Performance Metrics Detail",
        "Analisis Instrument & Strategy",
        "Win/Loss Distribution Charts",
        "Time of Day Analysis",
        "Trade Type Performance",
        "Trading Targets & Goal Setting",
        "Unlimited Calendar Events",
        "Priority Support",
        "Update Fitur Gratis Selamanya",
        "Data Export Lengkap",
        "Backup Otomatis",
        "Leaderboard Premium"
      ],
      note: "Auto-renew setiap bulan"
    },
    lifetime: {
      name: "Lifetime",
      maxEntries: Infinity,
      price: 799000,
      period: "Sekali Bayar",
      currency: "IDR",
      features: [
        "Semua Fitur Pro",
        "Akses Seumur Hidup",
        "Update Gratis Selamanya",
        "Priority Support Seumur Hidup",
        "VIP Feature Requests",
        "Early Access to New Features",
        "Dedicated Account Manager"
      ],
      note: "Pembayaran satu kali, akses selamanya"
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-purple-50 to-indigo-50 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-1/2 h-3/4 bg-linear-to-t from-violet-500/30 via-violet-300/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-linear-to-t from-purple-500/30 via-purple-300/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2/3 bg-linear-to-t from-violet-400/15 to-transparent blur-2xl"></div>
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter'%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-violet-500 to-purple-500 rounded-2xl shadow-lg mb-4"
            >
              <FileText className="w-6 h-6 text-white" />
            </Motion.div>

            <h1 className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Terms of Service
            </h1>
            <p className="text-slate-600 font-light">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-8 p-6 bg-linear-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
            <div className="flex items-start space-x-4">
              <Shield className="w-6 h-6 text-violet-600 mt-1 shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-violet-800 mb-2">Welcome to PipsDiary</h3>
                <p className="text-slate-700 font-light">
                  Please read these Terms of Service carefully before using PipsDiary Trading Journal. 
                  By accessing or using our service, you agree to be bound by these terms.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
            {/* Section 1 - Acceptance */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('acceptance')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-violet-600 font-semibold">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    Acceptance of Terms
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.acceptance} />
              </button>
              
              {expandedSections.acceptance && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <p className="text-slate-600 font-light mb-4">
                      By accessing and using PipsDiary Trading Journal ("the Service"), you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, please do not use the Service.
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-700 font-light">
                        <strong className="font-semibold">Important:</strong> These terms govern your use of all PipsDiary features including trade logging, leaderboards, gamification, and subscription services.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2 - Service Description */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('service')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-violet-600 font-semibold">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    Service Description
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.service} />
              </button>
              
              {expandedSections.service && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <p className="text-slate-600 font-light mb-4">
                      PipsDiary is a comprehensive trading journal platform that provides:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FeatureItem icon={<TrendingUp className="w-5 h-5" />} text="Trade Logging & Analysis" />
                      <FeatureItem icon={<Target className="w-5 h-5" />} text="Target Setting & Progress Tracking" />
                      <FeatureItem icon={<BarChart className="w-5 h-5" />} text="Performance Analytics & Reports" />
                      <FeatureItem icon={<Users className="w-5 h-5" />} text="Leaderboards & Gamification" />
                      <FeatureItem icon={<Globe className="w-5 h-5" />} text="Multi-Currency Support" />
                      <FeatureItem icon={<Shield className="w-5 h-5" />} text="Data Security & Privacy" />
                    </div>
                    <p className="text-slate-600 font-light">
                      The Service includes both free and premium subscription plans with different feature sets as detailed below.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3 - User Accounts */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('accounts')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-violet-600 font-semibold">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    User Accounts
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.accounts} />
              </button>
              
              {expandedSections.accounts && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <p className="text-slate-600 font-light mb-4">
                      To use the Service, you must create an account. You agree to:
                    </p>
                    <ul className="space-y-2 mb-4">
                      <ListItem text="Provide accurate, current, and complete information during registration" />
                      <ListItem text="Maintain the security of your password and account" />
                      <ListItem text="Accept responsibility for all activities that occur under your account" />
                      <ListItem text="Notify us immediately of any unauthorized use of your account" />
                      <ListItem text="Maintain only one active account per user" />
                    </ul>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm text-amber-800 font-light">
                        <strong className="font-semibold">Note:</strong> Free accounts are limited to 30 trade entries. Premium subscriptions offer unlimited entries.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4 - Subscription Plans */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('subscription')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-violet-600 font-semibold">4</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    Subscription Plans & Features
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.subscription} />
              </button>
              
              {expandedSections.subscription && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <p className="text-slate-600 font-light mb-6">
                      PipsDiary offers three subscription tiers with clearly defined features and limitations:
                    </p>
                    
                    {/* Free Plan */}
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-slate-700 font-semibold">Free</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800">Free Plan</h4>
                          <p className="text-slate-600 font-light">
                            {subscriptionPlans.free.price === 0 ? "Gratis" : `${subscriptionPlans.free.currency} ${subscriptionPlans.free.price.toLocaleString()}/${subscriptionPlans.free.period}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h5 className="font-semibold text-slate-700 mb-3 flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Included Features
                          </h5>
                          <ul className="space-y-2">
                            {subscriptionPlans.free.features.map((feature, index) => (
                              <li key={index} className="text-sm text-slate-600 font-light flex items-start">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 mt-1.5 shrink-0"></div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-slate-700 mb-3 flex items-center">
                            <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
                            Limitations
                          </h5>
                          <ul className="space-y-2">
                            {subscriptionPlans.free.limitations.map((limitation, index) => (
                              <li key={index} className="text-sm text-slate-600 font-light flex items-start">
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2 mt-1.5 shrink-0"></div>
                                {limitation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm text-slate-700 font-light">
                          <strong className="font-semibold">Trade Limit:</strong> Maximum {subscriptionPlans.free.maxEntries} trading entries.
                          {subscriptionPlans.free.maxEntries === 30 && " Once limit is reached, old entries must be deleted to add new ones."}
                        </p>
                      </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-linear-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800">Pro Plan</h4>
                          <p className="text-slate-600 font-light">
                            {subscriptionPlans.pro.currency} {subscriptionPlans.pro.price.toLocaleString()}/{subscriptionPlans.pro.period.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h5 className="font-semibold text-slate-700 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          All Features Included
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {subscriptionPlans.pro.features.map((feature, index) => (
                            <div key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                              <span className="text-sm text-slate-600 font-light">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                        <div className="flex items-start">
                          <Infinity className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                          <div>
                            <h6 className="font-semibold text-violet-800 mb-1">Unlimited Trading Entries</h6>
                            <p className="text-sm text-violet-700 font-light">
                              Pro plan users enjoy unlimited trade entries with no restrictions.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lifetime Plan */}
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-linear-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800">Lifetime Plan</h4>
                          <p className="text-slate-600 font-light">
                            {subscriptionPlans.lifetime.currency} {subscriptionPlans.lifetime.price.toLocaleString()} - {subscriptionPlans.lifetime.period}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h5 className="font-semibold text-slate-700 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Premium Features
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {subscriptionPlans.lifetime.features.map((feature, index) => (
                            <div key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                              <span className="text-sm text-slate-600 font-light">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start">
                          <Calendar className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                          <div>
                            <h6 className="font-semibold text-amber-800 mb-1">Lifetime Access Guarantee</h6>
                            <p className="text-sm text-amber-700 font-light">
                              One-time payment grants lifetime access to all current and future premium features.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800 font-light">
                        <strong className="font-semibold">Note:</strong> All prices are in Indonesian Rupiah (IDR). 
                        Subscription features and pricing may be updated with prior notice to users.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5 - Billing & Payments */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('billing')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-violet-600 font-semibold">5</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    Billing & Payments
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.billing} />
              </button>
              
              {expandedSections.billing && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <div className="space-y-4">
                      <BillingItem 
                        title="Pro Plan Billing"
                        description="Pro plan subscriptions auto-renew monthly. You can cancel anytime before the renewal date."
                        icon={<CreditCard className="w-5 h-5" />}
                      />
                      <BillingItem 
                        title="Lifetime Plan"
                        description="One-time payment for permanent access. No recurring charges."
                        icon={<Shield className="w-5 h-5" />}
                      />
                      <BillingItem 
                        title="Downgrade Policy"
                        description="You can downgrade from Pro to Free plan anytime. Upon downgrade, Trading Targets are disabled."
                        icon={<TrendingUp className="w-5 h-5" />}
                      />
                      <BillingItem 
                        title="Refund Policy"
                        description="14-day refund policy for first-time Pro subscriptions. Lifetime plan refunds reviewed case-by-case."
                        icon={<AlertCircle className="w-5 h-5" />}
                      />
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
                      <p className="text-sm text-red-800 font-light">
                        <strong className="font-semibold">Important:</strong> Free accounts exceeding 30 trade entries must delete old entries or upgrade to Pro to continue using the service.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 6 - User Content & Data */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('content')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-violet-600 font-semibold">6</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    User Content & Data
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.content} />
              </button>
              
              {expandedSections.content && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <p className="text-slate-600 font-light mb-4">
                      You retain all rights to your trading data. By using the Service, you grant us:
                    </p>
                    <ul className="space-y-2 mb-4">
                      <ListItem text="A license to store and process your data to provide the Service" />
                      <ListItem text="Permission to use anonymized, aggregated data for analytics and improvement" />
                      <ListItem text="The right to display your anonymized performance data in leaderboards" />
                    </ul>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-sm text-green-800 font-light">
                        <strong className="font-semibold">Your Data is Secure:</strong> We implement industry-standard security measures to protect your trading data.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional sections... */}

            {/* Last Updated */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <p className="text-slate-700 font-light">
                  <strong className="font-semibold">These terms may be updated.</strong> We'll notify you of significant changes via email or in-app notifications.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-linear-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
              <h4 className="font-semibold text-violet-800 mb-2">Contact Us</h4>
              <p className="text-slate-700 font-light">
                For questions about these Terms of Service, please contact us at:
                <br />
                <a href="mailto:legal@pipsdiary.com" className="text-violet-600 hover:text-violet-700 transition-colors">
                  legal@pipsdiary.com
                </a>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/register"
              className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-500 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Registration
            </Link>
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-slate-600 font-light">
                By registering, you agree to these Terms of Service
              </span>
            </div>
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

const ChevronIcon = ({ isExpanded }) => (
  <svg 
    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const FeatureItem = ({ icon, text }) => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
      <div className="text-violet-600">
        {icon}
      </div>
    </div>
    <span className="text-slate-700 font-light">{text}</span>
  </div>
);

const ListItem = ({ text }) => (
  <li className="flex items-start">
    <div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center mr-2 mt-0.5 shrink-0">
      <div className="w-1.5 h-1.5 bg-violet-600 rounded-full"></div>
    </div>
    <span className="text-slate-600 font-light">{text}</span>
  </li>
);

const BillingItem = ({ title, description, icon }) => (
  <div className="flex items-start">
    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mr-3 shrink-0">
      <div className="text-violet-600">
        {icon}
      </div>
    </div>
    <div>
      <h5 className="font-semibold text-slate-700 mb-1">{title}</h5>
      <p className="text-sm text-slate-600 font-light">{description}</p>
    </div>
  </div>
);

export default TermsPage;