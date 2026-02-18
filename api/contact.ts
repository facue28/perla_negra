import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { ContactSchema } from '../src/features/forms/schemas';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_TO = process.env.EMAIL_TO || 'facundo.elias10@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 1. Validar Esquema Zod
        const validatedData = ContactSchema.parse(req.body);

        // 2. Validar Turnstile (Siteverify)
        const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${TURNSTILE_SECRET_KEY}&response=${validatedData.turnstileToken}&remoteip=${req.headers['x-forwarded-for']}`
        });

        const verifyData = await verifyResponse.json();
        if (!verifyData.success) {
            console.warn(`[Bot Detected] Turnstile failed for IP: ${req.headers['x-forwarded-for']}. Details:`, verifyData['error-codes']);
            return res.status(403).json({ error: 'Verificasione bot fallida (Turnstile)' });
        }

        // 3. Honeypot check (YA validado por Zod, pero reforzamos lógica)
        if (validatedData.trap) {
            console.warn(`[Bot Detected] Honeypot filled for IP: ${req.headers['x-forwarded-for']}`);
            return res.status(403).json({ error: 'Spam detected' });
        }

        // 4. Configurar SMTP y enviar
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        });

        const mailOptions = {
            from: `"Perla Negra Contact" <${SMTP_USER}>`,
            to: EMAIL_TO,
            replyTo: validatedData.email,
            subject: `Nuovo Messaggio da ${validatedData.nombre}`,
            text: `Nome: ${validatedData.nombre}\nEmail: ${validatedData.email}\nMessaggio:\n${validatedData.mensaje}`,
            html: `
        <h2>Nuovo Messaggio dal Sito</h2>
        <p><strong>Nome:</strong> ${validatedData.nombre}</p>
        <p><strong>Email:</strong> ${validatedData.email}</p>
        <p><strong>Messaggio:</strong></p>
        <div style="white-space: pre-wrap; padding: 10px; background: #f4f4f4;">${validatedData.mensaje}</div>
      `
        };

        await transporter.sendMail(mailOptions);

        // 5. Log de éxito minimalista (sin PII)
        console.info(`[Form Success] Contact form sent successfully. Status: 200`);

        return res.status(200).json({ success: true });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Dati non validi', details: error.errors });
        }
        console.error('[Internal Error]', error.message);
        return res.status(500).json({ error: 'Errore interno del server' });
    }
}
