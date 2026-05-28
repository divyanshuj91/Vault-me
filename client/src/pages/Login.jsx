import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Fingerprint, Loader2 } from 'lucide-react';
import StrengthMeter from '../components/StrengthMeter.jsx';

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-[440px]">
        <div className="glass-card-heavy p-10 flex flex-col items-center">

          {/* Header: Shield icon + title */}
          <header className="text-center mb-10 w-full">
            <div className="mb-2 flex justify-center">
              <div className="w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center bg-[#121212] mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-medium text-white mb-1">
              {isLoginMode ? 'Vault Locked' : 'Create Vault'}
            </h1>
            <p className="text-[14px] text-[#737373]">Your sovereign password manager</p>

            {/* Tab toggle: underline style */}
            <div className="flex justify-center gap-6 mt-6">
              <button
                onClick={() => setIsLoginMode(true)}
                className={`pb-1 text-sm font-medium transition-all cursor-pointer ${
                  isLoginMode
                    ? 'text-white border-b border-white'
                    : 'text-[#8e9192] hover:text-white border-b border-transparent'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLoginMode(false)}
                className={`pb-1 text-sm font-medium transition-all cursor-pointer ${
                  !isLoginMode
                    ? 'text-white border-b border-white'
                    : 'text-[#8e9192] hover:text-white border-b border-transparent'
                }`}
              >
                Register
              </button>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="label-caps block">EMAIL_ADDRESS</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@domain.com"
                className="obsidian-input"
              />
            </div>

            {/* Master Password Field */}
            <div className="space-y-1">
              <label className="label-caps block">MASTER_PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="obsidian-input pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-3 text-[#8e9192] hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar - 2px, white fill */}
              {!isLoginMode && password && (
                <div className="pt-2">
                  <StrengthMeter password={password} showFeedback={false} />
                </div>
              )}
            </div>

            {/* Confirm Password (only register) */}
            {!isLoginMode && (
              <div className="space-y-1">
                <label className="label-caps block">CONFIRM_PASSWORD</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="obsidian-input"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLoginMode ? 'UNLOCKING...' : 'CREATING...'}
                </>
              ) : isLoginMode ? (
                'UNLOCK VAULT'
              ) : (
                'CREATE VAULT'
              )}
            </button>
          </form>

          {/* Biometric unlock (Login mode only) */}
          {isLoginMode && (
            <div className="w-full mt-4">
              <button
                onClick={handleBiometric}
                className="btn-secondary w-full flex items-center justify-center gap-2 py-3 text-[11px] uppercase tracking-widest"
              >
                <Fingerprint className="h-4 w-4" />
                Unlock with Biometrics
              </button>
            </div>
          )}

          {/* Toggle Login/Register */}
          <div className="text-center mt-6">
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="label-caps text-[#8e9192] hover:text-white transition-colors cursor-pointer"
            >
              {isLoginMode ? "Don't have a vault? Sign up" : 'Already have a vault? Log in'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
