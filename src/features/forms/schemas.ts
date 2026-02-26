import { z } from 'zod';

/**
 * Esquema para el formulario de contacto básico.
 */
export const ContactSchema = z.object({
    nombre: z.string().min(2, 'Il nome deve avere almeno 2 caratteri').max(100, 'Il nome è troppo lungo'),
    apellido: z.string().optional(),
    email: z.string().email('Inserisci un indirizzo email valido').max(100, 'L\'email è troppo lunga'),
    mensaje: z.string().min(10, 'Il messaggio deve avere almeno 10 caratteri').max(2000, 'Il messaggio è troppo lungo'),
    trap: z.string().max(0, 'Bot detected').optional(), // Honeypot
    turnstileToken: z.string().min(1, 'Token Turnstile mancante')
});

export type ContactFormData = z.infer<typeof ContactSchema>;

/**
 * Esquema para el formulario de rivenditore (socios).
 */
export const ResellerSchema = z.object({
    nombre: z.string().min(2, 'Il nome è obbligatorio').max(100),
    cognome: z.string().min(2, 'Il cognome è obbligatorio').max(100),
    email: z.string().email('Email non valida').max(100),
    telefono: z.string().min(6, 'Telefono non valido').max(30),
    provincia: z.string().min(1, 'Seleziona una provincia'),
    citta: z.string().min(1, 'La città è obbligatoria'),
    conoscenza: z.string().min(1, 'Seleziona un\'opzione'),
    messaggio: z.string().max(2000).optional(),
    trap: z.string().max(0, 'Bot detected').optional(),
    turnstileToken: z.string().min(1, 'Token Turnstile mancante')
});

export type ResellerFormData = z.infer<typeof ResellerSchema>;

/**
 * Esquema para el checkout (validación avanzada).
 */
export const CheckoutSchema = z.object({
    nombre: z.string().min(2, 'Il nome è obbligatorio'),
    telefono: z.string().min(6, 'Telefono non valido'),
    email: z.string().email('Email non valida'),
    // Base fields allow empty strings, validation is conditional below
    indirizzo: z.string(),
    civico: z.string(),
    dettagli: z.string().optional(),
    citta: z.string(),
    provincia: z.string(),
    cap: z.string(),
    note: z.string().max(500).optional().refine(val => !val || !/(http|https|www\.|ftp)/i.test(val), {
        message: 'I link non sono consentiti nelle note'
    }),
    metodoEnvio: z.enum(['Spedizione a domicilio', 'Ritiro in sede (Verbania)']),
    website: z.string().max(0, 'Bot detected').optional(), // Honeypot
    turnstileToken: z.string().min(1, 'Token Turnstile mancante')
}).superRefine((data, ctx) => {
    if (data.metodoEnvio === 'Spedizione a domicilio') {
        if (!data.indirizzo || data.indirizzo.length < 5) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "L'indirizzo è obbligatorio",
                path: ["indirizzo"]
            });
        }
        if (!data.civico || data.civico.length < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Il civico è obbligatorio",
                path: ["civico"]
            });
        }
        if (!data.citta || data.citta.length < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La città è obbligatoria",
                path: ["citta"]
            });
        }
        if (!data.provincia || data.provincia.length !== 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Provincia (2 lettere)",
                path: ["provincia"]
            });
        }
        if (!data.cap || !/^\d{5}$/.test(data.cap)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "CAP non valido (5 cifre)",
                path: ["cap"]
            });
        }
    }
});

export type CheckoutFormData = z.infer<typeof CheckoutSchema>;
