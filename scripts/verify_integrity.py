import os
import requests

# Configuración Manual de ENV (Sin dependencias externas)
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

OPTIMIZED_DIR = 'optimized_batch'

def get_db_slugs():
    url = f"{SUPABASE_URL}/rest/v1/products?select=slug"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    return {item['slug'] for item in r.json()}

def get_file_slugs():
    if not os.path.exists(OPTIMIZED_DIR):
        print(f"❌ Directory not found: {OPTIMIZED_DIR}")
        return set()
    
    slugs = set()
    files = [f for f in os.listdir(OPTIMIZED_DIR) if f.endswith('.webp')]
    
    for f in files:
        # Ignorar thumbs
        if '-min' in f: continue
        
        name = f.replace('.webp', '')
        
        # Eliminar sufijos numéricos del nombre de archivo para obtener el slug base
        # Ej: "mi-producto-1" -> "mi-producto"
        # Ej: "mi-producto-2" -> "mi-producto"
        
        base_slug = name
        if name.endswith('-1'):
            base_slug = name[:-2]
        elif name.endswith('-2'):
            base_slug = name[:-2]
        elif name.endswith('-3'):
            base_slug = name[:-2]
            
        slugs.add(base_slug)
    
    return slugs

def main():
    print("🔍 Iniciando Verificación de Integridad...")
    
    try:
        db_slugs = get_db_slugs()
        print(f"📚 Productos en DB: {len(db_slugs)}")
    except Exception as e:
        print(f"❌ Error fetching DB: {e}")
        return

    file_slugs = get_file_slugs()
    print(f"🖼️  Slugs detectados en imágenes: {len(file_slugs)}")
    
    print("\n---------------------------------------------------")
    
    # 1. Imágenes Huérfanas (Tenemos foto, pero no producto)
    orphans = file_slugs - db_slugs
    if orphans:
        print(f"⚠️  IMÁGENES HUÉRFANAS ({len(orphans)}) - Posibles typos en nombre de archivo:")
        for s in sorted(orphans):
            print(f"   - {s}")
    else:
        print("✅ No hay imágenes huérfanas.")

    print("\n---------------------------------------------------")

    # 2. Productos sin Imagen (Tenemos producto, pero no foto)
    missing = db_slugs - file_slugs
    if missing:
        print(f"⚠️  PRODUCTOS SIN IMAGEN ({len(missing)}) - Faltan fotos para estos slugs:")
        for s in sorted(missing):
            print(f"   - {s}")
    else:
        print("✅ Todos los productos tienen imagen.")
        
    print("\n---------------------------------------------------")

if __name__ == '__main__':
    main()
