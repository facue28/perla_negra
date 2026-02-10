
import os
import requests
import glob
from PIL import Image

# Config
RAW_IMAGES_DIR = r'C:/Users/Facu elias/Desktop/Program/Perla_negra/raw_images'
RAW_BATCH_DIR = r'C:/Users/Facu elias/Desktop/Program/perlaNegra/raw_batch'
OPTIMIZED_DIR = r'C:/Users/Facu elias/Desktop/Program/Perla_negra/optimized_final'
DOTENV_PATH = '.env'
BUCKET_NAME = 'images'
TARGET_WIDTH = 1080
QUALITY = 85

def load_env():
    env_vars = {}
    if os.path.exists(DOTENV_PATH):
        with open(DOTENV_PATH, 'r') as f:
            for line in f:
                if '=' in line:
                    key, val = line.strip().split('=', 1)
                    env_vars[key.strip()] = val.strip().strip('"').strip("'")
    return env_vars

env = load_env()
SUPABASE_URL = env.get("VITE_SUPABASE_URL")
SUPABASE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("VITE_SUPABASE_ANON_KEY")

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "apikey": SUPABASE_KEY,
    "x-upsert": "true"
}

def optimize_image(source_path, output_name):
    if not os.path.exists(OPTIMIZED_DIR):
        os.makedirs(OPTIMIZED_DIR)
    
    out_path = os.path.join(OPTIMIZED_DIR, output_name)
    
    try:
        with Image.open(source_path) as img:
            if img.mode != 'RGB': img = img.convert('RGB')
            
            w, h = img.size
            if w > TARGET_WIDTH:
                ratio = TARGET_WIDTH / w
                new_h = int(h * ratio)
                img = img.resize((TARGET_WIDTH, new_h), Image.Resampling.LANCZOS)
            
            img.save(out_path, 'WEBP', quality=QUALITY)
            print(f"✅ Optimized: {os.path.basename(source_path)} -> {output_name}")
            return out_path
    except Exception as e:
        print(f"❌ Error optimizing {source_path}: {e}")
        return None

def upload_file(file_path, filename):
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{filename}"
    headers = HEADERS.copy()
    headers['Content-Type'] = 'image/webp'
    
    try:
        with open(file_path, 'rb') as f:
            r = requests.post(url, headers=headers, data=f)
            r.raise_for_status()
        print(f"🚀 Uploaded: {filename}")
        return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"
    except Exception as e:
        print(f"❌ Upload failed {filename}: {e}")
        return None

def update_db(slug, image_url):
    url = f"{SUPABASE_URL}/rest/v1/products"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    params = {"slug": f"eq.{slug}"}
    data = {"image_url": image_url} # DB column is image_url
    
    try:
        r = requests.patch(url, headers=headers, params=params, json=data)
        r.raise_for_status()
        if r.json():
            print(f"🔄 DB Updated: {slug} -> {image_url}")
        else:
            print(f"⚠️ DB Warning: Slug {slug} not found.")
    except Exception as e:
        print(f"❌ DB Update failed {slug}: {e}")

def main():
    tasks = [
        {
            "slug": "mine-my-pleasure",
            "search_dir": RAW_IMAGES_DIR,
            "pattern": "*mine-my-pleasure*.jpg",
            "output_name": "mine-my-pleasure.webp"
        },
        {
            "slug": "petit-mort",
            "search_dir": RAW_BATCH_DIR,
            "pattern": "fragancia.webp",
            "output_name": "petit-mort.webp"
        },
        {
            "slug": "mini-poker",
            "search_dir": RAW_IMAGES_DIR,
            "pattern": "*mini-poker*.jpg", # Matches mini-poker1.jpg
            "output_name": "mini-poker.webp"
        }
    ]

    for t in tasks:
        print(f"\n--- Processing {t['slug']} ---")
        # Find file
        full_pattern = os.path.join(t['search_dir'], t['pattern'])
        files = glob.glob(full_pattern)
        
        if not files:
            print(f"❌ Source not found for {t['slug']} (Pattern: {full_pattern})")
            continue
            
        source = files[0]
        print(f"Found source: {source}")
        
        # Optimize
        optimized = optimize_image(source, t['output_name'])
        if not optimized: continue
        
        # Upload
        public_url = upload_file(optimized, t['output_name'])
        if public_url:
            # Update DB
            update_db(t['slug'], public_url)

if __name__ == "__main__":
    main()
