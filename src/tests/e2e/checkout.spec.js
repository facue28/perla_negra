import { test, expect } from '@playwright/test';

test('Golden Path: Purchase Flow', async ({ page }) => {
    // 1. Visit Home (State is already loaded from global-setup)
    await page.goto('/');
    await expect(page).toHaveTitle(/Perla Negra/i);

    // 2. Click on a product
    const productLink = page.locator('a[href*="/product"]').first();
    await productLink.waitFor({ state: 'visible', timeout: 30000 });
    await productLink.click();

    // 3. Verify Product Page
    await expect(page.locator('h1')).toBeVisible();

    // 4. Add to Cart (Scoped to main button)
    const mainCartContainer = page.locator('#main-add-to-cart-btn');
    await expect(mainCartContainer).toBeVisible();

    const addToCartBtn = mainCartContainer.getByRole('button', { name: /aggiungi/i });
    await addToCartBtn.click({ force: true });

    // 5. Go to Cart
    const cartLink = page.locator('a[href="/carrello"]');
    await expect(cartLink).toBeVisible();
    await cartLink.click({ force: true });

    // 6. Fill Checkout Form
    await expect(page.getByText('Il tuo carrello')).toBeVisible({ timeout: 15000 });

    await page.getByPlaceholder('Il tuo nome').fill('Test User');
    await page.getByPlaceholder('Indirizzo di consegna').fill('Via Roma 1');
    await page.getByPlaceholder('CAP').fill('00100');
    await page.getByPlaceholder('Città').fill('Roma');
    await page.getByPlaceholder('Telefono').fill('3331234567');

    // 7. Click Order
    const orderBtn = page.getByRole('button', { name: /ordina su whatsapp/i });
    await expect(orderBtn).toBeEnabled();

    await orderBtn.click({ force: true });
});
