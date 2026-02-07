import os
import requests

# Configuración Manual de ENV
def load_env():
    env_vars = {}
    dotenv_path = '.env'
    if os.path.exists(dotenv_path):
        with open(dotenv_path, 'r') as f:
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

RAW_DIR = r'C:/Users/Facu elias/Desktop/Program/perlaNegra/raw_batch'

def main():
    print("🔍 Buscando variantes de 'effeto' / 'effetto'...\n")
    
    # 1. Buscar en DB
    print("--- 📚 BASE DE DATOS (Slugs) ---")
    try:
        url = f"{SUPABASE_URL}/rest/v1/products?select=slug,name"
        headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
        r = requests.get(url, headers=headers)
        r.raise_for_status()
        products = r.json()
        
        found_db = False
        for p in products:
            slug = p['slug'] or ""
            if 'effet' in slug or 'efet' in slug:
                print(f"✅ DB Slug: {slug}")
                found_db = True
        
        if not found_db: print("No se encontraron coincidencias en DB.")
            
    except Exception as e:
        print(f"❌ Error DB: {e}")

    print("\n--- 📂 ARCHIVOS (raw_batch) ---")
    try:
        if os.path.exists(RAW_DIR):
            files = os.listdir(RAW_DIR)
            found_file = False
            for f in files:
                lower_f = f.lower()
                if 'effet' in lower_f or 'efet' in lower_f:
                    print(f"📁 Archivo: {f}")
                    found_file = True
            
            if not found_file: print("No se encontraron coincidencias en Archivos.")
        else:
            print(f"❌ Carpeta no encontrada: {RAW_DIR}")
    except Exception as e:
        print(f"❌ Error Archivos: {e}")

if __name__ == '__main__':
    main()
