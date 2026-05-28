import React, { useState, useEffect } from 'react';
import { useClipboard } from '../hooks/useClipboard.js';
import { useToast } from '../components/Toast.jsx';
import { RefreshCw, Copy, Check, Info } from 'lucide-react';
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

  // Toggle component
  const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between text-sm text-[#8e9192] cursor-pointer hover:text-white transition-colors group">
      <span className="font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 flex-shrink-0 transition-colors duration-200 cursor-pointer ${
          checked ? 'bg-white' : 'bg-[#2a2a2a] border border-[#444748]'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 transition-transform duration-200 ${
            checked ? 'translate-x-5 bg-black' : 'translate-x-0.5 bg-[#8e9192]'
          }`}
        />
      </button>
    </label>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Password Generator</h1>
        <p className="text-sm text-[#8e9192] mt-1">
          Create cryptographically secure, random passwords locally in your browser.
        </p>
      </div>

      {/* Main Generator Card */}
      <div className="glass-card p-6 space-y-6">
        
        {/* Monospace Output Box */}
        <div className="relative">
          <div className="w-full min-h-[80px] flex items-center bg-black border border-[#444748] p-4 pr-24 overflow-x-auto">
            <code className="font-mono-data text-xl text-white tracking-widest break-all flex-1">
              {password ? password : (
                <span className="text-[#444748] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Select at least one character type
                </span>
              )}
            </code>
          </div>
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Refresh button */}
            <button
              onClick={generatePassword}
              title="Regenerate"
              disabled={password === ''}
              className="p-2.5 text-[#8e9192] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            {/* Copy button */}
            <button
              onClick={handleCopy}
              title="Copy"
              disabled={!password}
              className="btn-primary py-2.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Real-time strength meter */}
        {password && (
          <div className="p-4 border border-[#444748] bg-[#0d0d0d]">
            <StrengthMeter password={password} showFeedback={true} />
          </div>
        )}

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#444748]/50">
          
          {/* Slider length */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="label-caps">Password Length</span>
              <span className="text-white text-base font-bold font-mono">{length}</span>
            </div>
            
            <div className="space-y-2">
              <input
                type="range"
                min="8"
                max="128"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-0.5 bg-[#444748] appearance-none cursor-pointer"
                style={{ accentColor: '#ffffff' }}
              />
              <div className="flex justify-between">
                <span className="label-caps">8</span>
                <span className="label-caps">64</span>
                <span className="label-caps">128</span>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <h4 className="label-caps">Character Options</h4>
            
            <Toggle
              checked={includeUppercase}
              onChange={setIncludeUppercase}
              label="Uppercase Letters (A-Z)"
            />
            <Toggle
              checked={includeLowercase}
              onChange={setIncludeLowercase}
              label="Lowercase Letters (a-z)"
            />
            <Toggle
              checked={includeNumbers}
              onChange={setIncludeNumbers}
              label="Numbers (0-9)"
            />
            <Toggle
              checked={includeSymbols}
              onChange={setIncludeSymbols}
              label="Special Symbols (!@#$)"
            />
          </div>

        </div>

        {/* Info tip */}
        <div className="flex gap-2.5 p-3.5 border border-[#444748] bg-[#0d0d0d] text-[#8e9192] text-xs">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#444748]" />
          <span>Using longer passwords (16+ characters) containing a mix of all options significantly improves entropy and prevents offline brute-forcing.</span>
        </div>

      </div>

    </div>
  );
}
