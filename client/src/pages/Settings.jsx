import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useVault } from '../context/VaultContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Trash2, 
  Lock, 
  Palette, 
  Download, 
  Upload, 
  Clock, 
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';
import api from '../utils/api.js';

export default function Settings() {
  const { 
    themeColor, 
    setThemeColor, 
    autoLockTime, 
    setAutoLockTime, 
    changeMasterPassword, 
    deleteAccount 
  } = useAuth();
  
  const { credentials, importCredentials } = useVault();
  const showToast = useToast();
  const navigate = useNavigate();

  // Change master pass state
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Delete account state
  const [deletePass, setDeletePass] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // CSV file import state
  const [importingFile, setImportingFile] = useState(false);

  // 1. Change Master Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currPass || !newPass || !confirmPass) {
      showToast('All password fields are required.', 'warning');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPass.length < 8) {
      showToast('New password must be at least 8 characters long.', 'warning');
      return;
    }

    setIsUpdatingPass(true);
    try {
      // Pass the current decrypted credentials from VaultContext to re-encrypt them
      await changeMasterPassword(currPass, newPass, credentials);
      showToast('Master password updated successfully.', 'success');
      setCurrPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to update master password', 'error');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  // 2. Export Encrypted JSON Vault
  const handleExportVault = async () => {
    try {
      // Fetch the raw encrypted credentials directly from backend
      // So the downloaded file is safely encrypted, zero-knowledge!
      const res = await api.get('/passwords');
      const encryptedData = res.data;

      const blob = new Blob([JSON.stringify(encryptedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `encrypted-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Encrypted JSON backup downloaded', 'success');
    } catch (err) {
      showToast('Failed to export vault', 'error');
    }
  };

  // Helper: Resilient CSV Parser
  const parseCSV = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const parsed = [];

    for (let i = 1; i < lines.length; i++) {
      // Split by comma, handling potential quotes
      const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (row.length < headers.length) continue;

      const item = {};
      headers.forEach((header, index) => {
        if (header.includes('site') || header.includes('name') || header.includes('title')) {
          item.siteName = row[index];
        } else if (header.includes('url') || header.includes('web')) {
          item.url = row[index];
        } else if (header.includes('user') || header.includes('login') || header.includes('email')) {
          item.username = row[index];
        } else if (header.includes('pass')) {
          item.password = row[index];
        } else if (header.includes('cat')) {
          item.category = row[index];
        } else if (header.includes('note')) {
          item.notes = row[index];
        }
      });

      // Strict index fallback if headers don't match
      if (!item.siteName && row[0]) item.siteName = row[0];
      if (!item.username && row[1]) item.username = row[1];
      if (!item.password && row[2]) item.password = row[2];

      if (item.siteName && item.username && item.password) {
        parsed.push(item);
      }
    }
    return parsed;
  };

  // 3. Import Credentials from CSV
  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportingFile(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCSV(text);

        if (parsed.length === 0) {
          showToast('Could not find any valid credentials in CSV. Check headers: siteName, username, password', 'error');
          setImportingFile(false);
          return;
        }

        const confirm = window.confirm(`Found ${parsed.length} credentials in CSV. Import them into your vault?`);
        if (confirm) {
          await importCredentials(parsed);
          showToast(`Successfully imported ${parsed.length} credentials!`, 'success');
        }
      } catch (err) {
        console.error(err);
        showToast('Error parsing or importing CSV file.', 'error');
      } finally {
        setImportingFile(false);
        e.target.value = ''; // Reset file input
      }
    };

    reader.readAsText(file);
  };

  // 4. Delete Account Permanently
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePass) {
      showToast('Master password is required.', 'warning');
      return;
    }

    const doubleConfirm = window.confirm(
      'WARNING: This will permanently delete your account and delete ALL credentials saved in your vault. This action CANNOT BE UNDONE. Are you absolutely sure?'
    );
    if (!doubleConfirm) return;

    setIsDeleting(true);
    try {
      await deleteAccount(deletePass);
      showToast('Account and vault deleted permanently', 'success');
      navigate('/login');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to verify master password', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Vault Settings</h1>
        <p className="text-sm text-[#8e9192] mt-1">
          Configure security timeouts, backup imports/exports, themes, and account options.
        </p>
      </div>

      {/* Main Grid: Options Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Change Master Password Block */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="label-caps flex items-center gap-2">
            <Lock className="h-4 w-4" /> Change Master Password
          </h3>
          <p className="text-xs text-[#8e9192]">
            Changing your master password will re-encrypt all stored vault items with the new cryptographic key derived from it.
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="label-caps block">Current Master Password</label>
              <input
                type="password"
                required
                value={currPass}
                onChange={(e) => setCurrPass(e.target.value)}
                className="dark-input"
              />
            </div>
            <div className="space-y-1">
              <label className="label-caps block">New Master Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="dark-input"
              />
            </div>
            <div className="space-y-1">
              <label className="label-caps block">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="dark-input"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingPass}
              className="btn-primary flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingPass && <Loader2 className="h-3 w-3 animate-spin" />}
              UPDATE PASSWORD
            </button>
          </form>
        </div>

        {/* Global Security Settings (Auto-Lock & Theme) */}
        <div className="glass-card p-6 space-y-6">
          {/* Auto Lock Timer */}
          <div className="space-y-3">
            <h3 className="label-caps flex items-center gap-2">
              <Clock className="h-4 w-4" /> Auto-Lock Vault Timer
            </h3>
            <p className="text-xs text-[#8e9192]">
              Configure user inactivity timeouts. Vault state will automatically clear and lock when inactive.
            </p>
            <select
              value={autoLockTime}
              onChange={(e) => setAutoLockTime(Number(e.target.value))}
              className="dark-select"
            >
              <option value={1}>1 Minute</option>
              <option value={5}>5 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={0}>Never Auto-Lock</option>
            </select>
          </div>

          {/* Theme Accent Color - kept for compatibility */}
          <div className="space-y-3 pt-4 border-t border-[#444748]/50">
            <h3 className="label-caps flex items-center gap-2">
              <Palette className="h-4 w-4" /> Accent Color Theme
            </h3>
            <p className="text-xs text-[#8e9192]">
              Customize the accent gradient color scheme of the Vaultme portal.
            </p>
            
            <div className="flex items-center gap-3">
              {[
                { id: 'purple', class: 'bg-[#7c3aed]' },
                { id: 'cyan', class: 'bg-[#06b6d4]' },
                { id: 'rose', class: 'bg-[#f43f5e]' },
                { id: 'amber', class: 'bg-[#f59e0b]' }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setThemeColor(theme.id)}
                  title={`Select ${theme.id}`}
                  className={`h-6 w-6 cursor-pointer transition-transform ${theme.class} hover:scale-110 active:scale-95 ${
                    themeColor === theme.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d0d0d]' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Data Export / Import Block */}
        <div className="glass-card p-6 space-y-4 md:col-span-2">
          <h3 className="label-caps flex items-center gap-2">
            <FileText className="h-4 w-4" /> Backup & Migration
          </h3>
          <p className="text-xs text-[#8e9192]">
            Move data in and out. Exports downloaded from the server are safely encrypted blobs. Imports from CSV require headers: <span className="text-white">siteName</span>, <span className="text-white">username</span>, <span className="text-white">password</span>.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {/* Export */}
            <button
              onClick={handleExportVault}
              className="btn-secondary flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" /> Export Encrypted Vault (JSON)
            </button>

            {/* Import */}
            <label className="btn-secondary flex items-center gap-1.5 cursor-pointer">
              {importingFile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Import from CSV
                </>
              )}
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                disabled={importingFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Danger Zone: Delete Account */}
        <div className="glass-card p-6 space-y-4 md:col-span-2" style={{ borderColor: 'rgba(255,68,68,0.2)', borderLeftWidth: '3px', borderLeftColor: '#ff4444' }}>
          <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest">
            <Trash2 className="h-4 w-4 text-white" /> Danger Zone: Delete Account
          </h3>
          <p className="text-xs text-[#8e9192]">
            Deleting your account will permanently wipe your user profile and delete all encrypted passwords saved on the database. This action is irreversible.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-[#ff4444]/30 bg-transparent text-[#ff4444] text-xs font-bold transition-all cursor-pointer hover:bg-[#ff4444]/10 uppercase tracking-wider"
            >
              Delete Account...
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-3 max-w-sm pt-2">
              <div className="flex gap-2 p-3.5 border border-[#ff4444]/20 bg-[#ff4444]/5 text-[#8e9192] text-[11px] leading-tight">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-white" />
                <span>To confirm account destruction, please enter your master password below.</span>
              </div>
              <div className="space-y-1">
                <label className="label-caps text-[#ff4444]/70 block">Master Password</label>
                <input
                  type="password"
                  required
                  value={deletePass}
                  onChange={(e) => setDeletePass(e.target.value)}
                  placeholder="Master password"
                  className="dark-input"
                  style={{ borderColor: 'rgba(255,68,68,0.3)' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="px-4 py-2 bg-[#ff4444] hover:bg-[#cc0000] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                >
                  {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
                  Confirm Permanent Deletion
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDeleteConfirm(false); setDeletePass(''); }}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
