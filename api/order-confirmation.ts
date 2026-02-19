import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

import { getBaseTemplate } from './lib/email-templates.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Extraemos las variables que ya configuraste en Vercel
    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS,
        EMAIL_TO,
        SUPABASE_SERVICE_ROLE_KEY // Para validar que la petición viene de nuestro Supabase
    } = process.env;

    const authHeader = req.headers.authorization;

    // LOG DE SEGURIDAD PARA DEBUGGEAR EL 401
    console.log('Auth Debug:', {
        hasHeader: !!authHeader,
        headerPrefix: authHeader?.substring(0, 10),
        headerLength: authHeader?.length,
        hasEnvKey: !!SUPABASE_SERVICE_ROLE_KEY,
        envKeyLength: SUPABASE_SERVICE_ROLE_KEY?.length,
        isMatch: authHeader === `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    });

    if (!authHeader || authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
        order_number,
        customer_name,
        customer_email,
        total,
        items,
        delivery_address,
        delivery_notes
    } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT || '465'),
            secure: SMTP_PORT === '465',
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        });

        // Formatear items para la tabla
        const itemsHtml = items.map((item: any) => `
            <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <div style="display: flex; align-items: center;">
                        <img src="${item.image}" alt="${item.name}" width="40" height="40" style="border-radius: 8px; margin-right: 12px; object-fit: cover;">
                        <span style="color: #FFFFFF; font-weight: 500;">${item.name}</span>
                    </div>
                </td>
                <td style="text-align: center; color: #D1D5D4;">${item.quantity}</td>
                <td style="text-align: right; color: #3FFFC1; font-weight: bold;">€${item.subtotal}</td>
            </tr>
        `).join('');

        const emailContent = `
            <div style="text-align: center;">
                <h2 style="margin-bottom: 10px;">Grazie per il tuo ordine!</h2>
                <p style="margin-bottom: 30px;">Ciao <span class="accent">${customer_name}</span>, abbiamo ricevuto il tuo ordine <span class="accent">#${order_number}</span> e lo stamos procesando.</p>
            </div>

            <div class="card">
                <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em;">Dettagli dell'Ordine</h3>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 60%;">Prodotto</th>
                            <th style="text-align: center;">Cant.</th>
                            <th style="text-align: right;">Totale</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div style="text-align: right; padding-top: 20px;">
                    <span style="color: #D1D5D4; margin-right: 15px;">TOTALE ORDINE:</span>
                    <span style="color: #3FFFC1; font-size: 24px; font-family: 'Playfair Display', serif; font-weight: bold;">€${total}</span>
                </div>
            </div>

            <div class="card">
                <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em;">Informazioni di Consegna</h3>
                <p style="margin-bottom: 5px;"><strong style="color: #FFFFFF;">Indirizzo:</strong></p>
                <p style="margin-top: 0;">${delivery_address}</p>
                ${delivery_notes ? `
                    <p style="margin-bottom: 5px; margin-top: 15px;"><strong style="color: #FFFFFF;">Note per la consegna:</strong></p>
                    <p style="margin-top: 0;">${delivery_notes}</p>
                ` : ''}
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <p>Ti avviseremo appena il tuo pacco sarà in viaggio.</p>
                <a href="https://perla-negra.vercel.app/admin" class="btn">Visualizza Ordine</a>
            </div>
        `;

        const mailOptions = {
            from: `"Perla Negra" <${SMTP_USER}>`,
            to: customer_email,
            bcc: EMAIL_TO,
            subject: `Conferma Ordine #${order_number} - Perla Negra`,
            html: getBaseTemplate(emailContent, `Conferma Ordine #${order_number}`)
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('Error sending order confirmation:', error);
        return res.status(500).json({ error: error.message });
    }
}
