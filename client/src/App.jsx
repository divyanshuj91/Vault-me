import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useVault } from './context/VaultContext.jsx';
import { useAutoLock } from './hooks/useAutoLock.js';
import { Shield, Lock, Eye, EyeOff, LayoutDashboard, Key, Sparkles, Award, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from './components/Toast.jsx';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vault from './pages/Vault.jsx';
import Generator from './pages/Generator.jsx';
import Audit from './pages/Audit.jsx';
import Settings from './pages/Settings.jsx';

// Components
import Navbar from './components/Navbar.jsx';

function AppContent() {
  const { token, isLocked, logout } = useAuth();
  
  // Initialize inactivity auto-lock listener
  useAutoLock();

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />

      {/* Protected Routes Layout */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vault" element={<Vault />} />
        <Route path="generator" element={<Generator />} />
        <Route path="audit" element={<Audit />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

// Protected Route Wrapper with In-Place Unlock Screen
function ProtectedRoute() {
  const { token, isLocked, user, unlock, lock } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Keyboard Shortcuts (Ctrl+L to lock, Ctrl+K to search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + L (Lock Vault)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        lock();
        navigate('/login');
      }

      // Ctrl + K (Focus global search bar in Navbar)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search vault"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lock, navigate]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // If user is logged in, but vault is locked (no encryption key in-memory)
  if (isLocked) {
    return <UnlockScreen />;
  }

  // Unlocked & Logged In: Render Main Dashboard Layout with Sub-Navigation Links
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Dynamic Sub-Navigation Bar */}
      <div className="w-full px-6 py-2 border-b border-border-custom bg-card-bg/20">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none">
          <SubNavLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <SubNavLink to="/vault" icon={<Key className="h-4 w-4" />} label="Vault Items" />
          <SubNavLink to="/generator" icon={<Sparkles className="h-4 w-4" />} label="Generator" />
          <SubNavLink to="/audit" icon={<Award className="h-4 w-4" />} label="Security Audit" />
          <SubNavLink to="/settings" icon={<SettingsIcon className="h-4 w-4" />} label="Settings" />
        </div>
      </div>

      {/* Main content routing panel */}
      <main className="flex-1 w-full pb-16">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vault" element={<Vault />} />
          <Route path="generator" element={<Generator />} />
          <Route path="audit" element={<Audit />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

// Sub-Navigation Link Helper
function SubNavLink({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border flex-shrink-0 ${
        isActive
          ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/30 shadow-sm shadow-accent-purple/5'
          : 'bg-transparent text-text-secondary border-transparent hover:border-border-custom hover:text-text-primary'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// Vault Unlock Overlay Screen
function UnlockScreen() {
  const { user, unlock, logout } = useAuth();
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const showToast = useToast();

  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    if (!masterPassword) return;

    setIsUnlocking(true);
    const success = await unlock(masterPassword);
    setIsUnlocking(false);

    if (success) {
      showToast('Vault unlocked. Access restored.', 'success');
    } else {
      showToast('Incorrect master password.', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-primary-bg">
      {/* Glow blobs */}
      <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full bg-accent-purple/5 blur-[90px] pointer-events-none" />
      
      <div className="w-full max-w-sm glass-card p-8 bg-card-bg/60 border-border-custom/50 shadow-2xl relative text-center">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 animate-pulse">
          <Lock className="h-6 w-6" />
        </div>
        
        <h2 className="text-xl font-bold text-text-primary">Vault Locked</h2>
        <p className="text-xs text-text-secondary mt-1 max-w-[240px] mx-auto truncate" title={user?.email}>
          Logged in as: {user?.email}
        </p>

        <form onSubmit={handleUnlockSubmit} className="space-y-4 mt-6">
          <div className="space-y-1 text-left">
            <label className="text-[10px] text-text-secondary font-bold uppercase">Master Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-border-custom bg-primary-bg/50 text-text-primary text-sm font-mono focus:outline-none focus:border-accent-purple transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 inset-y-0 flex items-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUnlocking}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-white text-sm font-bold shadow-lg shadow-accent-purple/20 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isUnlocking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Unlocking...
              </>
            ) : (
              'Unlock Vault'
            )}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-border-custom/50" />
          <span className="text-[9px] text-text-muted px-3 uppercase tracking-wider font-semibold">Or</span>
          <div className="flex-1 h-px bg-border-custom/50" />
        </div>

        <button
          onClick={logout}
          className="text-xs text-red-400 hover:text-red-300 transition-colors hover:underline cursor-pointer font-semibold"
        >
          Switch Account / Log Out
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
