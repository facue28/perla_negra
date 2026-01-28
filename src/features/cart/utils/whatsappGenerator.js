export const generateWhatsAppLink = (formData, cart, total) => {
    // 1. Generate Unique ID: #PN-{DDMM}-{RAND}
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();
    const orderId = `PN-${day}${month}-${randomCode}`;

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
        message += `- [${item.code || 'N/A'}] ${item.name} (x${item.quantity}): $${itemSubtotal.toFixed(2)}\n`;
    });

    message += `\n*TOTALE: $${total.toFixed(2)}*`;

    // 3. Encode and Return
    const encodedMessage = encodeURIComponent(message);
    const shopNumber = "393778317091";
    const whatsappUrl = `https://wa.me/${shopNumber}?text=${encodedMessage}`;

    return { whatsappUrl, orderId };
};
