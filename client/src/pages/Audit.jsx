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

  // Tab config - grayscale indicators
  const tabConfig = [
    { id: 'breached', label: 'Breached', count: breachedCredentials.length, icon: <ShieldAlert className="h-4 w-4" /> },
    { id: 'weak', label: 'Weak', count: weakCredentials.length, icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'reused', label: 'Reused', count: reusedCredentials.length, icon: <RefreshCw className="h-3.5 w-3.5" /> },
    { id: 'old', label: 'Old (90d+)', count: oldCredentials.length, icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Audit Report</h1>
          <p className="text-sm text-[#8e9192] mt-1">
            Identify compromised, weak, or repeated credentials across your vault.
          </p>
        </div>

        {/* Fix button in Weak tab */}
        {activeTab === 'weak' && weakCredentials.length > 0 && (
          <button
            onClick={handleFixAllWeak}
            disabled={isFixing}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFixing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            FIX ALL WEAK
          </button>
        )}
      </div>

      {/* Overview stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Score box */}
        <div className="glass-card p-6 flex items-center gap-6 md:col-span-1">
          <div className="h-20 w-20 border border-[#444748] bg-[#131313] flex items-center justify-center font-black text-2xl text-white font-mono flex-shrink-0">
            {securityScore}%
          </div>
          <div>
            <span className="label-caps">Vault Security Score</span>
            <h3 className="text-base font-bold text-white mt-1">
              {securityScore >= 90 ? 'Excellent Rating' : securityScore >= 70 ? 'Moderate Risks' : 'Severe Risks!'}
            </h3>
          </div>
        </div>

        {/* Breakdown box */}
        <div className="glass-card p-6 md:col-span-2 flex items-center justify-around flex-wrap gap-4 text-center">
          <div>
            <span className="label-caps">Breached</span>
            <h3 className={`text-2xl font-black mt-1 ${breachedCredentials.length > 0 ? 'text-white' : 'text-[#8e9192]'}`}>
              {breachedCredentials.length}
            </h3>
          </div>
          <div className="h-8 w-px bg-[#444748]" />
          <div>
            <span className="label-caps">Weak</span>
            <h3 className={`text-2xl font-black mt-1 ${weakCredentials.length > 0 ? 'text-white' : 'text-[#8e9192]'}`}>
              {weakCredentials.length}
            </h3>
          </div>
          <div className="h-8 w-px bg-[#444748]" />
          <div>
            <span className="label-caps">Reused</span>
            <h3 className={`text-2xl font-black mt-1 ${reusedCredentials.length > 0 ? 'text-white' : 'text-[#8e9192]'}`}>
              {reusedCredentials.length}
            </h3>
          </div>
        </div>

      </div>

      {/* Main Tabs Layout */}
      <div className="glass-card overflow-hidden">
        
        {/* Tab Buttons bar */}
        <div className="flex border-b border-[#444748] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-white text-white bg-[#201f1f]/50'
                  : 'border-transparent text-[#8e9192] hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold border border-[#444748] ${tab.count > 0 ? 'text-white' : 'text-[#8e9192]'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="p-6">
          {activeList.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="h-12 w-12 border border-[#444748] bg-[#131313] flex items-center justify-center mx-auto">
                <ShieldCheck className="h-6 w-6 text-[#8e9192]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">No vulnerabilities detected</h4>
                <p className="text-xs text-[#8e9192] mt-1">
                  Everything looks clean and secure in this category.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#444748]">
                    <th className="pb-3 label-caps">Site / Account</th>
                    <th className="pb-3 label-caps">Username</th>
                    <th className="pb-3 label-caps">Vulnerability Detail</th>
                    <th className="pb-3 text-right label-caps">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#444748]/30">
                  {activeList.map((item) => {
                    let detailText = '';
                    
                    if (activeTab === 'breached') {
                      detailText = 'Exposed in public breaches!';
                    } else if (activeTab === 'weak') {
                      detailText = 'Length / Complexity too low';
                    } else if (activeTab === 'reused') {
                      detailText = 'Used across multiple sites';
                    } else if (activeTab === 'old') {
                      const days = Math.round((new Date() - new Date(item.lastChangedAt)) / (1000 * 60 * 60 * 24));
                      detailText = `Last changed ${days} days ago`;
                    }

                    return (
                      <tr key={item.id} className="hover:bg-white/3 transition-colors">
                        {/* Site */}
                        <td className="py-4 font-bold text-white text-sm max-w-[180px] truncate pr-4">
                          {item.siteName}
                        </td>
                        {/* Username */}
                        <td className="py-4 text-[#8e9192] max-w-[180px] truncate pr-4 font-mono-data">
                          {item.username}
                        </td>
                        {/* Vulnerability detail */}
                        <td className="py-4 text-[#c4c7c8] pr-4">
                          {detailText}
                        </td>
                        {/* Actions */}
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#444748] bg-transparent text-[#8e9192] hover:text-white hover:border-white transition-all cursor-pointer font-bold text-xs"
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
