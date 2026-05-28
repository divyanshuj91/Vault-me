import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Custom hook to monitor user inactivity and automatically lock the vault.
 */
export function useAutoLock() {
  const { lock, autoLockTime, token, isLocked } = useAuth();
  const timeoutRef = useRef(null);

  useEffect(() => {
    // If user is not logged in, or already locked, or auto-lock is set to 'never' (-1 or 0)
    if (!token || isLocked || autoLockTime <= 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Convert autoLockTime in minutes to milliseconds
      const timeoutMs = autoLockTime * 60 * 1000;
      
      timeoutRef.current = setTimeout(() => {
        console.log('Vault auto-locked due to user inactivity.');
        lock();
      }, timeoutMs);
    };

    // User activity events to listen to
    const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];

    // Initialize timer
    resetTimer();

    // Bind event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup on unmount/re-bind
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [token, isLocked, autoLockTime, lock]);
}
