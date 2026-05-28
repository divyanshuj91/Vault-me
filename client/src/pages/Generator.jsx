import React, { useState, useEffect } from 'react';
import { useClipboard } from '../hooks/useClipboard.js';
import { useToast } from '../components/Toast.jsx';
import { RefreshCw, Copy, Check, Sparkles, AlertCircle, Info } from 'lucide-react';
import StrengthMeter from '../components/StrengthMeter.jsx';
import { motion } from 'framer-motion';

export default function Generator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(18);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const [copied, copyToClipboard] = useClipboard();
  const showToast = useToast();

  const generatePassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let characterPool = '';
    let mandatoryChars = '';

    if (includeUppercase) {
      characterPool += uppercaseChars;
      mandatoryChars += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    }
    if (includeLowercase) {
      characterPool += lowercaseChars;
      mandatoryChars += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    }
    if (includeNumbers) {
      characterPool += numberChars;
      mandatoryChars += numberChars[Math.floor(Math.random() * numberChars.length)];
    }
    if (includeSymbols) {
      characterPool += symbolChars;
      mandatoryChars += symbolChars[Math.floor(Math.random() * symbolChars.length)];
    }

    if (characterPool.length === 0) {
      setPassword('');
      return;
    }

    let generated = mandatoryChars;
    const remainingLength = length - mandatoryChars.length;
    const randomValues = new Uint32Array(remainingLength);
    window.crypto.getRandomValues(randomValues);

    for (let i = 0; i < remainingLength; i++) {
      generated += characterPool[randomValues[i] % characterPool.length];
    }

    // Shuffle characters to avoid predictable patterns at the beginning
    const shuffled = generated.split('').sort(() => 0.5 - Math.random()).join('');
    setPassword(shuffled);
  };

  // Generate on load or parameter changes
  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const handleCopy = () => {
    if (!password) return;
    copyToClipboard(password);
    showToast('Secure password copied!', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Password Generator</h1>
        <p className="text-sm text-text-secondary mt-1">
          Create cryptographically secure, random passwords locally in your browser.
        </p>
      </div>

      {/* Main Generator Card */}
      <div className="glass-card p-6 bg-card-bg/40 border-border-custom/50 shadow-md space-y-6">
        
        {/* Monospace Output Box */}
        <div className="relative group">
          <div className="w-full min-h-[70px] flex items-center justify-between p-4.5 rounded-2xl border border-border-custom bg-primary-bg/70 text-base md:text-xl font-mono tracking-wider text-accent-cyan break-all pr-24 overflow-x-auto">
            {password ? password : <span className="text-text-muted text-sm font-sans">Select at least one character type</span>}
          </div>
          
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Refresh button */}
            <button
              onClick={generatePassword}
              title="Regenerate"
              disabled={password === ''}
              className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            {/* Copy button */}
            <button
              onClick={handleCopy}
              title="Copy"
              disabled={!password}
              className="p-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-white shadow-lg shadow-accent-purple/20 hover:scale-102 hover:shadow-accent-purple/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {copied ? <Check className="h-5 w-5 text-green-300 animate-pulse" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Real-time strength meter */}
        {password && (
          <div className="p-4 rounded-xl border border-border-custom bg-primary-bg/20">
            <StrengthMeter password={password} showFeedback={true} />
          </div>
        )}

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border-custom/50">
          
          {/* Sliders length */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-text-secondary">Password Length</span>
              <span className="text-accent-purple text-base font-bold">{length}</span>
            </div>
            
            <div className="space-y-2">
              <input
                type="range"
                min="8"
                max="128"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-1.5 bg-primary-bg rounded-lg appearance-none cursor-pointer accent-accent-purple"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>8 chars</span>
                <span>64 chars</span>
                <span>128 chars</span>
              </div>
            </div>
          </div>

          {/* Toggles filters */}
          <div className="space-y-3.5">
            <h4 className="text-xs text-text-muted uppercase font-bold tracking-wider mb-2">Character Options</h4>
            
            {/* Uppercase */}
            <label className="flex items-center justify-between text-sm text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
              <span className="font-medium">Uppercase Letters (A-Z)</span>
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="w-4 h-4 rounded text-accent-purple focus:ring-accent-purple/20 bg-primary-bg border-border-custom"
              />
            </label>

            {/* Lowercase */}
            <label className="flex items-center justify-between text-sm text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
              <span className="font-medium">Lowercase Letters (a-z)</span>
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="w-4 h-4 rounded text-accent-purple focus:ring-accent-purple/20 bg-primary-bg border-border-custom"
              />
            </label>

            {/* Numbers */}
            <label className="flex items-center justify-between text-sm text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
              <span className="font-medium">Numbers (0-9)</span>
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-4 h-4 rounded text-accent-purple focus:ring-accent-purple/20 bg-primary-bg border-border-custom"
              />
            </label>

            {/* Symbols */}
            <label className="flex items-center justify-between text-sm text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
              <span className="font-medium">Special Symbols (!@#$)</span>
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-4 h-4 rounded text-accent-purple focus:ring-accent-purple/20 bg-primary-bg border-border-custom"
              />
            </label>
          </div>

        </div>

        {/* Informative warning tip */}
        <div className="flex gap-2.5 p-3.5 rounded-xl border border-blue-500/10 bg-blue-500/5 text-blue-300 text-xs">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Using longer passwords (16+ characters) containing a mix of all options significantly improves entropy and prevents offline brute-forcing.</span>
        </div>

      </div>

    </div>
  );
}
