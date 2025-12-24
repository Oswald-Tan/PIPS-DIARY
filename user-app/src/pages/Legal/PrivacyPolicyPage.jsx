import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Database, Eye, EyeOff, Users, Globe, Cpu, Server, Mail } from "lucide-react";

const PrivacyPolicyPage = () => {
  const [expandedSections, setExpandedSections] = useState({
    introduction: true,
    collection: false,
    usage: false,
    security: false,
    sharing: false,
    rights: false,
    retention: false,
    cookies: false,
    children: false,
    changes: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-purple-50 to-indigo-50 overflow-hidden relative">
      {/* Background Effects matching landing page */}
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
              <Lock className="w-6 h-6 text-white" />
            </Motion.div>

            <h1 className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Privacy Policy
            </h1>
            <p className="text-slate-600 font-light">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Privacy Commitment */}
          <div className="mb-8 p-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="flex items-start space-x-4">
              <Shield className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Our Privacy Commitment</h3>
                <p className="text-slate-700 font-light">
                  At PipsDiary, we take your privacy seriously. This policy explains how we collect, use, 
                  and protect your trading data and personal information.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Sections */}
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
            {/* Section 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('introduction')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    Introduction
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.introduction} />
              </button>
              
              {expandedSections.introduction && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <p className="text-slate-600 font-light mb-4">
                      This Privacy Policy describes how PipsDiary ("we", "us", or "our") collects, uses, 
                      and shares your personal information when you use our trading journal platform.
                    </p>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-blue-800 font-light">
                        <strong className="font-semibold">Scope:</strong> This policy applies to all PipsDiary services including web platform, mobile apps, and API services.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('collection')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    Information We Collect
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.collection} />
              </button>
              
              {expandedSections.collection && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <h4 className="font-semibold text-slate-700 mb-3">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <DataItem icon={<Users className="w-5 h-5" />} title="Account Data" items={["Name", "Email", "Country", "Currency preference"]} />
                      <DataItem icon={<Database className="w-5 h-5" />} title="Trading Data" items={["Trade entries", "Profit/loss", "Strategies", "Risk parameters"]} />
                      <DataItem icon={<Globe className="w-5 h-5" />} title="Usage Data" items={["Login times", "Feature usage", "Device info", "IP address"]} />
                      <DataItem icon={<Server className="w-5 h-5" />} title="Payment Data" items={["Subscription plan", "Payment method", "Transaction ID", "Billing info"]} />
                    </div>
                    
                    <h4 className="font-semibold text-slate-700 mb-3">Automatic Collection</h4>
                    <p className="text-slate-600 font-light mb-4">
                      We automatically collect certain information when you use our Service:
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-semibold text-slate-700 mb-2">Technical Data</h5>
                          <ul className="text-xs text-slate-600 space-y-1">
                            <li>• Browser type & version</li>
                            <li>• Operating system</li>
                            <li>• Device information</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-slate-700 mb-2">Usage Patterns</h5>
                          <ul className="text-xs text-slate-600 space-y-1">
                            <li>• Pages visited</li>
                            <li>• Time spent</li>
                            <li>• Feature interactions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('usage')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    How We Use Your Information
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.usage} />
              </button>
              
              {expandedSections.usage && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <UsagePurpose 
                        title="Service Delivery" 
                        purposes={["Process trades", "Calculate statistics", "Generate reports", "Provide leaderboards"]}
                      />
                      <UsagePurpose 
                        title="Improvement" 
                        purposes={["Enhance features", "Fix bugs", "Optimize performance", "Develop new tools"]}
                      />
                      <UsagePurpose 
                        title="Communication" 
                        purposes={["Send updates", "Provide support", "Send reminders", "Share tips"]}
                      />
                      <UsagePurpose 
                        title="Security" 
                        purposes={["Prevent fraud", "Detect abuse", "Secure accounts", "Backup data"]}
                      />
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Eye className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-amber-800 mb-1">Leaderboard & Gamification</h5>
                          <p className="text-sm text-amber-700 font-light">
                            Your anonymized trading performance may be displayed in public leaderboards. 
                            Personal identifiers are never shared in leaderboards.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('security')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">4</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    Data Security
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.security} />
              </button>
              
              {expandedSections.security && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <SecurityMeasure 
                        icon="🔐"
                        title="Encryption"
                        description="All data encrypted in transit and at rest"
                      />
                      <SecurityMeasure 
                        icon="🛡️"
                        title="Access Control"
                        description="Strict role-based access to sensitive data"
                      />
                      <SecurityMeasure 
                        icon="📊"
                        title="Regular Audits"
                        description="Security assessments and penetration testing"
                      />
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-green-800 mb-1">Trading Data Protection</h5>
                          <p className="text-sm text-green-700 font-light">
                            Your trading strategies, positions, and financial data are protected with 
                            enterprise-grade security measures. We never sell your trading data to third parties.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('sharing')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">5</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    Data Sharing & Disclosure
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.sharing} />
              </button>
              
              {expandedSections.sharing && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <p className="text-slate-600 font-light mb-4">
                      We do not sell your personal data. We may share information in these limited circumstances:
                    </p>
                    
                    <div className="space-y-4 mb-6">
                      <SharingCase 
                        title="Service Providers"
                        description="Trusted partners who help us operate the Service (payment processors, hosting)"
                        requirement="Required for operation"
                      />
                      <SharingCase 
                        title="Legal Requirements"
                        description="When required by law, regulation, or legal process"
                        requirement="Compliance"
                      />
                      <SharingCase 
                        title="Business Transfers"
                        description="In connection with merger, acquisition, or sale of assets"
                        requirement="With notice"
                      />
                      <SharingCase 
                        title="Aggregated Data"
                        description="Anonymized, aggregated statistics for research or marketing"
                        requirement="No personal identifiers"
                      />
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <EyeOff className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-red-800 mb-1">We Never Share</h5>
                          <p className="text-sm text-red-700 font-light">
                            Your individual trade details, exact profit/loss figures, or personal strategies 
                            with any third party for marketing or advertising purposes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 6 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('rights')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">6</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 text-left">
                    Your Rights
                  </h3>
                </div>
                <ChevronIcon isExpanded={expandedSections.rights} />
              </button>
              
              {expandedSections.rights && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <UserRight 
                        title="Access & Export"
                        description="Request a copy of your data in standard format"
                        icon="📥"
                      />
                      <UserRight 
                        title="Correction"
                        description="Update or correct inaccurate information"
                        icon="✏️"
                      />
                      <UserRight 
                        title="Deletion"
                        description="Request deletion of your personal data"
                        icon="🗑️"
                      />
                      <UserRight 
                        title="Objection"
                        description="Object to certain data processing"
                        icon="🚫"
                      />
                    </div>
                    
                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                      <p className="text-sm text-violet-700 font-light">
                        <strong className="font-semibold">To exercise your rights:</strong> Contact us at privacy@pipsdiary.com. 
                        We respond to all legitimate requests within 30 days.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* More sections... */}

            {/* Data Retention */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Data Retention</h4>
                  <p className="text-slate-600 font-light">
                    We retain your data as long as your account is active. You can request account 
                    deletion at any time, after which data is permanently deleted within 90 days.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">Contact Our Privacy Team</h4>
              <p className="text-slate-700 font-light mb-3">
                For privacy-related questions or concerns:
              </p>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <a href="mailto:privacy@pipsdiary.com" className="text-blue-600 hover:text-blue-700 transition-colors">
                  privacy@pipsdiary.com
                </a>
              </div>
            </div>

            {/* Updates Notice */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-amber-600 font-semibold">!</span>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Policy Updates</h4>
                  <p className="text-amber-700 font-light">
                    We may update this Privacy Policy periodically. We'll notify you of significant 
                    changes via email or through the Service. Continued use after changes constitutes 
                    acceptance of the updated policy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <Link
              to="/register"
              className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-500 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Registration
            </Link>
            
            <div className="text-right">
              <p className="text-xs text-slate-500 font-light">
                Version 2.1 • Effective {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
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

const DataItem = ({ icon, title, items }) => (
  <div className="bg-slate-50 rounded-xl p-4">
    <div className="flex items-center mb-3">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
        <div className="text-blue-600">
          {icon}
        </div>
      </div>
      <h5 className="font-semibold text-slate-700">{title}</h5>
    </div>
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-slate-600 font-light flex items-center">
          <div className="w-1.5 h-1.5 bg-blue-300 rounded-full mr-2"></div>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const UsagePurpose = ({ title, purposes }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4">
    <h5 className="font-semibold text-slate-700 mb-3">{title}</h5>
    <ul className="space-y-2">
      {purposes.map((purpose, index) => (
        <li key={index} className="text-sm text-slate-600 font-light flex items-start">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5 shrink-0">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          </div>
          {purpose}
        </li>
      ))}
    </ul>
  </div>
);

const SecurityMeasure = ({ icon, title, description }) => (
  <div className="text-center">
    <div className="text-2xl mb-2">{icon}</div>
    <h5 className="font-semibold text-slate-700 mb-1">{title}</h5>
    <p className="text-sm text-slate-600 font-light">{description}</p>
  </div>
);

const SharingCase = ({ title, description, requirement }) => (
  <div className="flex items-start">
    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    </div>
    <div>
      <h5 className="font-semibold text-slate-700">{title}</h5>
      <p className="text-slate-600 font-light text-sm mb-1">{description}</p>
      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
        {requirement}
      </span>
    </div>
  </div>
);

const UserRight = ({ title, description, icon }) => (
  <div className="bg-linear-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4">
    <div className="flex items-center mb-3">
      <span className="text-xl mr-3">{icon}</span>
      <h5 className="font-semibold text-slate-700">{title}</h5>
    </div>
    <p className="text-sm text-slate-600 font-light">{description}</p>
  </div>
);

export default PrivacyPolicyPage;