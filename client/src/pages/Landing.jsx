import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Key, RefreshCw, Server, ArrowRight, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

const Github = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function Landing() {
  const { token } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-[#e5e2e1] font-sans selection:bg-white selection:text-black">
      
      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-black/80 backdrop-blur-xl border-b border-[#444748] flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white flex items-center justify-center">
              <Shield className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg tracking-wide">
              <span className="text-white">Vault</span><span className="text-[#8e9192]">me</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/divyanshuj91/Vault-me" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 text-[#8e9192] hover:text-white transition-colors"
              title="GitHub Repository"
            >
              <Github className="h-5 w-5" />
            </a>
            {token ? (
              <Link to="/dashboard" className="btn-primary flex items-center gap-1.5 py-2.5 px-5">
                DASHBOARD <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link to="/login" className="btn-primary py-2.5 px-5">
                ACCESS VAULT
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden flex flex-col items-center text-center">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="label-caps tracking-[0.2em] text-[#8e9192] px-3 py-1 border border-[#444748] inline-block bg-black">
            Zero-Knowledge. Local-First.
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Your secrets, kept <br />
            <span className="text-[#8e9192]">strictly in-memory.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#8e9192] max-w-2xl mx-auto leading-relaxed">
            Vaultme derives keys and performs standard AES-256 encryption strictly inside your browser. 
            No master password, salt, or unencrypted credential ever touches the cloud.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            {token ? (
              <Link to="/dashboard" className="btn-primary py-3.5 px-8 flex items-center gap-2">
                GO TO DASHBOARD <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-primary py-3.5 px-8 flex items-center gap-2">
                  GET STARTED NOW <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#architecture" className="btn-secondary py-3.5 px-8 flex items-center gap-2">
                  SECURITY SPEC
                </a>
              </>
            )}
          </div>
        </div>

        {/* Floating Mockup Card */}
        <div className="mt-16 w-full max-w-4xl mx-auto relative z-10 px-4">
          <div className="glass-card p-6 sm:p-8 bg-black/40 backdrop-blur-md border border-white/10 text-left">
            <div className="flex items-center justify-between border-b border-[#444748] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#444748]" />
                <div className="w-3 h-3 rounded-full bg-[#444748]" />
                <div className="w-3 h-3 rounded-full bg-[#444748]" />
              </div>
              <span className="label-caps text-[#8e9192] font-mono text-[10px]">vaultme_core_v1.0.0</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs text-[#8e9192] leading-relaxed">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-white block font-bold">// Cryptographic Key Derivation (PBKDF2)</span>
                  <span>$ const salt = CryptoJS.lib.WordArray.random(16);</span>
                  <br />
                  <span>$ const derivedKey = CryptoJS.PBKDF2(masterPassword, salt, &#123;</span>
                  <span className="pl-4 block">keySize: 256/32,</span>
                  <span className="pl-4 block">iterations: 10000,</span>
                  <span className="pl-4 block">hasher: CryptoJS.algo.SHA256</span>
                  <span>&#125;);</span>
                </div>
                <div className="p-3.5 bg-[#131313] border border-[#444748] text-white">
                  <span className="text-[#8e9192] uppercase font-bold text-[9px] block mb-1">Active Memory Buffer</span>
                  <span>key_hex: 7e93a61d02c4fbc87e61a... [IN_MEMORY]</span>
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-white block font-bold">// Client-Side Zero-Knowledge Encryption</span>
                  <span>$ const ciphertext = CryptoJS.AES.encrypt(rawSecret, key).toString();</span>
                  <br />
                  <span className="text-white">// Transmission Payload:</span>
                  <span className="block text-white bg-black/60 p-2.5 border border-[#444748]/50 break-all select-none">
                    U2FsdGVkX19s1tW+lXv2JmFv4gLp4o2H5S3KzR6D9j0=
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-4 w-4 text-[#8e9192]" />
                  <span>Server receives encrypted blobs only.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-[#444748]/30">
        <div className="text-center space-y-3 mb-16">
          <span className="label-caps text-[#8e9192]">Built for Security</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Core Cryptographic Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="glass-card p-8 bg-black/40 hover:border-white transition-all duration-300 space-y-4">
            <div className="w-10 h-10 bg-[#131313] border border-[#444748] flex items-center justify-center text-white">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero-Knowledge Storage</h3>
            <p className="text-sm text-[#8e9192] leading-relaxed">
              We never see your passwords. Encryption and decryption occur locally on your machine using your derived secret key.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8 bg-black/40 hover:border-white transition-all duration-300 space-y-4">
            <div className="w-10 h-10 bg-[#131313] border border-[#444748] flex items-center justify-center text-white">
              <Key className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Hardened Key Derivation</h3>
            <p className="text-sm text-[#8e9192] leading-relaxed">
              PBKDF2 with 10,000 iterations hashes your master password, generating a deterministic, secure key that stays strictly in volatile memory.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8 bg-black/40 hover:border-white transition-all duration-300 space-y-4">
            <div className="w-10 h-10 bg-[#131313] border border-[#444748] flex items-center justify-center text-white">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">k-Anonymity Breach Auditing</h3>
            <p className="text-sm text-[#8e9192] leading-relaxed">
              Check if your credentials have been leaked in past breaches by querying HIBP with only the first 5 characters of your password's SHA-1 hash.
            </p>
          </div>

        </div>
      </section>

      {/* Technical Architecture Section */}
      <section id="architecture" className="py-20 bg-[#131313]/30 border-t border-[#444748]/30 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="label-caps text-[#8e9192]">Technical Blueprint</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                How Vaultme Keeps You Safe
              </h2>
              <p className="text-sm sm:text-base text-[#8e9192] leading-relaxed">
                Most cloud password managers require you to trust their server configurations and security boundaries. 
                Vaultme flips this model on its head by keeping all critical functions client-side.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Ephemeral Memory Buffer</h4>
                    <p className="text-xs text-[#8e9192] mt-1">
                      The encryption key is kept strictly as a React state variable. If the window closes, the memory is wiped immediately.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Automated Vault Locking</h4>
                    <p className="text-xs text-[#8e9192] mt-1">
                      Our system monitors mouse movements, keystrokes, and clicks. If no activity is detected within your defined window, the keys are purged.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Clipboard Protection</h4>
                    <p className="text-xs text-[#8e9192] mt-1">
                      When you copy a password, the clipboard is automatically cleared and overwritten with empty data after exactly 30 seconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Card */}
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-white" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Vault Lifecycle Diagram</h3>
              </div>

              <div className="space-y-4 text-xs font-mono text-[#8e9192]">
                <div className="p-3 bg-black border border-[#444748] flex justify-between items-center text-white">
                  <span>1. User Login</span>
                  <span className="text-[10px] text-[#8e9192]">PBKDF2 Derived Key</span>
                </div>
                <div className="text-center py-1">↓</div>
                <div className="p-3 bg-black border border-[#444748] flex justify-between items-center text-white">
                  <span>2. Memory Buffer</span>
                  <span className="text-[10px] text-[#8e9192]">Key Saved in RAM</span>
                </div>
                <div className="text-center py-1">↓</div>
                <div className="p-3 bg-black border border-[#444748] flex justify-between items-center text-white">
                  <span>3. Decrypt Vault</span>
                  <span className="text-[10px] text-[#8e9192]">Local AES-256 Decryption</span>
                </div>
                <div className="text-center py-1">↓</div>
                <div className="p-3 bg-black border border-[#444748] flex justify-between items-center text-white">
                  <span>4. Lock Timer Fired</span>
                  <span className="text-[10px] text-white">Purge Key from RAM</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#444748]/30 py-12 px-6 bg-black text-center text-xs text-[#8e9192] space-y-4">
        <div className="flex justify-center mb-2">
          <div className="w-8 h-8 bg-[#131313] border border-[#444748] flex items-center justify-center text-white">
            <Shield className="h-4 w-4" />
          </div>
        </div>
        <p className="font-mono">Vaultme Zero-Knowledge Protocol v1.0.0</p>
        <p>© {new Date().getFullYear()} Vaultme. Developed with sovereign encryption principles.</p>
      </footer>

    </div>
  );
}
