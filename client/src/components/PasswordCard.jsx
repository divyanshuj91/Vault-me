import React, { useState } from 'react';
import { useClipboard } from '../hooks/useClipboard.js';
import { useToast } from './Toast.jsx';
import { analyzePassword } from '../utils/passwordStrength.js';
import { Eye, EyeOff, Copy, Check, Edit2, Trash2, Shield, CreditCard, Briefcase, ShoppingBag, Folder, Globe } from 'lucide-react';

export default function PasswordCard({ credential, viewMode = 'grid', onEdit, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPass, copyPass] = useClipboard();
  const [copiedUser, copyUser] = useClipboard();
  const showToast = useToast();

  const { id, siteName, url, username, password, category, lastChangedAt } = credential;
  const strength = analyzePassword(password);

  // Extract clean domain for Google Favicon API
  const getDomain = (urlStr) => {
    try {
      if (!urlStr) return '';
      let formatted = urlStr;
      if (!/^https?:\/\//i.test(urlStr)) {
        formatted = 'https://' + urlStr;
      }
      const parsed = new URL(formatted);
      return parsed.hostname.replace('www.', '');
    } catch (e) {
      return '';
    }
  };

  const domain = getDomain(url);
  const faviconUrl = domain 
    ? `https://www.google.com/s2/favicons?sz=64&domain=${domain}` 
    : null;

  // Get category icon
  const getCategoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'banking':
      case 'finance':
        return <CreditCard className="h-4 w-4" />;
      case 'work':
        return <Briefcase className="h-4 w-4" />;
      case 'shopping':
        return <ShoppingBag className="h-4 w-4" />;
      case 'social':
        return <Globe className="h-4 w-4" />;
      default:
        return <Folder className="h-4 w-4" />;
    }
  };

  const handleCopyPassword = () => {
    copyPass(password);
    showToast('Password copied to clipboard (clears in 30s)', 'success');
  };

  const handleCopyUsername = () => {
    copyUser(username);
    showToast('Username copied to clipboard', 'info');
  };

  // Strength badge - monochromatic grayscale
  const getStrengthBadge = (score) => {
    if (score < 2) return 'border border-[#444748] text-[#8e9192]';
    if (score === 2) return 'border border-[#8e9192] text-[#c4c7c8]';
    return 'border border-white/30 text-white';
  };

  if (viewMode === 'list') {
    return (
      <div className="vault-card w-full flex items-center justify-between gap-4 p-4 hover:border-white transition-all duration-200">
        
        {/* Favicon & Site Name */}
        <div className="flex items-center gap-3.5 flex-1 min-w-[200px]">
          <div className="h-10 w-10 bg-[#201f1f] border border-[#444748] flex items-center justify-center overflow-hidden flex-shrink-0">
            {faviconUrl ? (
              <img 
                src={faviconUrl} 
                alt="" 
                onError={(e) => { e.target.style.display = 'none'; }}
                className="h-6 w-6 object-contain"
              />
            ) : (
              <Shield className="h-5 w-5 text-[#8e9192]" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-white text-sm truncate">{siteName}</h4>
            <span className="flex items-center gap-1 text-[11px] text-[#8e9192] mt-0.5">
              {getCategoryIcon(category)}
              <span className="capitalize">{category || 'Other'}</span>
            </span>
          </div>
        </div>

        {/* Username */}
        <div className="flex-1 min-w-[150px] hidden sm:block">
          <p className="text-[10px] text-[#8e9192]">Username</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-sm text-[#c4c7c8] truncate font-mono-data">{username}</p>
            <button 
              onClick={handleCopyUsername}
              className="text-[#8e9192] hover:text-white transition-colors cursor-pointer"
              title="Copy username"
            >
              {copiedUser ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Masked Password */}
        <div className="flex-1 min-w-[150px] hidden md:block">
          <p className="text-[10px] text-[#8e9192]">Password</p>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-sm font-mono tracking-wider text-[#c4c7c8]">
              {showPassword ? password : '••••••••••••'}
            </code>
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#8e9192] hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Strength Badge */}
        <div className="hidden xs:block flex-shrink-0">
          <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider ${getStrengthBadge(strength.score)}`}>
            {strength.label}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyPassword}
            title="Copy Password"
            className="p-2 text-[#8e9192] hover:text-white border border-transparent hover:border-[#444748] transition-all duration-200 cursor-pointer"
          >
            {copiedPass ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => onEdit(credential)}
            title="Edit"
            className="p-2 text-[#8e9192] hover:text-white border border-transparent hover:border-[#444748] transition-all duration-200 cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(id, siteName)}
            title="Delete"
            className="p-2 text-[#8e9192] hover:text-white border border-transparent hover:border-[#444748] transition-all duration-200 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

      </div>
    );
  }

  // Grid view (Default)
  return (
    <div className="vault-card group relative flex flex-col justify-between p-5 hover:border-white transition-all duration-200">
      
      {/* Top Details */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#201f1f] border border-[#444748] flex items-center justify-center overflow-hidden">
              {faviconUrl ? (
                <img 
                  src={faviconUrl} 
                  alt="" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <Shield className="h-5 w-5 text-[#8e9192]" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-white text-sm truncate">{siteName}</h4>
              {url && (
                <a 
                  href={url.startsWith('http') ? url : `https://${url}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-[#8e9192] hover:text-white hover:underline truncate block max-w-[130px] transition-colors"
                >
                  {url.replace(/https?:\/\/(www\.)?/, '')}
                </a>
              )}
            </div>
          </div>
          
          <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider flex-shrink-0 ${getStrengthBadge(strength.score)}`}>
            {strength.label}
          </span>
        </div>

        {/* Username */}
        <div className="space-y-1">
          <p className="label-caps">Username</p>
          <div className="flex items-center justify-between gap-2 p-2 bg-[#0d0d0d] border border-[#444748]">
            <span className="text-xs text-[#c4c7c8] font-mono truncate">{username}</span>
            <button 
              onClick={handleCopyUsername}
              className="text-[#8e9192] hover:text-white transition-colors cursor-pointer"
              title="Copy Username"
            >
              {copiedUser ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Masked Password */}
        <div className="space-y-1">
          <p className="label-caps">Password</p>
          <div className="flex items-center justify-between gap-2 p-2 bg-[#0d0d0d] border border-[#444748]">
            <code className="text-xs font-mono tracking-wider text-[#c4c7c8] truncate">
              {showPassword ? password : '••••••••••••'}
            </code>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#8e9192] hover:text-white transition-colors cursor-pointer"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button 
                onClick={handleCopyPassword}
                className="text-[#8e9192] hover:text-white transition-colors cursor-pointer"
                title="Copy Password"
              >
                {copiedPass ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info & action buttons */}
      <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-[#444748]/50">
        <span className="flex items-center gap-1 text-[10px] text-[#8e9192]">
          {getCategoryIcon(category)}
          <span className="capitalize">{category || 'Other'}</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(credential)}
            title="Edit"
            className="p-1.5 text-[#8e9192] hover:text-white transition-all cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(id, siteName)}
            title="Delete"
            className="p-1.5 text-[#8e9192] hover:text-white transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
