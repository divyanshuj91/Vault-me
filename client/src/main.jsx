import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Context Providers
import { ToastProvider } from './components/Toast.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { VaultProvider } from './context/VaultContext.jsx';

// Secondary wrapper to construct correct nesting tree:
// 1. ToastProvider (global notifications)
// 2. AuthProvider (user session & cryptographic keys)
// 3. VaultProvider (vault operations, decryption state, breach audits)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <VaultProvider>
          <App />
        </VaultProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>,
);
