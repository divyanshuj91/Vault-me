import { useState, useEffect, useRef } from 'react';

/**
 * Hook to copy text to clipboard and automatically clear clipboard after 30 seconds for security.
 * @returns {[boolean, function]} [copiedStatus, copyFunction]
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const clearTimerRef = useRef(null);
  const visualTimerRef = useRef(null);

  const copyToClipboard = async (text) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // 1. Reset visual status indicator after 2 seconds
      if (visualTimerRef.current) {
        clearTimeout(visualTimerRef.current);
      }
      visualTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);

      // 2. Clear clipboard after 30 seconds for security
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
      clearTimerRef.current = setTimeout(async () => {
        try {
          // Verify clipboard still has our copied text before clearing
          const currentText = await navigator.clipboard.readText();
          if (currentText === text) {
            await navigator.clipboard.writeText('');
            console.log('Clipboard cleared for security.');
          }
        } catch (err) {
          // If reading clipboard fails (permissions or focus loss), just write empty string anyway
          await navigator.clipboard.writeText('');
        }
      }, 30000);

    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (visualTimerRef.current) clearTimeout(visualTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  return [copied, copyToClipboard];
}
