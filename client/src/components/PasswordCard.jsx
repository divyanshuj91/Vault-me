import React, { useState } from 'react';
import { useClipboard } from '../hooks/useClipboard.js';
import { useToast } from './Toast.jsx';
import { analyzePassword } from '../utils/passwordStrength.js';
import { Eye, EyeOff, Copy, Check, Edit2, Trash2, Globe, Shield, CreditCard, Briefcase, ShoppingBag, Folder } from 'lucide-react';

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
      // Ensure urlStr has protocol for URL parsing
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

  // Badge colors based on score
  const getStrengthBadge = (score) => {
    if (score < 2) return 'bg-red-500/10 text-red-400 border border-red-500/20';
    if (score === 2) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-green-500/10 text-green-400 border border-green-500/20';
  };

  if (viewMode === 'list') {
    return (
      <div className="w-full flex items-center justify-between gap-4 p-4 rounded-xl border border-border-custom bg-card-bg/40 hover:bg-card-bg/80 hover:border-accent-purple/30 shadow-sm transition-all duration-300">
        
        {/* Favicon & Site Name */}
        <div className="flex items-center gap-3.5 flex-1 min-w-[200px]">
          <div className="h-10 w-10 rounded-xl bg-surface-bg border border-border-custom flex items-center justify-center overflow-hidden flex-shrink-0">
            {faviconUrl ? (
              <img 
                src={faviconUrl} 
                alt="" 
                onError={(e) => { e.target.style.display = 'none'; }}
                className="h-6.5 w-6.5 object-contain"
              />
            ) : (
              <Shield className="h-5 w-5 text-accent-purple" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-text-primary text-sm truncate">{siteName}</h4>
            <span className="flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
              {getCategoryIcon(category)}
              <span className="capitalize">{category || 'Other'}</span>
            </span>
          </div>
        </div>

        {/* Username */}
        <div className="flex-1 min-w-[150px] hidden sm:block">
          <p className="text-xs text-text-muted">Username</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-sm font-medium text-text-secondary truncate">{username}</p>
            <button 
              onClick={handleCopyUsername}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Copy username"
            >
              {copiedUser ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Masked Password */}
        <div className="flex-1 min-w-[150px] hidden md:block">
          <p className="text-xs text-text-muted">Password</p>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-sm font-mono tracking-wider text-text-secondary">
              {showPassword ? password : '••••••••••••'}
            </code>
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Strength Badge */}
        <div className="hidden xs:block flex-shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStrengthBadge(strength.score)}`}>
            {strength.label}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyPassword}
            title="Copy Password"
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent hover:border-border-custom transition-all duration-200 cursor-pointer"
          >
            {copiedPass ? <Check className="h-4.5 w-4.5 text-green-400 animate-pulse" /> : <Copy className="h-4.5 w-4.5" />}
          </button>
          
          <button
            onClick={() => onEdit(credential)}
            title="Edit"
            className="p-2 rounded-lg text-text-secondary hover:text-accent-purple hover:bg-accent-purple/5 border border-transparent hover:border-accent-purple/10 transition-all duration-200 cursor-pointer"
          >
            <Edit2 className="h-4.5 w-4.5" />
          </button>
          
          <button
            onClick={() => onDelete(id, siteName)}
            title="Delete"
            className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-200 cursor-pointer"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>

      </div>
    );
  }

  // Grid view (Default)
  return (
    <div className="group relative flex flex-col justify-between p-5 rounded-2xl border border-border-custom bg-card-bg/40 hover:bg-card-bg/80 hover:border-accent-purple/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]">
      
      {/* Top Details */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-surface-bg border border-border-custom flex items-center justify-center overflow-hidden">
              {faviconUrl ? (
                <img 
                  src={faviconUrl} 
                  alt="" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <Shield className="h-5.5 w-5.5 text-accent-purple" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-text-primary text-sm truncate">{siteName}</h4>
              {url && (
                <a 
                  href={url.startsWith('http') ? url : `https://${url}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-accent-cyan hover:underline truncate block max-w-[130px]"
                >
                  {url.replace(/https?:\/\/(www\.)?/, '')}
                </a>
              )}
            </div>
          </div>
          
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${getStrengthBadge(strength.score)}`}>
            {strength.label}
          </span>
        </div>

        {/* Username */}
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Username</p>
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-primary-bg/50 border border-border-custom/50">
            <span className="text-xs text-text-secondary font-medium truncate">{username}</span>
            <button 
              onClick={handleCopyUsername}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Copy Username"
            >
              {copiedUser ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Masked Password */}
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Password</p>
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-primary-bg/50 border border-border-custom/50">
            <code className="text-xs font-mono tracking-wider text-text-secondary truncate">
              {showPassword ? password : '••••••••••••'}
            </code>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button 
                onClick={handleCopyPassword}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Copy Password"
              >
                {copiedPass ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info & action buttons */}
      <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-border-custom/50">
        <span className="flex items-center gap-1 text-[10px] text-text-muted">
          {getCategoryIcon(category)}
          <span className="capitalize">{category || 'Other'}</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(credential)}
            title="Edit"
            className="p-1.5 rounded-lg text-text-muted hover:text-accent-purple hover:bg-accent-purple/5 transition-all cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(id, siteName)}
            title="Delete"
            className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
