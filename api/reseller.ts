import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const ResellerSchema = z.object({
    nombre: z.string().min(2).max(100),
    cognome: z.string().min(2).max(100),
    email: z.string().email().max(100),
    telefono: z.string().min(6).max(30),
    provincia: z.string().min(1),
    citta: z.string().min(1),
    conoscenza: z.string().min(1),
    messaggio: z.string().max(2000).optional(),
    trap: z.string().max(0).optional(),
    turnstileToken: z.string().min(1)
});

import { getBaseTemplate } from './lib/email-templates';

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

    console.log('API Reseller called');
    try {
        const validatedData = ResellerSchema.parse(req.body);

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
                error: 'Verificacion bot fallida',
                details: verifyData['error-codes']
            });
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT_INT,
            secure: SMTP_PORT_INT === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        });

        const emailContent = `
            <div style="text-align: center;">
                <h2 style="margin-bottom: 10px;">Nuova Candidatura Rivenditore</h2>
                <p>Una nueva persona desidera collaborare con <span class="accent">Perla Negra</span>.</p>
            </div>

            <div class="card">
                <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em;">Profilo Candidato</h3>
                <table style="border: none;">
                    <tr>
                        <td style="border: none; padding: 5px 0; color: #FFFFFF; width: 150px;"><strong>Nome:</strong></td>
                        <td style="border: none; padding: 5px 0; color: #D1D5D4;">${validatedData.nombre} ${validatedData.cognome}</td>
                    </tr>
                    <tr>
                        <td style="border: none; padding: 5px 0; color: #FFFFFF;"><strong>Email:</strong></td>
                        <td style="border: none; padding: 5px 0; color: #3FFFC1;">${validatedData.email}</td>
                    </tr>
                    <tr>
                        <td style="border: none; padding: 5px 0; color: #FFFFFF;"><strong>Telefono:</strong></td>
                        <td style="border: none; padding: 5px 0; color: #D1D5D4;">${validatedData.telefono}</td>
                    </tr>
                    <tr>
                        <td style="border: none; padding: 5px 0; color: #FFFFFF;"><strong>Località:</strong></td>
                        <td style="border: none; padding: 5px 0; color: #D1D5D4;">${validatedData.citta} (${validatedData.provincia})</td>
                    </tr>
                    <tr>
                        <td style="border: none; padding: 5px 0; color: #FFFFFF;"><strong>Conoscenza:</strong></td>
                        <td style="border: none; padding: 5px 0; color: #D1D5D4;">${validatedData.conoscenza}</td>
                    </tr>
                </table>
            </div>

            <div class="card">
                <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em;">Messaggio</h3>
                <div style="white-space: pre-wrap; color: #D1D5D4; font-style: italic; border-left: 2px solid #3FFFC1; padding-left: 15px; margin: 10px 0;">
                    "${validatedData.messaggio || 'Nessun messaggio aggiuntivo.'}"
                </div>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <a href="mailto:${validatedData.email}" class="btn">Contatta Candidato</a>
            </div>
        `;

        const mailOptions = {
            from: `"Perla Negra B2B" <${SMTP_USER}>`,
            to: EMAIL_TO,
            replyTo: validatedData.email,
            subject: `Candidatura B2B: ${validatedData.nombre} ${validatedData.cognome} - Perla Negra`,
            html: getBaseTemplate(emailContent, `Candidatura Rivenditore: ${validatedData.nombre}`)
        };

        await transporter.sendMail(mailOptions);

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
