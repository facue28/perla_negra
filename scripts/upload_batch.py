import os
import requests
import mimetypes

# Configuración
OPTIMIZED_DIR = 'optimized_batch'
BUCKET_NAME = 'images'
DOTENV_PATH = '.env'

def load_env():
    """Simple .env parser"""
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
SUPABASE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    SUPABASE_KEY = env.get("VITE_SUPABASE_ANON_KEY")
    print("⚠️ WARNING: Usando ANON KEY. Puede fallar si no hay políticas RLS permisivas.")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Faltan credenciales en .env")
    exit(1)

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "apikey": SUPABASE_KEY
}

def empty_bucket():
    print("🧹 Limpiando bucket...")
    list_url = f"{SUPABASE_URL}/storage/v1/object/list/{BUCKET_NAME}"
    
    # 1. Listar
    try:
        r = requests.post(list_url, headers=HEADERS, json={"prefix": "", "limit": 1000}) 
        # Note: 'list' endpoint is actually a POST with prefix/limit often, or GET. 
        # Supabase API v1 storage list is POST /object/list/{bucket}
        r.raise_for_status()
        objects = r.json()
    except Exception as e:
        print(f"⚠️ Error listando bucket (o vacío): {e}")
        return

    if not objects:
        print("Bucket ya estaba vacío.")
        return

    # 2. Borrar
    files_to_remove = [obj['name'] for obj in objects]
    delete_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}"
    try:
        r = requests.delete(delete_url, headers=HEADERS, json={"prefixes": files_to_remove})
        r.raise_for_status()
        print(f"🗑️ Eliminados {len(files_to_remove)} archivos antiguos.")
    except Exception as e:
        print(f"❌ Error borrando archivos: {e}")

def upload_file(filename):
    file_path = os.path.join(OPTIMIZED_DIR, filename)
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{filename}"
    
    upload_headers = HEADERS.copy()
    upload_headers["Content-Type"] = "image/webp"
    upload_headers["Cache-Control"] = "public, max-age=31536000, immutable"
    
    # x-upsert header to overwrite if exists (redundant if we cleared, but safe)
    upload_headers["x-upsert"] = "true"

    try:
        with open(file_path, 'rb') as f:
            r = requests.post(upload_url, headers=upload_headers, data=f)
            r.raise_for_status()
        print(f"✅ Uploaded: {filename}")
        return True
    except Exception as e:
        print(f"❌ Error uploading {filename}: {e}")
        return False

def update_product_db(slug, images):
    # images = {1: url, 2: url, 3: url}
    patch_url = f"{SUPABASE_URL}/rest/v1/products"
    
    # Build payload
    data = {}
    if 1 in images: data['image_url'] = images[1]
    if 2 in images: data['image2_url'] = images[2]
    if 3 in images: data['image3_url'] = images[3]
    
    if not data: return False

    update_headers = HEADERS.copy()
    update_headers["Content-Type"] = "application/json"
    update_headers["Prefer"] = "return=representation"

    # Query param for filtering
    params = {"slug": f"eq.{slug}"}

    try:
        r = requests.patch(patch_url, headers=update_headers, params=params, json=data)
        r.raise_for_status()
        response = r.json()
        if response:
            print(f"🔄 Re-linked DB: {slug}")
            return True
        else:
            print(f"⚠️ Slug no encontrado en DB: {slug}")
            return False
    except Exception as e:
        print(f"❌ Error DB update {slug}: {e}")
        return False

def main():
    print("🚀 Iniciando Upload Batch (Requests Version)...")
    
    if not os.path.exists(OPTIMIZED_DIR):
        print(f"❌ Directorio no encontrado: {OPTIMIZED_DIR}")
        return

    # User Confirmation
    print("⚠️  ATENCIÓN: Se BORRARÁN todos los archivos del bucket 'images'.")
    confirm = input("Escribe 's' para continuar: ")
    if confirm.lower() != 's':
        print("Cancelado.")
        return

    # 1. Empty Bucket
    empty_bucket()

    # 2. Upload Files
    files = [f for f in os.listdir(OPTIMIZED_DIR) if f.endswith('.webp')]
    uploaded_files = []
    
    for f in files:
        if upload_file(f):
            uploaded_files.append(f)

    # 3. Update DB
    print("\n🔄 Actualizando base de datos...")
    
    # Group logic
    product_updates = {}
    for filename in uploaded_files:
        is_thumb = 'min' in filename or 'thumb' in filename
        if is_thumb: continue

        # Parse slug/index
        # slug.webp, slug-2.webp, slug-3.webp
        name_no_ext = filename.replace('.webp', '')
        
        idx = 1
        slug = name_no_ext
        
        if name_no_ext.endswith('-3'):
            idx = 3
            slug = name_no_ext[:-2]
        elif name_no_ext.endswith('-2'):
            idx = 2
            slug = name_no_ext[:-2]
            
        if slug not in product_updates:
            product_updates[slug] = {}
        
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"
        product_updates[slug][idx] = public_url

    count = 0
    for slug, imgs in product_updates.items():
        if update_product_db(slug, imgs):
            count += 1
            
    print(f"\n✨ Proceso completado. Productos actualizados: {count}")

if __name__ == '__main__':
    main()
