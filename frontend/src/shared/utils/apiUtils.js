/**
 * Parses the fetch response gracefully.
 * Handles both JSON and plain text error responses.
 * 
 * @param {Response} response - The fetch Response object
 * @returns {Promise<any>} The parsed JSON data
 * @throws {Error} If response is not ok or not JSON
 */
export const parseJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${body}`);
  }
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const body = await response.text();
  throw new Error(`Expected JSON response but got ${contentType}: ${body}`);
};
