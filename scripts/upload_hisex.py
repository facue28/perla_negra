import os
import requests
import mimetypes

# Config
OPTIMIZED_DIR = 'optimized_batch'
# Explicitly listing files to upload
FILES_TO_UPLOAD = [
    'hi-sex-bustina.webp',
    'hi-sex-bustina-2.webp',
    'hi-sex-bustina-3.webp',
    'hi-sex-pote.webp',
    'hi-sex-pote-2.webp',
    'hi-sex-pote-3.webp'
]
BUCKET_NAME = 'images'
DOTENV_PATH = '.env'

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
SUPABASE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    SUPABASE_KEY = env.get("VITE_SUPABASE_ANON_KEY")

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "apikey": SUPABASE_KEY
}

def upload_file(filename):
    file_path = os.path.join(OPTIMIZED_DIR, filename)
    if not os.path.exists(file_path):
        print(f"⚠️ File not found locally: {file_path}")
        return False

    # Upload to ROOT of bucket (consistent with upload_batch.py)
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{filename}"
    
    upload_headers = HEADERS.copy()
    upload_headers["Content-Type"] = "image/webp"
    upload_headers["Cache-Control"] = "public, max-age=31536000, immutable"
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

def main():
    print("🚀 Uploading Hi Sex Images...")
    
    count = 0
    for f in FILES_TO_UPLOAD:
        if upload_file(f):
            count += 1
            
    print(f"\n✨ Uploaded {count}/{len(FILES_TO_UPLOAD)} images.")

if __name__ == '__main__':
    main()
