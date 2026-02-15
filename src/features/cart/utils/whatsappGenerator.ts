import { CartItem, CheckoutFormData, Coupon } from '../types';

export const generateWhatsAppLink = (
    formData: CheckoutFormData,
    cart: CartItem[],
    total: number,
    discount: Coupon | null,
    subtotal: number,
    orderNumber: string
): { whatsappUrl: string; orderId: string } => {

    // 1. Validation
    if (!orderNumber) throw new Error("Il numero dell'ordine è richiesto.");
    const orderId = orderNumber;
    const date = new Date().toLocaleDateString('it-IT');

    // 2. Professional Invoice Style (Unicode Emojis)
    let message = `*ORDINE #${orderId}* \uD83D\uDDA4\n`;
    message += `*Data:* ${date}\n`;
    message += `──────────────────\n\n`;

    // Customer
    message += `\uD83D\uDC64 *DETTAGLI CLIENTE*\n`;
    message += `*Nome:* ${formData.nombre}\n`;
    message += `*Telefono:* ${formData.telefono}\n`;

    // Delivery Method
    const isRitiro = formData.metodoEnvio.includes('Ritiro');
    if (isRitiro) {
        message += `\uD83D\uDCCD *Metodo:* Ritiro in sede (Verbania)\n`;
        message += `_Luogo e orario da concordare._\n`;
    } else {
        message += `\uD83D\uDE9A *SPEDIZIONE*\n`;
        message += `${formData.indirizzo} ${formData.civico}\n`;
        if (formData.dettagli) message += `(${formData.dettagli})\n`;
        message += `${formData.cap} ${formData.citta} (${formData.provincia})\n`;

        if (formData.latitude && formData.longitude) {
            message += `\uD83D\uDCCD *Posizione:* http://maps.google.com/maps?q=${formData.latitude},${formData.longitude}\n`;
        }
    }

    if (formData.note) {
        message += `\n\uD83D\uDCDD *NOTE*\n${formData.note}\n`;
    }

    message += `\n──────────────────\n`;
    message += `\uD83D\uDED2 *RIEPILOGO ORDINE*\n\n`;

    cart.forEach(item => {
        const price = Number(item.price);
        const qty = Number(item.quantity);
        const itemSubtotal = price * qty;

        message += `\u25AA\uFE0F *${item.name}*\n`;
        message += `   ${qty} x €${price.toFixed(2)} = €${itemSubtotal.toFixed(2)}\n`;

        // ULTIMATE CLEANER: Extract digits ONLY if it looks like a size.
        let sizeDisplay = '';

        // Build candidate string from available fields
        let candidate = '';
        if (item.sizeMl) candidate = String(item.sizeMl); // Best source
        else if (item.size) candidate = String(item.size);
        else if (item.format) candidate = String(item.format);

        if (candidate && candidate !== 'N/A') {
            // Strip everything that is NOT a digit or a dot
            const numericPart = candidate.replace(/[^\d.]/g, '');

            // Check if we extracted a valid number
            if (numericPart && parseFloat(numericPart) > 0) {
                // If we found a number (e.g. from "30ml" -> "30"), use it + "ml"
                sizeDisplay = `${numericPart}ml`;
            } else {
                // If no number found (e.g. "Spray"), use original string cleaned up
                // BUT strip ANY 'ml' occurrence to be safe
                sizeDisplay = candidate.replace(/ml/gi, '').trim();
            }
        }

        if (sizeDisplay) {
            // Removed underscores as requested
            message += `   Formato: ${sizeDisplay} \n`;
        }
    });

    message += `\n──────────────────\n`;

    // Totals
    const safeSubtotal = Number(subtotal);
    const safeTotal = Number(total);

    if (discount) {
        const discountAmount = safeSubtotal - safeTotal;
        message += `Subtotale: €${safeSubtotal.toFixed(2)}\n`;
        message += `Sconto (${discount.code}): -€${discountAmount.toFixed(2)}\n`;
        message += `*TOTALE DA PAGARE: €${safeTotal.toFixed(2)}* \uD83D\uDCB0`;
    } else {
        message += `*TOTALE DA PAGARE: €${safeTotal.toFixed(2)}* \uD83D\uDCB0`;
    }

    // 3. Generate Link
    const encodedMessage = encodeURIComponent(message);
    const shopNumber = "393778317091";

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${shopNumber}&text=${encodedMessage}`;

    return { whatsappUrl, orderId };
};
