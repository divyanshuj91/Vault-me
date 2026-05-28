import React, { useState, useEffect } from 'react';
import { useVault } from '../context/VaultContext.jsx';
import { useBreachCheck } from '../hooks/useBreachCheck.js';
import { useToast } from './Toast.jsx';
import { X, Eye, EyeOff, ShieldAlert, Sparkles, AlertTriangle, Check, Loader2 } from 'lucide-react';
import StrengthMeter from './StrengthMeter.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function PasswordModal({ isOpen, onClose, editingCredential = null }) {
  const { addCredential, updateCredential } = useVault();
  const showToast = useToast();
  const { isBreached, count, checkBreach, isLoading: isBreachLoading, checked, reset: resetBreach } = useBreachCheck();

  const [formData, setFormData] = useState({
    siteName: '',
    url: '',
    username: '',
    password: '',
    category: 'Other',
    notes: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set form data if editing
  useEffect(() => {
    if (editingCredential) {
      setFormData({
        siteName: editingCredential.siteName || '',
        url: editingCredential.url || '',
        username: editingCredential.username || '',
        password: editingCredential.password || '',
        category: editingCredential.category || 'Other',
        notes: editingCredential.notes || ''
      });
    } else {
      setFormData({
        siteName: '',
        url: '',
        username: '',
        password: '',
        category: 'Other',
        notes: ''
      });
    }
    setShowPassword(false);
    resetBreach();
  }, [editingCredential, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      resetBreach();
    }
  };

  // Secure Password Generator inside modal
  const handleGeneratePassword = () => {
    const length = 16;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + symbols;

    let generatedPassword = '';
    const randomArray = new Uint32Array(length);
    window.crypto.getRandomValues(randomArray);

    // Ensure at least one character from each set
    generatedPassword += uppercase[randomArray[0] % uppercase.length];
    generatedPassword += lowercase[randomArray[1] % lowercase.length];
    generatedPassword += numbers[randomArray[2] % numbers.length];
    generatedPassword += symbols[randomArray[3] % symbols.length];

    for (let i = 4; i < length; i++) {
      generatedPassword += allChars[randomArray[i] % allChars.length];
    }

    // Shuffle characters
    const shuffled = generatedPassword.split('').sort(() => 0.5 - Math.random()).join('');

    setFormData(prev => ({ ...prev, password: shuffled }));
    resetBreach();
    showToast('Secure password generated!', 'success');
  };

  const handleCheckBreach = async (e) => {
    e.preventDefault();
    if (!formData.password) {
      showToast('Please enter a password first.', 'warning');
      return;
    }
    await checkBreach(formData.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.siteName || !formData.username || !formData.password) {
      showToast('Site name, username, and password are required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCredential) {
        await updateCredential(editingCredential.id, formData);
        showToast('Credential updated successfully', 'success');
      } else {
        await addCredential(formData);
        showToast('Credential added to vault', 'success');
      }
      onClose();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Failed to save credential', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full sm:max-w-lg bg-card-bg border border-border-custom rounded-t-2xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none"
        >
          {/* Header */}
          <div className="p-5 border-b border-border-custom flex items-center justify-between">
            <h3 className="font-bold text-lg text-text-primary">
              {editingCredential ? 'Edit Credential' : 'Add New Credential'}
            </h3>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Site Name & URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Site Name *</label>
                <input
                  type="text"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  placeholder="e.g. Google"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-border-custom bg-primary-bg/50 text-text-primary text-sm focus:outline-none focus:border-accent-purple transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Site URL</label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="e.g. google.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-border-custom bg-primary-bg/50 text-text-primary text-sm focus:outline-none focus:border-accent-purple transition-all duration-300"
                />
              </div>
            </div>

            {/* Username & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Username / Email *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. user@gmail.com"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-border-custom bg-primary-bg/50 text-text-primary text-sm focus:outline-none focus:border-accent-purple transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border-custom bg-primary-bg/50 text-text-primary text-sm focus:outline-none focus:border-accent-purple transition-all duration-300 capitalize"
                >
                  <option value="Social">Social</option>
                  <option value="Banking">Banking</option>
                  <option value="Work">Work</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Password Field with inline Generator and Eye toggler */}
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold flex justify-between">
                <span>Password *</span>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-accent-cyan hover:text-cyan-300 text-xs flex items-center gap-1 cursor-pointer hover:underline transition-colors"
                >
                  <Sparkles className="h-3 w-3" /> Generate Password
                </button>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full pl-3.5 pr-20 py-2 rounded-xl border border-border-custom bg-primary-bg/50 text-text-primary text-sm font-mono focus:outline-none focus:border-accent-purple transition-all duration-300"
                />
                <div className="absolute right-2 inset-y-0 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Dynamic strength meter */}
              <StrengthMeter password={formData.password} />
            </div>

            {/* HaveIBeenPwned audit checker section */}
            <div className="p-3.5 rounded-xl border border-border-custom bg-primary-bg/30 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-accent-cyan" /> Breach Audit Check
                </span>
                <button
                  type="button"
                  onClick={handleCheckBreach}
                  disabled={isBreachLoading || !formData.password}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/20 text-accent-cyan hover:text-cyan-300 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isBreachLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Auditing...
                    </>
                  ) : (
                    'Check Database'
                  )}
                </button>
              </div>

              {/* Breach status display */}
              {checked && (
                <div className="text-xs pt-1">
                  {isBreached ? (
                    <div className="flex items-center gap-2 text-red-400 font-medium">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>This password was exposed in {count.toLocaleString()} data breaches! Do not use it.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-400 font-medium">
                      <Check className="h-4 w-4 flex-shrink-0" />
                      <span>Clean! No breaches found for this password.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes (e.g. security questions, recovery pins)"
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl border border-border-custom bg-primary-bg/50 text-text-primary text-sm focus:outline-none focus:border-accent-purple transition-all duration-300 resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-custom">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border-custom bg-transparent text-text-secondary text-sm font-semibold hover:bg-white/5 hover:text-text-primary transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-white text-sm font-bold shadow-lg shadow-accent-purple/20 hover:shadow-accent-purple/40 hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingCredential ? 'Update Credential' : 'Save Credential'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
