import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { ResellerSchema } from '../src/features/forms/schemas';

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

    console.log('API Reseller called');
    try {
        const validatedData = ResellerSchema.parse(req.body);
        console.log('Zod validation success');

        const params = new URLSearchParams();
        params.append('secret', TURNSTILE_SECRET_KEY || '');
        params.append('response', validatedData.turnstileToken);
        const remoteIp = Array.isArray(req.headers['x-forwarded-for'])
            ? req.headers['x-forwarded-for'][0]
            : req.headers['x-forwarded-for'] || '';
        params.append('remoteip', remoteIp);

        console.log('Verifying Turnstile...');
        const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: params
        });

        const verifyData = await verifyResponse.json();
        console.log('Turnstile response:', verifyData);

        if (!verifyData.success) {
            console.warn(`[Bot Detected] Turnstile failed. Details:`, verifyData['error-codes']);
            return res.status(403).json({
                error: 'Verificacion bot fallida',
                details: verifyData['error-codes']
            });
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        });

        const mailOptions = {
            from: `"Perla Negra Reseller" <${SMTP_USER}>`,
            to: EMAIL_TO,
            replyTo: validatedData.email,
            subject: `Nuova Candidatura Rivenditore: ${validatedData.nombre} ${validatedData.cognome}`,
            html: `
        <h2>Candidatura Rivenditore / Collaboratore</h2>
        <p><strong>Nome Completo:</strong> ${validatedData.nombre} ${validatedData.cognome}</p>
        <p><strong>Email:</strong> ${validatedData.email}</p>
        <p><strong>Telefono:</strong> ${validatedData.telefono}</p>
        <p><strong>Provincia:</strong> ${validatedData.provincia}</p>
        <p><strong>Città:</strong> ${validatedData.citta}</p>
        <p><strong>Come ci ha conosciuto:</strong> ${validatedData.conoscenza}</p>
        <p><strong>Messaggio Adizionale:</strong></p>
        <div style="white-space: pre-wrap; padding: 10px; background: #f4f4f4;">${validatedData.messaggio || 'Nessun messaggio'}</div>
      `
        };

        await transporter.sendMail(mailOptions);
        console.info(`[Form Success] Reseller form sent successfully.`);

        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('[API Error Detail]:', error);

        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Dati non validi', details: error.errors });
        }

        return res.status(500).json({
            error: 'Errore interno del server',
            message: error.message
        });
    }
}
