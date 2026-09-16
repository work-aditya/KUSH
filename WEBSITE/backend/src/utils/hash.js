const argon2 = require('argon2');

/**
 * Hash password using Argon2id algorithm
 * @param {string} password - Plaintext password
 * @returns {Promise<string>} - Argon2id hash string
 */
const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Valid password string required for hashing');
  }
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
};

/**
 * Verify password against Argon2id hash
 * @param {string} hash - Stored hash
 * @param {string} password - Input plaintext password
 * @returns {Promise<boolean>} - True if matching, false otherwise
 */
const verifyPassword = async (hash, password) => {
  if (!hash || !password) return false;
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
};
