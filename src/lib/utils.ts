import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formats a number as a price string with the currency symbol.
 * Defaults to Euro (€) and 2 decimal places.
 * Handles invalid inputs gracefully by returning "€0.00" or a fallback.
 *
 * @param amount - The amount to format.
 * @param currency - The currency symbol (default: '€').
 * @returns The formatted price string (e.g., "€10.00").
 */
export const formatPrice = (amount: number | string, currency: string = '€'): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num)) {
        return `${currency}0.00`;
    }
    return `${currency}${num.toFixed(2)}`;
};
