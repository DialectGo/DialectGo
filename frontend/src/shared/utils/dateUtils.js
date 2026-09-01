/**
 * Formats a Date object into a YYYY-MM-DD string for API submission.
 *
 * @param {Date} dateObj
 * @returns {string} e.g. "2003-07-15"
 */
export const formatBirthDate = (dateObj) =>
  dateObj instanceof Date ? dateObj.toISOString().split('T')[0] : '';

/**
 * Formats an ISO date string into a human-readable local date.
 * Used for displaying activity timestamps in lists.
 *
 * @param {string} isoString - ISO 8601 date string from backend
 * @returns {string} e.g. "8/20/2026"
 */
export const formatDateDisplay = (isoString) =>
  isoString ? new Date(isoString).toLocaleDateString() : '';

/**
 * Evaluates the local device time and returns the appropriate Cebuano greeting.
 * 
 * @returns {string} The greeting string
 */
export const getCebuanoGreeting = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) return 'Maayong Buntag,';
  if (currentHour >= 12 && currentHour < 18) return 'Maayong Hapon,';
  return 'Maayong Gabii,';
};

/**
 * Computes date ranges to determine the active streak days 
 * for the current week (Sunday to Saturday).
 * 
 * @param {Array<string>} activeDays - An array of ISO date strings representing streak days
 * @returns {Array<boolean>} An array of 7 booleans indicating whether the streak was kept each day of the week
 */
export const getWeeklyStatus = (activeDays = []) => {
  const status = [false, false, false, false, false, false, false];
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  sunday.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const tempDate = new Date(sunday);
    tempDate.setDate(sunday.getDate() + i);
    // Extract local YYYY-MM-DD instead of UTC to avoid timezone shift
    const year = tempDate.getFullYear();
    const month = String(tempDate.getMonth() + 1).padStart(2, '0');
    const day = String(tempDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    if (activeDays.includes(dateString)) {
      status[i] = true;
    }
  }
  return status;
};
