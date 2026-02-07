const isDev: boolean = import.meta.env.DEV;

interface LogContext {
    [key: string]: any;
}

const sanitizeContext = (context: LogContext): LogContext => {
    if (!context) return {};

    // Lista de claves sensibles a redacción
    const sensitiveKeys: string[] = ['phone', 'email', 'nombre', 'fullName', 'address', 'indirizzo', 'civico', 'cap', 'citta'];

    const sanitized: LogContext = { ...context };

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
    debug: (message: string, data: LogContext = {}): void => {
        if (isDev) {
            console.log(`[DEBUG] ${message}`, data);
        }
    },

    info: (message: string, data: LogContext = {}): void => {
        if (isDev) {
            console.info(`[INFO] ${message}`, data);
        }
    },

    error: (message: string, error: any, context: LogContext = {}): void => {
        const safeContext = sanitizeContext(context);

        const errorData = {
            message,
            originalError: error?.message || error,
            stack: isDev ? error?.stack : undefined,
            context: safeContext,
            timestamp: new Date().toISOString()
        };

        console.error(`[ERROR] ${message}`, errorData);
    }
};
