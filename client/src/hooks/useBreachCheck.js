import { useState } from 'react';
import api from '../utils/api.js';
import CryptoJS from 'crypto-js';

/**
 * Hook to manually query HIBP breach status for a single password
 */
export function useBreachCheck() {
  const [isLoading, setIsLoading] = useState(false);
  const [breachData, setBreachData] = useState({ checked: false, isBreached: false, count: 0 });

  const checkBreach = async (password) => {
    if (!password) return { isBreached: false, count: 0 };
    setIsLoading(true);

    try {
      // 1. Calculate SHA-1 hex hash
      const sha1 = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex).toUpperCase();
      const prefix = sha1.substring(0, 5);
      const suffix = sha1.substring(5);

      // 2. Fetch from proxy endpoint
      const res = await api.get(`/audit/check-breach/${prefix}`);
      const data = res.data; // Raw text lines
      
      const lines = data.split('\n');
      let isBreached = false;
      let count = 0;

      for (const line of lines) {
        const parts = line.trim().split(':');
        if (parts[0] === suffix) {
          isBreached = true;
          count = Number(parts[1]) || 0;
          break;
        }
      }

      const result = { checked: true, isBreached, count };
      setBreachData(result);
      return result;
    } catch (err) {
      console.error('Password breach check failed:', err);
      const errorResult = { checked: true, isBreached: false, count: 0, error: true };
      setBreachData(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setBreachData({ checked: false, isBreached: false, count: 0 });
  };

  return {
    isLoading,
    checked: breachData.checked,
    isBreached: breachData.isBreached,
    count: breachData.count,
    error: breachData.error,
    checkBreach,
    reset
  };
}
