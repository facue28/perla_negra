import { CartItem, CheckoutFormData, Coupon } from '../types';

export const generateWhatsAppLink = (
    formData: CheckoutFormData,
    cart: CartItem[],
    total: number,
    discount: Coupon | null,
    subtotal: number,
    orderNumber: string
): { whatsappUrl: string; orderId: string } => {
    // 1. Validate Order Number (Mandatory)
    if (!orderNumber) {
        console.error('generateWhatsAppLink called without orderNumber');
        throw new Error("Il numero dell'ordine è richiesto.");
    }

    const orderId = orderNumber;

    // 2. Construct the message
    let message = `*ORDINE #${orderId}* 🖤\n\n`;
    message += `*Cliente:* ${formData.nombre}\n`;
    message += `*Telefono:* ${formData.telefono}\n`;

    // Formatted Address Block
    message += `*Indirizzo:*\n`;
    message += `${formData.indirizzo} ${formData.civico}\n`;
    if (formData.dettagli) message += `(${formData.dettagli})\n`;
    message += `${formData.cap} ${formData.citta} (${formData.provincia})\n`;

    // GPS Coordinates Link
    if (formData.latitude && formData.longitude) {
        message += `📍 *Posizione GPS:* https://maps.google.com/?q=${formData.latitude},${formData.longitude}\n`;
    }

    if (formData.note) {
        message += `\n*Note:* ${formData.note}\n`;
    }

    message += `\n*Consegna:* ${formData.metodoEnvio}\n\n`;
    message += `*DETTAGLIO DELL'ORDINE:*\n`;

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        message += `- [${item.code || 'N/A'}] ${item.name} (x${item.quantity}): €${itemSubtotal.toFixed(2)}\n`;
    });

    if (discount) {
        message += `\nSubtotale: €${subtotal.toFixed(2)}\n`;
        message += `Sconto (${discount.code}): -€${(subtotal - total).toFixed(2)}\n`;
        message += `*TOTALE: €${total.toFixed(2)}*`;
    } else {
        message += `\n*TOTALE: €${total.toFixed(2)}*`;
    }

    // 3. Encode and Return
    const encodedMessage = encodeURIComponent(message);
    const shopNumber = "393778317091";
    const whatsappUrl = `https://wa.me/${shopNumber}?text=${encodedMessage}`;

    return { whatsappUrl, orderId };
};

