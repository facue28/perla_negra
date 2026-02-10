/**
 * Validates a phone number asynchronously to allow code splitting of the heavy libphonenumber-js library.
 * @param phone The phone number string to validate.
 * @returns A promise that resolves to true if the number is valid, false otherwise.
 */
export const validatePhoneAsync = async (phone: string): Promise<boolean> => {
    if (!phone || phone.trim() === '' || phone.trim() === '+') {
        return false;
    }

    try {
        // Dynamically import the library only when needed
        const { isValidPhoneNumber } = await import('libphonenumber-js');
        return isValidPhoneNumber(phone);
    } catch (error) {
        console.error('Error loading phone validation library:', error);
        // Fallback to basic validation if library fails to load
        return /^\+?[0-9]{8,15}$/.test(phone);
    }
};
