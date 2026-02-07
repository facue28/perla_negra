
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

def check_product_images(slug):
    url = f"{SUPABASE_URL}/rest/v1/products"
    # Select 'image_url' (DB column) not 'image' (frontend alias)
    params = { "select": "name,slug,image_url,image2_url,image3_url", "slug": f"eq.{slug}" }
    
    try:
        r = requests.get(url, headers=HEADERS, params=params)
        r.raise_for_status()
        products = r.json()
        
        if not products:
            print(f"❌ Product NOT FOUND in DB: {slug}")
            return

        p = products[0]
        print(f"\n📦 Product: {p['name']} ({p['slug']})")
        print(f"   - Main Image: {p.get('image_url')}")
        
        # Check if URL is reachable
        img_url = p.get('image_url')
        if img_url:
            try:
                head = requests.head(img_url)
                if head.status_code == 200:
                    print(f"     ✅ URL Reachable (200 OK)")
                else:
                    print(f"     ❌ URL Broken ({head.status_code})")
            except:
                print("     ❌ URL Error")
        else:
            print("     ⚠️ No Image URL")
                
    except Exception as e:
        print(f"Error checking {slug}: {e}")

def main():
    print("running diagnostics...")
    check_product_images("mini-poker")
    check_product_images("mine-my-pleasure")
    check_product_images("petit-mort")

if __name__ == "__main__":
    main()
