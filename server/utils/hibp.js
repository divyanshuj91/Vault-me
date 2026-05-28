import fetch from 'node-fetch'; // Importing node-fetch just in case, but global fetch is also available.

/**
 * Checks HaveIBeenPwned API for the matching SHA-1 suffixes
 * @param {string} prefix First 5 characters of the SHA-1 hash
 * @returns {Promise<string>} Plain text list of suffixes and counts
 */
export async function getPwnedRange(prefix) {
  if (!prefix || prefix.length !== 5) {
    throw new Error('Prefix must be exactly 5 characters of a SHA-1 hash.');
  }

  const url = `https://api.pwnedpasswords.com/range/${prefix}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Vaultme-App'
      }
    });

    if (!response.ok) {
      throw new Error(`HIBP API returned status: ${response.status}`);
    }

    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error fetching from HIBP API:', error);
    throw error;
  }
}
