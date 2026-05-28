/**
 * Analyzes a password's strength based on entropy, length, and character variety.
 * @param {string} password The password to analyze
 * @returns {{
 *   score: number, // 0 to 4
 *   label: string,
 *   color: string,
 *   entropy: number,
 *   feedback: string[]
 * }}
 */
export function analyzePassword(password) {
  if (!password) {
    return {
      score: 0,
      label: 'Empty',
      color: 'text-text-muted bg-border-custom',
      entropy: 0,
      feedback: ['Enter a password to check its strength.']
    };
  }

  const length = password.length;
  let poolSize = 0;
  const feedback = [];

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  if (hasLower) poolSize += 26;
  else feedback.push('Add lowercase letters');

  if (hasUpper) poolSize += 26;
  else feedback.push('Add uppercase letters');

  if (hasDigit) poolSize += 10;
  else feedback.push('Add numbers');

  if (hasSymbol) poolSize += 33; // Approx symbol set size
  else feedback.push('Add special characters');

  if (length < 8) {
    feedback.push('Make password at least 8 characters long');
  }

  // Calculate Shannon entropy: E = L * log2(R)
  const entropy = Math.round(length * (Math.log(poolSize || 1) / Math.log(2)));

  // Determine score based on entropy and length caps
  let score = 0;
  if (length >= 8) {
    if (entropy >= 80 && hasLower && hasUpper && hasDigit && hasSymbol) {
      score = 4; // Very Strong
    } else if (entropy >= 60) {
      score = 3; // Strong
    } else if (entropy >= 45) {
      score = 2; // Good / Fair
    } else if (entropy >= 25) {
      score = 1; // Weak
    }
  }

  // Enforce harsh caps for short passwords
  if (length < 8) score = 0;
  else if (length < 10 && score > 2) score = 2;

  // Map score to label and styling
  let label = 'Weak';
  let color = 'bg-red-500/20 text-red-400 border border-red-500/30';
  
  switch (score) {
    case 1:
      label = 'Fair';
      color = 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      break;
    case 2:
      label = 'Good';
      color = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      break;
    case 3:
      label = 'Strong';
      color = 'bg-green-500/20 text-green-400 border border-green-500/30';
      break;
    case 4:
      label = 'Very Strong';
      color = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      break;
  }

  return {
    score,
    label,
    color,
    entropy,
    feedback: feedback.slice(0, 3) // Max 3 suggestions
  };
}
