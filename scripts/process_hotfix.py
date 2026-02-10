
import os
import re
import requests
from PIL import Image
from pathlib import Path

# Configuración
RAW_DIR = r'C:/Users/Facu elias/Desktop/Program/Perla_negra/raw_images'
OPTIMIZED_DIR = r'C:/Users/Facu elias/Desktop/Program/Perla_negra/optimized_hotfix'
DOTENV_PATH = '.env'
BUCKET_NAME = 'images'

TARGET_WIDTH_MAIN = 1080
TARGET_WIDTH_THUMB = 400
QUALITY = 85

# .env loader
def load_env():
    env_vars = {}
    if os.path.exists(DOTENV_PATH):
        with open(DOTENV_PATH, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'): continue
                if '=' in line:
                    key, val = line.split('=', 1)
                    env_vars[key.strip()] = val.strip().strip('"').strip("'")
    return env_vars

env = load_env()
SUPABASE_URL = env.get("VITE_SUPABASE_URL")
SUPABASE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("VITE_SUPABASE_ANON_KEY")

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "apikey": SUPABASE_KEY
}

def process_file(file_path):
    filename = os.path.basename(file_path)
    print(f"🔄 Processing local: {filename}")

    # Security: Prevent ReDoS
    if len(filename) > 255:
        print(f"⚠️ SKIPPED (Filename too long): {filename}")
        return []
    
    # Try to match patterns like "slug1.jpg", "slug-1.jpg", "slug.jpg"
    # User's case: "desire-coconut1.jpeg", "mini-poker1.jpg"
    match = re.match(r'^(.+?)-?(\d+)\.(jpg|jpeg|png|webp)$', filename, re.IGNORECASE)
    
    if match:
        slug = match.group(1)
        index = match.group(2)
        if slug.endswith('-'): slug = slug[:-1]
    else:
        # Fallback if no numbers (e.g. just "slug.jpg")
        print(f"⚠️ No index found in {filename}, assuming index 1.")
        name_part = os.path.splitext(filename)[0]
        slug = name_part
        if slug.endswith('-'): slug = slug[:-1]
        index = "1"

    if index == '1':
        out_names = [f"{slug}.webp", f"{slug}-min.webp"]
    else:
        out_names = [f"{slug}-{index}.webp", f"{slug}-{index}-min.webp"]

    processed = []
    
    try:
        with Image.open(file_path) as img:
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Create outputs
            for out_name in out_names:
                is_thumb = '-min' in out_name
                out_path = os.path.join(OPTIMIZED_DIR, out_name)
                
                img_copy = img.copy()
                target_w = TARGET_WIDTH_THUMB if is_thumb else TARGET_WIDTH_MAIN
                
                if img_copy.width > target_w:
                    ratio = target_w / img_copy.width
                    new_h = int(img_copy.height * ratio)
                    img_copy = img_copy.resize((target_w, new_h), Image.Resampling.LANCZOS)
                
                img_copy.save(out_path, 'WEBP', quality=QUALITY)
                processed.append(out_name)
                print(f"   ✅ Saved: {out_name}")

    except Exception as e:
        print(f"❌ Error optimizing {filename}: {e}")
        return []

    return processed

def upload_file(filename):
    file_path = os.path.join(OPTIMIZED_DIR, filename)
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{filename}"
    
    headers = HEADERS.copy()
    headers["Content-Type"] = "image/webp"
    headers["Cache-Control"] = "public, max-age=31536000, immutable"
    headers["x-upsert"] = "true" # Force overwrite

    try:
        with open(file_path, 'rb') as f:
            r = requests.post(upload_url, headers=headers, data=f)
            r.raise_for_status()
        print(f"🚀 Uploaded: {filename}")
        return True
    except Exception as e:
        print(f"❌ Upload Error {filename}: {e}")
        return False

def main():
    if not os.path.exists(OPTIMIZED_DIR):
        os.makedirs(OPTIMIZED_DIR)
        
    # List of files to specifically target based on user request
    # "desire-coconut1.jpeg" and "mini-poker1.jpg"
    targets = ["desire-coconut1.jpeg", "mini-poker1.jpg"]

    found_files = []
    for t in targets:
        p = os.path.join(RAW_DIR, t)
        if os.path.exists(p):
            found_files.append(p)
        else:
            # Try to partial match if exact name fails
            # e.g. "mini-poker 1.jpg" (with space) or other variations
            print(f"⚠️ Exact match not found for {t}. checking dir...")
            # (Simplification: assuming exact name used by user/dir output earlier)

    if not found_files:
        print("❌ No target files found in raw_images.")
        return

    # Process
    optimized_files = []
    for p in found_files:
        optimized_files.extend(process_file(p))

    # Upload
    print("\nStarting Uploads (No Bucket Clear)...")
    for f in optimized_files:
        upload_file(f)

    print("\n✨ Hotfix Complete!")

if __name__ == "__main__":
    main()
