
import os
import requests
from PIL import Image

# Config
SOURCE_DIR = r'C:/Users/Facu elias/Desktop/Program/perlaNegra/raw_batch'
OPTIMIZED_DIR = r'C:/Users/Facu elias/Desktop/Program/Perla_negra/optimized_poker_fix'
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
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def optimize_image(filename, output_name):
    if not os.path.exists(OPTIMIZED_DIR):
        os.makedirs(OPTIMIZED_DIR)
    
    source_path = os.path.join(SOURCE_DIR, filename)
    out_path = os.path.join(OPTIMIZED_DIR, output_name)
    
    try:
        if not os.path.exists(source_path):
            print(f"❌ Source not found: {source_path}")
            return None

        with Image.open(source_path) as img:
            if img.mode != 'RGB': img = img.convert('RGB')
            w, h = img.size
            if w > TARGET_WIDTH:
                ratio = TARGET_WIDTH / w
                new_h = int(h * ratio)
                img = img.resize((TARGET_WIDTH, new_h), Image.Resampling.LANCZOS)
            
            img.save(out_path, 'WEBP', quality=QUALITY)
            print(f"✅ Optimized: {filename} -> {output_name}")
            return out_path
    except Exception as e:
        print(f"❌ Error optim: {filename} - {e}")
        return None

def upload_file(file_path, filename):
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{filename}"
    headers = HEADERS.copy()
    headers.pop("Content-Type", None) # Remove json type
    headers['Content-Type'] = 'image/webp'
    headers['x-upsert'] = 'true'

    try:
        with open(file_path, 'rb') as f:
            r = requests.post(url, headers=headers, data=f)
            r.raise_for_status()
        print(f"🚀 Uploaded: {filename}")
        return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"
    except Exception as e:
        print(f"❌ Upload failed {filename}: {e}")
        if 'r' in locals() and r: print(r.text)
        return None

def try_patch(slug, data, desc):
    url = f"{SUPABASE_URL}/rest/v1/products"
    params = {"slug": f"eq.{slug}"}
    try:
        print(f"🔄 Trying update ({desc}): {data}")
        r = requests.patch(url, headers=HEADERS, params=params, json=data)
        r.raise_for_status()
        print(f"✅ Success ({desc})")
    except Exception as e:
        print(f"❌ Failed ({desc}): {e}")
        if 'r' in locals() and r: print(f"Response: {r.text}")

def main():
    # 1. Optimize & Upload
    opt1 = optimize_image("mini-poker1.jpeg", "mini-poker.webp")
    url1 = upload_file(opt1, "mini-poker.webp") if opt1 else None

    opt2 = optimize_image("mini-poker2.jpeg", "mini-poker-2.webp")
    url2 = upload_file(opt2, "mini-poker-2.webp") if opt2 else None

    # 2. Update DB - Agile approach
    if url1:
        # Try 'image_url' first
        try_patch("mini-poker", {"image_url": url1}, "Main Image (image_url)")
        # Fallback to 'image' if needed? 
        # (Usually if first failed, we'd see in logs. I'll execute both sequentially if needed but ideally only one works)

    if url2:
        try_patch("mini-poker", {"image2_url": url2}, "Second Image (image2_url)")

if __name__ == "__main__":
    main()
