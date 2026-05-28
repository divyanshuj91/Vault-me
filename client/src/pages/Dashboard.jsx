import React, { useState } from 'react';
import { useVault } from '../context/VaultContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import PasswordModal from '../components/PasswordModal.jsx';
import { Shield, Key, AlertTriangle, RefreshCw, Plus, ArrowRight, History, ShieldAlert, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { 
    credentials, 
    securityScore, 
    weakCredentials, 
    reusedCredentials, 
    breachedCredentials, 
    activities 
  } = useVault();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // SVG circular progress details
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (securityScore / 100) * circumference;

  // Score visual mapping - monochromatic
  const getScoreStatus = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-white', desc: 'Your digital life is highly secure.' };
    if (score >= 70) return { label: 'Good', color: 'text-[#c4c7c8]', desc: 'Secure, but some issues need attention.' };
    return { label: 'Weak', color: 'text-[#8e9192]', desc: 'High risk! Immediate action recommended.' };
  };

  const status = getScoreStatus(securityScore);

  // Format date helper
  const formatTimeAgo = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-[#c4c7c8]">{user?.email.split('@')[0]}</span>
          </h1>
          <p className="text-sm text-[#8e9192] mt-1">
            Keep your credentials encrypted and monitor your overall security.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> ADD PASSWORD
        </button>
      </div>

      {/* Main Grid: Security Audit & Score + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Security Score Panel (Large) */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col md:flex-row items-center gap-8">
          {/* Circular SVG Ring */}
          <div className="relative h-40 w-40 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Back Circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#2a2a2a"
                fill="none"
                strokeWidth="12"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#ffffff"
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ strokeDasharray: circumference }}
              />
            </svg>
            
            {/* Center Label */}
            <div className="absolute text-center">
              <span className="text-3xl font-black tracking-tight text-white">{securityScore}%</span>
              <p className="text-[10px] uppercase font-bold text-[#8e9192] tracking-wider mt-0.5">Vault Health</p>
            </div>
          </div>

          {/* Health Summary details */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="space-y-1.5">
              <span className="label-caps px-2 py-0.5 border border-[#444748] inline-block">
                Security Report
              </span>
              <h2 className="text-xl font-extrabold text-white pt-1">
                Your Security Rating is <span className={status.color}>{status.label}</span>
              </h2>
              <p className="text-sm text-[#8e9192] leading-relaxed">
                {status.desc} Audited against the latest data breach databases using k-anonymity ranges.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link 
                to="/audit" 
                className="label-caps text-[#c4c7c8] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Award className="h-4 w-4" /> View Full Report <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity panel */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-4">
              <History className="h-4 w-4 text-[#8e9192]" /> Recent Activity
            </h3>
            
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-[#8e9192] text-xs">
                  No recent activities recorded.
                </div>
              ) : (
                activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex justify-between items-start gap-2 text-xs border-b border-[#444748]/30 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#201f1f] flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-[#8e9192] rounded-full" />
                      </div>
                      <div>
                        <span className="font-semibold text-white">{act.action}:</span>
                        <span className="text-[#8e9192] ml-1">{act.details}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#444748] flex-shrink-0">
                      {formatTimeAgo(act.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/vault"
            className="label-caps text-center block pt-4 text-[#8e9192] hover:text-white transition-colors border-t border-[#444748]/50 mt-4"
          >
            Manage Credentials →
          </Link>
        </div>

      </div>

      {/* Row: Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Passwords */}
        <Link 
          to="/vault"
          className="glass-card p-5 transition-all duration-300 block cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#201f1f] flex items-center justify-center">
              <Key className="h-3.5 w-3.5 text-[#8e9192]" />
            </div>
          </div>
          <span className="label-caps">Total Passwords</span>
          <h3 className="text-2xl font-extrabold text-white mt-2">{credentials.length}</h3>
          <p className="text-[10px] text-[#8e9192] mt-1 flex items-center gap-0.5">
            View entire vault <ArrowRight className="h-2.5 w-2.5" />
          </p>
        </Link>

        {/* Weak Passwords */}
        <Link 
          to="/audit"
          className="glass-card p-5 transition-all duration-300 block cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#201f1f] flex items-center justify-center">
              <ShieldAlert className="h-3.5 w-3.5 text-[#8e9192]" />
            </div>
          </div>
          <span className="label-caps">Weak Passwords</span>
          <h3 className="text-2xl font-extrabold text-white mt-2">{weakCredentials.length}</h3>
          <p className="text-[10px] text-[#8e9192] mt-1 flex items-center gap-0.5">
            {weakCredentials.length > 0 ? 'Fix vulnerabilities' : 'Vault secure'} <ArrowRight className="h-2.5 w-2.5" />
          </p>
        </Link>

        {/* Reused Passwords */}
        <Link 
          to="/audit"
          className="glass-card p-5 transition-all duration-300 block cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#201f1f] flex items-center justify-center">
              <RefreshCw className="h-3.5 w-3.5 text-[#8e9192]" />
            </div>
          </div>
          <span className="label-caps">Reused Passwords</span>
          <h3 className="text-2xl font-extrabold text-white mt-2">{reusedCredentials.length}</h3>
          <p className="text-[10px] text-[#8e9192] mt-1 flex items-center gap-0.5">
            {reusedCredentials.length > 0 ? 'Check duplications' : 'No duplications'} <ArrowRight className="h-2.5 w-2.5" />
          </p>
        </Link>

        {/* Breached Passwords */}
        <Link 
          to="/audit"
          className="glass-card p-5 transition-all duration-300 block cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#201f1f] flex items-center justify-center">
              <AlertTriangle className="h-3.5 w-3.5 text-[#8e9192]" />
            </div>
          </div>
          <span className="label-caps">Breached</span>
          <h3 className="text-2xl font-extrabold text-white mt-2">{breachedCredentials.length}</h3>
          <p className="text-[10px] text-[#8e9192] mt-1 flex items-center gap-0.5">
            {breachedCredentials.length > 0 ? 'Critical! Exposed' : 'Zero breaches'} <ArrowRight className="h-2.5 w-2.5" />
          </p>
        </Link>

      </div>

      {/* Quick Add FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        title="Quick Add Password"
        className="fixed bottom-6 right-6 w-12 h-12 bg-white text-black flex items-center justify-center shadow-xl hover:bg-[#e5e5e5] transition-all z-30 cursor-pointer"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Password Modal */}
      <PasswordModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
}
