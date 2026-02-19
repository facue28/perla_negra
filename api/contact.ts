import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const ContactSchema = z.object({
    nombre: z.string().min(2).max(100),
    email: z.string().email().max(100),
    mensaje: z.string().min(10).max(2000),
    trap: z.string().max(0).optional(),
    turnstileToken: z.string().min(1)
});

// Variables moved inside handler for better serverless compatibility

import { getBaseTemplate } from './lib/email-templates.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const {
        TURNSTILE_SECRET_KEY,
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS,
        EMAIL_TO
    } = process.env;

    const SMTP_PORT_INT = parseInt(SMTP_PORT || '465');

    console.log('API Contact called');

    try {
        const validatedData = ContactSchema.parse(req.body);

        const params = new URLSearchParams();
        params.append('secret', TURNSTILE_SECRET_KEY || '');
        params.append('response', validatedData.turnstileToken);
        const remoteIp = Array.isArray(req.headers['x-forwarded-for'])
            ? req.headers['x-forwarded-for'][0]
            : req.headers['x-forwarded-for'] || '';
        params.append('remoteip', remoteIp);

        const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: params
        });

        const verifyData = await verifyResponse.json();

        if (!verifyData.success) {
            return res.status(403).json({
                error: 'Verificasione bot fallida (Turnstile)',
                details: verifyData['error-codes']
            });
        }

        if (validatedData.trap) {
            return res.status(403).json({ error: 'Spam detected' });
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT_INT,
            secure: SMTP_PORT_INT === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        });

        const emailContent = `
            <div style="text-align: center;">
                <h2 style="margin-bottom: 10px;">Nuovo Messaggio Ricevuto</h2>
                <p>Hai ricevuto un nuevo contacto dal sito <span class="accent">Perla Negra</span>.</p>
            </div>

            <div class="card">
                <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em;">Dettagli del Mittente</h3>
                <p style="margin-bottom: 5px;"><strong style="color: #FFFFFF;">Nome:</strong> ${validatedData.nombre}</p>
                <p style="margin-top: 0;"><strong style="color: #FFFFFF;">Email:</strong> <a href="mailto:${validatedData.email}" style="color: #3FFFC1; text-decoration: none;">${validatedData.email}</a></p>
            </div>

            <div class="card">
                <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em;">Messaggio</h3>
                <div style="white-space: pre-wrap; color: #D1D5D4; font-style: italic; border-left: 2px solid #3FFFC1; padding-left: 15px; margin: 10px 0;">
                    "${validatedData.mensaje}"
                </div>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <a href="mailto:${validatedData.email}" class="btn">Rispondi al Cliente</a>
            </div>
        `;

        const mailOptions = {
            from: `"Perla Negra Contact" <${SMTP_USER}>`,
            to: EMAIL_TO,
            replyTo: validatedData.email,
            subject: `Messaggio da ${validatedData.nombre} - Perla Negra`,
            html: getBaseTemplate(emailContent, `Nuovo Messaggio da ${validatedData.nombre}`)
        };

        await transporter.sendMail(mailOptions);

        // 5. Log de éxito minimalista (sin PII)
        console.info(`[Form Success] Contact form sent successfully. Status: 200`);

        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('[API Error Detail]:', error);

        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Dati non validi', details: error.errors });
        }

        // Ensure we always return JSON
        return res.status(500).json({
            error: 'Errore interno del server',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
