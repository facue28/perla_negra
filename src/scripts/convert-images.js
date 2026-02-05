
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIG
const INPUT_DIR = path.join(__dirname, '../../raw_images');
const OUTPUT_DIR = path.join(__dirname, '../../optimized_images');
const QUALITY = 80; // Good balance for web
const TARGET_SIZE = 1000; // Standardized square size
const ENABLE_SQUAREIFY = true; // ⚠️ Set to false to keep original aspect ratio

async function convertImages() {
    console.log(`🖼️  Starting Image Conversion (Squareify Mode: ${ENABLE_SQUAREIFY ? 'ON' : 'OFF'})...`);

    // 1. Ensure directories exist
    if (!fs.existsSync(INPUT_DIR)) {
        console.log(`📁 Creating input folder: ${INPUT_DIR}`);
        fs.mkdirSync(INPUT_DIR);
        console.log('⚠️  Folder created. Please put your images in "raw_images" and run again.');
        return;
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }

    // 2. Read files
    const files = fs.readdirSync(INPUT_DIR);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

    if (imageFiles.length === 0) {
        console.log('⚠️  No .jpg or .png images found in "raw_images".');
        return;
    }

    console.log(`🔍 Found ${imageFiles.length} images.`);

    // 3. Process each file
    for (const file of imageFiles) {
        const inputPath = path.join(INPUT_DIR, file);
        const fileNameWithoutExt = path.parse(file).name;
        const outputPath = path.join(OUTPUT_DIR, `${fileNameWithoutExt}.webp`);

        try {
            let pipeline = sharp(inputPath);

            // OPTIONAL: Squareify logic
            if (ENABLE_SQUAREIFY) {
                pipeline = pipeline.resize({
                    width: TARGET_SIZE,
                    height: TARGET_SIZE,
                    fit: 'contain', // Puts the image inside the box without cutting it
                    background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent padding
                });
            }

            await pipeline
                .webp({ quality: QUALITY })
                .toFile(outputPath);

            console.log(`✅ Converted${ENABLE_SQUAREIFY ? ' & Squared' : ''}: ${file} -> ${fileNameWithoutExt}.webp`);
        } catch (error) {
            console.error(`❌ Error converting ${file}:`, error.message);
        }
    }

    console.log(`\n🎉 All done! Check the "optimized_images" folder.`);
}

convertImages();
