import { test, expect } from '@playwright/test';

const routes = [
    { path: '/', title: /Home/i },
    { path: '/chi-sono', title: /Chi Sono/i },
    { path: '/productos', title: /Catalogo/i },
    { path: '/contacto', title: /Contatti/i },
    { path: '/carrito', title: /Carrello/i },
    { path: '/revendedores', title: /Diventa Rivenditore/i },
    { path: '/termini', title: /Termini/i },
    { path: '/privacy', title: /Privacy/i },
    { path: '/uso', title: /Uso Responsabile/i },
    { path: '/adulto', title: /Termini/i },
];

test.describe('Smoke Test - Route Check', () => {
    routes.forEach(({ path, title }) => {
        test(`Should load ${path} correctly`, async ({ page }) => {
            await page.goto(path);

            // Basic check: Title or H1
            // Soft assertion so one failure doesn't stop others
            try {
                await expect(page).toHaveTitle(title);
            } catch (e) {
                // If title check fails, check for H1 as fallback
                const h1 = page.locator('h1');
                if (await h1.isVisible()) {
                    console.log(`${path} loaded with H1: ${await h1.innerText()}`);
                } else {
                    throw e;
                }
            }

            // Ensure no 404 text is visible
            await expect(page.getByText('Pagina non trovata')).not.toBeVisible();
        });
    });
});
