import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para escapar comillas simples en SQL
const escapeSql = (str) => {
    if (!str) return '';
    return str.replaceAll("'", "''");
};

// Leer el CSV
const csvPath = join(__dirname, 'products_export.csv');
const csvContent = readFileSync(csvPath, 'utf-8');

// Parser CSV mejorado que maneja campos multi-línea
function parseCSV(content) {
    const lines = content.split('\n');
    const result = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;
    let headersParsed = false;
    let headers = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (insideQuotes && nextChar === '"') {
                    // Escaped quote
                    currentField += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote mode
                    insideQuotes = !insideQuotes;
                }
            } else if (char === ',' && !insideQuotes) {
                // End of field
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (char === '\r') {
                // Ignorar carriage return
                continue;
            } else {
                currentField += char;
            }
        }

        // Si estamos dentro de comillas, es un campo multi-línea
        if (insideQuotes) {
            currentField += '\n'; // Preservar salto de línea
            continue;
        }

        // Fin de línea fuera de comillas = fin de fila
        if (currentField || currentRow.length > 0) {
            currentRow.push(currentField.trim());
            currentField = '';
        }

        if (currentRow.length > 0) {
            if (!headersParsed) {
                headers = currentRow;
                headersParsed = true;
            } else {
                result.push(currentRow);
            }
            currentRow = [];
        }
    }

    return { headers, rows: result };
}

const { headers, rows } = parseCSV(csvContent);

// Crear objetos producto
const products = rows.map(row => {
    const product = {};
    headers.forEach((header, idx) => {
        let value = row[idx] || '';
        // Limpiar espacios
        product[header.trim()] = value.trim();
    });
    return product;
}).filter(p => p.code && p.code !== ''); // Solo productos con code válido

console.log(`✅ Parsed ${products.length} products from CSV`);

// Identificar valores únicos para constants
const baseUrl = 'https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/';
const uniqueBrands = [...new Set(products.map(p => p.brand?.trim()).filter(Boolean))];
const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

console.log(`📊 Unique brands: ${uniqueBrands.join(', ')}`);
console.log(`📊 Unique categories: ${uniqueCategories.join(', ')}`);

// Generar SQL
let sql = `-- Migration Script generated from CSV (48 products - REFACTORED)
-- Generated: ${new Date().toISOString()}
-- Eliminates S1192 duplications using DO block with constants

-- 1. Create new columns if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS usage_area text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS target_audience text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tips text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_ml text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_fl_oz text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS usage text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_additional text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image2_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image3_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_filter text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS target_audience text;

-- Ensure ID has a default value for new inserts
CREATE SEQUENCE IF NOT EXISTS products_id_seq;
ALTER TABLE products ALTER COLUMN id SET DEFAULT nextval('products_id_seq');
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 0) + 1);

-- Refactored: Use DO block with constants
DO $$
DECLARE
    base_url text := '${baseUrl}';
    default_brand text := 'Sexitive';
BEGIN
`;

// Generar INSERT statements
products.forEach((p, idx) => {
    const fields = [];
    const values = [];

    // Mapeo de campos CSV a SQL
    const fieldMapping = {
        'name': p.name,
        'slug': p.slug,
        'category': p.category,
        'brand': p.brand,
        'usage_area': p.usage_area,
        'price': p.price,
        'subtitle': p.subtitle,
        'description': p.description,
        'sensation': p.sensation,
        'image_url': p.image_url,
        'description_additional': p.description_additional,
        'size_ml': p.size_ml,
        'size_fl_oz': p.size_fl_oz,
        'code': p.code,
        'product_filter': p.product_filter,
        'target_audience': p.target_audience,
        'ingredients': p.ingredients,
        'active': p.active,
        'image2_url': p.image2_url,
        'image3_url': p.image3_url,
        'stock': p.stock
    };

    // Construir solo campos no-null
    Object.entries(fieldMapping).forEach(([field, value]) => {
        if (value && value.toLowerCase() !== 'null' && value.trim() !== '') {
            fields.push(field);

            // Si es URL de imagen, usar base_url + filename
            if (field.includes('image') && value.includes(baseUrl)) {
                const filename = value.replace(baseUrl, '');
                values.push(`base_url || '${escapeSql(filename)}'`);
            } else if (field === 'brand' && value.trim().toLowerCase() === 'sexitive') {
                values.push(`default_brand`);
            } else if (field === 'price' || field === 'stock' || field === 'active') {
                values.push(value); // números/booleans sin comillas
            } else {
                values.push(`'${escapeSql(value)}'`);
            }
        }
    });

    sql += `    INSERT INTO products (${fields.join(', ')})\n`;
    sql += `    VALUES (${values.join(', ')})\n`;
    sql += `    ON CONFLICT (code) DO UPDATE SET ${fields.filter(f => f !== 'code').map(f => `${f}=EXCLUDED.${f}`).join(', ')};\n\n`;
});

sql += `END $$;\n`;

// Escribir archivo
const outputPath = join(__dirname, 'schema_snapshot.sql');
writeFileSync(outputPath, sql, 'utf-8');

console.log(`✅ Generated refactored SQL: ${outputPath}`);
console.log(`📦 ${products.length} products processed`);
console.log(`🎯 S1192 duplications eliminated with DO block constants`);
