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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full sm:max-w-lg bg-[#0d0d0d] border border-[#444748] z-10 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#444748] flex items-center justify-between">
            <h3 className="font-bold text-base text-white uppercase tracking-widest text-xs">
              {editingCredential ? 'Edit Credential' : 'Add New Credential'}
            </h3>
            <button
              onClick={onClose}
              className="text-[#8e9192] hover:text-white p-1.5 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Site Name & URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="label-caps block">Site Name *</label>
                <input
                  type="text"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  placeholder="e.g. Google"
                  required
                  className="dark-input"
                />
              </div>

              <div className="space-y-1">
                <label className="label-caps block">Site URL</label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="e.g. google.com"
                  className="dark-input"
                />
              </div>
            </div>

            {/* Username & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="label-caps block">Username / Email *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. user@gmail.com"
                  required
                  className="dark-input"
                />
              </div>

              <div className="space-y-1">
                <label className="label-caps block">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="dark-select"
                >
                  <option value="Social">Social</option>
                  <option value="Banking">Banking</option>
                  <option value="Work">Work</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="label-caps flex justify-between items-center">
                <span>Password *</span>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[#8e9192] hover:text-white text-[11px] flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
                >
                  <Sparkles className="h-3 w-3" /> Generate
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
                  className="dark-input pr-10"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e9192] hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {formData.password && <StrengthMeter password={formData.password} showFeedback={false} />}
            </div>

            {/* HaveIBeenPwned section */}
            <div className="p-3.5 border border-[#444748] bg-[#0d0d0d] space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[#8e9192] flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" /> Breach Audit Check
                </span>
                <button
                  type="button"
                  onClick={handleCheckBreach}
                  disabled={isBreachLoading || !formData.password}
                  className="px-3 py-1 text-xs font-semibold border border-[#444748] text-[#8e9192] hover:text-white hover:border-white transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
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
                    <div className="flex items-center gap-2 text-white">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[#8e9192]" />
                      <span>This password was exposed in {count.toLocaleString()} data breaches! Do not use it.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-white">
                      <Check className="h-4 w-4 flex-shrink-0" />
                      <span>Clean! No breaches found for this password.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="label-caps block">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes (e.g. security questions, recovery pins)"
                rows={3}
                className="dark-input resize-none"
                style={{ height: 'auto', padding: '8px 12px' }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#444748]">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary py-2.5 px-4 text-xs"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingCredential ? 'UPDATE' : 'SAVE'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
