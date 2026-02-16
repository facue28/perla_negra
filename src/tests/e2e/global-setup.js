import fs from 'fs';
import path from 'path';

async function globalSetup(config) {
    const state = {
        cookies: [],
        origins: [
            {
                origin: 'http://localhost:5173',
                localStorage: [
                    {
                        name: 'ageVerified',
                        value: 'true',
                    },
                    {
                        name: 'cookieConsent',
                        value: 'accepted'
                    }
                ],
            },
        ],
    };

    // Define path (store in src/tests/e2e/storage-state.json)
    const storageStatePath = path.resolve(process.cwd(), 'src/tests/e2e/storage-state.json');

    // Ensure directory exists
    const dir = path.dirname(storageStatePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(storageStatePath, JSON.stringify(state, null, 2));
    console.log('Global setup: Created storage-state.json with age verification.');
}

export default globalSetup;
