const isDev = import.meta.env.DEV;

const sanitizeContext = (context) => {
    if (!context) return {};

    // Lista de claves sensibles a redacción
    const sensitiveKeys = ['phone', 'email', 'nombre', 'fullName', 'address', 'indirizzo', 'civico', 'cap', 'citta'];

    const sanitized = { ...context };

    // Redactar claves directas
    sensitiveKeys.forEach(key => {
        if (key in sanitized) {
            sanitized[key] = '[REDACTED]';
        }
    });

    // Casos especiales anidados
    if (sanitized.customerInfo) {
        sanitized.customerInfo = { ...sanitized.customerInfo };
        sensitiveKeys.forEach(key => {
            if (key in sanitized.customerInfo) {
                sanitized.customerInfo[key] = '[REDACTED]';
            }
        });
    }

    return sanitized;
};

export const logger = {
    debug: (message, data = {}) => {
        if (isDev) {
            console.log(`[DEBUG] ${message}`, data);
        }
    },

    info: (message, data = {}) => {
        if (isDev) {
            console.info(`[INFO] ${message}`, data);
        }
    },

    error: (message, error, context = {}) => {
        const safeContext = sanitizeContext(context);

        const errorData = {
            message,
            originalError: error?.message || error,
            stack: isDev ? error?.stack : undefined,
            context: safeContext,
            timestamp: new Date().toISOString()
        };

        console.error(`[ERROR] ${message}`, errorData);

        // Aquí se podría integrar Sentry u otro servicio de monitoreo en el futuro
    }
};
