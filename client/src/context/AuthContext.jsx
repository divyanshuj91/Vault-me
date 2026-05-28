import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api.js';
import { deriveKeyAndHash, generateRandomSalt } from '../utils/encryption.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [encryptionKey, setEncryptionKey] = useState(null); // In-memory ONLY
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings
  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || 'purple');
  const [autoLockTime, setAutoLockTime] = useState(Number(localStorage.getItem('autoLockTime')) || 5); // minutes

  // Handle unauthorized event from api.js interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  // Update root HTML class for dynamic theme accent color
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-purple', 'theme-cyan', 'theme-rose', 'theme-amber');
    root.classList.add(`theme-${themeColor}`);
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  // Save auto-lock time
  useEffect(() => {
    localStorage.setItem('autoLockTime', autoLockTime);
  }, [autoLockTime]);

  // Initial user recovery from token
  useEffect(() => {
    async function restoreSession() {
      if (token) {
        try {
          // Verify token works by hitting the health check or fetching user
          // For simplicity, we decode JWT (or verify it implicitly on first vault fetch)
          // We can fetch the user details or just trust the JWT payload
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          
          setUser({ id: payload.id, email: payload.email });
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      }
      setIsLoading(false);
    }
    restoreSession();
  }, [token]);

  /**
   * Registers a user by generating salt, deriving key/hash, and uploading to server
   */
  const register = async (email, masterPassword) => {
    const salt = generateRandomSalt();
    const { authHash } = deriveKeyAndHash(masterPassword, salt);

    await api.post('/auth/register', {
      email,
      authHash,
      salt
    });
  };

  /**
   * Logs in a user, derives the vault encryption key, and saves JWT
   */
  const login = async (email, masterPassword) => {
    // 1. Fetch the user's salt
    const saltRes = await api.get(`/auth/salt?email=${encodeURIComponent(email)}`);
    const { salt } = saltRes.data;

    // 2. Derive key and authHash
    const { encryptionKey: derivedKey, authHash } = deriveKeyAndHash(masterPassword, salt);

    // 3. Login with authHash
    const response = await api.post('/auth/login', {
      email,
      authHash
    });

    const { token: jwtToken, user: userData } = response.data;
    
    // 4. Save credentials
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setEncryptionKey(derivedKey);
    setIsLocked(false);

    return { userData };
  };

  /**
   * Unlocks the vault by deriving the key again (for locked screen)
   */
  const unlock = async (masterPassword) => {
    if (!user) return false;

    try {
      const saltRes = await api.get(`/auth/salt?email=${encodeURIComponent(user.email)}`);
      const { salt } = saltRes.data;

      const { encryptionKey: derivedKey, authHash } = deriveKeyAndHash(masterPassword, salt);

      // Verify the authHash by calling login (or we can just verify it by checking if it decrypts successfully)
      // Query server login endpoint with the derived authHash to ensure it's correct
      await api.post('/auth/login', {
        email: user.email,
        authHash
      });

      setEncryptionKey(derivedKey);
      setIsLocked(false);
      return true;
    } catch (error) {
      console.error('Vault unlock failed:', error);
      return false;
    }
  };

  /**
   * Locks the vault by wiping the in-memory key (user session remains active)
   */
  const lock = () => {
    setEncryptionKey(null);
    setIsLocked(true);
  };

  /**
   * Full logout (wipes token and key)
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setEncryptionKey(null);
    setIsLocked(true);
  };

  /**
   * Updates master password, re-encrypting all current vault items
   */
  const changeMasterPassword = async (currentMasterPassword, newMasterPassword, decryptedCredentials) => {
    if (!user || !encryptionKey) throw new Error('Session is locked or inactive.');

    // 1. Fetch current salt
    const saltRes = await api.get(`/auth/salt?email=${encodeURIComponent(user.email)}`);
    const { salt: currentSalt } = saltRes.data;

    // 2. Derive current hashes
    const { authHash: currentAuthHash } = deriveKeyAndHash(currentMasterPassword, currentSalt);

    // 3. Generate new salt and derive new hashes
    const newSalt = generateRandomSalt();
    const { encryptionKey: newKey, authHash: newAuthHash } = deriveKeyAndHash(newMasterPassword, newSalt);

    // 4. Update password on server
    await api.post('/auth/change-master-password', {
      currentAuthHash,
      newAuthHash,
      newSalt
    });

    // 5. Re-encrypt all items using the new key and prepare sync request
    // Note: decryptedCredentials must be passed in as argument (or retrieved from VaultContext)
    const CryptoJS = await import('crypto-js');
    const reEncrypted = decryptedCredentials.map(item => {
      return {
        siteName: CryptoJS.default.AES.encrypt(item.siteName, newKey).toString(),
        url: item.url ? CryptoJS.default.AES.encrypt(item.url, newKey).toString() : '',
        username: CryptoJS.default.AES.encrypt(item.username, newKey).toString(),
        password: CryptoJS.default.AES.encrypt(item.password, newKey).toString(),
        category: item.category ? CryptoJS.default.AES.encrypt(item.category, newKey).toString() : '',
        notes: item.notes ? CryptoJS.default.AES.encrypt(item.notes, newKey).toString() : '',
        lastChangedAt: new Date().toISOString()
      };
    });

    // 6. Bulk sync the newly encrypted credentials
    await api.post('/passwords/sync', { credentials: reEncrypted });

    // 7. Update active key
    setEncryptionKey(newKey);
    
    return true;
  };

  /**
   * Deletes the user account permanently
   */
  const deleteAccount = async (masterPassword) => {
    if (!user) throw new Error('Not logged in.');

    const saltRes = await api.get(`/auth/salt?email=${encodeURIComponent(user.email)}`);
    const { salt } = saltRes.data;
    const { authHash } = deriveKeyAndHash(masterPassword, salt);

    await api.delete('/auth/delete-account', {
      data: { authHash }
    });

    logout();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      encryptionKey,
      isLocked,
      isLoading,
      themeColor,
      autoLockTime,
      setThemeColor,
      setAutoLockTime,
      register,
      login,
      unlock,
      lock,
      logout,
      changeMasterPassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
