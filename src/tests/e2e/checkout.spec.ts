import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {

    test('User can search, add to cart, and complete order via WhatsApp', async ({ page }) => {
        // Capture console logs
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

        // 1. Visit Products Page
        await page.goto('/prodotti');
        await expect(page).toHaveTitle(/Prodotti/);

        // 2. Select first product
        // Better: Wait for a link to a product
        const productLink = page.locator('a[href^="/prodotti/"]').first();
        await expect(productLink).toBeVisible();

        // Log the href to verify
        const href = await productLink.getAttribute('href');
        console.log('Clicking product link:', href);

        await productLink.click();

        // 3. Product Detail Page
        // Debug
        console.log('Current URL:', page.url());

        // Check for 404
        const notFound = page.getByText('Prodotto non trovato');
        if (await notFound.isVisible()) {
            throw new Error(`Product page 404 at ${page.url()}`);
        }

        // Wait for title to ensure page loaded
        // Note: There might be multiple h1s (e.g. Navbar), so we target the last one or specific container
        await expect(page.locator('h1').last()).toBeVisible();

        // Use accessible locator for Add to Cart button
        // Note: There might be duplicate buttons (e.g. Sticky mobile bar), so we take the first visible one
        const addBtn = page.getByRole('button', { name: 'Aggiungi al Carrello' }).first();
        await expect(addBtn).toBeVisible();
        await addBtn.click();

        // 4. Go to Cart
        await page.goto('/carrello');
        await expect(page).toHaveTitle(/Carrello/);

        // ensure item is there
        await expect(page.getByText('Riepilogo Ordine')).toBeVisible();

        // 5. Fill Checkout Form
        await page.fill('input[name="nombre"]', 'Test Automation User');
        await page.fill('input[name="telefono"]', '+39 333 1234567');
        await page.fill('input[name="email"]', 'test@automation.com');

        // Address 
        const methodSelect = page.locator('select');
        if (await methodSelect.count() > 0) {
            await methodSelect.selectOption({ label: 'Ritiro in sede (Verbania)' });
        } else {
            // Fallback: fill address
            await page.fill('input[name="indirizzo"]', 'Via Roma 1');
            await page.fill('input[name="civico"]', '10');
            await page.fill('input[name="citta"]', 'Verbania');
            await page.fill('input[name="cap"]', '28921');

            // Handle Custom Select for Provincia
            // Locate the trigger button which likely has placeholder text "Seleziona"
            // Since it's inside the form, we can scope it or just take the last one
            const provinciaTrigger = page.locator('button:has-text("Seleziona")').last();
            if (await provinciaTrigger.isVisible()) {
                await provinciaTrigger.click();
                // Select Option (VB) - search for text containing "Verbano"
                const option = page.getByRole('button', { name: /Verbano/i }).first();
                await expect(option).toBeVisible();
                await option.click();
            } else {
                console.warn('Province select trigger not found, skipping province selection.');
            }
        }

        // 6. Submit
        // Mock window.open to prevent actual new tab
        await page.addInitScript(() => {
            window.open = (url) => {
                console.log('Window opened:', url);
                return null;
            };
        });

        const submitBtn = page.getByRole('button', { name: 'Completa su WhatsApp' });
        await expect(submitBtn).toBeVisible();
        await submitBtn.click();

        // Just wait to ensure no crash and allow potential redirects/modals
        await page.waitForTimeout(3000);
    });
});
