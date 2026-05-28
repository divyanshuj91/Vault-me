import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, UserPlus, LogIn, Fingerprint, Loader2 } from 'lucide-react';
import StrengthMeter from '../components/StrengthMeter.jsx';
import { motion } from 'framer-motion';

export default function Login() {
  const { login, register } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    if (!isLoginMode && password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (isLoginMode) {
        // Login Flow
        await login(email, password);
        showToast('Access granted. Vault unlocked!', 'success');
        navigate('/dashboard');
      } else {
        // Registration Flow
        if (password.length < 8) {
          showToast('Master password must be at least 8 characters long.', 'warning');
          setIsLoading(false);
          return;
        }
        await register(email, password);
        showToast('Vault created! Logging in...', 'success');
        
        // Auto-login after registration
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.error || 'Authentication failed. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometric = () => {
    showToast('Biometric unlock initialized. Simulation only.', 'info');
  };

  return (
    <div className="relative min-h-[90vh] w-full flex items-center justify-center p-4 overflow-hidden">
      
      {/* Floating Animated Gradient Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-accent-purple/10 blur-[90px] animate-blob-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent-cyan/10 blur-[100px] animate-blob-2 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo and Tagline */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-cyan text-white shadow-xl shadow-accent-purple/20 mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Smart<span className="text-accent-purple font-black">Vault</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1.5 font-medium tracking-wide">
            Your vault. Your rules.
          </p>
        </div>

        {/* Auth Glassmorphism Card */}
        <div className="glass-card p-8 bg-card-bg/60 border-border-custom/50 shadow-2xl relative">
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            {isLoginMode ? (
              <>
                <LogIn className="h-5 w-5 text-accent-purple" /> Unlock Vault
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-accent-cyan" /> Create Master Account
              </>
            )}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-custom bg-primary-bg/50 text-text-primary text-sm focus:outline-none focus:border-accent-purple transition-all duration-300"
              />
            </div>

            {/* Master Password Field */}
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Master Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              
              {/* Strength indicator in registration mode */}
              {!isLoginMode && password && (
                <div className="pt-1">
                  <StrengthMeter password={password} showFeedback={true} />
                </div>
              )}
            </div>

            {/* Confirm Password (only register) */}
            {!isLoginMode && (
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Confirm Master Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-custom bg-primary-bg/50 text-text-primary text-sm font-mono focus:outline-none focus:border-accent-purple transition-all duration-300"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-white text-sm font-bold shadow-lg shadow-accent-purple/20 hover:shadow-accent-purple/40 hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Unlocking...
                </>
              ) : isLoginMode ? (
                <>
                  <Lock className="h-4 w-4" /> Unlock Vault
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-border-custom/50" />
            <span className="text-[10px] text-text-muted px-3 uppercase tracking-wider font-semibold">Or</span>
            <div className="flex-1 h-px bg-border-custom/50" />
          </div>

          {/* Biometric unlock (Login mode only) */}
          {isLoginMode && (
            <button
              onClick={handleBiometric}
              className="w-full py-2.5 rounded-xl border border-border-custom bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer mb-4"
            >
              <Fingerprint className="h-5 w-5 text-accent-cyan" />
              Unlock with Biometrics
            </button>
          )}

          {/* Toggle Login/Register Mode */}
          <div className="text-center text-xs">
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-text-muted hover:text-text-primary transition-colors hover:underline cursor-pointer"
            >
              {isLoginMode ? "Don't have a vault yet? Sign up" : 'Already have a vault? Log in'}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
