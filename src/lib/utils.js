/**
 * Formats a number as a price string with the currency symbol.
 * Defaults to Euro (€) and 2 decimal places.
 * Handles invalid inputs gracefully by returning "€0.00" or a fallback.
 *
 * @param {number|string} amount - The amount to format.
 * @param {string} currency - The currency symbol (default: '€').
 * @returns {string} The formatted price string (e.g., "€10.00").
 */
export const formatPrice = (amount, currency = '€') => {
    const num = parseFloat(amount);
    if (isNaN(num)) {
        return `${currency}0.00`;
    }
    return `${currency}${num.toFixed(2)}`;
};
