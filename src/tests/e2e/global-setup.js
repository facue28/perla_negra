import { chromium } from '@playwright/test';

async function globalSetup(config) {
    const { baseURL, storageState } = config.projects[0].use;
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log(`Global Setup: Visiting ${baseURL}`);
    await page.goto(baseURL);

    // 1. Handle Age Gate
    try {
        const ageButton = page.getByRole('button', { name: /ho \+18 anni/i });
        if (await ageButton.isVisible({ timeout: 5000 })) {
            await ageButton.click();
            console.log('Global Setup: Age Gate dismissed');
        }
    } catch (e) { console.log('Global Setup: Age Gate not found'); }

    // 2. Handle Cookie Consent
    try {
        const cookieButton = page.getByRole('button', { name: /accetta/i });
        if (await cookieButton.isVisible({ timeout: 3000 })) {
            await cookieButton.click();
            console.log('Global Setup: Cookies accepted');
        }
    } catch (e) { console.log('Global Setup: Cookie Banner not found'); }

    // 3. Save State (Storage + Cookies)
    await page.context().storageState({ path: 'src/tests/e2e/storage-state.json' });
    console.log('Global Setup: State saved to src/tests/e2e/storage-state.json');

    await browser.close();
}

export default globalSetup;
