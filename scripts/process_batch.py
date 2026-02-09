import os
import re
from PIL import Image
from pathlib import Path

# Configuración
SOURCE_DIR = r'C:/Users/Facu elias/Desktop/Program/perlaNegra/raw_batch'
OUTPUT_DIR = 'optimized_batch'

# Filtros
TARGET_WIDTH_MAIN = 1080  # Full HD width (aprox)
TARGET_WIDTH_THUMB = 400  # Thumbnail width
QUALITY = 85

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def process_image(file_path, output_dir):
    filename = os.path.basename(file_path)

    # Security: Prevent ReDoS on long filenames
    if len(filename) > 255:
        print(f"⚠️ SKIPPED (Filename too long): {filename}")
        return

    # Regex para capturar slug e indice: "nombre-producto" + "1" + ".jpg"
    # Soporta jpg, jpeg, png, etc.
    match = re.match(r'^(.*?)(\d+)\.(jpg|jpeg|png|webp)$', filename, re.IGNORECASE)
    
    if not match:
        print(f"⚠️ SKIPPED (No format slug-N): {filename}")
        return

    slug = match.group(1)
    index = match.group(2)
    
    # Manejo de guiones extra al final del slug si el usuario puso "slug-1" en vez de "slug1"
    # Si el regex capturó "mi-producto-" como slug y "1" como index.
    if slug.endswith('-'):
        slug = slug[:-1]

    # Definir nombres de salida
    if index == '1':
        out_name_main = f"{slug}.webp"
        out_name_thumb = f"{slug}-min.webp"
    else:
        out_name_main = f"{slug}-{index}.webp"
        out_name_thumb = f"{slug}-{index}-min.webp"

    try:
        with Image.open(file_path) as img:
            # Convertir a RGB si es necesario (para PNGs transparentes o CMYK)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # 1. Main Image
            img_main = img.copy()
            # Resize si es muy grande
            if img_main.width > TARGET_WIDTH_MAIN:
                ratio = TARGET_WIDTH_MAIN / img_main.width
                new_height = int(img_main.height * ratio)
                img_main = img_main.resize((TARGET_WIDTH_MAIN, new_height), Image.Resampling.LANCZOS)
            
            img_main.save(os.path.join(output_dir, out_name_main), 'WEBP', quality=QUALITY)

            # 2. Thumbnail
            img_thumb = img.copy()
            ratio_thumb = TARGET_WIDTH_THUMB / img_thumb.width
            new_height_thumb = int(img_thumb.height * ratio_thumb)
            img_thumb = img_thumb.resize((TARGET_WIDTH_THUMB, new_height_thumb), Image.Resampling.LANCZOS)
            
            img_thumb.save(os.path.join(output_dir, out_name_thumb), 'WEBP', quality=QUALITY)

            print(f"✅ Processed: {filename} -> {out_name_main} & {out_name_thumb}")
            
    except Exception as e:
        print(f"❌ ERROR processing {filename}: {e}")

def main():
    ensure_dir(OUTPUT_DIR)
    
    # Verificar Source
    if not os.path.exists(SOURCE_DIR):
        print(f"❌ Source directory not found: {SOURCE_DIR}")
        return

    files = [f for f in os.listdir(SOURCE_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    print(f"Found {len(files)} images to process...")

    for file in files:
        process_image(os.path.join(SOURCE_DIR, file), OUTPUT_DIR)

    print("\n✨ Batch processing complete!")
    print(f"📂 Output folder: {os.path.abspath(OUTPUT_DIR)}")

if __name__ == '__main__':
    main()
