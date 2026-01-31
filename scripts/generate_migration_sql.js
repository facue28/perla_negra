import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV text parser (handles quoted newlines)
function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;

    // Normalize line endings
    text = text.replace(/\r\n/g, '\n');

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                // Escaped quote
                currentField += '"';
                i++;
            } else {
                // Toggle quote
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            // End of field
            currentRow.push(currentField);
            currentField = '';
        } else if (char === '\n' && !insideQuotes) {
            // End of row
            currentRow.push(currentField);
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }
    return rows;
}

const csvPath = path.join(__dirname, '../catalogo_perla_negra editado.csv');
const outputPath = path.join(__dirname, '../migration.sql');

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCSV(csvContent);
    const headers = rows[0].map(h => h.trim());

    const dataRows = rows.slice(1).filter(r => r.length === headers.length || r.length > 1);

    let sql = `-- Migration Script generated from CSV
-- 1. Create new columns if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS usage_area text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS target_audience text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tips text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_ml text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_fl_oz text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS usage text;
-- details mapped to existing description_additional column? Or new features column?
-- Let's use description_additional as it matches the data usage.
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_additional text; 

-- Ensure ID has a default value for new inserts (Handling BIGINT)
CREATE SEQUENCE IF NOT EXISTS products_id_seq;
ALTER TABLE products ALTER COLUMN id SET DEFAULT nextval('products_id_seq');
-- Sync sequence to max existing ID to avoid conflicts
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 0) + 1); 

`;

    dataRows.forEach(row => {
        const getVal = (colName) => {
            const idx = headers.indexOf(colName);
            if (idx === -1) return null;
            return row[idx] ? row[idx].trim() : null;
        };

        let code = getVal('code');
        const slug = getVal('slug');

        // If no code, generate from slug (or name if really desperate)
        if (!code && slug) {
            code = slug.toUpperCase();
        }

        if (!code) return; // Skip only if absolutely no identifier possible

        // Map CSV headers to DB columns
        const columnMap = {
            'name': 'name',
            'slug': 'slug', // Assuming slug is in CSV. If not, might need generation, but let's assume valid.
            'category': 'category',
            'brand': 'brand',
            'usage_area': 'usage_area',
            'price': 'price',
            'subtitle': 'subtitle',
            'description': 'description',
            'sensation': 'sensation',
            'image_url': 'image_url', // Critical for new products
            'details': 'description_additional',
            'ingredients': 'ingredients',
            'tips': 'tips',
            'size': 'size_ml', // CSV 'size' -> DB 'size_ml'
            'size_fl_oz': 'size_fl_oz',
            'code': 'code'
        };

        // Prepare values for INSERT
        const insertCols = [];
        const insertVals = [];
        const updateSets = [];

        Object.keys(columnMap).forEach(csvHeader => {
            const dbCol = columnMap[csvHeader];
            let val = getVal(csvHeader);

            // Special case: Use computed code if we are processing the code column
            // This ensures we use the fallback 'SENS-BOMB-MACA' instead of the empty CSV value
            if (dbCol === 'code') {
                val = code;
            }

            if (val !== null) { // Only handle present columns
                const escaped = val.replace(/'/g, "''");
                insertCols.push(dbCol);
                insertVals.push(`'${escaped}'`);

                // For Update: Exclude code (pkey/conflict target)
                if (dbCol !== 'code') {
                    updateSets.push(`${dbCol} = EXCLUDED.${dbCol}`);
                }
            }
        });

        // Add 'usage' field from CSV if it exists and wasn't in simple map?
        // Ah, CSV has 'usage', map to 'usage' in DB? DB schema might not have 'usage'?
        // Existing queries didn't use 'usage' column for update. ProductDetailPage uses 'usage' property from DB?
        // Let's check DB schema... implied. ProductDetailPage uses `product.usage`.
        // Let's add 'usage' -> 'usage'. assuming DB has it.
        const usageVal = getVal('usage');
        if (usageVal) {
            const escaped = usageVal.replace(/'/g, "''");
            insertCols.push('usage');
            insertVals.push(`'${escaped}'`);
            updateSets.push(`usage = EXCLUDED.usage`);
        }

        if (insertCols.length > 0) {
            sql += `INSERT INTO products (${insertCols.join(', ')}) VALUES (${insertVals.join(', ')}) ON CONFLICT (code) DO UPDATE SET ${updateSets.join(', ')};\n`;
        }
    });

    fs.writeFileSync(outputPath, sql);
    console.log(`Migration SQL generated at ${outputPath}`);

} catch (err) {
    console.error("Error generating SQL:", err);
}
