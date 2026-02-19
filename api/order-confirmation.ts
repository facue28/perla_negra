import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

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

        // Formatear items para el email
        const itemsHtml = items.map((item: any) => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    <img src="${item.image}" alt="${item.name}" width="50" style="vertical-align: middle; margin-right: 10px;">
                    ${item.name}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€${item.price}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€${item.subtotal}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"Perla Negra Shop" <${SMTP_USER}>`,
            to: customer_email, // Se lo enviamos al cliente
            bcc: EMAIL_TO,      // Y copia oculta a la tienda
            subject: `Conferma Ordine #${order_number} - Perla Negra`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2D3748;">Grazie per il tuo ordine, ${customer_name}!</h2>
                    <p>Abbiamo ricevuto il tuo ordine <strong>#${order_number}</strong> e lo stiamo elaborando.</p>
                    
                    <h3>Dettagli dell'Ordine:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #F7FAFC;">
                                <th style="text-align: left; padding: 8px;">Prodotto</th>
                                <th style="text-align: center; padding: 8px;">Cant.</th>
                                <th style="text-align: right; padding: 8px;">Prezzo</th>
                                <th style="text-align: right; padding: 8px;">Totale</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold;">TOTALE:</td>
                                <td style="text-align: right; padding: 10px; font-weight: bold; color: #E53E3E;">€${total}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="margin-top: 20px; padding: 15px; background: #EDF2F7; border-radius: 5px;">
                        <p><strong>Indirizzo di Consegna:</strong><br>${delivery_address}</p>
                        ${delivery_notes ? `<p><strong>Note:</strong> ${delivery_notes}</p>` : ''}
                    </div>

                    <p style="margin-top: 30px; font-size: 0.9em; color: #718096; text-align: center;">
                        Perla Negra - Grazie per aver scelto noi.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('Error sending order confirmation:', error);
        return res.status(500).json({ error: error.message });
    }
}
