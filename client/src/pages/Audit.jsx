import React, { useState } from 'react';
import { useVault } from '../context/VaultContext.jsx';
import { useToast } from '../components/Toast.jsx';
import PasswordModal from '../components/PasswordModal.jsx';
import { 
  ShieldAlert, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Edit2, 
  Sparkles, 
  ShieldCheck, 
  Award,
  Loader2,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Audit() {
  const { 
    credentials, 
    weakCredentials, 
    reusedCredentials, 
    breachedCredentials, 
    oldCredentials, 
    securityScore,
    addCredential,
    updateCredential
  } = useVault();
  
  const showToast = useToast();
  
  // Tab states
  const [activeTab, setActiveTab] = useState('breached'); // breached, weak, reused, old
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [isFixing, setIsFixing] = useState(false);

  // Trigger edit modal
  const handleEdit = (credential) => {
    setSelectedCredential(credential);
    setIsModalOpen(true);
  };

  // Automated batch fix for all weak passwords
  const handleFixAllWeak = async () => {
    if (weakCredentials.length === 0) return;
    
    const confirm = window.confirm(
      `This will automatically generate new, highly secure 18-character passwords for all ${weakCredentials.length} weak entries in your vault. Do you want to proceed?`
    );
    if (!confirm) return;

    setIsFixing(true);
    showToast('Regenerating weak passwords...', 'info');

    try {
      // Import crypto-js for bulk sync helper
      const CryptoJS = await import('crypto-js');
      const { useAuth } = await import('../context/AuthContext.jsx');
      
      // We will perform updates sequentially or compile a sync payload.
      // Since VaultContext doesn't expose the encryptionKey directly (which is secure!),
      // we can call `updateCredential` sequentially. It is safe and triggers state updates.
      for (const item of weakCredentials) {
        // Generate secure 18-char password
        const length = 18;
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const all = uppercase + lowercase + numbers + symbols;

        let newPassword = '';
        const randomArray = new Uint32Array(length);
        window.crypto.getRandomValues(randomArray);
        
        newPassword += uppercase[randomArray[0] % uppercase.length];
        newPassword += lowercase[randomArray[1] % lowercase.length];
        newPassword += numbers[randomArray[2] % numbers.length];
        newPassword += symbols[randomArray[3] % symbols.length];

        for (let i = 4; i < length; i++) {
          newPassword += all[randomArray[i] % all.length];
        }
        
        const shuffled = newPassword.split('').sort(() => 0.5 - Math.random()).join('');

        // Prepare updated item
        const updatedItem = {
          siteName: item.siteName,
          url: item.url,
          username: item.username,
          password: shuffled,
          category: item.category,
          notes: item.notes
        };

        // Call update API
        await updateCredential(item.id, updatedItem);
      }

      showToast(`Successfully fixed all ${weakCredentials.length} weak passwords!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to fix some weak passwords', 'error');
    } finally {
      setIsFixing(false);
    }
  };

  // Get active items list based on tab
  const getActiveList = () => {
    switch (activeTab) {
      case 'breached':
        return breachedCredentials;
      case 'weak':
        return weakCredentials;
      case 'reused':
        return reusedCredentials;
      case 'old':
        return oldCredentials;
      default:
        return [];
    }
  };

  const activeList = getActiveList();

  // Tab config
  const tabConfig = [
    { id: 'breached', label: 'Breached', count: breachedCredentials.length, color: 'text-red-400', icon: <ShieldAlert className="h-4 w-4" /> },
    { id: 'weak', label: 'Weak', count: weakCredentials.length, color: 'text-orange-400', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'reused', label: 'Reused', count: reusedCredentials.length, color: 'text-amber-400', icon: <RefreshCw className="h-3.5 w-3.5" /> },
    { id: 'old', label: 'Old (90d+)', count: oldCredentials.length, color: 'text-slate-400', icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Security Audit Report</h1>
          <p className="text-sm text-text-secondary mt-1">
            Identify compromised, weak, or repeated credentials across your vault.
          </p>
        </div>

        {/* Fix button in Weak tab */}
        {activeTab === 'weak' && weakCredentials.length > 0 && (
          <button
            onClick={handleFixAllWeak}
            disabled={isFixing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-white text-sm font-bold shadow-lg shadow-accent-purple/20 hover:shadow-accent-purple/40 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFixing ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Sparkles className="h-4.5 w-4.5" />}
            Fix All Weak Passwords
          </button>
        )}
      </div>

      {/* Overview stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Score box */}
        <div className="glass-card p-6 bg-card-bg/40 border-border-custom/50 shadow-md flex items-center gap-6 md:col-span-1">
          <div className="h-20 w-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-2xl text-accent-cyan">
            {securityScore}%
          </div>
          <div>
            <span className="text-xs text-text-secondary font-semibold">Vault Security Score</span>
            <h3 className="text-lg font-bold text-text-primary mt-1">
              {securityScore >= 90 ? 'Excellent Rating' : securityScore >= 70 ? 'Moderate Risks' : 'Severe Risks!'}
            </h3>
          </div>
        </div>

        {/* Breakdown box */}
        <div className="glass-card p-6 bg-card-bg/40 border-border-custom/50 shadow-md md:col-span-2 flex items-center justify-around flex-wrap gap-4 text-center">
          <div>
            <span className="text-xs text-text-secondary font-semibold">Breached</span>
            <h3 className={`text-2xl font-black mt-1 ${breachedCredentials.length > 0 ? 'text-red-400' : 'text-text-primary'}`}>
              {breachedCredentials.length}
            </h3>
          </div>
          <div className="h-8 w-px bg-border-custom" />
          <div>
            <span className="text-xs text-text-secondary font-semibold">Weak</span>
            <h3 className={`text-2xl font-black mt-1 ${weakCredentials.length > 0 ? 'text-orange-400' : 'text-text-primary'}`}>
              {weakCredentials.length}
            </h3>
          </div>
          <div className="h-8 w-px bg-border-custom" />
          <div>
            <span className="text-xs text-text-secondary font-semibold">Reused</span>
            <h3 className={`text-2xl font-black mt-1 ${reusedCredentials.length > 0 ? 'text-amber-400' : 'text-text-primary'}`}>
              {reusedCredentials.length}
            </h3>
          </div>
        </div>

      </div>

      {/* Main Tabs Layout */}
      <div className="glass-card bg-card-bg/40 border-border-custom/50 shadow-md overflow-hidden">
        
        {/* Tab Buttons bar */}
        <div className="flex border-b border-border-custom bg-primary-bg/20 overflow-x-auto scrollbar-none">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-accent-purple bg-accent-purple/5 text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-800 ${tab.count > 0 ? tab.color : 'text-text-muted'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="p-6">
          {activeList.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto text-green-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary">No vulnerabilities detected</h4>
                <p className="text-xs text-text-secondary mt-1">
                  Everything looks clean and secure in this category.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-custom text-text-muted font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Site / Account</th>
                    <th className="pb-3 font-semibold">Username</th>
                    <th className="pb-3 font-semibold">Vulnerability Detail</th>
                    <th className="pb-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/50">
                  {activeList.map((item) => {
                    let detailText = '';
                    let detailColor = '';
                    
                    if (activeTab === 'breached') {
                      detailText = 'Exposed in public breaches!';
                      detailColor = 'text-red-400 font-semibold';
                    } else if (activeTab === 'weak') {
                      detailText = 'Length / Complexity too low';
                      detailColor = 'text-orange-400';
                    } else if (activeTab === 'reused') {
                      detailText = 'Used across multiple sites';
                      detailColor = 'text-amber-400';
                    } else if (activeTab === 'old') {
                      const days = Math.round((new Date() - new Date(item.lastChangedAt)) / (1000 * 60 * 60 * 24));
                      detailText = `Last changed ${days} days ago`;
                      detailColor = 'text-text-muted';
                    }

                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                        {/* Site */}
                        <td className="py-4.5 font-bold text-text-primary text-sm max-w-[180px] truncate pr-4">
                          {item.siteName}
                        </td>
                        {/* Username */}
                        <td className="py-4.5 text-text-secondary max-w-[180px] truncate pr-4">
                          {item.username}
                        </td>
                        {/* vulnerability detail */}
                        <td className={`py-4.5 ${detailColor} pr-4`}>
                          {detailText}
                        </td>
                        {/* Actions */}
                        <td className="py-4.5 text-right">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border-custom bg-transparent text-text-secondary hover:text-text-primary hover:border-accent-purple hover:bg-accent-purple/5 transition-all cursor-pointer font-bold"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Edit Password Modal */}
      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCredential(null); }}
        editingCredential={selectedCredential}
      />

    </div>
  );
}
