
import os
import requests

# Config
DOTENV_PATH = '.env'
SUPABASE_URL = None
SUPABASE_KEY = None

def load_env():
    global SUPABASE_URL, SUPABASE_KEY
    if os.path.exists(DOTENV_PATH):
        with open(DOTENV_PATH, 'r') as f:
            for line in f:
                if '=' in line:
                    key, val = line.strip().split('=', 1)
                    k = key.strip()
                    v = val.strip().strip('"').strip("'")
                    if k == 'VITE_SUPABASE_URL': SUPABASE_URL = v
                    if k == 'SUPABASE_SERVICE_ROLE_KEY': SUPABASE_KEY = v
                    if k == 'VITE_SUPABASE_ANON_KEY' and not SUPABASE_KEY: SUPABASE_KEY = v

load_env()

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "apikey": SUPABASE_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Slug -> Size mapping
UPDATES = {
    "lube-premium-relaxing": "130 ml",
    "lube-supreme-extra-time": "130 ml",
    "lube-intensity-hot-pleasure": "130 ml",
    "ibiza": "100 ml",
    "bali-sunset-stripped": "100 ml",
    "fucking-fabulous": "100 ml",
    "very-sexy": "50 ml",
    "petit-mort": "50 ml",
    "it-femme": "60 ml",
    "it-femme-florale": "60 ml",
    "crazy-girl": "60 ml",
    "hot-inevitable": "100 ml",
    "hot-inevitable-privee": "100 ml",
    "hot-inevitable-so-excited": "100 ml",
    "for-him": "100 ml",
    "for-him-vip": "100 ml",
    "inevitable-men-aphrodisiac": "100 ml",
    "inevitable-men-vip-aphrodisiac": "100 ml",
    "hi-sex": "60 CAPS", # Note: handling duplicate key manually if needed, dictionary overwrites. User listed hi-sex twice (60 and 4). Choosing 60 for now or will check DB.
    "black-dragon": "50 ml",
    "more-sex-berries": "50 ml",
    "more-sex-chocolate": "50 ml",
    "mine-my-pleasure": "50 ml",
    "diva-s-secret-effetto-caldo": "30 ml",
    "diva-s-secret-effetto-stringente": "30 ml",
    "sens-bomb-maca": "70 ml",
    "sens-bomb-sandalo": "70 ml",
    "desire-coconut": "75 ml", # normalized spacing
    "love-potion-cioccolato": "30 ml",
    "love-potion-zucchero-filato": "30 ml",
    "love-potion-champagne-e-lampone": "30 ml",
    "love-potion-frutti-rossi": "30 ml",
    "body-splash-crazy-girl": "100 ml",
    "body-splash-love": "100 ml",
    "body-splash-petit-mort": "100 ml",
    "body-splash-hot-inevitable": "100 ml",
    "body-splash-be": "60 ml",
    "body-splash-privee": "60 ml",
    "body-splash-so-excited": "60 ml",
    "inlube-game": "20 ml"
}

def ml_to_floz(ml_str):
    try:
        if 'ml' in ml_str.lower():
            ml_val = float(ml_str.lower().replace('ml', '').strip())
            floz = ml_val * 0.033814
            return f"{floz:.1f} fl oz"
    except:
        pass
    return None

def update_product(slug, size_val):
    url = f"{SUPABASE_URL}/rest/v1/products"
    params = {"slug": f"eq.{slug}"}
    
    # Calculate fl oz if possible
    fl_oz = ml_to_floz(size_val)
    
    # Determine columns based on service.js mapping
    # productService maps: size -> size_ml, sizeFlOz -> size_fl_oz
    data = {
        "size_ml": size_val
    }
    if fl_oz:
        data["size_fl_oz"] = fl_oz

    try:
        print(f"🔄 Updating {slug}: {data}...")
        r = requests.patch(url, headers=HEADERS, params=params, json=data)
        r.raise_for_status()
        print("✅ OK")
    except Exception as e:
        print(f"❌ Error {slug}: {e}")
        if 'r' in locals() and r: print(r.text)

def main():
    print("Starting size updates...")
    for slug, size in UPDATES.items():
        update_product(slug, size)

if __name__ == "__main__":
    main()
