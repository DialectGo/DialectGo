/**
 * DialectGo — String Utilities
 *
 * Pure string manipulation helpers used across screens.
 * Import these instead of writing inline string logic in components.
 */

/**
 * Joins address parts into a single comma-separated string.
 * Skips empty/null values.
 *
 * @param {string} country
 * @param {string} province
 * @param {string} city
 * @returns {string}
 */
export const formatAddress = (country, province, city) =>
  [country, province, city].filter(Boolean).join(', ');

/**
 * Splits a comma-separated address string into [country, province, city].
 *
 * @param {string} addressString - e.g. "Philippines, Cavite, Dasmariñas"
 * @returns {string[]} [country, province, city]
 */
export const parseAddress = (addressString = '') =>
  addressString.split(',').map((s) => s.trim());

/**
 * Combines first and last name into a full name string.
 *
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
export const formatFullName = (firstName = '', lastName = '') =>
  `${firstName} ${lastName}`.trim();

/**
 * Derives a username from an email address (everything before the @).
 *
 * @param {string} email
 * @returns {string}
 */
export const deriveUsername = (email = '') => email.split('@')[0];

/**
 * Masks an email address for display (e.g. r***h@gmail.com).
 *
 * @param {string} email
 * @returns {string}
 */
export const maskEmail = (email = '') => {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  const masked = name[0] + '*'.repeat(Math.max(name.length - 2, 1)) + (name.length > 1 ? name[name.length - 1] : '');
  return `${masked}@${domain}`;
};

/**
 * Strips LLM model turn tags from raw model output.
 * Used to clean Groq/Gemma responses.
 *
 * @param {string} text - Raw model output string
 * @returns {string}
 */
export const stripModelTags = (text = '') =>
  text
    .replace(/<end_of_turn>/g, '')
    .replace(/<start_of_turn>/g, '')
    .trim();

/**
 * Strips the base64 data URL prefix and normalizes line endings
 * from a raw audio base64 string returned by the TTS API.
 *
 * @param {string} rawBase64 - Raw base64 string possibly with data URL prefix
 * @returns {string} Clean base64 string
 */
export const cleanBase64Audio = (rawBase64 = '') =>
  rawBase64
    .replace(/^data:audio\/(mp3|wav|m4a|aac);base64,/, '')
    .replace(/(\r\n|\n|\r)/gm, '');
