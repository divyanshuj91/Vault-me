import CryptoJS from 'crypto-js';

/**
 * Derives a 256-bit encryption key and an auth hash from the master password and salt.
 * @param {string} masterPassword Plaintext master password
 * @param {string} salt Hex-encoded salt
 * @returns {{encryptionKey: string, authHash: string}}
 */
export function deriveKeyAndHash(masterPassword, salt) {
  if (!masterPassword || !salt) {
    throw new Error('Master password and salt are required for key derivation.');
  }

  // Derive standard 256-bit encryption key (8 words) using PBKDF2
  const derivedKey = CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256 / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256
  });

  const encryptionKeyHex = derivedKey.toString(CryptoJS.enc.Hex);

  // Derive auth hash by running SHA-256 on derived key concatenated with master password
  // This auth hash will be sent to the server for authentication
  const authHash = CryptoJS.SHA256(encryptionKeyHex + masterPassword).toString(CryptoJS.enc.Hex);

  return {
    encryptionKey: encryptionKeyHex,
    authHash
  };
}

/**
 * Encrypts a plaintext string using AES-256 with the derived key.
 * @param {string} plaintext Plain text to encrypt
 * @param {string} key Hex-encoded key
 * @returns {string} Encrypted cipher text (base64 string)
 */
export function encryptData(plaintext, key) {
  if (!plaintext) return '';
  if (!key) throw new Error('Encryption key is required.');

  // CryptoJS accepts hex string or WordArray
  const ciphertext = CryptoJS.AES.encrypt(plaintext, key).toString();
  return ciphertext;
}

/**
 * Decrypts a ciphertext string using AES-256 with the derived key.
 * @param {string} ciphertext Encrypted cipher text
 * @param {string} key Hex-encoded key
 * @returns {string} Plaintext string (returns empty string if decryption fails)
 */
export function decryptData(ciphertext, key) {
  if (!ciphertext) return '';
  if (!key) throw new Error('Decryption key is required.');

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

/**
 * Helper to generate a random 16-byte hex salt for registration
 * @returns {string} Hex-encoded random salt
 */
export function generateRandomSalt() {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}
