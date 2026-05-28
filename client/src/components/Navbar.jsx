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
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[#201f1f]/60 backdrop-blur-xl border-b border-[#444748] flex items-center px-6">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">

        {/* Logo Section */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group cursor-pointer flex-shrink-0">
          <div className="w-8 h-8 bg-white flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-black" />
          </div>
          <span className="hidden sm:inline font-bold text-lg tracking-wide">
            <span className="text-white">Vault</span><span className="text-[#8e9192]">me</span>
          </span>
        </Link>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#8e9192]">
            <Search className="h-4 w-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search vault (Ctrl+K)"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-10 py-2 bg-black border border-[#444748] text-white text-sm placeholder-[#444748] focus:outline-none focus:border-white transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 inset-y-0 flex items-center text-xs text-[#8e9192] hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right Action Menu */}
        <div className="flex items-center gap-1">
          {/* Security Audit shortcut */}
          <Link
            to="/audit"
            title="Security Audit"
            className="p-2 text-[#8e9192] hover:text-white transition-colors duration-200"
          >
            <Award className="h-5 w-5" />
          </Link>

          {/* Settings button */}
          <Link
            to="/settings"
            title="Settings"
            className="p-2 text-[#8e9192] hover:text-white transition-colors duration-200"
          >
            <Settings className="h-5 w-5" />
          </Link>

          <div className="h-5 w-px bg-[#444748] mx-1" />

          {/* Quick Lock Button */}
          <button
            onClick={handleLock}
            title="Lock Vault (Ctrl+L)"
            className="p-2 text-[#8e9192] hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <Lock className="h-5 w-5" />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-[#8e9192] hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
          </button>

          {/* User Profile Avatar */}
          <div
            title={user.email}
            className="h-8 w-8 bg-white flex items-center justify-center font-bold text-xs text-black select-none hidden md:flex ml-1"
          >
            {user.email.substring(0, 2).toUpperCase()}
          </div>
        </div>

      </div>
    </header>
  );
}
