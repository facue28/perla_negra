
import os
import requests

# Configuración
DOTENV_PATH = '.env'
BUCKET_NAME = 'images'

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
    "apikey": SUPABASE_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def update_product_image(slug, image_filename):
    patch_url = f"{SUPABASE_URL}/rest/v1/products"
    
    # Construct Public URL
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{image_filename}"
    
    data = { "image": public_url }
    
    # Check if we should also update thumb? usually 'image' is the main one.
    # The frontend uses 'image' field.
    
    params = { "slug": f"eq.{slug}" }
    
    try:
        print(f"🔄 Updating DB for slug='{slug}' -> {image_filename}...")
        r = requests.patch(patch_url, headers=HEADERS, params=params, json=data)
        r.raise_for_status()
        res = r.json()
        if res:
            print(f"✅ Success! Updated: {res[0].get('name')}")
        else:
            print(f"⚠️ Warning: Slug '{slug}' NOT found in DB. Trying alternative 'minipoker' for poker...")
            if slug == 'mini-poker':
                 # Try fallback slug
                 return update_product_image('minipoker', image_filename)
    except Exception as e:
        print(f"❌ Error updating DB: {e}")

def main():
    # Targets
    update_product_image("desire-coconut", "desire-coconut.webp")
    update_product_image("mini-poker", "mini-poker.webp")

if __name__ == "__main__":
    main()
