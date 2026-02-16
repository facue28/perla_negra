import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv para leer el archivo .env desde la raíz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Asumimos que el script está en src/scripts, así que subimos 2 niveles para llegar al root
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = 'https://perlanegra.shop'; // URL real del sitio

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateSitemap() {
    console.log('🗺️  Generando sitemap.xml...');

    try {
        // 1. Obtener productos activos
        const { data: products, error } = await supabase
            .from('products')
            .select('slug, created_at, updated_at, featured') // Requested: use updated_at and featured
            .eq('active', true);

        if (error) throw error;

        console.log(`📦 Encontrados ${products.length} productos.`);

        // 2. Definir rutas estáticas
        const staticRoutes = [
            '',
            '/chi-sono',
            '/contatti',
            '/prodotti',
            '/termini-e-condizioni',
            '/privacy-policy',
            '/uso-responsabile',
            '/rivenditori'
        ];

        // 3. Construir XML
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Agregar páginas estáticas
        staticRoutes.forEach(route => {
            sitemap += `
    <url>
        <loc>${SITE_URL}${route}</loc>
        <changefreq>weekly</changefreq>
        <priority>${route === '' ? '1.0' : '0.8'}</priority>
    </url>`;
        });

        // Agregar productos dinámicos
        products.forEach(product => {
            // Priority: updated_at -> created_at -> now
            const rawDate = product.updated_at || product.created_at || new Date();
            const lastMod = new Date(rawDate).toISOString().split('T')[0];

            // Priority: 1.0 for featured, 0.9 for others (Standard: 0.5-0.8, but 0.9 emphasizes products)
            const priority = product.featured ? '1.0' : '0.9';

            sitemap += `
    <url>
        <loc>${SITE_URL}/prodotti/${product.slug}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>${product.featured ? 'daily' : 'weekly'}</changefreq>
        <priority>${priority}</priority>
    </url>`;
        });

        sitemap += `
</urlset>`;

        // 4. Guardar archivo en public/sitemap.xml
        // Subimos dos niveles desde src/scripts para llegar a public/
        const publicDir = path.resolve(__dirname, '../../public');

        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }

        fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
        console.log('✅ sitemap.xml generado exitosamente en public/sitemap.xml');

    } catch (error) {
        console.error('❌ Error generando sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
