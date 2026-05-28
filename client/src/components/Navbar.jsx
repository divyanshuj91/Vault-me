import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useVault } from '../context/VaultContext.jsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Search, Lock, LogOut, Settings, Award } from 'lucide-react';
import { useToast } from './Toast.jsx';

export default function Navbar() {
  const { user, lock, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useVault();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();
  const searchInputRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // If not on the vault page, navigate to vault page automatically to show results
    if (location.pathname !== '/vault') {
      navigate('/vault');
    }
  };

  const handleLock = () => {
    lock();
    showToast('Vault locked successfully', 'warning');
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out of session', 'info');
    navigate('/login');
  };

  // Keyboard shortcut listener details:
  // Ctrl+L to lock, Ctrl+K to focus search (handled globally in App.jsx or in Navbar)

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-40 w-full px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 p-3 rounded-2xl glass-card border border-border-custom bg-card-bg/60 backdrop-blur-md shadow-lg shadow-black/30">
        
        {/* Logo Section */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="p-2 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan text-white shadow-lg shadow-accent-purple/20 transition-transform group-hover:scale-105 duration-300">
            <Shield className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline font-bold text-lg tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Smart<span className="text-accent-purple font-extrabold group-hover:text-accent-cyan transition-colors duration-300">Vault</span>
          </span>
        </Link>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative group">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent-purple transition-colors">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search vault (Ctrl+K)"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-10 py-2 rounded-xl border border-border-custom bg-primary-bg/50 text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 inset-y-0 flex items-center text-xs text-text-muted hover:text-text-primary"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right Action Menu */}
        <div className="flex items-center gap-2">
          {/* Quick Stats shortcut */}
          <Link
            to="/audit"
            title="Security Audit"
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent hover:border-border-custom transition-all duration-200"
          >
            <Award className="h-5 w-5" />
          </Link>

          {/* Settings button */}
          <Link
            to="/settings"
            title="Settings"
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent hover:border-border-custom transition-all duration-200"
          >
            <Settings className="h-5 w-5" />
          </Link>

          <div className="h-6 w-px bg-border-custom mx-1 hidden xs:block" />

          {/* Quick Lock Button */}
          <button
            onClick={handleLock}
            title="Lock Vault (Ctrl+L)"
            className="p-2 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all duration-200 cursor-pointer"
          >
            <Lock className="h-5 w-5" />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
          </button>

          {/* User Profile Avatar */}
          <div 
            title={user.email}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent-purple/30 to-accent-cyan/30 border border-accent-purple/30 flex items-center justify-center font-bold text-sm text-white select-none hidden md:flex"
          >
            {user.email.substring(0, 2).toUpperCase()}
          </div>

        </div>

      </div>
    </nav>
  );
}
