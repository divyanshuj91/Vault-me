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

  // Score visual mapping
  const getScoreStatus = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-400', desc: 'Your digital life is highly secure.' };
    if (score >= 70) return { label: 'Good', color: 'text-yellow-400', desc: 'Secure, but some issues need attention.' };
    return { label: 'Weak', color: 'text-red-400', desc: 'High risk! Immediate action recommended.' };
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
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back, <span className="text-accent-purple">{user?.email.split('@')[0]}</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Keep your credentials encrypted and monitor your overall security.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-white text-sm font-bold shadow-lg shadow-accent-purple/20 hover:shadow-accent-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center gap-2"
        >
          <Plus className="h-4.5 w-4.5" /> Add Password
        </button>
      </div>

      {/* Main Grid: Security Audit & Score + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Security Score Panel (Large) */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col md:flex-row items-center gap-8 bg-card-bg/40 border-border-custom/50 shadow-md">
          {/* Circular SVG Ring */}
          <div className="relative h-40 w-40 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Back Circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-800 fill-none"
                strokeWidth="12"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-accent-purple fill-none"
                strokeWidth="12"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  strokeDasharray: circumference,
                  stroke: `url(#purpleCyanGradient)`
                }}
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="purpleCyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center Label */}
            <div className="absolute text-center">
              <span className="text-3xl font-black tracking-tight text-white">{securityScore}%</span>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider mt-0.5">Vault Health</p>
            </div>
          </div>

          {/* Health Summary details */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="space-y-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                Security Report
              </span>
              <h2 className="text-xl font-extrabold text-text-primary pt-1">
                Your Security Rating is <span className={status.color}>{status.label}</span>
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {status.desc} Audited against the latest data breach databases using k-anonymity ranges.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link 
                to="/audit" 
                className="text-xs font-bold text-accent-cyan hover:text-cyan-300 flex items-center gap-1 hover:underline transition-colors cursor-pointer"
              >
                <Award className="h-4 w-4" /> View Full Report <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity panel */}
        <div className="glass-card p-6 bg-card-bg/40 border-border-custom/50 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2 mb-4">
              <History className="h-4.5 w-4.5 text-accent-purple" /> Recent Activity
            </h3>
            
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-xs">
                  No recent activities recorded.
                </div>
              ) : (
                activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex justify-between items-start gap-2 text-xs border-b border-border-custom/30 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <span className={`font-semibold ${
                        act.action === 'Add' ? 'text-green-400' :
                        act.action === 'Update' ? 'text-amber-400' :
                        act.action === 'Delete' ? 'text-red-400' : 'text-accent-cyan'
                      }`}>
                        {act.action}:
                      </span>
                      <span className="text-text-secondary ml-1 font-medium">{act.details}</span>
                    </div>
                    <span className="text-[10px] text-text-muted flex-shrink-0">
                      {formatTimeAgo(act.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/vault"
            className="text-xs text-center block pt-4 text-text-secondary hover:text-text-primary transition-colors border-t border-border-custom/50 mt-4 font-semibold hover:underline"
          >
            Manage Credentials
          </Link>
        </div>

      </div>

      {/* Row: Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Passwords */}
        <Link 
          to="/vault"
          className="glass-card p-5 bg-card-bg/40 border-border-custom/50 hover:border-accent-purple/30 hover:bg-card-bg/60 transition-all duration-300 shadow-sm block relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-accent-purple/5 rounded-bl-full flex items-center justify-center transition-all group-hover:bg-accent-purple/10">
            <Key className="h-5 w-5 text-accent-purple/60 group-hover:text-accent-purple transition-colors" />
          </div>
          <span className="text-xs text-text-secondary font-semibold">Total Passwords</span>
          <h3 className="text-2xl font-extrabold text-text-primary mt-2">{credentials.length}</h3>
          <p className="text-[10px] text-text-muted mt-1 flex items-center gap-0.5">
            View entire vault <ArrowRight className="h-2.5 w-2.5" />
          </p>
        </Link>

        {/* Weak Passwords */}
        <Link 
          to="/audit"
          className="glass-card p-5 bg-card-bg/40 border-border-custom/50 hover:border-red-500/30 hover:bg-card-bg/60 transition-all duration-300 shadow-sm block relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-red-500/5 rounded-bl-full flex items-center justify-center transition-all group-hover:bg-red-500/10">
            <ShieldAlert className="h-5 w-5 text-red-500/60 group-hover:text-red-500 transition-colors" />
          </div>
          <span className="text-xs text-text-secondary font-semibold">Weak Passwords</span>
          <h3 className="text-2xl font-extrabold text-text-primary mt-2">{weakCredentials.length}</h3>
          <p className={`text-[10px] mt-1 ${weakCredentials.length > 0 ? 'text-red-400' : 'text-text-muted'} flex items-center gap-0.5`}>
            {weakCredentials.length > 0 ? 'Fix vulnerabilities now' : 'Vault fully secure'} <ArrowRight className="h-2.5 w-2.5" />
          </p>
        </Link>

        {/* Reused Passwords */}
        <Link 
          to="/audit"
          className="glass-card p-5 bg-card-bg/40 border-border-custom/50 hover:border-amber-500/30 hover:bg-card-bg/60 transition-all duration-300 shadow-sm block relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-bl-full flex items-center justify-center transition-all group-hover:bg-amber-500/10">
            <RefreshCw className="h-4.5 w-4.5 text-amber-500/60 group-hover:text-amber-500 transition-colors" />
          </div>
          <span className="text-xs text-text-secondary font-semibold">Reused Passwords</span>
          <h3 className="text-2xl font-extrabold text-text-primary mt-2">{reusedCredentials.length}</h3>
          <p className={`text-[10px] mt-1 ${reusedCredentials.length > 0 ? 'text-amber-400' : 'text-text-muted'} flex items-center gap-0.5`}>
            {reusedCredentials.length > 0 ? 'Check duplications' : 'No duplications'} <ArrowRight className="h-2.5 w-2.5" />
          </p>
        </Link>

        {/* Breached Passwords */}
        <Link 
          to="/audit"
          className="glass-card p-5 bg-card-bg/40 border-border-custom/50 hover:border-red-500/30 hover:bg-card-bg/60 transition-all duration-300 shadow-sm block relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-red-500/5 rounded-bl-full flex items-center justify-center transition-all group-hover:bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-500/60 group-hover:text-red-500 transition-colors" />
          </div>
          <span className="text-xs text-text-secondary font-semibold">Breached Passwords</span>
          <h3 className="text-2xl font-extrabold text-text-primary mt-2">{breachedCredentials.length}</h3>
          <p className={`text-[10px] mt-1 ${breachedCredentials.length > 0 ? 'text-red-400 font-semibold' : 'text-text-muted'} flex items-center gap-0.5`}>
            {breachedCredentials.length > 0 ? 'Critical! Exposed online' : 'Zero breaches detected'} <ArrowRight className="h-2.5 w-2.5" />
          </p>
        </Link>

      </div>

      {/* Quick Add Floating Action Button (FAB) */}
      <button
        onClick={() => setIsModalOpen(true)}
        title="Quick Add Password"
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan text-white shadow-xl shadow-accent-purple/30 hover:shadow-accent-purple/50 transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer border border-accent-purple/20 z-30"
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
