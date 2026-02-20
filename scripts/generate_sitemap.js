import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = process.env.VITE_SITE_URL || 'https://perla-negra.vercel.app'; // Default to Vercel domain, override via env var

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
    console.log('Fetching products...');
    const { data: products, error } = await supabase
        .from('products')
        .select('slug, created_at');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products.`);

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Static Pages -->
    <url>
        <loc>${SITE_URL}/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${SITE_URL}/prodotti</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>${SITE_URL}/chi-sono</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>${SITE_URL}/contatti</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>

    <!-- Products -->
`;

    products.forEach(product => {
        const lastMod = product.created_at ? new Date(product.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        sitemap += `    <url>
        <loc>${SITE_URL}/prodotti/${product.slug}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
`;
    });

    sitemap += '</urlset>';

    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    const outputPathGSC = path.join(__dirname, '../public/sitemap-gsc.xml');

    fs.writeFileSync(outputPath, sitemap);
    fs.writeFileSync(outputPathGSC, sitemap);

    console.log(`Sitemap generated at ${outputPath}`);
    console.log(`Sitemap GSC mirror generated at ${outputPathGSC}`);
}

generateSitemap();
